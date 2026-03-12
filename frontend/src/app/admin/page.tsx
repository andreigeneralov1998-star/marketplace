'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const load = async () => {
    const [usersRes, ordersRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/orders'),
    ]);

    setUsers(usersRes.data);
    setOrders(ordersRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const approveSeller = async (userId: string) => {
    await api.patch(`/admin/users/${userId}/approve-seller`);
    await load();
  };

  return (
    <section className="space-y-10">
      <div>
        <h1 className="mb-4 text-3xl font-bold">Админ-панель</h1>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Пользователи</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-slate-500">
                  {user.role} / seller approved: {String(user.isSellerApproved)}
                </p>
              </div>
              <button onClick={() => approveSeller(user.id)} className="rounded-lg bg-black px-4 py-2 text-white">
                Сделать seller
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Заказы</h2>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Заказ #{order.id}</p>
                  <p className="text-sm text-slate-500">Статус: {order.status}</p>
                </div>
                <div className="font-bold">{formatPrice(order.totalAmount)} ₽</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}