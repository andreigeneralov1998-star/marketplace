import Link from 'next/link';
import Image from 'next/image';

type Store = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeDescription?: string | null;
  storeLogo?: string | null;
  createdAt: string;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  imageUrl?: string | null;
  images?: { id: string; url: string; position: number }[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

function normalizeImageSrc(src?: string | null) {
  if (!src) return '/uploads/placeholders/no-photo.png';
  return src.startsWith('http') ? src : `http://localhost:4000${src}`;
}

function getStoreDisplayName(store: Store) {
  if (store.storeName?.trim()) return store.storeName;

  const fullName = `${store.firstName ?? ''} ${store.lastName ?? ''}`.trim();
  return fullName || 'Магазин продавца';
}

async function getStore(storeSlug: string): Promise<Store | null> {
  const res = await fetch(`http://localhost:4000/api/stores/${storeSlug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

async function getStoreProducts(storeSlug: string): Promise<Product[]> {
  const res = await fetch(
    `http://localhost:4000/api/stores/${storeSlug}/products`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;

  const [store, products] = await Promise.all([
    getStore(storeSlug),
    getStoreProducts(storeSlug),
  ]);

  if (!store) {
    return (
      <section className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white px-6 py-12 text-center">
          <h1 className="text-[28px] font-bold leading-[36px] text-[#111827]">
            Магазин не найден
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Проверь ссылку или данные продавца.
          </p>
          <Link
            href="/stores"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
          >
            Вернуться к списку магазинов
          </Link>
        </div>
      </section>
    );
  }

  const storeName = getStoreDisplayName(store);
  const storeLogo = store.storeLogo ? normalizeImageSrc(store.storeLogo) : null;

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {storeLogo ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA]">
                <Image
                  src={storeLogo}
                  alt={storeName}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] text-sm font-semibold text-[#6B7280]">
                LOGO
              </div>
            )}

            <div className="min-w-0">
              <p className="mb-2 text-sm font-medium text-[#F5A623]">Витрина продавца</p>

              <h1 className="text-[28px] font-bold leading-[36px] text-[#111827] md:text-[32px] md:leading-[40px]">
                {storeName}
              </h1>

              {store.storeSlug && (
                <p className="mt-2 text-sm text-[#6B7280]">/{store.storeSlug}</p>
              )}

              {store.storeDescription && (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-[#6B7280] md:text-base">
                  {store.storeDescription}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/stores"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
          >
            Все магазины
          </Link>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Товары магазина</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Найдено товаров: {products.length}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#E5E7EB] bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-[#111827]">
            У этого продавца пока нет товаров
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            Товары появятся здесь после публикации.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const image = normalizeImageSrc(
              product.images?.[0]?.url || product.imageUrl,
            );
            const inStock = product.stock > 0;

            return (
              <article
                key={product.id}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-square w-full bg-[#F7F8FA]">
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {product.category?.name && (
                      <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                        {product.category.name}
                      </span>
                    )}

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        inStock
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {inStock ? `Остаток: ${product.stock}` : 'Нет в наличии'}
                    </span>
                  </div>

                  <Link href={`/product/${product.slug}`}>
                    <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-[#111827] transition group-hover:text-[#0F172A]">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="mt-3 text-[24px] font-bold leading-none text-[#111827]">
                    {product.price} BYN
                  </p>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6B7280]">
                    {product.description || 'Описание отсутствует'}
                  </p>

                  <div className="mt-5 pt-5">
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                    >
                      Открыть товар
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}