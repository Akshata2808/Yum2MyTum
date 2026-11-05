import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  AuthError,
  RESEND_COOLDOWN_MS,
  issueOtp,
  otpStatus,
  requestReset,
  setNewPassword,
  signIn,
  signUp,
  validateEmail,
  validateName,
  validatePassword,
  verifyOtp,
  type OtpPurpose,
} from "@/lib/auth-store";
import logo from "@/assets/logo-yum.png";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/");

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Yum2MyTum" },
      { name: "description", content: "Sign in or create your Yum2MyTum account to order food across Mumbai." },
      { property: "og:title", content: "Sign in — Yum2MyTum" },
      { property: "og:description", content: "Log in to order, check out and track your delivery live." },
    ],
  }),
  component: AuthPage,
});

type Errs = { name?: string | null; email?: string | null; password?: string | null; confirm?: string | null };
type Step = "in" | "up" | "otp" | "forgot" | "newpass";

const inputCls =
  "w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary aria-[invalid=true]:border-destructive";
const btnCls =
  "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60";

// Demo: the code is fixed and never displayed.
const showCode = (_code: string) => {};

function Field({ error, children }: { error?: string | null | undefined; children: React.ReactNode }) {
  return (
    <div>
      {children}
      {error && <p className="mt-1 px-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const target = safePath(redirect);
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [step, setStep] = React.useState<Step>("in");
  const [purpose, setPurpose] = React.useState<OtpPurpose>("signup");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPw, setShowPw] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState<Errs>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (user && step !== "newpass") navigate({ to: target, replace: true });
  }, [user, target, navigate, step]);

  React.useEffect(() => {
    if (step !== "otp") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step]);

  const go = (s: Step) => {
    setStep(s);
    setErrors({});
    setFormError(null);
    setPassword("");
    setConfirm("");
    setCode("");
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setFormError(null);
    try {
      await fn();
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const toOtp = (p: OtpPurpose, c: string) => {
    setPurpose(p);
    setNow(Date.now());
    go("otp");
    showCode(c);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "in") {
      const errs = { email: validateEmail(email), password: password ? null : "Password is required" };
      setErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
      run(async () => {
        const r = await signIn(email, password, remember);
        if (r === "unverified") {
          const rec = otpStatus();
          toast("Please verify your email to finish signing up.");
          toOtp("signup", rec?.code ?? "");
        } else {
          refresh();
          toast.success("Welcome back!");
        }
      });
    } else if (step === "up") {
      const errs = {
        name: validateName(name),
        email: validateEmail(email),
        password: validatePassword(password),
        confirm: confirm === password ? null : "Passwords don't match",
      };
      setErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
      run(async () => toOtp("signup", await signUp(name, email, password)));
    } else if (step === "forgot") {
      const errs = { email: validateEmail(email) };
      setErrors(errs);
      if (errs.email) return;
      run(async () => toOtp("reset", await requestReset(email)));
    } else if (step === "otp") {
      run(async () => {
        await verifyOtp(email, purpose, code);
        if (purpose === "signup") {
          refresh();
          toast.success("Email verified — you're signed in!");
        } else {
          go("newpass");
          toast.success("Code verified. Choose a new password.");
        }
      });
    } else if (step === "newpass") {
      const errs = { password: validatePassword(password), confirm: confirm === password ? null : "Passwords don't match" };
      setErrors(errs);
      if (Object.values(errs).some(Boolean)) return;
      run(async () => {
        await setNewPassword(email, password);
        toast.success("Password updated. Sign in with your new password.");
        go("in");
      });
    }
  };

  const rec = step === "otp" ? otpStatus() : null;
  const cooldown = rec ? Math.max(0, Math.ceil((rec.sentAt + RESEND_COOLDOWN_MS - now) / 1000)) : 0;
  const resend = () => {
    try {
      showCode(issueOtp(email.trim().toLowerCase(), purpose));
      setCode("");
      setFormError(null);
      setNow(Date.now());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not resend");
    }
  };

  const titles: Record<Step, [string, string]> = {
    in: ["Welcome back, hungry!", "Sign in to order and track your food."],
    up: ["Join Yum2MyTum", "Create an account in seconds."],
    otp: ["Check your email", `Enter the 6-digit code sent to ${email}.`],
    forgot: ["Forgot your password?", "We'll send a code to reset it."],
    newpass: ["Set a new password", "Use at least 8 characters with a letter and a number."],
  };

  const pwInput = (value: string, set: (v: string) => void, label: string, key: keyof Errs) => (
    <Field error={errors[key]}>
      <div className="relative">
        <input
          type={showPw ? "text" : "password"}
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder={label}
          aria-label={label}
          aria-invalid={!!errors[key]}
          autoComplete={step === "in" ? "current-password" : "new-password"}
          className={inputCls + " border-border pr-11"}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          aria-label={showPw ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  );

  const label = { in: "Sign in", up: "Create account", otp: "Verify", forgot: "Send code", newpass: "Update password" }[step];

  return (
    <div className="mx-auto max-w-md px-4 py-12 pb-28">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <img src={logo} alt="Yum2MyTum" width={96} height={96} className="mx-auto size-24" />
        <h1 className="mt-3 text-center font-display text-2xl font-extrabold">{titles[step][0]}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{titles[step][1]}</p>

        <form onSubmit={submit} noValidate className="mt-6 space-y-3">
          {step === "up" && (
            <Field error={errors.name}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                aria-label="Full name"
                aria-invalid={!!errors.name}
                autoComplete="name"
                className={inputCls + " border-border"}
              />
            </Field>
          )}
          {(step === "in" || step === "up" || step === "forgot") && (
            <Field error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                aria-invalid={!!errors.email}
                autoComplete="email"
                className={inputCls + " border-border"}
              />
            </Field>
          )}
          {(step === "in" || step === "up" || step === "newpass") &&
            pwInput(password, setPassword, step === "newpass" ? "New password" : "Password", "password")}
          {(step === "up" || step === "newpass") && pwInput(confirm, setConfirm, "Confirm password", "confirm")}

          {step === "in" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                Remember me
              </label>
              <button type="button" onClick={() => go("forgot")} className="font-semibold text-primary">
                Forgot password?
              </button>
            </div>
          )}

          {step === "otp" && (
            <>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                aria-label="Verification code"
                className={inputCls + " border-border text-center font-display text-2xl tracking-[0.5em]"}
              />
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => go(purpose === "reset" ? "forgot" : "up")} className="text-muted-foreground">
                  Change email
                </button>
                <button type="button" disabled={cooldown > 0} onClick={resend} className="font-semibold text-primary disabled:text-muted-foreground">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </>
          )}

          {formError && (
            <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </p>
          )}

          <button type="submit" disabled={busy || (step === "otp" && code.length !== 6)} className={btnCls}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? "Please wait…" : label}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {step === "in" ? (
            <>
              New here?{" "}
              <button onClick={() => go("up")} className="font-semibold text-primary">Create an account</button>
            </>
          ) : step === "up" ? (
            <>
              Already have an account?{" "}
              <button onClick={() => go("in")} className="font-semibold text-primary">Sign in</button>
            </>
          ) : (
            <button onClick={() => go("in")} className="font-semibold text-primary">Back to sign in</button>
          )}
        </p>
      </div>
    </div>
  );
}
