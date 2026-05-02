"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
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
import {
  cartesianToGeodetic,
  dmsDecimalToDD,
} from "@/lib/coordinateConverter";

// =======================
// AUTO FIT BOUNDS
// =======================
function FitBounds({ data }: { data: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const bounds: [number, number][] = [];

    data.forEach((p) => {
      if (p.lat1 && p.lon1) bounds.push([p.lat1, p.lon1]);
      if (p.lat2 && p.lon2) bounds.push([p.lat2, p.lon2]);
    });

    if (bounds.length === 0) return;

    if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    } else {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);

  return null;
}

// =======================
// MAIN COMPONENT
// =======================
export default function MapParamInput({
  data,
  struktur,
}: {
  data: any[];
  struktur: string;
}) {
  // =======================
  // NORMALISASI KE GEODETIK
  // =======================
  const toGeodetic = () => {
    if (!data || data.length === 0) return [];

    // 🔥 CARTESIAN → GEODETIK
    if (struktur === "cartesian") {
      return cartesianToGeodetic(data);
    }

    // 🔥 DD → langsung pakai
    if (struktur === "dd") {
      return data.map((d) => ({
        lat1: Number(d.lat1),
        lon1: Number(d.lon1),
        lat2: Number(d.lat2),
        lon2: Number(d.lon2),
      }));
    }

    // 🔥 DMS → convert ke DD
    if (struktur === "dms") {
      return data.map((d) => ({
        lat1: dmsDecimalToDD(Number(d.lat1)),
        lon1: dmsDecimalToDD(Number(d.lon1)),
        lat2: dmsDecimalToDD(Number(d.lat2)),
        lon2: dmsDecimalToDD(Number(d.lon2)),
      }));
    }

    return [];
  };

  const geoData = toGeodetic();
  return (
    <MapContainer
      center={[-7.8, 110.4]} // fallback
      zoom={10}
      style={{ height: "100%", width: "100%" }}
    >
      {/* BASE MAP */}
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 AUTO ZOOM */}
      <FitBounds data={geoData} />

      {/* 🔥 RENDER TITIK + GARIS */}
      {geoData.map((p, i) => {
  if (!p.lat1 || !p.lon1 || !p.lat2 || !p.lon2) return null;

  const line: [number, number][] = [
    [p.lat1, p.lon1],
    [p.lat2, p.lon2],
  ];

  return (
    <div key={i}>
      {/* titik kala 1 */}
      <Marker position={[p.lat1, p.lon1]} />

      {/* titik kala 2 */}
      <Marker position={[p.lat2, p.lon2]} />

      {/* 🔥 GARIS */}
      <Polyline
        positions={line}
        pathOptions={{
          color: "red",
          weight: 3,
        }}
      />
    </div>
  );
  
})}

    </MapContainer>
  );
}