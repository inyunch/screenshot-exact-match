import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { allLakesQuery, metricsQuery } from "@/lib/lakes-data";
import {
  DEFAULT_TIERS,
  TIERS,
  TIER_COLORS,
  escapeHtml,
  fmt,
  lakeLabel,
  radiusForAcres,
  topSurveyPriorities,
  type Tier,
} from "@/lib/lake-rules";
import { CountySelect } from "./CountySelect";
import { MapPanel } from "./MapPanel";
import type { MapPoint } from "./LakeMap";
import { Notice } from "./Notice";
import { StatCard } from "./StatCard";
import { ColorDot, TierBadge } from "./TierBadge";

export function RiskMapTab({ onOpenLake }: { onOpenLake: (id: string) => void }) {
  const lakes = useQuery(allLakesQuery);
  const metrics = useQuery(metricsQuery);
  const [county, setCounty] = useState<string | null>(null);
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);

  const counties = useMemo(
    () => [...new Set((lakes.data ?? []).map((l) => l.county).filter(Boolean) as string[])].sort(),
    [lakes.data],
  );

  const points = useMemo<MapPoint[]>(() => {
    const order = (t: string | null) => (t === "Already infested" ? 0 : TIERS.length - TIERS.indexOf(t as Tier));
    return (lakes.data ?? [])
      .filter(
        (l) =>
          l.lat != null &&
          l.lon != null &&
          tiers.includes(l.risk_tier as Tier) &&
          (!county || l.county === county),
      )
      .sort((a, b) => order(a.risk_tier) - order(b.risk_tier))
      .map((l) => ({
        id: l.lake_id,
        lat: l.lat as number,
        lon: l.lon as number,
        color: TIER_COLORS[l.risk_tier as Tier] ?? "#999999",
        radius: radiusForAcres(l.acres),
        tooltip:
          `<strong>${escapeHtml(lakeLabel(l))}</strong>` +
          `${escapeHtml(l.risk_tier ?? "")}${l.risk_rank != null ? ` · rank ${fmt(l.risk_rank)}` : ""}<br/>` +
          `<span>Boat launches:</span> ${fmt(l.n_launches)}<br/>` +
          `<span>Nearest infested lake:</span> ${fmt(l.nearest_infested_km, 1)} km<br/>` +
          `<span>Click for lake details</span>`,
      }));
  }, [lakes.data, tiers, county]);

  const top = useMemo(() => topSurveyPriorities(lakes.data ?? [], county, 25), [lakes.data, county]);

  const m = metrics.data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Inland lakes scored" value={fmt(m?.n_lakes)} />
        <StatCard label="With an infestation record" value={fmt(m?.n_infested_now)} />
        <StatCard
          label="Backtest AUC"
          value={m?.test_auc != null ? m.test_auc.toFixed(2) : "—"}
          hint="0.5 = coin flip, 1.0 = perfect"
        />
        <StatCard
          label="Top-25 hit rate"
          value={m?.precision_top_25 != null ? `${Math.round(m.precision_top_25 * 100)}%` : "—"}
          hint={`vs ${m?.base_rate != null ? (m.base_rate * 100).toFixed(1) + "%" : "the base rate"} for a random lake`}
          sub={m?.base_rate != null ? `vs ${(m.base_rate * 100).toFixed(1)}% for a random lake` : undefined}
        />
      </div>

      <Notice variant="info">
        Survey priority from public data, not a detection result. A lake with no record may already be
        infested and simply not reported.
      </Notice>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <CountySelect counties={counties} value={county} onChange={setCounty} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Risk level</label>
          <ToggleGroup
            type="multiple"
            value={tiers}
            onValueChange={(v) => setTiers(v as Tier[])}
            className="flex flex-wrap justify-start gap-1.5"
          >
            {TIERS.map((t) => (
              <ToggleGroupItem
                key={t}
                value={t}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full bg-card px-3 data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <ColorDot color={TIER_COLORS[t]} />
                {t}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <MapPanel
        points={points}
        loading={lakes.isLoading}
        onSelect={onOpenLake}
        legend={TIERS.map((t) => ({ label: t, color: TIER_COLORS[t] }))}
      />
      {lakes.isError && (
        <p className="text-sm text-destructive">Couldn't load lakes. Please refresh the page.</p>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Top survey priorities</h2>
          <p className="text-sm text-muted-foreground">
            The 25 highest-ranked lakes with no record{county ? ` in ${county} County` : " statewide"}. Click a
            row for details.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Rank</TableHead>
                <TableHead>Lake</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Acres</TableHead>
                <TableHead className="text-right">Boat launches</TableHead>
                <TableHead className="text-right">Nearest infested (km)</TableHead>
                <TableHead className="text-right">Infested lakes within 25 km</TableHead>
                <TableHead>Clarity rising</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((l) => (
                <TableRow key={l.lake_id} className="cursor-pointer" onClick={() => onOpenLake(l.lake_id)}>
                  <TableCell className="font-semibold">{l.risk_rank}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-primary">{l.name}</TableCell>
                  <TableCell>{l.county}</TableCell>
                  <TableCell>
                    <TierBadge tier={l.risk_tier} />
                  </TableCell>
                  <TableCell className="text-right">{fmt(l.acres)}</TableCell>
                  <TableCell className="text-right">{fmt(l.n_launches)}</TableCell>
                  <TableCell className="text-right">{fmt(l.nearest_infested_km, 1)}</TableCell>
                  <TableCell className="text-right">{fmt(l.infested_within_25km)}</TableCell>
                  <TableCell>{l.flag_clarity_rising ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
              {!lakes.isLoading && top.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                    No ranked lakes in this county.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
