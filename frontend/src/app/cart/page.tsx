"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const loadCart = async () => {
    const token = localStorage.getItem("accessToken");

    const res = await fetch("http://localhost:4000/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();

    setItems(data.items);
    setTotal(data.total);
  };

  const handleRemove = async (itemId: string) => {
    const token = localStorage.getItem("accessToken");

    await fetch(`http://localhost:4000/api/cart/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadCart();
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <section className="p-6">

      <h1 className="mb-6 text-3xl font-bold">
        Корзина
      </h1>

      {items.length === 0 && <p>Корзина пуста</p>}

      {items.map((item) => (

        <div
          key={item.id}
          className="mb-4 rounded-xl border p-4"
        >

          <h3 className="font-semibold">
            {item.product.title}
          </h3>

          <p>
            {item.product.price} BYN
          </p>

          <p>
            Количество: {item.quantity}
          </p>

          <button
            onClick={() => handleRemove(item.id)}
            className="mt-2 text-red-500"
          >
            Удалить
          </button>

        </div>
      ))}

      {items.length > 0 && (
        <>
          <h2 className="mt-6 text-xl font-bold">
            Итого: {total} BYN
          </h2>

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