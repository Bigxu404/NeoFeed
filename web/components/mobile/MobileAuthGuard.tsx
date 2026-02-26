'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/mobile/landing', '/mobile/login'];

/**
 * 移动端未登录时重定向到 /mobile/landing（登录/注册页）。
 * 访问 /mobile 等需登录页面时若未登录会先看到空白流页，因此在此做客户端校验并跳转。
 */
export default function MobileAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecking(false);
      setAllowed(true);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setChecking(false);
      if (session?.user) {
        setAllowed(true);
      } else {
        router.replace('/mobile/landing');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
