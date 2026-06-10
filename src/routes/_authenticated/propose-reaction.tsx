import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSignedUrl } from "@/lib/storage";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/propose-reaction")({
  head: () => ({ meta: [{ title: "Предложить реакцию — Треп" }] }),
  component: ProposeReactionPage,
});

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Минимум 2 символа")
    .max(30)
    .regex(/^[a-zA-Zа-яА-Я0-9_ -]+$/, "Только буквы, цифры, _ и -"),
  description: z.string().trim().max(140).optional().or(z.literal("")),
});

function ProposeReactionPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: proposals } = useQuery({
    queryKey: ["my-proposals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reaction_proposals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ name, description });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!file) {
      toast.error("Прикрепи PNG-картинку");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Файл больше 2 МБ");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Только картинки");
      return;
    }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("reaction-proposals").upload(path, file);
      if (upErr) {
        toast.error(upErr.message);
        return;
      }

      const { error } = await supabase.from("reaction_proposals").insert({
        user_id: user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        image_url: path,
      });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Заявка отправлена админу. Ждём вердикта Рыбного совета 🐟");
      setName("");
      setDescription("");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["my-proposals", user.id] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Предложить реакцию</h1>
      <p className="mt-1 text-muted-foreground">
        Загрузи PNG, придумай название — админ решит, добавлять ли в чаты.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Название реакции</span>
          <input
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="например: рыба_одобряет"
            className="w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Описание (необязательно)</span>
          <input
            value={description}
            maxLength={140}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Когда уместно её использовать"
            className="w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">Картинка (PNG, до 2 МБ)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border-2 border-ink bg-background px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-bold file:text-primary-foreground"
          />
          {file && (
            <p className="mt-1 text-xs text-muted-foreground">
              {file.name} · {(file.size / 1024).toFixed(1)} КБ
            </p>
          )}
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl border-2 border-ink bg-gradient-button py-3 font-display font-extrabold text-primary-foreground shadow-chunky-sm disabled:opacity-60"
        >
          {submitting ? "Отправляем…" : "Отправить на модерацию"}
        </button>
      </form>

      <h2 className="mt-12 font-display text-2xl font-extrabold">Мои заявки</h2>
      <div className="mt-4 space-y-3">
        {(!proposals || proposals.length === 0) && (
          <p className="text-muted-foreground">
            Пока ничего не предлагал.{" "}
            <Link to="/" className="text-primary underline">
              Иди ляпни что-нибудь
            </Link>
            .
          </p>
        )}
        {proposals?.map((p) => (
          <ProposalRow key={p.id} proposal={p} />
        ))}
      </div>
    </div>
  );
}

type Proposal = {
  id: string;
  name: string;
  image_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  review_note: string | null;
};

const statusLabel: Record<Proposal["status"], { text: string; cls: string }> = {
  pending: { text: "На модерации", cls: "bg-accent text-accent-foreground" },
  approved: { text: "Одобрено", cls: "bg-primary text-primary-foreground" },
  rejected: { text: "Отклонено", cls: "bg-destructive text-destructive-foreground" },
};

function ProposalRow({ proposal }: { proposal: Proposal }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    getSignedUrl("reaction-proposals", proposal.image_url).then(setUrl);
  }, [proposal.image_url]);
  const s = statusLabel[proposal.status];
  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-ink bg-muted">
        {url ? <img src={url} alt={proposal.name} className="h-full w-full object-contain" /> : "…"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{proposal.name}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(proposal.created_at).toLocaleString("ru-RU")}
        </p>
        {proposal.review_note && (
          <p className="text-xs italic mt-1">Комментарий админа: {proposal.review_note}</p>
        )}
      </div>
      <span
        className={`shrink-0 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold ${s.cls}`}
      >
        {s.text}
      </span>
    </div>
  );
}
