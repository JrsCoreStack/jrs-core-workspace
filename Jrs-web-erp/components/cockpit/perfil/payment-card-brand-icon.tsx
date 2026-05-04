"use client"

import { CreditCard } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type CardBrand =
  | "visa"
  | "mastercard"
  | "elo"
  | "amex"
  | "discover"
  | "diners"
  | "hipercard"
  | "jcb"
  | "unionpay"
  | "unknown"

const BRAND_ALIASES: Record<string, CardBrand> = {
  visa: "visa",
  mastercard: "mastercard",
  master: "mastercard",
  mc: "mastercard",
  elo: "elo",
  amex: "amex",
  americanexpress: "amex",
  "american express": "amex",
  discover: "discover",
  diners: "diners",
  dinner: "diners",
  dinersclub: "diners",
  hipercard: "hipercard",
  hiper: "hipercard",
  jcb: "jcb",
  unionpay: "unionpay",
}

/** Normaliza string vinda da API ou do rótulo (ex.: descrição "Visa · …"). */
export function parseCardBrand(input: string | null | undefined): CardBrand {
  if (!input) return "unknown"
  const key = input.toLowerCase().replace(/[\s_-]+/g, "")
  return BRAND_ALIASES[key] ?? "unknown"
}

type IconProps = { className?: string; title?: string }

function SvgWrap({
  children,
  className,
  title,
  viewBox,
}: {
  children: ReactNode
  className?: string
  title?: string
  viewBox: string
}) {
  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

function VisaIcon({ className, title = "Visa" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#1434CB" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#fff"
        style={{ fontSize: 10, fontWeight: 800, fontFamily: "system-ui, sans-serif" }}
      >
        VISA
      </text>
    </SvgWrap>
  )
}

function MastercardIcon({ className, title = "Mastercard" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#000" opacity="0.06" />
      <rect width="40" height="24" rx="4" fill="#f5f5f5" />
      <circle cx="16" cy="12" r="7.5" fill="#EB001B" />
      <circle cx="24" cy="12" r="7.5" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M20 17.58a8.76 8.76 0 0 1 0-11.16 8.76 8.76 0 0 1 0 11.16Z"
      />
    </SvgWrap>
  )
}

function EloIcon({ className, title = "Elo" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#1a1a1a" />
      <path
        fill="#FFCB05"
        d="M8.5 12a4.2 4.2 0 1 1 8.4 0 4.2 4.2 0 0 1-8.4 0Z"
      />
      <path
        fill="#00A4E0"
        d="M18.2 12a4.2 4.2 0 1 1 8.4 0 4.2 4.2 0 0 1-8.4 0Z"
      />
      <path
        fill="#EF4123"
        d="M27.9 12a4.2 4.2 0 1 1 8.4 0 4.2 4.2 0 0 1-8.4 0Z"
      />
    </SvgWrap>
  )
}

function AmexIcon({ className, title = "American Express" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#006FCF" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#fff"
        style={{ fontSize: 8, fontWeight: 800, fontFamily: "system-ui, sans-serif" }}
      >
        AMEX
      </text>
    </SvgWrap>
  )
}

function DiscoverIcon({ className, title = "Discover" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#FF6000" />
      <circle cx="20" cy="12" r="5.5" fill="#000" opacity="0.15" />
      <path fill="#fff" d="M12 13.8V10.2h1.9c.9 0 1.6.62 1.6 1.8s-.8 1.8-1.7 1.8H12Z" />
      <ellipse cx="29" cy="12" rx="3.2" ry="4.2" fill="#fff" />
    </SvgWrap>
  )
}

function DinersIcon({ className, title = "Diners Club" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#0079BE" />
      <circle cx="20" cy="12" r="6.5" fill="none" stroke="#fff" strokeWidth="2" />
      <path stroke="#fff" strokeWidth="1.5" d="M20 8v8" />
    </SvgWrap>
  )
}

function HipercardIcon({ className, title = "Hipercard" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#822124" />
      <path
        fill="#fff"
        d="M10 13.6c0-1 .8-2.2 3-2.2v1.6c-.7 0-1 .25-1 .6 0 .4.55.63 2.2.63 1.9 0 3.05-.94 6.6-.94 2.54 0 4.58.94 8.05.94V16H10v-2.4Z"
        opacity=".9"
      />
    </SvgWrap>
  )
}

function JcbIcon({ className, title = "JCB" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#fff" />
      <path fill="#0E4C96" d="M6 14V10h8v1.8H11.8V14H10v2.2h4V18H8c-1 0-2-.9-2-2v-2Z" />
      <path fill="#006B2F" d="M16 10h6c1 0 2 .9 2 2v4h-8v-6Z" opacity=".95" />
      <path fill="#E8112D" d="M26 10h8v8h-2v-6h-6V10Z" />
    </SvgWrap>
  )
}

function UnionpayIcon({ className, title = "UnionPay" }: IconProps) {
  return (
    <SvgWrap className={className} title={title} viewBox="0 0 40 24">
      <rect width="40" height="24" rx="4" fill="#09347A" />
      <path fill="#E21836" d="M8 7h24v10H8V7Z" opacity=".85" />
      <path fill="#fff" d="M12 14h16v3H12v-3Z" opacity=".35" />
    </SvgWrap>
  )
}

const DEFAULT_SIZE = "h-[22px] w-[38px]"

export function PaymentCardBrandIcon({
  brand,
  className,
}: {
  brand: CardBrand
  className?: string
}) {
  const cls = cn(DEFAULT_SIZE, className)
  switch (brand) {
    case "visa":
      return <VisaIcon className={cls} />
    case "mastercard":
      return <MastercardIcon className={cls} />
    case "elo":
      return <EloIcon className={cls} />
    case "amex":
      return <AmexIcon className={cls} />
    case "discover":
      return <DiscoverIcon className={cls} />
    case "diners":
      return <DinersIcon className={cls} />
    case "hipercard":
      return <HipercardIcon className={cls} />
    case "jcb":
      return <JcbIcon className={cls} />
    case "unionpay":
      return <UnionpayIcon className={cls} />
    default:
      return (
        <span
          className={cn(
            "flex h-[22px] w-[38px] items-center justify-center rounded-md border border-[color:var(--rf-border-default)] bg-[var(--rf-bg-elevated)] text-[var(--rf-text-muted)]",
            className
          )}
        >
          <CreditCard className="size-4" strokeWidth={1.6} />
        </span>
      )
  }
}
