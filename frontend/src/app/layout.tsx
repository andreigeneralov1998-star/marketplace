import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import ToasterProvider from "@/components/ToasterProvider";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Рынок Бай",
  description: "Маркетплейс запчастей для ремонта телефонов",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="page-shell text-text-primary">
        <div className="flex min-h-screen flex-col">
          <Header />
          <ToasterProvider />

          <main className="app-container flex-1">
            <div className="content-container py-8 md:py-10">{children}</div>
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}