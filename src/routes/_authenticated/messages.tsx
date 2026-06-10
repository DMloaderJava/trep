import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/avatar";

type ChatMessage = {
  id: string;
  content: string | null;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  recipient_id: string;
};

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [{ title: "Сообщения — Треп" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,content,created_at,read_at,sender_id,recipient_id")
        .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      // group by other participant
      const map = new Map<string, { other: string; last: ChatMessage; unread: number }>();
      for (const m of data ?? []) {
        const other = m.sender_id === user!.id ? m.recipient_id : m.sender_id;
        if (!map.has(other)) map.set(other, { other, last: m, unread: 0 });
        const entry = map.get(other)!;
        if (m.recipient_id === user!.id && !m.read_at) entry.unread += 1;
      }
      const others = Array.from(map.values());
      if (others.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,nickname,display_name,avatar_url")
        .in(
          "id",
          others.map((o) => o.other),
        );
      return others.map((o) => ({
        ...o,
        profile: profiles?.find((p) => p.id === o.other),
      }));
    },
  });

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">💌 Сообщения</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Личные диалоги. Видны только тебе и собеседнику.
      </p>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="text-muted-foreground">Загружаем…</p>}
        {!isLoading && (conversations?.length ?? 0) === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            Пока никто не пишет. Найди кого-нибудь через{" "}
            <Link to="/search" className="font-bold text-primary">
              поиск
            </Link>
            .
          </div>
        )}
        {conversations?.map((c) => (
          <Link
            key={c.other}
            to="/messages/$nickname"
            params={{ nickname: c.profile?.nickname ?? "" }}
            className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm hover:-translate-y-0.5 transition-transform"
          >
            <Avatar path={c.profile?.avatar_url} nickname={c.profile?.nickname} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-bold">
                @{c.profile?.nickname ?? "?"}
                {c.unread > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {c.unread}
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">{c.last.content}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(c.last.created_at).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
