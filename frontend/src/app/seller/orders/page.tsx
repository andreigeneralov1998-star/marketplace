'use client';
import {
  OrderStatus,
  ORDER_STATUS_COLORS,
  getOrderStatusLabel,
} from '@/lib/order-status';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Новые',
  PAID: 'Оплаченные',
  PROCESSING: 'В обработке',
  SHIPPED: 'Отправленные',
  DELIVERED: 'Доставленные',
  CANCELLED: 'Отменённые',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#16a34a',
  CANCELLED: '#dc2626',
};
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

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        backgroundColor: ORDER_STATUS_COLORS[status],
        whiteSpace: 'nowrap',
      }}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function KpiCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 12,
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
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
        setOrders(data);
      } catch (error) {
        console.error('Ошибка загрузки заказов продавца:', error);
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
      const orderId = order.id.toLowerCase();
      const itemsText = (order.items || [])
        .map((item) =>
          `${item.titleSnapshot || ''} ${item.skuSnapshot || ''}`.toLowerCase(),
        )
        .join(' ');

      return (
        buyerEmail.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch) ||
        itemsText.includes(normalizedSearch)
      );
    });
  }, [orders, statusFilter, search]);

  const visibleSellerTotal = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + Number(order.sellerTotal), 0);
  }, [filteredOrders]);

  const filterButtons: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'ALL', label: 'Все', count: counters.ALL },
    { value: 'PENDING', label: 'Новые', count: counters.PENDING },
    { value: 'PAID', label: 'Оплаченные', count: counters.PAID },
    { value: 'PROCESSING', label: 'В обработке', count: counters.PROCESSING },
    { value: 'SHIPPED', label: 'Отправленные', count: counters.SHIPPED },
    { value: 'DELIVERED', label: 'Доставленные', count: counters.DELIVERED },
    { value: 'CANCELLED', label: 'Отменённые', count: counters.CANCELLED },
  ];

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка заказов...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Заказы покупателей</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KpiCard title="Все заказы" value={counters.ALL} />
        <KpiCard title="Новые" value={counters.PENDING} />
        <KpiCard title="В обработке" value={counters.PROCESSING} />
        <KpiCard title="Отправленные" value={counters.SHIPPED} />
        <KpiCard
          title="Сумма по видимым заказам"
          value={visibleSellerTotal}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {filterButtons.map((button) => {
            const active = statusFilter === button.value;

            return (
              <button
                key={button.value}
                onClick={() => setStatusFilter(button.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid #d1d5db',
                  background: active ? '#111827' : '#fff',
                  color: active ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {button.label} ({button.count})
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Поиск по ID заказа, email, товару или SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            maxWidth: 420,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #d1d5db',
            outline: 'none',
          }}
        />

        <div style={{ fontSize: 14, color: '#4b5563' }}>
          Найдено заказов: <strong>{filteredOrders.length}</strong>
        </div>
      </div>

      {!filteredOrders.length ? (
        <p>По вашему фильтру заказов не найдено.</p>
      ) : (
        <table
          border={1}
          cellPadding={10}
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            background: '#fff',
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Покупатель</th>
              <th>Статус</th>
              <th>Сумма продавца</th>
              <th>Дата</th>
              <th>Действие</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user?.email || 'Без email'}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>{order.sellerTotal}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/seller/orders/${order.id}`}>Открыть</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}