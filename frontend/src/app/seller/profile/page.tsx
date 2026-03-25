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
  profileComplete?: boolean;
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
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Профиль</h1>
      {!profileComplete && (
        <div className="mb-4 rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-sm">
          Заполните обязательные поля профиля. Пока профиль не заполнен полностью,
          магазин может не отображаться покупателям.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="lastName"
          placeholder="Фамилия"
          value={form.lastName}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <input
          name="firstName"
          placeholder="Имя"
          value={form.firstName}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <input
          name="middleName"
          placeholder="Отчество"
          value={form.middleName}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <input
          name="phone"
          placeholder="Номер телефона"
          value={form.phone}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <input
          name="city"
          placeholder="Город"
          value={form.city}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <input
          name="warehouseAddress"
          placeholder="Адрес склада / магазина"
          value={form.warehouseAddress}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <input
          name="storeName"
          placeholder="Название магазина на маркетплейсе"
          value={form.storeName}
          onChange={handleChange}
          className="w-full rounded border p-3"
          required
        />

        <textarea
          name="storeDescription"
          placeholder="О Вас"
          value={form.storeDescription}
          onChange={handleChange}
          className="min-h-[120px] w-full rounded border p-3"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Логотип магазина
          </label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleLogoChange}
            className="w-full rounded border p-3"
          />

          {form.storeLogo && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${form.storeLogo}`}
              alt="Логотип магазина"
              className="h-20 w-20 rounded object-cover border"
            />
          )}
        </div>

        {message && (
          <div className="rounded border p-3 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-black px-5 py-3 text-white disabled:opacity-60"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}