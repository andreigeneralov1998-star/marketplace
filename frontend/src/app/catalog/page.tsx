import Link from 'next/link';
import type { Category, ProductListItem, ProductsResponse } from '@/types';

type SearchParams = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

function getSellerDisplayName(seller?: {
  storeName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  if (!seller) return 'Продавец';

  if (seller.storeName?.trim()) {
    return seller.storeName;
  }

  const fullName = `${seller.firstName ?? ''} ${seller.lastName ?? ''}`.trim();
  return fullName || 'Продавец';
}

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

/**
 * ВАЖНО:
 * Этот код ожидает, что у тебя есть GET /api/categories
 * и он возвращает массив категорий вида:
 * [{ id, name, slug }]
 *
 * Если endpoint уже есть — всё ок.
 * Если нет — ниже напишу, что добавить.
 */
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
    <section className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Каталог товаров</h1>
          <p className="mt-2 text-sm text-slate-500">
            Выбирайте товары от проверенных продавцов
          </p>
        </div>
      </div>

      <form
        action="/catalog"
        method="GET"
        className="grid gap-4 rounded-2xl border bg-white p-4 md:grid-cols-2 xl:grid-cols-6"
      >
        <div className="xl:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Поиск
          </label>
          <input
            type="text"
            name="search"
            defaultValue={resolvedSearchParams.search ?? ''}
            placeholder="Например, iPhone 11, дисплей, SKU..."
            className="w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Категория
          </label>
          <select
            name="category"
            defaultValue={resolvedSearchParams.category ?? ''}
            className="w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-black"
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
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Цена от
          </label>
          <input
            type="number"
            name="minPrice"
            min="0"
            defaultValue={resolvedSearchParams.minPrice ?? ''}
            placeholder="0"
            className="w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Цена до
          </label>
          <input
            type="number"
            name="maxPrice"
            min="0"
            defaultValue={resolvedSearchParams.maxPrice ?? ''}
            placeholder="1000"
            className="w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-black"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Сортировка
          </label>
          <select
            name="sort"
            defaultValue={resolvedSearchParams.sort ?? 'newest'}
            className="w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-black"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
            <option value="title_asc">Название: А-Я</option>
            <option value="title_desc">Название: Я-А</option>
          </select>
        </div>

        <div className="flex items-end gap-3 xl:col-span-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="inStock"
              value="true"
              defaultChecked={resolvedSearchParams.inStock === 'true'}
              className="h-4 w-4 rounded border"
            />
            Только в наличии
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Применить
          </button>

          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Сбросить
          </Link>
        </div>
      </form>

      <div className="text-sm text-slate-500">
        Найдено товаров: <span className="font-medium text-slate-900">{total}</span>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
          По вашему запросу ничего не найдено
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product: ProductListItem) => {
            const sellerName = getSellerDisplayName(product.seller);
            const rawImage =
              product.images?.[0]?.url ||
              product.imageUrl ||
              '/uploads/placeholders/no-photo.png';

            const imageSrc = rawImage.startsWith('http')
              ? rawImage
              : `http://localhost:4000${rawImage}`;
            return (
              <article
                key={product.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  <img
                    src={imageSrc}
                    alt={product.title}
                    className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {sellerName}
                    </p>

                    <Link href={`/product/${product.slug}`}>
                      <h3 className="mt-1 line-clamp-2 min-h-[3.5rem] text-base font-semibold text-slate-900 transition group-hover:text-slate-700">
                        {product.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-slate-900">
                      {product.price} BYN
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        product.stock > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {product.stock > 0
                        ? `В наличии: ${product.stock}`
                        : 'Нет в наличии'}
                    </p>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex flex-1 items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Открыть
                    </Link>

                    {product.seller?.storeSlug && (
                      <Link
                        href={`/store/${product.seller.storeSlug}`}
                        className="inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Магазин
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageLink(resolvedSearchParams, page - 1)}
              className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
            >
              Назад
            </Link>
          )}

          <span className="text-sm text-slate-600">
            Страница {page} из {pages}
          </span>

          {page < pages && (
            <Link
              href={buildPageLink(resolvedSearchParams, page + 1)}
              className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
            >
              Вперед
            </Link>
          )}
        </div>
      )}
    </section>
  );
}