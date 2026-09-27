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
      <body>{children}</body>
    </html>
  );
}
