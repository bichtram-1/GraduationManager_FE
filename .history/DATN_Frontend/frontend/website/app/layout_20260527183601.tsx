import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import ViMessages from '@/lib/i18/messages/vi';
import QueryProvider from '@/lib/providers/QueryProvider';
import AntdProvider from '@/lib/providers/AntdProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý sinh viên TTTN - ĐATN",
  description: "Hệ thống quản lý sinh viên thực tập tốt nghiệp và",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AntdProvider>
            <NextIntlClientProvider locale={locale} messages={ViMessages as any}>
              {children}
            </NextIntlClientProvider>
          </AntdProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
