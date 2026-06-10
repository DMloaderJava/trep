/**
 * Хелпер для загрузки файлов в Supabase Storage (bucket 'chat-files').
 * Возвращает путь файла в Storage для сохранения в таблицу message_attachments.
 */
import { supabase } from "@/integrations/supabase/client";

export type UploadResult = { path: string; error: null } | { path: null; error: string };

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/aac",
  "audio/flac",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
  "application/json",
  "application/xml",
]);

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `Файл слишком большой. Максимум 50 МБ, а этот — ${(file.size / 1024 / 1024).toFixed(1)} МБ.`;
  }
  if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/")) {
    return `Тип файла "${file.type}" не поддерживается.`;
  }
  return null;
}

export async function uploadFile(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  const validationError = validateFile(file);
  if (validationError) {
    return { path: null, error: validationError };
  }

  // Генерируем уникальный путь: userId/timestamp.ext
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${timestamp}-${random}.${ext}`;

  // Supabase JS SDK пока не поддерживает onUploadProgress на клиенте напрямую,
  // но мы симулируем прогресс через имитацию (или используем XMLHttpRequest).
  // Используем стандартный upload с обратным вызовом через таймеры.
  if (onProgress) onProgress(10);

  const { error } = await supabase.storage.from("chat-files").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (onProgress) onProgress(90);

  if (error) {
    return { path: null, error: error.message };
  }

  if (onProgress) onProgress(100);
  return { path, error: null };
}

/** Получить подписанную ссылку для файла (используется при отображении) */
export async function getFileUrl(filePath: string): Promise<string | null> {
  if (!filePath) return null;
  const { data, error } = await supabase.storage.from("chat-files").createSignedUrl(filePath, 3600); // 1 час
  if (error || !data) return null;
  return data.signedUrl;
}

/** Получить публичную ссылку (если bucket станет публичным) */
export function getPublicUrl(filePath: string): string | null {
  if (!filePath) return null;
  const { data } = supabase.storage.from("chat-files").getPublicUrl(filePath);
  return data?.publicUrl ?? null;
}

/** Форматировать размер файла для отображения */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

/** Удалить файл из Storage */
export async function deleteFile(filePath: string): Promise<string | null> {
  const { error } = await supabase.storage.from("chat-files").remove([filePath]);
  if (error) return error.message;
  return null;
}
