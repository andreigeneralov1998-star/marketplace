'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { loginSchema } from '@/schemas/auth.schemas';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    await login(values.username, values.password);
    router.push(redirectTo);
  };

  return (
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
  );
}