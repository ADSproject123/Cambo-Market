'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/browser';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center items-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-2xl shadow-black/50 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 overflow-hidden rounded-xl shadow-sm ring-1 ring-white/10">
            <Image src="/logo.jpeg" alt="Cambo Market" width={56} height={56} priority />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-400">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition-all focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-neutral-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Password</label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition-all focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-neutral-500"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 border border-red-500/20">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-brand/25 transition-all hover:scale-[1.02] hover:bg-brand-light active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-brand transition-colors hover:text-brand-light hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
