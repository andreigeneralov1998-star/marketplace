import React, { useRef, useState } from 'react';

type Props = {
  property: {
    path: string;
    label?: string;
  };
  record: {
    params: Record<string, any>;
  };
  onChange: (path: string, value: string) => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));

    reader.readAsDataURL(file);
  });
}

export default function BannerImageUpload(props: Props) {
  const { property, record, onChange } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const initialValue = String(record?.params?.imageUrl ?? '');
  const [previewUrl, setPreviewUrl] = useState(initialValue);
  const [textValue, setTextValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleManualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setTextValue(nextValue);
    setPreviewUrl(nextValue);
    onChange('imageUrl', nextValue);
    onChange(property.path, nextValue);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);

      setPreviewUrl(dataUrl);
      setTextValue(file.name);

      onChange(property.path, dataUrl); // imageUpload
    } catch (err: any) {
      setError(err?.message || 'Ошибка чтения файла');
    } finally {
      setIsLoading(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return React.createElement(
    'div',
    { style: { display: 'grid', gap: 12 } },

    React.createElement(
      'label',
      { style: { fontWeight: 600 } },
      property.label || 'Изображение',
    ),

    React.createElement('input', {
      ref: inputRef,
      type: 'file',
      accept: 'image/png,image/jpeg,image/webp',
      onChange: handleFileChange,
      style: { display: 'none' },
    }),

    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        },
      },
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: handlePick,
          disabled: isLoading,
          style: {
            height: 40,
            padding: '0 14px',
            borderRadius: 10,
            border: '1px solid #D1D5DB',
            background: isLoading ? '#F3F4F6' : '#111827',
            color: isLoading ? '#6B7280' : '#FFFFFF',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          },
        },
        isLoading ? 'Загрузка...' : 'Выбрать файл',
      ),
      React.createElement(
        'span',
        { style: { fontSize: 13, color: '#6B7280' } },
        previewUrl ? 'Файл выбран' : 'JPG, PNG, WEBP',
      ),
    ),

    React.createElement('input', {
      type: 'text',
      value: textValue,
      onChange: handleManualChange,
      placeholder: '/uploads/homepage-banners/banner.jpg',
      style: {
        width: '100%',
        height: 40,
        borderRadius: 10,
        border: '1px solid #D1D5DB',
        padding: '0 12px',
        fontSize: 14,
      },
    }),

    previewUrl
      ? React.createElement(
          'div',
          {
            style: {
              border: '1px solid #E5E7EB',
              borderRadius: 14,
              overflow: 'hidden',
              background: '#F9FAFB',
              maxWidth: 520,
            },
          },
          React.createElement('img', {
            src: previewUrl,
            alt: 'preview',
            style: {
              display: 'block',
              width: '100%',
              maxHeight: 220,
              objectFit: 'cover',
            },
          }),
        )
      : null,

    error
      ? React.createElement(
          'div',
          { style: { color: '#DC2626', fontSize: 13 } },
          error,
        )
      : null,
  );
}