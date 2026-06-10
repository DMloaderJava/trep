import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/avatar";
import { FilePreview } from "@/components/file-preview";
import { AttachmentUpload } from "@/components/attachment-upload";
import { uploadFile } from "@/lib/upload-file";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/messages/$nickname")({
  head: () => ({ meta: [{ title: "Чат — Треп" }] }),
  component: ChatPage,
});

type Attachment = {
  id: string;
  message_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

type ChatMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  created_at: string;
  read_at: string | null;
  attachments: Attachment[];
};

function ChatPage() {
  const { nickname } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  // Pending files waiting to be uploaded when message is sent
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const { data: other } = useQuery({
    queryKey: ["chat-other", nickname],
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

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ["chat", user?.id, other?.id],
    enabled: !!user && !!other,
    refetchInterval: 4000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user!.id},recipient_id.eq.${other!.id}),and(sender_id.eq.${other!.id},recipient_id.eq.${user!.id})`,
        )
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;

      // mark unread incoming as read
      const unread = (data ?? [])
        .filter((m) => m.recipient_id === user!.id && !m.read_at)
        .map((m) => m.id);
      if (unread.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unread);
        qc.invalidateQueries({ queryKey: ["conversations", user!.id] });
      }

      // fetch attachments for all messages (raw query since type not in Database)
      const msgIds = (data ?? []).map((m) => m.id);
      const attachmentsMap = new Map<string, Attachment[]>();
      if (msgIds.length > 0) {
        const { data: atts } = await (supabase.from as (table: string) => ReturnType<typeof supabase.from>)
          ("message_attachments")
          .select("*")
          .in("message_id", msgIds)
          .order("created_at", { ascending: true });
        for (const a of (atts ?? []) as Attachment[]) {
          const list = attachmentsMap.get(a.message_id) ?? [];
          list.push(a);
          attachmentsMap.set(a.message_id, list);
        }
      }

      return (data ?? []).map((m) => ({
        ...m,
        attachments: attachmentsMap.get(m.id) ?? [],
      })) as ChatMessage[];
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  async function send() {
    const body = text.trim();
    if ((!body && pendingFiles.length === 0) || !user || !other) return;
    setSending(true);

    // Insert message first
    const { data: newMsg, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: other.id,
        content: body || "",
      })
      .select("id")
      .single();

    if (error || !newMsg) {
      toast.error(
        error?.message.includes("row-level")
          ? "Получатель не принимает сообщения"
          : (error?.message ?? "Ошибка отправки"),
      );
      setSending(false);
      return;
    }

    // Upload pending files and insert attachment records
    for (const file of pendingFiles) {
      const result = await uploadFile(file, user.id);
      if (result.error) {
        toast.error(`Ошибка загрузки ${file.name}: ${result.error}`);
        continue;
      }
      const { error: attErr } = await (supabase.from as (table: string) => ReturnType<typeof supabase.from>)("message_attachments").insert({
        message_id: newMsg.id,
        file_path: result.path,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
      });
      if (attErr) {
        toast.error(`Ошибка сохранения вложения: ${attErr.message}`);
      }
    }

    setText("");
    setPendingFiles([]);
    setSending(false);
    qc.invalidateQueries({ queryKey: ["chat", user.id, other.id] });
  }

  if (!other) return <div className="p-8 text-muted-foreground">Загружаем…</div>;

  const canDm = other.allow_dms && !other.is_blocked;

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-2xl flex-col p-4 md:p-8">
      <div className="mb-3 flex items-center gap-3">
        <Link to="/messages" className="text-sm font-bold text-muted-foreground hover:text-primary">
          ←
        </Link>
        <Link
          to="/u/$nickname"
          params={{ nickname: other.nickname }}
          className="flex items-center gap-3"
        >
          <Avatar path={other.avatar_url} nickname={other.nickname} />
          <div>
            <p className="font-bold">{other.display_name ?? other.nickname}</p>
            <p className="text-xs text-muted-foreground">@{other.nickname}</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto rounded-3xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
        <div className="space-y-3">
          {messages?.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Пока пусто. Ляпни ему что-нибудь.
            </p>
          )}
          {messages?.map((m) => {
            const mine = m.sender_id === user?.id;
            const hasAttachments = (m.attachments?.length ?? 0) > 0;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2`}>
                  {/* Текст сообщения */}
                  {m.content && (
                    <div
                      className={`rounded-2xl border-2 border-ink px-3 py-2 text-sm shadow-chunky-sm ${
                        mine ? "bg-primary text-primary-foreground" : "bg-background"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p
                        className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {new Date(m.created_at).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {mine && m.read_at && " · прочитано"}
                      </p>
                    </div>
                  )}

                  {/* Вложения */}
                  {hasAttachments && (
                    <div className="space-y-1.5">
                      {m.attachments.map((a) => (
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

                  {/* Если нет текста, показываем время под вложениями */}
                  {!m.content && hasAttachments && (
                    <p
                      className={`text-[10px] ${mine ? "text-right text-primary-foreground/70" : "text-left text-muted-foreground"}`}
                    >
                      {new Date(m.created_at).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {mine && m.read_at && " · прочитано"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <AttachmentUpload
          onFilesSelected={(files) => setPendingFiles((prev) => [...prev, ...files])}
          onError={(err) => toast.error(err)}
          disabled={!canDm}
        />
        {/* Pending files indicator */}
        {pendingFiles.length > 0 && (
          <div className="rounded-xl border-2 border-ink bg-accent px-2 py-1 text-xs font-bold text-accent-foreground shadow-chunky-sm">
            📎 {pendingFiles.length}
          </div>
        )}
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          placeholder={canDm ? "Сообщение…" : "Этот пользователь не принимает ЛС"}
          disabled={!canDm || sending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="flex-1 rounded-xl border-2 border-ink bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!canDm || sending || (text.trim().length === 0 && pendingFiles.length === 0)}
          className="rounded-xl border-2 border-ink bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-chunky-sm disabled:opacity-50"
        >
          {sending ? "…" : "Отправить"}
        </button>
      </div>
    </div>
  );
}
