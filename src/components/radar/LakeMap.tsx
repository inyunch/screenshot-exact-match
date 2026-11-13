// Browser-only: imports Leaflet. Load it lazily behind <ClientOnly> (see MapPanel).
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

export type MapPoint = {
  id: string;
  lat: number;
  lon: number;
  color: string;
  radius: number;
  tooltip: string; // pre-escaped HTML
};

export type MapArea = {
  id: string;
  geometry: GeoJSON.Geometry;
  color: string;
  tooltip: string; // pre-escaped HTML
};

function AreasLayer({ areas }: { areas: MapArea[] }) {
  const map = useMap();
  useEffect(() => {
    const layer = L.layerGroup();
    for (const a of areas) {
      const g = L.geoJSON(a.geometry as GeoJSON.GeoJsonObject, {
        style: { color: "#1b2a38", weight: 2.5, fillColor: a.color, fillOpacity: 0.8 },
      });
      g.bindTooltip(a.tooltip, { sticky: true, className: "lake-tip" });
      g.on("mouseover", () => g.setStyle({ weight: 4.5 }));
      g.on("mouseout", () => g.setStyle({ weight: 2.5 }));
      layer.addLayer(g);
    }
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, areas]);
  return null;
}

function PointsLayer({
  points,
  onSelect,
}: {
  points: MapPoint[];
  onSelect?: ((id: string) => void) | undefined;
}) {
  const map = useMap();
  useEffect(() => {
    const renderer = L.canvas({ padding: 0.5 });
    const layer = L.layerGroup();
    for (const p of points) {
      const m = L.circleMarker([p.lat, p.lon], {
        renderer,
        radius: p.radius,
        color: "rgba(255,255,255,0.9)",
        weight: 0.8,
        fillColor: p.color,
        fillOpacity: 0.85,
      });
      m.bindTooltip(p.tooltip, { direction: "top", offset: [0, -4], className: "lake-tip" });
      if (onSelect) m.on("click", () => onSelect(p.id));
      layer.addLayer(m);
    }
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, points, onSelect]);
  return null;
}

export default function LakeMap({
  points,
  onSelect,
  center = [44.6, -85.4],
  zoom = 6,
  areas,
  bounds,
}: {
  bounds?: [[number, number], [number, number]] | undefined;
  areas?: MapArea[] | undefined;
  points: MapPoint[];
  onSelect?: ((id: string) => void) | undefined;
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      {...(bounds ? { bounds, boundsOptions: { padding: [8, 8] as [number, number] } } : { center, zoom })}
      zoomSnap={0.25}
      minZoom={4}
      scrollWheelZoom={false}
      preferCanvas
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areas && <AreasLayer areas={areas} />}
      <PointsLayer points={points} onSelect={onSelect} />
    </MapContainer>
  );
}
