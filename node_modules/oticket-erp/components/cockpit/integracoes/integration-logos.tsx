import { cn } from "@/lib/utils"

const box = "block shrink-0"

/** Google Calendar — ícone estilo app oficial */
export function LogoGoogleCalendar({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="6" width="36" height="36" rx="4" fill="white" className="stroke-border" strokeWidth="1" />
      <rect x="6" y="6" width="36" height="10" rx="4" fill="#1a73e8" />
      <rect x="6" y="12" width="36" height="4" fill="#1a73e8" />
      <circle cx="16" cy="4" r="3" fill="#1a73e8" />
      <circle cx="32" cy="4" r="3" fill="#1a73e8" />
      <rect x="12" y="22" width="8" height="6" rx="1" fill="#e53935" />
      <rect x="22" y="22" width="6" height="3" rx="1" fill="#BDBDBD" />
      <rect x="22" y="27" width="6" height="3" rx="1" fill="#BDBDBD" />
      <rect x="30" y="22" width="6" height="3" rx="1" fill="#BDBDBD" />
      <rect x="30" y="27" width="6" height="3" rx="1" fill="#BDBDBD" />
      <rect x="12" y="30" width="8" height="3" rx="1" fill="#BDBDBD" />
    </svg>
  )
}

/** Slack — hash de cores oficial */
export function LogoSlack({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="18" width="12" height="12" rx="3" fill="#E01E5A" />
      <rect x="6" y="6" width="12" height="10" rx="3" fill="#E01E5A" opacity="0.5" />
      <rect x="20" y="18" width="10" height="12" rx="3" fill="#36C5F0" />
      <rect x="32" y="18" width="10" height="12" rx="3" fill="#36C5F0" opacity="0.5" />
      <rect x="18" y="30" width="12" height="12" rx="3" fill="#2EB67D" />
      <rect x="18" y="18" width="12" height="10" rx="3" fill="#2EB67D" opacity="0.5" />
      <rect x="30" y="6" width="12" height="12" rx="3" fill="#ECB22E" />
      <rect x="30" y="20" width="12" height="10" rx="3" fill="#ECB22E" opacity="0.5" />
    </svg>
  )
}

/** Microsoft Teams (marca simplificada, sem texto) */
export function LogoMicrosoftTeams({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="14" y="10" width="20" height="20" rx="10" fill="#5558AF" />
      <circle cx="24" cy="18" r="6" fill="white" opacity="0.9" />
      <rect x="10" y="30" width="28" height="12" rx="4" fill="#5558AF" opacity="0.85" />
      <rect x="14" y="22" width="20" height="20" rx="4" fill="#7B83EB" />
      <rect x="19" y="30" width="10" height="3" rx="1" fill="white" opacity="0.95" />
      <rect x="19" y="35" width="6" height="2" rx="1" fill="white" opacity="0.7" />
    </svg>
  )
}

/** WhatsApp Business */
export function LogoWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="18" fill="#25D366" />
      <path
        d="M33 14.8C31 12.7 28.1 11.5 25 11.5c-6.3 0-11.5 5.1-11.5 11.5 0 2 .5 4 1.5 5.7L13 37l8.5-2.2c1.7.9 3.5 1.4 5.5 1.4 6.3 0 11.5-5.1 11.5-11.5 0-3.1-1.2-6-3.5-8.9z"
        fill="white"
      />
      <path
        d="M25 33.2c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.5-1.5-3.3-1.5-5.1 0-5.2 4.2-9.5 9.5-9.5 2.5 0 4.9 1 6.7 2.8 1.8 1.8 2.8 4.2 2.8 6.7-.1 5.2-4.4 9.7-9.1 9.7z"
        fill="#25D366"
      />
      <path
        d="M30.5 26.5c-.3-.1-1.7-.9-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.1 2 3.1 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.7.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.2-.5-.3z"
        fill="white"
      />
    </svg>
  )
}

/** Google Sheets */
export function LogoGoogleSheets({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="8" y="4" width="32" height="40" rx="3" fill="#34A853" />
      <rect x="14" y="14" width="20" height="3" rx="1" fill="white" opacity="0.9" />
      <rect x="14" y="20" width="20" height="3" rx="1" fill="white" opacity="0.9" />
      <rect x="14" y="26" width="20" height="3" rx="1" fill="white" opacity="0.9" />
      <rect x="14" y="32" width="12" height="3" rx="1" fill="white" opacity="0.6" />
      <rect x="22" y="4" width="14" height="12" rx="2" fill="#1E8E3E" />
      <path d="M22 4l14 12H22V4z" fill="#1A7340" />
    </svg>
  )
}

/** Notion — marca simplificada */
export function LogoNotion({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="4" width="36" height="40" rx="4" fill="white" className="stroke-border" strokeWidth="1" />
      <path
        d="M14 12h20v24c0 1.1-.9 2-2 2H14V12z"
        fill="#000"
        opacity="0.88"
      />
      <path d="M26 12l8 8v-8H26z" fill="#000" opacity="0.55" />
      <rect x="16" y="28" width="12" height="2" rx="1" fill="white" opacity="0.35" />
      <rect x="16" y="32" width="9" height="2" rx="1" fill="white" opacity="0.25" />
    </svg>
  )
}

/** RD Station — monograma (evita &lt;text&gt; no SVG) */
export function LogoRdStation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F04E23] text-[9px] font-black tracking-tighter text-white",
        box,
        className
      )}
      aria-hidden
    >
      RD
    </div>
  )
}

/** Google “G” multicolor (OAuth) */
export function LogoGoogleMark({ className }: { className?: string }) {
  return (
    <svg className={cn(box, className)} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
        fill="#FFC107"
      />
      <path
        d="M6.3 14.7l7.1 5.2C15.1 16 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.7 0-14.4 4.4-17.7 10.7z"
        fill="#FF3D00"
      />
      <path
        d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.6 37 26.9 38 24 38c-6.1 0-10.7-3.1-11.8-7.5L5 36c3.3 6.3 10 10 19 10z"
        fill="#4CAF50"
      />
      <path
        d="M44.5 20H24v8.5h11.8c-.7 2.1-2 4-3.7 5.3l6.6 5.6C42 37 46 31 46 24c0-1.3-.2-2.7-.5-4z"
        fill="#1976D2"
      />
    </svg>
  )
}
