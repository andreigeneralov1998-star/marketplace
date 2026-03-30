'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm, ProductFormValues } from '@/components/forms/product-form';
import { api } from '@/lib/api';

type ProductImage = {
  id?: string;
  url: string;
};

type SellerProduct = {
  id: string;
  title: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  description: string;
  compatibleModels?: string | null;
  isPublished?: boolean;
  images?: ProductImage[];
  imageUrl?: string | null;
};

export default function EditSellerProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = String(params?.id || '');

  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await api.get('/products/seller/my');
        const productsData = Array.isArray(res.data) ? res.data : [];

        const currentProduct = productsData.find(
          (item: SellerProduct) => item.id === productId,
        );

        if (!currentProduct) {
          setError('Товар не найден');
          setLoading(false);
          return;
        }

        setProduct(currentProduct);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Не удалось загрузить товар');
      } finally {
        setLoading(false);
      }
    };

    if (productId) load();
  }, [productId]);

  const initialValues: Partial<ProductFormValues> | undefined = product
    ? {
        title: product.title || '',
        categoryId: product.categoryId || '',
        price:
          typeof product.price === 'number' ? String(product.price) : '',
        stock:
          typeof product.stock === 'number' ? String(product.stock) : '0',
        description: product.description || '',
        compatibleModels: product.compatibleModels || '',
      }
    : undefined;

  const initialImages =
    product?.images?.length
      ? product.images.map((img) => img.url)
      : product?.imageUrl
      ? [product.imageUrl]
      : [];

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="h-8 w-56 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-[#F3F4F6]" />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm"
              >
                <div className="h-6 w-40 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((__, i) => (
                    <div key={i}>
                      <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
                      <div className="h-11 animate-pulse rounded-xl bg-[#F3F4F6]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="h-5 w-32 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="mt-4 h-20 animate-pulse rounded-xl bg-[#F3F4F6]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="space-y-6">
        <div className="rounded-[20px] border border-[#FECACA] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#111827]">Редактирование товара</h1>

          <div className="mt-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
            {error || 'Товар не найден'}
          </div>

          <div className="mt-5">
            <Link
              href="/seller/products"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Назад к товарам
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#F5A623]">Seller cabinet</p>
            <h1 className="mt-2 text-[32px] font-bold leading-10 text-[#111827]">
              Редактирование товара
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              После сохранения обновлённая карточка может быть скрыта до повторной
              модерации администратором.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/seller/products"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Назад к товарам
            </Link>

            <Link
              href="/seller"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              В кабинет
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-full bg-[#F9FAFB] px-4 py-2 text-sm text-[#374151]">
            SKU нельзя менять
          </div>
          <div className="rounded-full bg-[#F9FAFB] px-4 py-2 text-sm text-[#374151]">
            Максимум 3 изображения
          </div>
          <div className="rounded-full bg-[#F9FAFB] px-4 py-2 text-sm text-[#374151]">
            После изменения возможна модерация
          </div>
        </div>
      </div>

      <ProductForm
        mode="edit"
        initialValues={initialValues}
        initialImages={initialImages}
        lockedSku={product.sku}
        cancelHref="/seller/products"
        backHref="/seller/products"
        onSuccessRedirect="/seller/products"
        submitLabel="Сохранить изменения"
        submittingLabel="Сохранение..."
        onSubmitForm={async (payload) => {
          await api.patch(`/products/${productId}`, {
            title: payload.title,
            categoryId: payload.categoryId,
            price: payload.price,
            stock: payload.stock,
            description: payload.description,
            compatibleModels: payload.compatibleModels,
            imageUrls: payload.imageUrls,
          });

          router.push('/seller/products');
        }}
      />
    </section>
  );
}