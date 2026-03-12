import { RegisterForm } from '@/components/forms/register-form';

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Регистрация</h1>
      <RegisterForm />
    </section>
  );
}