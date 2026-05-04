"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import * as Dialog from "@radix-ui/react-dialog";

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};
import api from "@/utils/api";
import { isValidCpf } from "@/lib/validations/cpf";
import { messageFromResponseData } from "@/lib/cockpit/normalize-api-message";
import { ConfettiBurst } from "./confetti-burst";
import { OrbitMark, OrbitLogoLockup, OrbitWordmark } from "@/components/brand/orbit-logo";

/* ─────────────────────────────────────────────────────────────────────────
   Tipos
───────────────────────────────────────────────────────────────────────── */
type Tab = "login" | "register";
type LockInfo = { until: number; attempts: number };

const LOCK_KEY = "rf_login_lock";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 2 * 60 * 1000;

/* ── Máscaras de input ── */
function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Utilitários de lockout
───────────────────────────────────────────────────────────────────────── */
function getLock(): LockInfo {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { until: 0, attempts: 0 };
    return JSON.parse(raw) as LockInfo;
  } catch {
    return { until: 0, attempts: 0 };
  }
}
function saveLock(info: LockInfo) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(info));
}
function clearLock() {
  localStorage.removeItem(LOCK_KEY);
}

/* ─────────────────────────────────────────────────────────────────────────
   Password strength
───────────────────────────────────────────────────────────────────────── */
function passwordStrength(pw: string) {
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const long = pw.length >= 8;
  const veryLong = pw.length >= 12;
  const score = [long, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  const strong = long && hasUpper && hasLower && hasNumber && hasSymbol;
  const medium = long && score >= 3 && !strong;
  const weak = pw.length > 0 && !medium && !strong;
  const level: "weak" | "medium" | "strong" | null =
    pw.length === 0 ? null : strong ? "strong" : medium ? "medium" : "weak";
  const bars = pw.length === 0 ? 0 : strong ? 4 : medium ? (veryLong ? 3 : 2) : 1;
  return { strong, medium, weak, level, bars };
}

/* ─────────────────────────────────────────────────────────────────────────
   SVG icons inline (sem dependência extra)
───────────────────────────────────────────────────────────────────────── */
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPhone = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-3-8.59A2 2 0 012.08 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.21 9.5a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const IconId = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);
const IconEye = ({ off }: { off?: boolean }) =>
  off ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
const IconAlert = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconCheck = ({ size = 15, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconClose = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconArrowIn = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);
const IconUserPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);
const GoogleLogo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────
   Componentes de campo reutilizáveis
───────────────────────────────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, icon, error, hint, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--rf-text-secondary)",
          marginBottom: 6,
          fontFamily: "var(--font-rf-body, sans-serif)",
        }}
      >
        {label}
      </label>
      {icon ? (
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--rf-text-muted)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {icon}
          </span>
          {children}
        </div>
      ) : (
        children
      )}
      {error && (
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-danger)",
            marginTop: 5,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <IconAlert size={11} />
          {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11, color: "var(--rf-text-muted)", marginTop: 5 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function FieldInput({
  hasIcon,
  hasEye,
  error,
  success,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  hasIcon?: boolean;
  hasEye?: boolean;
  error?: boolean;
  success?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    background: "var(--rf-bg-elevated)",
    border: `1px solid ${
      error
        ? "var(--rf-danger)"
        : success
          ? "var(--rf-success)"
          : "var(--rf-border-default)"
    }`,
    borderRadius: "var(--rf-radius-md)",
    padding: hasIcon
      ? hasEye
        ? "9px 38px 9px 38px"
        : "9px 14px 9px 38px"
      : hasEye
        ? "9px 38px 9px 14px"
        : "9px 14px",
    color: "var(--rf-text-primary)",
    fontFamily: "var(--font-rf-body, sans-serif)",
    fontSize: 13.5,
    outline: "none",
    transition: `all var(--rf-transition)`,
    boxShadow: error
      ? "0 0 0 3px var(--rf-danger-soft)"
      : success
        ? "0 0 0 3px var(--rf-success-soft)"
        : "none",
  };
  return <input {...props} style={base} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   Barra de força de senha
───────────────────────────────────────────────────────────────────────── */
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const { level, bars } = passwordStrength(password);
  const labels: Record<string, string> = {
    weak: "Senha fraca",
    medium: "Senha média",
    strong: "Senha forte ✓",
  };
  const colors: Record<string, string> = {
    weak: "var(--rf-danger)",
    medium: "var(--rf-warning)",
    strong: "var(--rf-success)",
  };
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background:
                i < bars && level ? colors[level] : "var(--rf-border-subtle)",
              transition: "background var(--rf-transition)",
            }}
          />
        ))}
      </div>
      {level && (
        <div style={{ fontSize: 11, color: "var(--rf-text-muted)" }}>
          {labels[level]}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Error Banner
───────────────────────────────────────────────────────────────────────── */
function ErrorBanner({ title, message }: { title: string; message?: string }) {
  return (
    <div
      style={{
        background: "var(--rf-danger-soft)",
        border: "1px solid rgba(239,68,68,0.22)",
        borderRadius: "var(--rf-radius-md)",
        padding: "10px 14px",
        marginBottom: 20,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ color: "var(--rf-danger)", flexShrink: 0, marginTop: 1 }}>
        <IconAlert size={15} />
      </span>
      <div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--rf-danger)",
          }}
        >
          {title}
        </div>
        {message && (
          <div
            style={{
              fontSize: 11.5,
              color: "var(--rf-text-secondary)",
              marginTop: 2,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Tab switcher
───────────────────────────────────────────────────────────────────────── */
function AuthTabs({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  return (
    <div
      className="auth-tabs-rf"
      style={{
        display: "flex",
        gap: 2,
        background: "var(--rf-bg-overlay)",
        border: "1px solid var(--rf-border-subtle)",
        borderRadius: "var(--rf-radius-md)",
        padding: 3,
        marginBottom: 28,
      }}
    >
      {(["login", "register"] as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          style={{
            flex: 1,
            textAlign: "center",
            padding: "7px 12px",
            borderRadius: "calc(var(--rf-radius-md) - 2px)",
            fontSize: 13,
            fontWeight: 600,
            color: tab === t ? "var(--rf-text-primary)" : "var(--rf-text-muted)",
            background: tab === t ? "var(--rf-bg-surface)" : "transparent",
            boxShadow: tab === t ? "var(--rf-shadow-md)" : "none",
            border: "none",
            cursor: "pointer",
            transition: "all var(--rf-transition)",
            fontFamily: "var(--font-rf-body, sans-serif)",
          }}
        >
          {t === "login" ? "Entrar" : "Criar conta"}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Hero mobile — gradiente + headline (referência layout mobile)
───────────────────────────────────────────────────────────────────────── */
function AuthMobileHero({ tab }: { tab: Tab }) {
  const isLogin = tab === "login";
  return (
    <div className="auth-mobile-hero">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 1,
          marginBottom: 16,
        }}
      >
        <OrbitMark size={32} />
        <OrbitWordmark size="sm" />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <h2
          style={{
            fontFamily: "var(--font-rf-display, sans-serif)",
            fontSize: "clamp(1.35rem, 4.2vw, 1.5rem)",
            fontWeight: 800,
            lineHeight: 1.25,
            color: "var(--rf-text-primary)",
            letterSpacing: "-0.4px",
            marginBottom: 10,
          }}
        >
          {isLogin ? (
            <>
              Gestão de{" "}
              <span style={{ color: "var(--rf-accent)" }}>rituais</span> que
              geram resultados.
            </>
          ) : (
            <>
              Comece a{" "}
              <span style={{ color: "var(--rf-accent)" }}>transformar</span> sua
              gestão hoje.
            </>
          )}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--rf-text-secondary)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {isLogin
            ? "Acompanhe metas, KPIs e planos de ação em um único cockpit estratégico."
            : "Configure sua equipe e comece a acompanhar resultados em minutos."}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Painel de marca (esquerda)
───────────────────────────────────────────────────────────────────────── */
type BrandFeatureItem = {
  icon: React.ReactNode;
  colorClass: "purple" | "cyan" | "green";
  title: string;
  subtitle: string;
};

function BrandPanel({ tab }: { tab: Tab }) {
  const loginFeatures: BrandFeatureItem[] = [
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-accent)" strokeWidth="2.2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
      colorClass: "purple",
      title: "Cockpit Estratégico",
      subtitle: "Visão 360° das métricas",
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-cyan)" strokeWidth="2.2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      colorClass: "cyan",
      title: "KPIs em Tempo Real",
      subtitle: "Dashboards automáticos",
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-success)" strokeWidth="2.2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
      colorClass: "green",
      title: "Planos de Ação",
      subtitle: "Do planejamento à entrega",
    },
  ];
  const registerFeatures: BrandFeatureItem[] = [
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-accent)" strokeWidth="2.2">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-2a6 6 0 0112 0v2" />
        </svg>
      ),
      colorClass: "purple",
      title: "Setup em 5 minutos",
      subtitle: "Onboarding guiado",
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-cyan)" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      colorClass: "cyan",
      title: "Multi-equipes",
      subtitle: "Gerencie times ilimitados",
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rf-success)" strokeWidth="2.2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      colorClass: "green",
      title: "14 dias grátis",
      subtitle: "Sem cartão de crédito",
    },
  ];

  const isLogin = tab === "login";
  const features = isLogin ? loginFeatures : registerFeatures;
  const colorBg: Record<BrandFeatureItem["colorClass"], string> = {
    purple: "var(--rf-accent-soft)",
    cyan: "var(--rf-cyan-soft)",
    green: "var(--rf-success-soft)",
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "36px 44px",
        position: "relative",
        overflow: "hidden",
        background: "var(--rf-bg-base)",
        minHeight: "100svh",
      }}
    >
      {/* Gradientes decorativos */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 15% 85%, rgba(123,97,255,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 85% 15%, rgba(0,212,255,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 35% at 50% 50%, rgba(123,97,255,0.04) 0%, transparent 70%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Logo — topo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "relative",
          zIndex: 1,
          marginBottom: 0,
        }}
      >
        <OrbitMark size={32} />
        <OrbitWordmark size="sm" />
      </div>

      {/* Espaçador flexível — empurra o conteúdo para o centro/baixo */}
      <div style={{ flex: "0 0 15%" }} />

      {/* Conteúdo da marca — centro-baixo */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-rf-display, sans-serif)",
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1.2,
            color: "var(--rf-text-primary)",
            letterSpacing: "-0.4px",
            marginBottom: 12,
          }}
        >
          {isLogin ? (
            <>
              Gestão de{" "}
              <span style={{ color: "var(--rf-accent)" }}>rituais</span> que
              geram resultados.
            </>
          ) : (
            <>
              Comece a{" "}
              <span style={{ color: "var(--rf-accent)" }}>transformar</span>{" "}
              sua gestão hoje.
            </>
          )}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--rf-text-secondary)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          {isLogin
            ? "Acompanhe metas, KPIs e planos de ação em um único cockpit estratégico."
            : "Configure sua equipe e comece a acompanhar resultados em minutos."}
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "var(--rf-bg-surface)",
                border: "1px solid var(--rf-border-subtle)",
                borderRadius: "var(--rf-radius-md)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: "var(--rf-radius-sm)",
                  display: "grid",
                  placeItems: "center",
                  background: colorBg[f.colorClass],
                }}
              >
                {f.icon}
              </div>
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--rf-text-primary)",
                  }}
                >
                  {f.title}
                </strong>
                <span style={{ fontSize: 11, color: "var(--rf-text-muted)" }}>
                  {f.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Modal — Recuperar senha
───────────────────────────────────────────────────────────────────────── */
function ForgotPasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setEmail("");
      setLoading(false);
      setSent(false);
    }, 300);
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(13,15,20,0.45)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 50,
  };
  const boxStyle: React.CSSProperties = {
    background: "var(--rf-bg-surface)",
    border: "1px solid var(--rf-border-default)",
    borderRadius: "var(--rf-radius-xl)",
    padding: 32,
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.07)",
    position: "relative",
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle}>
          <Dialog.Content style={boxStyle}>
            <Dialog.Title style={srOnly}>Recuperar senha</Dialog.Title>
            <Dialog.Description style={srOnly}>
              Digite seu e-mail para receber o link de recuperação de senha.
            </Dialog.Description>

            {/* Botão fechar */}
            <button className="rf-modal-close" onClick={handleClose}>
              <IconClose />
            </button>

            {!sent ? (
              <>
                {/* Ícone */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--rf-radius-md)",
                    background: "var(--rf-accent-soft)",
                    border: "1px solid var(--rf-accent-border)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 16,
                    color: "var(--rf-accent)",
                  }}
                >
                  <IconLock />
                </div>

                <h2
                  style={{
                    fontFamily: "var(--font-rf-display, sans-serif)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--rf-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  Recuperar senha
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--rf-text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: 22,
                  }}
                >
                  Digite seu e-mail cadastrado e enviaremos um link para
                  redefinir sua senha.
                </p>

                <Field label="E-mail cadastrado" icon={<IconMail />} hint="Você receberá o link em até 2 minutos.">
                  <FieldInput
                    type="email"
                    placeholder="carlos@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    hasIcon
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                </Field>

                <button
                  className="rf-btn-modal-primary"
                  onClick={handleSend}
                  disabled={loading || !email.trim()}
                  style={{ marginTop: 6, marginBottom: 8 }}
                >
                  {loading ? (
                    <span style={{ opacity: 0.7 }}>Enviando…</span>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </button>
                <button className="rf-btn-modal-ghost" onClick={handleClose}>
                  Voltar ao login
                </button>
              </>
            ) : (
              /* Estado: e-mail enviado */
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--rf-radius-xl)",
                    background: "var(--rf-success-soft)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 14px",
                    color: "var(--rf-success)",
                    fontSize: 22,
                  }}
                >
                  ✓
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-rf-display, sans-serif)",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--rf-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  E-mail enviado!
                </h2>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--rf-text-secondary)",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  Enviamos um link de recuperação para o endereço abaixo.
                  Verifique sua caixa de entrada.
                </p>
                <div
                  style={{
                    fontFamily: "var(--font-rf-mono, monospace)",
                    fontSize: 12,
                    background: "var(--rf-bg-elevated)",
                    border: "1px solid var(--rf-border-default)",
                    borderRadius: "var(--rf-radius-sm)",
                    padding: "6px 12px",
                    color: "var(--rf-accent)",
                    display: "inline-block",
                    marginBottom: 20,
                  }}
                >
                  {email}
                </div>
                <button
                  className="rf-btn-modal-primary"
                  style={{ marginBottom: 8 }}
                  onClick={handleClose}
                >
                  Fechar
                </button>
                <button className="rf-btn-modal-ghost" onClick={() => setSent(false)}>
                  Não recebi — reenviar
                </button>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-text-muted)",
                    marginTop: 12,
                  }}
                >
                  O link expira em{" "}
                  <span style={{ color: "var(--rf-warning)", fontWeight: 600 }}>
                    30 minutos
                  </span>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Modal — Conta criada com sucesso
───────────────────────────────────────────────────────────────────────── */
function AccountCreatedDialog({
  open,
  onClose,
  name,
  email,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
}) {
  const router = useRouter();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(13,15,20,0.45)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 50,
  };
  const boxStyle: React.CSSProperties = {
    background: "var(--rf-bg-surface)",
    border: "1px solid var(--rf-border-default)",
    borderRadius: "var(--rf-radius-xl)",
    padding: 32,
    width: "100%",
    maxWidth: 360,
    boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.07)",
    position: "relative",
    textAlign: "center",
    overflow: "visible",
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle}>
          <Dialog.Content style={boxStyle}>
            <Dialog.Title style={srOnly}>Conta criada com sucesso</Dialog.Title>
            <Dialog.Description style={srOnly}>
              Sua conta no Orbit foi criada. Acesse o cockpit para começar.
            </Dialog.Description>

            {/* ── Confetti: espalhado a partir do topo central do modal ── */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "18%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 200,
              }}
            >
              <ConfettiBurst
                active={open}
                loop
                duration={5}
                repeatDelay={2.2}
                count={90}
              />
            </div>

            {/* Ícone de sucesso */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--rf-radius-xl)",
                background: "var(--rf-accent-soft)",
                border: "1px solid var(--rf-accent-border)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                position: "relative",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rf-accent)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 14,
                  height: 14,
                  background: "var(--rf-success)",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-rf-display, sans-serif)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--rf-text-primary)",
                marginBottom: 6,
              }}
            >
              Conta criada! 🎉
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--rf-text-secondary)",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              Seu acesso ao Orbit está pronto. Confirme seu e-mail para ativar
              todas as funcionalidades.
            </p>

            {/* Card do usuário */}
            <div
              style={{
                background: "var(--rf-bg-elevated)",
                border: "1px solid var(--rf-border-default)",
                borderRadius: "var(--rf-radius-md)",
                padding: "12px 16px",
                marginBottom: 20,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-text-muted)",
                  marginBottom: 4,
                }}
              >
                Logado como
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--rf-accent), var(--rf-cyan))",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--rf-text-primary)",
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--rf-text-muted)" }}
                  >
                    {email}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="rf-btn-modal-primary"
              style={{ marginBottom: 8 }}
              onClick={() => router.push("/cockpit")}
            >
              Ir para o Cockpit →
            </button>
            <button className="rf-btn-modal-ghost" onClick={onClose}>
              Verificar e-mail primeiro
            </button>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Formulário de Login
───────────────────────────────────────────────────────────────────────── */
function LoginForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [forgotOpen, setForgotOpen] = useState(false);

  /* — Carrega lockout do localStorage — */
  useEffect(() => {
    const lock = getLock();
    if (lock.until > Date.now()) {
      setLockedUntil(lock.until);
      setAttempts(lock.attempts);
    } else if (lock.until) {
      clearLock();
    }
  }, []);

  /* — Countdown do bloqueio — */
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (rem <= 0) {
        clearLock();
        setLockedUntil(0);
        setAttempts(0);
        setError("");
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(rem);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil > Date.now();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!cpf.trim() || !password) return;

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      setError("Informe o CPF completo (11 dígitos). O login usa CPF, não e-mail.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setError("CPF inválido. Confira os números digitados.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        cpf: cpf.trim(),
        password,
      });

      if (res?.ok) {
        clearLock();
        // Navegação completa garante que o cookie de sessão seja enviado ao middleware (evita 307 em /cockpit).
        window.location.assign("/cockpit");
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCK_DURATION_MS;
        saveLock({ until, attempts: newAttempts });
        setLockedUntil(until);
        setError("Conta bloqueada por 2 minutos após 5 tentativas inválidas.");
      } else {
        saveLock({ until: 0, attempts: newAttempts });
        const err = res?.error ?? "";
        setError(
          err.includes("CredentialsSignin") || err.toLowerCase().includes("credential")
            ? "CPF ou senha incorretos. Confira os dados ou se a API está em execução (ex.: http://localhost:8081)."
            : err || "Não foi possível entrar. Tente novamente.",
        );
      }
    } catch {
      setError(
        "Erro de conexão. Verifique se a API está rodando (ex.: porta 8081) e tente de novo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const hasError = !!error;
  const btnDanger = hasError && !isLocked;
  const mm = Math.floor(countdown / 60);
  const ss = String(countdown % 60).padStart(2, "0");

  return (
    <>
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <form onSubmit={handleSubmit}>
        <h1
          style={{
            fontFamily: "var(--font-rf-display, sans-serif)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--rf-text-primary)",
            marginBottom: 4,
          }}
        >
          Bem-vindo de volta
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--rf-text-secondary)",
            marginBottom: 24,
          }}
        >
          Acesse sua conta para continuar
        </p>

        {/* Banner de erro / bloqueio */}
        {isLocked && (
          <ErrorBanner
            title="Conta temporariamente bloqueada"
            message={`Aguarde ${mm}:${ss} antes de tentar novamente.`}
          />
        )}
        {hasError && !isLocked && (
          <ErrorBanner
            title="Não foi possível entrar"
            message={error}
          />
        )}

        <Field
          label="CPF"
          icon={<IconUser />}
        >
          <FieldInput
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            hasIcon
            error={hasError && !isLocked}
            disabled={isLocked}
            autoComplete="username"
            inputMode="numeric"
          />
        </Field>

        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--rf-text-secondary)",
              marginBottom: 6,
              fontFamily: "var(--font-rf-body, sans-serif)",
            }}
          >
            Senha
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--rf-text-muted)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <IconLock />
            </span>
            <FieldInput
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hasIcon
              hasEye
              error={hasError && !isLocked}
              disabled={isLocked}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--rf-text-muted)",
                background: "none",
                border: "none",
                padding: 2,
                cursor: "pointer",
                display: "flex",
                zIndex: 1,
              }}
            >
              <IconEye off={showPw} />
            </button>
          </div>
        </div>

        {/* Esqueci minha senha */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6, marginBottom: 20 }}>
          <button
            type="button"
            className="rf-forgot-link"
            onClick={() => setForgotOpen(true)}
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Botão principal */}
        <button
          type="submit"
          className={`rf-btn-auth${btnDanger ? " danger" : ""}`}
          disabled={loading || isLocked || !cpf.trim() || !password}
        >
          {loading ? (
            <span style={{ opacity: 0.7 }}>Entrando…</span>
          ) : isLocked ? (
            <>
              <IconAlert size={15} />
              Bloqueado — {mm}:{ss}
            </>
          ) : btnDanger ? (
            <>
              <IconAlert size={15} />
              Tentativa inválida ({attempts}/{MAX_ATTEMPTS})
            </>
          ) : (
            <>
              <IconArrowIn />
              Entrar no Orbit
            </>
          )}
        </button>

        {/* Divisor + social */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "16px 0",
            fontSize: 12,
            color: "var(--rf-text-muted)",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--rf-border-subtle)" }} />
          ou
          <div style={{ flex: 1, height: 1, background: "var(--rf-border-subtle)" }} />
        </div>

        <button type="button" className="rf-btn-social">
          <GoogleLogo />
          Continuar com Google
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--rf-text-muted)",
            marginTop: 18,
          }}
        >
          Não tem conta?{" "}
          <button type="button" className="rf-switch-link" onClick={onSwitchTab}>
            Criar agora
          </button>
        </p>
      </form>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Formulário de Cadastro
───────────────────────────────────────────────────────────────────────── */

type RegisterFields = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  terms: boolean;
};
type RegisterErrors = Partial<Record<keyof RegisterFields | "general", string>>;

function RegisterForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const [fields, setFields] = useState<RegisterFields>({
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdDialog, setCreatedDialog] = useState(false);
  const [createdName, setCreatedName] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");

  const set = (key: keyof RegisterFields, value: string | boolean) =>
    setFields((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const e: RegisterErrors = {};
    if (!fields.firstName.trim()) e.firstName = "Nome obrigatório";
    if (!fields.lastName.trim()) e.lastName = "Sobrenome obrigatório";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fields.email.trim()) e.email = "E-mail obrigatório";
    else if (!emailRe.test(fields.email)) e.email = "E-mail inválido — verifique o formato";
    const cpfDigits = fields.cpf.replace(/\D/g, "");
    if (!cpfDigits) e.cpf = "CPF obrigatório";
    else if (cpfDigits.length < 11) e.cpf = "CPF incompleto";
    else if (!isValidCpf(cpfDigits)) e.cpf = "CPF inválido";
    const { strong, level } = passwordStrength(fields.password);
    if (!fields.password) e.password = "Senha obrigatória";
    else if (!strong) {
      const hints: Record<string, string> = {
        weak: "Senha fraca — use maiúsculas, números e símbolos",
        medium: "Senha média — adicione símbolos ou aumente o tamanho",
      };
      e.password = hints[level ?? "weak"] ?? "Senha não atende aos requisitos mínimos";
    }
    if (!fields.terms) e.terms = "Aceite os termos para continuar";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const name = `${fields.firstName.trim()} ${fields.lastName.trim()}`;
      await api.post("/user", {
        name,
        email: fields.email.trim().toLowerCase(),
        cpf: fields.cpf.replace(/\D/g, ""),
        phone: fields.phone.replace(/\D/g, "") || undefined,
        password: fields.password,
      });
      setCreatedName(name);
      setCreatedEmail(fields.email.trim().toLowerCase());
      setCreatedDialog(true);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      const msg = messageFromResponseData(data);
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("e-mail")) {
        setErrors({ email: msg });
      } else if (msg.toLowerCase().includes("cpf")) {
        setErrors({ cpf: msg });
      } else {
        setErrors({ general: msg || "Erro ao criar conta. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  const str = passwordStrength(fields.password);

  return (
    <>
      <AccountCreatedDialog
        open={createdDialog}
        onClose={() => setCreatedDialog(false)}
        name={createdName}
        email={createdEmail}
      />

      <form onSubmit={handleSubmit} noValidate>
        <h1
          style={{
            fontFamily: "var(--font-rf-display, sans-serif)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--rf-text-primary)",
            marginBottom: 4,
          }}
        >
          Crie sua conta
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--rf-text-secondary)",
            marginBottom: 24,
          }}
        >
          Preencha os dados para começar
        </p>

        {errors.general && (
          <ErrorBanner title="Erro ao criar conta" message={errors.general} />
        )}

        {/* Nome + Sobrenome */}
        <div className="auth-register-name-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Nome" error={errors.firstName}>
            <FieldInput
              type="text"
              placeholder="Carlos"
              value={fields.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              error={!!errors.firstName}
            />
          </Field>
          <Field label="Sobrenome" error={errors.lastName}>
            <FieldInput
              type="text"
              placeholder="Silva"
              value={fields.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              error={!!errors.lastName}
            />
          </Field>
        </div>

        {/* E-mail */}
        <Field label="E-mail corporativo" icon={<IconMail />} error={errors.email}>
          <FieldInput
            type="email"
            placeholder="carlos@empresa.com.br"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            hasIcon
            error={!!errors.email}
            autoComplete="email"
          />
        </Field>

        {/* CPF */}
        <Field label="CPF" icon={<IconUser />} error={errors.cpf}>
          <FieldInput
            type="text"
            placeholder="000.000.000-00"
            value={fields.cpf}
            onChange={(e) => set("cpf", formatCpf(e.target.value))}
            hasIcon
            error={!!errors.cpf}
            autoComplete="off"
            inputMode="numeric"
          />
        </Field>

        {/* Telefone */}
        <Field label="Telefone" icon={<IconPhone />}>
          <FieldInput
            type="text"
            placeholder="(11) 99999-9999"
            value={fields.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
            hasIcon
            autoComplete="tel"
            inputMode="numeric"
          />
        </Field>

        {/* Senha + força */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--rf-text-secondary)",
              marginBottom: 6,
              fontFamily: "var(--font-rf-body, sans-serif)",
            }}
          >
            Senha
          </label>
          <div style={{ position: "relative" }}>
            {/* Ícone do cadeado */}
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--rf-text-muted)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <IconLock />
            </span>
            <FieldInput
              type={showPw ? "text" : "password"}
              placeholder="Mín. 8 caracteres"
              value={fields.password}
              onChange={(e) => set("password", e.target.value)}
              hasIcon
              hasEye
              error={!!errors.password}
              success={!!fields.password && str.strong}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--rf-text-muted)",
                background: "none",
                border: "none",
                padding: 2,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <IconEye off={showPw} />
            </button>
          </div>
          <StrengthBar password={fields.password} />
          {errors.password && (
            <div
              style={{
                fontSize: 11,
                color: "var(--rf-danger)",
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IconAlert size={11} />
              {errors.password}
            </div>
          )}
        </div>

        {/* Termos */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => set("terms", !fields.terms)}
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              flexShrink: 0,
              border: `1px solid ${errors.terms ? "var(--rf-danger)" : "var(--rf-border-strong)"}`,
              background: fields.terms ? "var(--rf-accent)" : "var(--rf-bg-elevated)",
              display: "grid",
              placeItems: "center",
              marginTop: 1,
              cursor: "pointer",
              transition: "all var(--rf-transition)",
            }}
          >
            {fields.terms && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <div style={{ fontSize: 12, color: "var(--rf-text-secondary)", lineHeight: 1.5 }}>
            Concordo com os{" "}
            <a href="#" style={{ color: "var(--rf-accent)", textDecoration: "none" }}>
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" style={{ color: "var(--rf-accent)", textDecoration: "none" }}>
              Política de Privacidade
            </a>
            {errors.terms && (
              <div style={{ color: "var(--rf-danger)", fontSize: 11, marginTop: 3 }}>
                {errors.terms}
              </div>
            )}
          </div>
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="rf-btn-auth"
          disabled={loading}
        >
          {loading ? (
            <span style={{ opacity: 0.7 }}>Criando conta…</span>
          ) : (
            <>
              <IconUserPlus />
              Criar minha conta
            </>
          )}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--rf-text-muted)",
            marginTop: 18,
          }}
        >
          Já tem conta?{" "}
          <button type="button" className="rf-switch-link" onClick={onSwitchTab}>
            Entrar agora
          </button>
        </p>
      </form>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AuthModal — componente raiz (split-screen)
───────────────────────────────────────────────────────────────────────── */
export function AuthModal({ defaultTab = "login" }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div
      className="rf-auth auth-root"
      style={{
        minHeight: "100svh",
        background: "var(--rf-bg-base)",
      }}
    >
      {/* CSS responsivo inline */}
      <style>{`
        .auth-root {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 900px) {
          .auth-root { flex-direction: row; }
        }
        .auth-brand-panel {
          display: none;
          flex-direction: column;
          width: 44%;
          flex-shrink: 0;
        }
        @media (min-width: 900px) {
          .auth-brand-panel { display: flex; }
          .auth-form-side { flex: 1; }
        }
        .auth-mobile-hero {
          display: none;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          padding: max(12px, env(safe-area-inset-top)) 20px 8px;
          background: linear-gradient(180deg, #fbfdff 0%, #f3f5ff 42%, #eceef5 100%);
        }
        .auth-mobile-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 90% 70% at 15% 95%, rgba(127, 86, 217, 0.14) 0%, transparent 58%),
            radial-gradient(ellipse 55% 45% at 88% 8%, rgba(0, 212, 255, 0.07) 0%, transparent 55%);
          pointer-events: none;
        }
        @media (max-width: 899px) {
          .auth-mobile-hero { display: flex; }
        }
        @media (max-width: 899px) {
          .auth-form-side {
            flex-direction: column !important;
            padding: 0 !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            background: #ffffff !important;
            min-height: 0 !important;
            flex: 1;
          }
          .auth-form-card {
            max-width: none !important;
            flex: 1;
            margin-top: -10px;
            border-radius: 20px 20px 0 0 !important;
            border: none !important;
            border-top: 1px solid rgba(208, 213, 221, 0.45) !important;
            box-shadow: 0 -8px 32px rgba(13, 15, 20, 0.06) !important;
            padding: 24px 20px max(24px, env(safe-area-inset-bottom)) !important;
          }
          .auth-logo-above-tabs { display: none !important; }
          .auth-tabs-rf {
            border-radius: 999px !important;
            padding: 4px !important;
            background: #eef0f4 !important;
            border: 1px solid rgba(208, 213, 221, 0.55) !important;
          }
          .rf-auth .auth-form-card input:not([type="checkbox"]) {
            background: #f9fafb !important;
            border-color: #d0d5dd !important;
          }
          .auth-register-name-row {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 520px) and (max-width: 899px) {
          .auth-register-name-row {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* ── Painel esquerdo: marca ── */}
      <div className="auth-brand-panel">
        <BrandPanel tab={tab} />
      </div>

      {/* ── Hero apenas no layout mobile (max-width 899px) ── */}
      <AuthMobileHero tab={tab} />

      {/* ── Painel direito: fundo base + card centralizado ── */}
      <div
        className="auth-form-side"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "var(--rf-bg-base)",
          minHeight: "100svh",
        }}
      >
        {/* Card do formulário — borda curva + sombra */}
        <div
          className="auth-form-card"
          style={{
            width: "100%",
            maxWidth: 420,
            background: "var(--rf-bg-surface)",
            border: "1px solid var(--rf-border-default)",
            borderRadius: "var(--rf-radius-xl)",
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)",
            padding: "36px 36px 32px",
          }}
        >
          {/* Logo + nome do sistema acima dos tabs (desktop / tablet largura do card) */}
          <div
            className="auth-logo-above-tabs"
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <OrbitLogoLockup markSize={40} />
          </div>

          {/* Tabs */}
          <AuthTabs tab={tab} setTab={setTab} />

          {/* Conteúdo do formulário */}
          {tab === "login" ? (
            <LoginForm onSwitchTab={() => setTab("register")} />
          ) : (
            <RegisterForm onSwitchTab={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
