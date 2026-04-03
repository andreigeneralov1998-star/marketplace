'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/store/auth-store';
import SellerProfileForm from '@/components/seller/seller-profile-form';
import { applyForSeller, getMySellerApplication } from '@/lib/api';

type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type SellerApplication = {
  id: number;
  userId: string;
  status: SellerApplicationStatus;
  lastName: string;
  firstName: string;
  middleName?: string | null;
  phone: string;
  city: string;
  warehouseAddress: string;
  storeName: string;
  storeSlug: string;
  storeDescription?: string | null;
  storeLogo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SellerProfilePage() {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();

  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    city: '',
    warehouseAddress: '',
    storeName: '',
    storeDescription: '',
  });

  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchMe();
        const currentUser = useAuthStore.getState().user;

        if (!currentUser) {
          setLoading(false);
          return;
        }

        if (currentUser.role === 'SELLER') {
          setLoading(false);
          return;
        }

        if (currentUser.role === 'BUYER') {
          try {
            const data = await getMySellerApplication();

            if (data) {
              setApplication(data);
              setForm({
                lastName: data.lastName || '',
                firstName: data.firstName || '',
                middleName: data.middleName || '',
                phone: data.phone || '',
                city: data.city || '',
                warehouseAddress: data.warehouseAddress || '',
                storeName: data.storeName || '',
                storeDescription: data.storeDescription || '',
              });
            }
          } catch {
            // если заявки нет — это норм
          }
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchMe]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogo(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('lastName', form.lastName);
      formData.append('firstName', form.firstName);
      formData.append('middleName', form.middleName);
      formData.append('phone', form.phone);
      formData.append('city', form.city);
      formData.append('warehouseAddress', form.warehouseAddress);
      formData.append('storeName', form.storeName);
      formData.append('storeDescription', form.storeDescription);

      if (logo) {
        formData.append('logo', logo);
      }

      await applyForSeller(formData);

      const updated = await getMySellerApplication();
      setApplication(updated);

      toast.success('Заявка отправлена');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Не удалось отправить заявку';

      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="grid gap-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          Загрузка...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="grid gap-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          Нужно войти в аккаунт
        </div>
      </section>
    );
  }

  if (user.role === 'SELLER') {
    return <SellerProfileForm />;
  }

  if (application?.status === 'PENDING') {
    return (
      <section className="grid gap-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <h1 className="text-2xl font-bold text-[#111827]">Заявка отправлена</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Ваша заявка на получение роли продавца находится на рассмотрении.
          </p>
        </div>
      </section>
    );
  }

  if (application?.status === 'APPROVED') {
    return (
      <section className="grid gap-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
          <h1 className="text-2xl font-bold text-[#111827]">Заявка одобрена</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Ваша заявка подтверждена. Обновите страницу или войдите заново.
          </p>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512]"
          >
            Обновить страницу
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[#111827]">Стать продавцом</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Заполните данные магазина. После подтверждения администратором ваш аккаунт станет продавцом.
        </p>

        {application?.status === 'REJECTED' && (
          <div className="mt-4 rounded-2xl border border-[#F3D0D0] bg-[#FEF3F2] px-4 py-3 text-sm font-medium text-[#B42318]">
            Предыдущая заявка была отклонена. Исправьте данные и отправьте повторно.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Фамилия"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            required
          />

          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Имя"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            required
          />

          <input
            name="middleName"
            value={form.middleName}
            onChange={handleChange}
            placeholder="Отчество"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Телефон"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            required
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Город"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            required
          />

          <input
            name="warehouseAddress"
            value={form.warehouseAddress}
            onChange={handleChange}
            placeholder="Адрес склада"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            required
          />

          <input
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            placeholder="Название магазина"
            className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
            required
          />

          <textarea
            name="storeDescription"
            value={form.storeDescription}
            onChange={handleChange}
            placeholder="Описание магазина"
            className="min-h-[140px] rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:shadow-[0_0_0_4px_rgba(245,166,35,0.14)]"
          />

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827]"
          />

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </section>
  );
}