'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { loginSchema } from '@/schemas/auth.schemas';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';
  const { login } = useAuthStore();
  const [showInvalidModal, setShowInvalidModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.username, values.password);
      router.push(redirectTo);
    } catch (error: any) {
      const status = error?.response?.status;
      const message = String(
        error?.response?.data?.message || error?.message || ''
      ).toLowerCase();

      const isInvalidCredentials =
        status === 401 ||
        message.includes('invalid') ||
        message.includes('невер') ||
        message.includes('логин') ||
        message.includes('парол');

      if (isInvalidCredentials) {
        setShowInvalidModal(true);
        return;
      }

      console.error('Ошибка входа:', error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <input
          {...register('username')}
          placeholder="Логин"
          className="w-full rounded-xl border px-4 py-3"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}

        <input
          type="password"
          {...register('password')}
          placeholder="Пароль"
          className="w-full rounded-xl border px-4 py-3"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}

        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-black px-4 py-3 text-white"
        >
          Войти
        </button>
      </form>

      {showInvalidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              Неверный логин или пароль
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Проверьте введённые данные. Если не помните пароль, восстановите его.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowInvalidModal(false);
                  router.push('/forgot-password');
                }}
                className="h-11 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Забыли пароль
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowInvalidModal(false);
                  router.push('/login');
                }}
                className="h-11 flex-1 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Повторить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}