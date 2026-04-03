'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type HomepageBanner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  openInNewTab: boolean;
};

type Props = {
  banners: HomepageBanner[];
  apiBaseUrl: string;
  autoPlayMs?: number;
};

function normalizeImageUrl(imageUrl: string, apiBaseUrl: string) {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const cleanBase = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return `${cleanBase}${cleanPath}`;
}

function isExternalLink(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function HomepageBannerCarousel({
  banners,
  apiBaseUrl,
  autoPlayMs = 5000,
}: Props) {
  const safeBanners = useMemo(() => banners.filter((item) => !!item.imageUrl && !!item.linkUrl), [banners]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (safeBanners.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeBanners.length);
    }, autoPlayMs);

    return () => window.clearInterval(timer);
  }, [safeBanners.length, autoPlayMs]);

  useEffect(() => {
    if (activeIndex > safeBanners.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, safeBanners.length]);

  if (!safeBanners.length) {
    return null;
  }

  const current = safeBanners[activeIndex];
  const imageSrc = normalizeImageUrl(current.imageUrl, apiBaseUrl);
  const openInNewTab = current.openInNewTab || isExternalLink(current.linkUrl);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? safeBanners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % safeBanners.length);
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white">
      <div className="relative">
        <a
          href={current.linkUrl}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          className="block"
        >
          <div className="relative h-[180px] w-full bg-[#F7F8FA] sm:h-[220px] lg:h-[280px]">
            <img
              src={imageSrc}
              alt={current.title || 'Баннер'}
              className="h-full w-full object-cover"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(15,23,42,0.10)] via-transparent to-[rgba(15,23,42,0.05)]" />
          </div>
        </a>

        {safeBanners.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Предыдущий баннер"
              className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#111827] shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur transition hover:scale-[1.03]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label="Следующий баннер"
              className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#111827] shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur transition hover:scale-[1.03]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur">
              {safeBanners.map((banner, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Перейти к баннеру ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      isActive ? 'w-6 bg-[#F5A623]' : 'w-2.5 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                    }`}
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}