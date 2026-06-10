import { useRef, useState, useCallback } from "react";
import { Paperclip, X, FileIcon, AlertTriangle } from "lucide-react";
import { validateFile, formatFileSize } from "@/lib/upload-file";

interface AttachmentUploadProps {
  /** Вызывается, когда пользователь выбирает файлы для прикрепления */
  onFilesSelected: (files: File[]) => void;
  /** Вызывается при ошибке валидации */
  onError: (error: string) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function AttachmentUpload({
  onFilesSelected,
  onError,
  disabled,
  maxFiles = 5,
}: AttachmentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File[]>([]);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      e.target.value = "";

      // Валидация: проверяем каждый файл
      for (const f of files) {
        const err = validateFile(f);
        if (err) {
          onError(err);
          return;
        }
      }

      setSelected((prev) => {
        const combined = [...prev, ...files].slice(0, maxFiles);
        return combined;
      });
    },
    [maxFiles, onError],
  );

  const removeFile = useCallback((index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const confirmSelection = useCallback(() => {
    if (selected.length === 0) return;
    onFilesSelected(selected);
    setSelected([]);
  }, [selected, onFilesSelected]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/zip,application/x-rar-compressed,application/json,application/xml"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || selected.length >= maxFiles}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5 hover:bg-muted disabled:opacity-40"
        title="Прикрепить файл"
        aria-label="Прикрепить файл"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      {/* Список выбранных файлов */}
      {selected.length > 0 && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-80 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
          <p className="mb-2 text-xs font-bold text-muted-foreground">
            Выбрано файлов: {selected.length}
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selected.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-xl border-2 border-ink bg-background p-2"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-muted">
                  <FileIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-ink bg-background shadow-chunky-sm hover:bg-destructive/15"
                  title="Удалить"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={confirmSelection}
              className="flex-1 rounded-lg border-2 border-ink bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground shadow-chunky-sm"
            >
              Прикрепить
            </button>
            <button
              onClick={() => setSelected([])}
              className="rounded-lg border-2 border-ink bg-background px-2.5 py-1.5 text-xs font-bold shadow-chunky-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
