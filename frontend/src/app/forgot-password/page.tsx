'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setError('Заполните все поля');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/forgot-password', {
        username: form.username,
        email: form.email,
        phone: form.phone,
        newPassword: form.newPassword,
      });

      setSuccess('Пароль успешно изменён');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Не удалось восстановить пароль';

      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Восстановление пароля</h1>
        <p className="mt-2 text-sm text-gray-500">
          Укажите логин, почту и номер телефона аккаунта
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Логин"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-amber-500"
          />

          <input
            type="email"
            placeholder="Почта"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-amber-500"
          />

          <input
            type="text"
            placeholder="Номер телефона"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-amber-500"
          />

          <input
            type="password"
            placeholder="Новый пароль"
            value={form.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-amber-500"
          />

          <input
            type="password"
            placeholder="Повторите новый пароль"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-amber-500"
          />

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-amber-500 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Проверяем...' : 'Сменить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
}