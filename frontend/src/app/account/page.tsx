'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const statusMap:any = {
  PENDING: "Новый",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён"
};

export default function AccountPage() {
  const { user, fetchMe } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchMe().catch(() => undefined);
    api.get('/orders/my').then((res) => setOrders(res.data));
  }, [fetchMe]);

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <p className="mt-2">Email: {user?.email}</p>
        <p>Роль: {user?.role}</p>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">История заказов</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} style={{
              border: "1px solid #ddd",
              padding: 16,
              marginBottom: 20,
              borderRadius: 8
            }}>

              <div style={{ marginBottom: 10 }}>
                <strong>Заказ #{order.id.slice(-6)}</strong>
              </div>

              <div style={{ fontSize: 14, color: "#666" }}>
                {new Date(order.createdAt).toLocaleString()}
              </div>

              <div style={{ marginTop: 10 }}>
                {order.items.map((item:any) => (
                  <div key={item.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6
                  }}>
                    <span>
                      {item.titleSnapshot}
                      {" "}
                      x{item.quantity}
                    </span>

                    <span>
                      {Number(item.priceSnapshot) * item.quantity} ₽
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <b>Статус:</b> {statusMap[order.status] || order.status}
              </div>

              <div>
                <b>Сумма:</b> {order.totalAmount} ₽
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}