'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { getSellerProfile, updateSellerProfile } from '@/shared/api/users';

type ProfileState = {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  city: string;
  warehouseAddress: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string | null;
};

export default function SellerProfilePage() {
  const [form, setForm] = useState<ProfileState>({
    lastName: '',
    firstName: '',
    middleName: '',
    phone: '',
    city: '',
    warehouseAddress: '',
    storeName: '',
    storeDescription: '',
    storeLogo: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSellerProfile();

        setForm({
          lastName: data.lastName || '',
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          phone: data.phone || '',
          city: data.city || '',
          warehouseAddress: data.warehouseAddress || '',
          storeName: data.storeName || '',
          storeDescription: data.storeDescription || '',
          storeLogo: data.storeLogo || '',
        });

        setProfileComplete(!!data.isProfileComplete);
      } catch (e: any) {
        setMessage(e?.response?.data?.message || 'Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const fd = new FormData();
      fd.append('lastName', form.lastName);
      fd.append('firstName', form.firstName);
      fd.append('middleName', form.middleName);
      fd.append('phone', form.phone);
      fd.append('city', form.city);
      fd.append('warehouseAddress', form.warehouseAddress);
      fd.append('storeName', form.storeName);
      fd.append('storeDescription', form.storeDescription);

      if (logoFile) {
        fd.append('logo', logoFile);
      }

      const data = await updateSellerProfile(fd);

      setForm((prev) => ({
        ...prev,
        storeLogo: data.storeLogo || prev.storeLogo,
      }));

      setProfileComplete(!!data.isProfileComplete);
      setMessage('Профиль успешно сохранён');
    } catch (e: any) {
      setMessage(e?.response?.data?.message || 'Ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="h-8 w-52 animate-pulse rounded bg-[#F3F4F6]" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-[#F3F4F6]" />
        </div>

        <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="mb-2 h-4 w-28 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-11 animate-pulse rounded-xl bg-[#F3F4F6]" />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="h-28 animate-pulse rounded-xl bg-[#F3F4F6]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h1 className="text-[32px] font-bold leading-10 text-[#111827]">
          Профиль продавца
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Заполните информацию о продавце и магазине. Эти данные используются
          для отображения витрины и повышения доверия покупателей.
        </p>
      </div>

      {!profileComplete && (
        <div className="rounded-[20px] border border-[#FCD34D] bg-[#FFF8DB] p-4 text-sm text-[#92400E] shadow-sm">
          Заполните обязательные поля профиля. Пока профиль не заполнен
          полностью, магазин может не отображаться покупателям.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Фамилия
            </label>
            <input
              name="lastName"
              placeholder="Введите фамилию"
              value={form.lastName}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Имя
            </label>
            <input
              name="firstName"
              placeholder="Введите имя"
              value={form.firstName}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Отчество
            </label>
            <input
              name="middleName"
              placeholder="Введите отчество"
              value={form.middleName}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Номер телефона
            </label>
            <input
              name="phone"
              placeholder="Введите номер телефона"
              value={form.phone}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Город
            </label>
            <input
              name="city"
              placeholder="Введите город"
              value={form.city}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#111827]">
              Адрес склада / магазина
            </label>
            <input
              name="warehouseAddress"
              placeholder="Введите адрес склада или магазина"
              value={form.warehouseAddress}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              required
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                Название магазина на маркетплейсе
              </label>
              <input
                name="storeName"
                placeholder="Введите название магазина"
                value={form.storeName}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#111827]">
                О магазине
              </label>
              <textarea
                name="storeDescription"
                placeholder="Кратко расскажите о магазине, ассортименте и преимуществах"
                value={form.storeDescription}
                onChange={handleChange}
                className="min-h-[140px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <label className="block text-sm font-medium text-[#111827]">
              Логотип магазина
            </label>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
                {form.storeLogo ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${form.storeLogo}`}
                    alt="Логотип магазина"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-[#9CA3AF]">
                    Нет logo
                  </span>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-[#6B7280] file:mr-4 file:h-11 file:rounded-xl file:border-0 file:bg-[#FFF4DD] file:px-4 file:text-sm file:font-semibold file:text-[#111827] hover:file:bg-[#FFECC4]"
                />
                <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                  Поддерживаются JPG, PNG, WEBP.
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm ${
              message.toLowerCase().includes('успеш')
                ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
                : 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-6">
          <p className="text-sm text-[#6B7280]">
            После сохранения обновится информация о вашем магазине.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
}