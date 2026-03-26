import "./globals.css";
import { Header } from "@/components/layout/header";
import ToasterProvider from "@/components/ToasterProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="page-shell text-text-primary">
        <div className="min-h-screen">
          <Header />
          <ToasterProvider />
          <main className="app-container">
            <div className="content-container py-8 md:py-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}