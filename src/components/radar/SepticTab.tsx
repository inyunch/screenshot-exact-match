import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allLakesQuery } from "@/lib/lakes-data";
import {
  SEPTIC_COLORS,
  SEPTIC_LEVELS,
  escapeHtml,
  fmt,
  formatTrend,
  isSepticEligible,
  lakeLabel,
  radiusForAcres,
  topByAlgae,
} from "@/lib/lake-rules";
import { CountySelect } from "./CountySelect";
import { MapPanel } from "./MapPanel";
import type { MapPoint } from "./LakeMap";
import { Notice } from "./Notice";
import { ColorDot } from "./TierBadge";

const SCREEN_ORDER: Record<string, number> = { Low: 0, "No data": 0, Elevated: 1, High: 2 };

export function SepticTab({ onOpenLake }: { onOpenLake: (id: string) => void }) {
  const lakes = useQuery(allLakesQuery);
  const [county, setCounty] = useState<string | null>(null);

  const eligible = useMemo(() => (lakes.data ?? []).filter(isSepticEligible), [lakes.data]);
  const counties = useMemo(
    () => [...new Set(eligible.map((l) => l.county).filter(Boolean) as string[])].sort(),
    [eligible],
  );

  const points = useMemo<MapPoint[]>(
    () =>
      eligible
        .filter((l) => l.lat != null && l.lon != null && (!county || l.county === county))
        .sort((a, b) => (SCREEN_ORDER[a.septic_screen ?? ""] ?? 0) - (SCREEN_ORDER[b.septic_screen ?? ""] ?? 0))
        .map((l) => ({
          id: l.lake_id,
          lat: l.lat as number,
          lon: l.lon as number,
          color: SEPTIC_COLORS[l.septic_screen ?? "No data"] ?? SEPTIC_COLORS["No data"],
          radius: radiusForAcres(l.acres),
          tooltip:
            `<strong>${escapeHtml(lakeLabel(l))}</strong>` +
            `Screen: ${escapeHtml(l.septic_screen ?? "No data")}<br/>` +
            `<span>Algae level:</span> ${fmt(l.chl_mean, 1)} µg/L<br/>` +
            `<span>Statewide percentile:</span> ${fmt(l.chl_percentile)}`,
        })),
    [eligible, county],
  );

  const top = useMemo(() => topByAlgae(lakes.data ?? [], county, 50), [lakes.data, county]);

  return (
    <div className="space-y-6">
      <Notice variant="warning">
        Screening proxy only. Based on algae level (chlorophyll, satellite estimate 2018-2023) from EGLE.
        High algae can come from septic systems, farm runoff, lawn fertilizer or the lake's natural type.
        Shoreline housing density is not included yet.
      </Notice>

      <CountySelect counties={counties} value={county} onChange={setCounty} />

      <MapPanel
        points={points}
        loading={lakes.isLoading}
        onSelect={onOpenLake}
        legend={SEPTIC_LEVELS.map((s) => ({ label: s, color: SEPTIC_COLORS[s] }))}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Highest algae levels</h2>
          <p className="text-sm text-muted-foreground">
            Top 50 lakes of 25+ acres by algae level (chlorophyll, satellite estimate)
            {county ? ` in ${county} County` : ""}.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lake</TableHead>
                <TableHead>County</TableHead>
                <TableHead className="text-right">Acres</TableHead>
                <TableHead className="text-right">Algae level (µg/L)</TableHead>
                <TableHead className="text-right">Statewide percentile</TableHead>
                <TableHead className="text-right">Trend</TableHead>
                <TableHead>Screen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((l) => (
                <TableRow key={l.lake_id} className="cursor-pointer" onClick={() => onOpenLake(l.lake_id)}>
                  <TableCell className="whitespace-nowrap font-medium text-primary">{l.name}</TableCell>
                  <TableCell>{l.county}</TableCell>
                  <TableCell className="text-right">{fmt(l.acres)}</TableCell>
                  <TableCell className="text-right">{fmt(l.chl_mean, 1)}</TableCell>
                  <TableCell className="text-right">{fmt(l.chl_percentile)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatTrend(l.chl_slope, "µg/L/yr")}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <ColorDot color={SEPTIC_COLORS[l.septic_screen ?? "No data"] ?? SEPTIC_COLORS["No data"]} />
                      {l.septic_screen ?? "No data"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
