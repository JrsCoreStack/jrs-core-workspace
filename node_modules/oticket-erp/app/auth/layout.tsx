import type { Metadata } from "next";
import { Syne, DM_Sans, Space_Grotesk, DM_Mono } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-rf-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-rf-body",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-rf-mono",
  display: "swap",
});

/** Wordmark da marca Orbit — manual: Space Grotesk 700 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-orbit-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Orbit — Acesso",
  description: "Entre ou crie sua conta no Orbit",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} ${spaceGrotesk.variable} flex min-h-svh w-full min-w-0 flex-1 flex-col`}
    >
      {children}
    </div>
  );
}
