"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Tooltip
} from "react-leaflet";
import { useEffect, useState } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-ellipse";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

function createColorScale(data: any[], k = 5) {
  if (!data || data.length === 0) {
    return {
      getColor: () => "#ccc",
      breaks: [],
      colors: [],
    };
  }

  const values = data.map((d) => d.sy);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const breaks = Array(k + 1).fill(Number(min.toFixed(3)));
    const colors = ["#2ecc71", "#a3e635", "#facc15", "#fb923c", "#ef4444"];

    return {
      breaks,
      colors,
      getColor: () => colors[0],
    };
  }

  const interval = (max - min) / k;

  const breaks: number[] = [];
  for (let i = 0; i <= k; i++) {
    breaks.push(Number((min + i * interval).toFixed(3)));
  }

  const colors = [
    "#2ecc71",
    "#a3e635",
    "#facc15",
    "#fb923c",
    "#ef4444",
  ];

  const getColor = (sy: number) => {
    for (let i = 0; i < k; i++) {
      if (sy <= breaks[i + 1]) return colors[i];
    }
    return colors[k - 1];
  };

  return { breaks, colors, getColor };
}

// =======================
// ELLIPSE PARAM (covariance → ellipse)
// =======================
function getEllipseParams(
  varX: number,
  varY: number,
  covXY: number,
  scale: number
) {
  const term1 = (varX + varY) / 2;
  const term2 = Math.sqrt(
    ((varX - varY) / 2) ** 2 + covXY ** 2
  );

  const sigmaU2 = term1 + term2;
  const sigmaV2 = term1 - term2;

  const a = Math.sqrt(Math.max(sigmaU2, 0)) * scale;
  const b = Math.sqrt(Math.max(sigmaV2, 0)) * scale;

  const theta =
    0.5 * Math.atan2(2 * covXY, varX - varY);
  return {
    radiusX: a,
    radiusY: b,
    angle: (theta * 180) / Math.PI,
  };
}

// =======================
// ELLIPSE LAYER
// =======================
function EllipseLayer({ data, scale, getColor }: any) {
  const map = useMap();

  useEffect(() => {
    if (!data.length) return;

    const layers: L.Layer[] = [];

    data.forEach((p: any) => {
      const { radiusX, radiusY, angle } = getEllipseParams(
        p.varX,
        p.varZ,
        p.covXZ,
        scale
      );

      const ellipseLayer = (L as any).ellipse(
        [p.lat2, p.lon2],
        [radiusX, radiusY],
        angle,
        {
          color: getColor(p.sy),
          weight: 2,
          fillOpacity: 0.25,
        }
      ).addTo(map);

      layers.push(ellipseLayer);
    });

    return () => {
      layers.forEach((l) => map.removeLayer(l));
    };
  }, [data, scale, map, getColor]);

  return null;
}

// =======================
// MAIN
// =======================
export default function MapParamAnalysis({ data }: { data: any[] }) {
  const [scale, setScale] = useState(10000);
  const { breaks, colors, getColor } = createColorScale(data);

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

        {/* Marker */}
        {data.map((p, i) => (
          <Marker key={i} position={[p.lat2, p.lon2]}>
            <Tooltip permanent direction="top" offset={[0, -10]}>
              {p.point}
            </Tooltip>
          </Marker>
        ))}

        {/* Ellipse */}
        <EllipseLayer
          data={data}
          scale={scale}
          getColor={getColor}
        />
      </MapContainer>

      {/* ================= LEGEND ================= */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow text-xs">
        <div className="font-semibold mb-2">σY</div>

        {breaks.length > 0 &&
          breaks.slice(0, -1).map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ background: colors[i] }}
              />
              <span>
                {breaks[i]} – {breaks[i + 1]}
              </span>
            </div>
          ))}
      </div>

      {/* ================= SCALE ================= */}
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