import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Marketplace на Next.js + NestJS</h1>
        <p className="mt-4 text-lg text-slate-600">
          Покупатели оформляют заказы, продавцы управляют товарами, администратор рулит системой без священных костылей.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/catalog" className="rounded-xl bg-black px-5 py-3 text-white">
            Перейти в каталог
          </Link>
          <Link href="/register" className="rounded-xl border px-5 py-3">
            Создать аккаунт
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="grid gap-3">
          <div className="rounded-2xl bg-slate-100 p-4">Buyer: каталог, корзина, заказы</div>
          <div className="rounded-2xl bg-slate-100 p-4">Seller: товары и заказы по ним</div>
          <div className="rounded-2xl bg-slate-100 p-4">Admin: пользователи, товары, статусы заказов</div>
        </div>
      </div>
    </section>
  );
}