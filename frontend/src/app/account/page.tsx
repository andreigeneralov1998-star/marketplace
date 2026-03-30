'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  User2,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PageTitle } from '@/components/ui/page-title';

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

function getStatusClasses(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'PAID':
      return 'bg-sky-50 text-sky-700 border-sky-100';
    case 'PROCESSING':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    case 'SHIPPED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'CANCELLED':
      return 'bg-red-50 text-red-600 border-red-100';
    default:
      return 'bg-[#F7F8FA] text-[#6B7280] border-[#E5E7EB]';
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
        status
      )}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
    } catch (err: any) {
      console.error('Ошибка загрузки заказов:', err);

      if (err?.response?.status === 401) {
        window.location.href = '/login?redirect=/account';
        return;
      }

      setOrders([]);
      setError('Не удалось загрузить историю заказов');
      toast.error('Не удалось загрузить историю заказов');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('order') === 'success') {
      toast.success('Заказ успешно оформлен');
    }
  }, []);

  const handleApplyFilter = async () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      const message = 'Дата "от" не может быть больше даты "до"';
      setError(message);
      toast.error(message);
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
    } catch (err: any) {
      console.error('Ошибка загрузки заказов:', err);

      if (err?.response?.status === 401) {
        window.location.href = '/login?redirect=/account';
        return;
      }

      setOrders([]);
      setError('Не удалось загрузить историю заказов');
      toast.error('Не удалось загрузить историю заказов');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  const totalOrders = orders.length;

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((order) => order.status === 'DELIVERED').length;
  }, [orders]);

  const activeCount = useMemo(() => {
    return orders.filter((order) =>
      ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)
    ).length;
  }, [orders]);

  return (
    <section className="grid gap-6 md:gap-8">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <PageTitle
          title="Личный кабинет"
          description="Отслеживайте историю заказов, проверяйте статусы и быстро возвращайтесь к покупкам."
          meta={
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
                Buyer area
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Email: {user?.email ?? '—'}
              </span>
              <span className="inline-flex rounded-full bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-[#6B7280]">
                Роль: {user?.role ?? '—'}
              </span>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4DD]">
            <ShoppingBag className="h-5 w-5 text-[#1F2937]" />
          </div>
          <p className="mt-4 text-sm text-[#6B7280]">Всего заказов</p>
          <p className="mt-1 text-3xl font-bold leading-none text-[#111827]">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4DD]">
            <Wallet className="h-5 w-5 text-[#1F2937]" />
          </div>
          <p className="mt-4 text-sm text-[#6B7280]">Сумма заказов</p>
          <p className="mt-1 text-3xl font-bold leading-none text-[#111827]">
            {formatPrice(totalSpent)}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4DD]">
            <Clock3 className="h-5 w-5 text-[#1F2937]" />
          </div>
          <p className="mt-4 text-sm text-[#6B7280]">Активные</p>
          <p className="mt-1 text-3xl font-bold leading-none text-[#111827]">
            {activeCount}
          </p>
        </div>

        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4DD]">
            <CheckCircle2 className="h-5 w-5 text-[#1F2937]" />
          </div>
          <p className="mt-4 text-sm text-[#6B7280]">Доставлены</p>
          <p className="mt-1 text-3xl font-bold leading-none text-[#111827]">
            {deliveredCount}
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4DD]">
                <CalendarRange className="h-5 w-5 text-[#1F2937]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#111827]">История заказов</h2>
                <p className="text-sm text-[#6B7280]">
                  Фильтруйте заказы по диапазону дат и отслеживайте текущие статусы.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-end">
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                Дата от
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-11 w-full min-w-[180px] rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
                Дата до
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-11 w-full min-w-[180px] rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
              />
            </label>

            <button
              type="button"
              onClick={handleApplyFilter}
              disabled={filterLoading}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {filterLoading ? 'Загрузка...' : 'Применить'}
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              disabled={filterLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              Сбросить
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-[#F3D0D0] bg-[#FEF3F2] px-4 py-3 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-48 rounded-xl bg-[#EEF0F3]" />
                <div className="h-4 w-56 rounded-xl bg-[#F3F4F6]" />
                <div className="h-20 rounded-2xl bg-[#F3F4F6]" />
              </div>
            </div>
            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] p-5">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-40 rounded-xl bg-[#EEF0F3]" />
                <div className="h-4 w-52 rounded-xl bg-[#F3F4F6]" />
                <div className="h-20 rounded-2xl bg-[#F3F4F6]" />
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#E5E7EB] bg-[#FCFCFD] px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF4DD]">
              <Package className="h-7 w-7 text-[#1F2937]" />
            </div>

            <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#111827]">
              Заказов пока нет
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6B7280] md:text-[15px]">
              Как только вы оформите первый заказ, он появится здесь. Можно будет
              отслеживать статус и открыть подробную страницу заказа.
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
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] p-4 md:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#111827]">
                        Заказ #{order.id}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1">
                        Дата: {formatOrderDate(order.createdAt)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1">
                        Позиций: {order.items.length}
                      </span>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm text-[#6B7280]">Сумма заказа</p>
                    <p className="mt-1 text-2xl font-bold leading-none text-[#111827]">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {item.titleSnapshot}
                        </p>
                        <p className="mt-1 text-sm text-[#6B7280]">
                          Кол-во: {item.quantity}
                        </p>
                      </div>

                      <div className="text-left text-sm font-semibold text-[#111827] sm:text-right">
                        {formatPrice(Number(item.priceSnapshot) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
                    <User2 className="h-4 w-4" />
                    Заказ доступен для просмотра деталей и отслеживания статуса
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F8FA]"
                  >
                    Подробнее
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}