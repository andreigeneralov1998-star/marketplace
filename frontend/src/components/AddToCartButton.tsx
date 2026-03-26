'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import type { ProductDetails } from '@/types';

type AddToCartButtonProps = {
  product: ProductDetails;
  className?: string;
};

export default function AddToCartButton({
  product,
  className,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!user) {
      const redirect = encodeURIComponent(pathname || `/product/${product.slug}`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post('/cart', {
        productId: product.id,
        quantity: 1,
      });

      toast.success('Товар добавлен в корзину');
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401) {
        localStorage.removeItem('accessToken');
        const redirect = encodeURIComponent(pathname || `/product/${product.slug}`);
        router.push(`/login?redirect=${redirect}`);
        return;
      }

      const message =
        typeof error?.response?.data?.message === 'string'
          ? error.response.data.message
          : Array.isArray(error?.response?.data?.message)
            ? error.response.data.message.join(', ')
            : 'Ошибка добавления в корзину';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isSubmitting}
      className={cn(
        'inline-flex h-12 items-center justify-center rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#111827] transition',
        'hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {isSubmitting ? 'Добавление...' : 'Добавить в корзину'}
    </button>
  );
}