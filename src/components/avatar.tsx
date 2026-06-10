import { useAvatarUrl } from "@/lib/use-avatar";

export function Avatar({
  path,
  nickname,
  size = 40,
  className = "",
}: {
  path?: string | null;
  nickname?: string | null;
  size?: number;
  className?: string;
}) {
  const url = useAvatarUrl(path);
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-accent font-bold text-sm ${className}`}
    >
      {url ? (
        <img src={url} alt={nickname ?? ""} className="h-full w-full object-cover" />
      ) : (
        (nickname?.[0] ?? "?").toUpperCase()
      )}
    </div>
  );
}
