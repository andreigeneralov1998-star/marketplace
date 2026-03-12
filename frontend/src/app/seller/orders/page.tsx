'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Order {
  id: string;
  status: string;
  createdAt: string;
  buyer: {
    email: string;
  };
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/seller/my');
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Загрузка заказов...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Заказы покупателей</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Покупатель</th>
            <th>Статус</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.buyer?.email}</td>
              <td>{order.status}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                <Link href={`/seller/orders/${order.id}`}>
                  открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}