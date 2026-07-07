import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();
  return (
    <header className="bg-slate-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">ShopLite <span className="text-sm font-normal text-red-400 ml-2">Demo</span></Link>
        <nav className="space-x-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <Link href="/orders" className="hover:text-gray-300 transition-colors">Orders</Link>
          {session && session.user?.role === 'admin' && (
            <Link href="/admin" className="hover:text-gray-300 transition-colors text-yellow-400">Admin</Link>
          )}
          <Link href="/login" className="hover:text-gray-300 transition-colors">Login</Link>
        </nav>
      </div>
    </header>
  );
}
