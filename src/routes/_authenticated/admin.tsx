import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSignedUrl } from "@/lib/storage";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import {
  adminApproveProposal,
  adminRejectProposal,
  adminResolveReport,
  adminHideTarget,
  adminTogglePostVisibility,
  adminDeletePost,
  adminToggleUserBlock,
  adminSearchUsers,
} from "@/lib/api/admin.functions";
import { getCsrfToken } from "@/lib/api/csrf.functions";

type ProposalRow = Tables<"reaction_proposals"> & {
  profiles: { nickname: string } | null;
};

type ReactionRow = Tables<"chat_reactions">;

type ReportRow = Tables<"reports"> & {
  reporter_nick: string;
};

type PostRow = Pick<Tables<"posts">, "id" | "content" | "created_at" | "is_hidden" | "hidden_reason"> & {
  profiles: { nickname: string } | null;
};

type UserRow = Pick<Tables<"profiles">, "id" | "nickname" | "display_name" | "is_blocked" | "is_private">;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Админка — Треп" }] }),
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/feed" });
  },
  component: AdminPage,
});

type Tab = "proposals" | "reports" | "posts" | "users";

function AdminPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("proposals");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Obtain CSRF token on mount
  useEffect(() => {
    getCsrfToken()
      .then((res) => setCsrfToken(res.csrf_token))
      .catch((err) => {
        console.error("[Admin] Failed to get CSRF token:", err);
        toast.error("Не удалось получить CSRF-токен. Некоторые функции могут не работать.");
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex items-center gap-3">
        <span className="text-3xl">👑</span>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Админка</h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["proposals", "reports", "posts", "users"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-chunky-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            {labelFor(t)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "proposals" && <ProposalsTab isAdmin={isAdmin} csrfToken={csrfToken} />}
        {tab === "reports" && <ReportsTab csrfToken={csrfToken} />}
        {tab === "posts" && <PostsModerationTab csrfToken={csrfToken} />}
        {tab === "users" && <UsersTab csrfToken={csrfToken} />}
      </div>
    </div>
  );
}

function labelFor(t: Tab) {
  return { proposals: "Реакции", reports: "Жалобы", posts: "Трепы", users: "Пользователи" }[t];
}

// ---- Note Modal Component ----

function NoteModal({
  open,
  title,
  placeholder,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  placeholder?: string;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-md rounded-2xl border-2 border-ink bg-card p-6 shadow-chunky-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-extrabold">{title}</h3>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Введите заметку…"}
          className="mt-3 w-full rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              onConfirm(value);
              setValue("");
            }}
            className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm"
          >
            Подтвердить
          </button>
          <button
            onClick={() => {
              onCancel();
              setValue("");
            }}
            className="rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Proposals Tab ----

function ProposalsTab({ isAdmin, csrfToken }: { isAdmin: boolean; csrfToken: string | null }) {
  const qc = useQueryClient();
  const { data: proposals, isLoading } = useQuery({
    queryKey: ["admin-proposals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reaction_proposals")
        .select("*, profiles!reaction_proposals_user_profile_fkey(nickname)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const { data: reactions } = useQuery({
    queryKey: ["admin-reactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_reactions")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin,
  });

  async function approve(p: ProposalRow) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminApproveProposal({
      data: { proposalId: p.id, name: p.name, imageUrl: p.image_url, csrf_token: csrfToken },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Реакция «${p.name}» добавлена`);
    qc.invalidateQueries({ queryKey: ["admin-proposals"] });
    qc.invalidateQueries({ queryKey: ["admin-reactions"] });
  }

  async function reject(p: ProposalRow, note: string) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminRejectProposal({
      data: { proposalId: p.id, reviewNote: note || null, csrf_token: csrfToken },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Заявка отклонена");
    qc.invalidateQueries({ queryKey: ["admin-proposals"] });
  }

  const pending = proposals?.filter((p) => p.status === "pending") ?? [];
  const reviewed = proposals?.filter((p) => p.status !== "pending") ?? [];

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">Заявки на новые реакции</h2>
      {isLoading && <p className="mt-4 text-muted-foreground">Загружаем…</p>}
      {pending.length === 0 && !isLoading && (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center text-muted-foreground">
          Новых заявок нет.
        </div>
      )}
      <div className="mt-4 space-y-3">
        {pending.map((p) => (
          <AdminProposalRow
            key={p.id}
            proposal={p}
            onApprove={() => approve(p)}
            onReject={(note) => reject(p, note)}
          />
        ))}
      </div>
      {reviewed.length > 0 && (
        <>
          <h3 className="mt-10 font-display text-lg font-extrabold">История</h3>
          <div className="mt-3 space-y-2 opacity-80">
            {reviewed.map((p) => (
              <AdminProposalRow key={p.id} proposal={p} readonly />
            ))}
          </div>
        </>
      )}

      <h3 className="mt-10 font-display text-lg font-extrabold">
        Активные реакции ({reactions?.length ?? 0})
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {reactions?.map((r) => (
          <ReactionTile key={r.id} reaction={r} />
        ))}
      </div>
    </section>
  );
}

// ---- Reports Tab ----

function ReportsTab({ csrfToken }: { csrfToken: string | null }) {
  const qc = useQueryClient();
  const [noteModal, setNoteModal] = useState<{
    report: ReportRow;
    action: "resolve" | "dismiss" | "hide";
  } | null>(null);
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      const rows = data ?? [];
      const reporterIds = Array.from(new Set(rows.map((r) => r.reporter_id)));
      const { data: profs } = reporterIds.length
        ? await supabase.from("profiles").select("id,nickname").in("id", reporterIds)
        : { data: [] as { id: string; nickname: string }[] };
      const map = new Map(profs?.map((p) => [p.id, p.nickname]));
      return rows.map((r) => ({ ...r, reporter_nick: map.get(r.reporter_id) ?? "—" }));
    },
  });

  async function handleResolve(r: ReportRow, status: "resolved" | "dismissed", note: string) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminResolveReport({
      data: { reportId: r.id, status, resolutionNote: note || null, csrf_token: csrfToken },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Готово");
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }

  async function handleHideTarget(r: ReportRow, note: string) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminHideTarget({
      data: {
        targetType: r.target_type as "post" | "comment" | "user",
        targetId: r.target_id,
        reportId: r.id,
        csrf_token: csrfToken,
      },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Скрыто и закрыто");
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }

  if (isLoading) return <p className="text-muted-foreground">Загружаем…</p>;
  const pending = reports?.filter((r) => r.status === "pending") ?? [];
  const others = reports?.filter((r) => r.status !== "pending") ?? [];

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">Жалобы ({pending.length} новых)</h2>
      <div className="mt-4 space-y-3">
        {pending.length === 0 && <p className="text-muted-foreground">Тишина.</p>}
        {pending.map((r) => (
          <div key={r.id} className="rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
            <p className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString("ru-RU")} · от @{r.reporter_nick} ·{" "}
              {r.target_type}
            </p>
            <p className="mt-1 font-bold">{r.reason}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">id: {r.target_id}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.target_type === "post" && (
                <Link
                  to="/post/$id"
                  params={{ id: r.target_id }}
                  className="rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-sm font-bold shadow-chunky-sm"
                >
                  Открыть треп
                </Link>
              )}
              <button
                onClick={() => setNoteModal({ report: r, action: "hide" })}
                className="rounded-xl border-2 border-ink bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground shadow-chunky-sm"
              >
                Скрыть и закрыть
              </button>
              <button
                onClick={() => handleResolve(r, "resolved", "")}
                className="rounded-xl border-2 border-ink bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-chunky-sm"
              >
                Принять
              </button>
              <button
                onClick={() => setNoteModal({ report: r, action: "dismiss" })}
                className="rounded-xl border-2 border-ink bg-background px-3 py-1.5 text-sm font-bold shadow-chunky-sm"
              >
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Note modal for reports */}
      <NoteModal
        open={noteModal !== null}
        title={
          noteModal?.action === "hide"
            ? "Заметка (скрытие)"
            : noteModal?.action === "dismiss"
              ? "Заметка (отклонение)"
              : "Заметка"
        }
        placeholder="Опциональная заметка…"
        onConfirm={(note) => {
          if (!noteModal) return;
          if (noteModal.action === "hide") {
            handleHideTarget(noteModal.report, note);
          } else if (noteModal.action === "dismiss") {
            handleResolve(noteModal.report, "dismissed", note);
          }
          setNoteModal(null);
        }}
        onCancel={() => setNoteModal(null)}
      />

      {others.length > 0 && (
        <>
          <h3 className="mt-10 font-display text-lg font-extrabold">Закрытые</h3>
          <div className="mt-3 space-y-2 opacity-70">
            {others.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-2 text-xs">
                {r.status} · {r.target_type} · {r.reason}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ---- Posts Moderation Tab ----

function PostsModerationTab({ csrfToken }: { csrfToken: string | null }) {
  const qc = useQueryClient();
  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select(
          "id,content,created_at,is_hidden,hidden_reason,profiles!posts_author_profile_fkey(nickname)",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  async function toggleHide(p: PostRow) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminTogglePostVisibility({
      data: { postId: p.id, isHidden: !p.is_hidden, csrf_token: csrfToken },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  async function remove(p: PostRow) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    if (!confirm("Удалить треп навсегда?")) return;
    const result = await adminDeletePost({ data: { postId: p.id, csrf_token: csrfToken } });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">Последние трепы</h2>
      <div className="mt-4 space-y-2">
        {posts?.map((p: PostRow) => (
          <div key={p.id} className="rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
            <p className="text-xs text-muted-foreground">
              @{p.profiles?.nickname} · {new Date(p.created_at).toLocaleString("ru-RU")}{" "}
              {p.is_hidden && (
                <span className="ml-2 rounded bg-destructive/15 px-1.5 text-destructive">
                  скрыт
                </span>
              )}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{p.content}</p>
            <div className="mt-2 flex gap-2">
              <Link
                to="/post/$id"
                params={{ id: p.id }}
                className="rounded-lg border-2 border-ink bg-background px-2 py-1 text-xs font-bold shadow-chunky-sm"
              >
                Открыть
              </Link>
              <button
                onClick={() => toggleHide(p)}
                className="rounded-lg border-2 border-ink bg-background px-2 py-1 text-xs font-bold shadow-chunky-sm"
              >
                {p.is_hidden ? "Показать" : "Скрыть"}
              </button>
              <button
                onClick={() => remove(p)}
                className="rounded-lg border-2 border-ink bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground shadow-chunky-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- Users Tab ----

function UsersTab({ csrfToken }: { csrfToken: string | null }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: users } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async (): Promise<UserRow[]> => {
      const term = q.trim();
      if (term.length > 0) {
        // Use server-side safe search to prevent ILIKE injection
        const result = await adminSearchUsers({
          data: { query: term, csrf_token: csrfToken ?? "" },
        });
        return (result.data ?? []) as UserRow[];
      }
      const { data } = await supabase
        .from("profiles")
        .select("id,nickname,display_name,is_blocked,is_private")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as UserRow[];
    },
  });

  async function toggleBlock(u: UserRow) {
    if (!csrfToken) {
      toast.error("CSRF-токен не получен. Обновите страницу.");
      return;
    }
    const result = await adminToggleUserBlock({
      data: { userId: u.id, isBlocked: !u.is_blocked, csrf_token: csrfToken },
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">Пользователи</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск…"
        className="mt-3 w-full rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="mt-4 space-y-2">
        {users?.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm"
          >
            <Link to="/u/$nickname" params={{ nickname: u.nickname }} className="min-w-0 flex-1">
              <p className="truncate font-bold">
                @{u.nickname}
                {u.is_blocked && (
                  <span className="ml-2 rounded bg-destructive/15 px-1.5 text-xs text-destructive">
                    блок
                  </span>
                )}
              </p>
              {u.display_name && (
                <p className="truncate text-xs text-muted-foreground">{u.display_name}</p>
              )}
            </Link>
            <button
              onClick={() => toggleBlock(u)}
              className={`rounded-xl border-2 border-ink px-3 py-1.5 text-sm font-bold shadow-chunky-sm ${u.is_blocked ? "bg-background" : "bg-destructive text-destructive-foreground"}`}
            >
              {u.is_blocked ? "Разблок" : "Заблок"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- Proposal Row ----

function AdminProposalRow({
  proposal,
  onApprove,
  onReject,
  readonly,
}: {
  proposal: ProposalRow;
  onApprove?: () => void;
  onReject?: (note: string) => void;
  readonly?: boolean;
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
        <ProposalImage imageUrl={proposal.image_url} alt={proposal.name} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {proposal.name}{" "}
            <span className="font-normal text-muted-foreground">
              от @{proposal.profiles?.nickname ?? "—"}
            </span>
          </p>
          {proposal.description && (
            <p className="text-sm text-muted-foreground">{proposal.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(proposal.created_at).toLocaleString("ru-RU")} · статус: {proposal.status}
          </p>
        </div>
        {!readonly && (
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm"
            >
              Принять
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="rounded-xl border-2 border-ink bg-background px-4 py-2 text-sm font-bold shadow-chunky-sm"
            >
              Отклонить
            </button>
          </div>
        )}
      </div>

      <NoteModal
        open={showRejectModal}
        title="Комментарий автору"
        placeholder="Необязательный комментарий…"
        onConfirm={(note) => {
          onReject?.(note);
          setShowRejectModal(false);
        }}
        onCancel={() => setShowRejectModal(false)}
      />
    </>
  );
}

// ---- Reaction Tile ----

function ReactionTile({ reaction }: { reaction: ReactionRow }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ink bg-card p-3 text-center shadow-chunky-sm">
      <ProposalImage imageUrl={reaction.image_url} alt={reaction.name} />
      <p className="w-full truncate text-sm font-bold">{reaction.name}</p>
    </div>
  );
}

// ---- Proposal Image (with signed URL) ----

function ProposalImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  // Load signed URL on mount and when imageUrl changes
  useEffect(() => {
    getSignedUrl("reaction-proposals", imageUrl)
      .then(setUrl)
      .catch(() => setUrl(null));
  }, [imageUrl]);

  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-ink bg-muted">
      {url ? <img src={url} alt={alt} className="h-full w-full object-contain" /> : "…"}
    </div>
  );
}
