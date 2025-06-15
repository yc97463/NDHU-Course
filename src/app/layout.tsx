import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navigation/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NDHU 東華查課拉",
  description: "東華大學最蝦趴的課程查詢平台！查課拉～查課拉～輕鬆查課程、快速排課表，讓你的選課之路順暢無阻！🦐✨ 從課程搜尋到時間規劃，一站式搞定你的學習大計，比查克拉還要神奇的選課體驗就在這裡！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
