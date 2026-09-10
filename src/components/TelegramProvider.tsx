'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Extend the window object to include Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if we are running inside Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Notify Telegram that the Mini App is ready to be displayed
      tg.ready();
      
      // Expand the Mini App to take the full height of the screen
      tg.expand();

      // Removed theme switching because the app is now strictly dark mode 
      // but still uses Telegram variables via CSS.
      
      // Prevent overscroll behavior on mobile
      document.body.style.overflowY = 'hidden';
      setTimeout(() => {
        document.body.style.overflowY = 'auto';
      }, 100);

      // Authenticate if needed
      if (tg.initData && !sessionStorage.getItem('tg_auth_done')) {
        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        }).then(res => {
          if (res.ok) {
            sessionStorage.setItem('tg_auth_done', 'true');
            router.refresh();
          }
        }).catch(err => console.error('Telegram auth error:', err));
      }
    }
  }, [router]);

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js" 
        strategy="afterInteractive" 
      />
      {children}
    </>
  );
}
