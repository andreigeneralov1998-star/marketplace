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
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  imageUrl?: string | null;
  images?: Array<{
    id: string;
    url: string;
  }>;
};

type StatusFilter = 'all' | 'published' | 'hidden' | 'inStock' | 'outOfStock';

function getProductImage(product: SellerProduct) {
  if (product.images?.length) return product.images[0].url;
  if (product.imageUrl) return product.imageUrl;
  return null;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/products/seller/my');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Ошибка загрузки товаров seller:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.title?.toLowerCase().includes(normalizedQuery) ||
        product.sku?.toLowerCase().includes(normalizedQuery);

      const matchesStatus = (() => {
        switch (statusFilter) {
          case 'published':
            return product.isPublished === true;
          case 'hidden':
            return product.isPublished === false;
          case 'inStock':
            return product.stock > 0;
          case 'outOfStock':
            return product.stock <= 0;
          default:
            return true;
        }
      })();

      return matchesQuery && matchesStatus;
    });
  }, [products, query, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      published: products.filter((item) => item.isPublished === true).length,
      hidden: products.filter((item) => item.isPublished === false).length,
      inStock: products.filter((item) => item.stock > 0).length,
    };
  }, [products]);

  return (
    <section className="space-y-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#F5A623]">Seller cabinet</p>
            <h1 className="mt-2 text-[32px] font-bold leading-10 text-[#111827]">
              Мои товары
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Управляйте своими товарами, отслеживайте их статус, наличие и
              быстро переходите к редактированию нужной позиции.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

            <Link
              href="/seller"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Назад в кабинет
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Всего товаров</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Опубликовано</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">
            {stats.published}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">Скрыто / на модерации</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">{stats.hidden}</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[#6B7280]">В наличии</p>
          <p className="mt-3 text-3xl font-bold text-[#111827]">{stats.inStock}</p>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-8 text-[#111827]">
              Каталог продавца
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Найдите нужный товар по названию или артикулу
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
            <input
              type="text"
              placeholder="Поиск по названию или SKU"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15 lg:w-[320px]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15 lg:min-w-[220px]"
            >
              <option value="all">Все товары</option>
              <option value="published">Опубликованные</option>
              <option value="hidden">Скрытые / на модерации</option>
              <option value="inStock">Только в наличии</option>
              <option value="outOfStock">Нет в наличии</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'Все' },
            { key: 'published', label: 'Опубликованные' },
            { key: 'hidden', label: 'Скрытые' },
            { key: 'inStock', label: 'В наличии' },
            { key: 'outOfStock', label: 'Нет в наличии' },
          ].map((item) => {
            const active = statusFilter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(item.key as StatusFilter)}
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
                  active
                    ? 'border border-[#F5A623] bg-[#FFF4DD] text-[#111827]'
                    : 'border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 animate-pulse rounded-2xl bg-[#F3F4F6]" />
                  <div className="flex-1">
                    <div className="h-5 w-56 animate-pulse rounded bg-[#F3F4F6]" />
                    <div className="mt-3 h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
                    <div className="mt-4 h-10 w-36 animate-pulse rounded bg-[#F3F4F6]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-12 text-center">
            <p className="text-base font-semibold text-[#111827]">
              Товары не найдены
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              Попробуйте изменить фильтр или добавьте новую позицию.
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
                Импортировать CSV
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredProducts.map((product) => {
              const image = getProductImage(product);

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex gap-4">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]">
                        {image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || ''}${image}`}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="px-2 text-center text-xs font-medium text-[#9CA3AF]">
                            НЕТ ФОТО
                          </span>
                        )}
                      </div>

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

                          {product.isPublished === true ? (
                            <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-medium text-[#047857]">
                              Опубликован
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-medium text-[#A16207]">
                              На модерации / скрыт
                            </span>
                          )}
                        </div>

                        {(product.createdAt || product.updatedAt) && (
                          <div className="mt-3 text-sm text-[#6B7280]">
                            {product.updatedAt
                              ? `Обновлён: ${new Date(product.updatedAt).toLocaleDateString()}`
                              : product.createdAt
                              ? `Создан: ${new Date(product.createdAt).toLocaleDateString()}`
                              : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:ml-auto lg:w-auto lg:flex-row lg:items-center">
                      {typeof product.price === 'number' && (
                        <div className="text-left text-lg font-bold text-[#111827] lg:min-w-[110px] lg:text-right">
                          {product.price.toFixed(2)} BYN
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {product.slug ? (
                          <Link
                            href={`/product/${product.slug}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                          >
                            Просмотреть
                          </Link>
                        ) : null}

                        <Link
                          href={`/seller/products/${product.id}/edit`}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#FFF4DD] px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#FFECC4]"
                        >
                          Редактировать
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}