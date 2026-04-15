"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { runAdjustment } from "@/lib/runAdjustment";
import { ecefToGeodetic } from "@/lib/coordinateConverter";
import { useRouter } from "next/navigation";

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
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hasil");
    if (stored) setData(JSON.parse(stored));

    const metode = localStorage.getItem("metode");
    if (metode) setMetode(metode);

    const pointList = localStorage.getItem("points");
    if (pointList) {
      const parsed = JSON.parse(pointList);

      setPointList(parsed);

      setSelectedPoints(parsed);
    }
  }, []);

  const togglePoint = (name: string) => {
    setSelectedPoints((prev) =>
      prev.includes(name)
      ? prev.filter((p) => p !== name)
      : [...prev, name]
    );
  };

  const closeModal = () => setOpenModal(null);
  const formatSnooping = () => {
    const name = selectedPoints;
    const v = data?.adj?.v || [];
    const std = data?.test?.snoop?.sqrtDiag || [];
    const res = data?.test?.snoop?.result || [];

    const rows = [];

    for (let i = 0; i < name.length; i++) {
      rows.push({
        no: name[i],

        vx: v[i * 3]?.[0],
        vy: v[i * 3 + 1]?.[0],
        vz: v[i * 3 + 2]?.[0],

        svx: std[i * 3],
        svy: std[i * 3 + 1],
        svz: std[i * 3 + 2],

        statusX: res[i * 3],
        statusY: res[i * 3 + 1],
        statusZ: res[i * 3 + 2],
      });
    }

    return rows;
  };
  const snoopData = formatSnooping();


  const unselected = pointList.filter(
    (p) => !selectedPoints.includes(p)
  );


  const unselectedRows = unselected.map((p) => ({
    no: p,
    vx: null,
    vy: null,
    vz: null,
    svx: null,
    svy: null,
    svz: null,
    statusX: null,
    statusY: null,
    statusZ: null,
  }));

  const finalRows = [...snoopData, ...unselectedRows];
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
  const handleRecalculate = async () => {
    try {
      const raw = localStorage.getItem("rawInput");
      if (!raw) return alert("Data awal tidak ada 😭");

    const parsed = JSON.parse(raw);

    const filtered = parsed.filter((item: any) =>
      selectedPoints.includes(item.point)
    );

    
    const result = await runAdjustment(filtered, metode!);

    setData(result);
    console.log("selectedPoints:", selectedPoints);
    console.log("filtered:", filtered);
    localStorage.setItem("hasil", JSON.stringify(result));

    alert("Recalculate berhasil");
  } catch (err) {
    console.error(err);
    alert("Gagal");
  }
  };
  const buildMapData = () => {
    if (!data) return [];

    const raw = JSON.parse(localStorage.getItem("rawInput") || "[]");
    const vVar = data?.adj?.vVar || [];

    const result = [];

    for (let i = 0; i < raw.length; i++) {
      const base = i * 3;
      const row = raw[i];

    
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

    router.push("/transformasi/input"); 
  };
  
  const renderTable = (matrix: number[][]) => {
    if (!matrix) return null;

 
    return (
      <div className="overflow-auto max-h-[300px] border rounded">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`border px-2 py-1 text-center ${
                      val === 0
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {val.toFixed ? val.toFixed(3) : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* MAP */}
      <div className="rounded-3xl h-[300px] overflow-hidden">
        {data && (
        <MapParamAnalysis data={buildMapData()} />
        )}
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
          <div className="flex justify-end mt-4">
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
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 w-[800px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {openModal === "global" && "Detail Uji Global"}
              {openModal === "snooping" && "Detail Data Snooping"}
            </h2>

            {/* ISI MODAL */}
            <div className="space-y-4 text-sm">
              {openModal === "global" && (
  <>
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
      X tabel (Chi-square):{" "}
      <span className="font-medium">
        {data?.test?.global?.Xtabel?.toFixed(6)}
      </span>
    </div>
    <button
    onClick={closeModal}
    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
  >
    Tutup
  </button>
  </>
)}

              {openModal === "snooping" && (
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2">
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
  <div className="overflow-auto max-h-[400px]">
    
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
        {finalRows.map((row: any, i: number) => (
          <tr
            key={i}
            className={`text-center ${
            !selectedPoints.includes(row.no) ? "opacity-40" : ""
            }`}>
            <td className="border p-2">
              <input
              type="checkbox"
              checked={selectedPoints.includes(row.no)}
              onChange={() => togglePoint(row.no)}
              />
            </td>
            <td className="border p-2">{row.no}</td>
            <td className="border p-2">{selectedPoints.includes(row.no) ? row.vx?.toFixed(4) : "-"}</td>
            <td className="border p-2">{selectedPoints.includes(row.no) ? row.svx?.toFixed(4) : "-"}</td>
            <td className="border p-2">
              {selectedPoints.includes(row.no)
                ? row.statusX === 1
                  ? "✔"
                  : "✖"
                : "-"}
            </td>

            <td className="border p-2">{selectedPoints.includes(row.no) ? row.vy?.toFixed(4) : "-"}</td>
            <td className="border p-2">{selectedPoints.includes(row.no) ? row.svy?.toFixed(4) : "-"}</td>
            <td className="border p-2">
              {selectedPoints.includes(row.no)
                ? row.statusY === 1
                  ? "✔"
                  : "✖"
                : "-"}
            </td>

            <td className="border p-2">{selectedPoints.includes(row.no) ? row.vz?.toFixed(4) : "-"}</td>
            <td className="border p-2">{selectedPoints.includes(row.no) ? row.svz?.toFixed(4) : "-"}</td>
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
    
  </div>
  <div className="flex justify-between mt-4">
  <button
    onClick={handleRecalculate}
    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
  >
    Recalculate
  </button>

  <button
    onClick={closeModal}
    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
  >
    Tutup
  </button>
</div>
  </div>
)}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}