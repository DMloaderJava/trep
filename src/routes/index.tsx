import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { getPublicFeed, type PublicFeedItem } from "@/lib/public-feed.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Треп — соцсеть для полной ерунды" },
      {
        name: "description",
        content:
          "Напиши мысль, о которой пожалеешь через 3 секунды. Треп — соцсеть для полной ерунды.",
      },
      { property: "og:title", content: "Треп — соцсеть для полной ерунды" },
      { property: "og:description", content: "Соцсеть для полной ерунды." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Manrope:wght@400;500;700&display=swap",
      },
    ],
  }),
  component: Index,
});

const REACTION_EMOJI: Record<string, string> = {
  laugh: "🤣",
  brain: "🧠",
  coffee: "☕",
  ambulance: "🚑",
  fish: "🐟",
};

function Index() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // Auto-redirect signed-in users straight to feed
  useEffect(() => {
    if (!loading && session) {
      router.navigate({ to: "/feed", replace: true });
    }
  }, [loading, session, router]);

  const fetchFeed = useServerFn(getPublicFeed);
  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-feed"],
    queryFn: () => fetchFeed(),
    staleTime: 30_000,
  });

  function needLogin() {
    toast.info("Чтобы ляпнуть или отреагировать — войди.", {
      action: { label: "Войти", onClick: () => router.navigate({ to: "/auth" }) },
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm">
              🗯️
            </span>
            <span className="font-display text-2xl font-extrabold">Треп</span>
          </div>
          <Link
            to="/auth"
            className="rounded-xl border-2 border-ink bg-accent px-4 py-2 text-sm font-bold shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
          >
            Войти
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gradient-hero">
        <div className="absolute right-8 top-12 hidden text-6xl animate-swim md:block">🐟</div>
        <div className="mx-auto max-w-4xl px-4 py-14 text-center md:py-20">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Напиши мысль,
            <br />о которой пожалеешь
            <br />
            <span className="inline-block -rotate-2 rounded-2xl bg-primary px-4 py-1 text-primary-foreground shadow-chunky">
              через 3 секунды
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Соцсеть для полной ерунды. Листай ленту ниже — а чтобы реагировать или ляпнуть своё,
            нужно войти.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-2xl border-4 border-ink bg-gradient-button px-6 py-4 font-display text-lg font-extrabold text-primary-foreground shadow-chunky"
            >
              💭 Войти и ляпнуть
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="border-y-2 border-ink bg-secondary py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-wider text-primary">
                Прямой эфир ерунды
              </p>
              <h2 className="mt-1 text-3xl font-extrabold md:text-4xl">Свежие трепы</h2>
            </div>
            <span className="rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-xs font-bold shadow-chunky-sm">
              👀 только просмотр
            </span>
          </div>

          {isLoading && (
            <p className="text-center text-muted-foreground">Загружаем свежий треп…</p>
          )}
          {!isLoading && (posts?.length ?? 0) === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              Пока в ленте пусто. Будь первым — войди и ляпни!
            </div>
          )}

          <div className="space-y-4">
            {posts?.map((p) => <ReadOnlyPost key={p.id} post={p} onInteract={needLogin} />)}
          </div>

          {(posts?.length ?? 0) > 0 && (
            <div className="mt-8 text-center">
              <Link
                to="/auth"
                className="inline-block rounded-xl border-2 border-ink bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-chunky-sm"
              >
                Войти, чтобы увидеть всю ленту
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-background py-8 text-center text-sm text-muted-foreground">
        <p>© Треп. Все мысли случайны, совпадения — тоже.</p>
      </footer>
    </div>
  );
}

function ReadOnlyPost({
  post,
  onInteract,
}: {
  post: PublicFeedItem;
  onInteract: () => void;
}) {
  const display = post.author_display ?? post.author_nickname;
  return (
    <article className="rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm">
      <header className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-accent text-sm font-bold">
          {(post.author_nickname[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold">{display}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{post.author_nickname} · {new Date(post.created_at).toLocaleString("ru-RU")}
          </p>
        </div>
      </header>
      {post.content && (
        <p className="mt-3 whitespace-pre-wrap text-base leading-snug">{post.content}</p>
      )}
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(post.reactions).map(([code, count]) => (
            <button
              key={code}
              onClick={onInteract}
              className="flex items-center gap-1 rounded-full border-2 border-ink bg-background px-2.5 py-1 text-sm font-bold shadow-chunky-sm"
              title="Войди, чтобы реагировать"
            >
              <span>{REACTION_EMOJI[code] ?? "⭐"}</span>
              <span>{count}</span>
            </button>
          ))}
          <button
            onClick={onInteract}
            className="rounded-full border-2 border-dashed border-ink bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground"
          >
            + реакция
          </button>
        </div>
        <button
          onClick={onInteract}
          className="text-sm font-bold text-muted-foreground hover:text-primary"
        >
          💬 {post.comments_count}
        </button>
      </footer>
    </article>
  );
}
