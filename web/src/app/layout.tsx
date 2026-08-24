import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getSessionUser } from '@/lib/auth';
import SignOutButton from '@/components/SignOutButton';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cheap Stuff',
  description: 'Buy G2G listings with a small markup, delivered after manual verification.',
  icons: { icon: '/logo.jpeg' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-black">
        <header className="border-b border-neutral-200 bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Image src="/logo.jpeg" alt="Cheap Stuff" width={36} height={36} className="rounded" priority />
              Cheap Stuff
            </Link>
            <div className="flex items-center gap-5 text-sm font-medium">
              {user ? (
                <>
                  <Link href="/orders" className="hover:text-brand">My orders</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="hover:text-brand">Admin</Link>
                  )}
                  <span className="text-neutral-500">{user.email}</span>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-brand">Log in</Link>
                  <Link
                    href="/signup"
                    className="rounded-full bg-black px-4 py-2 text-white hover:bg-brand"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
