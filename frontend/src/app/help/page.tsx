const faq = [
  {
    question: 'Как купить товар?',
    answer:
      'Выберите нужную позицию в каталоге, откройте карточку товара, добавьте ее в корзину и перейдите к оформлению заказа.',
  },
  {
    question: 'Как стать продавцом?',
    answer:
      'Перейдите в раздел "Стать продавцом", заполните данные магазина и отправьте заявку. После проверки вы получите доступ к кабинету продавца.',
  },
  {
    question: 'Как управлять своими товарами?',
    answer:
      'После одобрения аккаунта продавца вы сможете добавлять, редактировать и отслеживать свои позиции через личный кабинет.',
  },
  {
    question: 'Что делать, если возникла проблема с заказом?',
    answer:
      'Перейдите на страницу "Обратная связь" и отправьте сообщение. Укажите как можно больше деталей по ситуации.',
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-sm font-medium text-[#B45309]">
            Поддержка
          </div>

          <h1 className="mt-4 text-[32px] font-bold leading-[40px] text-[#111827]">
            Помощь
          </h1>

          <p className="mt-4 text-[16px] leading-7 text-[#6B7280]">
            Здесь собраны ответы на базовые вопросы по работе с маркетплейсом.
          </p>

          <div className="mt-8 space-y-4">
            {faq.map((item) => (
              <div
                key={item.question}
                className="rounded-[20px] border border-[#E5E7EB] bg-[#F9FAFB] p-5"
              >
                <h2 className="text-base font-semibold text-[#111827]">
                  {item.question}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}