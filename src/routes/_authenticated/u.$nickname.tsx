import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostCard, type PostRow } from "@/components/post-card";
import { Avatar } from "@/components/avatar";
import { ReportButton } from "@/components/report-button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/u/$nickname")({
  head: () => ({ meta: [{ title: "Профиль — Треп" }] }),
  component: UserProfilePage,
  errorComponent: ({ error }) => <div className="p-8 text-center">Ошибка: {error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Пользователь не найден</div>,
});

function UserProfilePage() {
  const { nickname } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-by-nick", nickname],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("nickname", nickname)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const [{ count: followers }, { count: followingCount }, { count: posts }] = await Promise.all(
        [
          supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("followee_id", profile!.id),
          supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("follower_id", profile!.id),
          supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("author_id", profile!.id),
        ],
      );
      return { followers: followers ?? 0, following: followingCount ?? 0, posts: posts ?? 0 };
    },
  });

  const { data: amFollowing } = useQuery({
    queryKey: ["am-following", profile?.id, user?.id],
    enabled: !!profile && !!user && profile.id !== user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user!.id)
        .eq("followee_id", profile!.id)
        .maybeSingle();
      return !!data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["user-posts", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, profiles!posts_author_profile_fkey(nickname,display_name,avatar_url), post_reactions(reaction,user_id), comments(count), post_attachments(*)",
        )
        .eq("author_id", profile!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PostRow[];
    },
  });

  async function toggleFollow() {
    if (!user || !profile) return;
    if (amFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("followee_id", profile.id);
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, followee_id: profile.id });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    qc.invalidateQueries({ queryKey: ["am-following", profile.id, user.id] });
    qc.invalidateQueries({ queryKey: ["profile-stats", profile.id] });
    qc.invalidateQueries({ queryKey: ["following-ids", user.id] });
  }

  async function adminToggleBlock() {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !profile.is_blocked })
      .eq("id", profile.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(profile.is_blocked ? "Разблокирован" : "Заблокирован");
    qc.invalidateQueries({ queryKey: ["profile-by-nick", nickname] });
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Загружаем…</div>;
  if (!profile) return null;

  const isSelf = user?.id === profile.id;
  const isPrivate = profile.is_private && !isSelf && !isAdmin;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <div className="rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm">
        <div className="flex items-start gap-4">
          <Avatar path={profile.avatar_url} nickname={profile.nickname} size={72} />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-extrabold">
              {profile.display_name ?? profile.nickname}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{profile.nickname}
              {profile.is_blocked && (
                <span className="ml-2 rounded-md bg-destructive/15 px-1.5 text-xs text-destructive">
                  заблокирован
                </span>
              )}
            </p>
            {profile.bio && <p className="mt-2 whitespace-pre-wrap text-sm">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span>
                <b>{stats?.posts ?? 0}</b> трепов
              </span>
              <span>
                <b>{stats?.followers ?? 0}</b> подписчиков
              </span>
              <span>
                <b>{stats?.following ?? 0}</b> подписан
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {isSelf ? (
            <Link
              to="/profile"
              className="rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm"
            >
              Редактировать
            </Link>
          ) : (
            <>
              <button
                onClick={toggleFollow}
                className={`rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold shadow-chunky-sm ${amFollowing ? "bg-background" : "bg-primary text-primary-foreground"}`}
              >
                {amFollowing ? "Отписаться" : "Подписаться"}
              </button>
              {profile.allow_dms && !profile.is_blocked && (
                <Link
                  to="/messages/$nickname"
                  params={{ nickname: profile.nickname }}
                  className="rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm"
                >
                  💌 Написать
                </Link>
              )}
              <ReportButton targetType="user" targetId={profile.id} />
              {isAdmin && (
                <button
                  onClick={adminToggleBlock}
                  className="rounded-xl border-2 border-ink bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground shadow-chunky-sm"
                >
                  {profile.is_blocked ? "Разблокировать" : "Заблокировать"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isPrivate ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            🔒 Это приватный профиль
          </div>
        ) : (
          <>
            {(posts?.length ?? 0) === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                Пока нет трепов.
              </div>
            )}
            {posts?.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
