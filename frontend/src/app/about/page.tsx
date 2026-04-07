export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-sm font-medium text-[#B45309]">
            О платформе
          </div>

          <h1 className="mt-4 text-[32px] font-bold leading-[40px] text-[#111827]">
            О нас
          </h1>

          <p className="mt-4 text-[16px] leading-7 text-[#6B7280]">
            rnk.by — это маркетплейс для сервисных центров и мастеров по ремонту
            мобильной техники. Мы помогаем продавать и находить запчасти быстрее,
            удобнее и понятнее.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
              <div className="text-sm font-semibold text-[#111827]">
                Для продавцов
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Возможность разместить свои позиции и находить новых покупателей
                среди профильной аудитории.
              </p>
            </div>

            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
              <div className="text-sm font-semibold text-[#111827]">
                Для покупателей
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Удобный поиск нужных деталей, понятные карточки товаров и работа
                только с профильным рынком.
              </p>
            </div>

            <div className="rounded-[20px] border border-[#E5E7EB] bg-[#F9FAFB] p-5">
              <div className="text-sm font-semibold text-[#111827]">
                Наша цель
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Сделать рынок запчастей для ремонта мобильной техники более
                прозрачным, быстрым и современным.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[20px] border border-[#E5E7EB] bg-[#F7F8FA] p-6">
            <h2 className="text-[20px] font-semibold leading-7 text-[#111827]">
              Почему это удобно
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6B7280]">
              <li>— единая площадка для профильных продавцов и мастеров;</li>
              <li>— быстрый доступ к актуальным предложениям;</li>
              <li>— удобный личный кабинет и управление товарами;</li>
              <li>— понятная структура без лишнего визуального шума.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}