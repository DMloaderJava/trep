import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    if (profile?.avatar_url) {
      getSignedUrl("avatars", profile.avatar_url).then(setAvatarUrl);
    } else setAvatarUrl(null);
  }, [profile?.avatar_url]);

  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/", replace: true });
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        Загружаем треп…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/feed" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm">
              🗯️
            </span>
            <span className="font-display text-xl font-extrabold">Треп</span>
          </Link>
          <nav className="hidden gap-4 text-sm font-bold md:flex">
            <Link
              to="/feed"
              className="hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              Лента
            </Link>
            <Link
              to="/search"
              className="hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              Поиск
            </Link>
            <Link
              to="/messages"
              className="hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              Сообщения
            </Link>
            <Link
              to="/propose-reaction"
              className="hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              Реакция
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                Админка
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border-2 border-ink bg-card px-2 py-1 pr-3 shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
            >
              <div className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-ink bg-accent text-xs font-bold">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (profile?.nickname?.[0] ?? "?").toUpperCase()
                )}
              </div>
              <span className="hidden text-sm font-bold sm:inline">
                @{profile?.nickname ?? "..."}
              </span>
              {isAdmin && (
                <span title="Админ" className="text-base">
                  👑
                </span>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-sm font-bold shadow-chunky-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
