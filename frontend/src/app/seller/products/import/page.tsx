'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function SellerImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleDownloadTemplate = async () => {
    try {
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
      setError('Выбери CSV-файл');
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
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Загрузка через Excel</h1>
        <p className="mt-2 text-slate-600">
          Загрузите CSV-файл с товарами. После загрузки товары уйдут на модерацию
          и не будут отображаться на сайте, пока администратор их не подтвердит.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 space-y-4">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="rounded-xl border border-black px-5 py-3"
        >
          Скачать шаблон
        </button>

        <div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : 'Отправить'}
        </button>

        {error ? <div className="text-red-600">{error}</div> : null}

        {result ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <div>Создано товаров: {result.createdCount}</div>
            <div>Ошибок: {result.errorCount}</div>

            {result.errors?.length ? (
              <div>
                <div className="mb-2 font-semibold">Ошибки:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {result.errors.map((item: any, index: number) => (
                    <li key={index}>
                      Строка {item.row}: {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}