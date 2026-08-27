import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/');

  return (
    <div>
      <nav className="mb-6 flex gap-5 border-b border-neutral-200 pb-3 text-sm font-medium">
        <Link href="/admin" className="hover:text-brand">Dashboard</Link>
        <Link href="/admin/products" className="hover:text-brand">Products</Link>
        <Link href="/admin/orders" className="hover:text-brand">Orders</Link>
      </nav>
      {children}
    </div>
  );
}
