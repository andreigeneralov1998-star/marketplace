'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Store,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';

type CartItem = {
  id: string;
  quantity: number;
};

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const { user, fetchMe, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

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
  }, [user, pathname]);

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
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-[rgba(247,248,250,0.92)] backdrop-blur-md">
      <div className="app-container">
        <div className="flex min-h-[72px] items-center gap-3 py-3 lg:gap-6">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 rounded-2xl transition"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-lg font-bold text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
              R
            </div>

            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-[15px] font-semibold tracking-tight text-[#111827]">
                Рынок Бай
              </span>
              <span className="mt-1 text-xs font-medium text-[#6B7280]">
                rnk.by
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="/catalog"
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                isActive(pathname, '/catalog')
                  ? 'bg-[#FFF4DD] text-[#111827]'
                  : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'
              }`}
            >
              Каталог
            </Link>

            <Link
              href="/stores"
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                isActive(pathname, '/stores') || isActive(pathname, '/store')
                  ? 'bg-[#FFF4DD] text-[#111827]'
                  : 'text-[#6B7280] hover:bg-white hover:text-[#111827]'
              }`}
            >
              Магазины
            </Link>
          </nav>

          <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
            <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition focus-within:border-[#F5A623] focus-within:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]">
              <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск товаров, брендов, моделей..."
                className="h-full w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <Link
              href="/cart"
              className="relative inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Корзина</span>

              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#111827] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  href="/account"
                  className="hidden h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:inline-flex"
                >
                  <User className="h-4 w-4 text-[#6B7280]" />
                  Кабинет
                </Link>

                {user.role === 'SELLER' && (
                  <Link
                    href="/seller"
                    className="hidden h-11 items-center gap-2 rounded-xl bg-[#FFF4DD] px-4 text-sm font-semibold text-[#1F2937] transition hover:bg-[#FDEBC2] lg:inline-flex"
                  >
                    <Store className="h-4 w-4" />
                    Seller
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden h-11 items-center gap-2 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#0F172A] lg:inline-flex"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                >
                  <LogOut className="h-4 w-4 text-[#6B7280]" />
                  <span className="hidden md:inline">Выйти</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-11 items-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:inline-flex"
                >
                  Вход
                </Link>

                <Link
                  href="/register"
                  className="inline-flex h-11 items-center rounded-xl bg-[#F5A623] px-4 text-sm font-semibold text-[#1F2937] transition hover:bg-[#E69512]"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex pb-4 md:hidden">
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition focus-within:border-[#F5A623] focus-within:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]">
              <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск товаров..."
                className="h-full w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </form>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 lg:hidden">
          <Link
            href="/catalog"
            className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium transition ${
              isActive(pathname, '/catalog')
                ? 'bg-[#FFF4DD] text-[#111827]'
                : 'border border-[#E5E7EB] bg-white text-[#111827]'
            }`}
          >
            Каталог
          </Link>

          <Link
            href="/stores"
            className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium transition ${
              isActive(pathname, '/stores') || isActive(pathname, '/store')
                ? 'bg-[#FFF4DD] text-[#111827]'
                : 'border border-[#E5E7EB] bg-white text-[#111827]'
            }`}
          >
            Магазины
          </Link>

          {user && (
            <Link
              href="/account"
              className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827]"
            >
              Кабинет
            </Link>
          )}

          {user?.role === 'SELLER' && (
            <Link
              href="/seller"
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-[#FFF4DD] px-4 text-sm font-semibold text-[#1F2937]"
            >
              Seller
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-[#111827] px-4 text-sm font-semibold text-white"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-2 border-t border-[#E5E7EB] py-3 lg:flex">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#FFF4DD]"
          >
            Каталог
            <ChevronRight className="h-4 w-4 text-[#6B7280]" />
          </Link>

          <Link
            href="/stores"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#FFF4DD]"
          >
            Витрины продавцов
            <ChevronRight className="h-4 w-4 text-[#6B7280]" />
          </Link>
        </div>
      </div>
    </header>
  );
}