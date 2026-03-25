import React, { useEffect } from 'react';

export default function ExportExcelAction() {
  useEffect(() => {
    window.location.href = '/admin/export/products';
  }, []);

  return React.createElement(
    'div',
    {
      style: {
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
      },
    },
    'Начинаю скачивание файла...'
  );
}