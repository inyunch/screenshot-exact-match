import { Link } from "@tanstack/react-router";
import { Bot, Cpu, Droplets, Flame, Info, Map as MapIcon, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export const TAB_META = [
  { key: "project", label: "Project", icon: Info },
  { key: "map", label: "Risk map", icon: MapIcon },
  { key: "quagga", label: "Quagga Infestation", icon: Flame },
  { key: "lake", label: "Lake detail", icon: Waves },
  { key: "septic", label: "Septic screening", icon: Droplets },
  { key: "agent", label: "Ask the agent", icon: Bot },
] as const;

export type TabKey = (typeof TAB_META)[number]["key"];

export const TAB_KEYS = TAB_META.map((t) => t.key) as TabKey[];

/** Sticky main navigation: the six app tabs plus the IBM write-up page. */
export function AppNav({ active }: { active: TabKey | "ibm" }) {
  const base =
    "flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm transition-colors hover:text-foreground";

  return (
    <div className="sticky top-0 z-[1000] border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav aria-label="Main" className="tab-rail flex w-full items-stretch gap-1 overflow-x-auto">
          {TAB_META.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              to="/"
              search={{ tab: key }}
              aria-current={active === key ? "page" : undefined}
              className={cn(
                base,
                active === key
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
          <Link
            to="/ibm"
            aria-current={active === "ibm" ? "page" : undefined}
            className={cn(
              base,
              active === "ibm"
                ? "border-ibm-blue font-medium text-ibm-blue"
                : "border-transparent text-muted-foreground",
            )}
          >
            <Cpu className="h-4 w-4" aria-hidden />
            How we used IBM
          </Link>
        </nav>
      </div>
    </div>
  );
}
