import { TIER_COLORS, type Tier } from "@/lib/lake-rules";

export function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function TierBadge({ tier }: { tier: string | null }) {
  const color = TIER_COLORS[(tier ?? "") as Tier];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium">
      {color && <ColorDot color={color} />}
      {tier ?? "—"}
    </span>
  );
}
