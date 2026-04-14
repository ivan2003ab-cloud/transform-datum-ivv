"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// FIX icon broken di Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
// =======================
// AUTO FIT
// =======================
function FitBounds({ data }: { data: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!data.length) return;

    const bounds: [number, number][] = data.map((p) => [
      p.lat2,
      p.lon2,
    ]);

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [data, map]);

  return null;
}

// =======================
// ROTATED ELLIPSE
// =======================
function generateRotatedEllipse(
  lat: number,
  lon: number,
  varX: number,
  varZ: number,
  covXZ: number,
  scale: number,
  steps = 60
): [number, number][] {
  const pts: [number, number][] = [];

  const mean = (varX + varZ) / 2;
  const diff = (varX - varZ) / 2;

  const lambda1 = mean + Math.sqrt(diff * diff + covXZ * covXZ);
  const lambda2 = mean - Math.sqrt(diff * diff + covXZ * covXZ);

  const a = Math.sqrt(lambda1);
  const b = Math.sqrt(lambda2);

  const theta = 0.5 * Math.atan2(2 * covXZ, varX - varZ);

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;

    const x = a * Math.cos(t);
    const z = b * Math.sin(t);

    const xr = x * Math.cos(theta) - z * Math.sin(theta);
    const zr = x * Math.sin(theta) + z * Math.cos(theta);

    const dx = xr * scale;
    const dz = zr * scale;

    const dLat = dz / 111320;
    const dLon = dx / (111320 * Math.cos((lat * Math.PI) / 180));

    pts.push([lat + dLat, lon + dLon]);
  }

  return pts;
}

// =======================
// COLOR σY
// =======================
function getColor(sy: number) {
  if (sy < 0.02) return "green";
  if (sy < 0.05) return "orange";
  return "red";
}

// =======================
// MAIN
// =======================
export default function MapParamAnalysis({ data }: { data: any[] }) {
  const [scale, setScale] = useState(10000);
    console.log("mapData:", data);
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[-7.8, 110.4]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds data={data} />
        
        {data.map((p, i) => {
          const ellipse = generateRotatedEllipse(
            p.lat2,
            p.lon2,
            p.varX,
            p.varZ,
            p.covXZ,
            scale
          );

          return (
            <div key={i}>
              <Marker position={[p.lat2, p.lon2]} />

              <Polyline
                positions={ellipse}
                pathOptions={{
                  color: getColor(p.sy),
                  weight: 2,
                }}
              />
            </div>
          );
        })}
      </MapContainer>

      {/* LEGEND */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow">
        <div className="font-semibold text-sm">σY</div>
        <div className="text-xs text-green-600">Kecil</div>
        <div className="text-xs text-orange-500">Sedang</div>
        <div className="text-xs text-red-600">Besar</div>
      </div>

      {/* SCALE */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded shadow">
        <div className="text-xs mb-1">Scale</div>
        <input
          type="range"
          min={1000}
          max={50000}
          step={1000}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        />
        <div className="text-xs">{scale}x</div>
      </div>
    </div>
  );
}