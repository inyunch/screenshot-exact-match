import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  HEAT_STOPS,
  MUSSEL_ROWS,
  allYears,
  areaKey,
  heatColor,
  latestAsOf,
} from "@/lib/mussel-rules";
import { escapeHtml } from "@/lib/lake-rules";
import { MapPanel } from "./MapPanel";
import type { MapArea } from "./LakeMap";
import shapes from "@/data/great-lakes-areas.json";

const SHAPES = (shapes as { features: { properties: { key: string }; geometry: GeoJSON.Geometry }[] }).features.filter(
  (f) => f.properties.key !== "Erie|Lakewide",
);
import { Notice } from "./Notice";

const YEARS = allYears(MUSSEL_ROWS);
const AREAS = [...new Map(MUSSEL_ROWS.map((r) => [areaKey(r), r])).values()]
  .map((r) => ({ key: areaKey(r), lake: r.lake, area: r.area }))
  .sort((a, b) => a.key.localeCompare(b.key));
const fmtD = (d: number | null) => (d == null ? "not reported" : `${d.toLocaleString("en-US")} /m²`);

export function QuaggaTab() {
  const [species, setSpecies] = useState<"Quagga" | "Zebra">("Quagga");
  const [idx, setIdx] = useState(YEARS.length - 1);
  const year = YEARS[idx]!;

  const latest = useMemo(() => latestAsOf(MUSSEL_ROWS, species, year), [species, year]);

  const areas = useMemo<MapArea[]>(
    () =>
      SHAPES.map((f) => {
        const r = latest.get(f.properties.key);
        const [lake, area] = f.properties.key.split("|") as [string, string];
        return {
          id: f.properties.key,
          geometry: f.geometry,
          color: r ? heatColor(r.density) : "#ffffff",
          tooltip: r
            ? `<strong>Lake ${escapeHtml(lake)} — ${escapeHtml(area)}</strong>` +
              `${escapeHtml(species)} density: ${escapeHtml(fmtD(r.density))}<br/>` +
              `<span>Survey year:</span> ${r.year}${r.year !== year ? " (latest available)" : ""}<br/>` +
              `<span>Status:</span> ${escapeHtml(r.status.replace(/_/g, " "))}`
            : `<strong>Lake ${escapeHtml(lake)} — ${escapeHtml(area)}</strong>No survey by ${year}`,
        };
      }),
    [latest, species, year],
  );

  const grid = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const r of MUSSEL_ROWS) if (r.species === species) m.set(`${areaKey(r)}|${r.year}`, r.density);
    return m;
  }, [species]);

  return (
    <div className="space-y-6">
      <Notice variant="info">
        Great Lakes mussel density (mussels per square meter) by lake and area. Each area shows its most recent
        survey at or before the chosen year.
      </Notice>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Species</label>
          <ToggleGroup
            type="single"
            value={species}
            onValueChange={(v) => v && setSpecies(v as "Quagga" | "Zebra")}
            className="justify-start gap-1.5"
          >
            {(["Quagga", "Zebra"] as const).map((s) => (
              <ToggleGroupItem
                key={s}
                value={s}
                variant="outline"
                size="sm"
                className="rounded-full bg-card px-3 data-[state=on]:border-primary data-[state=on]:bg-accent"
              >
                {s} mussel
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium text-muted-foreground">Year</label>
            <span className="text-2xl font-semibold text-primary">{year}</span>
          </div>
          <Slider
            aria-label="Year"
            min={0}
            max={YEARS.length - 1}
            step={1}
            value={[idx]}
            onValueChange={(v) => setIdx(v[0] ?? 0)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{YEARS[0]}</span>
            <span>{YEARS[YEARS.length - 1]}</span>
          </div>
        </div>
      </div>

      <MapPanel
        points={[]}
        areas={areas}
        bounds={[[41.4, -92.1], [49.0, -75.8]]}
        heightClass="h-[480px] sm:h-[640px]"
        footer={`${latest.size} areas with a survey by ${year} · Erie basins shown separately`}
        legend={[
          ...HEAT_STOPS.map((s) => ({ label: `${s.label} /m²`, color: s.color })),
          { label: "Not reported", color: heatColor(null) },
          { label: "No survey yet", color: "#ffffff" },
        ]}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Density heat map by lake and area</h2>
          <p className="text-sm text-muted-foreground">
            {species} mussels per m² for every survey year. The chosen year is outlined.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
          <table className="border-separate border-spacing-0.5 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card pr-3 text-left font-medium text-muted-foreground">Lake / area</th>
                {YEARS.map((y) => (
                  <th key={y} className={`px-1 font-medium ${y === year ? "text-primary" : "text-muted-foreground"}`}>
                    {String(y).slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AREAS.map((a) => (
                <tr key={a.key}>
                  <td className="sticky left-0 whitespace-nowrap bg-card pr-3">
                    <span className="font-medium">{a.lake}</span>{" "}
                    <span className="text-muted-foreground">{a.area}</span>
                  </td>
                  {YEARS.map((y, i) => {
                    const k = `${a.key}|${y}`;
                    const has = grid.has(k);
                    const d = grid.get(k) ?? null;
                    return (
                      <td
                        key={y}
                        title={has ? `${a.lake} ${a.area}, ${y}: ${fmtD(d)}` : `${y}: no survey`}
                        onClick={() => setIdx(i)}
                        className={`h-7 w-9 cursor-pointer rounded-sm text-center text-[10px] ${y === year ? "ring-2 ring-primary" : ""}`}
                        style={{ backgroundColor: has ? heatColor(d) : "transparent", color: d != null && d >= 5000 ? "#fff" : undefined }}
                      >
                        {has && d != null && d >= 1000 ? `${Math.round(d / 100) / 10}k` : has && d != null ? Math.round(d) : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
