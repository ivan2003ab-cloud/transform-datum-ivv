"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  normalizeToCartesian,
  cartesianToGeodetic,
} from "@/lib/coordinateConverter";

const toRad = (val: number, unit: string) =>
  unit === "degree" ? (val * Math.PI) / 180 : val;

export default function TransformPage() {
  const [format, setFormat] = useState("cartesian");
  const [angleUnit, setAngleUnit] = useState("radian");

  const [params, setParams] = useState({
    tx: "",
    ty: "",
    tz: "",
    rx: "",
    ry: "",
    rz: "",
    s: "",
  });
  useEffect(() => {
  const stored = localStorage.getItem("transformParams");

  if (stored) {
    const parsed = JSON.parse(stored);

    setParams({
      tx: parsed.tx ?? "",
      ty: parsed.ty ?? "",
      tz: parsed.tz ?? "",
      rx: parsed.rx ?? "",
      ry: parsed.ry ?? "",
      rz: parsed.rz ?? "",
      s: parsed.s ?? "",
    });
  }
}, []);
  const [data, setData] = useState<any[]>([]);

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    setData(json);
  };

  const handleTransform = () => {
    const prepared = data.map((row: any) => {
      if (format === "cartesian") {
        return {
          point: row.Point,
          x1: row.X,
          y1: row.Y,
          z1: row.Z,
          x2: 0,
          y2: 0,
          z2: 0,
        };
      }

      return {
        point: row.Point,
        lat1: row.latitude,
        lon1: row.longitude,
        h1: row.height,
        lat2: 0,
        lon2: 0,
        h2: 0,
      };
    });

    const cartesian = normalizeToCartesian(prepared, format);

    const tx = Number(params.tx);
    const ty = Number(params.ty);
    const tz = Number(params.tz);

    const rx = toRad(Number(params.rx), angleUnit);
    const ry = toRad(Number(params.ry), angleUnit);
    const rz = toRad(Number(params.rz), angleUnit);

    const s = Number(params.s);

    const transformed = cartesian.map((p: any) => {
      const { x1, y1, z1 } = p;

      const r11 = Math.cos(rx) * Math.cos(ry);
      const r22 = -Math.sin(rx) * Math.sin(ry) * Math.sin(rz) + Math.cos(rx) * Math.cos(rz);
      const r33 = Math.cos(rx) * Math.cos(ry);

      const x2 = s * (r11 * x1) + tx;
      const y2 = s * (r22 * y1) + ty;
      const z2 = s * (r33 * z1) + tz;

      return { ...p, x2, y2, z2 };
    });

    let output;

    if (format === "cartesian") {
      output = transformed.map((p: any) => ({
        Point: p.point,
        X: p.x2,
        Y: p.y2,
        Z: p.z2,
      }));
    } else {
      const geo = cartesianToGeodetic(transformed);

      output = geo.map((p: any) => ({
        Point: p.point,
        latitude: p.lat2,
        longitude: p.lon2,
        height: p.h2,
      }));
    }

    const ws = XLSX.utils.json_to_sheet(output);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Result");
    XLSX.writeFile(wb, "transform_result.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transformasi Koordinat</h1>

      {/* HEADER INPUT */}
      <div className="bg-gray-200 p-4 rounded-xl flex justify-between items-center mb-6">
        <span className="font-semibold text-blue-900">Input data</span>

        <div className="flex gap-3">
          <button className="bg-blue-700 text-white px-5 py-2 rounded-full">
            Template
          </button>
          <label className="bg-blue-500 text-white px-5 py-2 rounded-full cursor-pointer">
            Upload
            <input type="file" onChange={handleFileChange} hidden />
          </label>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* STRUKTUR */}
        <div className="mb-6">
          <h2 className="text-blue-900 font-semibold mb-3">Struktur data</h2>

          <div className="flex gap-12">
            {[
              { label: "Cartesian", value: "cartesian" },
              { label: "Geodetik (DD.DDDDD)", value: "dd" },
              { label: "Geodetik (DD.MMSSSS)", value: "dms" },
            ].map((item) => (
              <label key={item.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={format === item.value}
                  onChange={() => setFormat(item.value)}
                  className="accent-blue-600"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        {/* PARAMETER */}
        <div className="mb-6">
          <h2 className="text-blue-900 font-semibold mb-3">
            Parameter Transformasi
          </h2>

          <div className="grid grid-cols-3 gap-y-3 max-w-xl">
            {Object.keys(params).map((key) => (
              <div key={key} className="contents">
                <div className="font-medium uppercase">{key}</div>

                <input
                  value={(params as any)[key]}
                  onChange={(e) =>
                    setParams({ ...params, [key]: e.target.value })
                  }
                  className="border border-gray-300 p-2 rounded w-full bg-white"
                />

                <div className="text-sm text-gray-600">
                  {key.startsWith("t")
                    ? "m"
                    : key.startsWith("r")
                    ? angleUnit === "degree"
                      ? "deg"
                      : "rad"
                    : key === "s"
                    ? "ppm"
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center mt-6">
          <select
            value={angleUnit}
            onChange={(e) => setAngleUnit(e.target.value)}
            className="border border-gray-300 p-2 rounded bg-white"
          >
            <option value="degree">Degree</option>
            <option value="radian">Radian</option>
          </select>

          <button
            onClick={handleTransform}
            className="bg-blue-900 text-white px-6 py-2 rounded-xl"
          >
            Proses
          </button>
        </div>
      </div>
    </div>
  );
}
