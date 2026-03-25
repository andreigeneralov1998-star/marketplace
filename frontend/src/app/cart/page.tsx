'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: string;
    stock: number;
    slug: string;
    imageUrl?: string | null;
    images?: { id: string; url: string }[];
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setItems([]);
        return;
      }

      const res = await fetch('http://localhost:4000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        setItems([]);
        return;
      }

      const data = await res.json();

      const parsedItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setItems(parsedItems);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setUpdatingItemId(itemId);

    try {
      const res = await fetch(`http://localhost:4000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = async (itemId: string, nextQuantity: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem) return;

    if (nextQuantity < 1) {
      await handleRemove(itemId);
      return;
    }

    if (nextQuantity > currentItem.product.stock) {
      alert(`Доступно только ${currentItem.product.stock} шт.`);
      return;
    }

    setUpdatingItemId(itemId);

    try {
      const res = await fetch(`http://localhost:4000/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: nextQuantity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.message || 'Не удалось обновить количество');
        return;
      }

      const updatedItem = await res.json();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: updatedItem.quantity ?? nextQuantity,
              }
            : item,
        ),
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);
  }, [items]);

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <section className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Корзина</h1>

      {isLoading && <p>Загрузка корзины...</p>}

      {!isLoading && items.length === 0 && <p>Корзина пуста</p>}

      {items.map((item) => {
        const itemTotal = Number(item.product.price) * item.quantity;
        const isUpdating = updatingItemId === item.id;

        const rawImage =
          item.product.images?.[0]?.url ||
          item.product.imageUrl ||
          '/uploads/placeholders/no-photo.png';

        const imageSrc = rawImage.startsWith('http')
          ? rawImage
          : `http://localhost:4000${rawImage}`;

        return (
          <div key={item.id} className="mb-4 rounded-xl border p-4">
            <div className="flex gap-4">
                <img
                  src={imageSrc}
                  alt={item.product.title}
                  className="h-24 w-24 rounded-xl border object-cover"
                />
              <div className="flex-1">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="font-semibold hover:underline"
                >
                  {item.product.title}
                </Link>

                <p className="mt-1">{item.product.price} BYN</p>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={isUpdating}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-lg disabled:opacity-50"
                  >
                    -
                  </button>

                  <span className="min-w-[24px] text-center font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    disabled={isUpdating || item.quantity >= item.product.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border text-lg disabled:opacity-50"
                  >
                    +
                  </button>

                  <span className="text-sm text-slate-500">
                    В наличии: {item.product.stock}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Сумма: {itemTotal} BYN
                </p>

                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isUpdating}
                  className="mt-3 text-sm text-red-500 hover:underline disabled:opacity-50"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {items.length > 0 && (
        <>
          <h2 className="mt-6 text-xl font-bold">Итого: {total} BYN</h2>

          <Link
            href="/checkout"
            className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-white"
          >
            Оформить заказ
          </Link>
        </>
      )}
    </section>
  );
}