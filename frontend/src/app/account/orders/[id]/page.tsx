'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type OrderItem = {
  id: string;
  titleSnapshot: string;
  quantity: number;
  priceSnapshot: number | string;
};

type Order = {
  id: string;
  status: string;
  createdAt: string;
  fullName?: string | null;
  phone?: string | null;
  deliveryMethod?: string | null;
  city?: string | null;
  street?: string | null;
  house?: string | null;
  apartment?: string | null;
  comment?: string | null;
  total?: number | string;
  items: OrderItem[];
};

function getOrderStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Новый';
    case 'PAID':
      return 'Оплачен';
    case 'PROCESSING':
      return 'В обработке';
    case 'SHIPPED':
      return 'Отправлен';
    case 'DELIVERED':
      return 'Доставлен';
    case 'CANCELLED':
      return 'Отменён';
    default:
      return status;
  }
}

function getDeliveryMethodLabel(deliveryMethod?: string | null) {
  switch (deliveryMethod) {
    case 'EMS':
      return 'EMS';
    case 'EUROPOCHTA':
      return 'Европочта';
    case 'BELPOCHTA':
      return 'Белпочта';
    case 'PICKUP_TOPSET':
      return 'Самовывоз TOPSET';
    default:
      return deliveryMethod || '—';
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError('');

    api
      .get(`/orders/my/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => {
        console.error('Ошибка загрузки заказа:', err);
        setOrder(null);
        setError('Не удалось загрузить заказ');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
          Загружаем заказ...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <Link
          href="/account"
          className="inline-flex rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
        >
          ← Назад в личный кабинет
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="space-y-4">
        <Link
          href="/account"
          className="inline-flex rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
        >
          ← Назад в личный кабинет
        </Link>

        <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
          Заказ не найден
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        href="/account"
        className="inline-flex rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
      >
        ← Назад в личный кабинет
      </Link>

      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Заказ #{order.id}</h1>
            <p className="text-sm text-slate-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-sm font-medium">
            Статус: {getOrderStatusLabel(order.status)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Информация о заказе</h2>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p><b>Получатель:</b> {order.fullName || '—'}</p>
          <p><b>Телефон:</b> {order.phone || '—'}</p>
          <p><b>Доставка:</b> {getDeliveryMethodLabel(order.deliveryMethod)}</p>
          <p>
            <b>Адрес:</b>{' '}
            {[order.city, order.street, order.house, order.apartment]
              .filter(Boolean)
              .join(', ') || '—'}
          </p>
          {order.comment && (
            <p className="md:col-span-2">
              <b>Комментарий:</b> {order.comment}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Товары</h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border-b pb-3"
            >
              <div>
                <p className="font-medium">{item.titleSnapshot}</p>
                <p className="text-sm text-slate-500">
                  Количество: {item.quantity}
                </p>
              </div>

              <div className="text-right text-sm font-medium">
                {formatPrice(Number(item.priceSnapshot) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4 text-right text-base font-semibold">
          Итого: {formatPrice(Number(order.total ?? 0))}
        </div>
      </div>
    </section>
  );
}