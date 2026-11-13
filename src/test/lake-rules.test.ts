import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIERS,
  formatRank,
  formatTrend,
  infestationRecordText,
  isSepticEligible,
  topByAlgae,
  topSurveyPriorities,
} from "@/lib/lake-rules";

const lake = (o: Partial<{ name: string; county: string; acres: number; chl_mean: number | null; risk_rank: number | null }>) => ({
  name: "Test Lake",
  county: "Kalamazoo",
  acres: 100,
  chl_mean: 5 as number | null,
  risk_rank: null as number | null,
  ...o,
});

describe("septic screening eligibility", () => {
  it("requires at least 25 acres", () => {
    expect(isSepticEligible(lake({ acres: 24.9 }))).toBe(false);
    expect(isSepticEligible(lake({ acres: 25 }))).toBe(true);
  });
  it("requires an algae level", () => {
    expect(isSepticEligible(lake({ chl_mean: null }))).toBe(false);
  });
  it("excludes no-name and wastewater-type water bodies", () => {
    for (const name of ["No Name Lake", "Sewage Pond", "City Lagoon", "Treatment Pond", "Wastewater Basin", "Disposal Pond"]) {
      expect(isSepticEligible(lake({ name }))).toBe(false);
    }
  });
  it("top algae list is sorted by highest algae level and capped at 50", () => {
    const lakes = Array.from({ length: 60 }, (_, i) => lake({ name: `L${i}`, chl_mean: i }));
    const top = topByAlgae(lakes, null);
    expect(top).toHaveLength(50);
    expect(top[0].chl_mean).toBe(59);
  });
});

describe("top survey priorities", () => {
  it("returns the 25 lowest ranks, skipping infested lakes, within the county", () => {
    const lakes = [
      ...Array.from({ length: 30 }, (_, i) => lake({ risk_rank: 30 - i })),
      lake({ risk_rank: null }),
      lake({ risk_rank: 0.5, county: "Alcona" }),
    ];
    const top = topSurveyPriorities(lakes, "Kalamazoo");
    expect(top).toHaveLength(25);
    expect(top[0].risk_rank).toBe(1);
    expect(top.at(-1)?.risk_rank).toBe(25);
  });
});

describe("formatting", () => {
  it("shows statewide rank as '8 / 6,138' and a dash for infested lakes", () => {
    expect(formatRank(8, 6138)).toBe("8 / 6,138");
    expect(formatRank(null, 6138)).toBe("—");
  });
  it("shows clarity trend with sign", () => {
    expect(formatTrend(0.25)).toBe("+0.25 m/yr");
    expect(formatTrend(-0.1)).toBe("-0.10 m/yr");
  });
  it("lists the USGS record years", () => {
    expect(infestationRecordText(2007, 2019)).toBe("USGS record: zebra mussel 2007, starry stonewort 2019.");
    expect(infestationRecordText(2007, null)).toBe("USGS record: zebra mussel 2007.");
  });
  it("defaults the map to Very high, High and Already infested", () => {
    expect(DEFAULT_TIERS).toEqual(["Very high", "High", "Already infested"]);
  });
});
