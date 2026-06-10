import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/avatar";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Поиск — Треп" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["search-users", q],
    enabled: q.trim().length >= 1,
    queryFn: async () => {
      const term = q.trim().replace(/[%_]/g, "");
      const { data } = await supabase
        .from("profiles")
        .select("id,nickname,display_name,avatar_url,bio,is_private")
        .or(`nickname.ilike.%${term}%,display_name.ilike.%${term}%`)
        .limit(30);
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Поиск трепачей</h1>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Никнейм или имя…"
        className="mt-4 w-full rounded-xl border-2 border-ink bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="mt-4 space-y-2">
        {q.trim().length === 0 && <p className="text-muted-foreground">Начни вводить никнейм.</p>}
        {isFetching && <p className="text-muted-foreground">Ищем…</p>}
        {data?.length === 0 && q.trim().length > 0 && !isFetching && (
          <p className="text-muted-foreground">Никого не нашли.</p>
        )}
        {data?.map((u) => (
          <Link
            key={u.id}
            to="/u/$nickname"
            params={{ nickname: u.nickname }}
            className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
          >
            <Avatar path={u.avatar_url} nickname={u.nickname} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">
                {u.display_name ?? u.nickname} {u.is_private && <span className="text-xs">🔒</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">@{u.nickname}</p>
              {u.bio && <p className="truncate text-sm text-muted-foreground">{u.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
