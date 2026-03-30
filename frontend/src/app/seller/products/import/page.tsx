'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';

export default function SellerImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const fileMeta = useMemo(() => {
    if (!file) return null;

    const sizeMb = (file.size / 1024 / 1024).toFixed(2);

    return {
      name: file.name,
      size: `${sizeMb} MB`,
    };
  }, [file]);

  const handleDownloadTemplate = async () => {
    try {
      setError('');

      const res = await api.get('/products/seller/csv-template', {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      setError('Не удалось скачать шаблон');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Выберите CSV-файл перед отправкой');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/products/seller/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ошибка загрузки файла');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[#F5A623]">Seller cabinet</p>
            <h1 className="mt-2 text-[32px] font-bold leading-10 text-[#111827]">
              Загрузка товаров через Excel
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Используйте CSV-шаблон для массового добавления товаров. После
              загрузки позиции создаются в системе и отправляются на модерацию.
              До подтверждения администратора товары не отображаются на сайте.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/seller/products/new"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Добавить вручную
            </Link>

            <Link
              href="/seller"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Назад в кабинет
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">
                  Шаг 1. Скачайте шаблон
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Скачайте готовый CSV-файл с правильными заголовками полей,
                  заполните его и затем загрузите обратно на сайт.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#FFF4DD] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#FFECC4]"
              >
                Скачать шаблон
              </button>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">
                Шаг 2. Загрузите заполненный файл
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Поддерживается CSV. Проверьте, чтобы обязательные поля были
                заполнены корректно.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-6">
              <label className="flex cursor-pointer flex-col items-center justify-center text-center">
                <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#374151] shadow-sm">
                  Выбрать CSV-файл
                </div>

                <p className="mt-4 text-sm text-[#6B7280]">
                  Нажмите, чтобы выбрать файл с компьютера
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              {fileMeta && (
                <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <div className="text-sm font-semibold text-[#111827]">
                    {fileMeta.name}
                  </div>
                  <div className="mt-1 text-sm text-[#6B7280]">
                    Размер файла: {fileMeta.size}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Загрузка...' : 'Отправить файл'}
              </button>

              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                    setError('');
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
                >
                  Очистить
                </button>
              )}
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
                <h3 className="text-lg font-semibold text-[#111827]">
                  Результат загрузки
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                    <div className="text-sm text-[#6B7280]">Создано товаров</div>
                    <div className="mt-2 text-2xl font-bold text-[#111827]">
                      {result.createdCount ?? 0}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                    <div className="text-sm text-[#6B7280]">Ошибок</div>
                    <div className="mt-2 text-2xl font-bold text-[#111827]">
                      {result.errorCount ?? 0}
                    </div>
                  </div>
                </div>

                {result.errors?.length ? (
                  <div className="mt-5 rounded-2xl border border-[#FECACA] bg-white p-4">
                    <div className="text-sm font-semibold text-[#991B1B]">
                      Ошибки при обработке файла
                    </div>

                    <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
                      {result.errors.map((item: any, index: number) => (
                        <li
                          key={index}
                          className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] px-3 py-2"
                        >
                          <span className="font-medium text-[#111827]">
                            Строка {item.row}:
                          </span>{' '}
                          {item.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111827]">
              Что должно быть в файле
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6B7280]">
              <li>Название товара</li>
              <li>Артикул / SKU</li>
              <li>Категория</li>
              <li>Цена</li>
              <li>Остаток</li>
              <li>Описание и другие поля по шаблону</li>
            </ul>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-[#FFF8E8] p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111827]">
              Важно
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Если часть строк заполнена с ошибками, система покажет, какие
              именно позиции не удалось обработать. Исправьте их в файле и
              загрузите CSV повторно.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}