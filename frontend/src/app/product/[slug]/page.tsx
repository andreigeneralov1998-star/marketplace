import Link from 'next/link';
import Image from 'next/image';
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

function normalizeImageSrc(src?: string | null) {
  if (!src) return '/uploads/placeholders/no-photo.png';
  return src.startsWith('http') ? src : `http://localhost:4000${src}`;
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

  const gallery =
    product.images && product.images.length > 0
      ? product.images.map((img) => ({
          id: img.id,
          url: normalizeImageSrc(img.url),
        }))
      : [
          {
            id: 'fallback',
            url: normalizeImageSrc(product.imageUrl),
          },
        ];

  const mainImage = gallery[0]?.url || '/uploads/placeholders/no-photo.png';
  const inStock = product.stock > 0;

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-5">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F7F8FA]"
        >
          <span>←</span>
          <span>Назад в каталог</span>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            <div className="relative aspect-square w-full bg-[#F7F8FA]">
              <Image
                src={mainImage}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
                >
                  <div className="relative aspect-square w-full bg-[#F7F8FA]">
                    <Image
                      src={img.url}
                      alt={product.title}
                      fill
                      className="object-contain p-2"
                      sizes="25vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.category?.name && (
                <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                  {product.category.name}
                </span>
              )}

              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-[28px] font-bold leading-[36px] text-[#111827] md:text-[32px] md:leading-[40px]">
              {product.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <p className="text-[32px] font-bold leading-none text-[#111827]">
                {product.price} BYN
              </p>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  inStock
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {inStock ? `В наличии: ${product.stock}` : 'Нет в наличии'}
              </span>
            </div>

            <div className="mt-6">
              <AddToCartButton product={product} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#6B7280]">Продавец</p>
                <p className="mt-1 text-lg font-semibold text-[#111827]">
                  {sellerName}
                </p>

                {product.seller?.storeDescription && (
                  <p className="mt-3 max-w-[60ch] text-sm leading-6 text-[#6B7280]">
                    {product.seller.storeDescription}
                  </p>
                )}
              </div>

              {product.seller?.storeSlug && (
                <Link
                  href={`/store/${product.seller.storeSlug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
                >
                  Перейти в магазин
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[#111827]">Описание</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#6B7280] md:text-[14px]">
              {product.description || 'Описание отсутствует'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[#111827]">Характеристики</h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#E5E7EB]">
              <div className="grid divide-y divide-[#E5E7EB]">
                <div className="grid grid-cols-2 gap-4 bg-white px-4 py-3 text-sm">
                  <span className="text-[#6B7280]">SKU</span>
                  <span className="font-medium text-[#111827]">{product.sku}</span>
                </div>

                {product.category?.name && (
                  <div className="grid grid-cols-2 gap-4 bg-white px-4 py-3 text-sm">
                    <span className="text-[#6B7280]">Категория</span>
                    <span className="font-medium text-[#111827]">
                      {product.category.name}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 bg-white px-4 py-3 text-sm">
                  <span className="text-[#6B7280]">Остаток</span>
                  <span className="font-medium text-[#111827]">{product.stock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}