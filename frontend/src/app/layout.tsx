import './globals.css';
import { Header } from '@/components/layout/header';
import ToasterProvider from '@/components/ToasterProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <ToasterProvider />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}