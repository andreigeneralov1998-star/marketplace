import Link from 'next/link';
import { ProductForm } from '@/components/forms/product-form';

export default function NewSellerProductPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#F5A623]">Seller cabinet</p>
            <h1 className="mt-2 text-[32px] font-bold leading-10 text-[#111827]">
              Новый товар
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Заполните карточку товара для размещения на маркетплейсе. После
              сохранения товар уйдёт на модерацию и появится на сайте только
              после подтверждения администратором.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/seller"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Назад в кабинет
            </Link>

            <Link
              href="/seller/products/import"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FFF4DD] px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#FFECC4]"
            >
              Загрузка через Excel
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-full bg-[#F9FAFB] px-4 py-2 text-sm text-[#374151]">
            До 3 изображений
          </div>
          <div className="rounded-full bg-[#F9FAFB] px-4 py-2 text-sm text-[#374151]">
            SKU нельзя менять после создания
          </div>
          <div className="rounded-full bg-[#F9FAFB] px-4 py-2 text-sm text-[#374151]">
            После изменений нужна модерация
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold leading-8 text-[#111827]">
              Данные товара
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Укажите основную информацию, характеристики и загрузите
              изображения. Заполняйте карточку аккуратно — это влияет на
              конверсию и доверие покупателей.
            </p>
          </div>

          <ProductForm />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111827]">
              Что важно проверить
            </h3>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6B7280]">
              <li>Название товара должно быть понятным и точным.</li>
              <li>Категория обязательна для публикации.</li>
              <li>Цена и наличие должны быть актуальными.</li>
              <li>Добавьте качественные фотографии товара.</li>
              <li>Описание должно кратко раскрывать преимущества.</li>
            </ul>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-[#FFF8E8] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111827]">
              Модерация товара
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Новые товары не публикуются автоматически. После создания карточка
              отправляется на проверку администратору и появляется на сайте
              только после подтверждения.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}