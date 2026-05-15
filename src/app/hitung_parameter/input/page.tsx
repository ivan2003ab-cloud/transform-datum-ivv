"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { normalizeToCartesian } from "@/lib/coordinateConverter";
import { runAdjustment } from "@/lib/runAdjustment";
import { Upload, CircleHelp, Loader2, ArrowRight, FileSpreadsheet } from "lucide-react";
import { startInputGuide } from "@/components/Guide/inputguide";
import TemplateInput from "@/components/Dialogs/TemplateInput";

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
  const [parsing, setParsing] = useState(false);
  useEffect(() => {
  const alreadySeen = localStorage.getItem(
    "guide-input-page"
  );

  if (!alreadySeen) {
    setTimeout(() => {
      startInputGuide();
    }, 500);

    localStorage.setItem(
      "guide-input-page",
      "true"
    );
  }
}, []);

  const animatedButton =
  "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg active:scale-95";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setFileName(file.name);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const header = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

    const requiredCartesian = [
      "Titik",
      "Status",
      "X1",
      "Y1",
      "Z1",
      "X2",
      "Y2",
      "Z2",
      "SX2",
      "SY2",
      "SZ2",
    ];

    const requiredGeo = [
      "Titik",
      "Status",
      "Lat1",
      "Lon1",
      "H1",
      "Lat2",
      "Lon2",
      "H2",
      "SX2",
      "SY2",
      "SZ2",
    ];

    const required =
      struktur === "cartesian" ? requiredCartesian : requiredGeo;

    const isValid = required.every((col) => header.includes(col));

    if (!isValid) {
      alert(
        `Format file tidak sesuai template.\nKolom wajib:\n${required.join(", ")}`
      );
      setParsing(false);
      setParsedData([]);
      return;
    }

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

    setParsing(false);
  };

  const handleProses = async () => {
    if (!parsedData || parsedData.length === 0) {
      alert("Upload file dahulu sebelum memproses.");
      return;
    }
    const jumlahSekutu = parsedData.filter(
      (item) => item.status?.toLowerCase() === "sekutu"
      ).length;

    if (jumlahSekutu < 3) {
      alert("Minimal diperlukan 3 titik sekutu untuk melakukan perhitungan.");
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
    <div className="p-3 space-y-4 md:p-6 md:space-y-4">
      <div id="map-preview" className="rounded-3xl h-[300px] overflow-hidden border border-gray-200">
        {parsing ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Memuat data...
          </div>
        ) : parsedData.length > 0 ? (
          <MapParamInput data={parsedData} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Upload file untuk melihat preview map
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-100 to-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900">
          Input data
        </span>

        <div className="flex gap-3">
          <TemplateInput>
  <button
    id="template-button"
    className={`px-6 py-2 ${animatedButton}
    rounded-full
    bg-gradient-to-r
    from-blue-600
    to-blue-400
    text-white
    hover:opacity-90`}
  >
  <FileSpreadsheet size={16} className="md:hidden" />
  <span className="hidden md:inline">
    Template
  </span>
  </button>
</TemplateInput>

          <label id="upload-label" className={`px-6 py-2 ${animatedButton} flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-800 to-emerald-600 text-white hover:opacity-90 cursor-pointer`}>
            <Upload size={16} />
            <span className="hidden sm:inline">
            Upload
            </span>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {fileName && (
        <div className="text-sm text-gray-600">
          {fileName} ({parsedData.length} titik)
        </div>
      )}

      <div id="opsi-struktur">
        <h2 className="font-semibold text-lg mb-3 text-blue-900">
          Struktur data
        </h2>

      {/* HP */ }
        <select 
          value={struktur}
          onChange={(e) => setStruktur(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white md:hidden"
        >
        {strukturOptions.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
        </select>
        {/* Laptop */ }
        <div className="hidden md:grid md:grid-cols-3 gap-6">
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

      <div id="opsi-metode">
        <h2 className="font-semibold text-lg mb-3 text-blue-900">
          Metode Perataan
        </h2>
        {/* HP */ }
        <select 
          value={metode}
          onChange={(e) => setMetode(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white md:hidden"
        >
        {metodeOptions.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
        </select>
        {/* Laptop */ }
        <div className="hidden md:grid md:grid-cols-3 gap-6">
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

      <div className="flex justify-between items-center">
        <button
  onClick={startInputGuide}
  className={`
    px-6 py-3 rounded-xl
    bg-gradient-to-r
    from-blue-600
    to-cyan-400
    text-white font-semibold

    flex items-center gap-2

    ${animatedButton}
  `}
>
  <CircleHelp size={18} />
  <span className="hidden sm:inline">
    Bantuan
  </span>
</button>
        <button
          id ="proses-button"
          onClick={handleProses}
          disabled={loading}
          className={`px-4 md:px-8 py-3 rounded-xl ${animatedButton} bg-gradient-to-r from-emerald-800 to-emerald-600 text-white font-semibold hover:opacity-90 disabled:bg-gray-400`} 
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden md:inline">
                Memproses...
              </span>
            </>
          ) : (
            <>
          {/* HP */}
              <ArrowRight className="md:hidden" size={18}/>

          {/* Laptop */}
              <span className="hidden md:inline">
                Proses
              </span>
            </>
          )}
        </button>
      </div>

      
    </div>
  );
}