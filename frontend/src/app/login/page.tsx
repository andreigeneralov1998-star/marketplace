import { Suspense } from 'react';
import { LoginForm } from '@/components/forms/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Вход</h1>

      <Suspense fallback={<div>Загрузка...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-3 text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Забыли пароль?
        </Link>
      </div>
    </section>
  );
}