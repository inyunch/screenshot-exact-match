import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LakeRow = Database["public"]["Tables"]["lakes"]["Row"];
export type NearestSource = Database["public"]["Tables"]["nearest_sources"]["Row"];

const SUMMARY_COLUMNS =
  "lake_id,name,county,lat,lon,acres,risk_tier,risk_rank,n_launches,nearest_infested_km,infested_within_25km,flag_clarity_rising,chl_mean,chl_percentile,chl_slope,septic_screen";

export type LakeSummary = Pick<
  LakeRow,
  | "lake_id"
  | "name"
  | "county"
  | "lat"
  | "lon"
  | "acres"
  | "risk_tier"
  | "risk_rank"
  | "n_launches"
  | "nearest_infested_km"
  | "infested_within_25km"
  | "flag_clarity_rising"
  | "chl_mean"
  | "chl_percentile"
  | "chl_slope"
  | "septic_screen"
>;

const PAGE = 1000; // the database returns at most 1000 rows per request

async function fetchAllLakes(): Promise<LakeSummary[]> {
  const { count, error: countError } = await supabase
    .from("lakes")
    .select("lake_id", { count: "exact", head: true });
  if (countError) throw countError;
  const total = count ?? 0;
  const pages = Array.from({ length: Math.ceil(total / PAGE) }, (_, i) => i * PAGE);
  const results = await Promise.all(
    pages.map(async (from) => {
      const { data, error } = await supabase
        .from("lakes")
        .select(SUMMARY_COLUMNS)
        .order("lake_id")
        .range(from, from + PAGE - 1);
      if (error) throw error;
      return (data ?? []) as LakeSummary[];
    }),
  );
  return results.flat();
}

export const allLakesQuery = queryOptions({
  queryKey: ["lakes", "summary"],
  queryFn: fetchAllLakes,
  staleTime: Infinity,
});

export type MetricKey =
  | "test_auc"
  | "precision_top_25"
  | "base_rate"
  | "lift_top_25"
  | "share_new_in_top_10pct"
  | "n_new_infested_test"
  | "n_candidates_test"
  | "egle_survey_auc"
  | "egle_survey_n_lakes"
  | "n_lakes"
  | "n_infested_now"
  | "chosen_beta";
export type Metrics = { [K in MetricKey]?: number | undefined };

export const metricsQuery = queryOptions({
  queryKey: ["metrics"],
  queryFn: async () => {
    const { data, error } = await supabase.from("metrics").select("key,value");
    if (error) throw error;
    const out: Metrics = {};
    for (const r of data ?? []) if (r.value != null) out[r.key as MetricKey] = r.value;
    return out;
  },
  staleTime: Infinity,
});

export const lakeDetailQuery = (lakeId: string) =>
  queryOptions({
    queryKey: ["lake", lakeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lakes")
        .select("*")
        .eq("lake_id", lakeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });

export const nearestSourcesQuery = (lakeId: string) =>
  queryOptions({
    queryKey: ["nearest", lakeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nearest_sources")
        .select("*")
        .eq("lake_id", lakeId)
        .order("distance_km");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: Infinity,
  });
