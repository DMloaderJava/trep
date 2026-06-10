import { createServerFn } from "@tanstack/react-start";

export type PublicFeedItem = {
  id: string;
  content: string;
  created_at: string;
  author_nickname: string;
  author_display: string | null;
  reactions: Record<string, number>;
  comments_count: number;
};

export const getPublicFeed = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: posts, error } = await supabaseAdmin
    .from("posts")
    .select(
      "id, content, created_at, author_id, is_hidden, profiles!posts_author_profile_fkey(nickname, display_name, is_private), post_reactions(reaction), comments(count)",
    )
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) throw new Error(error.message);

  const items: PublicFeedItem[] = [];
  for (const p of posts ?? []) {
    const prof = (p as { profiles: { nickname: string; display_name: string | null; is_private: boolean } | null }).profiles;
    if (!prof || prof.is_private) continue;
    const reactions: Record<string, number> = {};
    for (const r of (p as { post_reactions: { reaction: string }[] }).post_reactions ?? []) {
      reactions[r.reaction] = (reactions[r.reaction] ?? 0) + 1;
    }
    items.push({
      id: (p as { id: string }).id,
      content: (p as { content: string }).content,
      created_at: (p as { created_at: string }).created_at,
      author_nickname: prof.nickname,
      author_display: prof.display_name,
      reactions,
      comments_count: (p as { comments: { count: number }[] }).comments?.[0]?.count ?? 0,
    });
  }
  return items;
});
