"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { normalizeToCartesian } from "@/lib/coordinateConverter";
import { runAdjustment } from "@/lib/runAdjustment";

const MapParamInput = dynamic(
  () => import("@/components/Map/mapParamInput"),
  { ssr: false }
);

export default function InputPage() {
  const router = useRouter();

  const [struktur, setStruktur] = useState("cartesian");
  const [metode, setMetode] = useState("bursa");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    let formatted: any[] = [];

    if (struktur === "cartesian") {
      formatted = json.map((row: any) => ({
        point: row.Titik,
        status: row.Status?.toLowerCase(),
        selected: "selected",
        x1: row.X1,
        y1: row.Y1,
        z1: row.Z1,
        x2: row.X2,
        y2: row.Y2,
        z2: row.Z2,
        sx2: row.SX2,
        sy2: row.SY2,
        sz2: row.SZ2,
      }));
    } else {
      const geo = json.map((row: any) => ({
        point: row.Titik,
        status: row.Status?.toLowerCase(),
        selected: "selected",
        lat1: row.Lat1,
        lon1: row.Lon1,
        h1: row.H1,
        lat2: row.Lat2,
        lon2: row.Lon2,
        h2: row.H2,
        sx2: row.SX2,
        sy2: row.SY2,
        sz2: row.SZ2,
      }));

      formatted = normalizeToCartesian(geo, struktur);
    }

    setParsedData(formatted);
    const pointList = formatted.map((item) => item.point);
    localStorage.setItem("points", JSON.stringify(pointList));
  };

  const downloadTemplate = (type:string) => {
    let filePath = "";

    if (type === "cartesian") {
      filePath = "/template-hitungparams-kartesi.xlsx";
    } else {
      filePath = "/template-hitungparams-geodetik.xlsx";
    }

    const link = document.createElement("a");
    link.href = filePath;
    const fileName = filePath.split("/").pop();
    link.download = fileName || "template.xlsx";
    link.click();

    setShowTemplatePopup(false);
  };

  const handleProses = async () => {
    if (!parsedData || parsedData.length === 0) {
      alert("Upload file dahulu sebelum memproses.");
      return;
    }

    try {
      setLoading(true);

      const result = await runAdjustment(parsedData, metode);

      localStorage.setItem("rawInput", JSON.stringify(parsedData));
      localStorage.setItem("hasil", JSON.stringify(result));
      localStorage.setItem("metode", metode);

      router.push("/hitung_parameter/analysis");
    } catch (err) {
      console.error(err);
      alert("Error saat memproses data.");
    } finally {
      setLoading(false);
    }
  };

  const strukturOptions = [
    { value: "cartesian", label: "Cartesian" },
    { value: "dd", label: "Geodetik (DD.DDDDD)" },
    { value: "dms", label: "Geodetik (DD.MMSSSS)" },
  ];

  const metodeOptions = [
    { value: "bursa", label: "Bursa-Wolf" },
    { value: "molodensky", label: "Molodensky Badekas" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* MAP */}
      <div className="rounded-3xl h-[300px] overflow-hidden border border-gray-200">
        {showMap ? (
          <MapParamInput data={parsedData} struktur={struktur} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Klik "Preview Map"
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="bg-gradient-to-r from-blue-100 to-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900">
          Input data
        </span>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplatePopup(true)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
          >
            Template
          </button>

          <label className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-800 to-emerald-600 text-white hover:opacity-90 cursor-pointer">
            Upload
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {/* FILE INFO */}
      <div className="flex items-center justify-between">
        {fileName && (
          <div className="text-sm text-gray-600">
            {fileName} ({parsedData.length} titik)
          </div>
        )}

        {fileName && (
          <button
            onClick={() => setShowMap(true)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:opacity-90"
          >
            Preview Map
          </button>
        )}
      </div>

      {/* STRUKTUR */}
      <div>
        <h2 className="font-semibold text-lg mb-3 text-blue-900">
          Struktur data
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {strukturOptions.map((item) => (
            <label key={item.value} className="flex items-center gap-2">
              <input
                type="radio"
                checked={struktur === item.value}
                onChange={() => setStruktur(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* METODE */}
      <div>
        <h2 className="font-semibold text-lg mb-3 text-blue-900">
          Metode Perataan
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {metodeOptions.map((item) => (
            <label key={item.value} className="flex items-center gap-2">
              <input
                type="radio"
                checked={metode === item.value}
                onChange={() => setMetode(item.value)}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleProses}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 text-white font-semibold hover:opacity-90 disabled:bg-gray-400"
        >
          {loading ? "Memproses..." : "Proses"}
        </button>
      </div>

      {/* POPUP */}
      {showTemplatePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[350px] space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold text-blue-900">
              Pilih Template
            </h2>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => downloadTemplate("cartesian")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-800 to-blue-600 text-white hover:opacity-90"
              >
                Cartesian (XYZ)
              </button>

              <button
                onClick={() => downloadTemplate("dd")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-800 to-blue-600 text-white hover:opacity-90"
              >
                Geodetik (Degree)
              </button>
            </div>

            <button
              onClick={() => setShowTemplatePopup(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}