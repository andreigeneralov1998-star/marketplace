'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, MapPin, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PageTitle } from '@/components/ui/page-title';

type DeliveryMethod = 'EMS' | 'EUROPOST' | 'BELPOST' | 'PICKUP';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: string | number;
    imageUrl?: string | null;
    images?: { id?: string; url: string }[];
  };
};

type CartState = {
  items: CartItem[];
  total: number;
};

type CheckoutFormState = {
  fullName: string;
  phone: string;
  city: string;
  street: string;
  house: string;
  fullAddress: string;
  comment: string;
  deliveryMethod: DeliveryMethod;
};

const DELIVERY_OPTIONS: {
  value: DeliveryMethod;
  title: string;
  description: string;
  icon: typeof Truck;
}[] = [
  {
    value: 'EMS',
    title: 'EMS',
    description: 'Быстрая доставка по адресу получателя.',
    icon: Truck,
  },
  {
    value: 'EUROPOST',
    title: 'Европочта',
    description: 'Получение через отделение Европочты.',
    icon: Package,
  },
  {
    value: 'BELPOST',
    title: 'Белпочта',
    description: 'Доставка через отделение Белпочты.',
    icon: Package,
  },
  {
    value: 'PICKUP',
    title: 'Самовывоз с магазина TOPSET',
    description: 'Получение заказа в TOPSET.',
    icon: MapPin,
  },
];

function normalizeImageSrc(src?: string | null) {
  if (!src) return '/uploads/placeholders/no-photo.png';
  return src.startsWith('http') ? src : `http://localhost:4000${src}`;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    fullAddress: '',
    comment: '',
    deliveryMethod: 'EMS',
  });

  const isPickup = form.deliveryMethod === 'PICKUP';

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await api.get('/cart');
        const data = res.data;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];

        const total =
          typeof data?.total === 'number'
            ? data.total
            : items.reduce((sum: number, item: any) => {
                return sum + Number(item?.product?.price ?? 0) * Number(item?.quantity ?? 0);
              }, 0);

        setCart({
          items,
          total,
        });
      } catch (err: any) {
        console.error('LOAD CART ERROR:', err?.response?.status, err?.response?.data);

        if (err?.response?.status === 401) {
          router.push('/login?redirect=/checkout');
          return;
        }

        setError('Не удалось загрузить корзину');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (value: DeliveryMethod) => {
    setForm((prev) => ({ ...prev, deliveryMethod: value }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return 'Введите ФИО';
    if (!form.phone.trim()) return 'Введите номер телефона';

    if (!isPickup) {
      if (!form.city.trim()) return 'Введите город';
      if (!form.street.trim()) return 'Введите улицу';
      if (!form.house.trim()) return 'Введите дом';
      if (!form.fullAddress.trim()) {
        return 'Введите квартиру, подъезд, этаж или другие детали адреса';
      }
    }

    if (!cart.items.length) return 'Корзина пустая';

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.post('/orders/checkout', {
        fullName: form.fullName,
        phone: form.phone,
        city: isPickup ? '' : form.city,
        street: isPickup ? '' : form.street,
        house: isPickup ? '' : form.house,
        apartment: isPickup ? '' : form.fullAddress,
        comment: form.comment,
        deliveryMethod: form.deliveryMethod,
      });

      toast.success('Заказ успешно оформлен');
      router.push('/account?order=success');
    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === 'string'
          ? err.response.data.message
          : Array.isArray(err?.response?.data?.message)
            ? err.response.data.message.join(', ')
            : 'Не удалось оформить заказ. Попробуйте снова.';

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalQuantity = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cart.items]);

  if (loading) {
    return (
      <section className="grid gap-6 md:gap-8">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-9 w-64 rounded-xl bg-[#EEF0F3]" />
            <div className="h-5 w-96 max-w-full rounded-xl bg-[#F3F4F6]" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-14 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-14 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-14 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-28 rounded-2xl bg-[#F3F4F6]" />
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-40 rounded-xl bg-[#EEF0F3]" />
              <div className="h-20 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-20 rounded-2xl bg-[#F3F4F6]" />
              <div className="h-12 rounded-xl bg-[#F3F4F6]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!cart.items.length) {
    return (
      <section className="grid gap-6 md:gap-8">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <PageTitle
            title="Оформление заказа"
            description="Проверьте состав корзины и заполните данные получателя перед подтверждением."
            meta={
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                  Marketplace
                </span>
                <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                  Корзина пуста
                </span>
              </div>
            }
          />
        </div>

        <div className="rounded-[24px] border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center md:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4DD]">
            <Package className="h-7 w-7 text-[#1F2937]" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#111827]">
            Нечего оформлять
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6B7280] md:text-[15px]">
            В вашей корзине пока нет товаров. Сначала добавьте нужные позиции, а затем
            возвращайтесь к оформлению.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512]"
            >
              Перейти в каталог
            </Link>

            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
            >
              Вернуться в корзину
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
          title="Оформление заказа"
          description="Укажите данные получателя, выберите способ доставки и проверьте итоговую сумму перед подтверждением."
          meta={
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                Marketplace
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Позиций: {cart.items.length}
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Товаров: {totalQuantity}
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Сумма: {formatPrice(cart.total)}
              </span>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 md:p-6"
        >
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4DD]">
                  <CheckCircle2 className="h-5 w-5 text-[#1F2937]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Данные получателя</h2>
                  <p className="text-sm text-[#6B7280]">
                    Эти данные нужны для связи и передачи заказа.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                    ФИО
                  </span>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Введите полное имя"
                    className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                    Телефон
                  </span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+375..."
                    className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4DD]">
                  <Truck className="h-5 w-5 text-[#1F2937]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Способ доставки</h2>
                  <p className="text-sm text-[#6B7280]">
                    Выберите удобный вариант получения заказа.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {DELIVERY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = form.deliveryMethod === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDeliveryChange(option.value)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? 'border-[#F5A623] bg-[#FFF4DD]'
                          : 'border-[#E5E7EB] bg-[#FCFCFD] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            active ? 'bg-white' : 'bg-[#F7F8FA]'
                          }`}
                        >
                          <Icon className="h-5 w-5 text-[#1F2937]" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-[#111827]">
                            {option.title}
                          </div>
                          <p className="mt-1 text-sm leading-5 text-[#6B7280]">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isPickup && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4DD]">
                    <MapPin className="h-5 w-5 text-[#1F2937]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Адрес доставки</h2>
                    <p className="text-sm text-[#6B7280]">
                      Укажите точный адрес, чтобы заказ был доставлен без задержек.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                      Город
                    </span>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Например, Минск"
                      className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                      Улица
                    </span>
                    <input
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      placeholder="Улица"
                      className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                      Дом
                    </span>
                    <input
                      name="house"
                      value={form.house}
                      onChange={handleChange}
                      placeholder="Дом"
                      className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                      Квартира / подъезд / этаж
                    </span>
                    <input
                      name="fullAddress"
                      value={form.fullAddress}
                      onChange={handleChange}
                      placeholder="Дополнительные детали адреса"
                      className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                    />
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                  Комментарий к заказу
                </span>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Например, позвонить перед доставкой или уточнить удобное время"
                  className="min-h-[120px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-2xl border border-[#F3D0D0] bg-[#FEF3F2] px-4 py-3 text-sm font-medium text-[#B42318]">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/cart"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
              >
                Вернуться в корзину
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Оформление...' : 'Подтвердить заказ'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>

        <aside className="h-fit rounded-[20px] border border-[#E5E7EB] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#111827]">Ваш заказ</h2>

          <div className="mt-5 space-y-3">
            {cart.items.map((item) => {
              const imageSrc = normalizeImageSrc(
                item.product.images?.[0]?.url || item.product.imageUrl
              );

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F7F8FA]">
                    <Image
                      src={imageSrc}
                      alt={item.product.title}
                      fill
                      className="object-contain p-2"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="line-clamp-2 text-sm font-semibold leading-5 text-[#111827]"
                    >
                      {item.product.title}
                    </Link>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {item.quantity} × {formatPrice(Number(item.product.price))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-3 border-t border-[#E5E7EB] pt-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#6B7280]">Позиций</span>
              <span className="font-semibold text-[#111827]">{cart.items.length}</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#6B7280]">Количество товаров</span>
              <span className="font-semibold text-[#111827]">{totalQuantity}</span>
            </div>

            <div className="h-px bg-[#E5E7EB]" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#111827]">Итоговая сумма</span>
              <span className="text-2xl font-bold leading-none text-[#111827]">
                {formatPrice(cart.total)}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-4">
            <p className="text-sm font-medium text-[#111827]">Что будет дальше</p>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              После подтверждения заказа он появится в личном кабинете, где можно будет
              отслеживать его статус.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}