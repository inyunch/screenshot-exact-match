import { describe, expect, it } from "vitest";
import { heatColor, latestAsOf, type MusselRow } from "@/lib/mussel-rules";

const r = (year: number, density: number | null): MusselRow => ({
  lake: "Erie", area: "Western basin", year, species: "Quagga", density, se: null, status: "measured", source: "",
});

describe("mussel rules", () => {
  it("uses the latest record at or before the slider year", () => {
    const m = latestAsOf([r(1992, 1), r(2004, 500), r(2014, 900)], "Quagga", 2010);
    expect(m.get("Erie|Western basin")?.year).toBe(2004);
  });
  it("shows nothing before the first survey", () => {
    expect(latestAsOf([r(1992, 1)], "Quagga", 1990).size).toBe(0);
  });
  it("colors by density band", () => {
    expect(heatColor(0)).toBe("#e8f1f5");
    expect(heatColor(5)).toBe("#fde9a8");
    expect(heatColor(1500)).toBe("#e8613a");
    expect(heatColor(9500)).toBe("#a8213a");
    expect(heatColor(null)).toBe("#b8bec4");
  });
});
