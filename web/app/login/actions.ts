'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  const to = (formData.get('redirect') as string)?.trim()
  redirect(to && to.startsWith('/') ? to : '/dashboard')
}

export async function signup(formData: FormData) {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string
  const nickname = (formData.get('nickname') as string)?.trim()

  // 1. 🚀 深度检查邮箱是否已注册
  // 同时检查 profiles 表和 auth 系统表，确保无死角
  let userInAuth = false;
  try {
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
    if (!listError && users) {
      userInAuth = users.some(u => u.email?.toLowerCase() === email)
    }
  } catch (e) {
    console.error('Admin listUsers failed:', e)
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (userInAuth || profile) {
    console.log(`[Signup] Blocked existing user: ${email}`)
    return { error: '该邮箱已被占用，请直接登录。' }
  }

  // 2. 执行注册
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        full_name: nickname
      }
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to verification page instead of home
  redirect('/auth/verify-request')
}

