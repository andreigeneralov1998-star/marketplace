'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PageTitle } from '@/components/ui/page-title';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: string | number;
    stock: number;
    slug: string;
    imageUrl?: string | null;
    images?: { id?: string; url: string }[];
  };
};

function normalizeImageSrc(src?: string | null) {
  if (!src) return '/uploads/placeholders/no-photo.png';
  return src.startsWith('http') ? src : `http://localhost:4000${src}`;
}

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      setIsLoading(true);

      const res = await api.get('/cart');
      const data = res.data;

      const parsedItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      setItems(parsedItems);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        router.push('/login?redirect=/cart');
        return;
      }

      console.error('Ошибка загрузки корзины:', error);
      setItems([]);
      toast.error('Не удалось загрузить корзину');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);

      await api.delete(`/cart/${itemId}`);

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success('Товар удалён из корзины');
    } catch (error: any) {
      if (error?.response?.status === 401) {
        router.push('/login?redirect=/cart');
        return;
      }

      toast.error(
        typeof error?.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Не удалось удалить товар'
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = async (itemId: string, nextQuantity: number) => {
    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem) return;

    if (nextQuantity < 1) {
      await handleRemove(itemId);
      return;
    }

    if (nextQuantity > currentItem.product.stock) {
      toast.error(`Доступно только ${currentItem.product.stock} шт.`);
      return;
    }

    try {
      setUpdatingItemId(itemId);

      const res = await api.patch(`/cart/${itemId}`, {
        quantity: nextQuantity,
      });

      const updatedItem = res.data;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: updatedItem?.quantity ?? nextQuantity,
              }
            : item
        )
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        router.push('/login?redirect=/cart');
        return;
      }

      const message =
        typeof error?.response?.data?.message === 'string'
          ? error.response.data.message
          : Array.isArray(error?.response?.data?.message)
            ? error.response.data.message.join(', ')
            : 'Не удалось обновить количество';

      toast.error(message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);
  }, [items]);

  if (isLoading) {
    return (
      <section className="grid gap-6 md:gap-8">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-9 w-48 rounded-xl bg-[#EEF0F3]" />
            <div className="h-5 w-80 max-w-full rounded-xl bg-[#F3F4F6]" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-28 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-28 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-28 rounded-2xl bg-[#F3F4F6]" />
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-36 rounded-xl bg-[#EEF0F3]" />
              <div className="h-5 w-full rounded-xl bg-[#F3F4F6]" />
              <div className="h-5 w-2/3 rounded-xl bg-[#F3F4F6]" />
              <div className="h-12 rounded-xl bg-[#F3F4F6]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="grid gap-6 md:gap-8">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <PageTitle
            title="Корзина"
            description="Проверьте выбранные товары перед оформлением заказа."
            meta={
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                  Marketplace
                </span>
                <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                  Товаров: 0
                </span>
              </div>
            }
          />
        </div>

        <div className="rounded-[24px] border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center md:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4DD]">
            <ShoppingBag className="h-7 w-7 text-[#1F2937]" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#111827]">
            Корзина пока пуста
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6B7280] md:text-[15px]">
            Добавьте товары из каталога, чтобы оформить заказ. Всё выбранное появится
            здесь в едином аккуратном списке.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512]"
            >
              Перейти в каталог
            </Link>

            <Link
              href="/stores"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
            >
              Смотреть магазины
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:gap-8">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <PageTitle
          title="Корзина"
          description="Проверьте состав заказа, количество товаров и итоговую сумму перед оформлением."
          meta={
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                Marketplace
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Позиций: {items.length}
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Сумма: {formatPrice(total)}
              </span>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-4 md:p-5">
          <div className="space-y-4">
            {items.map((item) => {
              const itemTotal = Number(item.product.price) * item.quantity;
              const isUpdating = updatingItemId === item.id;

              const imageSrc = normalizeImageSrc(
                item.product.images?.[0]?.url || item.product.imageUrl
              );

              return (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] p-4 transition md:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] sm:w-24"
                    >
                      <Image
                        src={imageSrc}
                        alt={item.product.title}
                        fill
                        className="object-contain p-3"
                        sizes="96px"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="line-clamp-2 text-base font-semibold leading-6 text-[#111827] transition hover:text-[#0F172A]"
                          >
                            {item.product.title}
                          </Link>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                              {formatPrice(Number(item.product.price))}
                            </span>

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                item.product.stock > 0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {item.product.stock > 0
                                ? `Остаток: ${item.product.stock}`
                                : 'Нет в наличии'}
                            </span>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-sm text-[#6B7280]">Итого</p>
                          <p className="mt-1 text-xl font-bold leading-none text-[#111827]">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex h-11 items-center rounded-xl border border-[#E5E7EB] bg-white">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isUpdating}
                            className="inline-flex h-11 w-11 items-center justify-center text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <div className="flex h-11 min-w-[52px] items-center justify-center border-x border-[#E5E7EB] px-3 text-sm font-semibold text-[#111827]">
                            {isUpdating ? '...' : item.quantity}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= item.product.stock}
                            className="inline-flex h-11 w-11 items-center justify-center text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Увеличить количество"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={isUpdating}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F3D0D0] bg-white px-4 text-sm font-semibold text-[#B42318] transition hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="h-fit rounded-[20px] border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#111827]">Сводка заказа</h2>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#6B7280]">Товаров в корзине</span>
              <span className="font-semibold text-[#111827]">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#6B7280]">Позиций</span>
              <span className="font-semibold text-[#111827]">{items.length}</span>
            </div>

            <div className="h-px bg-[#E5E7EB]" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#111827]">Итоговая сумма</span>
              <span className="text-2xl font-bold leading-none text-[#111827]">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512]"
          >
            Оформить заказ
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/catalog"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
          >
            Продолжить покупки
          </Link>

          <p className="mt-4 text-xs leading-5 text-[#6B7280]">
            На следующем шаге вы укажете данные получателя, адрес и способ доставки.
          </p>
        </aside>
      </div>
    </section>
  );
}