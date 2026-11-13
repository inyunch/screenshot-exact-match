import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
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
const LINE_COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#17becf", "#7f7f7f"];
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

  const series = useMemo(() => {
    const byYear = new Map<number, Record<string, number | null>>();
    for (const r of MUSSEL_ROWS) {
      if (r.species !== species) continue;
      const row = byYear.get(r.year) ?? { year: r.year };
      row[areaKey(r)] = r.density;
      byYear.set(r.year, row);
    }
    return [...byYear.values()].sort((x, y) => (x["year"] as number) - (y["year"] as number));
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
          <h2 className="text-xl font-semibold">Density over time by lake and area</h2>
          <p className="text-sm text-muted-foreground">
            {species} mussels per m² in each survey year. The dashed line marks the chosen year.
          </p>
        </div>
        <div className="h-[420px] rounded-xl border border-border bg-card p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" type="number" domain={[YEARS[0]!, YEARS[YEARS.length - 1]!]} tickCount={10} allowDecimals={false} label={{ value: "Year", position: "insideBottom", offset: -10 }} />
              <YAxis tickFormatter={(v: number) => v.toLocaleString("en-US")} label={{ value: "Mussels per m²", angle: -90, position: "insideLeft", offset: 0 }} width={80} />
              <RTooltip formatter={(v, name) => [fmtD(v as number | null), String(name).replace("|", " — ")]} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} formatter={(v: string) => v.replace("|", " — ")} />
              <ReferenceLine x={year} stroke="var(--primary)" strokeDasharray="4 4" />
              {AREAS.map((a, i) => (
                <Line key={a.key} dataKey={a.key} name={a.key} type="monotone" connectNulls stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
