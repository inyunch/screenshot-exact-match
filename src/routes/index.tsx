import { createFileRoute } from "@tanstack/react-router";
import { Bot, Info, Flame, Droplets, Map as MapIcon, Waves } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AgentTab } from "@/components/radar/AgentTab";
import { LakeDetailTab } from "@/components/radar/LakeDetailTab";
import { RiskMapTab } from "@/components/radar/RiskMapTab";
import { QuaggaTab } from "@/components/radar/QuaggaTab";
import { ProjectTab } from "@/components/radar/ProjectTab";
import { SepticTab } from "@/components/radar/SepticTab";
import { DEFAULT_LAKE_ID } from "@/lib/lake-rules";

const TABS = ["project", "map", "quagga", "lake", "septic", "agent"] as const;
type TabKey = (typeof TABS)[number];

type Search = { tab?: TabKey | undefined; lake?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: TABS.includes(s["tab"] as TabKey) ? (s["tab"] as TabKey) : undefined,
    lake:
      typeof s["lake"] === "string" && /^[A-Z0-9]{4,20}$/.test(s["lake"]) ? s["lake"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lake Invasion Risk Radar — Michigan survey priorities" },
      {
        name: "description",
        content:
          "Which Michigan inland lakes should volunteers survey first for zebra mussels and starry stonewort? Survey priority from USGS, DNR and EGLE public data.",
      },
      { property: "og:title", content: "Lake Invasion Risk Radar" },
      {
        property: "og:description",
        content:
          "Survey priorities for zebra mussels and starry stonewort across 6,524 Michigan inland lakes, explained by an IBM Granite agent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TAB_META: { key: TabKey; label: string; icon: typeof MapIcon }[] = [
  { key: "project", label: "Project", icon: Info },
  { key: "map", label: "Risk map", icon: MapIcon },
  { key: "quagga", label: "Quagga Infestation", icon: Flame },
  { key: "lake", label: "Lake detail", icon: Waves },
  { key: "septic", label: "Septic screening", icon: Droplets },
  { key: "agent", label: "Ask the agent", icon: Bot },
];

function Index() {
  const { tab = "project", lake = DEFAULT_LAKE_ID } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setTab = (t: string) =>
    navigate({ search: (prev) => ({ ...prev, tab: t as TabKey }), replace: true, resetScroll: false });
  const openLake = (id: string) => {
    navigate({ search: { tab: "lake", lake: id }, resetScroll: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const changeLake = (id: string) =>
    navigate({ search: (prev) => ({ ...prev, tab: "lake", lake: id }), replace: true, resetScroll: false });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <header className="hero-water border-b border-border">
          <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-water-deep">
              <Waves className="h-4 w-4" aria-hidden />
              Michigan inland lakes
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Lake Invasion Risk Radar
            </h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/80 sm:text-lg">
              Which Michigan inland lakes should volunteers survey first for zebra mussels and starry
              stonewort?
            </p>
            <p className="mt-2 max-w-2xl text-xs text-muted-foreground sm:text-sm">
              Scores from USGS, Michigan DNR and EGLE public data. Explained by an IBM watsonx Orchestrate
              agent running IBM Granite.
            </p>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="sticky top-0 z-[1000] border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <TabsList className="tab-rail h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0">
                {TAB_META.map(({ key, label, icon: Icon }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="shrink-0 gap-2 rounded-none border-b-2 border-transparent px-3 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <TabsContent value="project" className="mt-0">
              <ProjectTab />
            </TabsContent>
            <TabsContent value="map" className="mt-0">
              <RiskMapTab onOpenLake={openLake} />
            </TabsContent>
            <TabsContent value="quagga" className="mt-0">
              <QuaggaTab />
            </TabsContent>
            <TabsContent value="lake" className="mt-0">
              <LakeDetailTab lakeId={lake} onChangeLake={changeLake} />
            </TabsContent>
            <TabsContent value="septic" className="mt-0">
              <SepticTab onOpenLake={openLake} />
            </TabsContent>
            <TabsContent value="agent" className="mt-0" forceMount hidden={tab !== "agent"}>
              <AgentTab />
            </TabsContent>
          </main>
        </Tabs>

        <footer className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-muted-foreground sm:px-6">
            Data: USGS Nonindigenous Aquatic Species database (downloaded 2026-11-13); Michigan DNR Boating
            Access Sites; EGLE Michigan Inland Lakes Water Clarity 2018-2023; EGLE AIS early-detection
            monitoring 2014-2023.
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
