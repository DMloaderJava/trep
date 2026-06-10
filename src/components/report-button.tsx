import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type Target = "post" | "comment" | "user" | "message";

export function ReportButton({
  targetType,
  targetId,
  label = "Пожаловаться",
}: {
  targetType: Target;
  targetId: string;
  label?: string;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  async function report() {
    if (!user) return;
    const reason = window.prompt("Что не так? Опиши кратко:");
    if (!reason || reason.trim().length === 0) return;
    setBusy(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim().slice(0, 500),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Жалоба отправлена. Спасибо!");
  }

  return (
    <button
      onClick={report}
      disabled={busy}
      className="text-xs font-bold text-muted-foreground hover:text-destructive disabled:opacity-50"
      title="Пожаловаться"
    >
      🚩 {label}
    </button>
  );
}
