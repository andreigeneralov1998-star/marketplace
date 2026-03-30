import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

type Store = {
  id: string;
  storeName: string | null;
  storeSlug: string | null;
  storeDescription?: string | null;
  storeLogo?: string | null;
};

function normalizeImageSrc(src?: string | null) {
  if (!src) return null;
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:4000';

  return src.startsWith('http') ? src : `${backendUrl}${src}`;
}

async function getStores(): Promise<Store[]> {
  try {
    const res = await api.get('/users/stores');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Failed to load stores:', error);
    return [];
  }
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <section className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 rounded-[20px] border border-[#E5E7EB] bg-white p-6 md:p-8">
        <div className="max-w-3xl">
          <p className="mb-2 text-sm font-medium text-[#F5A623]">Витрины продавцов</p>
          <h1 className="text-[28px] font-bold leading-[36px] text-[#111827] md:text-[32px] md:leading-[40px]">
            Все магазины
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6B7280] md:text-base">
            Выбирай продавца, переходи в витрину и смотри все доступные товары в одном месте.
          </p>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#E5E7EB] bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-[#111827]">Магазины пока не найдены</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Когда продавцы заполнят профиль и активируют витрину, они появятся здесь.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => {
            const logo = normalizeImageSrc(store.storeLogo);

            return (
              <article
                key={store.id}
                className="group flex h-full flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 flex items-center gap-4">
                  {logo ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA]">
                      <Image
                        src={logo}
                        alt={store.storeName || 'Логотип магазина'}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] text-xs font-semibold text-[#6B7280]">
                      LOGO
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-[#111827]">
                      {store.storeName || 'Без названия'}
                    </h2>

                    {store.storeSlug && (
                      <p className="mt-1 text-sm text-[#6B7280]">/{store.storeSlug}</p>
                    )}
                  </div>
                </div>

                <p className="line-clamp-4 text-sm leading-6 text-[#6B7280]">
                  {store.storeDescription || 'Описание магазина отсутствует'}
                </p>

                <div className="mt-5 pt-5">
                  {store.storeSlug ? (
                    <Link
                      href={`/store/${store.storeSlug}`}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#0F172A]"
                    >
                      Открыть магазин
                    </Link>
                  ) : (
                    <span className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E5E7EB] px-5 text-sm font-semibold text-[#9CA3AF]">
                      Магазин недоступен
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}