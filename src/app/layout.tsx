import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getSessionUser } from '@/lib/auth';
import SignOutButton from '@/components/SignOutButton';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cambo Market',
  description: 'Buy G2G listings with a small markup, delivered after manual verification.',
  icons: { icon: '/logo.jpeg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { TelegramProvider } from '@/components/TelegramProvider';

import { Navbar } from '@/components/Navbar';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand selection:text-white">
        <TelegramProvider>
          <Navbar user={user} />
          <main className="mx-auto w-full flex-1 px-4 sm:px-8 py-8 sm:py-12 animate-[fade-in-up_0.6s_ease-out]">{children}</main>
        </TelegramProvider>
      </body>
    </html>
  );
}
