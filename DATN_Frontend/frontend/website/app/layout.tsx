import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import ViMessages from '@/lib/i18/messages/vi';
import QueryProvider from '@/lib/providers/QueryProvider';
import AntdProvider from '@/lib/providers/AntdProvider';
import { PeriodProvider } from '@/lib/providers/PeriodProvider';

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
  description: "Hệ thống quản lý sinh viên thực tập tốt nghiệp và đồ an tốt nghiệp",
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
            <PeriodProvider>
              <NextIntlClientProvider locale={locale} messages={ViMessages as AbstractIntlMessages}>
                {children}
              </NextIntlClientProvider>
            </PeriodProvider>
          </AntdProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
