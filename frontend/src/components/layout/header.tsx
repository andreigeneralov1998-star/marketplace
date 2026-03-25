'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';

type CartItem = {
  id: string;
  quantity: number;
};

export function Header() {
  const { user, fetchMe, logout } = useAuthStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      fetchMe().catch(() => undefined);
    }
  }, [fetchMe, user]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setCartItems([]);
      return;
    }

    api
      .get('/cart')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : res.data.items ?? [];
        setCartItems(items);
      })
      .catch(() => {
        setCartItems([]);
      });
  }, [user]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }, [cartItems]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push('/catalog');
      return;
    }

    const params = new URLSearchParams();
    params.set('search', value);

    router.push(`/catalog?${params.toString()}`);
  }

  function handleLogout() {
    logout();
    setCartItems([]);
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link href="/" className="whitespace-nowrap text-2xl font-bold">
          Marketplace
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-black"
          />
        </form>

        <nav className="flex items-center gap-4 text-sm md:text-base">
          <Link href="/catalog">Каталог</Link>

          <Link href="/cart" className="relative inline-flex items-center">
            Корзина

            {cartCount > 0 && (
              <span className="ml-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/account">Кабинет</Link>
              {user.role === 'SELLER' && <Link href="/seller">Seller</Link>}
              {user.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
              <button
                onClick={handleLogout}
                className="rounded-lg bg-black px-4 py-2 text-white"
              >
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