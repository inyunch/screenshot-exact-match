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
        style: { color: "rgba(40,60,80,0.7)", weight: 1, fillColor: a.color, fillOpacity: 0.85 },
      });
      g.bindTooltip(a.tooltip, { sticky: true, className: "lake-tip" });
      g.on("mouseover", () => g.setStyle({ weight: 2.5 }));
      g.on("mouseout", () => g.setStyle({ weight: 1 }));
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
}: {
  areas?: MapArea[] | undefined;
  points: MapPoint[];
  onSelect?: ((id: string) => void) | undefined;
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
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
