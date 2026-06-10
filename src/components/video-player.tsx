import { useEffect, useRef, useState, useCallback } from "react";
import { Pause, Play, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  fileName: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ src, fileName }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const el: HTMLVideoElement = video;
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
      setError("Не удалось загрузить видео");
    }

    el.addEventListener("loadedmetadata", onLoad);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

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

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
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
    const el = videoRef.current;
    if (!el) return;
    const time = Number(e.target.value);
    el.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = videoRef.current;
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

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    if (fullscreen) {
      await document.exitFullscreen();
      setFullscreen(false);
    } else {
      await container.requestFullscreen();
      setFullscreen(true);
    }
  }, [fullscreen]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border-2 border-ink bg-black shadow-chunky-sm"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        className="block w-full max-h-96 object-contain cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        playsInline
      />

      {/* Имя файла сверху */}
      <div
        className={`absolute left-0 right-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-3 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <p className="truncate text-xs font-bold text-white" title={fileName}>
          🎬 {fileName}
        </p>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground">
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}

      {/* Центральная кнопка Play */}
      {!playing && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/60 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:scale-110"
            aria-label="Воспроизвести"
          >
            <Play className="h-8 w-8 ml-1" />
          </button>
        </div>
      )}

      {/* Нижняя панель управления */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Прогресс-бар */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/80">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span className="text-[10px] font-bold text-white/80">{formatTime(duration)}</span>
        </div>

        {/* Кнопки */}
        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
            aria-label={playing ? "Пауза" : "Воспроизвести"}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          <button
            onClick={toggleMute}
            className="grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
            aria-label={muted ? "Включить звук" : "Выключить звук"}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            title="Громкость"
          />

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            className="grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
            aria-label={fullscreen ? "Свернуть" : "На весь экран"}
          >
            {fullscreen ? (
              <Minimize className="h-3.5 w-3.5" />
            ) : (
              <Maximize className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
