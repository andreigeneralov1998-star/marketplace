import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  marketplace: [
    { label: 'Категории', href: '/catalog' },
    { label: 'Стать продавцом', href: '/seller/profile' },
    { label: 'Кабинет', href: '/account' },
  ],
  company: [
    { label: 'О нас', href: '/about' },
    { label: 'Помощь', href: '/help' },
    { label: 'Обратная связь', href: '/feedback' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[#111827] transition hover:opacity-80"
            >
              <Image
                src="/brand-icon.png"
                alt="rnk.by"
                width={44}
                height={44}
                className="h-11 w-11 rounded-2xl object-contain"
                />
              <div>
                <div className="text-base font-semibold">rnk.by</div>
                <div className="text-sm text-[#6B7280]">
                  Маркетплейс запчастей для сервисных центров
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-[420px] text-sm leading-6 text-[#6B7280]">
              Платформа для покупки и продажи запчастей между мастерами и
              сервисными центрами. Без визуального шума, с акцентом на удобство,
              доверие и быстрый поиск нужных позиций.
            </p>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#111827]">
              Маркетплейс
            </div>
            <nav className="flex flex-col gap-3">
              {footerLinks.marketplace.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#6B7280] transition hover:text-[#111827]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#111827]">
              Информация
            </div>
            <nav className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#6B7280] transition hover:text-[#111827]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#E5E7EB] pt-6 text-sm text-[#9CA3AF] sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} rnk.by. Все права защищены.</div>
          <div>Создано для сервисных центров и мастеров по ремонту мобильной техники.</div>
        </div>
      </div>
    </footer>
  );
}