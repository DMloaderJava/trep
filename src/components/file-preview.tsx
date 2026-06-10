import { useEffect, useState } from "react";
import {
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File as FileIcon,
  Download,
} from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { VideoPlayer } from "@/components/video-player";
import { getFileUrl } from "@/lib/upload-file";

interface FilePreviewProps {
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/aac",
  "audio/flac",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function getFileIcon(fileType: string) {
  if (fileType === "application/pdf") return FileText;
  if (fileType.startsWith("text/")) return FileText;
  if (
    fileType.startsWith("application/zip") ||
    fileType.includes("rar") ||
    fileType.includes("tar") ||
    fileType.includes("7z")
  )
    return FileArchive;
  if (fileType.startsWith("application/json") || fileType === "application/xml") return FileCode;
  if (fileType.startsWith("application/") || fileType.startsWith("text/")) return FileText;
  return FileIcon;
}

export function FilePreview({ filePath, fileName, fileType, fileSize }: FilePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFileUrl(filePath).then((signedUrl) => {
      if (cancelled) return;
      if (signedUrl) {
        setUrl(signedUrl);
      } else {
        setError("Не удалось загрузить файл");
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
          <FileIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold">{fileName}</p>
          <p className="text-xs text-destructive">{error ?? "Недоступен"}</p>
        </div>
      </div>
    );
  }

  // Image preview
  if (IMAGE_TYPES.has(fileType)) {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-chunky-sm">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img src={url} alt={fileName} className="max-h-80 w-full object-contain" loading="lazy" />
        </a>
        <div className="flex items-center justify-between border-t-2 border-ink bg-muted p-2">
          <p className="truncate text-xs font-bold text-muted-foreground">{fileName}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="grid h-7 w-7 place-items-center rounded-lg border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5"
            title="Скачать"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Audio player
  if (AUDIO_TYPES.has(fileType)) {
    return <AudioPlayer src={url} fileName={fileName} />;
  }

  // Video player
  if (VIDEO_TYPES.has(fileType)) {
    return <VideoPlayer src={url} fileName={fileName} />;
  }

  // Other files — download card
  const FileIconComponent = getFileIcon(fileType);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm transition hover:-translate-y-0.5"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-background shadow-chunky-sm">
        <FileIconComponent className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold">{fileName}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
      </div>
      <Download className="h-5 w-5 shrink-0 text-muted-foreground" />
    </a>
  );
}
