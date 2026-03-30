'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

type SellerProduct = {
  id: string;
  title: string;
  sku: string;
  stock: number;
  price?: number;
  isPublished?: boolean;
};

type SellerOrder = {
  id: string;
  status?: string;
};

export default function SellerPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products/seller/my'),
          api.get('/orders/seller/my'),
        ]);

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (error) {
        console.error('Ошибка загрузки seller dashboard:', error);
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const activeProducts = products.filter((item) => item.stock > 0).length;
    const hiddenProducts = products.filter((item) => item.isPublished === false).length;

    return {
      totalProducts: products.length,
      activeProducts,
      totalOrders: orders.length,
      hiddenProducts,
    };
  }, [products, orders]);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="h-7 w-56 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-[#F3F4F6]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E5E7EB] p-4"
              >
                <div className="h-5 w-48 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="mt-3 h-4 w-28 animate-pulse rounded bg-[#F3F4F6]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[32px] font-bold leading-10 text-[#111827]">
              Кабинет продавца
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Управляйте товарами, заказами, профилем магазина и отслеживайте
              основные показатели в одном месте.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/seller/products/new"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512]"
            >
              Добавить товар
            </Link>

            <Link
              href="/seller/products/import"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Загрузка через Excel
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/seller/orders"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#FFF4DD] px-4 text-sm font-medium text-[#111827] transition hover:bg-[#FFECC4]"
          >
            Заказы покупателей
          </Link>

          <Link
            href="/seller/balance"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Баланс
          </Link>

          <Link
            href="/seller/profile"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Профиль
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Всего товаров</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {stats.totalProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Товаров в наличии</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {stats.activeProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Заказов</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {stats.totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Скрытых товаров</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {stats.hiddenProducts}
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold leading-8 text-[#111827]">
              Мои товары
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Быстрый просмотр ваших текущих позиций
            </p>
          </div>

          <Link
            href="/seller/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Открыть все товары
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-10 text-center">
            <p className="text-base font-semibold text-[#111827]">
              У вас пока нет товаров
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              Добавьте первую позицию вручную или через Excel.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/seller/products/new"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F5A623] px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512]"
              >
                Добавить товар
              </Link>

              <Link
                href="/seller/products/import"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
              >
                Импортировать Excel
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-[#111827]">
                      {product.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                        SKU: {product.sku}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          product.stock > 0
                            ? 'bg-[#ECFDF3] text-[#047857]'
                            : 'bg-[#FEF2F2] text-[#B91C1C]'
                        }`}
                      >
                        {product.stock > 0
                          ? `В наличии: ${product.stock}`
                          : 'Нет в наличии'}
                      </span>

                      {product.isPublished === false && (
                        <span className="rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-medium text-[#A16207]">
                          Скрыт до модерации
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {typeof product.price === 'number' && (
                      <div className="text-sm font-semibold text-[#111827]">
                        {product.price.toFixed(2)} BYN
                      </div>
                    )}

                    <Link
                      href={`/seller/products/${product.id}/edit`}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                    >
                      Редактировать
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}