'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Package, Clock3, Truck, Wallet, ChevronRight } from 'lucide-react';

import { api } from '@/lib/api';
import {
  OrderStatus,
  getOrderStatusClassName,
  getOrderStatusLabel,
} from '@/lib/order-status';

interface OrderUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

interface OrderItem {
  id: string;
  skuSnapshot?: string | null;
  titleSnapshot: string;
  status: OrderStatus;
}

interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  sellerTotal: number;
  user?: OrderUser;
  items: OrderItem[];
}

type StatusFilter = 'ALL' | OrderStatus;

const STATUS_FILTER_META: {
  value: StatusFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'PENDING', label: 'Новые' },
  { value: 'PAID', label: 'Оплаченные' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'SHIPPED', label: 'Отправленные' },
  { value: 'DELIVERED', label: 'Доставленные' },
  { value: 'CANCELLED', label: 'Отменённые' },
];

function formatMoney(value: number | string) {
  return `${Number(value || 0).toFixed(2)} BYN`;
}

function formatBuyer(user?: OrderUser) {
  if (!user) return 'Покупатель не указан';

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return fullName || user.email || user.phone || 'Покупатель';
}

function KpiCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-[#111827]">
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs text-[#9CA3AF]">{hint}</p> : null}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF4DD] text-[#1F2937]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusClassName(
        status,
      )}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/seller/my');
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Ошибка загрузки заказов продавца:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const counters = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      PAID: orders.filter((o) => o.status === 'PAID').length,
      PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'ALL' || order.status === statusFilter;

      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const buyerEmail = order.user?.email?.toLowerCase() || '';
      const buyerName = `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`
        .trim()
        .toLowerCase();
      const buyerPhone = order.user?.phone?.toLowerCase() || '';
      const orderId = order.id.toLowerCase();
      const itemsText = (order.items || [])
        .map((item) =>
          `${item.titleSnapshot || ''} ${item.skuSnapshot || ''}`.toLowerCase(),
        )
        .join(' ');

      return (
        buyerEmail.includes(normalizedSearch) ||
        buyerName.includes(normalizedSearch) ||
        buyerPhone.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch) ||
        itemsText.includes(normalizedSearch)
      );
    });
  }, [orders, statusFilter, search]);

  const visibleSellerTotal = useMemo(() => {
    return filteredOrders.reduce(
      (sum, order) => sum + Number(order.sellerTotal || 0),
      0,
    );
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
          Загрузка заказов...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#1F2937]">
              <Package className="h-3.5 w-3.5" />
              Seller / Заказы
            </div>

            <h1 className="mt-4 text-[28px] font-bold leading-tight text-[#111827]">
              Заказы покупателей
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Здесь ты видишь все заказы по своим товарам, можешь быстро отфильтровать
              их по статусу и перейти в детали заказа.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4 lg:w-[320px]">
            <p className="text-sm font-semibold text-[#111827]">Сейчас по выборке</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-[#111827]">
              {formatMoney(visibleSellerTotal)}
            </p>
            <p className="mt-2 text-sm leading-5 text-[#6B7280]">
              Сумма продавца по заказам, которые сейчас попали под фильтр и поиск.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Все заказы"
          value={counters.ALL}
          hint="Общее количество"
          icon={<Package className="h-5 w-5" />}
        />
        <KpiCard
          title="Новые"
          value={counters.PENDING}
          hint="Требуют внимания"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <KpiCard
          title="В обработке"
          value={counters.PROCESSING}
          hint="Уже приняты"
          icon={<ChevronRight className="h-5 w-5" />}
        />
        <KpiCard
          title="Отправленные"
          value={counters.SHIPPED}
          hint="Переданы покупателю"
          icon={<Truck className="h-5 w-5" />}
        />
      </section>

      <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTER_META.map((button) => {
              const count =
                button.value === 'ALL'
                  ? counters.ALL
                  : counters[button.value as OrderStatus] ?? 0;

              const active = statusFilter === button.value;

              return (
                <button
                  key={button.value}
                  type="button"
                  onClick={() => setStatusFilter(button.value)}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition ${
                    active
                      ? 'bg-[#111827] text-white'
                      : 'border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {button.label}
                  <span
                    className={`ml-2 inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 text-xs ${
                      active ? 'bg-white/15 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[460px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Поиск по ID заказа, покупателю, email, товару или SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#FFF4DD]"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#F7F8FA] px-4 py-3 text-sm text-[#6B7280]">
              <Wallet className="h-4 w-4 text-[#9CA3AF]" />
              Найдено заказов:
              <span className="font-semibold text-[#111827]">{filteredOrders.length}</span>
            </div>
          </div>
        </div>
      </section>

      {!filteredOrders.length ? (
        <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold text-[#111827]">Заказы не найдены</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Попробуй изменить фильтр или очистить строку поиска.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#111827]">
                      Заказ #{order.id.slice(0, 8)}
                    </h3>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Покупатель
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {formatBuyer(order.user)}
                      </p>
                      {order.user?.email ? (
                        <p className="mt-1 text-sm text-[#6B7280]">{order.user.email}</p>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Дата
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Сумма продавца
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">
                        {formatMoney(order.sellerTotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                        Всего позиций
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        {order.items?.length || 0}
                      </p>
                    </div>
                  </div>

                  {order.items?.length ? (
                    <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-4">
                      <p className="text-sm font-medium text-[#111827]">Товары в заказе</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#374151]"
                          >
                            {item.titleSnapshot}
                            {item.skuSnapshot ? (
                              <span className="ml-1 text-[#9CA3AF]">({item.skuSnapshot})</span>
                            ) : null}
                          </div>
                        ))}

                        {order.items.length > 4 ? (
                          <div className="rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#6B7280]">
                            + ещё {order.items.length - 4}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col gap-3 xl:w-[220px]">
                  <Link
                    href={`/seller/orders/${order.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                  >
                    Открыть заказ
                  </Link>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
                    Статус: <span className="font-medium text-[#111827]">{getOrderStatusLabel(order.status)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}