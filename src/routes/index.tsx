import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PostCard, type PostRow } from "@/components/post-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Треп — соцсеть для полной ерунды" },
      {
        name: "description",
        content:
          "Напиши мысль, о которой пожалеешь через 3 секунды. Треп — социальная сеть, где живут самые странные мысли интернета.",
      },
      { property: "og:title", content: "Треп — соцсеть для полной ерунды" },
      { property: "og:description", content: "Напиши мысль, о которой пожалеешь через 3 секунды." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)",
        )
        .is("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as PostRow[];
    },
  });

  // For guests – nav links go to /auth, for logged-in users – real pages
  const nav = (label: string, guestTo: string, authTo: string) => {
    const to = user ? authTo : guestTo;
    const params = to === "/auth" ? {} : {};
    return (
      <Link
        to={to as "/auth" | "/feed" | "/search" | "/messages" | "/propose-reaction"}
        params={params}
        className="hover:text-primary"
        activeProps={{ className: "text-primary" }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to={user ? "/feed" : "/"} className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm">
              🗯️
            </span>
            <span className="font-display text-2xl font-extrabold">Треп</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-bold md:flex">
            {nav("Лента", "/", "/feed")}
            {nav("Поиск", "/auth", "/search")}
            {nav("Сообщения", "/auth", "/messages")}
            {nav("Реакция", "/auth", "/propose-reaction")}
          </nav>
          <AuthButton />
        </div>
      </header>

      {/* Optional register CTA for guests */}
      {!user && !loading && (
        <div className="mx-auto max-w-2xl px-4 pb-6">
          <div className="rounded-3xl border-2 border-dashed border-primary/40 bg-card p-6 text-center shadow-chunky-sm">
            <p className="font-display text-lg font-extrabold">
              🔥 Хочешь ставить реакции, писать трепы и комментировать?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Зарегистрируйся за минуту и присоединяйся к сообществу.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                to="/auth"
                className="rounded-xl border-2 border-ink bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-chunky-sm transition hover:-translate-y-0.5"
              >
                Зарегистрироваться
              </Link>
              <Link
                to="/auth"
                className="rounded-xl border-2 border-ink bg-accent px-6 py-2.5 font-bold shadow-chunky-sm transition hover:-translate-y-0.5"
              >
                Войти
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-muted-foreground">
            Свежие трепы — читай и угарай
          </span>
        </div>

        <div className="space-y-3">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && (posts?.length ?? 0) === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              Пока никто ничего не ляпнул. Будь первым —{' '}
              <Link to="/auth" className="font-bold text-primary underline">
                зарегистрируйся
              </Link>
              !
            </div>
          )}
          {posts?.map((p) => (
            <PostCard key={p.id} post={p} readOnly />
          ))}
        </div>
      </div>

      <footer className="border-t-2 border-ink bg-secondary py-8 text-center text-sm text-muted-foreground">
        <p>
          © Треп. Все мысли случайны, совпадения — тоже. Подсказка: попробуй напечатать «рыба» 5 раз
          подряд 🐟
        </p>
      </footer>
    </div>
  );
}

function AuthButton() {
  const { session, loading } = useAuth();
  if (loading) return <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />;
  if (session) {
    return (
      <Link
        to="/feed"
        className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
      >
        В приложение
      </Link>
    );
  }
  return (
    <Link
      to="/auth"
      className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
    >
      Войти
    </Link>
  );
}