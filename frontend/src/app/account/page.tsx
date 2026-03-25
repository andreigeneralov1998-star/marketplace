'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

interface OrderItem {
  id: string;
  titleSnapshot: string;
  quantity: number;
  priceSnapshot: number | string;
}

interface Order {
  id: string;
  status: OrderStatus | string;
  createdAt: string;
  total: number | string;
  items: OrderItem[];
}

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

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        colorMap[status] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

export default function AccountPage() {
  const { user, fetchMe } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = async (showMainLoader = false) => {
    try {
      setError('');

      if (showMainLoader) {
        setLoading(true);
      } else {
        setFilterLoading(true);
      }

      const params = new URLSearchParams();

      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const queryString = params.toString();
      const url = queryString ? `/orders/my?${queryString}` : '/orders/my';

      const res = await api.get(url);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setOrders([]);
      setError('Не удалось загрузить историю заказов');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchMe().catch(() => undefined);
    loadOrders(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMe]);

  const handleApplyFilter = async () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setError('Дата "от" не может быть больше даты "до"');
      return;
    }

    await loadOrders(false);
  };

  const handleResetFilter = async () => {
    setDateFrom('');
    setDateTo('');
    setError('');

    try {
      setFilterLoading(true);
      const res = await api.get('/orders/my');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setOrders([]);
      setError('Не удалось загрузить историю заказов');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <p className="mt-2">Email: {user?.email ?? '—'}</p>
        <p>Роль: {user?.role ?? '—'}</p>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">История заказов</h2>
            <p className="mt-1 text-sm text-slate-500">
              Фильтруй заказы по диапазону дат
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Дата от</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Дата до</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyFilter}
              disabled={filterLoading}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {filterLoading ? 'Загрузка...' : 'Применить'}
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              disabled={filterLoading}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Сбросить
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
            Загружаем историю заказов...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
            У вас пока нет заказов.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border p-4">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">Заказ #{order.id}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-2 text-sm">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{item.titleSnapshot}</p>
                        <p className="text-slate-500">
                          Кол-во: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right font-medium">
                        {formatPrice(Number(item.priceSnapshot) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
                  <div className="font-semibold">
                    Сумма заказа: {formatPrice(Number(order.total))}
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}