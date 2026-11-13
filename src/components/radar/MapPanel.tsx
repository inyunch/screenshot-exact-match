import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { MapPoint } from "./LakeMap";

const LakeMap = lazy(() => import("./LakeMap"));

function MapPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function MapPanel({
  points,
  onSelect,
  loading,
  legend,
  center,
  zoom,
  footer,
}: {
  center?: [number, number];
  zoom?: number;
  footer?: string;
  points: MapPoint[];
  onSelect?: ((id: string) => void) | undefined;
  loading?: boolean;
  legend: { label: string; color: string }[];
}) {
  return (
    <div className="space-y-2">
      <div className="map-frame h-[420px] sm:h-[540px]">
        {loading ? (
          <MapPlaceholder label="Loading all lakes…" />
        ) : (
          <ClientOnly fallback={<MapPlaceholder label="Loading map…" />}>
            <Suspense fallback={<MapPlaceholder label="Loading map…" />}>
              <LakeMap points={points} onSelect={onSelect} {...(center ? { center } : {})} {...(zoom ? { zoom } : {})} />
            </Suspense>
          </ClientOnly>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {legend.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
        <span className="ml-auto">
          {footer ?? `${points.length.toLocaleString("en-US")} lakes shown · circle size grows with lake area`}
        </span>
      </div>
    </div>
  );
}
