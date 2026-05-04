import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Outfit, DM_Mono } from "next/font/google";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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

/** Wordmark “Orbit” — Outfit (boa legibilidade + combina com degradê roxo/azul) */
const orbitWordmark = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-orbit-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "Orbit — Acesso",
  },
  description: "Entre ou crie sua conta no Orbit",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${displayFont.variable} ${dmSans.variable} ${dmMono.variable} ${orbitWordmark.variable} flex min-h-svh w-full min-w-0 flex-1 flex-col`}
    >
      {children}
    </div>
  );
}
