import Link from 'next/link';
import type { ProductListItem } from '@/types';

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
  if (!src) return '/uploads/placeholders/no-photo.png';
  return src.startsWith('http') ? src : `http://localhost:4000${src}`;
}

type ProductCardProps = {
  product: ProductListItem;
};

export function ProductCard({ product }: ProductCardProps) {
  const sellerName = getSellerDisplayName(product.seller);
  const imageSrc = normalizeImageSrc(product.images?.[0]?.url || product.imageUrl);
  const isInStock = product.stock > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-[#F7F8FA]">
          <img
            src={imageSrc}
            alt={product.title}
            className="h-full w-full object-contain p-4"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex max-w-full rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
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

        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-[#111827]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-4">
          <p className="text-[24px] font-bold leading-none text-[#111827]">
            {product.price} BYN
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            {isInStock ? `Остаток: ${product.stock}` : 'Недоступно для заказа'}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white"
            >
              Открыть
            </Link>

            {product.seller?.storeSlug && (
              <Link
                href={`/store/${product.seller.storeSlug}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827]"
              >
                Магазин
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}