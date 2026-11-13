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

function PointsLayer({ points, onSelect }: { points: MapPoint[]; onSelect?: (id: string) => void }) {
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
}: {
  points: MapPoint[];
  onSelect?: (id: string) => void;
}) {
  return (
    <MapContainer
      center={[44.6, -85.4]}
      zoom={6}
      minZoom={5}
      scrollWheelZoom={false}
      preferCanvas
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PointsLayer points={points} onSelect={onSelect} />
    </MapContainer>
  );
}
