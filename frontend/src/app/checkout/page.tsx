"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const handleOrder = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Сначала войдите в аккаунт");
      window.location.href = "/login";
      return;
    }

    const res = await fetch("http://localhost:4000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName,
        phone,
        address,
        comment,
      }),
    });

    if (res.ok) {
      alert("Заказ создан");
      window.location.href = "/account/orders";
    } else if (res.status === 401) {
      alert("Сессия истекла. Войдите заново");
      window.location.href = "/login";
    } else {
      const error = await res.json().catch(() => null);
      alert(error?.message || "Ошибка создания заказа");
    }
  };

  return (
    <section className="max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Оформление заказа</h1>

      <input
        placeholder="ФИО"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="mb-3 w-full rounded-xl border p-3"
      />

      <input
        placeholder="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="mb-3 w-full rounded-xl border p-3"
      />

      <input
        placeholder="Адрес доставки"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="mb-3 w-full rounded-xl border p-3"
      />

      <textarea
        placeholder="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3 w-full rounded-xl border p-3"
      />

      <button
        onClick={handleOrder}
        className="rounded-xl bg-black px-6 py-3 text-white"
      >
        Подтвердить заказ
      </button>
    </section>
  );
}