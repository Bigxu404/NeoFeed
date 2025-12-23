'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error("Auth Session Error:", authError);
          // 如果是 Auth 错误，通常也意味着未登录，安全起见跳到 landing
          router.replace('/landing');
          return;
        }
        
        if (session) {
          router.replace('/dashboard');
        } else {
          router.replace('/landing');
        }
      } catch (err: any) {
        console.error("Critical Auth Check Failed:", err);
        setError(err.message || "Failed to connect to authentication service.");
      }
    };
    
    checkAuth();
  }, [router]);

  // 如果出错，显示优雅的错误提示，而不是白屏
  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4">
         <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
         <h2 className="text-xl font-bold mb-2">System Connection Failed</h2>
         <p className="text-white/50 text-sm mb-6 max-w-md text-center">{error}</p>
         <button 
           onClick={() => window.location.reload()}
           className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
         >
           Retry Connection
         </button>
      </div>
    );
  }

  return <div className="min-h-screen bg-[#050505]" />;
}
