import { useEffect, useRef, useState, useCallback } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  fileName: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, fileName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const el: HTMLAudioElement = audio;
    let cancelled = false;

    function onLoad() {
      if (cancelled) return;
      setLoading(false);
      setDuration(el.duration || 0);
    }
    function onTimeUpdate() {
      if (cancelled) return;
      setCurrentTime(el.currentTime);
    }
    function onEnded() {
      if (cancelled) return;
      setPlaying(false);
      setCurrentTime(0);
    }
    function onError() {
      if (cancelled) return;
      setLoading(false);
      setError("Не удалось загрузить аудио");
    }

    el.addEventListener("loadedmetadata", onLoad);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    // Если аудио уже загружено
    if (el.readyState >= 2) {
      onLoad();
    }

    return () => {
      cancelled = true;
      el.removeEventListener("loadedmetadata", onLoad);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => setError("Не удалось воспроизвести"));
      setPlaying(true);
    }
  }, [playing]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    const time = Number(e.target.value);
    el.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleMute = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = audioRef.current;
      if (!el) return;
      const v = Number(e.target.value);
      el.volume = v;
      setVolume(v);
      if (v === 0) {
        el.muted = true;
        setMuted(true);
      } else if (muted) {
        el.muted = false;
        setMuted(false);
      }
    },
    [muted],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl border-2 border-ink bg-card p-3 shadow-chunky-sm">
      {/* Невидимый <audio> элемент */}
      <audio ref={audioRef} preload="metadata" src={src} />

      {/* Имя файла */}
      <p className="mb-2 truncate text-xs font-bold text-muted-foreground" title={fileName}>
        🎵 {fileName}
      </p>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <>
          {/* Основные кнопки и прогресс */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={loading}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5 disabled:opacity-50"
              title={playing ? "Пауза" : "Воспроизвести"}
              aria-label={playing ? "Пауза" : "Воспроизвести"}
            >
              {loading ? (
                <span className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground" />
              ) : playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            {/* Прогресс-бар */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-chunky-sm"
              title="Перемотка"
            />

            <span className="w-16 text-right text-xs font-bold text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Громкость */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-ink bg-background shadow-chunky-sm transition hover:-translate-y-0.5"
              title={muted ? "Включить звук" : "Выключить звук"}
              aria-label={muted ? "Включить звук" : "Выключить звук"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary"
              title="Громкость"
            />
          </div>
        </>
      )}
    </div>
  );
}
