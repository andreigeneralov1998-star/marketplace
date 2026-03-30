'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { api } from '@/lib/api';

type Category = {
  id: string;
  name: string;
};

type ProductImage = {
  id?: string;
  url: string;
};

export type ProductFormValues = {
  title: string;
  sku?: string;
  categoryId: string;
  price: string;
  stock: string;
  description: string;
  compatibleModels?: string;
};

type SubmitPayload = {
  title: string;
  sku?: string;
  categoryId: string;
  price: number;
  stock: number;
  description: string;
  compatibleModels?: string;
  imageUrls: string[];
};

type ProductFormProps = {
  mode?: 'create' | 'edit';
  initialValues?: Partial<ProductFormValues>;
  initialImages?: string[];
  lockedSku?: string;
  submitLabel?: string;
  submittingLabel?: string;
  cancelHref?: string;
  backHref?: string;
  onSubmitForm?: (payload: SubmitPayload) => Promise<void>;
  onSuccessRedirect?: string;
};

function FieldHint({
  error,
  hint,
  counter,
}: {
  error?: string;
  hint?: string;
  counter?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className={error ? 'text-[#B91C1C]' : 'text-[#6B7280]'}>
        {error || hint || ''}
      </span>
      {counter ? <span className="shrink-0 text-[#9CA3AF]">{counter}</span> : null}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-8 text-[#111827]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function ProductForm({
  mode = 'create',
  initialValues,
  initialImages = [],
  lockedSku,
  submitLabel,
  submittingLabel,
  cancelHref = '/seller',
  backHref = '/seller',
  onSubmitForm,
  onSuccessRedirect,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ProductFormValues>({
    defaultValues: {
      title: '',
      sku: '',
      categoryId: '',
      price: '',
      stock: '0',
      description: '',
      compatibleModels: '',
      ...initialValues,
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    reset({
      title: initialValues?.title || '',
      sku: initialValues?.sku || '',
      categoryId: initialValues?.categoryId || '',
      price: initialValues?.price || '',
      stock: initialValues?.stock || '0',
      description: initialValues?.description || '',
      compatibleModels: initialValues?.compatibleModels || '',
    });
  }, [initialValues, reset]);

  useEffect(() => {
    setExistingImages(initialImages);
  }, [initialImages]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';
  const compatibleModelsValue = watch('compatibleModels') || '';
  const stockValue = watch('stock') || '0';
  const priceValue = watch('price') || '';

  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const totalImagesCount = existingImages.length + selectedFiles.length;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (isEdit) {
      if (existingImages.length + files.length > 3) {
        setError('У товара может быть не более 3 изображений');
        event.target.value = '';
        return;
      }

      setSelectedFiles((prev) => {
        const next = [...prev, ...files];
        if (existingImages.length + next.length > 3) {
          setError('У товара может быть не более 3 изображений');
          return prev;
        }
        return next;
      });
    } else {
      if (files.length > 3) {
        setError('Можно выбрать не более 3 фотографий');
        event.target.value = '';
        return;
      }
      setSelectedFiles(files);
    }

    setUploadedImageUrls([]);
    setError('');
    event.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls([]);
  };

  const removeSelectedImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadedImageUrls([]);
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
      setError(err?.response?.data?.message || 'Не удалось загрузить изображения');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async (values: ProductFormValues) => {
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

      let newImageUrls = uploadedImageUrls;

      if (selectedFiles.length > 0 && !newImageUrls.length) {
        newImageUrls = await uploadImages();
        if (selectedFiles.length > 0 && !newImageUrls.length) {
          setIsSaving(false);
          return;
        }
      }

      const payload: SubmitPayload = {
        title: values.title.trim(),
        sku: isEdit ? undefined : values.sku?.trim() || undefined,
        categoryId: values.categoryId,
        price,
        stock,
        description: values.description.trim(),
        compatibleModels: values.compatibleModels?.trim() || undefined,
        imageUrls: isEdit ? [...existingImages, ...newImageUrls] : newImageUrls,
      };

      if (onSubmitForm) {
        await onSubmitForm(payload);
      } else {
        await api.post('/products', payload);
      }

      reset();
      setSelectedFiles([]);
      setUploadedImageUrls([]);
      setExistingImages([]);

      router.push(onSuccessRedirect || (isEdit ? '/seller/products' : '/seller'));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не удалось сохранить товар');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SectionCard
            title="Основная информация"
            description={
              isEdit
                ? 'Обновите название, категорию, цену и наличие товара.'
                : 'Укажите ключевые данные товара: название, категорию, цену, наличие и артикул.'
            }
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2 lg:col-span-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Наименование товара
                </label>
                <input
                  {...register('title', {
                    required: 'Введите наименование товара',
                    maxLength: {
                      value: 50,
                      message: 'Максимум 50 символов',
                    },
                  })}
                  maxLength={50}
                  placeholder="Например: Дисплей iPhone 13 OLED"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                />
                <FieldHint
                  error={errors.title?.message}
                  counter={`${titleValue.length}/50`}
                />
              </div>

              {isEdit ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#111827]">
                    Артикул
                  </label>
                  <input
                    value={lockedSku || ''}
                    disabled
                    className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm text-[#6B7280] outline-none"
                  />
                  <FieldHint hint="После создания артикул изменять нельзя" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#111827]">
                    Артикул
                  </label>
                  <input
                    {...register('sku', {
                      maxLength: {
                        value: 50,
                        message: 'Максимум 50 символов',
                      },
                    })}
                    maxLength={50}
                    placeholder="Можно оставить пустым"
                    className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                  />
                  <FieldHint
                    error={errors.sku?.message}
                    hint="Если поле пустое, система сгенерирует SKU автоматически"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Категория
                </label>
                <select
                  {...register('categoryId', {
                    required: 'Выберите категорию',
                  })}
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldHint
                  error={errors.categoryId?.message}
                  hint="Обязательное поле"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Цена, BYN
                </label>
                <input
                  {...register('price', {
                    required: 'Укажите цену',
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                />
                <FieldHint
                  error={errors.price?.message}
                  hint="Например: 49.90"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Остаток
                </label>
                <input
                  {...register('stock', {
                    required: 'Укажите наличие',
                  })}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                />
                <FieldHint
                  error={errors.stock?.message}
                  hint="Количество единиц на складе"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Описание товара"
            description="Кратко и понятно опишите товар, его состояние, особенности и совместимость."
          >
            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Описание
                </label>
                <textarea
                  {...register('description', {
                    required: 'Введите описание',
                    maxLength: {
                      value: 300,
                      message: 'Максимум 300 символов',
                    },
                  })}
                  maxLength={300}
                  rows={6}
                  placeholder="Опишите товар понятно для покупателя"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                />
                <FieldHint
                  error={errors.description?.message}
                  counter={`${descriptionValue.length}/300`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Совместимые модели
                </label>
                <input
                  {...register('compatibleModels', {
                    maxLength: {
                      value: 20,
                      message: 'Максимум 20 символов',
                    },
                  })}
                  maxLength={20}
                  placeholder="Например: iPhone 11/12"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F5A623] focus:ring-4 focus:ring-[#F5A623]/15"
                />
                <FieldHint
                  error={errors.compatibleModels?.message}
                  counter={`${compatibleModelsValue.length}/20`}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Фотографии"
            description="Можно загрузить до 3 изображений. Поддерживаются PNG, JPG и WEBP."
          >
            <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <UploadCloud className="h-5 w-5 text-[#6B7280]" />
                </div>

                <div className="w-full">
                  <label className="mb-3 block text-sm font-medium text-[#111827]">
                    Загрузить изображения
                  </label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] file:mr-4 file:rounded-lg file:border-0 file:bg-[#FFF4DD] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#111827] hover:file:bg-[#FFECC4]"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#374151]">
                      Максимум 3 файла
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#374151]">
                      JPG / PNG / WEBP
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#374151]">
                      Без фото покажется заглушка
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {existingImages.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-[#6B7280]" />
                  <p className="text-sm font-medium text-[#111827]">Текущие изображения</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {existingImages.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]"
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || ''}${url}`}
                        alt={`Изображение ${index + 1}`}
                        className="h-48 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#111827] shadow-sm transition hover:bg-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-[#6B7280]" />
                  <p className="text-sm font-medium text-[#111827]">
                    {isEdit ? 'Новые изображения' : 'Предпросмотр'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={url}
                      className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB]"
                    >
                      <img
                        src={url}
                        alt={`Предпросмотр ${index + 1}`}
                        className="h-48 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#111827] shadow-sm transition hover:bg-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4DD]">
                <ShieldCheck className="h-5 w-5 text-[#111827]" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#111827]">
                  {isEdit ? 'Проверка перед сохранением' : 'Проверка перед публикацией'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  {isEdit
                    ? 'После изменения карточка может снова уйти на модерацию.'
                    : 'Новая карточка не публикуется сразу и проходит модерацию.'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#374151]">
              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span>Название</span>
                <span className="font-medium text-[#111827]">{titleValue.length}/50</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span>Описание</span>
                <span className="font-medium text-[#111827]">
                  {descriptionValue.length}/300
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span>Совместимость</span>
                <span className="font-medium text-[#111827]">
                  {compatibleModelsValue.length}/20
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span>Остаток</span>
                <span className="font-medium text-[#111827]">{stockValue || '0'}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span>Цена</span>
                <span className="font-medium text-[#111827]">
                  {priceValue ? `${priceValue} BYN` : 'Не указана'}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span>Изображения</span>
                <span className="font-medium text-[#111827]">{totalImagesCount}/3</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-[20px] border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
              {error}
            </div>
          ) : null}

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F5A623] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {submittingLabel || (isEdit ? 'Сохранение...' : 'Сохранение...')}
                  </>
                ) : (
                  submitLabel || (isEdit ? 'Сохранить изменения' : 'Создать товар')
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(cancelHref)}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={() => router.push(backHref)}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#FFF4DD] px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#FFECC4]"
              >
                Назад
              </button>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}