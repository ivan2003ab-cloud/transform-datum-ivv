"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { runAdjustment } from "@/lib/runAdjustment";
import { ecefToGeodetic } from "@/lib/coordinateConverter";
import { useRouter } from "next/navigation";
import ResidualChart from "@/components/Chart/analysis";

const MapParamAnalysis = dynamic(
  () => import("@/components/Map/mapParamAnalysis"),
  { ssr: false }
);

export default function AnalysisPage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [metode, setMetode] = useState<string | null>(null);
  const [pointList, setPointList] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "chart">("map");
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [editData, setEditData] = useState<any[]>([]);

  useEffect(() => {
  const stored = localStorage.getItem("hasil");
  const raw = localStorage.getItem("rawInput");

  if (!stored || !raw) return;

  const parsed = JSON.parse(stored);
  const rawData = JSON.parse(raw);
  parsed.pre.allData = rawData;

  setData(parsed);

  const sekutuAll = rawData.filter(
    (d: any) => d.status?.toLowerCase().trim() === "sekutu"
  );

  const allNames = sekutuAll.map((d: any) => d.point);

  const selected = sekutuAll
    .filter((d: any) => d.selected === "selected")
    .map((d: any) => d.point);

  setPointList(allNames);
  setSelectedPoints(selected.length ? selected : allNames);

  const metodeLS = localStorage.getItem("metode");
  if (metodeLS) setMetode(metodeLS);
}, []);

  const togglePoint = (name: string) => {
    setSelectedPoints((prev) =>
      prev.includes(name)
      ? prev.filter((p) => p !== name)
      : [...prev, name]
    );
  };

  const openEditStatus = () => {
    const raw = JSON.parse(localStorage.getItem("rawInput") || "[]");
    setEditData(raw);
    setOpenModal("editStatus");
  };
  const snoopRows = useMemo(() => {
  if (!data || !data.adj || !data.test) return [];

  const sekutu = (data.pre.allData || []).filter(
    (d: any) => d.status?.toLowerCase().trim() === "sekutu"
  );

  const v = data.adj.v || [];
  const std = data.test.snoop.sqrtDiag || [];
  const res = data.test.snoop.result || [];

  let calcIndex = 0;

  return sekutu.map((row: any) => {
    const active = row.selected === "selected";

    if (active) {
      const base = calcIndex * 3;
      calcIndex++;

      return {
        no: row.point,
        selected: row.selected,
        vx: v[base]?.[0] ?? v[base] ?? null,
        vy: v[base + 1]?.[0] ?? v[base + 1] ?? null,
        vz: v[base + 2]?.[0] ?? v[base + 2] ?? null,
        svx: std[base],
        svy: std[base + 1],
        svz: std[base + 2],
        statusX: res[base],
        statusY: res[base + 1],
        statusZ: res[base + 2],
      };
    }

    return {
      no: row.point,
      selected: row.selected,
      vx: null,
      vy: null,
      vz: null,
      svx: null,
      svy: null,
      svz: null,
      statusX: null,
      statusY: null,
      statusZ: null,
      disabled: true,
    };
  });
}, [data]);
  const formatParameter = () => {
    const params = data?.adj?.params || [];
    const xVar = data?.adj?.xVar || [];
    const signif = data?.test?.signif?.result || [];

    const names = ["Tx (m)", "Ty (m)", "Tz (m)", "Rx (rad)", "Ry (rad)", "Rz (rad)", "S (m)"];

    const diag = xVar.map((row: any, i: number) => row[i]);
    const std = diag.map((val: number) => Math.sqrt(val));
  
    const avgX = data?.pre?.avgX || 0;
    const avgY = data?.pre?.avgY || 0;
    const avgZ = data?.pre?.avgZ || 0;
    return params.map((p: any, i: number) => {
      let value = p[0];
      if (metode === "molodensky") {
        if (i === 0) value = value - avgX;
        if (i === 1) value = value - avgY;
        if (i === 2) value = value - avgZ;
      }
      if (i === 6) value = value + 1;

      return {
        name: names[i],
        value,
        std: std[i],
        signif: signif[i],
      };
    });
  };
  const handleRecalculate = async (rawData: any) => {
    localStorage.setItem("rawInput", JSON.stringify(rawData));

  const result = await runAdjustment(rawData, metode!);

  result.pre.allData = rawData;

  setData(result);
  localStorage.setItem("hasil", JSON.stringify(result));
};
  const buildMapData = () => {
    if (!data) return [];

  const raw = JSON.parse(localStorage.getItem("rawInput") || "[]");
  const vVar = data?.adj?.vVar || [];

  const sekutuSelected = raw.filter(
    (row:any) =>
      row.status?.toLowerCase().trim() === "sekutu" &&
      row.selected === "selected"
  );

  const result = [];

  for (let i = 0; i < sekutuSelected.length; i++) {
    const base = i * 3;
    const row = sekutuSelected[i];

    
      const geo = ecefToGeodetic(row.x2, row.y2, row.z2);

      const varX = vVar[base]?.[base] ?? 0;
      const varY = vVar[base + 1]?.[base + 1] ?? 0;
      const varZ = vVar[base + 2]?.[base + 2] ?? 0;

      const covXZ = vVar[base]?.[base + 2] ?? 0;
      
      result.push({
        point: row.point,

        lat2: geo.lat,
        lon2: geo.lon,
        varX,
        varZ,
        covXZ,
        sy: Math.sqrt(varY),
      });
    }

    return result;
  };
  const handleToTransform = () => {
    const params = formatParameter();

    const mapped = {
      tx: params[0]?.value,
      ty: params[1]?.value,
      tz: params[2]?.value,
      rx: params[3]?.value,
      ry: params[4]?.value,
      rz: params[5]?.value,
      s: params[6]?.value,
    };

    localStorage.setItem("transformParams", JSON.stringify(mapped));

    router.push("/transformasi"); 
  };
  

  const handleSave = async () => {
    if (saving || saved) return;
  try {
    setSaving(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const raw = JSON.parse(localStorage.getItem("rawInput") || "[]");

    if (!user?.id) {
      alert("Anda harus login untuk menyimpan hasil");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/project/save", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
          name: projectName || `Perhitungan ${new Date().toLocaleString()}`,
          metode,
          userId: user.id,
          rawData: {
          rawData: raw,
          avgX: data?.pre?.avgX,
          avgY: data?.pre?.avgY,
          avgZ: data?.pre?.avgZ,
          },
          globalTest: {
            result: data?.test?.global?.result,
            aposteriori: data?.test?.global?.aposteriori,
            Xhitung: data?.test?.global?.Xhitung,
            Xtabel: data?.test?.global?.Xtabel,
          },

          snooping: {
            v: data?.adj?.v,
            vVar: data?.adj?.vVar,
            std: data?.test?.snoop?.sqrtDiag,
            result: data?.test?.snoop?.result,
          },

          parameter: {
            params: data?.adj?.params,
            xVar: data?.adj?.xVar,
            signif: data?.test?.signif?.result,
          },

          rmse: {hasil: data?.test?.rmse?.hasil,
                  rmseX: data?.test?.rmse?.rmseX,
                  rmseY: data?.test?.rmse?.rmseY,
                  rmseZ: data?.test?.rmse?.rmseZ,
                  rmse3D: data?.test?.rmse?.rmse3D,
          },
        }),
      });

      if (res.ok) {
        alert("Berhasil disimpan");
        setSaved(true);
        
      } else {
        alert("Gagal");
      }
    } catch (err) {
      console.error(err);
      alert("Error");
    }
      finally {
        setSaving(false);
    }
  };
const rawString = localStorage.getItem("rawInput");
const raw = rawString ? JSON.parse(rawString) : [];

const count = raw.reduce(
  (acc: { sekutu: number; uji: number }, item: any) => {
    const status = item.status?.toLowerCase().trim();

    if (status === "sekutu") acc.sekutu++;
    else if (status === "uji") acc.uji++;

    return acc;
  },
  { sekutu: 0, uji: 0 }
);

const jumlahSekutu = count.sekutu;
const jumlahUji = count.uji;
  return (
    <div className="p-6 space-y-6">
      {/* MAP */}
      <div className="relative rounded-3xl h-[400px] overflow-hidden">

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-1 rounded-full text-sm ${
              viewMode === "map"
                ? "bg-blue-900 text-white"
                : "bg-white"
            }`}
          >
            Peta
          </button>

          <button
            onClick={() => setViewMode("chart")}
            className={`px-4 py-1 rounded-full text-sm ${
              viewMode === "chart"
                ? "bg-blue-900 text-white"
                : "bg-white"
            }`}
          >
            Grafik
          </button>
        </div>

        {/* CONDITIONAL VIEW */}
        {data && viewMode === "map" && (
          <MapParamAnalysis data={buildMapData()} />
        )}

        {data && viewMode === "chart" && (
          <ResidualChart
            raw={JSON.parse(localStorage.getItem("rawInput") || "[]")}
  v={data?.adj?.v || []}
  rmse={data?.test?.rmse}
          />
        )}
    </div>
    <div className="flex items-center justify-between mb-6">
  <div className="flex gap-4">
    <div className="px-5 py-2 bg-blue-300 rounded-full text-sm font-medium">
      Jumlah Titik Sekutu: {jumlahSekutu}
    </div>
    <div className="px-5 py-2 bg-blue-300 rounded-full text-sm font-medium">
      Jumlah Titik Uji: {jumlahUji}
    </div>
  </div>

  <button
    onClick={openEditStatus}
    className="px-6 py-2 bg-emerald-700 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 transition"
  >
    Edit Status Titik
  </button>
</div>
      {/* RESULT LIST */}
      <div className="space-y-4">
        {/* Uji Global */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold">Uji Global</span>
            <span
                className={`px-3 py-1 text-sm rounded-full text-white ${
                data?.test?.global?.result === 1
                ?  "bg-green-500"
                : "bg-red-500"
                }`}
                >
            {data?.test?.global?.result === 1 ? "memenuhi" : "tidak"}
            </span>
          </div>

          <button
            onClick={() => setOpenModal("global")}
            className="px-6 py-2 rounded-full bg-blue-900 text-white hover:bg-blue-800"
          >
            Detail
          </button>
        </div>

        {/* Data Snooping */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">Data Snooping</span>

          <button
            onClick={() => setOpenModal("snooping")}
            className="px-6 py-2 rounded-full bg-blue-900 text-white hover:bg-blue-800"
          >
            Detail
          </button>
        </div>

        {/* RMSE Titik Uji */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">RMSE Titik Uji</span>

          <button
            onClick={() => setOpenModal("rmse")}
            className="px-6 py-2 rounded-full bg-blue-900 text-white"
          >
            Detail
          </button>
        </div>

        {/* Hasil Transformasi */}
        <div>
          <span className="font-semibold">Hasil Parameter Transformasi</span>

          <div className="mt-4 bg-gray-200 rounded-xl p-6">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-300">
                <tr>
                <th className="border p-2">Parameter</th>
                <th className="border p-2">Nilai</th>
                <th className="border p-2">Simpangan Baku</th>
                <th className="border p-2">Signifikan</th>
                </tr>
              </thead>

              <tbody>
                {formatParameter().map((row: any, i: number) => (
                <tr key={i} className="text-center">
                <td className="border p-2">{row.name}</td>

                <td className="border p-2">
                  {row.value?.toFixed(6)}
                </td>

                <td className="border p-2">
                  {row.std?.toFixed(6)}
                </td>

                <td className="border p-2">
                  {row.signif === 1 ? (
                    <span className="text-green-600 font-medium">
                      Signifikan
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      Tidak
                    </span>
                  )}
                </td>
                </tr>
                ))}
              </tbody>
            </table>
          <div className="flex justify-between mt-4">

            <button
              onClick={() => setOpenModal("save")}
              className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-500"
            >
              Simpan
            </button>


            <button
              onClick={handleToTransform}
              className="px-6 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800"
            >
              Lanjutkan Transformasi Datum →
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* MODAL */}
      <>

  {openModal === "editStatus" && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-xl p-6 w-[900px] max-h-[80vh] overflow-auto">

      <h2 className="text-lg font-semibold mb-4">
        Edit Status Titik
      </h2>

      <table className="w-full text-sm border">
  <thead className="bg-gray-200">
    <tr>
      <th className="border p-2">Point</th>
      <th className="border p-2">X1</th>
      <th className="border p-2">Y1</th>
      <th className="border p-2">Z1</th>
      <th className="border p-2">X2</th>
      <th className="border p-2">Y2</th>
      <th className="border p-2">Z2</th>
      <th className="border p-2">Status</th>
    </tr>
  </thead>

  <tbody>
    {editData.map((row, i) => (
      <tr key={i} className="text-center">
        <td className="border p-2">{row.point}</td>

        <td className="border p-2">{row.x1?.toFixed(3)}</td>
        <td className="border p-2">{row.y1?.toFixed(3)}</td>
        <td className="border p-2">{row.z1?.toFixed(3)}</td>

        <td className="border p-2">{row.x2?.toFixed(3)}</td>
        <td className="border p-2">{row.y2?.toFixed(3)}</td>
        <td className="border p-2">{row.z2?.toFixed(3)}</td>

        <td className="border p-2">
          <select
            value={row.status}
            onChange={(e) => {
              const updated = [...editData];
              updated[i].status = e.target.value;
              setEditData(updated);
            }}
            className="border p-1 rounded"
          >
            <option value="sekutu">sekutu</option>
            <option value="uji">uji</option>
          </select>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      <div className="flex justify-between mt-4">
        <button
          onClick={async () => {
  const updated = editData.map((item) => {
    if (item.status !== "sekutu") {
      const { selected, ...rest } = item;
      return rest;
    }
    return item;
  });

  await handleRecalculate(updated);

  alert("Recalculate berhasil");
  setOpenModal(null);
}}
          className="px-4 py-2 bg-emerald-800 text-white rounded"
        >
          Recalculate
        </button>

        <button
          onClick={() => setOpenModal(null)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
)}

  {/* ================= GLOBAL MODAL ================= */}
  {openModal === "global" && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          Detail Uji Global
        </h2>

        <div className="space-y-3 text-sm">
          <div>
            Hasil:{" "}
            <span
              className={`font-semibold ${
                data?.test?.global?.result === 1
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {data?.test?.global?.result === 1
                ? "Memenuhi"
                : "Tidak Memenuhi"}
            </span>
          </div>

          <div>
            Aposteriori:{" "}
            <span className="font-medium">
              {data?.test?.global?.aposteriori?.toFixed(6)}
            </span>
          </div>

          <div>
            X hitung:{" "}
            <span className="font-medium">
              {data?.test?.global?.Xhitung?.toFixed(6)}
            </span>
          </div>

          <div>
            X tabel:{" "}
            <span className="font-medium">
              {data?.test?.global?.Xtabel?.toFixed(6)}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setOpenModal(null)}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )}

  {/* ================= SNOOPING MODAL ================= */}
  {openModal === "snooping" && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 w-[1000px] shadow-lg max-h-[80vh] overflow-auto">

        <h2 className="text-lg font-semibold mb-4">
          Detail Data Snooping
        </h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSelectedPoints(pointList)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Select All
          </button>

          <button
            onClick={() => setSelectedPoints([])}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Clear
          </button>
        </div>

        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Use</th>
              <th className="border p-2">Point</th>
              <th className="border p-2">Vx</th>
              <th className="border p-2">Svx</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Vy</th>
              <th className="border p-2">Svy</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Vz</th>
              <th className="border p-2">Svz</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {snoopRows.map((row: any, i: number) => (
              <tr key={i} className="text-center">
                <td className="border p-2">
                  <input
                    type="checkbox"
                    checked={selectedPoints.includes(row.no)}
                    onChange={() => togglePoint(row.no)}
                  />
                </td>

                <td className="border p-2">{row.no}</td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.vx?.toFixed(4)
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.svx?.toFixed(4)
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.statusX === 1
                      ? "✔"
                      : "✖"
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.vy?.toFixed(4)
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.svy?.toFixed(4)
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.statusY === 1
                      ? "✔"
                      : "✖"
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.vz?.toFixed(4)
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.svz?.toFixed(4)
                    : "-"}
                </td>

                <td className="border p-2">
                  {selectedPoints.includes(row.no)
                    ? row.statusZ === 1
                      ? "✔"
                      : "✖"
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button
            onClick={async () => {
    try {
      const raw = JSON.parse(localStorage.getItem("rawInput") || "[]");

      const updated = raw.map((item: any) => {
        if (item.status !== "sekutu") return item;

        if (selectedPoints.includes(item.point)) {
          return { ...item, selected: "selected" };
        } else {
          const { selected, ...rest } = item;
          return rest;
        }
      });

      await handleRecalculate(updated);

      alert("Recalculate berhasil");
    } catch (err) {
      console.error(err);
      alert("Gagal");
    }
  }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Recalculate
          </button>

          <button
            onClick={() => setOpenModal(null)}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )}
  {openModal === "rmse" && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
    <div className="bg-white rounded-xl p-6 w-[700px] shadow-lg">

      <h2 className="text-lg font-semibold mb-4">
        Hasil Pengujian Titik Uji
      </h2>

      {data?.test?.rmse?.rmse3D === null ? (
        <div className="text-center text-gray-500">
          Anda tidak mendefinisikan titik uji
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div>RMSE X: {data?.test?.rmse?.rmseX.toFixed(6)}</div>
          <div>RMSE Y: {data?.test?.rmse?.rmseY.toFixed(6)}</div>
          <div>RMSE Z: {data?.test?.rmse?.rmseZ.toFixed(6)}</div>
          <div className="font-semibold">
            RMSE 3D: {data?.test?.rmse?.rmse3D.toFixed(6)}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setOpenModal(null)}
          className="px-4 py-2 bg-blue-900 text-white rounded"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}
  {/* ================= SAVE MODAL ================= */}
  {openModal === "save" && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">

        <h2 className="text-lg font-semibold mb-4">
          Simpan Project
        </h2>

        <input
          type="text"
          placeholder="Nama project (opsional)"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          disabled={saving || saved}
        />

        <div className="flex justify-end gap-2">

          <button
            onClick={() => setOpenModal(null)}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={saving}
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`px-4 py-2 text-white rounded ${
              saved
                ? "bg-green-400"
                : saving
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {saved ? (
              "✓ Tersimpan"
            ) : saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </div>
            ) : (
              "Simpan"
            )}
          </button>

        </div>
      </div>
    </div>
  )}
</>
    </div>
  );
}