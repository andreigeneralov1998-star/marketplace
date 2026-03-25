'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import {
  ORDER_STATUS_COLORS,
  getOrderStatusLabel,
  type OrderStatus,
} from '@/lib/order-status';

interface OrderItem {
  id: string;
  productId: string;
  sellerId: string;
  titleSnapshot: string;
  skuSnapshot: string | null;
  priceSnapshot: number | string;
  quantity: number;
  status: OrderStatus | string;
}

interface BuyerOrder {
  id: string;
  status: OrderStatus | string;
  createdAt: string;
  totalAmount: number | string;
  fullName: string;
  phone: string;
  address: string;
  comment?: string | null;
  items: OrderItem[];
}

function StatusBadge({ status }: { status: OrderStatus | string }) {
  const color = ORDER_STATUS_COLORS[status as OrderStatus] || '#6b7280';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        backgroundColor: color,
        whiteSpace: 'nowrap',
      }}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 14 }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}

export default function BuyerOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
        try {
        setError('');
        const { data } = await api.get(`/orders/my/${orderId}`);
        setOrder(data);
        } catch (err: any) {
        console.error('Ошибка загрузки заказа покупателя:', err);

        if (err?.response?.status === 404) {
            setError('Заказ не найден');
        } else if (err?.response?.status === 401) {
            setError('Вы не авторизованы');
        } else if (err?.response?.status === 403) {
            setError('Нет доступа к этому заказу');
        } else {
            setError('Не удалось загрузить заказ');
        }
        } finally {
        setLoading(false);
        }
    };

    fetchOrder();
    }, [orderId]);

  const itemsCount = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка заказа...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p>{error}</p>
        <Link href="/account">← Назад в личный кабинет</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 20 }}>
        <p>Заказ не найден.</p>
        <Link href="/account">← Назад в личный кабинет</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/account">← Назад в личный кабинет</Link>
      </div>

      <h1 style={{ marginBottom: 20 }}>Заказ #{order.id.slice(-6)}</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <InfoCard title="Информация по заказу">
          <InfoRow
            label="Статус"
            value={<StatusBadge status={order.status} />}
          />
          <InfoRow
            label="Дата"
            value={new Date(order.createdAt).toLocaleString()}
          />
          <InfoRow label="Позиций" value={order.items.length} />
          <InfoRow label="Штук товара" value={itemsCount} />
          <InfoRow
            label="Сумма заказа"
            value={formatPrice(Number(order.totalAmount))}
          />
        </InfoCard>

        <InfoCard title="Данные получателя">
          <InfoRow label="ФИО" value={order.fullName || '—'} />
          <InfoRow label="Телефон" value={order.phone || '—'} />
          <InfoRow label="Адрес" value={order.address || '—'} />
          <InfoRow label="Комментарий" value={order.comment || '—'} />
        </InfoCard>
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 16,
          background: '#fff',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Состав заказа</h2>

        {!order.items.length ? (
          <p>В заказе нет товаров.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                  <th>Товар</th>
                  <th>SKU</th>
                  <th>Цена</th>
                  <th>Кол-во</th>
                  <th>Сумма</th>
                  <th>Статус позиции</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titleSnapshot}</td>
                    <td>{item.skuSnapshot || '—'}</td>
                    <td>{formatPrice(Number(item.priceSnapshot))}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {formatPrice(Number(item.priceSnapshot) * item.quantity)}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}