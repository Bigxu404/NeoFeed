import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "NeoFeed",
  description: "Feed the Singularity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {children}
        <Toaster 
          position="bottom-right" 
          theme="dark" 
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
