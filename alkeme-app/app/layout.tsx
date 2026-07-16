import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alkeme Sports Rx — AI-Powered Athletic Rehabilitation",
  description: "Your personalized rehab plan, built on the same science that got pro athletes back on the field.",
  openGraph: {
    title: "Alkeme Sports Rx",
    description: "Get back to doing what you love. AI-powered athletic rehabilitation.",
    images: ["https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
