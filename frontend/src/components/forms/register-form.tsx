'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { registerSchema } from '@/schemas/auth.schemas';

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    await registerUser(values as Record<string, string>);
    router.push('/account');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <input
        {...register('fullName')}
        placeholder="ФИО полностью"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        {...register('username')}
        placeholder="Логин"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        {...register('phone')}
        placeholder="Номер телефона"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        {...register('email')}
        placeholder="Электронная почта"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        type="password"
        {...register('password')}
        placeholder="Пароль"
        className="w-full rounded-xl border px-4 py-3"
      />

      {Object.values(errors).map((error, index) => (
        <p key={index} className="text-sm text-red-500">
          {error?.message as string}
        </p>
      ))}

      <button
        disabled={isSubmitting}
        className="w-full rounded-xl bg-black px-4 py-3 text-white"
      >
        Зарегистрироваться
      </button>
    </form>
  );
}