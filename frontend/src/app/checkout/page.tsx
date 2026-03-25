'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Truck, MapPin, Package, CreditCard, User, Phone } from 'lucide-react';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    images?: { url: string }[];
  };
};

type CartResponse = {
  items: CartItem[];
  total: number;
};

type DeliveryMethod = 'EMS' | 'EUROPOCHTA' | 'BELPOCHTA' | 'PICKUP_TOPSET';

const DELIVERY_OPTIONS: {
  value: DeliveryMethod;
  label: string;
  description: string;
}[] = [
  {
    value: 'EMS',
    label: 'EMS почта',
    description: 'Быстрая доставка курьерской службой',
  },
  {
    value: 'EUROPOCHTA',
    label: 'Европочта',
    description: 'Доставка через отделение Европочты',
  },
  {
    value: 'BELPOCHTA',
    label: 'Белпочта',
    description: 'Классическая доставка через Белпочту',
  },
  {
    value: 'PICKUP_TOPSET',
    label: 'Самовывоз TOPSET',
    description: 'Забрать заказ самостоятельно',
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartResponse>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    fullAddress: '',
    comment: '',
    deliveryMethod: 'BELPOCHTA' as DeliveryMethod,
  });

  const isPickup = form.deliveryMethod === 'PICKUP_TOPSET';

  const finalAddress = useMemo(() => {
    if (isPickup) {
      return 'Самовывоз TOPSET';
    }

    const parts = [
      form.city.trim(),
      form.street.trim(),
      form.house.trim() ? `дом ${form.house.trim()}` : '',
      form.fullAddress.trim(),
    ].filter(Boolean);

    return parts.join(', ');
  }, [form.city, form.street, form.house, form.fullAddress, isPickup]);

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
          setError('Сначала войдите в аккаунт');
          return;
        }

        setError('Не удалось загрузить корзину');
      } finally {
        setLoading(false);
      }
    };
    const token = localStorage.getItem('accessToken');

      if (!token) {
        router.push('/login');
        return;
      }

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
      if (!form.fullAddress.trim()) return 'Введите квартиру, подъезд, этаж или другие детали адреса';
    }

    if (!cart.items.length) return 'Корзина пустая';

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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

      router.push('/account?order=success');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Не удалось оформить заказ. Попробуйте снова.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-xl bg-slate-200" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="space-y-4">
                <div className="h-14 rounded-2xl bg-slate-100" />
                <div className="h-14 rounded-2xl bg-slate-100" />
                <div className="h-14 rounded-2xl bg-slate-100" />
                <div className="h-14 rounded-2xl bg-slate-100" />
              </div>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="h-24 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-yellow-600">
            TOPSET
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Оформление заказа
          </h1>
          <p className="mt-2 text-slate-600">
            Заполните данные для доставки и проверьте состав заказа перед подтверждением.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          >
            <div className="space-y-8">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Контактные данные
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      ФИО
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Введите ФИО"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Номер телефона
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+375 (29) 123-45-67"
                        className="w-full rounded-2xl border border-slate-300 py-3 pl-12 pr-4 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-slate-900">
                    Способ доставки
                  </h2>
                </div>

                <div className="grid gap-3">
                  {DELIVERY_OPTIONS.map((option) => {
                    const active = form.deliveryMethod === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDeliveryChange(option.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {option.label}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              {option.description}
                            </div>
                          </div>

                          <div
                            className={`mt-1 h-5 w-5 rounded-full border-2 ${
                              active
                                ? 'border-yellow-500 bg-yellow-500'
                                : 'border-slate-300'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isPickup && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-yellow-600" />
                    <h2 className="text-xl font-semibold text-slate-900">
                      Адрес доставки
                    </h2>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Город
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Например, Минск"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Улица
                      </label>
                      <input
                        name="street"
                        value={form.street}
                        onChange={handleChange}
                        placeholder="Например, Притыцкого"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Дом
                      </label>
                      <input
                        name="house"
                        value={form.house}
                        onChange={handleChange}
                        placeholder="Например, 10"
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Квартира, подъезд, этаж и другие детали
                      </label>
                      <textarea
                        name="fullAddress"
                        value={form.fullAddress}
                        onChange={handleChange}
                        placeholder="Квартира, подъезд, этаж, индекс, отделение и другие детали"
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Комментарий к заказу
                </label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  placeholder="Например: позвонить перед доставкой"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || cart.items.length === 0}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-slate-900">Ваш заказ</h2>
            </div>

            {cart.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
                Корзина пустая
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const lineTotal = Number(item.product.price) * Number(item.quantity);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        {item.product.images?.[0]?.url ? (
                          <img
                            src={`http://localhost:4000${item.product.images[0].url}`}
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Нет фото
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 font-semibold text-slate-900">
                          {item.product.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Кол-во: {item.quantity}
                        </div>
                        <div className="mt-2 text-sm font-medium text-slate-700">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                      </div>

                      <div className="whitespace-nowrap text-right font-semibold text-slate-900">
                        {formatPrice(lineTotal)}
                      </div>
                    </div>
                  );
                })}

                <div className="my-4 h-px bg-slate-200" />

                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Способ доставки</span>
                    <span>
                      {
                        DELIVERY_OPTIONS.find(
                          (option) => option.value === form.deliveryMethod
                        )?.label
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                    <span>Итого</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-slate-700">
                  <div className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                    Проверка перед заказом
                  </div>
                  <p>
                    Проверьте состав корзины, адрес и номер телефона. Ошибка в одном поле —
                    и посылка уедет в параллельную вселенную.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}