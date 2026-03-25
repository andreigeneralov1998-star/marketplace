'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type FormValues = {
  title: string;
  sku?: string;
  categoryId: string;
  price: string;
  stock: string;
  description: string;
  compatibleModels?: string;
};

export function ProductForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      sku: '',
      categoryId: '',
      price: '',
      stock: '0',
      description: '',
      compatibleModels: '',
    },
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';
  const compatibleModelsValue = watch('compatibleModels') || '';

  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (files.length > 3) {
      setError('Можно выбрать не более 3 фотографий');
      return;
    }

    setSelectedFiles(files);
    setUploadedImageUrls([]);
    setError('');
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) return [];

    setIsUploading(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/uploads/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadedUrls.push(data.url);
      }

      setUploadedImageUrls(uploadedUrls);
      return uploadedUrls;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Не удалось загрузить изображения',
      );
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    setError('');

    try {
      if (!values.categoryId) {
        setError('Выберите категорию');
        setIsSaving(false);
        return;
      }

      const price = Number(values.price);
      const stock = Number(values.stock);

      if (Number.isNaN(price) || price < 0) {
        setError('Цена указана неверно');
        setIsSaving(false);
        return;
      }

      if (Number.isNaN(stock) || stock < 0) {
        setError('Наличие указано неверно');
        setIsSaving(false);
        return;
      }

      let imageUrls = uploadedImageUrls;

      if (selectedFiles.length > 0 && !imageUrls.length) {
        imageUrls = await uploadImages();
        if (!imageUrls.length) {
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        title: values.title.trim(),
        sku: values.sku?.trim() || undefined,
        categoryId: values.categoryId,
        price,
        stock,
        description: values.description.trim(),
        compatibleModels: values.compatibleModels?.trim() || undefined,
        imageUrls,
      };

      await api.post('/products', payload);

      reset();
      setSelectedFiles([]);
      setUploadedImageUrls([]);
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
      <div className="space-y-1">
        <input
          {...register('title', {
            required: 'Введите наименование товара',
            maxLength: {
              value: 50,
              message: 'Максимум 50 символов',
            },
          })}
          maxLength={50}
          placeholder="Наименование товара"
          className="w-full rounded-xl border px-4 py-3"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{errors.title?.message || ''}</span>
          <span>{titleValue.length}/50</span>
        </div>
      </div>

      <input
        {...register('sku', {
          maxLength: {
            value: 50,
            message: 'Максимум 50 символов',
          },
        })}
        maxLength={50}
        placeholder="Артикул (необязательно)"
        className="w-full rounded-xl border px-4 py-3"
      />
      {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}

      <select
        {...register('categoryId', {
          required: 'Выберите категорию',
        })}
        className="w-full rounded-xl border px-4 py-3"
      >
        <option value="">Выберите категорию</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {errors.categoryId && (
        <p className="text-sm text-red-500">{errors.categoryId.message}</p>
      )}

      <input
        {...register('price', {
          required: 'Укажите цену',
        })}
        type="number"
        min="0"
        step="0.01"
        placeholder="Цена"
        className="w-full rounded-xl border px-4 py-3"
      />
      {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}

      <input
        {...register('stock', {
          required: 'Укажите наличие',
        })}
        type="number"
        min="0"
        step="1"
        placeholder="Наличие"
        className="w-full rounded-xl border px-4 py-3"
      />
      {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}

      <div className="space-y-1">
        <textarea
          {...register('description', {
            required: 'Введите описание',
            maxLength: {
              value: 300,
              message: 'Максимум 300 символов',
            },
          })}
          maxLength={300}
          rows={5}
          placeholder="Описание"
          className="w-full rounded-xl border px-4 py-3"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{errors.description?.message || ''}</span>
          <span>{descriptionValue.length}/300</span>
        </div>
      </div>

      <div className="space-y-1">
        <input
          {...register('compatibleModels', {
            maxLength: {
              value: 20,
              message: 'Максимум 20 символов',
            },
          })}
          maxLength={20}
          placeholder="Совместимые модели"
          className="w-full rounded-xl border px-4 py-3"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{errors.compatibleModels?.message || ''}</span>
          <span>{compatibleModelsValue.length}/20</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Фотографии товара (до 3, необязательно)
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleFileChange}
          className="w-full rounded-xl border px-4 py-3"
        />

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Выбрано файлов: {selectedFiles.length}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={`preview-${index}`}
                  className="h-28 w-full rounded-xl border object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isSaving || isUploading}
        className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-60"
      >
        {isSaving || isUploading ? 'Сохранение...' : 'Сохранить товар'}
      </button>
    </form>
  );
}