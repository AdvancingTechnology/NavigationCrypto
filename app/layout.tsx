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
  title: "Navigating Crypto | Learn, Trade & Grow Your Crypto Portfolio",
  description: "Your all-in-one platform for crypto education, copy trading, live signals, and portfolio management. Learn from experts. Trade with confidence.",
  keywords: ["crypto", "trading", "bitcoin", "ethereum", "education", "signals", "copy trading", "portfolio"],
  openGraph: {
    title: "Navigating Crypto",
    description: "Navigate the future of crypto trading with expert education, live signals, and copy trading.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-cyan-500 text-black px-4 py-2 rounded z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
