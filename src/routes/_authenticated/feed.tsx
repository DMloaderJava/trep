import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard, type PostRow } from "@/components/post-card";
import { AttachmentUpload } from "@/components/attachment-upload";
import { uploadFile } from "@/lib/upload-file";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Лента — Треп" }] }),
  component: FeedPage,
});

type FeedTab = "smart" | "chaos" | "fresh" | "following";

const TAB_LABELS: Record<FeedTab, string> = {
  smart: "🧠 Умная",
  chaos: "🌀 Полный треп",
  fresh: "🆕 Свежие",
  following: "👥 Подписки",
};

function FeedPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<FeedTab>("smart");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const { data: madnessPref, refetch: refetchPref } = useQuery({
    queryKey: ["madness-pref", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("madness_pref")
        .eq("id", user!.id)
        .maybeSingle();
      return data?.madness_pref ?? 50;
    },
  });

  const { data: following } = useQuery({
    queryKey: ["following-ids", user?.id],
    enabled: !!user && tab === "following",
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user!.id);
      return data?.map((r) => r.followee_id) ?? [];
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["feed", tab, user?.id, madnessPref, following?.length],
    enabled: !!user && (tab !== "following" || !!following),
    queryFn: async () => {
      if (tab === "following") {
        const ids = [...(following ?? []), user!.id];
        const { data, error } = await supabase
          .from("posts")
          .select(
            "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count)",
          )
          .in("author_id", ids)
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        return (data ?? []) as unknown as PostRow[];
      }

      // RPC-based smart/chaos/fresh feed
      const { data: idsData, error: rpcErr } = await (supabase.rpc as (name: string, args: Record<string, unknown>) => ReturnType<typeof supabase.rpc>)("smart_feed", {
        _mode: tab,
        _limit: 50,
      });
      if (rpcErr) throw rpcErr;
      const ids: string[] = ((idsData ?? []) as { post_id: string }[]).map((r: { post_id: string }) => r.post_id);
      if (ids.length === 0) return [] as PostRow[];

      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)",
        )
        .in("id", ids);
      if (error) throw error;
      // preserve RPC order
      const rank = new Map(ids.map((id, i) => [id, i]));
      return (data as unknown as PostRow[]).sort(
        (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
      );
    },
  });

  async function submit() {
    const text = content.trim();
    if ((!text && pendingFiles.length === 0) || !user) return;
    setPosting(true);

    // Create the post first
    const { data: newPost, error } = await supabase
      .from("posts")
      .insert({ author_id: user.id, content: text })
      .select("id")
      .single();

    if (error || !newPost) {
      toast.error(error?.message ?? "Ошибка при создании поста");
      setPosting(false);
      return;
    }

    // Upload files and create attachment records
    for (const file of pendingFiles) {
      const result = await uploadFile(file, user.id);
      if (result.error) {
        toast.error(`Ошибка загрузки ${file.name}: ${result.error}`);
        continue;
      }
      const { error: attErr } = await (supabase.from as (table: string) => ReturnType<typeof supabase.from>)("post_attachments").insert({
        post_id: newPost.id,
        file_path: result.path,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
      });
      if (attErr) {
        toast.error(`Ошибка сохранения вложения: ${attErr.message}`);
      }
    }

    setPosting(false);
    setContent("");
    setPendingFiles([]);
    toast.success("Ляпнул!");
    qc.invalidateQueries({ queryKey: ["feed"] });
  }

  async function updateMadness(v: number) {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ madness_pref: v }).eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refetchPref();
    qc.invalidateQueries({ queryKey: ["feed"] });
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Лента</h1>

      {/* Composer */}
      <div className="mt-4 rounded-3xl border-2 border-ink bg-card p-4 shadow-chunky-sm">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 280))}
          placeholder="Ляпни что-нибудь… (до 280 символов)"
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-ink bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
        />
        {/* Pending Files Preview */}
        {pendingFiles.length > 0 && (
          <div className="mt-3 space-y-2 border-t-2 border-ink pt-3">
            <p className="text-xs font-bold text-muted-foreground">Вложения к посту:</p>
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border-2 border-ink bg-background p-2 text-xs font-bold"
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-destructive hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AttachmentUpload
              onFilesSelected={(files) => setPendingFiles((prev) => [...prev, ...files])}
              onError={(err) => toast.error(err)}
              disabled={posting}
            />
            <span className="text-xs text-muted-foreground">{content.length}/280</span>
          </div>
          <button
            onClick={submit}
            disabled={posting || (content.trim().length === 0 && pendingFiles.length === 0)}
            className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm disabled:opacity-50"
          >
            ЛЯПНУТЬ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as FeedTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-chunky-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Madness slider */}
      <div className="mt-4 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
        <div className="mb-1 flex items-center justify-between text-xs font-bold">
          <span>🤪 Коэффициент безумия в ленте</span>
          <span>{madnessPref ?? 50}/100</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={madnessPref ?? 50}
          onChange={(e) => updateMadness(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>обычное</span>
          <span>странное</span>
          <span>шедевр абсурда</span>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-muted-foreground">Загружаем трепы…</p>}
        {!isLoading && (posts?.length ?? 0) === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            {tab === "following"
              ? "Подпишись на кого-нибудь, чтобы видеть их трепы."
              : "Пока тихо. Ляпни первым!"}
          </div>
        )}
        {posts?.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
