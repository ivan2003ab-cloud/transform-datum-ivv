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

import { cartesianToGeodetic } from "@/lib/coordinateConverter";

// =======================
// ICON CUSTOM
// =======================
const kala1Icon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const kala2Icon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// =======================
// AUTO FIT BOUNDS
// =======================
function FitBounds({ data }: { data: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!data?.length) return;

    const bounds: [number, number][] = [];

    data.forEach((p) => {
      if (p.lat1 != null && p.lon1 != null)
        bounds.push([p.lat1, p.lon1]);

      if (p.lat2 != null && p.lon2 != null)
        bounds.push([p.lat2, p.lon2]);
    });

    if (bounds.length === 0) return;

    if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    } else {
      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }
  }, [data, map]);

  return null;
}

// =======================
// LEGENDA
// =======================
function Legend() {
  const map = useMap();

  useEffect(() => {
    const legend = new L.Control({
      position: "bottomright",
    });

    legend.onAdd = () => {
      const div = L.DomUtil.create(
        "div",
        "bg-white p-3 rounded-xl shadow-lg"
      );

      div.innerHTML = `
        <div style="font-size:14px;font-weight:bold;margin-bottom:8px">
          Legenda
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="
          width:12px;
          height:12px;
          border-radius:50%;
          background:blue;
          display:inline-block"></span>
          Titik Kala 1
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="
          width:12px;
          height:12px;
          border-radius:50%;
          background:green;
          display:inline-block"></span>
          Titik Kala 2
        </div>

        <div style="display:flex;align-items:center;gap:8px">
          <span style="
          width:20px;
          height:3px;
          background:red;
          display:inline-block"></span>
          Perpindahan titik
        </div>
      `;

      return div;
    };

    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

// =======================
// MAIN
// =======================
export default function MapParamInput({
  data,
}: {
  data: any[];
}) {

  const geoData = cartesianToGeodetic(data);

  return (
    <MapContainer
      center={[-7.8,110.4]}
      zoom={10}
      style={{
        height:"100%",
        width:"100%",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds data={geoData}/>
      <Legend />

      {geoData.map((p,i)=>{

        if(
          p.lat1==null ||
          p.lon1==null ||
          p.lat2==null ||
          p.lon2==null ||
          isNaN(p.lat1) ||
          isNaN(p.lon1) ||
          isNaN(p.lat2) ||
          isNaN(p.lon2)
        ) return null;

        return(
          <>
            <Marker
              key={`k1-${i}`}
              position={[p.lat1,p.lon1]}
              icon={kala1Icon}
            />

            <Marker
              key={`k2-${i}`}
              position={[p.lat2,p.lon2]}
              icon={kala2Icon}
            />

            <Polyline
              key={`line-${i}`}
              positions={[
                [p.lat1,p.lon1],
                [p.lat2,p.lon2]
              ]}
              pathOptions={{
                color:"red",
                weight:3
              }}
            />
          </>
        )
      })}

    </MapContainer>
  );
}