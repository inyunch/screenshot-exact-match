import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { agentChat } from "@/lib/agent.functions";
import {
  fmt,
  formatRank,
  formatTrend,
  infestationRecordText,
  lakeLabel,
} from "@/lib/lake-rules";
import { allLakesQuery, lakeDetailQuery, metricsQuery, nearestSourcesQuery } from "@/lib/lakes-data";
import { LakePicker } from "./LakePicker";
import { Markdown } from "./Markdown";
import { Notice } from "./Notice";
import { StatCard } from "./StatCard";
import { TierBadge } from "./TierBadge";

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023] as const;

export function LakeDetailTab({
  lakeId,
  onChangeLake,
}: {
  lakeId: string;
  onChangeLake: (id: string) => void;
}) {
  const lakes = useQuery(allLakesQuery);
  const metrics = useQuery(metricsQuery);
  const lake = useQuery(lakeDetailQuery(lakeId));
  const sources = useQuery(nearestSourcesQuery(lakeId));
  const ask = useServerFn(agentChat);

  const [answer, setAnswer] = useState<string | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    setAnswer(null);
    setAskError(null);
  }, [lakeId]);

  const l = lake.data;
  const label = l ? lakeLabel(l) : lake.isLoading ? "Loading…" : "Choose a lake";
  const rankedTotal =
    metrics.data?.n_lakes != null && metrics.data?.n_infested_now != null
      ? metrics.data.n_lakes - metrics.data.n_infested_now
      : null;

  const secchi = l
    ? YEARS.map((y) => ({ year: y, value: l[`secchi_${y}` as `secchi_${typeof y}`] }))
    : [];
  const hasSecchi = secchi.some((d) => d.value != null);

  async function askAgent() {
    if (!l) return;
    setAsking(true);
    setAskError(null);
    setAnswer(null);
    try {
      const res = await ask({
        data: {
          message: `Tell me about ${l.name}, ${l.county} County, and give me an action plan.`,
        },
      });
      if (res.error) setAskError(res.error);
      else setAnswer(res.answer ?? "");
    } catch {
      setAskError("Couldn't reach the agent. Please try again.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-6">
      <LakePicker lakes={lakes.data ?? []} value={lakeId} currentLabel={label} onChange={onChangeLake} />

      {lake.isError && <p className="text-sm text-destructive">Couldn't load this lake.</p>}
      {!lake.isLoading && !l && !lake.isError && (
        <p className="text-sm text-muted-foreground">Lake not found. Pick another lake above.</p>
      )}

      {l && (
        <>
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{label}</h2>
            <p className="text-sm text-muted-foreground">
              {fmt(l.acres)} acres
              {l.ais_survey_year ? ` · EGLE early-detection survey in ${l.ais_survey_year}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Risk level" value={<TierBadge tier={l.risk_tier} />} />
            <StatCard label="Statewide rank" value={formatRank(l.risk_rank, rankedTotal)} />
            <StatCard label="Boat launches" value={fmt(l.n_launches)} />
            <StatCard
              label="Nearest infested lake"
              value={l.nearest_infested_km != null ? `${fmt(l.nearest_infested_km, 1)} km` : "—"}
            />
          </div>

          {l.infested && (
            <Notice variant="warning">
              {infestationRecordText(l.zm_first_year, l.ss_first_year)} This lake is a potential source for
              nearby lakes.
            </Notice>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            Risk level is a group based on statewide rank (Very high = top 2%). It is not a probability of
            invasion. Survey priority from public data, not a detection result.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">5 nearest infested lakes</h3>
              <div className="rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lake</TableHead>
                      <TableHead>County</TableHead>
                      <TableHead className="text-right">km</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead className="text-right">First record</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(sources.data ?? []).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="whitespace-nowrap font-medium">{s.source_name}</TableCell>
                        <TableCell>{s.source_county}</TableCell>
                        <TableCell className="text-right">{fmt(s.distance_km, 1)}</TableCell>
                        <TableCell className="whitespace-nowrap">{s.species}</TableCell>
                        <TableCell className="text-right">{s.first_year ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                    {sources.isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                          Loading…
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold">Water clarity (Secchi depth, m)</h3>
                <p className="text-xs text-muted-foreground">Satellite estimate, screening proxy</p>
              </div>
              <div className="h-56 rounded-xl border border-border bg-card p-3">
                {hasSecchi ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={secchi} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                      <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                      <YAxis
                        tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                        domain={["auto", "auto"]}
                        unit=" m"
                      />
                      <Tooltip
                        formatter={(v: number) => [`${v?.toFixed(2)} m`, "Secchi depth"]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: "var(--color-primary)" }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No satellite clarity data for this lake.
                  </div>
                )}
              </div>
              {hasSecchi && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Trend: <span className="font-semibold text-foreground">{formatTrend(l.secchi_slope)}</span>.
                  Rising clarity is one pattern zebra mussels can cause, but it has other causes.
                </p>
              )}
            </section>
          </div>

          <section className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <Button onClick={askAgent} disabled={asking} size="lg" className="w-full sm:w-auto">
              {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Ask the agent about {l.name}
            </Button>
            {asking && (
              <p className="text-sm text-muted-foreground">
                IBM Granite agent is calling its tools… this can take 10–30 seconds.
              </p>
            )}
            {askError && <p className="text-sm text-destructive">{askError}</p>}
            {answer != null && (
              <div className="rounded-lg border border-border bg-card p-4">
                <Markdown>{answer || "_The agent returned an empty answer._"}</Markdown>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
