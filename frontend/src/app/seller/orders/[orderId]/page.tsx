'use client';
import {
  OrderStatus,
  ORDER_STATUS_COLORS,
  getOrderStatusLabel,
} from '@/lib/order-status';
import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface OrderUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

interface OrderItem {
  id: string;
  productId: string;
  sellerId: string;
  titleSnapshot: string;
  skuSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  status: OrderStatus;
}

interface SellerOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  sellerTotal: number;
  fullName: string;
  phone: string;
  deliveryMethod?: 'EMS' | 'EUROPOCHTA' | 'BELPOCHTA' | 'PICKUP_TOPSET' | null;
  address: string;
  comment?: string | null;
  user?: OrderUser;
  items: OrderItem[];
}



function getDeliveryMethodLabel(method?: string | null) {
  switch (method) {
    case 'EMS':
      return 'EMS';
    case 'EUROPOCHTA':
      return 'Европочта';
    case 'BELPOCHTA':
      return 'Белпочта';
    case 'PICKUP_TOPSET':
      return 'Самовывоз TOPSET';
    default:
      return '—';
  }
}
function getSellerActions(status: OrderStatus) {
  switch (status) {
    case 'PENDING':
      return [
        { value: 'PROCESSING' as OrderStatus, label: 'Принять' },
        { value: 'OUT_OF_STOCK' as OrderStatus, label: 'Отсутствует' },
      ];

    case 'PROCESSING':
      return [
        { value: 'SHIPPED' as OrderStatus, label: 'Отправить' },
        { value: 'OUT_OF_STOCK' as OrderStatus, label: 'Отсутствует' },
      ];

    case 'SHIPPED':
    case 'OUT_OF_STOCK':
      return [];

    default:
      return [];
  }
}

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

export default function SellerOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);

  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      setError('');
      const { data } = await api.get(`/orders/seller/${orderId}`);
      setOrder(data);
    } catch (err) {
      console.error('Ошибка загрузки заказа:', err);
      setError('Не удалось загрузить заказ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const updateItemStatus = async (itemId: string, status: OrderStatus) => {
    if (!order) return;

    const previousOrder = order;

    setSavingItemId(itemId);

    setOrder({
      ...order,
      items: order.items.map((item) =>
        item.id === itemId ? { ...item, status } : item,
      ),
    });

    try {
      await api.patch(`/orders/seller/items/${itemId}/status`, { status });
      const { data } = await api.get(`/orders/seller/${orderId}`);
      setOrder(data);
    } catch (err) {
      console.error('Ошибка обновления статуса позиции:', err);
      setOrder(previousOrder);
      alert('Не удалось обновить статус позиции');
    } finally {
      setSavingItemId(null);
    }
  };

  const sellerItemsTotal = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce(
      (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
      0,
    );
  }, [order]);

  const itemsCount = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);

  const printOrder = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Загрузка заказа...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p>{error}</p>
        <Link href="/seller/orders">← Назад к заказам</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 20 }}>
        <p>Заказ не найден.</p>
        <Link href="/seller/orders">← Назад к заказам</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/seller/orders">← Назад к заказам</Link>

        <button
          onClick={printOrder}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #d1d5db',
            background: '#111827',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Распечатать заказ
        </button>
      </div>

      <h1 style={{ marginBottom: 20 }}>Заказ #{order.id}</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <InfoCard title="Сводка">
          <InfoRow label="Статус заказа" value={<StatusBadge status={order.status} />} />
          <InfoRow
            label="Дата"
            value={new Date(order.createdAt).toLocaleString()}
          />
          <InfoRow label="Позиций" value={order.items.length} />
          <InfoRow label="Штук товара" value={itemsCount} />
          <InfoRow label="Сумма продавца" value={sellerItemsTotal} />
          <InfoRow label="Общая сумма заказа" value={order.totalAmount} />
        </InfoCard>

        <InfoCard title="Покупатель">
          <InfoRow label="ФИО" value={order.fullName || '—'} />
          <InfoRow label="Телефон" value={order.phone || '—'} />
          <InfoRow label="Email" value={order.user?.email || '—'} />
          <InfoRow
            label="Способ доставки"
            value={getDeliveryMethodLabel(order.deliveryMethod)}
          />
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
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Позиции продавца</h2>

        {!order.items.length ? (
          <p>У этого заказа нет доступных вам позиций.</p>
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
                  <th>Статус</th>
                  <th>Быстрые действия</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titleSnapshot}</td>
                    <td>{item.skuSnapshot || '—'}</td>
                    <td>{item.priceSnapshot}</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.priceSnapshot) * item.quantity}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        {getSellerActions(item.status).length > 0 ? (
                          getSellerActions(item.status).map((statusOption) => {
                            const isSaving = savingItemId === item.id;

                            return (
                              <button
                                key={statusOption.value}
                                onClick={() => updateItemStatus(item.id, statusOption.value)}
                                disabled={isSaving}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  border: '1px solid #ccc',
                                  background:
                                    statusOption.value === 'OUT_OF_STOCK' ? '#fff7ed' : '#fff',
                                  color:
                                    statusOption.value === 'OUT_OF_STOCK' ? '#c2410c' : '#111',
                                  cursor: isSaving ? 'not-allowed' : 'pointer',
                                  opacity: isSaving ? 0.7 : 1,
                                }}
                              >
                                {statusOption.label}
                              </button>
                            );
                          })
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: 14 }}>
                            {item.status === 'SHIPPED'
                              ? 'Заказ уже отправлен'
                              : item.status === 'OUT_OF_STOCK'
                              ? 'Товар отсутствует'
                              : 'Нет доступных действий'}
                          </span>
                        )}

                        {savingItemId === item.id ? (
                          <span style={{ alignSelf: 'center' }}>Сохранение...</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          a,
          button {
            display: none !important;
          }

          body {
            background: #fff !important;
          }
        }
      `}</style>
    </div>
  );
}