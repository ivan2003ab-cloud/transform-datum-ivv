"use client";

import { useEffect, useState } from "react";

export default function BandingkanPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("compareProjects") || "[]"
    );
    setProjects(data);
  }, []);

  if (projects.length !== 2) {
    return <div className="p-6">Pilih 2 project dulu</div>;
  }

  const [p1, p2] = projects;

  const getSnoop = (proj: any) => {
  const arr =
    proj.snooping?.result?.map((v: any) =>
      Array.isArray(v) ? v[0] : v
    ) || [];

  const ok = arr.filter((v: number) => v === 1).length;
  const no = arr.filter((v: number) => v === 0).length;

  return { ok, no };
};
  const metodeLabel: Record<string, string> = {
  bursa: "Bursa Wolf",
  molodensky: "Molodensky Badekas",
  }
  const snoop1 = getSnoop(p1);
  const snoop2 = getSnoop(p2);

  const paramNames = ["Tx", "Ty", "Tz", "Rx", "Ry", "Rz", "S"];

  const getVal = (proj: any, i: number) => {
  let val = proj.parameter?.params?.[i]?.[0] || 0;

  const avgX = proj.rawData?.avgX || 0;
  const avgY = proj.rawData?.avgY || 0;
  const avgZ = proj.rawData?.avgZ || 0;

  if (proj.metode === "molodensky") {
    if (i === 0) val = val - avgX;
    if (i === 1) val = val - avgY;
    if (i === 2) val = val - avgZ;
  }

  // scale
  if (i === 6) val = val + 1;

  return val;
};

  const getStd = (proj: any, i: number) => {
    const v = proj.parameter?.xVar?.[i]?.[i] || 0;
    return Math.sqrt(v);
  };
  const Badge = ({ ok }: { ok: boolean }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold border
    ${ok
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : "bg-red-100 text-red-600 border-red-300"
    }`}
  >
    {ok ? "Memenuhi" : "Tidak"}
  </span>
);
  const getSignif = (proj: any, i: number) =>
    proj.parameter?.signif?.[i];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-6">
        Perbandingan Project
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-sm">

          {/* HEADER LEVEL 1 */}
          <thead className="bg-gradient-to-r from-blue-800 to-emerald-500 text-white text-center">
            <tr>
              <th className="border p-2">Item</th>
              <th colSpan={3} className="border p-2">
                {p1.name}
              </th>
              <th colSpan={3} className="border p-2">
                {p2.name}
              </th>
            </tr>
          </thead>

          <tbody className="text-center">
  {/* MODEL */}
  <tr>
    <td>Model Transformasi</td>
    <td colSpan={3}>{metodeLabel[p1.metode] || p1.metode}</td>
    <td colSpan={3}>{metodeLabel[p2.metode] || p2.metode}</td>
  </tr>
  {/* JUMLAH TITIK */}
  <tr>
  <td>Jumlah Titik Sekutu</td>
  <td colSpan={3}>
    {
      (p1.rawData?.rawData || []).filter(
        (d: any) => d.status?.toLowerCase().trim() === "sekutu" && d.selected === "selected"
      ).length
    }
  </td>
  <td colSpan={3}>
    {
      (p2.rawData?.rawData || []).filter(
        (d: any) => d.status?.toLowerCase().trim() === "sekutu" && d.selected === "selected"
      ).length
    }
  </td>
</tr>

  {/* VARIAN */}
  <tr>
    <td>Varian Aposteriori</td>
    <td colSpan={3}>
      {p1.globalTest?.aposteriori?.toFixed(6)}
    </td>
    <td colSpan={3}>
      {p2.globalTest?.aposteriori?.toFixed(6)}
    </td>
  </tr>

  <tr>
    <td></td>
    <td colSpan={3}>
  <Badge ok={p1.globalTest?.result} />
</td>
    <td colSpan={3}>
  <Badge ok={p2.globalTest?.result} />
</td>
  </tr>

  {/* SNOOPING */}
  <tr className="bg-blue-50 text-blue-700 font-semibold">
    <td>Data Snooping</td>
    <td colSpan={6}></td>
  </tr>

  <tr>
    <td>Memenuhi</td>
    <td colSpan={3}>{snoop1.ok}</td>
    <td colSpan={3}>{snoop2.ok}</td>
  </tr>

  <tr>
    <td>Tidak Memenuhi</td>
    <td colSpan={3}>{snoop1.no}</td>
    <td colSpan={3}>{snoop2.no}</td>
  </tr>
  {/* RMSE*/}
  <tr className="bg-blue-50 text-blue-700 font-semibold">
    <td>RMSE</td>
    <td colSpan={6}></td>
  </tr>

  <tr>
    <td>Jumlah Titik Uji</td>
 <td colSpan={3}>
    {
      (p1.rawData?.rawData || []).filter(
        (d: any) => d.status?.toLowerCase().trim() === "uji"
      ).length
    }
  </td>
  <td colSpan={3}>
    {
      (p2.rawData?.rawData || []).filter(
        (d: any) => d.status?.toLowerCase().trim() === "uji"
      ).length
    }
  </td>
  </tr>

  <tr>
    <td>RMSE X</td>
    <td colSpan={3}>{p1.rmse.rmseX?.toFixed(4)}</td>
    <td colSpan={3}>{p2.rmse.rmseX?.toFixed(4)}</td>
  </tr>
  <tr>
    <td>RMSE Y</td>
    <td colSpan={3}>{p1.rmse.rmseY?.toFixed(4)}</td>
    <td colSpan={3}>{p2.rmse.rmseY?.toFixed(4)}</td>
  </tr>
  <tr>
    <td>RMSE Z</td>
    <td colSpan={3}>{p1.rmse.rmseZ?.toFixed(4)}</td>
    <td colSpan={3}>{p2.rmse.rmseZ?.toFixed(4)}</td>
  </tr>
  <tr>
    <td>RMSE 3D</td>
    <td colSpan={3}>{p1.rmse.rmse3D?.toFixed(4)}</td>
    <td colSpan={3}>{p2.rmse.rmse3D?.toFixed(4)}</td>
  </tr>


  {/* PARAMETER HEADER */}
  <tr className="bg-emerald-50 text-emerald-700 font-semibold">
    <td>Parameter</td>
    <td>Nilai</td>
    <td>Std</td>
    <td>Signifikansi</td>
    <td>Nilai</td>
    <td>Std</td>
    <td>Signifikansi</td>
  </tr>

  {/* PARAMETER */}
  {paramNames.map((name, i) => (
    <tr key={name}>
      <td>{name}</td>

      <td>{getVal(p1, i).toFixed(6)}</td>
      <td>{getStd(p1, i).toFixed(6)}</td>
      <td className={getSignif(p1, i) ? "text-green-600" : "text-red-600"}>
        {getSignif(p1, i) ? "Ya" : "Tidak"}
      </td>

      <td>{getVal(p2, i).toFixed(6)}</td>
      <td>{getStd(p2, i).toFixed(6)}</td>
      <td className={getSignif(p2, i) ? "text-green-600" : "text-red-600"}>
        {getSignif(p2, i) ? "Ya" : "Tidak"}
      </td>
    </tr>
  ))}

</tbody>
        </table>
      </div>
    </div>
  );
}