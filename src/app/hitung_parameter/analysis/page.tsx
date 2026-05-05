"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { runAdjustment } from "@/lib/runAdjustment";
import { ecefToGeodetic } from "@/lib/coordinateConverter";
import { useRouter } from "next/navigation";
import ResidualChart from "@/components/Chart/analysis";
import UjiGlobal from "@/components/Dialogs/UjiGlobal";
import DataSnooping from "@/components/Dialogs/DataSnooping";
import RmseDialog from "@/components/Dialogs/rmse";
import EditStatus from "@/components/Dialogs/EditStatus";
import SaveProject from "@/components/Dialogs/SaveProject";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil, Save } from "lucide-react";

const MapParamAnalysis = dynamic(
  () => import("@/components/Map/mapParamAnalysis"),
  { ssr: false }
);

export default function AnalysisPage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [metode, setMetode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [editData, setEditData] = useState<any[]>([]);
  const [jumlahSekutu, setJumlahSekutu] = useState(0);
  const [jumlahUji, setJumlahUji] = useState(0);

useEffect(() => {
  const stored = localStorage.getItem("hasil");
  const raw = localStorage.getItem("rawInput");

  if (!stored || !raw) return;

  const parsed = JSON.parse(stored);
  const rawData = JSON.parse(raw);

  // penting: inject raw terbaru
  parsed.pre.allData = rawData;

  setData(parsed);

  const metodeLS = localStorage.getItem("metode");
  if (metodeLS) setMetode(metodeLS);
}, []);
useEffect(() => {
  if (!data?.pre?.allData) return;

  const rawData = data.pre.allData;

  const count = rawData.reduce(
    (acc: { sekutu: number; uji: number }, item: any) => {
      const status = item.status?.toLowerCase().trim();

      if (status === "sekutu" && item.selected === "selected") acc.sekutu++;
      else if (status === "uji") acc.uji++;

      return acc;
    },
    { sekutu: 0, uji: 0 }
  );

  setJumlahSekutu(count.sekutu);
  setJumlahUji(count.uji);

}, [data]);

  const openEditStatus = () => {
    const raw = JSON.parse(localStorage.getItem("rawInput") || "[]");
    setEditData(raw);
    setOpenModal("editStatus");
  };
  const snoopRows = useMemo(() => {
  if (!data || !data.adj || !data.test) return [];

  const raw = data.pre.allData || [];

  const sekutu = raw.filter(
    (d: any) => d.status?.toLowerCase().trim() === "sekutu"
  );

  const v = data.adj.v || [];
  const std = data.test.snoop.sqrtDiag || [];
  const res = data.test.snoop.result || [];

  let calcIndex = 0;

  return sekutu.map((row: any) => {
    const active = row.selected === "selected";

    if (!active) {
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
      };
    }

    const base = calcIndex * 3;
    calcIndex++;

    return {
      no: row.point,
      selected: row.selected,
      vx: v[base]?.[0] ?? v[base],
      vy: v[base + 1]?.[0] ?? v[base + 1],
      vz: v[base + 2]?.[0] ?? v[base + 2],
      svx: std[base],
      svy: std[base + 1],
      svz: std[base + 2],
      statusX: res[base],
      statusY: res[base + 1],
      statusZ: res[base + 2],
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
    const jumlahSekutuAktif = rawData.filter(
    (item: any) =>
      item.status?.toLowerCase().trim() === "sekutu" &&
      item.selected === "selected"
  ).length;

  if (jumlahSekutuAktif < 3) {
    alert("Minimal diperlukan 3 titik sekutu aktif.");
    return;
  }
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
          titikSekutu: data?.pre?.titikSekutu,
          titikUji: data?.pre?.titikUji,
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
            fTabel: data?.test?.snoop?.fTabel,
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

  return (
    <div className="p-2 space-y-2">

    <Tabs defaultValue="map" className="w-full">

  {/* TAB SWITCH */}
  <div className="w-full flex justify-center">
    <TabsList className="bg-white border rounded-xl p-1 shadow">
      <TabsTrigger value="map" className="
    px-4 py-1 rounded-lg transition
    data-[state=active]:bg-gradient-to-r
    data-[state=active]:from-blue-600
    data-[state=active]:to-emerald-600
    data-[state=active]:text-white
  ">Peta</TabsTrigger>
      <TabsTrigger value="chart" className="
    px-4 py-1 rounded-lg transition
    data-[state=active]:bg-gradient-to-r
    data-[state=active]:from-blue-600
    data-[state=active]:to-emerald-600
    data-[state=active]:text-white
  ">Grafik</TabsTrigger>
    </TabsList>
  </div>

  {/* CONTENT WRAPPER */}
  <div className="relative w-full h-[45vh] min-h-[300px] max-h-[500px] rounded-3xl border border-gray-200 overflow-hidden">

    <TabsContent value="map" className="h-full mt-0">
      <MapParamAnalysis data={buildMapData()} />
    </TabsContent>

    <TabsContent value="chart" className="h-full mt-0">
      <ResidualChart
        raw={data?.pre?.allData || []}
        v={data?.adj?.v || []}
        rmse={data?.test?.rmse}
      />
    </TabsContent>

  </div>

</Tabs>
    <div className="flex items-center justify-between mb-6">
  <div className="flex gap-4">
    <div className="px-5 py-2 border border-blue-300 text-blue-600 rounded-xl text-sm font-medium bg-blue-50">
      Jumlah Titik Sekutu: {jumlahSekutu}
    </div>
    <div className="px-5 py-2 border border-blue-300 text-blue-600 rounded-xl text-sm font-medium bg-blue-50">
      Jumlah Titik Uji: {jumlahUji}
    </div>
  </div>

  <button
  onClick={openEditStatus}
  className="
    px-6 py-2 flex items-center gap-2
    bg-gradient-to-r from-emerald-700 to-emerald-600
    text-white rounded-full text-sm font-semibold
    transition-all duration-200
    hover:-translate-y-1 hover:scale-[1.03]
    hover:shadow-lg active:scale-[0.97]
  "
>
  <Pencil size={16} />
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
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:bg-blue-800 transition-all duration-200
  hover:-translate-y-1 hover:scale-[1.03]
  hover:shadow-lg active:scale-[0.97]"
          >
            Detail
          </button>
        </div>

        {/* Data Snooping */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">Data Snooping</span>

          <button
            onClick={() => setOpenModal("snooping")}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:bg-blue-800 transition-all duration-200
  hover:-translate-y-1 hover:scale-[1.03]
  hover:shadow-lg active:scale-[0.97]"
          >
            Detail
          </button>
        </div>

        {/* RMSE Titik Uji */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">RMSE Titik Uji</span>

          <button
            onClick={() => setOpenModal("rmse")}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:bg-blue-800 transition-all duration-200
  hover:-translate-y-1 hover:scale-[1.03]
  hover:shadow-lg active:scale-[0.97]"
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
              className="px-6 py-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:bg-green-500 transition-all duration-200
  hover:-translate-y-1 hover:scale-[1.03]
  hover:shadow-lg active:scale-[0.97]"
            >
              <Save size={16} /> Simpan
            </button>


            <button
              onClick={handleToTransform}
              className="px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all duration-200
  hover:-translate-y-1 hover:scale-[1.03]
  hover:shadow-lg active:scale-[0.97]"
            >
              Lanjutkan Transformasi Datum →
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* MODAL */}
  <EditStatus
  open={openModal === "editStatus"}
  onOpenChange={(v:any) => !v && setOpenModal(null)}
  editData={editData}
  setEditData={setEditData}
  handleRecalculate={handleRecalculate}
/>
<UjiGlobal
  open={openModal === "global"}
  onOpenChange={(v:any) => !v && setOpenModal(null)}
  data={data}
/>

<RmseDialog
  open={openModal === "rmse"}
  onOpenChange={(v:any) => !v && setOpenModal(null)}
  data={data}
/>

<SaveProject
  open={openModal === "save"}
  onOpenChange={(v:any) => !v && setOpenModal(null)}
  projectName={projectName}
  setProjectName={setProjectName}
  handleSave={handleSave}
  saving={saving}
  saved={saved}
/>

<DataSnooping
  open={openModal === "snooping"}
  onOpenChange={(v:any) => !v && setOpenModal(null)}
  snoopRows={snoopRows}
  rawData={data?.pre?.allData}
  handleRecalculate={handleRecalculate}
  fTabel={data?.test?.snoop?.fTabel}
/>
</div>
)};