'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

interface NavbarProps {
  user: any; // We'll keep it simple as it was in layout
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  // Hide navbar on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-card/70 backdrop-blur-md shadow-sm transition-all duration-300">
      <nav className="mx-auto flex w-full items-center justify-between gap-4 px-4 sm:px-8 py-4">
        <Link href="/" className="group flex items-center gap-3 text-xl font-bold tracking-tight">
          <div className="overflow-hidden rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-brand/20">
            <Image src="/logo.jpeg" alt="Cambo Market" width={40} height={40} priority />
          </div>
          <span className="hidden bg-gradient-to-br from-neutral-900 to-neutral-600 bg-clip-text text-transparent dark:from-white dark:to-neutral-400 sm:block">
            Cambo Market
          </span>
        </Link>
        
        <div className="flex items-center gap-4 text-sm font-medium sm:gap-6">
          {user ? (
            <>
              <Link href="/orders" className="transition-colors hover:text-brand">My orders</Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="hidden transition-colors hover:text-brand sm:inline">Admin</Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden transition-colors hover:text-brand sm:inline">Log in</Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-white shadow-sm transition-all hover:bg-brand hover:shadow-md hover:shadow-brand/20 active:scale-95 dark:bg-card dark:text-foreground dark:hover:bg-brand dark:hover:text-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
