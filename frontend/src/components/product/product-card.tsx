import Link from 'next/link';
import type { ProductListItem } from '@/types';
import AddToCartButton from '@/components/AddToCartButton';

function getSellerDisplayName(seller?: {
  storeName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  if (!seller) return 'Продавец';

  if (seller.storeName?.trim()) return seller.storeName;

  const fullName = `${seller.firstName ?? ''} ${seller.lastName ?? ''}`.trim();
  return fullName || 'Продавец';
}

function normalizeImageSrc(src?: string | null) {
  const value = String(src ?? '').trim();

  if (!value || value === 'undefined' || value === 'null' || value.endsWith('/undefined')) {
    return '/uploads/placeholders/no-photo.png';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://rnk.by';

  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

type ProductCardProps = {
  product: ProductListItem;
  view?: 'grid' | 'list';
};

export function ProductCard({
  product,
  view = 'grid',
}: ProductCardProps) {
  const sellerName = getSellerDisplayName(product.seller);
  const imageSrc = normalizeImageSrc(product.images?.[0]?.url || product.imageUrl);
  const isInStock = product.stock > 0;

  if (view === 'list') {
    return (
      <article className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col md:flex-row">
          <Link
            href={`/product/${product.slug}`}
            className="block md:w-[260px] md:min-w-[260px]"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[#F7F8FA] md:h-full md:min-h-[260px]">
              <img
                src={imageSrc}
                alt={product.title}
                className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
              />

              <div className="absolute left-4 top-4 flex max-w-[calc(100%-32px)] flex-wrap items-center gap-2">
                <span className="inline-flex max-w-full rounded-full border border-[#E5E7EB] bg-white/90 px-3 py-1 text-xs font-medium text-[#6B7280] backdrop-blur-sm">
                  <span className="truncate">{sellerName}</span>
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    isInStock
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {isInStock ? 'В наличии' : 'Нет в наличии'}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-1 flex-col p-5 md:p-6">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <Link href={`/product/${product.slug}`} className="block">
                  <h3 className="text-[22px] font-semibold leading-8 text-[#111827] transition group-hover:text-[#1F2937]">
                    {product.title}
                  </h3>
                </Link>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                    Продавец: {sellerName}
                  </span>

                  {product.category?.name ? (
                    <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-medium text-[#1F2937]">
                      {product.category.name}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-sm text-[#6B7280]">
                  {isInStock ? `Остаток: ${product.stock}` : 'Недоступно для заказа'}
                </p>
              </div>

              <div className="md:min-w-[180px] md:text-right">
                <p className="text-[30px] font-bold leading-none tracking-tight text-[#111827]">
                  {product.price} BYN
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/product/${product.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                >
                  Открыть
                </Link>

                {product.seller?.storeSlug && (
                  <Link
                    href={`/store/${product.seller.storeSlug}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:border-[#D1D5DB] hover:bg-[#FCFCFD]"
                  >
                    Магазин
                  </Link>
                )}

                <div className="sm:ml-auto sm:min-w-[220px]">
                  <AddToCartButton
                    product={{
                      id: product.id,
                      slug: product.slug,
                      stock: product.stock,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[#F7F8FA]">
          <img
            src={imageSrc}
            alt={product.title}
            className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-[1.03]"
          />

          <div className="absolute left-4 top-4 flex max-w-[calc(100%-32px)] flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full rounded-full border border-[#E5E7EB] bg-white/90 px-3 py-1 text-xs font-medium text-[#6B7280] backdrop-blur-sm">
              <span className="truncate">{sellerName}</span>
            </span>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                isInStock
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {isInStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[56px] text-[18px] font-semibold leading-7 text-[#111827] transition group-hover:text-[#1F2937]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[24px] font-bold leading-none tracking-tight text-[#111827]">
              {product.price} BYN
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              {isInStock ? `Остаток: ${product.stock}` : 'Недоступно для заказа'}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-3">
          <div className="flex gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
            >
              Открыть
            </Link>

            {product.seller?.storeSlug && (
              <Link
                href={`/store/${product.seller.storeSlug}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:border-[#D1D5DB] hover:bg-[#FCFCFD]"
              >
                Магазин
              </Link>
            )}
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </article>
  );
}