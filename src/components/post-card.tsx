import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SmilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/avatar";
import { ReportButton } from "@/components/report-button";
import { FilePreview } from "@/components/file-preview";
import { useChatReactions } from "@/lib/use-chat-reactions";
import { toast } from "sonner";

const STATIC_REACTIONS: { code: string; emoji: string; label: string }[] = [
  { code: "laugh", emoji: "🤣", label: "Уничтожило" },
  { code: "brain", emoji: "🧠", label: "Мозг сломался" },
  { code: "coffee", emoji: "☕", label: "Норм треп" },
  { code: "ambulance", emoji: "🚑", label: "Срочно заберите автора" },
  { code: "fish", emoji: "🐟", label: "Рыба одобряет" },
];

export type PostRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  is_hidden: boolean;
  hidden_reason?: string | null;
  profiles: { nickname: string; display_name: string | null; avatar_url: string | null } | null;
  post_reactions: { reaction: string; user_id: string }[];
  comments: { count: number }[];
  post_attachments?: {
    id: string;
    post_id: string;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    created_at: string;
  }[];
};

const to = "/auth" as const;

export function PostCard({
  post,
  showComments = false,
  readOnly = false,
}: {
  post: PostRow;
  showComments?: boolean;
  readOnly?: boolean;
}) {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data: chatReactions } = useChatReactions();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const nick = post.profiles?.nickname ?? "deleted";
  const display = post.profiles?.display_name ?? nick;
  const commentsCount = post.comments?.[0]?.count ?? 0;

  const isReadOnly = readOnly || !user;

  useEffect(() => {
    if (!pickerOpen) return;
    function onClick(e: MouseEvent) {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [pickerOpen]);

  async function toggleReaction(code: string) {
    if (!user) return;
    const mine = post.post_reactions.find((r) => r.user_id === user.id);
    if (mine && mine.reaction === code) {
      const { error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase
        .from("post_reactions")
        .upsert(
          { post_id: post.id, user_id: user.id, reaction: code },
          { onConflict: "post_id,user_id" },
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
    const { error } = await supabase
      .from("posts")
      .update({ is_hidden: true, hidden_reason: reason })
      .eq("id", post.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Треп скрыт");
    qc.invalidateQueries();
  }

  return (
    <article className="rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm">
      <header className="flex items-center justify-between gap-3">
        <Link
          to={isReadOnly ? to : "/u/$nickname"}
          params={isReadOnly ? {} : { nickname: nick }}
          className="flex items-center gap-3 min-w-0"
        >
          <Avatar path={post.profiles?.avatar_url} nickname={nick} />
          <div className="min-w-0">
            <p className="truncate font-bold">{display}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{nick} · {new Date(post.created_at).toLocaleString("ru-RU")}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {post.is_hidden && (
            <span className="rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
              скрыт
            </span>
          )}
          {!isReadOnly && (user?.id === post.author_id || isAdmin) && (
            <button
              onClick={deletePost}
              className="text-xs font-bold text-muted-foreground hover:text-destructive"
            >
              Удалить
            </button>
          )}
          {!isReadOnly && isAdmin && !post.is_hidden && (
            <button
              onClick={adminHide}
              className="text-xs font-bold text-muted-foreground hover:text-destructive"
            >
              Скрыть
            </button>
          )}
        </div>
      </header>

      <Link
        to={isReadOnly ? to : "/post/$id"}
        params={isReadOnly ? {} : { id: post.id }}
        className="mt-3 block whitespace-pre-wrap text-base leading-snug hover:opacity-90"
      >
        {post.content}
      </Link>

      {/* Post Attachments */}
      {post.post_attachments && post.post_attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.post_attachments.map((a) => (
            <FilePreview
              key={a.id}
              filePath={a.file_path}
              fileName={a.file_name}
              fileType={a.file_type}
              fileSize={a.file_size}
            />
          ))}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(() => {
            const counts = new Map<string, number>();
            for (const r of post.post_reactions)
              counts.set(r.reaction, (counts.get(r.reaction) ?? 0) + 1);
            const used = Array.from(counts.keys());
            const findChat = (code: string) => chatReactions?.find((c) => c.name === code);
            const findStatic = (code: string) => STATIC_REACTIONS.find((s) => s.code === code);
            return used.map((code) => {
              const mine = !!post.post_reactions.find(
                (x) => x.user_id === user?.id && x.reaction === code,
              );
              const chat = findChat(code);
              const stat = findStatic(code);
              // Read-only: non-interactive pill display
              if (isReadOnly) {
                return (
                  <span
                    key={code}
                    className="flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-1 text-sm font-bold shadow-chunky-sm bg-background"
                    title={chat?.name ?? stat?.label ?? code}
                  >
                    {chat ? (
                      chat.imageSignedUrl ? (
                        <img
                          src={chat.imageSignedUrl}
                          alt={chat.name}
                          className="h-4 w-4 object-contain"
                        />
                      ) : (
                        <span>{chat.emoji_fallback ?? "⭐"}</span>
                      )
                    ) : (
                      <span>{stat?.emoji ?? "❓"}</span>
                    )}
                    <span>{counts.get(code)}</span>
                  </span>
                );
              }
              return (
                <button
                  key={code}
                  onClick={() => toggleReaction(code)}
                  className={`flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-1 text-sm font-bold shadow-chunky-sm transition hover:-translate-y-0.5 ${mine ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  title={chat?.name ?? stat?.label ?? code}
                >
                  {chat ? (
                    chat.imageSignedUrl ? (
                      <img
                        src={chat.imageSignedUrl}
                        alt={chat.name}
                        className="h-4 w-4 object-contain"
                      />
                    ) : (
                      <span>{chat.emoji_fallback ?? "⭐"}</span>
                    )
                  ) : (
                    <span>{stat?.emoji ?? "❓"}</span>
                  )}
                  <span>{counts.get(code)}</span>
                </button>
              );
            });
          })()}
          {/* Reaction picker — hidden in read-only mode */}
          {!isReadOnly && (
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5 hover:bg-muted"
                title="Добавить реакцию"
                aria-label="Добавить реакцию"
              >
                <SmilePlus className="h-4 w-4" />
              </button>
              {pickerOpen && (
                <div className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
                  <p className="mb-2 text-xs font-bold text-muted-foreground">Одобренные реакции</p>
                  <div className="flex flex-wrap gap-1.5">
                    {chatReactions && chatReactions.length > 0 ? (
                      chatReactions.map((r) => (
                        <button
                          key={r.id}
                          title={r.name}
                          onClick={() => {
                            toggleReaction(r.name);
                            setPickerOpen(false);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-background transition hover:-translate-y-0.5 hover:bg-muted"
                        >
                          {r.imageSignedUrl ? (
                            <img
                              src={r.imageSignedUrl}
                              alt={r.name}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <span className="text-lg">{r.emoji_fallback ?? "⭐"}</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">Пока пусто</p>
                    )}
                  </div>
                  <div className="mt-3 h-px bg-border" />
                  <p className="mt-3 mb-2 text-xs font-bold text-muted-foreground">Базовые</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATIC_REACTIONS.map((r) => (
                      <button
                        key={r.code}
                        title={r.label}
                        onClick={() => {
                          toggleReaction(r.code);
                          setPickerOpen(false);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl border-2 border-ink bg-background text-lg transition hover:-translate-y-0.5 hover:bg-muted"
                      >
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                  <Link
                    to="/propose-reaction"
                    onClick={() => setPickerOpen(false)}
                    className="mt-3 block rounded-xl border-2 border-ink bg-background px-3 py-2 text-center text-xs font-bold shadow-chunky-sm hover:bg-muted"
                  >
                    + Предложить новую реакцию
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            {...(isReadOnly
              ? { to: "/auth" as const, params: {} as Record<string, never> }
              : { to: "/post/$id" as const, params: { id: post.id } as Record<string, string> })}
            className="text-sm font-bold text-muted-foreground hover:text-primary"
          >
            💬 {commentsCount}
          </Link>
          {!isReadOnly && <ReportButton targetType="post" targetId={post.id} label="" />}
        </div>
      </footer>

      {isReadOnly && showComments === false && commentsCount > 0 && (
        <Link
          to="/auth"
          className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
        >
          Войдите, чтобы посмотреть комментарии →
        </Link>
      )}

      {!isReadOnly && showComments === false && commentsCount > 0 && (
        <Link
          to="/post/$id"
          params={{ id: post.id }}
          className="mt-2 inline-block text-xs font-bold text-primary hover:underline"
        >
          Посмотреть комментарии →
        </Link>
      )}
    </article>
  );
}