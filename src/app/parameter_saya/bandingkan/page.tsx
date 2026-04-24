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

  const getSignif = (proj: any, i: number) =>
    proj.parameter?.signif?.[i];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-6">
        Perbandingan Project
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">

          {/* HEADER LEVEL 1 */}
          <thead className="bg-gray-200 text-center">
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

  {/* JUMLAH TITIK */}
  <tr>
    <td>Jumlah Titik</td>
    <td colSpan={3}>{p1.rawData?.rawData?.length || 0}</td>
    <td colSpan={3}>{p2.rawData?.rawData?.length || 0}</td>
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
    <td colSpan={3} className={p1.globalTest?.result ? "text-green-600" : "text-red-600"}>
      {p1.globalTest?.result ? "Memenuhi" : "Tidak"}
    </td>
    <td colSpan={3} className={p2.globalTest?.result ? "text-green-600" : "text-red-600"}>
      {p2.globalTest?.result ? "Memenuhi" : "Tidak"}
    </td>
  </tr>

  {/* SNOOPING */}
  <tr className="bg-gray-100 font-semibold">
    <td>Snooping</td>
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

  {/* PARAMETER HEADER (INI PENTING BANGET) */}
  <tr className="bg-gray-100 font-semibold">
    <td>Parameter</td>
    <td>Nilai</td>
    <td>Std</td>
    <td>Signif</td>
    <td>Nilai</td>
    <td>Std</td>
    <td>Signif</td>
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