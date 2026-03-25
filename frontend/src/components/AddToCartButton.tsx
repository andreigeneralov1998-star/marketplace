'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { ProductDetails } from '@/types';
import { createPortal } from "react-dom";

export default function AddToCartButton({ product }: { product: ProductDetails }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setShowAuthModal(true);
        return;
      }

      const res = await fetch('http://localhost:4000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        toast.success('Товар добавлен в корзину');
        return;
      }

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        setShowAuthModal(true);
        return;
      }

      let message = 'Ошибка добавления в корзину';

      try {
        const error = await res.json();
        message =
          typeof error?.message === 'string'
            ? error.message
            : Array.isArray(error?.message)
            ? error.message.join(', ')
            : message;
      } catch {}

      toast.error(message);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      toast.error('Сервер недоступен или произошла ошибка сети');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-6 rounded-xl bg-black px-6 py-3 text-white transition hover:opacity-90"
      >
        Добавить в корзину
      </button>

      {showAuthModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowAuthModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold">
                Для заказа войдите или зарегистрируйтесь
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Чтобы добавить товар в корзину, нужно войти в аккаунт
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-xl bg-black px-4 py-2 text-center text-white"
                >
                  Вход
                </Link>

                <Link
                  href="/register"
                  className="flex-1 rounded-xl border px-4 py-2 text-center"
                >
                  Регистрация
                </Link>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 w-full text-sm text-slate-500"
              >
                Закрыть
              </button>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}