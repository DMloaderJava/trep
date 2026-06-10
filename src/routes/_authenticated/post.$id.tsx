import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard, type PostRow } from "@/components/post-card";
import { Avatar } from "@/components/avatar";
import { ReportButton } from "@/components/report-button";
import { toast } from "sonner";

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  profiles: { nickname: string; display_name: string | null; avatar_url: string | null } | null;
};

export const Route = createFileRoute("/_authenticated/post/$id")({
  head: () => ({ meta: [{ title: "Треп — Треп" }] }),
  component: PostPage,
  errorComponent: ({ error }) => <div className="p-8 text-center">Ошибка: {error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Треп не найден</div>,
});

function PostPage() {
  const { id } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as unknown as PostRow;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles!comments_author_profile_fkey(nickname,display_name,avatar_url)")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  async function submitComment() {
    const text = comment.trim();
    if (!text || !user) return;
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: id, author_id: user.id, content: text });
    if (error) {
      toast.error(error.message);
      return;
    }
    setComment("");
    qc.invalidateQueries({ queryKey: ["comments", id] });
    qc.invalidateQueries({ queryKey: ["post", id] });
  }

  async function deleteComment(cid: string) {
    if (!confirm("Удалить комментарий?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", cid);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["comments", id] });
  }

  async function hideComment(cid: string) {
    const { error } = await supabase.from("comments").update({ is_hidden: true }).eq("id", cid);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["comments", id] });
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <Link to="/feed" className="text-sm font-bold text-muted-foreground hover:text-primary">
        ← К ленте
      </Link>

      <div className="mt-4">
        {isLoading && <p className="text-muted-foreground">Загружаем…</p>}
        {post && <PostCard post={post} showComments />}
      </div>

      <div className="mt-6 rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm">
        <h2 className="font-display text-lg font-extrabold">Комментарии</h2>

        <div className="mt-3 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Лучший комментарий..."
            className="flex-1 rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") submitComment();
            }}
          />
          <button
            onClick={submitComment}
            className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm"
          >
            Отправить
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {comments?.length === 0 && (
            <p className="text-sm text-muted-foreground">Тут никого. Будь первым.</p>
          )}
          {comments?.map((c: CommentRow) => (
            <div
              key={c.id}
              className="flex gap-3 rounded-2xl border-2 border-ink bg-background p-3"
            >
              <Link to="/u/$nickname" params={{ nickname: c.profiles?.nickname ?? "" }}>
                <Avatar path={c.profiles?.avatar_url} nickname={c.profiles?.nickname} size={32} />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <Link
                    to="/u/$nickname"
                    params={{ nickname: c.profiles?.nickname ?? "" }}
                    className="font-bold hover:underline"
                  >
                    @{c.profiles?.nickname}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString("ru-RU")}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {c.is_hidden ? (
                    <em className="text-muted-foreground">[скрыт модератором]</em>
                  ) : (
                    c.content
                  )}
                </p>
                <div className="mt-1 flex gap-3">
                  {(user?.id === c.author_id || isAdmin) && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-xs font-bold text-muted-foreground hover:text-destructive"
                    >
                      Удалить
                    </button>
                  )}
                  {isAdmin && !c.is_hidden && (
                    <button
                      onClick={() => hideComment(c.id)}
                      className="text-xs font-bold text-muted-foreground hover:text-destructive"
                    >
                      Скрыть
                    </button>
                  )}
                  <ReportButton targetType="comment" targetId={c.id} label="" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
