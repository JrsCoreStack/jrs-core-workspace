"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, Loader2, CheckCircle2,
  Mail, Lock, User, Phone, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/utils/api";

type Tab = "login" | "register";

/* ── masks ──────────────────────────────────────────── */
const maskCpf = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
};

/* ── input field ────────────────────────────────────── */
function Input({
  id, label, type = "text", placeholder, value, onChange,
  icon: Icon, right, hint, required, disabled, maxLength, autoComplete,
}: {
  id: string; label?: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode; hint?: string; required?: boolean;
  disabled?: boolean; maxLength?: number; autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[13px] font-medium text-white/70 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors">
            <Icon className="h-[15px] w-[15px]" />
          </span>
        )}
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required} disabled={disabled} maxLength={maxLength}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-xl border border-white/8 bg-white/5 py-3 text-sm text-white/90 placeholder:text-white/20",
            "focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:bg-white/7",
            "transition-all duration-200 disabled:opacity-50",
            Icon  ? "pl-10" : "pl-4",
            right ? "pr-11" : "pr-4",
          )}
        />
        {right && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
      {hint && <p className="text-[11px] leading-relaxed text-white/30">{hint}</p>}
    </div>
  );
}

/* ── password input ─────────────────────────────────── */
function PasswordInput(props: Omit<Parameters<typeof Input>[0], "type" | "right">) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      right={
        <button type="button" tabIndex={-1} onClick={() => setShow(!show)}
          className="text-white/30 hover:text-white/60 transition-colors">
          {show ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
        </button>
      }
    />
  );
}

/* ── divider ────────────────────────────────────────── */
function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-white/8" />
      <span className="shrink-0 text-[11px] font-medium tracking-widest text-white/25 uppercase">{label}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

/* ── social button ──────────────────────────────────── */
function SocialBtn({ children }: { children: React.ReactNode }) {
  return (
    <button type="button"
      className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/8 bg-white/4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/8 hover:text-white/80 hover:border-white/15 active:scale-[0.97]">
      {children}
    </button>
  );
}

/* ── error banner ───────────────────────────────────── */
function ErrBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-[13px] text-red-300/90">
      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
      {msg}
    </div>
  );
}

/* ── google icon ─────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

/* ── github icon ─────────────────────────────────────── */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.005 2.05.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   LOGIN TAB
══════════════════════════════════════════════════════ */
function LoginTab() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", { cpf, password, redirect: false });
      if (res?.error) { setError("Credenciais inválidas. Verifique seu CPF e senha."); setLoading(false); return; }
      if (res?.ok) { router.push("/home"); router.refresh(); }
    } catch { setError("Erro ao fazer login. Tente novamente."); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <ErrBanner msg={error} />}

      <Input id="cpf" label="CPF" placeholder="000.000.000-00" value={cpf}
        onChange={(v) => setCpf(maskCpf(v))} icon={CreditCard}
        maxLength={14} required disabled={loading} autoComplete="username" />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="pwd" className="block text-[13px] font-medium text-white/70 tracking-wide">Senha</label>
          <button type="button" className="text-[12px] font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Esqueceu a senha?
          </button>
        </div>
        <PasswordInput id="pwd" placeholder="••••••••" value={password}
          onChange={setPassword} icon={Lock} required disabled={loading} autoComplete="current-password" />
      </div>

      {/* CTA – white button like reference */}
      <button type="submit" disabled={loading}
        className="relative w-full overflow-hidden rounded-xl bg-white py-3 text-[14px] font-semibold text-gray-900 shadow-lg shadow-black/30 transition-all hover:bg-white/92 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Entrando…</> : "Entrar no Sistema"}
      </button>

      <Divider label="ou continue com" />

      <div className="flex gap-3">
        <SocialBtn><GoogleIcon />Google</SocialBtn>
        <SocialBtn><GitHubIcon />GitHub</SocialBtn>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   REGISTER TAB
══════════════════════════════════════════════════════ */
function RegisterTab({ onRegistered }: { onRegistered: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", email: "", cpf: "", phone: "", password: "" });
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const valid = f.name.trim() && f.email.trim() && f.cpf.replace(/\D/g,"").length === 11
    && f.phone.replace(/\D/g,"").length >= 10 && f.password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/user", {
        name: f.name.trim(), email: f.email.trim(),
        cpf: f.cpf.replace(/\D/g,""), phone: f.phone.replace(/\D/g,""),
        password: f.password, totp_secret: null, is2fa_enabled: false,
        created_at: new Date(), updated_at: new Date(),
      });
      setSuccess(true);
      setTimeout(() => onRegistered(), 2800);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? "Erro ao criar conta. Tente novamente.");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
        <div className="relative h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-purple-400" />
        </div>
      </div>
      <div>
        <p className="text-[17px] font-bold text-white">Conta criada com sucesso!</p>
        <p className="mt-1.5 text-[13px] text-white/40">Redirecionando para o login…</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrBanner msg={error} />}

      {/* Name + CPF side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Input id="r-name" label="Nome completo" placeholder="João Silva" value={f.name}
          onChange={set("name")} icon={User} required />
        <Input id="r-cpf" label="CPF" placeholder="000.000.000-00" value={f.cpf}
          onChange={(v) => set("cpf")(maskCpf(v))} icon={CreditCard} maxLength={14} required />
      </div>

      <Input id="r-email" label="E-mail" type="email" placeholder="nome@empresa.com.br"
        value={f.email} onChange={set("email")} icon={Mail} required />

      <Input id="r-phone" label="Telefone" placeholder="(00) 00000-0000" value={f.phone}
        onChange={(v) => set("phone")(maskPhone(v))} icon={Phone} maxLength={15} required />

      <PasswordInput id="r-pass" label="Senha" placeholder="Crie uma senha forte"
        value={f.password} onChange={set("password")} icon={Lock}
        hint="Mínimo 8 caracteres — letras, números e símbolo" required />

      {/* CTA – purple gradient button like reference */}
      <button type="submit" disabled={!valid || loading}
        className="relative w-full overflow-hidden rounded-xl py-3 text-[14px] font-semibold text-white shadow-lg shadow-purple-900/40 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)" }}>
        {/* shimmer */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Criando conta…</> : "Criar Conta Grátis"}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-white/25">
        Ao criar sua conta, você concorda com nossos{" "}
        <span className="text-purple-400/70 hover:text-purple-400 cursor-pointer transition-colors">Termos de Uso</span>{" "}
        e{" "}
        <span className="text-purple-400/70 hover:text-purple-400 cursor-pointer transition-colors">Política de Privacidade</span>.
      </p>

      <Divider label="ou continue com" />

      <div className="flex gap-3">
        <SocialBtn><GoogleIcon />Google</SocialBtn>
        <SocialBtn><GitHubIcon />GitHub</SocialBtn>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   DECORATIVE BACKGROUND
══════════════════════════════════════════════════════ */
function Background() {
  return (
    <>
      {/* diamond / triangle pattern */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0l16 16-16 16L0 16z' fill='%23ffffff' fill-opacity='0.025'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
        }} />
      {/* glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-purple-600/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-800/30 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-purple-900/20 blur-[80px]" />
    </>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export function AuthModal({ defaultTab = "login" }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 30% 0%, #1e0b3e 0%, #0f0720 40%, #07040f 100%)" }}>

      <Background />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* subtle top glow behind card */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-purple-500/10 blur-xl" />

        <div className="relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-2xl shadow-2xl shadow-black/60 p-8 space-y-6">

          {/* ── Tab toggle ── */}
          <div className="flex rounded-full bg-white/6 p-1 gap-1">
            {(["login", "register"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-full py-2 text-[13px] font-semibold transition-all duration-250 select-none",
                  tab === t
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/60"
                    : "text-white/35 hover:text-white/60"
                )}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* ── Heading ── */}
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">
              {tab === "login" ? "Welcome back" : "Start your journey"}
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-white/40">
              {tab === "login"
                ? "Enter your credentials to access your cockpit."
                : "Set up your workspace in seconds."}
            </p>
          </div>

          {/* ── Form ── */}
          {tab === "login"
            ? <LoginTab key="login" />
            : <RegisterTab key="register" onRegistered={() => setTab("login")} />}

          {/* ── Footer link ── */}
          <p className="text-center text-[12px] text-white/30">
            {tab === "login" ? (
              <>Não tem conta?{" "}
                <button type="button" onClick={() => setTab("register")}
                  className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  Criar conta
                </button></>
            ) : (
              <>Já tem conta?{" "}
                <button type="button" onClick={() => setTab("login")}
                  className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                  Fazer login
                </button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
