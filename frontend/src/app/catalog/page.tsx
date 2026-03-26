import Link from 'next/link';
import type { Category, ProductsResponse } from '@/types';
import { ProductCard } from '@/components/product/product-card';
import { PageTitle } from '@/components/ui/page-title';

type SearchParams = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

function buildProductsUrl(searchParams: SearchParams) {
  const params = new URLSearchParams();

  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
  if (searchParams.inStock) params.set('inStock', searchParams.inStock);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  if (searchParams.page) params.set('page', searchParams.page);
  params.set('limit', '12');

  return `http://localhost:4000/api/products?${params.toString()}`;
}

async function getProducts(searchParams: SearchParams): Promise<ProductsResponse> {
  const res = await fetch(buildProductsUrl(searchParams), {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Ошибка загрузки товаров');
  }

  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const res = await fetch('http://localhost:4000/api/categories', {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

function buildPageLink(searchParams: SearchParams, nextPage: number) {
  const params = new URLSearchParams();

  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
  if (searchParams.inStock) params.set('inStock', searchParams.inStock);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  params.set('page', String(nextPage));

  return `/catalog?${params.toString()}`;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const [{ items: products, total, page, pages }, categories] = await Promise.all([
    getProducts(resolvedSearchParams),
    getCategories(),
  ]);

  return (
    <section className="grid gap-6 md:gap-8">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <PageTitle
          title="Каталог товаров"
          description="Удобный поиск по товарам, ценам и предложениям продавцов в единой аккуратной системе без визуального шума."
          meta={
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                Marketplace
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Найдено товаров: {total}
              </span>
            </div>
          }
        />
      </div>

      <form
        action="/catalog"
        method="GET"
        className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 md:p-6"
      >
        <div className="grid gap-4 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
              Поиск
            </label>
            <div className="flex h-11 items-center rounded-xl border border-[#E5E7EB] bg-white px-4 transition focus-within:border-[#F5A623] focus-within:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]">
              <input
                type="text"
                name="search"
                defaultValue={resolvedSearchParams.search ?? ''}
                placeholder="Например, iPhone 11, дисплей, SKU..."
                className="h-full w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
              Категория
            </label>
            <select
              name="category"
              defaultValue={resolvedSearchParams.category ?? ''}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
              Цена от
            </label>
            <input
              type="number"
              name="minPrice"
              min="0"
              defaultValue={resolvedSearchParams.minPrice ?? ''}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
              Цена до
            </label>
            <input
              type="number"
              name="maxPrice"
              min="0"
              defaultValue={resolvedSearchParams.maxPrice ?? ''}
              placeholder="1000"
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
              Сортировка
            </label>
            <select
              name="sort"
              defaultValue={resolvedSearchParams.sort ?? 'newest'}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
              <option value="title_asc">Название: А-Я</option>
              <option value="title_desc">Название: Я-А</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 md:flex-row md:items-center md:justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-[#111827]">
            <input
              type="checkbox"
              name="inStock"
              value="true"
              defaultChecked={resolvedSearchParams.inStock === 'true'}
              className="h-4 w-4 rounded border border-[#E5E7EB]"
            />
            Только в наличии
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#1F2937] transition hover:bg-[#E69512]"
            >
              Применить
            </button>

            <Link
              href="/catalog"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              Сбросить
            </Link>
          </div>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#E5E7EB] bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-[#111827]">
            По вашему запросу ничего не найдено
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Попробуйте изменить параметры фильтрации или сбросить текущие условия поиска.
          </p>

          <div className="mt-5">
            <Link
              href="/catalog"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              Сбросить фильтры
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          {page > 1 && (
            <Link
              href={buildPageLink(resolvedSearchParams, page - 1)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              Назад
            </Link>
          )}

          <span className="text-sm font-medium text-[#6B7280]">
            Страница <span className="text-[#111827]">{page}</span> из{' '}
            <span className="text-[#111827]">{pages}</span>
          </span>

          {page < pages && (
            <Link
              href={buildPageLink(resolvedSearchParams, page + 1)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            >
              Вперед
            </Link>
          )}
        </div>
      )}
    </section>
  );
}