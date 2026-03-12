'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function Header() {
  const { user, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      fetchMe().catch(() => undefined);
    }
  }, [fetchMe, user]);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold">
          Marketplace
        </Link>

        <nav className="flex items-center gap-4 text-sm md:text-base">
          <Link href="/catalog">Каталог</Link>
          <Link href="/cart">Корзина</Link>

          {user ? (
            <>
              <Link href="/account">Кабинет</Link>
              {user.role === 'SELLER' && <Link href="/seller">Seller</Link>}
              {user.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
              <button onClick={logout} className="rounded-lg bg-black px-4 py-2 text-white">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Вход</Link>
              <Link href="/register">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}