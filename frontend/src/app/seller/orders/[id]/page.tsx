'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';

interface Item {
  id: string;
  status: string;
  quantity: number;
  price: number;
  product: {
    title: string;
  };
}

interface Order {
  id: string;
  status: string;
  items: Item[];
}

export default function SellerOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  const load = async () => {
    const { data } = await api.get(`/orders/seller/${id}`);
    setOrder(data);
  };

  const updateStatus = async (itemId: string, status: string) => {
    await api.patch(`/orders/seller/items/${itemId}/status`, {
      status,
    });

    load();
  };

  useEffect(() => {
    load();
  }, []);

  if (!order) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Заказ {order.id}</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Товар</th>
            <th>Количество</th>
            <th>Цена</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.product.title}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.status}</td>

              <td>
                <button
                  onClick={() =>
                    updateStatus(item.id, 'PROCESSING')
                  }
                >
                  в работу
                </button>

                <button
                  onClick={() =>
                    updateStatus(item.id, 'SHIPPED')
                  }
                >
                  отправлен
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}