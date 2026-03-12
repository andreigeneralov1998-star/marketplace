import Link from 'next/link';

async function getProducts() {
  const res = await fetch('http://localhost:4000/api/products', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Ошибка загрузки товаров');
  }

  const data = await res.json();
  return data.items;
}

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <section className="grid gap-6">
      <h1 className="text-3xl font-bold">Каталог товаров</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            {product.images?.[0] ? (
              <img
                src={`http://localhost:4000${product.images[0].url}`}
                alt={product.title}
                className="mb-3 h-48 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mb-3 flex h-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                Нет изображения
              </div>
            )}

            <h3 className="font-semibold">{product.title}</h3>
            <p className="mt-1 text-lg font-bold">{product.price} BYN</p>

            <Link
              href={`/product/${product.slug}`}
              className="mt-3 block rounded-xl bg-black py-2 text-center text-white"
            >
              Открыть
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}