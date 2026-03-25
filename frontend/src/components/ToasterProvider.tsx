'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '14px',
          background: '#111',
          color: '#fff',
          padding: '14px 16px',
        },
      }}
    />
  );
}