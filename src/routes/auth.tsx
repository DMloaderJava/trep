import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { z } from "zod";
import { enforceLoginRateLimit, enforceSignupRateLimit } from "@/lib/api/rate-limit.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Войти — Треп" }] }),
  component: AuthPage,
});

const signUpSchema = z.object({
  email: z.string().trim().email("Невалидный email").max(255),
  password: z.string().min(8, "Минимум 8 символов").max(128),
  nickname: z
    .string()
    .trim()
    .min(3, "Минимум 3 символа")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
});

const signInSchema = z.object({
  email: z.string().trim().email("Невалидный email").max(255),
  password: z.string().min(1, "Введите пароль").max(128),
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [honeypot, setHoneypot] = useState(""); // hidden field for bot detection
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/feed", replace: true });
  }, [loading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check: if hidden field was filled, silently ignore (bot)
    if (honeypot) {
      toast.success("Проверьте почту — мы прислали ссылку для подтверждения email.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, nickname });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        // Rate limiting check
        try {
          await enforceSignupRateLimit();
        } catch {
          toast.error("Слишком много попыток регистрации. Попробуйте позже.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/feed`,
            data: { nickname: parsed.data.nickname },
          },
        });
        if (error) {
          if (error.message.includes("already")) toast.error("Этот email уже зарегистрирован");
          else toast.error(error.message);
          return;
        }
        toast.success("Проверьте почту — мы прислали ссылку для подтверждения email.");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        // Rate limiting check
        try {
          await enforceLoginRateLimit();
        } catch {
          toast.error("Слишком много попыток входа. Попробуйте позже.");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(
            error.message.includes("Invalid") ? "Неверный email или пароль" : error.message,
          );
          return;
        }
        toast.success("С возвращением, трепач!");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-16 px-4">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-display text-2xl font-extrabold"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm">
            🗯️
          </span>
          Треп
        </Link>

        <div className="rounded-3xl border-4 border-ink bg-card p-6 shadow-chunky md:p-8">
          <h1 className="font-display text-3xl font-extrabold">
            {mode === "signup" ? "Стать трепачом" : "С возвращением"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Создай аккаунт и начни писать мысли, о которых пожалеешь."
              : "Войди и продолжай нести ерунду."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <Field label="Никнейм">
                <input
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="ваня_трепло"
                  className="w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/30"
                />
              </Field>
            )}
            {/* Honeypot: hidden from real users, bots will fill it */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/30"
              />
            </Field>
            <Field label="Пароль">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Минимум 8 символов" : "••••••••"}
                className="w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/30"
              />
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-2xl border-2 border-ink bg-gradient-button py-4 font-display text-lg font-extrabold text-primary-foreground shadow-chunky-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? "Секундочку…" : mode === "signup" ? "Создать аккаунт" : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Уже трепач?" : "Ещё не с нами?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-bold text-primary underline"
            >
              {mode === "signup" ? "Войти" : "Зарегистрироваться"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
