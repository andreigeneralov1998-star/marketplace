import { LoginForm } from '@/components/forms/login-form';

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Вход</h1>
      <LoginForm />
    </section>
  );
}