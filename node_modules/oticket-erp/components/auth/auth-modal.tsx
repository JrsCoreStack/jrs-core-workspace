"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, Loader2, AlertCircle,
  Mail, Lock, User, Phone, CreditCard, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/utils/api";
import { isValidCpf } from "@/lib/validations/cpf";
import { messageFromResponseData } from "@/lib/cockpit/normalize-api-message";
import { ConfettiBurst } from "./confetti-burst";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

/* ── tipos ─────────────────────────────────────────── */
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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── password strength ──────────────────────────────── */
function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Fraca", "Média", "Boa", "Senha forte ✓"];
  const strong = score >= 4;
  return { filled: Math.min(score, 4), label: labels[score] || "", strong };
}

/* ── lockout ────────────────────────────────────────── */
const RF_LOGIN_LOCKED_UNTIL_KEY = "rf_login_locked_until";
const RF_LOGIN_FAILURES_KEY = "rf_login_failures";
const MAX_FAILURES = 5;
const LOCKOUT_MS = 2 * 60 * 1000;

function bumpLoginFailures(): { locked: boolean; lockedUntil: number | null } {
  if (typeof window === "undefined") return { locked: false, lockedUntil: null };
  const raw = Number(localStorage.getItem(RF_LOGIN_FAILURES_KEY) ?? "0") + 1;
  localStorage.setItem(RF_LOGIN_FAILURES_KEY, String(raw));
  if (raw >= MAX_FAILURES) {
    const until = Date.now() + LOCKOUT_MS;
    localStorage.setItem(RF_LOGIN_LOCKED_UNTIL_KEY, String(until));
    return { locked: true, lockedUntil: until };
  }
  return { locked: false, lockedUntil: null };
}

function syncLoginLockState(): { locked: boolean; secondsLeft: number } {
  if (typeof window === "undefined") return { locked: false, secondsLeft: 0 };
  const until = Number(localStorage.getItem(RF_LOGIN_LOCKED_UNTIL_KEY) ?? "0");
  if (!until || Date.now() >= until) {
    localStorage.removeItem(RF_LOGIN_LOCKED_UNTIL_KEY);
    localStorage.removeItem(RF_LOGIN_FAILURES_KEY);
    return { locked: false, secondsLeft: 0 };
  }
  return { locked: true, secondsLeft: Math.ceil((until - Date.now()) / 1000) };
}

/* ── UI helpers ─────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function InputField({
  id, label, type = "text", placeholder, value, onChange,
  icon: Icon, right, hint, required, disabled, maxLength, autoComplete, error,
}: {
  id: string; label?: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode; hint?: string; required?: boolean;
  disabled?: boolean; maxLength?: number; autoComplete?: string; error?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[12px] font-medium tracking-wide" style={{ color: "var(--rf-text-secondary)" }}>
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--rf-text-muted)" }}>
            <Icon className="h-[14px] w-[14px]" />
          </span>
        )}
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required} disabled={disabled} maxLength={maxLength}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-[var(--rf-radius-md)] border py-2.5 text-[13px] transition-all duration-200 disabled:opacity-50",
            "focus:outline-none focus:ring-1",
            Icon ? "pl-9" : "pl-3.5",
            right ? "pr-11" : "pr-3.5",
          )}
          style={{
            background: "var(--rf-bg-elevated)",
            borderColor: error ? "rgba(239,68,68,0.5)" : "var(--rf-border-default)",
            color: "var(--rf-text-primary)",
          }}
        />
        {right && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
      {hint && <p className="text-[11px] leading-relaxed" style={{ color: "var(--rf-text-muted)" }}>{hint}</p>}
    </div>
  );
}

function PasswordField(props: Omit<Parameters<typeof InputField>[0], "type" | "right">) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      {...props}
      type={show ? "text" : "password"}
      right={
        <button type="button" tabIndex={-1} onClick={() => setShow(!show)}
          className="transition-colors" style={{ color: "var(--rf-text-muted)" }}>
          {show ? <EyeOff className="h-[14px] w-[14px]" /> : <Eye className="h-[14px] w-[14px]" />}
        </button>
      }
    />
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--rf-radius-md)] border px-3.5 py-2.5 text-[12px]"
      style={{
        borderColor: "rgba(239,68,68,0.25)",
        background: "rgba(239,68,68,0.08)",
        color: "rgba(252,165,165,0.9)",
      }}>
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
      {msg}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: "var(--rf-border-default)" }} />
      <span className="shrink-0 text-[11px] font-medium tracking-widest uppercase" style={{ color: "var(--rf-text-muted)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "var(--rf-border-default)" }} />
    </div>
  );
}

/* ── Conta criada dialog ─────────────────────────────── */
function AccountCreatedDialog({
  name, email, onClose, onGoCockpit, onVerifyFirst,
}: {
  name: string; email: string;
  onClose: () => void; onGoCockpit: () => void; onVerifyFirst: () => void;
}) {
  const [confettiActive, setConfettiActive] = useState(true);
  const initials = name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog.Root open onOpenChange={(o) => { if (!o) { setConfettiActive(false); onClose(); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-7 shadow-2xl outline-none"
          style={{ background: "var(--rf-bg-card)", border: "1px solid var(--rf-border-default)" }}>
          <Dialog.Title className="sr-only">Conta criada com sucesso</Dialog.Title>
          <Dialog.Description className="sr-only">
            A conta de {name} ({email}) foi criada. Faça login para acessar o sistema.
          </Dialog.Description>

          <div className="relative flex flex-col items-center gap-4 text-center">
            <ConfettiBurst active={confettiActive} loop duration={3.5} repeatDelay={0.5} />

            {/* Avatar com gradiente */}
            <div className="relative h-16 w-16 select-none">
              <div className="absolute inset-0 rounded-full opacity-20 blur-xl"
                style={{ background: "linear-gradient(135deg,#9333ea,#06b6d4)" }} />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-bold text-white"
                style={{ background: "linear-gradient(135deg,#9333ea 0%,#7c3aed 50%,#06b6d4 100%)" }}>
                {initials}
              </div>
            </div>

            <div>
              <p className="text-[18px] font-bold" style={{ color: "var(--rf-text-primary)" }}>Conta criada!</p>
              <p className="mt-1 text-[13px]" style={{ color: "var(--rf-text-secondary)" }}>
                Bem-vindo, <span className="font-semibold" style={{ color: "var(--rf-accent-light)" }}>{name.split(" ")[0]}</span>.<br />
                <span style={{ color: "var(--rf-text-muted)" }}>{email}</span>
              </p>
            </div>

            <div className="mt-1 flex w-full flex-col gap-2">
              <button onClick={() => { setConfettiActive(false); onGoCockpit(); }}
                className="rf-btn-primary">
                Acessar o Cockpit
              </button>
              <button onClick={() => { setConfettiActive(false); onVerifyFirst(); }}
                className="rf-btn-ghost text-[12px]">
                Verificar e-mail primeiro
              </button>
            </div>

            <button onClick={() => { setConfettiActive(false); onClose(); }}
              aria-label="Fechar"
              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-[18px] transition-colors"
              style={{ color: "var(--rf-text-muted)", background: "var(--rf-bg-elevated)" }}>
              ×
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ══════════════════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════════════════ */
function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const { locked: l, secondsLeft: s } = syncLoginLockState();
    setLocked(l); setSecondsLeft(s);
  }, []);

  useEffect(() => {
    if (!locked) return;
    const t = setInterval(() => {
      const { locked: l, secondsLeft: s } = syncLoginLockState();
      setLocked(l); setSecondsLeft(s);
      if (!l) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [locked]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setError(null);

    const isEmail = EMAIL_RE.test(identifier.trim());
    const res = await signIn("credentials", {
      identifier: isEmail ? identifier.trim() : identifier.replace(/\D/g, ""),
      password,
      redirect: false,
    });

    if (res?.error) {
      const { locked: l, lockedUntil } = bumpLoginFailures();
      if (l && lockedUntil) {
        setLocked(true);
        setSecondsLeft(Math.ceil((lockedUntil - Date.now()) / 1000));
        setError(`Muitas tentativas. Aguarde ${Math.ceil(LOCKOUT_MS / 60000)} minuto(s) para tentar novamente.`);
      } else {
        setError("Credenciais inválidas. Verifique e-mail/CPF e senha.");
      }
      setLoading(false);
      return;
    }

    if (res?.ok) {
      localStorage.removeItem(RF_LOGIN_LOCKED_UNTIL_KEY);
      localStorage.removeItem(RF_LOGIN_FAILURES_KEY);
      router.push("/home");
      router.refresh();
    }
  }, [locked, identifier, password, router]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {locked && (
        <div className="flex items-center gap-2.5 rounded-[var(--rf-radius-md)] border px-3.5 py-2.5 text-[12px]"
          style={{ borderColor: "rgba(251,146,60,0.25)", background: "rgba(251,146,60,0.08)", color: "rgba(253,186,116,0.9)" }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-orange-400" />
          Acesso bloqueado temporariamente. Aguarde{" "}
          <span className="font-mono font-bold">{mins}:{secs}</span>.
        </div>
      )}
      {!locked && error && <ErrorBanner msg={error} />}

      <InputField
        id="login-id" label="E-mail ou CPF" placeholder="nome@empresa.com ou 000.000.000-00"
        value={identifier} onChange={setIdentifier}
        icon={CreditCard} disabled={loading || locked} autoComplete="username" />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-pwd" className="block text-[12px] font-medium" style={{ color: "var(--rf-text-secondary)" }}>
            Senha
          </label>
          <button type="button" className="rf-auth-accent-link text-[12px]">
            Esqueceu?
          </button>
        </div>
        <PasswordField
          id="login-pwd" placeholder="••••••••" value={password} onChange={setPassword}
          icon={Lock} disabled={loading || locked} autoComplete="current-password" />
      </div>

      <button type="submit" disabled={loading || locked || !identifier || !password}
        className="rf-btn-white">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Entrando…</> : "Entrar no Sistema"}
      </button>

      <Divider label="ou continue com" />

      <div className="flex gap-2.5">
        <button type="button" className="rf-btn-ghost">
          <GoogleIcon />Google
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   REGISTER FORM
══════════════════════════════════════════════════════ */
function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [cpf, setCpf] = useState("");
  const [cpfTouched, setCpfTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(true);

  const emailInvalid = emailTouched && email.length > 0 && !EMAIL_RE.test(email);
  const strength = passwordStrength(password);
  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfInvalid = cpfTouched && cpfDigits.length === 11 && !isValidCpf(cpfDigits);
  const cpfIncomplete = cpfTouched && cpfDigits.length > 0 && cpfDigits.length < 11;

  const valid =
    firstName.trim() &&
    lastName.trim() &&
    EMAIL_RE.test(email.trim()) &&
    cpfDigits.length === 11 &&
    isValidCpf(cpfDigits) &&
    phone.replace(/\D/g, "").length >= 10 &&
    strength.strong &&
    terms;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setCpfTouched(true);
    if (!EMAIL_RE.test(email.trim())) return;
    if (cpfDigits.length !== 11 || !isValidCpf(cpfDigits)) {
      setError("CPF inválido. Verifique os dígitos.");
      return;
    }
    if (!strength.strong) {
      setError("A senha precisa ter ao menos 8 caracteres, uma maiúscula, um número e um símbolo.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ id?: string }>("/user", {
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim().toLowerCase(),
        cpf: cpfDigits,
        phone: phone.replace(/\D/g, ""),
        password,
        totp_secret: null,
        is2fa_enabled: false,
      });
      if (res.status !== 200 && res.status !== 201) {
        setError("Não foi possível confirmar o cadastro. Tente novamente.");
        return;
      }
      setCreatedUser({
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim().toLowerCase(),
      });
    } catch (err: unknown) {
      let msg = "Erro ao criar conta. Tente novamente.";
      if (err && typeof err === "object") {
        const o = err as { message?: string; data?: unknown; response?: { data?: unknown } };
        if (typeof o.message === "string" && o.message.trim()) {
          msg = o.message.trim();
        } else if (o.data !== undefined && o.data !== null) {
          const fromNorm = messageFromResponseData(o.data);
          if (fromNorm) msg = fromNorm;
        } else if (o.response?.data !== undefined) {
          const fromAxios = messageFromResponseData(o.response.data);
          if (fromAxios) msg = fromAxios;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (createdUser) {
    return (
      <AccountCreatedDialog
        name={createdUser.name}
        email={createdUser.email}
        onClose={() => { setCreatedUser(null); onRegistered(); }}
        onGoCockpit={() => {
          setCreatedUser(null);
          onRegistered();
          toast.success("Faça login com seu e-mail para acessar o cockpit.");
        }}
        onVerifyFirst={() => {
          setCreatedUser(null);
          onRegistered();
          toast.info("Verifique seu e-mail antes de fazer login.");
        }}
      />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {error && <ErrorBanner msg={error} />}

      <div className="grid grid-cols-2 gap-3">
        <InputField id="r-first" label="Nome" placeholder="João" value={firstName}
          onChange={setFirstName} icon={User} disabled={loading} required />
        <InputField id="r-last" label="Sobrenome" placeholder="Silva" value={lastName}
          onChange={setLastName} disabled={loading} required />
      </div>

      <InputField id="r-email" label="E-mail" type="email" placeholder="nome@empresa.com"
        value={email} onChange={(v) => { setEmail(v); setEmailTouched(true); }}
        icon={Mail} disabled={loading} required error={emailInvalid} />
      {emailInvalid && (
        <p className="text-[11px]" style={{ color: "var(--rf-danger)" }}>
          E-mail inválido
        </p>
      )}

      <div>
        <InputField id="r-cpf" label="CPF" placeholder="000.000.000-00" value={cpf}
          onChange={(v) => { setCpf(maskCpf(v)); setCpfTouched(true); }}
          icon={CreditCard} maxLength={14} disabled={loading} required
          error={cpfInvalid || cpfIncomplete} />
        {(cpfInvalid || cpfIncomplete) && (
          <p className="mt-1 text-[11px]" style={{ color: "var(--rf-danger)" }}>
            {cpfIncomplete ? "CPF incompleto" : "CPF inválido — verifique os dígitos"}
          </p>
        )}
      </div>

      <InputField id="r-phone" label="Telefone" placeholder="(00) 00000-0000" value={phone}
        onChange={(v) => setPhone(maskPhone(v))} icon={Phone} maxLength={15} disabled={loading} required />

      {/* Senha + medidor */}
      <div>
        <div className="space-y-1.5">
          <label htmlFor="r-pass" className="block text-[12px] font-medium" style={{ color: "var(--rf-text-secondary)" }}>
            Senha
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--rf-text-muted)" }}>
              <Lock className="h-[14px] w-[14px]" />
            </span>
            <input
              id="r-pass" type={showPass ? "text" : "password"}
              placeholder="Crie uma senha forte (ex: Senha@123)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={loading} required
              className="w-full rounded-[var(--rf-radius-md)] border py-2.5 pl-9 pr-11 text-[13px] transition-all focus:outline-none focus:ring-1 disabled:opacity-50"
              style={{ background: "var(--rf-bg-elevated)", borderColor: "var(--rf-border-default)", color: "var(--rf-text-primary)" }}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "var(--rf-text-muted)" }}>
              {showPass ? <EyeOff className="h-[14px] w-[14px]" /> : <Eye className="h-[14px] w-[14px]" />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <div className="mt-2">
            <div className="mb-1 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[3px] flex-1 rounded-sm transition-colors"
                  style={{
                    background: i < strength.filled
                      ? strength.strong ? "var(--rf-success)"
                        : strength.filled <= 2 ? "var(--rf-danger)" : "#f59e0b"
                      : "var(--rf-border-default)",
                  }} />
              ))}
            </div>
            <p className="text-[11px]" style={{ color: strength.strong ? "var(--rf-success)" : "var(--rf-text-muted)" }}>
              {strength.strong
                ? strength.label
                : `${strength.label} — precisa de maiúscula, número e símbolo`}
            </p>
          </div>
        )}
      </div>

      {/* Termos */}
      <label className="flex cursor-pointer items-start gap-2.5">
        <button type="button" role="checkbox" aria-checked={terms}
          onClick={() => setTerms(!terms)}
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
          style={{
            background: terms ? "var(--rf-accent)" : "var(--rf-bg-elevated)",
            borderColor: terms ? "var(--rf-accent)" : "var(--rf-border-default)",
          }}>
          {terms && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
        </button>
        <span className="text-[11px] leading-relaxed" style={{ color: "var(--rf-text-muted)" }}>
          Aceito os{" "}
          <button type="button" className="rf-auth-accent-link text-[11px]">Termos de Uso</button>
          {" "}e a{" "}
          <button type="button" className="rf-auth-accent-link text-[11px]">Política de Privacidade</button>
        </span>
      </label>

      <button type="submit" disabled={!valid || loading} className="rf-btn-primary mt-1">
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Criando conta…</>
          : "Criar Conta Grátis"}
      </button>

      <Divider label="ou continue com" />
      <div className="flex gap-2.5">
        <button type="button" className="rf-btn-ghost">
          <GoogleIcon />Google
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export function AuthModal({ defaultTab = "login" }: { defaultTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="rf-auth relative min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "var(--rf-bg-base)" }}>

      {/* gradiente sutil no topo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-2xl p-8 space-y-6"
          style={{
            background: "var(--rf-bg-card)",
            border: "1px solid var(--rf-border-default)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}>

          {/* Logo / marca */}
          <div className="mb-2 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)" }}>J</div>
            <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--rf-text-primary)" }}>
              JRS ERP
            </span>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-full p-1 gap-1"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            {(["login", "register"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-full py-2 text-[12px] font-semibold transition-all duration-200 select-none",
                  tab === t
                    ? "text-white shadow-md"
                    : "hover:text-white/60"
                )}
                style={{
                  background: tab === t ? "linear-gradient(135deg,#9333ea,#7c3aed)" : "transparent",
                  color: tab === t ? "#fff" : "rgba(255,255,255,0.35)",
                  boxShadow: tab === t ? "0 4px 12px rgba(124,58,237,0.4)" : "none",
                }}>
                {t === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--rf-text-primary)" }}>
              {tab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--rf-text-muted)" }}>
              {tab === "login"
                ? "Entre com seu e-mail ou CPF para acessar o sistema."
                : "Preencha os dados abaixo para começar."}
            </p>
          </div>

          {/* Formulário */}
          {tab === "login"
            ? <LoginForm key="login" />
            : <RegisterForm key="register" onRegistered={() => setTab("login")} />}

          {/* Footer link */}
          <p className="text-center text-[12px]" style={{ color: "var(--rf-text-muted)" }}>
            {tab === "login" ? (
              <>Não tem conta?{" "}
                <button type="button" onClick={() => setTab("register")} className="rf-auth-accent-link">
                  Cadastre-se
                </button></>
            ) : (
              <>Já tem conta?{" "}
                <button type="button" onClick={() => setTab("login")} className="rf-auth-accent-link">
                  Fazer login
                </button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
