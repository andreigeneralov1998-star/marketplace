import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  Store,
  PackageSearch,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:gap-10">
      <section className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white p-6 md:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFF4DD] px-3 py-1.5 text-xs font-semibold text-[#1F2937]">
              <Sparkles className="h-3.5 w-3.5" />
              Маркетплейс запчастей и товаров для сервиса
            </div>

            <h1 className="max-w-3xl text-[32px] font-bold leading-[40px] text-[#111827] md:text-[40px] md:leading-[48px]">
              Рынок Бай — удобный marketplace, где товар, цена и доверие стоят на первом месте
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#6B7280] md:text-lg">
              Ищите нужные товары, сравнивайте предложения продавцов, оформляйте заказ
              быстро и без визуального шума. Платформа собрана для реальной торговли,
              а не для показухи.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#E69512]"
              >
                Перейти в каталог
              </Link>

              <Link
                href="/stores"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              >
                Смотреть магазины
              </Link>

              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#111827] px-6 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
              >
                Создать аккаунт
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
                <PackageSearch className="h-5 w-5 text-[#1F2937]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">Каталог без хаоса</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Удобный поиск, фильтры и аккуратная структура карточек помогают быстрее
                находить нужный товар.
              </p>
            </div>

            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
                <Store className="h-5 w-5 text-[#1F2937]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">Продавцы как часть системы</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Магазины и seller-кабинет встроены в единый интерфейс, без ощущения разных
                продуктов.
              </p>
            </div>

            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
                <ShieldCheck className="h-5 w-5 text-[#1F2937]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">Фокус на доверии</h3>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Прозрачная логика витрин, заказов и статусов делает работу площадки понятной
                для покупателя и продавца.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="mb-3 text-sm font-semibold text-[#6B7280]">01</div>
          <h3 className="text-lg font-semibold text-[#111827]">Находите товар быстрее</h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Структурированный каталог и понятные карточки без лишнего визуального шума.
          </p>
        </article>

        <article className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="mb-3 text-sm font-semibold text-[#6B7280]">02</div>
          <h3 className="text-lg font-semibold text-[#111827]">Сравнивайте продавцов</h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Магазины и витрины встроены в общую систему и читаются как часть одного продукта.
          </p>
        </article>

        <article className="rounded-[20px] border border-[#E5E7EB] bg-white p-5">
          <div className="mb-3 text-sm font-semibold text-[#6B7280]">03</div>
          <h3 className="text-lg font-semibold text-[#111827]">Двигайтесь без лишних шагов</h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Каталог, корзина, заказ и кабинет выстроены вокруг удобства действия, а не вокруг
            случайных блоков.
          </p>
        </article>
      </section>

      <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#111827]">Быстрый старт</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Основные направления внутри платформы
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/catalog"
            className="group rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#111827]">Каталог товаров</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Смотреть ассортимент, фильтровать и переходить к карточкам товаров.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6B7280] transition group-hover:text-[#111827]" />
            </div>
          </Link>

          <Link
            href="/stores"
            className="group rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#111827]">Все магазины</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Перейти к витринам продавцов и посмотреть предложения по магазинам.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6B7280] transition group-hover:text-[#111827]" />
            </div>
          </Link>

          <Link
            href="/seller/orders"
            className="group rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-[#111827]">Seller-кабинет</h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Управление товарами, заказами и магазином в едином интерфейсе.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6B7280] transition group-hover:text-[#111827]" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}