import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/feed", label: "🗯️ Лента" },
  { to: "/messages", label: "💬 Сообщения" },
  { to: "/search", label: "🔎 Поиск" },
  { to: "/propose-reaction", label: "➕ Предложить реакцию" },
  { to: "/profile", label: "👤 Профиль" },
  { to: "/diagnostics", label: "🩺 Диагностика" },
] as const;

export function SiteHeader() {
  const { session } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1.5 px-3 py-2">
        <Link to="/" className="mr-2 flex items-center gap-1.5 font-display text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-primary text-lg shadow-chunky-sm">
            🗯️
          </span>
          Треп
        </Link>
        <nav className="flex flex-wrap items-center gap-1.5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-xl border-2 border-ink px-2.5 py-1 text-xs font-bold shadow-chunky-sm transition-transform hover:-translate-y-0.5 ${
                pathname.startsWith(item.to)
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {!session && (
            <Link
              to="/auth"
              className="rounded-xl border-2 border-ink bg-gradient-button px-2.5 py-1 text-xs font-extrabold text-primary-foreground shadow-chunky-sm"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
