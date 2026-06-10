import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

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

const treps = [
  {
    author: "котовед_77",
    time: "3 сек назад",
    text: "Сейчас понял, что холодильник работает круглосуточно без выходных. Где его профсоюз?",
    reactions: { "🤣": 482, "🧠": 91, "☕": 203, "🚑": 12, "🐟": 47 },
  },
  {
    author: "академик_дивана",
    time: "минуту назад",
    text: "Если кот сидит на ноутбуке, считается ли это облачным хранением?",
    reactions: { "🤣": 921, "🧠": 412, "☕": 88, "🚑": 4, "🐟": 156 },
  },
  {
    author: "забыл_зачем",
    time: "5 мин назад",
    text: "Я зашёл на кухню и забыл зачем. Теперь живу здесь. Уже знакомлюсь с микроволновкой.",
    reactions: { "🤣": 1247, "🧠": 88, "☕": 333, "🚑": 67, "🐟": 22 },
  },
];

const reactionLabels: Record<string, string> = {
  "🤣": "Уничтожило",
  "🧠": "Мозг сломался",
  "☕": "Нормальный треп",
  "🚑": "Срочно заберите автора",
  "🐟": "Рыба одобряет",
};

const levels = [
  { lvl: 1, name: "Новичок" },
  { lvl: 5, name: "Болтун" },
  { lvl: 10, name: "Эксперт по ерунде" },
  { lvl: 20, name: "Академик трепологии" },
  { lvl: 50, name: "Легенда диванных наук" },
  { lvl: 100, name: "Источник мирового трепа" },
];

function Index() {
  const [draft, setDraft] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fishMode, setFishMode] = useState(false);
  const fishCount = useRef(0);
  const lastKey = useRef("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "р" || k === "ы" || k === "б" || k === "а") {
        lastKey.current += k;
        if (lastKey.current.endsWith("рыба")) {
          fishCount.current += 1;
          if (fishCount.current >= 5) {
            setFishMode(true);
            setTimeout(() => setFishMode(false), 4000);
            fishCount.current = 0;
          }
          lastKey.current = "";
        }
        if (lastKey.current.length > 10) lastKey.current = lastKey.current.slice(-4);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b-2 border-ink bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-primary text-2xl shadow-chunky-sm">
              🗯️
            </span>
            <span className="font-display text-2xl font-extrabold">Треп</span>
          </div>
          <nav className="hidden gap-6 text-sm font-bold md:flex">
            <a href="#feed" className="hover:text-primary">
              Лента
            </a>
            <a href="#reactions" className="hover:text-primary">
              Реакции
            </a>
            <a href="#levels" className="hover:text-primary">
              Уровни
            </a>
            <a href="#premium" className="hover:text-primary">
              Треп+
            </a>
          </nav>
          <AuthButton />
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gradient-hero">
        <div className="absolute right-8 top-12 hidden text-6xl animate-swim md:block">🐟</div>
        <div className="absolute left-12 bottom-20 hidden text-5xl animate-wiggle md:block">☕</div>
        <div className="absolute right-1/4 bottom-10 hidden text-4xl animate-wiggle md:block">
          🧠
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <div className="mb-6 inline-block rounded-full border-2 border-ink bg-background px-4 py-1.5 text-xs font-bold shadow-chunky-sm">
            👑 Сегодня за интернет отвечает @случайный_васян
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[0.95] md:text-7xl">
            Напиши мысль,
            <br />о которой пожалеешь
            <br />
            <span className="inline-block -rotate-2 rounded-2xl bg-primary px-4 py-1 text-primary-foreground shadow-chunky">
              через 3 секунды
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Треп — социальная сеть для полной ерунды. Без алгоритмов, без смысла, без причины.
            Только вы, ваши странные мысли и <strong>847 соучастников</strong>.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="group mt-12 inline-flex items-center gap-3 rounded-3xl border-4 border-ink bg-gradient-button px-10 py-7 font-display text-2xl font-extrabold text-primary-foreground shadow-chunky animate-pulse-big hover:animate-none md:text-4xl"
          >
            <span className="text-3xl md:text-5xl">💭</span>
            ЛЯПНУТЬ ЧТО-НИБУДЬ
          </button>
          <p className="mt-4 text-sm text-muted-foreground">Нажми. Потом сразу пожалей.</p>
        </div>
      </section>

      {/* FEED */}
      <section id="feed" className="border-y-2 border-ink bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                Прямой эфир ерунды
              </p>
              <h2 className="mt-2 text-4xl font-extrabold md:text-5xl">Свежие трепы</h2>
            </div>
            <div className="rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm">
              🟢 Сейчас треплют 12 847 человек
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {treps.map((t, i) => (
              <article
                key={i}
                className="flex flex-col rounded-3xl border-2 border-ink bg-card p-6 shadow-chunky transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-accent text-lg font-bold">
                    {t.author[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">@{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.time} · 🐟 47 соучастников</p>
                  </div>
                </div>
                <p className="flex-1 text-lg leading-snug">{t.text}</p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {Object.entries(t.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      title={reactionLabels[emoji]}
                      className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-background px-3 py-1 text-sm font-bold shadow-chunky-sm transition-transform hover:-translate-y-0.5"
                    >
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* REACTIONS */}
      <section id="reactions" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Лайки — это скучно
            </p>
            <h2 className="mt-2 text-4xl font-extrabold md:text-5xl">Пять честных реакций</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Никакого «нравится». Только настоящие эмоции от прочитанного.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(reactionLabels).map(([emoji, label], i) => (
              <div
                key={emoji}
                className="group rounded-3xl border-2 border-ink bg-card p-6 text-center shadow-chunky-sm transition-all hover:-translate-y-1 hover:shadow-chunky"
                style={{ rotate: `${(i % 2 ? 1 : -1) * 1.5}deg` }}
              >
                <div className="text-6xl transition-transform group-hover:scale-110">{emoji}</div>
                <p className="mt-4 font-display font-extrabold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="border-y-2 border-ink bg-muted py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-4xl font-extrabold md:text-5xl">Не как у людей</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard emoji="👥" title="Не подписчики">
              У тебя не «подписчики», а <strong>Свидетели</strong>, <strong>Очевидцы</strong> и{" "}
              <strong>Соучастники</strong>. Звучит серьёзнее, чем есть.
            </FeatureCard>
            <FeatureCard emoji="💌" title="Закулисный треп">
              Личные сообщения, в которых вы шепчетесь о ерунде вдали от глаз Рыбного совета.
            </FeatureCard>
            <FeatureCard emoji="🤖" title="Трепобот-3000">
              <em>Анализирую…</em>
              <br />
              <em>Это настолько странно, что нарушений не обнаружено.</em>
            </FeatureCard>
            <FeatureCard emoji="🚷" title="Бан, но мягкий">
              «Вы были отправлены на принудительное размышление о своём поведении.» Это даже звучит
              полезно.
            </FeatureCard>
            <FeatureCard emoji="🐟" title="Рыбный совет">
              Тайный орган управления, который иногда одобряет. Иногда — нет. Никто не знает, по
              какому принципу.
            </FeatureCard>
            <FeatureCard emoji="👑" title="Главный Трепач Дня">
              Каждый день случайному пользователю присваивается титул. Сегодня <strong>он</strong>{" "}
              отвечает за интернет. Мы сами не знаем почему.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* LEVELS */}
      <section id="levels" className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
              Карьерная лестница
            </p>
            <h2 className="mt-2 text-4xl font-extrabold md:text-5xl">Путь трепача</h2>
          </div>
          <div className="mt-12 space-y-3">
            {levels.map((l, i) => (
              <div
                key={l.lvl}
                className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-card p-4 shadow-chunky-sm"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-ink bg-primary font-display text-xl font-extrabold text-primary-foreground">
                  {l.lvl}
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-extrabold">{l.name}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${Math.min(100, (i + 1) * 16)}%` }}
                    />
                  </div>
                </div>
                {l.lvl === 100 && <span className="text-3xl animate-wiggle">👑</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIUM */}
      <section id="premium" className="border-y-2 border-ink bg-gradient-hero py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border-4 border-ink bg-card p-8 shadow-chunky md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border-2 border-ink bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                PREMIUM
              </span>
              <span className="text-3xl animate-swim">🐟</span>
            </div>
            <h2 className="mt-4 text-4xl font-extrabold md:text-6xl">
              Треп<span className="text-primary">+</span>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Для тех, кто треплет профессионально.
            </p>

            <ul className="mt-8 space-y-4 text-lg">
              <PerkLine emoji="🐟">Золотая рыба возле ника</PerkLine>
              <PerkLine emoji="📜">Трепы длиной до 5000 символов</PerkLine>
              <PerkLine emoji="✨">Анимированный значок «Профессиональный болтун»</PerkLine>
            </ul>

            <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-5xl font-extrabold">
                  99 ₽<span className="text-xl text-muted-foreground">/мес</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Меньше, чем кофе. Полезнее ли — спорно.
                </p>
              </div>
              <button className="rounded-2xl border-2 border-ink bg-primary px-6 py-4 font-display font-extrabold text-primary-foreground shadow-chunky transition-transform hover:-translate-y-1">
                Стать болтуном
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-4xl font-extrabold md:text-6xl">Всё ещё читаешь?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Это знак. Иди и ляпни уже что-нибудь.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-10 inline-flex items-center gap-3 rounded-3xl border-4 border-ink bg-gradient-button px-8 py-5 font-display text-xl font-extrabold text-primary-foreground shadow-chunky"
          >
            💭 ЛЯПНУТЬ ЧТО-НИБУДЬ
          </button>
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-secondary py-8 text-center text-sm text-muted-foreground">
        <p>
          © Треп. Все мысли случайны, совпадения — тоже. Подсказка: попробуй напечатать «рыба» 5 раз
          подряд 🐟
        </p>
      </footer>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border-4 border-ink bg-card p-6 shadow-chunky"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-extrabold">Новый треп</h3>
              <button
                onClick={() => setShowModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-background font-bold"
              >
                ✕
              </button>
            </div>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 280))}
              placeholder="Что за чушь у тебя в голове прямо сейчас?"
              className="mt-4 h-40 w-full resize-none rounded-2xl border-2 border-ink bg-background p-4 text-lg outline-none focus:ring-4 focus:ring-primary/30"
            />
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>🤖 Трепобот-3000 уже ничего не ждёт</span>
              <span>{draft.length}/280</span>
            </div>
            <button
              onClick={() => {
                setShowModal(false);
                setDraft("");
              }}
              className="mt-4 w-full rounded-2xl border-2 border-ink bg-gradient-button py-4 font-display text-lg font-extrabold text-primary-foreground shadow-chunky-sm"
            >
              Опубликовать и пожалеть
            </button>
          </div>
        </div>
      )}

      {/* FISH EASTER EGG */}
      {fishMode && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center bg-fish/80 text-center">
          <div className="text-[200px] animate-wiggle">🐟</div>
          <p className="font-display text-3xl font-extrabold text-primary-foreground md:text-5xl">
            Рыбный совет доволен вами.
          </p>
        </div>
      )}
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
      className="rounded-xl border-2 border-ink bg-accent px-4 py-2 text-sm font-bold shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
    >
      Войти
    </Link>
  );
}

function FeatureCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-ink bg-card p-6 shadow-chunky-sm transition-transform hover:-translate-y-1">
      <div className="text-4xl">{emoji}</div>
      <h3 className="mt-3 font-display text-xl font-extrabold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </div>
  );
}

function PerkLine({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-accent text-xl">
        {emoji}
      </span>
      <span className="pt-1.5">{children}</span>
    </li>
  );
}
