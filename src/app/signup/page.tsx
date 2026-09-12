'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/browser';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off in Supabase (or this email was already
      // confirmed before) — signUp() signs the user in immediately, so skip
      // the "check your email" step and go straight into the app.
      router.push('/');
      router.refresh();
      return;
    }

    // Confirmation is still required — Supabase only returns a session once
    // the link is clicked, not here.
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] flex-col justify-center items-center px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-2xl shadow-black/50 sm:p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
          <p className="text-sm leading-relaxed text-neutral-400">
            We sent a confirmation link to <strong className="font-semibold text-foreground">{email}</strong>. 
            Confirm it, then{' '}
            <Link href="/login" className="font-semibold text-brand transition-colors hover:text-brand-light hover:underline">log in</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl shadow-black/50">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="relative hidden w-1/2 flex-col justify-between bg-neutral-950 p-12 lg:flex overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent opacity-50" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-white/20">
              <Image src="/logo.jpeg" alt="Cambo Market" width={48} height={48} priority />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Cambo Market</span>
          </div>
          
          <div className="relative z-10 mt-20">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Join the premier<br />digital marketplace.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-neutral-400">
              Create an account to browse securely. Every purchase is verified by our team to guarantee zero fraud and absolute satisfaction.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:w-1/2 lg:p-16">
          <div className="mb-8 flex flex-col">
            {/* Mobile Logo */}
            <div className="mb-6 flex lg:hidden">
              <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-white/10">
                <Image src="/logo.jpeg" alt="Cambo Market" width={48} height={48} priority />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create an account</h1>
            <p className="mt-2 text-sm text-neutral-400">Enter your details to get started</p>
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
                minLength={6}
                placeholder="Min. 6 characters"
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
                  Signing up...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand transition-colors hover:text-brand-light hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
