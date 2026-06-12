import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getPublicFeed } from "@/lib/public-feed.functions";
import { runServerDiagnostics, type DiagCheck } from "@/lib/diagnostics.functions";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Диагностика — Треп" },
      { name: "description", content: "Быстрые проверки серверных функций и RLS" },
    ],
  }),
  component: DiagnosticsPage,
});

type Status = "idle" | "running" | "ok" | "fail";
type Result = { status: Status; detail: string };

const CHECKS = [
  "public-feed",
  "posts-read",
  "attachments-read",
  "reactions-read",
  "reaction-write",
  "smart-feed",
  "profile",
  "messages",
  "storage",
] as const;
type CheckId = (typeof CHECKS)[number];

const LABELS: Record<CheckId, string> = {
  "public-feed": "Публичная лента (серверная функция)",
  "posts-read": "Чтение постов (RLS)",
  "attachments-read": "Вложения постов (post_attachments)",
  "reactions-read": "Чтение реакций",
  "reaction-write": "Реакция: поставить и убрать (нужен вход)",
  "smart-feed": "Умная лента smart_feed (нужен вход)",
  profile: "Мой профиль (нужен вход)",
  messages: "Сообщения: доступ (нужен вход)",
  storage: "Хранилище chat-files (нужен вход)",
};

function DiagnosticsPage() {
  const { user, session } = useAuth();
  const fetchPublicFeed = useServerFn(getPublicFeed);
  const fetchServerDiag = useServerFn(runServerDiagnostics);

  const [results, setResults] = useState<Partial<Record<CheckId, Result>>>({});
  const [serverChecks, setServerChecks] = useState<DiagCheck[] | null>(null);
  const [serverRunning, setServerRunning] = useState(false);
  const [runningAll, setRunningAll] = useState(false);

  function set(id: CheckId, status: Status, detail = "") {
    setResults((prev) => ({ ...prev, [id]: { status, detail } }));
  }

  async function runCheck(id: CheckId) {
    set(id, "running");
    try {
      switch (id) {
        case "public-feed": {
          const items = await fetchPublicFeed();
          set(id, "ok", `получено постов: ${items.length}`);
          break;
        }
        case "posts-read": {
          const { count, error } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true });
          if (error) throw error;
          set(id, "ok", `видно постов: ${count ?? 0}`);
          break;
        }
        case "attachments-read": {
          const { error } = await (supabase.from as (t: string) => ReturnType<typeof supabase.from>)("post_attachments")
            .select("id")
            .limit(1);
          if (error) throw error;
          set(id, "ok", "таблица доступна");
          break;
        }
        case "reactions-read": {
          const { count, error } = await supabase
            .from("post_reactions")
            .select("*", { count: "exact", head: true });
          if (error) throw error;
          set(id, "ok", `видно реакций: ${count ?? 0}`);
          break;
        }
        case "reaction-write": {
          if (!user) {
            set(id, "fail", "нужно войти");
            break;
          }
          const { data: post, error: postErr } = await supabase
            .from("posts")
            .select("id")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (postErr) throw postErr;
          if (!post) {
            set(id, "fail", "нет постов для проверки");
            break;
          }
          const { data: inserted, error: insErr } = await supabase
            .from("post_reactions")
            .insert({ post_id: post.id, user_id: user.id, reaction: "🐟" })
            .select("id")
            .maybeSingle();
          if (insErr) {
            if (insErr.code === "23505") {
              set(id, "ok", "уже есть реакция на пост (1 реакция на пост — ок)");
            } else {
              throw insErr;
            }
            break;
          }
          if (inserted) {
            await supabase.from("post_reactions").delete().eq("id", inserted.id);
          }
          set(id, "ok", "вставка и удаление реакции работают");
          break;
        }
        case "smart-feed": {
          if (!session) {
            set(id, "fail", "нужно войти");
            break;
          }
          const { data, error } = await (supabase.rpc as (n: string, a: Record<string, unknown>) => ReturnType<typeof supabase.rpc>)(
            "smart_feed",
            { _mode: "smart", _limit: 5 },
          );
          if (error) throw error;
          set(id, "ok", `RPC вернул ${(data as unknown[] | null)?.length ?? 0} постов`);
          break;
        }
        case "profile": {
          if (!user) {
            set(id, "fail", "нужно войти");
            break;
          }
          const { data, error } = await supabase
            .from("profiles")
            .select("nickname")
            .eq("id", user.id)
            .maybeSingle();
          if (error) throw error;
          if (!data) {
            set(id, "fail", "профиль не найден — проблема с регистрацией");
            break;
          }
          set(id, "ok", `@${data.nickname}`);
          break;
        }
        case "messages": {
          if (!user) {
            set(id, "fail", "нужно войти");
            break;
          }
          const { error } = await supabase.from("messages").select("id").limit(1);
          if (error) throw error;
          set(id, "ok", "доступ к сообщениям есть");
          break;
        }
        case "storage": {
          if (!user) {
            set(id, "fail", "нужно войти");
            break;
          }
          const { error } = await supabase.storage.from("chat-files").list(user.id, { limit: 1 });
          if (error) throw error;
          set(id, "ok", "бакет chat-files доступен");
          break;
        }
      }
    } catch (e) {
      set(id, "fail", e instanceof Error ? e.message : String(e));
    }
  }

  async function runServer() {
    setServerRunning(true);
    try {
      setServerChecks(await fetchServerDiag());
    } catch (e) {
      setServerChecks([
        { name: "Серверная диагностика", ok: false, detail: e instanceof Error ? e.message : String(e) },
      ]);
    } finally {
      setServerRunning(false);
    }
  }

  async function runAll() {
    setRunningAll(true);
    for (const id of CHECKS) {
      await runCheck(id);
    }
    await runServer();
    setRunningAll(false);
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">🩺 Диагностика</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Быстрые проверки серверных функций, базы и RLS.{" "}
        {session ? "Вы вошли — доступны все проверки." : "Без входа доступны только публичные проверки."}
      </p>

      <button
        onClick={runAll}
        disabled={runningAll}
        className="mt-4 rounded-2xl border-2 border-ink bg-gradient-button px-5 py-3 font-display font-extrabold text-primary-foreground shadow-chunky-sm disabled:opacity-60"
      >
        {runningAll ? "Проверяем…" : "▶ Запустить все проверки"}
      </button>

      <div className="mt-6 space-y-2">
        {CHECKS.map((id) => {
          const r = results[id];
          return (
            <div
              key={id}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm"
            >
              <div className="min-w-0">
                <p className="font-bold">
                  <StatusIcon status={r?.status ?? "idle"} /> {LABELS[id]}
                </p>
                {r?.detail && (
                  <p className={`mt-0.5 text-xs ${r.status === "fail" ? "text-destructive" : "text-muted-foreground"}`}>
                    {r.detail}
                  </p>
                )}
              </div>
              <button
                onClick={() => runCheck(id)}
                disabled={r?.status === "running" || runningAll}
                className="shrink-0 rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-xs font-bold shadow-chunky-sm disabled:opacity-50"
              >
                Проверить
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Серверные проверки (БД, функции, бакеты)</h2>
        <button
          onClick={runServer}
          disabled={serverRunning || runningAll}
          className="rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-xs font-bold shadow-chunky-sm disabled:opacity-50"
        >
          {serverRunning ? "…" : "Проверить"}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {serverChecks === null && !serverRunning && (
          <p className="text-sm text-muted-foreground">Нажмите «Проверить», чтобы запустить серверную диагностику.</p>
        )}
        {serverChecks?.map((c) => (
          <div
            key={c.name}
            className="rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm"
          >
            <p className="font-bold">
              {c.ok ? "✅" : "❌"} {c.name}
            </p>
            <p className={`mt-0.5 text-xs ${c.ok ? "text-muted-foreground" : "text-destructive"}`}>
              {c.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "ok") return <span>✅</span>;
  if (status === "fail") return <span>❌</span>;
  if (status === "running") return <span>⏳</span>;
  return <span>▫️</span>;
}
