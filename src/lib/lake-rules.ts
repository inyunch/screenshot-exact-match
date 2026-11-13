// Display rules for Lake Invasion Risk Radar. The app never calculates risk; these helpers
// only filter, sort and format the precomputed values stored in the database.

export const TIERS = ["Very high", "High", "Medium", "Low", "Already infested"] as const;
export type Tier = (typeof TIERS)[number];

export const DEFAULT_TIERS: Tier[] = ["Very high", "High", "Already infested"];

/** Map palette from the project brief (data-viz colors, used on the map, legend and badges). */
export const TIER_COLORS: Record<Tier, string> = {
  "Very high": "#C81E2D",
  High: "#F0781E",
  Medium: "#F0C83C",
  Low: "#78AAC8",
  "Already infested": "#5A5A5A",
};

export const SEPTIC_LEVELS = ["High", "Elevated", "Low"] as const;
export type SepticLevel = (typeof SEPTIC_LEVELS)[number] | "No data";
export const SEPTIC_COLORS: Record<SepticLevel, string> = {
  High: "#9640A0",
  Elevated: "#D28CDC",
  Low: "#AAC8AA",
  "No data": "#C8C8C8",
};

export function septicColor(screen: string | null) {
  return SEPTIC_COLORS[(screen ?? "No data") as SepticLevel] ?? SEPTIC_COLORS["No data"];
}

export const DEFAULT_LAKE_ID = "MI39004400"; // Morrow Lake (Kalamazoo)

const SEPTIC_EXCLUDED_WORDS = ["no name", "sewage", "lagoon", "treatment", "wastewater", "disposal"];

export function lakeLabel(l: { name: string | null; county: string | null }) {
  return `${l.name ?? "Unnamed lake"} (${l.county ?? "Unknown"})`;
}

/** Septic screening only shows named lakes of 25+ acres that have an algae level. */
export function isSepticEligible(l: {
  name: string | null;
  acres: number | null;
  chl_mean: number | null;
}) {
  if ((l.acres ?? 0) < 25 || l.chl_mean == null) return false;
  const name = (l.name ?? "").toLowerCase();
  return !SEPTIC_EXCLUDED_WORDS.some((w) => name.includes(w));
}

/** Lakes with the lowest statewide risk_rank (1 = highest survey priority). */
export function topSurveyPriorities<
  T extends { risk_rank: number | null; county: string | null },
>(lakes: T[], county: string | null, n = 25): T[] {
  return lakes
    .filter((l) => l.risk_rank != null && (!county || l.county === county))
    .sort((a, b) => (a.risk_rank as number) - (b.risk_rank as number))
    .slice(0, n);
}

export function topByAlgae<
  T extends { chl_mean: number | null; county: string | null; name: string | null; acres: number | null },
>(lakes: T[], county: string | null, n = 50): T[] {
  return lakes
    .filter((l) => isSepticEligible(l) && (!county || l.county === county))
    .sort((a, b) => (b.chl_mean as number) - (a.chl_mean as number))
    .slice(0, n);
}

/** "8 / 6,138", or "—" when the lake already has a record (no rank). */
export function formatRank(rank: number | null, total: number | null) {
  if (rank == null) return "—";
  const t = total != null ? ` / ${Math.round(total).toLocaleString("en-US")}` : "";
  return `${rank.toLocaleString("en-US")}${t}`;
}

/** "+0.25 m/yr" */
export function formatTrend(slope: number | null, unit = "m/yr") {
  if (slope == null || Number.isNaN(slope)) return "—";
  return `${slope >= 0 ? "+" : ""}${slope.toFixed(2)} ${unit}`;
}

export function infestationRecordText(zmYear: number | null, ssYear: number | null) {
  const parts: string[] = [];
  if (zmYear != null) parts.push(`zebra mussel ${zmYear}`);
  if (ssYear != null) parts.push(`starry stonewort ${ssYear}`);
  return `USGS record: ${parts.join(", ")}.`;
}

/** Circle radius in pixels; grows with lake area. */
export function radiusForAcres(acres: number | null) {
  const a = Math.max(acres ?? 1, 1);
  return Math.min(16, 2.5 + Math.log10(a) * 2.6);
}

export function fmt(n: number | null | undefined, digits = 0) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}
