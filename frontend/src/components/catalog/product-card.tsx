import Link from 'next/link';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url;

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-[4/3] bg-slate-100">
        <img
          src={image ? `${process.env.NEXT_PUBLIC_UPLOADS_URL}${image}` : 'https://placehold.co/600x400'}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-semibold">{product.title}</h3>
        <p className="mt-2 text-sm text-slate-500">Артикул: {product.sku}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xl font-bold">{formatPrice(product.price)} ₽</span>
          <Link href={`/product/${product.slug}`} className="rounded-lg bg-black px-4 py-2 text-white">
            Открыть
          </Link>
        </div>
      </div>
    </article>
  );
}