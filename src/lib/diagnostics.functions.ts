/**
 * Серверные диагностические проверки: таблицы, функции БД, бакеты, триггер регистрации.
 * Только чтение, без PII.
 */
import { createServerFn } from "@tanstack/react-start";

export type DiagCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

export const runServerDiagnostics = createServerFn({ method: "GET" }).handler(
  async (): Promise<DiagCheck[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const checks: DiagCheck[] = [];

    // 1. Tables reachable
    for (const table of [
      "posts",
      "post_reactions",
      "post_attachments",
      "comments",
      "messages",
      "message_attachments",
      "profiles",
      "ip_rate_limits",
    ]) {
      const { count, error } = await (supabaseAdmin.from as (t: string) => ReturnType<typeof supabaseAdmin.from>)(table)
        .select("*", { count: "exact", head: true });
      checks.push({
        name: `Таблица ${table}`,
        ok: !error,
        detail: error ? error.message : `доступна (${count ?? 0} строк)`,
      });
    }

    // 2. Rate-limit RPC
    {
      const { data, error } = await (supabaseAdmin.rpc as (n: string, a: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)(
        "check_ip_rate_limit",
        { _ip_address: "diagnostics", _endpoint: "diag", _max_count: 100, _window_seconds: 60 },
      );
      checks.push({
        name: "Функция лимита запросов (регистрация/вход)",
        ok: !error && data !== null,
        detail: error ? error.message : "работает",
      });
    }

    // 3. smart_feed RPC exists (called without auth returns empty set)
    {
      const { error } = await (supabaseAdmin.rpc as (n: string, a: Record<string, unknown>) => ReturnType<typeof supabaseAdmin.rpc>)(
        "smart_feed",
        { _mode: "fresh", _limit: 1 },
      );
      checks.push({
        name: "Алгоритм ленты (smart_feed)",
        ok: !error,
        detail: error ? error.message : "функция на месте",
      });
    }

    // 4. Storage buckets
    {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      const names = (data ?? []).map((b) => b.name);
      const missing = ["avatars", "reaction-proposals", "chat-files"].filter(
        (b) => !names.includes(b),
      );
      checks.push({
        name: "Бакеты хранилища",
        ok: !error && missing.length === 0,
        detail: error
          ? error.message
          : missing.length
            ? `отсутствуют: ${missing.join(", ")}`
            : `все на месте (${names.join(", ")})`,
      });
    }

    // 5. Registration trigger sanity: every user has a profile
    {
      const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const { count: profileCount, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const userCount = usersData?.users?.length ?? 0;
      const ok = !uErr && !pErr && (profileCount ?? 0) >= userCount;
      checks.push({
        name: "Регистрация (профиль создаётся для каждого пользователя)",
        ok,
        detail:
          uErr?.message ??
          pErr?.message ??
          `пользователей: ${userCount}, профилей: ${profileCount ?? 0}`,
      });
    }

    return checks;
  },
);
