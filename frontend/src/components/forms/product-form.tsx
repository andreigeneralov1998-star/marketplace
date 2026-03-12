'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type FormValues = {
  title: string;
  slug?: string;
  sku: string;
  categoryId: string;
  price: string;
  stock: string;
  description: string;
};

export function ProductForm() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');
  };

  const uploadImage = async () => {
    if (!selectedFile) return '';

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsUploading(true);
    setError('');

    try {
      const { data } = await api.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedImageUrl(data.url);
      return data.url as string;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Не удалось загрузить изображение',
      );
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    setError('');

    try {
      let imageUrl = uploadedImageUrl;

      if (selectedFile && !uploadedImageUrl) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
        imageUrls: imageUrl ? [imageUrl] : [],
      };

      await api.post('/products', payload);

      reset();
      setSelectedFile(null);
      setUploadedImageUrl('');
      router.push('/seller');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось сохранить товар');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <input
        {...register('title')}
        placeholder="Название"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        {...register('slug')}
        placeholder="Slug (необязательно)"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        {...register('sku')}
        placeholder="Артикул"
        className="w-full rounded-xl border px-4 py-3"
      />

      <select
        {...register('categoryId')}
        className="w-full rounded-xl border px-4 py-3"
      >
        <option value="">Выберите категорию</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        {...register('price')}
        placeholder="Цена"
        className="w-full rounded-xl border px-4 py-3"
      />

      <input
        {...register('stock')}
        placeholder="Наличие"
        className="w-full rounded-xl border px-4 py-3"
      />

      <textarea
        {...register('description')}
        placeholder="Описание"
        className="w-full rounded-xl border px-4 py-3"
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium">Изображение товара</label>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="w-full rounded-xl border px-4 py-3"
        />

        {selectedFile && (
          <p className="text-sm text-slate-600">
            Выбран файл: {selectedFile.name}
          </p>
        )}

        <button
          type="button"
          onClick={uploadImage}
          disabled={!selectedFile || isUploading}
          className="rounded-xl border px-4 py-2"
        >
          {isUploading ? 'Загрузка...' : 'Загрузить изображение'}
        </button>

        {uploadedImageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-green-600">Изображение загружено</p>
            <img
              src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}${uploadedImageUrl}`}
              alt="preview"
              className="h-40 w-40 rounded-xl border object-cover"
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-black px-5 py-3 text-white"
      >
        {isSaving ? 'Сохранение...' : 'Сохранить товар'}
      </button>
    </form>
  );
}