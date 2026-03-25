import Link from 'next/link';

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
      <section className="p-6">
        <h1 className="text-3xl font-bold">Магазин не найден</h1>
        <p className="mt-2 text-slate-600">
          Проверь slug магазина или данные продавца.
        </p>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          {store.storeName ||
            `${store.firstName ?? ''} ${store.lastName ?? ''}`.trim() ||
            'Магазин продавца'}
        </h1>

        {store.storeDescription && (
          <p className="mt-3 text-slate-600">{store.storeDescription}</p>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Товары магазина</h2>
        <Link
          href="/stores"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
        >
          Все магазины
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-slate-600">У этого продавца пока нет товаров.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const image =
              product.images?.[0]?.url || product.imageUrl || '/placeholder.png';

            return (
              <div
                key={product.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={`http://localhost:4000${image}`}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h3 className="text-lg font-semibold">{product.title}</h3>

                {product.category && (
                  <p className="mt-1 text-sm text-slate-500">
                    Категория: {product.category.name}
                  </p>
                )}

                <p className="mt-2 text-base font-bold">{product.price} BYN</p>

                <p className="mt-1 text-sm text-slate-500">
                  Остаток: {product.stock}
                </p>

                <Link
                  href={`/product/${product.slug}`}
                  className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-white"
                >
                  Открыть товар
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}