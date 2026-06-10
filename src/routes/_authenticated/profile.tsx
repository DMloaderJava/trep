import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { getSignedUrl } from "@/lib/storage";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Профиль — Треп" }] }),
  component: ProfilePage,
});

const updateSchema = z.object({
  display_name: z.string().trim().max(60).optional().or(z.literal("")),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  birthday: z.string().optional().or(z.literal("")),
  is_private: z.boolean(),
  hide_following: z.boolean(),
  allow_dms: z.boolean(),
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    birthday: "",
    is_private: false,
    hide_following: false,
    allow_dms: true,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        birthday: profile.birthday ?? "",
        is_private: profile.is_private,
        hide_following: profile.hide_following,
        allow_dms: profile.allow_dms,
      });
      if (profile.avatar_url) {
        getSignedUrl("avatars", profile.avatar_url).then(setAvatarUrl);
      } else {
        setAvatarUrl(null);
      }
    }
  }, [profile]);

  async function handleAvatarUpload(file: File) {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Только картинки");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) {
        toast.error(upErr.message);
        return;
      }
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", user.id);
      if (dbErr) {
        toast.error(dbErr.message);
        return;
      }
      toast.success("Аватар обновлён");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const parsed = updateSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        display_name: parsed.data.display_name || null,
        bio: parsed.data.bio || null,
        birthday: parsed.data.birthday || null,
        is_private: parsed.data.is_private,
        hide_following: parsed.data.hide_following,
        allow_dms: parsed.data.allow_dms,
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Профиль сохранён");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading)
    return <div className="mx-auto max-w-2xl p-6 text-muted-foreground">Загружаем профиль…</div>;
  if (!profile)
    return <div className="mx-auto max-w-2xl p-6 text-destructive">Профиль не найден.</div>;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-extrabold md:text-4xl">Мой профиль</h1>
      <p className="mt-1 text-muted-foreground">
        @{profile.nickname} · с {new Date(profile.created_at).toLocaleDateString("ru-RU")}
      </p>

      <div className="mt-8 flex items-center gap-5 rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-ink bg-accent text-2xl font-extrabold">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            profile.nickname[0].toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold">Аватар</p>
          <p className="text-sm text-muted-foreground">PNG / JPG, до 5 МБ</p>
          <label className="mt-2 inline-block cursor-pointer rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm hover:-translate-y-0.5 transition-transform">
            {uploading ? "Загрузка…" : "Загрузить новый"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAvatarUpload(f);
              }}
            />
          </label>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="mt-6 space-y-4 rounded-3xl border-2 border-ink bg-card p-5 shadow-chunky-sm"
      >
        <Field label="Отображаемое имя">
          <input
            value={form.display_name}
            maxLength={60}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            placeholder="Как тебя называть"
            className="w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
          />
        </Field>
        <Field label="О себе">
          <textarea
            value={form.bio}
            maxLength={280}
            rows={3}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Расскажи о ерунде, которой ты занимаешься"
            className="w-full resize-none rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">{form.bio.length}/280</div>
        </Field>
        <Field label="День рождения">
          <input
            type="date"
            value={form.birthday ?? ""}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            className="w-full rounded-xl border-2 border-ink bg-background px-4 py-2.5 outline-none focus:ring-4 focus:ring-primary/30"
          />
        </Field>

        <div className="rounded-2xl border-2 border-ink bg-secondary p-4">
          <p className="font-display text-lg font-extrabold">Приватность</p>
          <div className="mt-3 space-y-2">
            <Toggle
              label="Скрыть профиль (видеть может только я)"
              checked={form.is_private}
              onChange={(v) => setForm({ ...form, is_private: v })}
            />
            <Toggle
              label="Скрыть список подписок"
              checked={form.hide_following}
              onChange={(v) => setForm({ ...form, hide_following: v })}
            />
            <Toggle
              label="Разрешить личные сообщения"
              checked={form.allow_dms}
              onChange={(v) => setForm({ ...form, allow_dms: v })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl border-2 border-ink bg-gradient-button py-3 font-display font-extrabold text-primary-foreground shadow-chunky-sm disabled:opacity-60"
        >
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-background px-3 py-2 border border-border">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 cursor-pointer"
      />
    </label>
  );
}
