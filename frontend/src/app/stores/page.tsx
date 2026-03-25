import Link from 'next/link';
import { api } from '@/lib/api';
import Image from 'next/image';

type Store = {
  id: string;
  storeName: string | null;
  storeSlug: string | null;
  storeDescription?: string | null;
  storeLogo?: string | null;
};

async function getStores(): Promise<Store[]> {
  const res = await api.get('/users/stores');
  return res.data;
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Все магазины</h1>

      {stores.length === 0 ? (
        <p>Магазины пока не найдены</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
                key={store.id}
                className="border rounded-xl p-4 bg-white shadow-sm"
            >
                <div className="flex items-center gap-3 mb-3">
                {store.storeLogo ? (
                    <img
                        src={`http://localhost:4000${store.storeLogo}`}
                        alt={store.storeName || 'Логотип магазина'}
                        className="w-12 h-12 rounded-full object-cover border"
                        />
                ) : (
                    <div className="w-12 h-12 rounded-full border flex items-center justify-center text-xs text-gray-500">
                    Нет logo
                    </div>
                )}

                <h2 className="text-lg font-semibold">
                    {store.storeName || 'Без названия'}
                </h2>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                {store.storeDescription || 'Описание магазина отсутствует'}
                </p>

                <Link
                href={`/store/${store.storeSlug}`}
                className="inline-block px-4 py-2 rounded-lg bg-black text-white"
                >
                Открыть магазин
                </Link>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}