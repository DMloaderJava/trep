import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQuery, a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { Q as redirect, S as notFound } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-BHmQHd0X.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-DUgvIOtj.mjs";
import "../_libs/seroval.mjs";
import { X, S as SmilePlus, P as Paperclip, F as File, D as Download, a as Pause, b as Play, V as VolumeX, c as Volume2, M as Minimize, d as Maximize, e as FileText, f as FileArchive, g as FileCode } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, l as literalType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const appCss = "/assets/styles-Cxdy7fdB.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const AuthContext = reactExports.createContext(void 0);
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [isAdmin, setIsAdmin] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => loadRoles(newSession.user.id), 0);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadRoles(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  async function loadRoles(userId) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setIsAdmin(!!data?.some((r) => r.role === "admin"));
  }
  async function signOut() {
    await supabase.auth.signOut();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AuthContext.Provider,
    {
      value: { session, user: session?.user ?? null, isAdmin, loading, signOut },
      children
    }
  );
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Страница потерялась в трепе" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
        children: "На главную"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-foreground", children: "Что-то пошло не так" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          children: "Попробовать снова"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
          children: "На главную"
        }
      )
    ] })
  ] }) });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Треп" },
      { name: "description", content: "Соцсеть для полной ерунды" },
      { property: "og:title", content: "Треп" },
      { name: "twitter:title", content: "Треп" },
      { property: "og:description", content: "Соцсеть для полной ерунды" },
      { name: "twitter:description", content: "Соцсеть для полной ерунды" },
      {
        property: "og:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a0bcc7cb-d4b3-4a8a-81fb-ea9bbdc610d7/id-preview-ea4139f9--84f5b6e0-4845-4d78-9eeb-f1f5cbe4e213.lovable.app-1780996600831.png"
      },
      {
        name: "twitter:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a0bcc7cb-d4b3-4a8a-81fb-ea9bbdc610d7/id-preview-ea4139f9--84f5b6e0-4845-4d78-9eeb-f1f5cbe4e213.lovable.app-1780996600831.png"
      },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "ru", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  const router = useRouter();
  reactExports.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-center" })
  ] }) });
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const enforceLoginRateLimit = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0981c250f37895363cd4865c9bbfe3d0ef8e241f624c4e0a5fcf9950bad925d9"));
const enforceSignupRateLimit = createServerFn({
  method: "GET"
}).handler(createSsrRpc("2fcd4cc0d03e86b29a5cf46742e11dfd36574ccd151860828d5b809f47626044"));
const Route$b = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Войти — Треп" }] }),
  component: AuthPage
});
const signUpSchema = objectType({
  email: stringType().trim().email("Невалидный email").max(255),
  password: stringType().min(8, "Минимум 8 символов").max(128),
  nickname: stringType().trim().min(3, "Минимум 3 символа").max(30).regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _")
});
const signInSchema = objectType({
  email: stringType().trim().email("Невалидный email").max(255),
  password: stringType().min(1, "Введите пароль").max(128)
});
function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [nickname, setNickname] = reactExports.useState("");
  const [honeypot, setHoneypot] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && session) navigate({ to: "/feed", replace: true });
  }, [loading, session, navigate]);
  async function handleSubmit(e) {
    e.preventDefault();
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
            data: { nickname: parsed.data.nickname }
          }
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
        try {
          await enforceLoginRateLimit();
        } catch {
          toast.error("Слишком много попыток входа. Попробуйте позже.");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(
            error.message.includes("Invalid") ? "Неверный email или пароль" : error.message
          );
          return;
        }
        toast.success("С возвращением, трепач!");
      }
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-hero py-16 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/",
        className: "mb-8 inline-flex items-center gap-2 font-display text-2xl font-extrabold",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm", children: "🗯️" }),
          "Треп"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border-4 border-ink bg-card p-6 shadow-chunky md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold", children: mode === "signup" ? "Стать трепачом" : "С возвращением" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: mode === "signup" ? "Создай аккаунт и начни писать мысли, о которых пожалеешь." : "Войди и продолжай нести ерунду." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-3", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Никнейм", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            required: true,
            value: nickname,
            onChange: (e) => setNickname(e.target.value),
            placeholder: "ваня_трепло",
            className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/30"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -left-[9999px]", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "website", children: "Website" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "website",
              name: "website",
              type: "text",
              tabIndex: -1,
              autoComplete: "off",
              value: honeypot,
              onChange: (e) => setHoneypot(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            required: true,
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "you@example.com",
            className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/30"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field$1, { label: "Пароль", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            required: true,
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: mode === "signup" ? "Минимум 8 символов" : "••••••••",
            className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/30"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: busy,
            className: "mt-2 w-full rounded-2xl border-2 border-ink bg-gradient-button py-4 font-display text-lg font-extrabold text-primary-foreground shadow-chunky-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60",
            children: busy ? "Секундочку…" : mode === "signup" ? "Создать аккаунт" : "Войти"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        mode === "signup" ? "Уже трепач?" : "Ещё не с нами?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setMode(mode === "signup" ? "signin" : "signup"),
            className: "font-bold text-primary underline",
            children: mode === "signup" ? "Войти" : "Зарегистрироваться"
          }
        )
      ] })
    ] })
  ] }) });
}
function Field$1({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-bold", children: label }),
    children
  ] });
}
async function getSignedUrl(bucket, path, expiresInSeconds = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}
const Route$a = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout
});
function AuthenticatedLayout() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const router = useRouter();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user
  });
  const [avatarUrl, setAvatarUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (profile?.avatar_url) {
      getSignedUrl("avatars", profile.avatar_url).then(setAvatarUrl);
    } else setAvatarUrl(null);
  }, [profile?.avatar_url]);
  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/", replace: true });
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center text-muted-foreground", children: "Загружаем треп…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/feed", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm", children: "🗯️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl font-extrabold", children: "Треп" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden gap-4 text-sm font-bold md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/feed",
            className: "hover:text-primary",
            activeProps: { className: "text-primary" },
            children: "Лента"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/search",
            className: "hover:text-primary",
            activeProps: { className: "text-primary" },
            children: "Поиск"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/messages",
            className: "hover:text-primary",
            activeProps: { className: "text-primary" },
            children: "Сообщения"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/propose-reaction",
            className: "hover:text-primary",
            activeProps: { className: "text-primary" },
            children: "Реакция"
          }
        ),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin",
            className: "hover:text-primary",
            activeProps: { className: "text-primary" },
            children: "Админка"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/profile",
            className: "flex items-center gap-2 rounded-full border-2 border-ink bg-card px-2 py-1 pr-3 shadow-chunky-sm hover:-translate-y-0.5 transition-transform",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-ink bg-accent text-xs font-bold", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full object-cover" }) : (profile?.nickname?.[0] ?? "?").toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden text-sm font-bold sm:inline", children: [
                "@",
                profile?.nickname ?? "..."
              ] }),
              isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Админ", className: "text-base", children: "👑" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSignOut,
            className: "rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-sm font-bold shadow-chunky-sm",
            children: "Выйти"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
function useAvatarUrl(path) {
  const [url, setUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let active = true;
    if (!path) {
      setUrl(null);
      return;
    }
    getSignedUrl("avatars", path).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [path]);
  return url;
}
function Avatar({
  path,
  nickname,
  size = 40,
  className = ""
}) {
  const url = useAvatarUrl(path);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      style: { width: size, height: size },
      className: `grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-accent font-bold text-sm ${className}`,
      children: url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: nickname ?? "", className: "h-full w-full object-cover" }) : (nickname?.[0] ?? "?").toUpperCase()
    }
  );
}
function ReportButton({
  targetType,
  targetId,
  label = "Пожаловаться"
}) {
  const { user } = useAuth();
  const [busy, setBusy] = reactExports.useState(false);
  async function report() {
    if (!user) return;
    const reason = window.prompt("Что не так? Опиши кратко:");
    if (!reason || reason.trim().length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim().slice(0, 500)
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Жалоба отправлена. Спасибо!");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: report,
      disabled: busy,
      className: "text-xs font-bold text-muted-foreground hover:text-destructive disabled:opacity-50",
      title: "Пожаловаться",
      children: [
        "🚩 ",
        label
      ]
    }
  );
}
function formatTime$1(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function AudioPlayer({ src, fileName }) {
  const audioRef = reactExports.useRef(null);
  const [playing, setPlaying] = reactExports.useState(false);
  const [currentTime, setCurrentTime] = reactExports.useState(0);
  const [duration, setDuration] = reactExports.useState(0);
  const [volume, setVolume] = reactExports.useState(1);
  const [muted, setMuted] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const el = audio;
    let cancelled = false;
    function onLoad() {
      if (cancelled) return;
      setLoading(false);
      setDuration(el.duration || 0);
    }
    function onTimeUpdate() {
      if (cancelled) return;
      setCurrentTime(el.currentTime);
    }
    function onEnded() {
      if (cancelled) return;
      setPlaying(false);
      setCurrentTime(0);
    }
    function onError() {
      if (cancelled) return;
      setLoading(false);
      setError("Не удалось загрузить аудио");
    }
    el.addEventListener("loadedmetadata", onLoad);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    if (el.readyState >= 2) {
      onLoad();
    }
    return () => {
      cancelled = true;
      el.removeEventListener("loadedmetadata", onLoad);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [src]);
  const togglePlay = reactExports.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => setError("Не удалось воспроизвести"));
      setPlaying(true);
    }
  }, [playing]);
  const handleSeek = reactExports.useCallback((e) => {
    const el = audioRef.current;
    if (!el) return;
    const time = Number(e.target.value);
    el.currentTime = time;
    setCurrentTime(time);
  }, []);
  const toggleMute = reactExports.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !muted;
    setMuted(!muted);
  }, [muted]);
  const handleVolume = reactExports.useCallback(
    (e) => {
      const el = audioRef.current;
      if (!el) return;
      const v = Number(e.target.value);
      el.volume = v;
      setVolume(v);
      if (v === 0) {
        el.muted = true;
        setMuted(true);
      } else if (muted) {
        el.muted = false;
        setMuted(false);
      }
    },
    [muted]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { ref: audioRef, preload: "metadata", src }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 truncate text-xs font-bold text-muted-foreground", title: fileName, children: [
      "🎵 ",
      fileName
    ] }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: error }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: togglePlay,
            disabled: loading,
            className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5 disabled:opacity-50",
            title: playing ? "Пауза" : "Воспроизвести",
            "aria-label": playing ? "Пауза" : "Воспроизвести",
            children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-4 animate-pulse rounded-full bg-muted-foreground" }) : playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "range",
            min: 0,
            max: duration || 100,
            value: currentTime,
            onChange: handleSeek,
            className: "h-2 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-chunky-sm",
            title: "Перемотка"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-16 text-right text-xs font-bold text-muted-foreground", children: [
          formatTime$1(currentTime),
          " / ",
          formatTime$1(duration)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: toggleMute,
            className: "grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5",
            title: muted ? "Включить звук" : "Выключить звук",
            "aria-label": muted ? "Включить звук" : "Выключить звук",
            children: muted || volume === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "range",
            min: 0,
            max: 1,
            step: 0.05,
            value: muted ? 0 : volume,
            onChange: handleVolume,
            className: "h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary",
            title: "Громкость"
          }
        )
      ] })
    ] })
  ] });
}
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function VideoPlayer({ src, fileName }) {
  const videoRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [playing, setPlaying] = reactExports.useState(false);
  const [currentTime, setCurrentTime] = reactExports.useState(0);
  const [duration, setDuration] = reactExports.useState(0);
  const [volume, setVolume] = reactExports.useState(1);
  const [muted, setMuted] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [fullscreen, setFullscreen] = reactExports.useState(false);
  const [showControls, setShowControls] = reactExports.useState(true);
  const hideTimerRef = reactExports.useRef(null);
  const handleMouseMove = reactExports.useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3e3);
  }, [playing]);
  reactExports.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const el = video;
    let cancelled = false;
    function onLoad() {
      if (cancelled) return;
      setLoading(false);
      setDuration(el.duration || 0);
    }
    function onTimeUpdate() {
      if (cancelled) return;
      setCurrentTime(el.currentTime);
    }
    function onEnded() {
      if (cancelled) return;
      setPlaying(false);
      setCurrentTime(0);
    }
    function onError() {
      if (cancelled) return;
      setLoading(false);
      setError("Не удалось загрузить видео");
    }
    el.addEventListener("loadedmetadata", onLoad);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    if (el.readyState >= 2) {
      onLoad();
    }
    return () => {
      cancelled = true;
      el.removeEventListener("loadedmetadata", onLoad);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [src]);
  reactExports.useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);
  const togglePlay = reactExports.useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => setError("Не удалось воспроизвести"));
      setPlaying(true);
    }
  }, [playing]);
  const handleSeek = reactExports.useCallback((e) => {
    const el = videoRef.current;
    if (!el) return;
    const time = Number(e.target.value);
    el.currentTime = time;
    setCurrentTime(time);
  }, []);
  const toggleMute = reactExports.useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !muted;
    setMuted(!muted);
  }, [muted]);
  const handleVolume = reactExports.useCallback(
    (e) => {
      const el = videoRef.current;
      if (!el) return;
      const v = Number(e.target.value);
      el.volume = v;
      setVolume(v);
      if (v === 0) {
        el.muted = true;
        setMuted(true);
      } else if (muted) {
        el.muted = false;
        setMuted(false);
      }
    },
    [muted]
  );
  const toggleFullscreen = reactExports.useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    if (fullscreen) {
      await document.exitFullscreen();
      setFullscreen(false);
    } else {
      await container.requestFullscreen();
      setFullscreen(true);
    }
  }, [fullscreen]);
  reactExports.useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: "relative overflow-hidden rounded-2xl border-2 border-ink bg-black shadow-chunky-sm",
      onMouseMove: handleMouseMove,
      onMouseLeave: () => playing && setShowControls(false),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            ref: videoRef,
            src,
            preload: "metadata",
            className: "block w-full max-h-96 object-contain cursor-pointer",
            onClick: togglePlay,
            onDoubleClick: toggleFullscreen,
            playsInline: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `absolute left-0 right-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs font-bold text-white", title: fileName, children: [
              "🎬 ",
              fileName
            ] })
          }
        ),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground", children: error }) }),
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" }) }),
        !playing && !loading && !error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: togglePlay,
            className: "grid h-16 w-16 place-items-center rounded-full border-2 border-white/60 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:scale-110",
            "aria-label": "Воспроизвести",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-8 w-8 ml-1" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-white/80", children: formatTime(currentTime) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "range",
                    min: 0,
                    max: duration || 100,
                    value: currentTime,
                    onChange: handleSeek,
                    className: "h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-white/80", children: formatTime(duration) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: togglePlay,
                    className: "grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30",
                    "aria-label": playing ? "Пауза" : "Воспроизвести",
                    children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5 ml-0.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: toggleMute,
                    className: "grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30",
                    "aria-label": muted ? "Включить звук" : "Выключить звук",
                    children: muted || volume === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "range",
                    min: 0,
                    max: 1,
                    step: 0.05,
                    value: muted ? 0 : volume,
                    onChange: handleVolume,
                    className: "h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
                    title: "Громкость"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: toggleFullscreen,
                    className: "grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30",
                    "aria-label": fullscreen ? "Свернуть" : "На весь экран",
                    children: fullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { className: "h-3.5 w-3.5" })
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
  "application/json",
  "application/xml"
]);
function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return `Файл слишком большой. Максимум 50 МБ, а этот — ${(file.size / 1024 / 1024).toFixed(1)} МБ.`;
  }
  if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/")) {
    return `Тип файла "${file.type}" не поддерживается.`;
  }
  return null;
}
async function uploadFile(file, userId, onProgress) {
  const validationError = validateFile(file);
  if (validationError) {
    return { path: null, error: validationError };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${timestamp}-${random}.${ext}`;
  const { error } = await supabase.storage.from("chat-files").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || void 0
  });
  if (error) {
    return { path: null, error: error.message };
  }
  return { path, error: null };
}
async function getFileUrl(filePath) {
  if (!filePath) return null;
  const { data, error } = await supabase.storage.from("chat-files").createSignedUrl(filePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
function formatFileSize$1(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
const IMAGE_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);
const AUDIO_TYPES = /* @__PURE__ */ new Set([
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/aac",
  "audio/flac"
]);
const VIDEO_TYPES = /* @__PURE__ */ new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
function getFileIcon(fileType) {
  if (fileType === "application/pdf") return FileText;
  if (fileType.startsWith("text/")) return FileText;
  if (fileType.startsWith("application/zip") || fileType.includes("rar") || fileType.includes("tar") || fileType.includes("7z"))
    return FileArchive;
  if (fileType.startsWith("application/json") || fileType === "application/xml") return FileCode;
  if (fileType.startsWith("application/") || fileType.startsWith("text/")) return FileText;
  return File;
}
function FilePreview({ filePath, fileName, fileType, fileSize }) {
  const [url, setUrl] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFileUrl(filePath).then((signedUrl) => {
      if (cancelled) return;
      if (signedUrl) {
        setUrl(signedUrl);
      } else {
        setError("Не удалось загрузить файл");
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [filePath]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 animate-pulse rounded-xl bg-muted" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-3/4 animate-pulse rounded bg-muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-1/2 animate-pulse rounded bg-muted" })
      ] })
    ] });
  }
  if (error || !url) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-bold", children: fileName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: error ?? "Недоступен" })
      ] })
    ] });
  }
  if (IMAGE_TYPES.has(fileType)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: fileName, className: "max-h-80 w-full object-contain", loading: "lazy" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t-2 border-ink bg-muted p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs font-bold text-muted-foreground", children: fileName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            download: fileName,
            className: "grid h-7 w-7 place-items-center rounded-lg border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5",
            title: "Скачать",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" })
          }
        )
      ] })
    ] });
  }
  if (AUDIO_TYPES.has(fileType)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AudioPlayer, { src: url, fileName });
  }
  if (VIDEO_TYPES.has(fileType)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(VideoPlayer, { src: url, fileName });
  }
  const FileIconComponent = getFileIcon(fileType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      download: fileName,
      className: "flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm transition hover:-translate-y-0.5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-background shadow-chunky-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileIconComponent, { className: "h-6 w-6 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-bold", children: fileName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: formatFileSize(fileSize) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-5 w-5 shrink-0 text-muted-foreground" })
      ]
    }
  );
}
function useChatReactions() {
  return useQuery({
    queryKey: ["chat-reactions"],
    queryFn: async () => {
      const { data } = await supabase.from("chat_reactions").select("*").order("created_at", { ascending: true });
      const reactions = data ?? [];
      const withUrls = await Promise.all(
        reactions.map(async (r) => {
          try {
            const url = await getSignedUrl("reaction-proposals", r.image_url);
            return { ...r, imageSignedUrl: url };
          } catch {
            return r;
          }
        })
      );
      return withUrls;
    }
  });
}
const STATIC_REACTIONS = [
  { code: "laugh", emoji: "🤣", label: "Уничтожило" },
  { code: "brain", emoji: "🧠", label: "Мозг сломался" },
  { code: "coffee", emoji: "☕", label: "Норм треп" },
  { code: "ambulance", emoji: "🚑", label: "Срочно заберите автора" },
  { code: "fish", emoji: "🐟", label: "Рыба одобряет" }
];
const to = "/auth";
function PostCard({
  post,
  showComments = false,
  readOnly = false
}) {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: chatReactions } = useChatReactions();
  const [pickerOpen, setPickerOpen] = reactExports.useState(false);
  const pickerRef = reactExports.useRef(null);
  const nick = post.profiles?.nickname ?? "deleted";
  const display = post.profiles?.display_name ?? nick;
  const commentsCount = post.comments?.[0]?.count ?? 0;
  const isReadOnly = readOnly || !user;
  reactExports.useEffect(() => {
    if (!pickerOpen) return;
    function onClick(e) {
      if (!pickerRef.current?.contains(e.target)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [pickerOpen]);
  async function toggleReaction(code) {
    if (!user) return;
    const mine = post.post_reactions.find((r) => r.user_id === user.id);
    if (mine && mine.reaction === code) {
      const { error } = await supabase.from("post_reactions").delete().eq("post_id", post.id).eq("user_id", user.id);
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.from("post_reactions").upsert(
        { post_id: post.id, user_id: user.id, reaction: code },
        { onConflict: "post_id,user_id" }
      );
      if (error) toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["feed"] });
    qc.invalidateQueries({ queryKey: ["post", post.id] });
    qc.invalidateQueries({ queryKey: ["user-posts", post.author_id] });
  }
  async function deletePost() {
    if (!confirm("Удалить треп?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Удалено");
    qc.invalidateQueries();
  }
  async function adminHide() {
    const reason = window.prompt("Причина скрытия:") ?? "modered";
    const { error } = await supabase.from("posts").update({ is_hidden: true, hidden_reason: reason }).eq("id", post.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Треп скрыт");
    qc.invalidateQueries();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: isReadOnly ? to : "/u/$nickname",
          params: isReadOnly ? {} : { nickname: nick },
          className: "flex items-center gap-3 min-w-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { path: post.profiles?.avatar_url, nickname: nick }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate font-bold", children: display }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground", children: [
                "@",
                nick,
                " · ",
                new Date(post.created_at).toLocaleString("ru-RU")
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        post.is_hidden && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive", children: "скрыт" }),
        !isReadOnly && (user?.id === post.author_id || isAdmin) && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: deletePost,
            className: "text-xs font-bold text-muted-foreground hover:text-destructive",
            children: "Удалить"
          }
        ),
        !isReadOnly && isAdmin && !post.is_hidden && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: adminHide,
            className: "text-xs font-bold text-muted-foreground hover:text-destructive",
            children: "Скрыть"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: isReadOnly ? to : "/post/$id",
        params: isReadOnly ? {} : { id: post.id },
        className: "mt-3 block whitespace-pre-wrap text-base leading-snug hover:opacity-90",
        children: post.content
      }
    ),
    post.post_attachments && post.post_attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2", children: post.post_attachments.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilePreview,
      {
        filePath: a.file_path,
        fileName: a.file_name,
        fileType: a.file_type,
        fileSize: a.file_size
      },
      a.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-4 flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
        (() => {
          const counts = /* @__PURE__ */ new Map();
          for (const r of post.post_reactions)
            counts.set(r.reaction, (counts.get(r.reaction) ?? 0) + 1);
          const used = Array.from(counts.keys());
          const findChat = (code) => chatReactions?.find((c) => c.name === code);
          const findStatic = (code) => STATIC_REACTIONS.find((s) => s.code === code);
          return used.map((code) => {
            const mine = !!post.post_reactions.find(
              (x) => x.user_id === user?.id && x.reaction === code
            );
            const chat = findChat(code);
            const stat = findStatic(code);
            if (isReadOnly) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-1 text-sm font-bold shadow-chunky-sm bg-background",
                  title: chat?.name ?? stat?.label ?? code,
                  children: [
                    chat ? chat.imageSignedUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: chat.imageSignedUrl,
                        alt: chat.name,
                        className: "h-4 w-4 object-contain"
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chat.emoji_fallback ?? "⭐" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: stat?.emoji ?? "❓" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: counts.get(code) })
                  ]
                },
                code
              );
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => toggleReaction(code),
                className: `flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-1 text-sm font-bold shadow-chunky-sm transition hover:-translate-y-0.5 ${mine ? "bg-primary text-primary-foreground" : "bg-background"}`,
                title: chat?.name ?? stat?.label ?? code,
                children: [
                  chat ? chat.imageSignedUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: chat.imageSignedUrl,
                      alt: chat.name,
                      className: "h-4 w-4 object-contain"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chat.emoji_fallback ?? "⭐" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: stat?.emoji ?? "❓" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: counts.get(code) })
                ]
              },
              code
            );
          });
        })(),
        !isReadOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: pickerRef, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPickerOpen((v) => !v),
              className: "grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5 hover:bg-muted",
              title: "Добавить реакцию",
              "aria-label": "Добавить реакцию",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SmilePlus, { className: "h-4 w-4" })
            }
          ),
          pickerOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-0 z-20 mb-2 w-64 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs font-bold text-muted-foreground", children: "Одобренные реакции" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: chatReactions && chatReactions.length > 0 ? chatReactions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                title: r.name,
                onClick: () => {
                  toggleReaction(r.name);
                  setPickerOpen(false);
                },
                className: "grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-background transition hover:-translate-y-0.5 hover:bg-muted",
                children: r.imageSignedUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: r.imageSignedUrl,
                    alt: r.name,
                    className: "h-6 w-6 object-contain"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: r.emoji_fallback ?? "⭐" })
              },
              r.id
            )) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Пока пусто" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-px bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 mb-2 text-xs font-bold text-muted-foreground", children: "Базовые" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: STATIC_REACTIONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                title: r.label,
                onClick: () => {
                  toggleReaction(r.code);
                  setPickerOpen(false);
                },
                className: "grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-background text-lg transition hover:-translate-y-0.5 hover:bg-muted",
                children: r.emoji
              },
              r.code
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/propose-reaction",
                onClick: () => setPickerOpen(false),
                className: "mt-3 block rounded-xl border-2 border-ink bg-background px-3 py-2 text-center text-xs font-bold shadow-chunky-sm hover:bg-muted",
                children: "+ Предложить новую реакцию"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            ...isReadOnly ? { to: "/auth", params: {} } : { to: "/post/$id", params: { id: post.id } },
            className: "text-sm font-bold text-muted-foreground hover:text-primary",
            children: [
              "💬 ",
              commentsCount
            ]
          }
        ),
        !isReadOnly && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportButton, { targetType: "post", targetId: post.id, label: "" })
      ] })
    ] }),
    isReadOnly && showComments === false && commentsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/auth",
        className: "mt-2 inline-block text-xs font-bold text-primary hover:underline",
        children: "Войдите, чтобы посмотреть комментарии →"
      }
    ),
    !isReadOnly && showComments === false && commentsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/post/$id",
        params: { id: post.id },
        className: "mt-2 inline-block text-xs font-bold text-primary hover:underline",
        children: "Посмотреть комментарии →"
      }
    )
  ] });
}
const Route$9 = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Треп — соцсеть для полной ерунды" },
      {
        name: "description",
        content: "Напиши мысль, о которой пожалеешь через 3 секунды. Треп — социальная сеть, где живут самые странные мысли интернета."
      },
      { property: "og:title", content: "Треп — соцсеть для полной ерунды" },
      { property: "og:description", content: "Напиши мысль, о которой пожалеешь через 3 секунды." }
    ]
  }),
  component: Index
});
function Index() {
  const { user, loading } = useAuth();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-feed"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(
        "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)"
      ).is("is_hidden", false).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    }
  });
  const nav = (label, guestTo, authTo) => {
    const to2 = user ? authTo : guestTo;
    const params = to2 === "/auth" ? {} : {};
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: to2,
        params,
        className: "hover:text-primary",
        activeProps: { className: "text-primary" },
        children: label
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: user ? "/feed" : "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm", children: "🗯️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-2xl font-extrabold", children: "Треп" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden gap-6 text-sm font-bold md:flex", children: [
        nav("Лента", "/", "/feed"),
        nav("Поиск", "/auth", "/search"),
        nav("Сообщения", "/auth", "/messages"),
        nav("Реакция", "/auth", "/propose-reaction")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthButton, {})
    ] }) }),
    !user && !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl px-4 pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border-2 border-dashed border-primary/40 bg-card p-6 text-center shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg font-extrabold", children: "🔥 Хочешь ставить реакции, писать трепы и комментировать?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Зарегистрируйся за минуту и присоединяйся к сообществу." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex justify-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/auth",
            className: "rounded-xl border-2 border-ink bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-chunky-sm transition hover:-translate-y-0.5",
            children: "Зарегистрироваться"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/auth",
            className: "rounded-xl border-2 border-ink bg-accent px-6 py-2.5 font-bold shadow-chunky-sm transition hover:-translate-y-0.5",
            children: "Войти"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl px-4 pb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-full bg-green-500 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-muted-foreground", children: "Свежие трепы — читай и угарай" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-3", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "animate-pulse rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-muted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-32 rounded bg-muted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-20 rounded bg-muted" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-full rounded bg-muted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-3/4 rounded bg-muted" })
              ] })
            ]
          },
          i
        )) }),
        !isLoading && (posts?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground", children: [
          "Пока никто ничего не ляпнул. Будь первым —",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "font-bold text-primary underline", children: "зарегистрируйся" }),
          "!"
        ] }),
        posts?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post: p, readOnly: true }, p.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t-2 border-ink bg-secondary py-8 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "© Треп. Все мысли случайны, совпадения — тоже. Подсказка: попробуй напечатать «рыба» 5 раз подряд 🐟" }) })
  ] });
}
function AuthButton() {
  const { session, loading } = useAuth();
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-20 animate-pulse rounded-xl bg-muted" });
  if (session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/feed",
        className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm hover:-translate-y-0.5 transition-transform",
        children: "В приложение"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: "/auth",
      className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm hover:-translate-y-0.5 transition-transform",
      children: "Войти"
    }
  );
}
const Route$8 = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Поиск — Треп" }] }),
  component: SearchPage
});
function SearchPage() {
  const [q, setQ] = reactExports.useState("");
  const { data, isFetching } = useQuery({
    queryKey: ["search-users", q],
    enabled: q.trim().length >= 1,
    queryFn: async () => {
      const term = q.trim().replace(/[%_]/g, "");
      const { data: data2 } = await supabase.from("profiles").select("id,nickname,display_name,avatar_url,bio,is_private").or(`nickname.ilike.%${term}%,display_name.ilike.%${term}%`).limit(30);
      return data2 ?? [];
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: "Поиск трепачей" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        autoFocus: true,
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: "Никнейм или имя…",
        className: "mt-4 w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
      q.trim().length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Начни вводить никнейм." }),
      isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Ищем…" }),
      data?.length === 0 && q.trim().length > 0 && !isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Никого не нашли." }),
      data?.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/u/$nickname",
          params: { nickname: u.nickname },
          className: "flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm hover:-translate-y-0.5 transition-transform",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { path: u.avatar_url, nickname: u.nickname }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate font-bold", children: [
                u.display_name ?? u.nickname,
                " ",
                u.is_private && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "🔒" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground", children: [
                "@",
                u.nickname
              ] }),
              u.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm text-muted-foreground", children: u.bio })
            ] })
          ]
        },
        u.id
      ))
    ] })
  ] });
}
const Route$7 = createFileRoute("/_authenticated/propose-reaction")({
  head: () => ({ meta: [{ title: "Предложить реакцию — Треп" }] }),
  component: ProposeReactionPage
});
const schema = objectType({
  name: stringType().trim().min(2, "Минимум 2 символа").max(30).regex(/^[a-zA-Zа-яА-Я0-9_ -]+$/, "Только буквы, цифры, _ и -"),
  description: stringType().trim().max(140).optional().or(literalType(""))
});
function ProposeReactionPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const { data: proposals } = useQuery({
    queryKey: ["my-proposals", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("reaction_proposals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user
  });
  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ name, description });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!file) {
      toast.error("Прикрепи PNG-картинку");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Файл больше 2 МБ");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Только картинки");
      return;
    }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("reaction-proposals").upload(path, file);
      if (upErr) {
        toast.error(upErr.message);
        return;
      }
      const { error } = await supabase.from("reaction_proposals").insert({
        user_id: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        image_url: path
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Заявка отправлена админу. Ждём вердикта Рыбного совета 🐟");
      setName("");
      setDescription("");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["my-proposals", user.id] });
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: "Предложить реакцию" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Загрузи PNG, придумай название — админ решит, добавлять ли в чаты." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "mt-6 space-y-4 rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-bold", children: "Название реакции" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: name,
                maxLength: 30,
                onChange: (e) => setName(e.target.value),
                placeholder: "например: рыба_одобряет",
                className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-bold", children: "Описание (необязательно)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: description,
                maxLength: 140,
                onChange: (e) => setDescription(e.target.value),
                placeholder: "Когда уместно её использовать",
                className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-bold", children: "Картинка (PNG, до 2 МБ)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/png,image/jpeg,image/webp,image/gif",
                onChange: (e) => setFile(e.target.files?.[0] ?? null),
                className: "block w-full rounded-xl border-2 border-ink bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-bold file:text-primary-foreground"
              }
            ),
            file && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              file.name,
              " · ",
              (file.size / 1024).toFixed(1),
              " КБ"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: submitting,
              className: "w-full rounded-2xl border-2 border-ink bg-gradient-button py-3 font-display font-extrabold text-primary-foreground shadow-chunky-sm disabled:opacity-60",
              children: submitting ? "Отправляем…" : "Отправить на модерацию"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-12 font-display text-2xl font-extrabold", children: "Мои заявки" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      (!proposals || proposals.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Пока ничего не предлагал.",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-primary underline", children: "Иди ляпни что-нибудь" }),
        "."
      ] }),
      proposals?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProposalRow, { proposal: p }, p.id))
    ] })
  ] });
}
const statusLabel = {
  pending: { text: "На модерации", cls: "bg-accent text-accent-foreground" },
  approved: { text: "Одобрено", cls: "bg-primary text-primary-foreground" },
  rejected: { text: "Отклонено", cls: "bg-destructive text-destructive-foreground" }
};
function ProposalRow({ proposal }) {
  const [url, setUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    getSignedUrl("reaction-proposals", proposal.image_url).then(setUrl);
  }, [proposal.image_url]);
  const s = statusLabel[proposal.status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-ink bg-muted", children: url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: proposal.name, className: "h-full w-full object-contain" }) : "…" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold truncate", children: proposal.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(proposal.created_at).toLocaleString("ru-RU") }),
      proposal.review_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs italic mt-1", children: [
        "Комментарий админа: ",
        proposal.review_note
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `shrink-0 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold ${s.cls}`,
        children: s.text
      }
    )
  ] });
}
const Route$6 = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Профиль — Треп" }] }),
  component: ProfilePage
});
const updateSchema = objectType({
  display_name: stringType().trim().max(60).optional().or(literalType("")),
  bio: stringType().trim().max(280).optional().or(literalType("")),
  birthday: stringType().optional().or(literalType("")),
  is_private: booleanType(),
  hide_following: booleanType(),
  allow_dms: booleanType()
});
function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user
  });
  const [form, setForm] = reactExports.useState({
    display_name: "",
    bio: "",
    birthday: "",
    is_private: false,
    hide_following: false,
    allow_dms: true
  });
  const [avatarUrl, setAvatarUrl] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        birthday: profile.birthday ?? "",
        is_private: profile.is_private,
        hide_following: profile.hide_following,
        allow_dms: profile.allow_dms
      });
      if (profile.avatar_url) {
        getSignedUrl("avatars", profile.avatar_url).then(setAvatarUrl);
      } else {
        setAvatarUrl(null);
      }
    }
  }, [profile]);
  async function handleAvatarUpload(file) {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Только картинки");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) {
        toast.error(upErr.message);
        return;
      }
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (dbErr) {
        toast.error(dbErr.message);
        return;
      }
      toast.success("Аватар обновлён");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    } finally {
      setUploading(false);
    }
  }
  async function handleSave(e) {
    e.preventDefault();
    if (!user) return;
    const parsed = updateSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        display_name: parsed.data.display_name || null,
        bio: parsed.data.bio || null,
        birthday: parsed.data.birthday || null,
        is_private: parsed.data.is_private,
        hide_following: parsed.data.hide_following,
        allow_dms: parsed.data.allow_dms
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Профиль сохранён");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    } finally {
      setSaving(false);
    }
  }
  if (isLoading)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl p-6 text-muted-foreground", children: "Загружаем профиль…" });
  if (!profile)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-2xl p-6 text-destructive", children: "Профиль не найден." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: "Мой профиль" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-muted-foreground", children: [
      "@",
      profile.nickname,
      " · с ",
      new Date(profile.created_at).toLocaleDateString("ru-RU")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center gap-5 rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-ink bg-accent text-2xl font-extrabold", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full object-cover" }) : profile.nickname[0].toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Аватар" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "PNG / JPG, до 5 МБ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-2 inline-block cursor-pointer rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm hover:-translate-y-0.5 transition-transform", children: [
          uploading ? "Загрузка…" : "Загрузить новый",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              className: "hidden",
              disabled: uploading,
              onChange: (e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSave,
        className: "mt-6 space-y-4 rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Отображаемое имя", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.display_name,
              maxLength: 60,
              onChange: (e) => setForm({ ...form, display_name: e.target.value }),
              placeholder: "Как тебя называть",
              className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "О себе", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: form.bio,
                maxLength: 280,
                rows: 3,
                onChange: (e) => setForm({ ...form, bio: e.target.value }),
                placeholder: "Расскажи о ерунде, которой ты занимаешься",
                className: "w-full resize-none rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-right text-xs text-muted-foreground", children: [
              form.bio.length,
              "/280"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "День рождения", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              value: form.birthday ?? "",
              onChange: (e) => setForm({ ...form, birthday: e.target.value }),
              className: "w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-ink bg-secondary p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg font-extrabold", children: "Приватность" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Toggle,
                {
                  label: "Скрыть профиль (видеть может только я)",
                  checked: form.is_private,
                  onChange: (v) => setForm({ ...form, is_private: v })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Toggle,
                {
                  label: "Скрыть список подписок",
                  checked: form.hide_following,
                  onChange: (v) => setForm({ ...form, hide_following: v })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Toggle,
                {
                  label: "Разрешить личные сообщения",
                  checked: form.allow_dms,
                  onChange: (v) => setForm({ ...form, allow_dms: v })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: saving,
              className: "w-full rounded-2xl border-2 border-ink bg-gradient-button py-3 font-display font-extrabold text-primary-foreground shadow-chunky-sm disabled:opacity-60",
              children: saving ? "Сохраняем…" : "Сохранить"
            }
          )
        ]
      }
    )
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-bold", children: label }),
    children
  ] });
}
function Toggle({
  label,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-background px-3 py-2 border border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        checked,
        onChange: (e) => onChange(e.target.checked),
        className: "h-5 w-5 cursor-pointer"
      }
    )
  ] });
}
const Route$5 = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Сообщения — Треп" }] }),
  component: MessagesPage
});
function MessagesPage() {
  const { user } = useAuth();
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("id,content,created_at,read_at,sender_id,recipient_id").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const map = /* @__PURE__ */ new Map();
      for (const m of data ?? []) {
        const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
        if (!map.has(other)) map.set(other, { other, last: m, unread: 0 });
        const entry = map.get(other);
        if (m.recipient_id === user.id && !m.read_at) entry.unread += 1;
      }
      const others = Array.from(map.values());
      if (others.length === 0) return [];
      const { data: profiles } = await supabase.from("profiles").select("id,nickname,display_name,avatar_url").in(
        "id",
        others.map((o) => o.other)
      );
      return others.map((o) => ({
        ...o,
        profile: profiles?.find((p) => p.id === o.other)
      }));
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: "💌 Сообщения" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Личные диалоги. Видны только тебе и собеседнику." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Загружаем…" }),
      !isLoading && (conversations?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground", children: [
        "Пока никто не пишет. Найди кого-нибудь через",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/search", className: "font-bold text-primary", children: "поиск" }),
        "."
      ] }),
      conversations?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/messages/$nickname",
          params: { nickname: c.profile?.nickname ?? "" },
          className: "flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm hover:-translate-y-0.5 transition-transform",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { path: c.profile?.avatar_url, nickname: c.profile?.nickname }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 truncate font-bold", children: [
                "@",
                c.profile?.nickname ?? "?",
                c.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground", children: c.unread })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm text-muted-foreground", children: c.last.content })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(c.last.created_at).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit"
            }) })
          ]
        },
        c.other
      ))
    ] })
  ] });
}
function AttachmentUpload({
  onFilesSelected,
  onError,
  disabled,
  maxFiles = 5
}) {
  const inputRef = reactExports.useRef(null);
  const [selected, setSelected] = reactExports.useState([]);
  const handleSelect = reactExports.useCallback(
    (e) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      e.target.value = "";
      for (const f of files) {
        const err = validateFile(f);
        if (err) {
          onError(err);
          return;
        }
      }
      setSelected((prev) => {
        const combined = [...prev, ...files].slice(0, maxFiles);
        return combined;
      });
    },
    [maxFiles, onError]
  );
  const removeFile = reactExports.useCallback((index) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const confirmSelection = reactExports.useCallback(() => {
    if (selected.length === 0) return;
    onFilesSelected(selected);
    setSelected([]);
  }, [selected, onFilesSelected]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/zip,application/x-rar-compressed,application/json,application/xml",
        multiple: true,
        onChange: handleSelect,
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => inputRef.current?.click(),
        disabled: disabled || selected.length >= maxFiles,
        className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5 hover:bg-muted disabled:opacity-40",
        title: "Прикрепить файл",
        "aria-label": "Прикрепить файл",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" })
      }
    ),
    selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-0 z-20 mb-2 w-80 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 text-xs font-bold text-muted-foreground", children: [
        "Выбрано файлов: ",
        selected.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-60 overflow-y-auto", children: selected.map((file, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-2 rounded-xl border-2 border-ink bg-background p-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs font-bold", children: file.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: formatFileSize$1(file.size) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => removeFile(i),
                className: "grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-ink bg-background shadow-chunky-sm hover:bg-destructive/15",
                title: "Удалить",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ]
        },
        `${file.name}-${i}`
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: confirmSelection,
            className: "flex-1 rounded-lg border-2 border-ink bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground shadow-chunky-sm",
            children: "Прикрепить"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelected([]),
            className: "rounded-lg border-2 border-ink bg-background px-2.5 py-1.5 text-xs font-bold shadow-chunky-sm",
            children: "Отмена"
          }
        )
      ] })
    ] })
  ] });
}
const Route$4 = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Лента — Треп" }] }),
  component: FeedPage
});
const TAB_LABELS = {
  smart: "🧠 Умная",
  chaos: "🌀 Полный треп",
  fresh: "🆕 Свежие",
  following: "👥 Подписки"
};
function FeedPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("smart");
  const [content, setContent] = reactExports.useState("");
  const [posting, setPosting] = reactExports.useState(false);
  const [pendingFiles, setPendingFiles] = reactExports.useState([]);
  const { data: madnessPref, refetch: refetchPref } = useQuery({
    queryKey: ["madness-pref", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("madness_pref").eq("id", user.id).maybeSingle();
      return data?.madness_pref ?? 50;
    }
  });
  const { data: following } = useQuery({
    queryKey: ["following-ids", user?.id],
    enabled: !!user && tab === "following",
    queryFn: async () => {
      const { data } = await supabase.from("follows").select("followee_id").eq("follower_id", user.id);
      return data?.map((r) => r.followee_id) ?? [];
    }
  });
  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed", tab, user?.id, madnessPref, following?.length],
    enabled: !!user && (tab !== "following" || !!following),
    queryFn: async () => {
      if (tab === "following") {
        const ids2 = [...following ?? [], user.id];
        const { data: data2, error: error2 } = await supabase.from("posts").select(
          "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count)"
        ).in("author_id", ids2).order("created_at", { ascending: false }).limit(50);
        if (error2) throw error2;
        return data2 ?? [];
      }
      const { data: idsData, error: rpcErr } = await supabase.rpc("smart_feed", {
        _mode: tab,
        _limit: 50
      });
      if (rpcErr) throw rpcErr;
      const ids = (idsData ?? []).map((r) => r.post_id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from("posts").select(
        "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)"
      ).in("id", ids);
      if (error) throw error;
      const rank = new Map(ids.map((id, i) => [id, i]));
      return data.sort(
        (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)
      );
    }
  });
  async function submit() {
    const text = content.trim();
    if (!text && pendingFiles.length === 0 || !user) return;
    setPosting(true);
    const { data: newPost, error } = await supabase.from("posts").insert({ author_id: user.id, content: text }).select("id").single();
    if (error || !newPost) {
      toast.error(error?.message ?? "Ошибка при создании поста");
      setPosting(false);
      return;
    }
    for (const file of pendingFiles) {
      const result = await uploadFile(file, user.id);
      if (result.error) {
        toast.error(`Ошибка загрузки ${file.name}: ${result.error}`);
        continue;
      }
      const { error: attErr } = await supabase.from("post_attachments").insert({
        post_id: newPost.id,
        file_path: result.path,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size: file.size
      });
      if (attErr) {
        toast.error(`Ошибка сохранения вложения: ${attErr.message}`);
      }
    }
    setPosting(false);
    setContent("");
    setPendingFiles([]);
    toast.success("Ляпнул!");
    qc.invalidateQueries({ queryKey: ["feed"] });
  }
  async function updateMadness(v) {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ madness_pref: v }).eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refetchPref();
    qc.invalidateQueries({ queryKey: ["feed"] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: "Лента" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: content,
          onChange: (e) => setContent(e.target.value.slice(0, 280)),
          placeholder: "Ляпни что-нибудь… (до 280 символов)",
          rows: 3,
          className: "w-full resize-none rounded-xl border-2 border-ink bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
        }
      ),
      pendingFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2 border-t-2 border-ink pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-muted-foreground", children: "Вложения к посту:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: pendingFiles.map((file, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 rounded-xl border-2 border-ink bg-background p-2 text-xs font-bold",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[150px]", children: file.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setPendingFiles((prev) => prev.filter((_, i) => i !== idx)),
                  className: "text-destructive hover:scale-110",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                }
              )
            ]
          },
          idx
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AttachmentUpload,
            {
              onFilesSelected: (files) => setPendingFiles((prev) => [...prev, ...files]),
              onError: (err) => toast.error(err),
              disabled: posting
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            content.length,
            "/280"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: submit,
            disabled: posting || content.trim().length === 0 && pendingFiles.length === 0,
            className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm disabled:opacity-50",
            children: "ЛЯПНУТЬ"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: Object.keys(TAB_LABELS).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setTab(t),
        className: `rounded-xl border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-chunky-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-background"}`,
        children: TAB_LABELS[t]
      },
      t
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-between text-xs font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🤪 Коэффициент безумия в ленте" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          madnessPref ?? 50,
          "/100"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "range",
          min: 0,
          max: 100,
          value: madnessPref ?? 50,
          onChange: (e) => updateMadness(Number(e.target.value)),
          className: "w-full"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "обычное" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "странное" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "шедевр абсурда" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Загружаем трепы…" }),
      !isLoading && (posts?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground", children: tab === "following" ? "Подпишись на кого-нибудь, чтобы видеть их трепы." : "Пока тихо. Ляпни первым!" }),
      posts?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post: p }, p.id))
    ] })
  ] });
}
const approveProposalSchema = objectType({
  proposalId: stringType().uuid(),
  name: stringType().min(1).max(100),
  imageUrl: stringType().min(1)
});
const rejectProposalSchema = objectType({
  proposalId: stringType().uuid(),
  reviewNote: stringType().max(500).nullable()
});
const resolveReportSchema = objectType({
  reportId: stringType().uuid(),
  status: enumType(["resolved", "dismissed"]),
  resolutionNote: stringType().max(500).nullable()
});
const hideTargetSchema = objectType({
  targetType: enumType(["post", "comment", "user"]),
  targetId: stringType(),
  reportId: stringType().uuid()
});
const togglePostVisibilitySchema = objectType({
  postId: stringType().uuid(),
  isHidden: booleanType()
});
const deletePostSchema = objectType({
  postId: stringType().uuid()
});
const toggleUserBlockSchema = objectType({
  userId: stringType().uuid(),
  isBlocked: booleanType()
});
const searchUsersSchema = objectType({
  query: stringType().min(1).max(100)
});
const csrfTokenSchema = objectType({
  csrf_token: stringType().min(1)
});
const adminApproveProposal = createServerFn({
  method: "POST"
}).validator(approveProposalSchema.and(csrfTokenSchema)).handler(createSsrRpc("f43ce6a43b7a311ccede4cc0c70dcc09c688007914d57de9d1449f6b8e77e1e6"));
const adminRejectProposal = createServerFn({
  method: "POST"
}).validator(rejectProposalSchema.and(csrfTokenSchema)).handler(createSsrRpc("abf53afb892525751ddc164df1b9872fd4e7c8eb34aa548cf0baafffeadd2994"));
const adminResolveReport = createServerFn({
  method: "POST"
}).validator(resolveReportSchema.and(csrfTokenSchema)).handler(createSsrRpc("90823a00db079ae8fb993c910a2d697d8c0d139f6ea01bb047fdc8daec268a7b"));
const adminHideTarget = createServerFn({
  method: "POST"
}).validator(hideTargetSchema.and(csrfTokenSchema)).handler(createSsrRpc("95380920034da2d96147884dfc00dbc1b9a2655c577ac8755ecb01c48d7f9408"));
const adminTogglePostVisibility = createServerFn({
  method: "POST"
}).validator(togglePostVisibilitySchema.and(csrfTokenSchema)).handler(createSsrRpc("cc4687b1d171a1dfe433ea5e30a11ffa3870f35af730d2646717ddf61d4ff042"));
const adminDeletePost = createServerFn({
  method: "POST"
}).validator(deletePostSchema.and(csrfTokenSchema)).handler(createSsrRpc("53883aae55dbd771cf716dc3d01091f1f5b3d1919e5e761c406c6542c46bc855"));
const adminToggleUserBlock = createServerFn({
  method: "POST"
}).validator(toggleUserBlockSchema.and(csrfTokenSchema)).handler(createSsrRpc("7e19663fcb415e99c6b2831c275109dd53cb74bcab5e33210f0a3bd6ec05e3d4"));
const adminSearchUsers = createServerFn({
  method: "GET"
}).validator(searchUsersSchema.and(csrfTokenSchema)).handler(createSsrRpc("7545713fb69c8c4e284a62168f6eddda5a0b7ae062051a61ecb1c0c5dba3d9c2"));
const getCsrfToken = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d9f5c6571ad7cc723632ee4990201c4db7ace04de0ad3f729b3b93bd215fd42e"));
const Route$3 = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Админка — Треп" }] }),
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/feed" });
  },
  component: AdminPage
});
function AdminPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = reactExports.useState("proposals");
  const [csrfToken, setCsrfToken] = reactExports.useState(null);
  reactExports.useEffect(() => {
    getCsrfToken().then((res) => setCsrfToken(res.csrf_token)).catch((err) => {
      console.error("[Admin] Failed to get CSRF token:", err);
      toast.error("Не удалось получить CSRF-токен. Некоторые функции могут не работать.");
    });
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: "👑" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold md:text-4xl", children: "Админка" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: ["proposals", "reports", "posts", "users"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setTab(t),
        className: `rounded-xl border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-chunky-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-background"}`,
        children: labelFor(t)
      },
      t
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "proposals" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProposalsTab, { isAdmin, csrfToken }),
      tab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsTab, { csrfToken }),
      tab === "posts" && /* @__PURE__ */ jsxRuntimeExports.jsx(PostsModerationTab, { csrfToken }),
      tab === "users" && /* @__PURE__ */ jsxRuntimeExports.jsx(UsersTab, { csrfToken })
    ] })
  ] });
}
function labelFor(t) {
  return { proposals: "Реакции", reports: "Жалобы", posts: "Трепы", users: "Пользователи" }[t];
}
function NoteModal({
  open,
  title,
  placeholder,
  onConfirm,
  onCancel
}) {
  const [value, setValue] = reactExports.useState("");
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40",
      onClick: onCancel,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "mx-4 w-full max-w-md rounded-2xl border-2 border-ink bg-card p-6 shadow-chunky-lg",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value,
                onChange: (e) => setValue(e.target.value),
                placeholder: placeholder ?? "Введите заметку…",
                className: "mt-3 w-full rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary",
                rows: 3
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    onConfirm(value);
                    setValue("");
                  },
                  className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm",
                  children: "Подтвердить"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    onCancel();
                    setValue("");
                  },
                  className: "rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm",
                  children: "Отмена"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function ProposalsTab({ isAdmin, csrfToken }) {
  const qc = useQueryClient();
  const { data: proposals, isLoading } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: async () => {
      const { data } = await supabase.from("reaction_proposals").select("*, profiles!reaction_proposals_user_profile_fkey(nickname)").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin
  });
  const { data: reactions } = useQuery({
    queryKey: ["admin-reactions"],
    queryFn: async () => {
      const { data } = await supabase.from("chat_reactions").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin
  });
  async function approve(p) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminApproveProposal({
      data: { proposalId: p.id, name: p.name, imageUrl: p.image_url, csrf_token: csrfToken }
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Реакция «${p.name}» добавлена`);
    qc.invalidateQueries({ queryKey: ["admin-proposals"] });
    qc.invalidateQueries({ queryKey: ["admin-reactions"] });
  }
  async function reject(p, note) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminRejectProposal({
      data: { proposalId: p.id, reviewNote: note || null, csrf_token: csrfToken }
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Заявка отклонена");
    qc.invalidateQueries({ queryKey: ["admin-proposals"] });
  }
  const pending = proposals?.filter((p) => p.status === "pending") ?? [];
  const reviewed = proposals?.filter((p) => p.status !== "pending") ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-extrabold", children: "Заявки на новые реакции" }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Загружаем…" }),
    pending.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center text-muted-foreground", children: "Новых заявок нет." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-3", children: pending.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      AdminProposalRow,
      {
        proposal: p,
        onApprove: () => approve(p),
        onReject: (note) => reject(p, note)
      },
      p.id
    )) }),
    reviewed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-10 font-display text-lg font-extrabold", children: "История" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2 opacity-80", children: reviewed.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminProposalRow, { proposal: p, readonly: true }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mt-10 font-display text-lg font-extrabold", children: [
      "Активные реакции (",
      reactions?.length ?? 0,
      ")"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", children: reactions?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(ReactionTile, { reaction: r }, r.id)) })
  ] });
}
function ReportsTab({ csrfToken }) {
  const qc = useQueryClient();
  const [noteModal, setNoteModal] = reactExports.useState(null);
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      const rows = data ?? [];
      const reporterIds = Array.from(new Set(rows.map((r) => r.reporter_id)));
      const { data: profs } = reporterIds.length ? await supabase.from("profiles").select("id,nickname").in("id", reporterIds) : { data: [] };
      const map = new Map(profs?.map((p) => [p.id, p.nickname]));
      return rows.map((r) => ({ ...r, reporter_nick: map.get(r.reporter_id) ?? "—" }));
    }
  });
  async function handleResolve(r, status, note) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminResolveReport({
      data: { reportId: r.id, status, resolutionNote: note || null, csrf_token: csrfToken }
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Готово");
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }
  async function handleHideTarget(r, note) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminHideTarget({
      data: {
        targetType: r.target_type,
        targetId: r.target_id,
        reportId: r.id,
        csrf_token: csrfToken
      }
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Скрыто и закрыто");
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Загружаем…" });
  const pending = reports?.filter((r) => r.status === "pending") ?? [];
  const others = reports?.filter((r) => r.status !== "pending") ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-extrabold", children: [
      "Жалобы (",
      pending.length,
      " новых)"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      pending.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Тишина." }),
      pending.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          new Date(r.created_at).toLocaleString("ru-RU"),
          " · от @",
          r.reporter_nick,
          " ·",
          " ",
          r.target_type
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-bold", children: r.reason }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 break-all text-xs text-muted-foreground", children: [
          "id: ",
          r.target_id
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          r.target_type === "post" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/post/$id",
              params: { id: r.target_id },
              className: "rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-sm font-bold shadow-chunky-sm",
              children: "Открыть треп"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setNoteModal({ report: r, action: "hide" }),
              className: "rounded-xl border-2 border-ink bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground shadow-chunky-sm",
              children: "Скрыть и закрыть"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleResolve(r, "resolved", ""),
              className: "rounded-xl border-2 border-ink bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-chunky-sm",
              children: "Принять"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setNoteModal({ report: r, action: "dismiss" }),
              className: "rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-sm font-bold shadow-chunky-sm",
              children: "Отклонить"
            }
          )
        ] })
      ] }, r.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NoteModal,
      {
        open: noteModal !== null,
        title: noteModal?.action === "hide" ? "Заметка (скрытие)" : noteModal?.action === "dismiss" ? "Заметка (отклонение)" : "Заметка",
        placeholder: "Опциональная заметка…",
        onConfirm: (note) => {
          if (!noteModal) return;
          if (noteModal.action === "hide") {
            handleHideTarget(noteModal.report);
          } else if (noteModal.action === "dismiss") {
            handleResolve(noteModal.report, "dismissed", note);
          }
          setNoteModal(null);
        },
        onCancel: () => setNoteModal(null)
      }
    ),
    others.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-10 font-display text-lg font-extrabold", children: "Закрытые" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-2 opacity-70", children: others.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-2 text-xs", children: [
        r.status,
        " · ",
        r.target_type,
        " · ",
        r.reason
      ] }, r.id)) })
    ] })
  ] });
}
function PostsModerationTab({ csrfToken }) {
  const qc = useQueryClient();
  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select(
        "id,content,created_at,is_hidden,hidden_reason,profiles!posts_author_profile_fkey(nickname)"
      ).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    }
  });
  async function toggleHide(p) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminTogglePostVisibility({
      data: { postId: p.id, isHidden: !p.is_hidden, csrf_token: csrfToken }
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }
  async function remove(p) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    if (!confirm("Удалить треп навсегда?")) return;
    const result = await adminDeletePost({ data: { postId: p.id, csrf_token: csrfToken } });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-extrabold", children: "Последние трепы" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: posts?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "@",
        p.profiles?.nickname,
        " · ",
        new Date(p.created_at).toLocaleString("ru-RU"),
        " ",
        p.is_hidden && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded bg-destructive/15 px-1.5 text-destructive", children: "скрыт" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm", children: p.content }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/post/$id",
            params: { id: p.id },
            className: "rounded-lg border-2 border-ink bg-background px-2 py-1 text-xs font-bold shadow-chunky-sm",
            children: "Открыть"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => toggleHide(p),
            className: "rounded-lg border-2 border-ink bg-background px-2 py-1 text-xs font-bold shadow-chunky-sm",
            children: p.is_hidden ? "Показать" : "Скрыть"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => remove(p),
            className: "rounded-lg border-2 border-ink bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground shadow-chunky-sm",
            children: "Удалить"
          }
        )
      ] })
    ] }, p.id)) })
  ] });
}
function UsersTab({ csrfToken }) {
  const qc = useQueryClient();
  const [q, setQ] = reactExports.useState("");
  const { data: users } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      const term = q.trim();
      if (term.length > 0) {
        const result = await adminSearchUsers({
          data: { query: term, csrf_token: csrfToken ?? "" }
        });
        return result.data ?? [];
      }
      const { data } = await supabase.from("profiles").select("id,nickname,display_name,is_blocked,is_private").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    }
  });
  async function toggleBlock(u) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminToggleUserBlock({
      data: { userId: u.id, isBlocked: !u.is_blocked, csrf_token: csrfToken }
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-extrabold", children: "Пользователи" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: "Поиск…",
        className: "mt-3 w-full rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: users?.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/u/$nickname", params: { nickname: u.nickname }, className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate font-bold", children: [
              "@",
              u.nickname,
              u.is_blocked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded bg-destructive/15 px-1.5 text-xs text-destructive", children: "блок" })
            ] }),
            u.display_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: u.display_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => toggleBlock(u),
              className: `rounded-xl border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-chunky-sm ${u.is_blocked ? "bg-background" : "bg-destructive text-destructive-foreground"}`,
              children: u.is_blocked ? "Разблок" : "Заблок"
            }
          )
        ]
      },
      u.id
    )) })
  ] });
}
function AdminProposalRow({
  proposal,
  onApprove,
  onReject,
  readonly
}) {
  const [showRejectModal, setShowRejectModal] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProposalImage, { imageUrl: proposal.image_url, alt: proposal.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold", children: [
          proposal.name,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
            "от @",
            proposal.profiles?.nickname ?? "—"
          ] })
        ] }),
        proposal.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: proposal.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          new Date(proposal.created_at).toLocaleString("ru-RU"),
          " · статус: ",
          proposal.status
        ] })
      ] }),
      !readonly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onApprove,
            className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm",
            children: "Принять"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowRejectModal(true),
            className: "rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm",
            children: "Отклонить"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NoteModal,
      {
        open: showRejectModal,
        title: "Комментарий автору",
        placeholder: "Необязательный комментарий…",
        onConfirm: (note) => {
          onReject?.(note);
          setShowRejectModal(false);
        },
        onCancel: () => setShowRejectModal(false)
      }
    )
  ] });
}
function ReactionTile({ reaction }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 rounded-2xl border-2 border-ink bg-card p-3 text-center shadow-chunky-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProposalImage, { imageUrl: reaction.image_url, alt: reaction.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "w-full truncate text-sm font-bold", children: reaction.name })
  ] });
}
function ProposalImage({ imageUrl, alt }) {
  const [url, setUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    getSignedUrl("reaction-proposals", imageUrl).then(setUrl).catch(() => setUrl(null));
  }, [imageUrl]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-ink bg-muted", children: url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt, className: "h-full w-full object-contain" }) : "…" });
}
const Route$2 = createFileRoute("/_authenticated/u/$nickname")({
  head: () => ({ meta: [{ title: "Профиль — Треп" }] }),
  component: UserProfilePage,
  errorComponent: ({ error }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center", children: [
    "Ошибка: ",
    error.message
  ] }),
  notFoundComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center", children: "Пользователь не найден" })
});
function UserProfilePage() {
  const { nickname } = Route$2.useParams();
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-by-nick", nickname],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("nickname", nickname).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    }
  });
  const { data: stats } = useQuery({
    queryKey: ["profile-stats", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const [{ count: followers }, { count: followingCount }, { count: posts2 }] = await Promise.all(
        [
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", profile.id),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", profile.id)
        ]
      );
      return { followers: followers ?? 0, following: followingCount ?? 0, posts: posts2 ?? 0 };
    }
  });
  const { data: amFollowing } = useQuery({
    queryKey: ["am-following", profile?.id, user?.id],
    enabled: !!profile && !!user && profile.id !== user.id,
    queryFn: async () => {
      const { data } = await supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("followee_id", profile.id).maybeSingle();
      return !!data;
    }
  });
  const { data: posts } = useQuery({
    queryKey: ["user-posts", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(
        "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)"
      ).eq("author_id", profile.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
  async function toggleFollow() {
    if (!user || !profile) return;
    if (amFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("followee_id", profile.id);
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, followee_id: profile.id });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    qc.invalidateQueries({ queryKey: ["am-following", profile.id, user.id] });
    qc.invalidateQueries({ queryKey: ["profile-stats", profile.id] });
    qc.invalidateQueries({ queryKey: ["following-ids", user.id] });
  }
  async function adminToggleBlock() {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({ is_blocked: !profile.is_blocked }).eq("id", profile.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(profile.is_blocked ? "Разблокирован" : "Заблокирован");
    qc.invalidateQueries({ queryKey: ["profile-by-nick", nickname] });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-muted-foreground", children: "Загружаем…" });
  if (!profile) return null;
  const isSelf = user?.id === profile.id;
  const isPrivate = profile.is_private && !isSelf && !isAdmin;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { path: profile.avatar_url, nickname: profile.nickname, size: 72 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-extrabold", children: profile.display_name ?? profile.nickname }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "@",
            profile.nickname,
            profile.is_blocked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded-md bg-destructive/15 px-1.5 text-xs text-destructive", children: "заблокирован" })
          ] }),
          profile.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm", children: profile.bio }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: stats?.posts ?? 0 }),
              " трепов"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: stats?.followers ?? 0 }),
              " подписчиков"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: stats?.following ?? 0 }),
              " подписан"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: isSelf ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/profile",
          className: "rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm",
          children: "Редактировать"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: toggleFollow,
            className: `rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold shadow-chunky-sm ${amFollowing ? "bg-background" : "bg-primary text-primary-foreground"}`,
            children: amFollowing ? "Отписаться" : "Подписаться"
          }
        ),
        profile.allow_dms && !profile.is_blocked && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/messages/$nickname",
            params: { nickname: profile.nickname },
            className: "rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm",
            children: "💌 Написать"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportButton, { targetType: "user", targetId: profile.id }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: adminToggleBlock,
            className: "rounded-xl border-2 border-ink bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground shadow-chunky-sm",
            children: profile.is_blocked ? "Разблокировать" : "Заблокировать"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-3", children: isPrivate ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground", children: "🔒 Это приватный профиль" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      (posts?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground", children: "Пока нет трепов." }),
      posts?.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post: p }, p.id))
    ] }) })
  ] });
}
const Route$1 = createFileRoute("/_authenticated/post/$id")({
  head: () => ({ meta: [{ title: "Треп — Треп" }] }),
  component: PostPage,
  errorComponent: ({ error }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center", children: [
    "Ошибка: ",
    error.message
  ] }),
  notFoundComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center", children: "Треп не найден" })
});
function PostPage() {
  const { id } = Route$1.useParams();
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = reactExports.useState("");
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(
        "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)"
      ).eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    }
  });
  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("*, profiles!comments_author_profile_fkey(nickname,display_name,avatar_url)").eq("post_id", id).order("created_at", { ascending: true });
      return data ?? [];
    }
  });
  async function submitComment() {
    const text = comment.trim();
    if (!text || !user) return;
    const { error } = await supabase.from("comments").insert({ post_id: id, author_id: user.id, content: text });
    if (error) {
      toast.error(error.message);
      return;
    }
    setComment("");
    qc.invalidateQueries({ queryKey: ["comments", id] });
    qc.invalidateQueries({ queryKey: ["post", id] });
  }
  async function deleteComment(cid) {
    if (!confirm("Удалить комментарий?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", cid);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["comments", id] });
  }
  async function hideComment(cid) {
    const { error } = await supabase.from("comments").update({ is_hidden: true }).eq("id", cid);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["comments", id] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/feed", className: "text-sm font-bold text-muted-foreground hover:text-primary", children: "← К ленте" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Загружаем…" }),
      post && /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post, showComments: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-extrabold", children: "Комментарии" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: comment,
            onChange: (e) => setComment(e.target.value.slice(0, 500)),
            placeholder: "Лучший комментарий...",
            className: "flex-1 rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary",
            onKeyDown: (e) => {
              if (e.key === "Enter") submitComment();
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: submitComment,
            className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm",
            children: "Отправить"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        comments?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Тут никого. Будь первым." }),
        comments?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex gap-3 rounded-2xl border-2 border-ink bg-background p-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$nickname", params: { nickname: c.profiles?.nickname ?? "" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { path: c.profiles?.avatar_url, nickname: c.profiles?.nickname, size: 32 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Link,
                    {
                      to: "/u/$nickname",
                      params: { nickname: c.profiles?.nickname ?? "" },
                      className: "font-bold hover:underline",
                      children: [
                        "@",
                        c.profiles?.nickname
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: new Date(c.created_at).toLocaleString("ru-RU") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm", children: c.is_hidden ? /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-muted-foreground", children: "[скрыт модератором]" }) : c.content }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex gap-3", children: [
                  (user?.id === c.author_id || isAdmin) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => deleteComment(c.id),
                      className: "text-xs font-bold text-muted-foreground hover:text-destructive",
                      children: "Удалить"
                    }
                  ),
                  isAdmin && !c.is_hidden && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => hideComment(c.id),
                      className: "text-xs font-bold text-muted-foreground hover:text-destructive",
                      children: "Скрыть"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ReportButton, { targetType: "comment", targetId: c.id, label: "" })
                ] })
              ] })
            ]
          },
          c.id
        ))
      ] })
    ] })
  ] });
}
const Route = createFileRoute("/_authenticated/messages/$nickname")({
  head: () => ({ meta: [{ title: "Чат — Треп" }] }),
  component: ChatPage
});
function ChatPage() {
  const { nickname } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = reactExports.useState("");
  const bottomRef = reactExports.useRef(null);
  const [sending, setSending] = reactExports.useState(false);
  const [pendingFiles, setPendingFiles] = reactExports.useState([]);
  const { data: other } = useQuery({
    queryKey: ["chat-other", nickname],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("nickname", nickname).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    }
  });
  const { data: messages } = useQuery({
    queryKey: ["chat", user?.id, other?.id],
    enabled: !!user && !!other,
    refetchInterval: 4e3,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${other.id}),and(sender_id.eq.${other.id},recipient_id.eq.${user.id})`
      ).order("created_at", { ascending: true }).limit(200);
      if (error) throw error;
      const unread = (data ?? []).filter((m) => m.recipient_id === user.id && !m.read_at).map((m) => m.id);
      if (unread.length > 0) {
        await supabase.from("messages").update({ read_at: (/* @__PURE__ */ new Date()).toISOString() }).in("id", unread);
        qc.invalidateQueries({ queryKey: ["conversations", user.id] });
      }
      const msgIds = (data ?? []).map((m) => m.id);
      const attachmentsMap = /* @__PURE__ */ new Map();
      if (msgIds.length > 0) {
        const { data: atts } = await supabase.from("message_attachments").select("*").in("message_id", msgIds).order("created_at", { ascending: true });
        for (const a of atts ?? []) {
          const list = attachmentsMap.get(a.message_id) ?? [];
          list.push(a);
          attachmentsMap.set(a.message_id, list);
        }
      }
      return (data ?? []).map((m) => ({
        ...m,
        attachments: attachmentsMap.get(m.id) ?? []
      }));
    }
  });
  reactExports.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);
  async function send() {
    const body = text.trim();
    if (!body && pendingFiles.length === 0 || !user || !other) return;
    setSending(true);
    const { data: newMsg, error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: other.id,
      content: body || ""
    }).select("id").single();
    if (error || !newMsg) {
      toast.error(
        error?.message.includes("row-level") ? "Получатель не принимает сообщения" : error?.message ?? "Ошибка отправки"
      );
      setSending(false);
      return;
    }
    for (const file of pendingFiles) {
      const result = await uploadFile(file, user.id);
      if (result.error) {
        toast.error(`Ошибка загрузки ${file.name}: ${result.error}`);
        continue;
      }
      const { error: attErr } = await supabase.from("message_attachments").insert({
        message_id: newMsg.id,
        file_path: result.path,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size: file.size
      });
      if (attErr) {
        toast.error(`Ошибка сохранения вложения: ${attErr.message}`);
      }
    }
    setText("");
    setPendingFiles([]);
    setSending(false);
    qc.invalidateQueries({ queryKey: ["chat", user.id, other.id] });
  }
  if (!other) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-muted-foreground", children: "Загружаем…" });
  const canDm = other.allow_dms && !other.is_blocked;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/messages", className: "text-sm font-bold text-muted-foreground hover:text-primary", children: "←" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/u/$nickname",
          params: { nickname: other.nickname },
          className: "flex items-center gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { path: other.avatar_url, nickname: other.nickname }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: other.display_name ?? other.nickname }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "@",
                other.nickname
              ] })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto rounded-3xl border-2 border-ink bg-card p-3 shadow-chunky-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      messages?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-6 text-center text-sm text-muted-foreground", children: "Пока пусто. Ляпни ему что-нибудь." }),
      messages?.map((m) => {
        const mine = m.sender_id === user?.id;
        const hasAttachments = (m.attachments?.length ?? 0) > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[85%] space-y-2`, children: [
          m.content && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-2xl border-2 border-ink px-3 py-2 text-sm shadow-chunky-sm ${mine ? "bg-primary text-primary-foreground" : "bg-background"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: m.content }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "p",
                  {
                    className: `mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`,
                    children: [
                      new Date(m.created_at).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit"
                      }),
                      mine && m.read_at && " · прочитано"
                    ]
                  }
                )
              ]
            }
          ),
          hasAttachments && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: m.attachments.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FilePreview,
            {
              filePath: a.file_path,
              fileName: a.file_name,
              fileType: a.file_type,
              fileSize: a.file_size
            },
            a.id
          )) }),
          !m.content && hasAttachments && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: `text-[10px] ${mine ? "text-right text-primary-foreground/70" : "text-left text-muted-foreground"}`,
              children: [
                new Date(m.created_at).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit"
                }),
                mine && m.read_at && " · прочитано"
              ]
            }
          )
        ] }) }, m.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AttachmentUpload,
        {
          onFilesSelected: (files) => setPendingFiles((prev) => [...prev, ...files]),
          onError: (err) => toast.error(err),
          disabled: !canDm
        }
      ),
      pendingFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-ink bg-accent px-2 py-1 text-xs font-bold text-accent-foreground shadow-chunky-sm", children: [
        "📎 ",
        pendingFiles.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: text,
          onChange: (e) => setText(e.target.value.slice(0, 2e3)),
          placeholder: canDm ? "Сообщение…" : "Этот пользователь не принимает ЛС",
          disabled: !canDm || sending,
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          },
          className: "flex-1 rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: send,
          disabled: !canDm || sending || text.trim().length === 0 && pendingFiles.length === 0,
          className: "rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm disabled:opacity-50",
          children: sending ? "…" : "Отправить"
        }
      )
    ] })
  ] });
}
const AuthRoute = Route$b.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$c
});
const AuthenticatedRouteRoute = Route$a.update({
  id: "/_authenticated",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$9.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const AuthenticatedSearchRoute = Route$8.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProposeReactionRoute = Route$7.update({
  id: "/propose-reaction",
  path: "/propose-reaction",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProfileRoute = Route$6.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMessagesRoute = Route$5.update({
  id: "/messages",
  path: "/messages",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedFeedRoute = Route$4.update({
  id: "/feed",
  path: "/feed",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminRoute = Route$3.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedUNicknameRoute = Route$2.update({
  id: "/u/$nickname",
  path: "/u/$nickname",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedPostIdRoute = Route$1.update({
  id: "/post/$id",
  path: "/post/$id",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMessagesNicknameRoute = Route.update({
  id: "/$nickname",
  path: "/$nickname",
  getParentRoute: () => AuthenticatedMessagesRoute
});
const AuthenticatedMessagesRouteChildren = {
  AuthenticatedMessagesNicknameRoute
};
const AuthenticatedMessagesRouteWithChildren = AuthenticatedMessagesRoute._addFileChildren(
  AuthenticatedMessagesRouteChildren
);
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRoute,
  AuthenticatedFeedRoute,
  AuthenticatedMessagesRoute: AuthenticatedMessagesRouteWithChildren,
  AuthenticatedProfileRoute,
  AuthenticatedProposeReactionRoute,
  AuthenticatedSearchRoute,
  AuthenticatedPostIdRoute,
  AuthenticatedUNicknameRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
