'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SellerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/products/seller/my').then((res) => setProducts(res.data));
    api.get('/orders/seller/my').then((res) => setOrders(res.data));
  }, []);

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/seller/products/new"
          className="rounded-xl bg-black px-5 py-3 text-white"
        >
          Добавить товар
        </Link>

        <Link
          href="/seller/products/import"
          className="rounded-xl border border-black px-5 py-3 text-black"
        >
          Загрузка через Excel
        </Link>
      </div>
      <div className="mb-5 flex flex-wrap gap-4">
        <Link href="/seller/orders" className="rounded-xl border px-4 py-2">
          Заказы покупателей
        </Link>

        <Link href="/seller/balance" className="rounded-xl border px-4 py-2">
          Баланс
        </Link>

        <Link href="/seller/profile" className="rounded-xl border px-4 py-2">
          Профиль
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6">Товаров: {products.length}</div>
        <div className="rounded-2xl border bg-white p-6">Заказов: {orders.length}</div>
        <div className="rounded-2xl border bg-white p-6">Доступ: seller</div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Мои товары</h2>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                </div>
                <div>Наличие: {product.stock}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}