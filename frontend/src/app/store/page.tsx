import Link from 'next/link';

type Store = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeDescription?: string | null;
  storeLogo?: string | null;
  createdAt: string;
  productsCount: number;
};

async function getStores(): Promise<Store[]> {
  const res = await fetch('http://localhost:4000/api/stores', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Не удалось загрузить магазины');
  }

  return res.json();
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <section className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Магазины продавцов</h1>

      {stores.length === 0 && (
        <p className="text-slate-600">Пока нет доступных магазинов.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <div
            key={store.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {store.storeName || `${store.firstName ?? ''} ${store.lastName ?? ''}`.trim() || 'Магазин продавца'}
            </h2>

            {store.storeDescription && (
              <p className="mt-2 text-sm text-slate-600">
                {store.storeDescription}
              </p>
            )}

            <p className="mt-3 text-sm text-slate-500">
              Товаров: {store.productsCount}
            </p>

            {store.storeSlug && (
              <Link
                href={`/store/${store.storeSlug}`}
                className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-white"
              >
                Открыть магазин
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}