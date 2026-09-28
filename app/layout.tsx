import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "After the needle",
  description:
    "A narrated visual for two unlike obesity pills after the weekly injection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} data-palette="clinic">
      <head>
        <link rel="preload" as="image" href="/assets/wegovy-flex-pens.webp" />
        <link rel="preload" as="image" href="/assets/wegovy-pill-25mg.webp" />
        <link rel="preload" as="image" href="/assets/wegovy-pill-bottle.webp" />
        <link rel="preload" as="image" href="/assets/foundayo-tablet-0.8mg.webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
