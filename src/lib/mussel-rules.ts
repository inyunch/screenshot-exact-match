import raw from "@/data/mussel-density.json";

export type MusselRow = {
  lake: string;
  area: string;
  year: number;
  species: "Quagga" | "Zebra";
  density: number | null;
  se: number | null;
  status: string;
  source: string;
};
export const MUSSEL_ROWS = raw as MusselRow[];

export const AREA_COORDS: Record<string, [number, number]> = {
  "Erie|Western basin": [41.75, -83.0],
  "Erie|Central basin": [41.95, -81.6],
  "Erie|Eastern basin": [42.5, -79.9],
  "Huron|Main basin": [44.8, -82.4],
  "Michigan|Lakewide, excluding Green Bay": [43.8, -87.0],
  "Ontario|Lakewide": [43.65, -77.8],
  "Superior|Canadian nearshore monitoring sites": [48.45, -87.6],
  "Superior|EPA open-lake monitoring sites": [47.4, -88.6],
};

export const areaKey = (r: { lake: string; area: string }) => `${r.lake}|${r.area}`;

/** All survey years in the file, ascending. */
export function allYears(rows: MusselRow[]): number[] {
  return [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
}

/** Latest record per lake/area at or before `year` for one species. */
export function latestAsOf(rows: MusselRow[], species: string, year: number): Map<string, MusselRow> {
  const out = new Map<string, MusselRow>();
  for (const r of rows) {
    if (r.species !== species || r.year > year) continue;
    const k = areaKey(r);
    const cur = out.get(k);
    if (!cur || r.year > cur.year) out.set(k, r);
  }
  return out;
}

export const HEAT_STOPS = [
  { at: 0, color: "#e8f1f5", label: "0" },
  { at: 10, color: "#fde9a8", label: "10" },
  { at: 100, color: "#f9b45c", label: "100" },
  { at: 1000, color: "#e8613a", label: "1,000" },
  { at: 5000, color: "#a8213a", label: "5,000+" },
];

/** Color for a density per m²; null/unknown is grey. */
export function heatColor(d: number | null | undefined): string {
  if (d == null) return "#b8bec4";
  let c = HEAT_STOPS[0]!.color;
  for (const s of HEAT_STOPS) if (d >= s.at && (s.at > 0 ? true : d === 0 || d < 10)) c = s.color;
  if (d > 0 && d < 10) c = HEAT_STOPS[1]!.color;
  return c;
}
