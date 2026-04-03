'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

type CartProduct = {
  id?: number | string;
};

type CartItem = {
  id: number | string;
  quantity?: number;
  productId?: number | string;
  product?: CartProduct;
};

type ProductForCart = {
  id: number | string;
  slug: string;
  stock?: number;
};

type AddToCartButtonProps = {
  product: ProductForCart;
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
  const [cartItemId, setCartItemId] = useState<number | string | null>(null);
  const [quantity, setQuantity] = useState(0);

  const maxStock = typeof product.stock === 'number' ? product.stock : Infinity;
  const isOutOfStock = maxStock <= 0;

  const goToLogin = () => {
    const redirect = encodeURIComponent(pathname || `/product/${product.slug}`);
    router.push(`/login?redirect=${redirect}`);
  };

  const extractItemsFromCartResponse = (data: any): CartItem[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.cartItems)) return data.cartItems;
    return [];
  };

  const findCartItemByProductId = (items: CartItem[]) => {
    return items.find((item) => {
      const directProductId = item.productId;
      const nestedProductId = item.product?.id;

      return String(directProductId ?? nestedProductId) === String(product.id);
    });
  };

  const syncCartItem = async () => {
    if (!user) {
      setCartItemId(null);
      setQuantity(0);
      return;
    }

    try {
      const { data } = await api.get('/cart');
      const items = extractItemsFromCartResponse(data);
      const existingItem = findCartItemByProductId(items);

      if (existingItem) {
        setCartItemId(existingItem.id);
        setQuantity(existingItem.quantity ?? 1);
      } else {
        setCartItemId(null);
        setQuantity(0);
      }
    } catch {
      setCartItemId(null);
      setQuantity(0);
    }
  };

  useEffect(() => {
    syncCartItem();
  }, [user]);

  const handleUnauthorized = () => {
    localStorage.removeItem('accessToken');
    goToLogin();
  };

  const getErrorMessage = (error: any, fallback: string) => {
    if (typeof error?.response?.data?.message === 'string') {
      return error.response.data.message;
    }

    if (Array.isArray(error?.response?.data?.message)) {
      return error.response.data.message.join(', ');
    }

    return fallback;
  };

  const handleAdd = async () => {
    if (!user) {
      goToLogin();
      return;
    }

    if (isOutOfStock) {
      toast.error('Товар недоступен для заказа');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post('/cart', {
        productId: product.id,
        quantity: 1,
      });

      toast.success('Товар добавлен в корзину');
      await syncCartItem();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(getErrorMessage(error, 'Ошибка добавления в корзину'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuantity = async (nextQuantity: number) => {
    if (!user) {
      goToLogin();
      return;
    }

    if (!cartItemId) {
      await handleAdd();
      return;
    }

    if (nextQuantity < 0) return;
    if (nextQuantity > maxStock) {
      toast.error('Нельзя добавить больше, чем есть в наличии');
      return;
    }

    try {
      setIsSubmitting(true);

      if (nextQuantity === 0) {
        await api.delete(`/cart/${cartItemId}`);
        setCartItemId(null);
        setQuantity(0);
        toast.success('Товар удален из корзины');
        return;
      }

      await api.patch(`/cart/${cartItemId}`, {
        quantity: nextQuantity,
      });

      setQuantity(nextQuantity);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(getErrorMessage(error, 'Ошибка обновления корзины'));
      await syncCartItem();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quantity > 0) {
    return (
      <div className={cn('mt-3 flex items-center gap-2', className)}>
        <button
          type="button"
          onClick={() => updateQuantity(quantity - 1)}
          disabled={isSubmitting}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-lg font-semibold text-[#111827] transition hover:border-[#D1D5DB] hover:bg-[#FCFCFD] disabled:cursor-not-allowed disabled:opacity-60"
        >
          −
        </button>

        <div className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827]">
          {isSubmitting ? '...' : quantity}
        </div>

        <button
          type="button"
          onClick={() => updateQuantity(quantity + 1)}
          disabled={isSubmitting || quantity >= maxStock}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-lg font-semibold text-[#111827] transition hover:border-[#D1D5DB] hover:bg-[#FCFCFD] disabled:cursor-not-allowed disabled:opacity-60"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isSubmitting || isOutOfStock}
      className={cn(
        'mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#F5A623] px-6 text-sm font-semibold text-[#111827] transition',
        'hover:bg-[#E69512] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {isOutOfStock
        ? 'Нет в наличии'
        : isSubmitting
          ? 'Добавление...'
          : 'Добавить в корзину'}
    </button>
  );
}