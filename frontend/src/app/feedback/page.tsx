'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successText, setSuccessText] = useState('');
  const [errorText, setErrorText] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSuccessText('');
    setErrorText('');

    try {
      setIsLoading(true);

      await api.post('/feedback', {
        name,
        contact,
        message,
      });

      setName('');
      setContact('');
      setMessage('');
      setSuccessText('Сообщение успешно отправлено.');
    } catch (error) {
      setErrorText('Не удалось отправить сообщение. Попробуйте еще раз.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-[#FFF4DD] px-3 py-1 text-sm font-medium text-[#B45309]">
            Контакт с нами
          </div>

          <h1 className="mt-4 text-[32px] font-bold leading-[40px] text-[#111827]">
            Обратная связь
          </h1>

          <p className="mt-4 text-[16px] leading-7 text-[#6B7280]">
            Напишите нам вопрос, предложение или сообщение о проблеме.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Ваше имя
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Email или телефон
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Введите email или телефон"
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Сообщение
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите вопрос или проблему"
                className="min-h-[140px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#111827] px-6 text-sm font-semibold text-white transition hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Отправка...' : 'Отправить сообщение'}
            </button>

            {successText && (
              <div className="rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
                {successText}
              </div>
            )}

            {errorText && (
              <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
                {errorText}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}