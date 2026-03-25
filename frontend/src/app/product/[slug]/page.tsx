import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import type { ProductDetails } from '@/types';

function getSellerDisplayName(seller: {
  storeName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  if (seller.storeName?.trim()) {
    return seller.storeName;
  }

  const fullName = `${seller.firstName ?? ''} ${seller.lastName ?? ''}`.trim();
  return fullName || 'Продавец';
}

async function getProduct(slug: string): Promise<ProductDetails> {
  const res = await fetch(`http://localhost:4000/api/products/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Product not found');
  }

  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const sellerName = product.seller
    ? getSellerDisplayName(product.seller)
    : 'Продавец';

  const rawMainImage =
    product.images?.[0]?.url ||
    product.imageUrl ||
    '/uploads/placeholders/no-photo.png';

  const mainImageSrc = rawMainImage.startsWith('http')
    ? rawMainImage
    : `http://localhost:4000${rawMainImage}`;

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div>
        <Link href="/catalog" className="mb-4 inline-block text-sm underline">
          ← Назад в каталог
        </Link>

        <img
          src={mainImageSrc}
          alt={product.title}
          className="w-full rounded-2xl border bg-white object-cover"
        />

        {product.images?.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.map((img) => (
              <img
                key={img.id}
                src={`http://localhost:4000${img.url}`}
                alt={product.title}
                className="h-24 w-full rounded-xl border object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-3xl font-bold text-slate-900">{product.price} BYN</p>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              product.stock > 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-slate-500">Продавец</p>
            <p className="mt-1 text-lg font-semibold">{sellerName}</p>

            {product.seller?.storeDescription && (
              <p className="mt-2 text-sm text-slate-600">
                {product.seller.storeDescription}
              </p>
            )}

            {product.seller?.storeSlug && (
              <Link
                href={`/store/${product.seller.storeSlug}`}
                className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Перейти в магазин
              </Link>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-semibold">Описание</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">
              {product.description || 'Описание отсутствует'}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-semibold">Характеристики</h2>

            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <p>
                <strong>SKU:</strong> {product.sku}
              </p>

              {product.category?.name && (
                <p>
                  <strong>Категория:</strong> {product.category.name}
                </p>
              )}

              <p>
                <strong>Остаток:</strong> {product.stock}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AddToCartButton product={product} />
        </div>
      </div>
    </section>
  );
}