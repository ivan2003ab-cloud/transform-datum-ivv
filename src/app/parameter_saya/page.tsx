"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ParameterSayaPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    fetch(`/api/project/list?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Pilih data dulu");
      return;
    }

    const confirmDelete = confirm(
      `Hapus ${selectedIds.length} project?`
    );
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/project/delete?id=${id}`, {
            method: "DELETE",
          })
        )
      );

      // update UI
      setProjects((prev) =>
        prev.filter((p) => !selectedIds.includes(p.id))
      );

      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Gagal hapus");
    }
  };

  const handleDetail = (project: any) => {
    localStorage.setItem(
      "hasil",
      JSON.stringify({
        adj: {
          params: project.parameter.params,
          xVar: project.parameter.xVar,
          v: project.snooping.v,
          vVar: project.snooping.vVar,
        },
        test: {
          global: project.globalTest,
          snoop: {
            result: project.snooping.result,
            sqrtDiag: project.snooping.std,
          },
          signif: {
            result: project.parameter.signif,
          },
          rmse: project.rmse,
        },
        pre: {rawData: project.rawData.rawData,
          avgX: project.rawData.avgX,
          avgY: project.rawData.avgY,
          avgZ: project.rawData.avgZ,
          titikSekutu: project.rawData.titikSekutu,
          titikUji: project.rawData.titikUji,
        },
        metode: project.metode,
      })
    );
    localStorage.setItem(
      "metode",project.metode);
    localStorage.setItem(
      "rawInput", JSON.stringify(project.rawData.rawData)
    );
    router.push("/hitung_parameter/analysis");
  };
  const handleCompare = () => {
  if (selectedIds.length !== 2) return;

  const selectedProjects = projects.filter((p) =>
    selectedIds.includes(p.id)
  );

  // simpan ke localStorage
  localStorage.setItem(
    "compareProjects",
    JSON.stringify(selectedProjects)
  );

  router.push("/parameter_saya/bandingkan");
};

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          Parameter Saya
        </h1>

        <div className="flex gap-3">
          {/* BANDINGKAN */}
            <button
              onClick={() => handleCompare()}
              disabled={selectedIds.length !== 2}
              className={`px-4 py-2 rounded text-white ${
                selectedIds.length === 2
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Bandingkan ({selectedIds.length}/2)
            </button>
        {/* DELETE BUTTON */}
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Hapus ({selectedIds.length})
        </button>
      </div>
    </div>
      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-xl shadow border"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 hover:bg-gray-50">
              
              {/* LEFT */}
              <div className="flex items-center gap-3">
                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(proj.id)}
                  onChange={() => handleSelect(proj.id)}
                />

                <div
                  onClick={() => toggle(proj.id)}
                  className="cursor-pointer"
                >
                  <div className="font-medium">
                    {proj.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(
                      proj.createdAt
                    ).toLocaleString()}, Metode: {proj.metode}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div
                onClick={() => toggle(proj.id)}
                className="cursor-pointer"
              >
                {openId === proj.id ? "▲" : "▼"}
              </div>
            </div>

            {/* DROPDOWN */}
            {openId === proj.id && (
              <div className="p-4 border-t bg-gray-50">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Parameter</th>
                      <th className="border p-2">Nilai</th>
                      <th className="border p-2">Simpangan Baku</th>
                    </tr>
                  </thead>

                  <tbody>
                    {proj.parameter?.params?.map(
                      (p: any, i: number) => {
                        let value = p[0];
                        const avgX = proj.rawData?.avgX || 0;
                        const avgY = proj.rawData?.avgY || 0;
                        const avgZ = proj.rawData?.avgZ || 0;
                        if (proj.metode === "molodensky") {
                          if (i === 0) value = value - avgX;
                          if (i === 1) value = value - avgY;
                          if (i === 2) value = value - avgZ;
                        }
                        if (i === 6) value = value + 1;

                        const variance =
                          proj.parameter?.xVar?.[i]?.[i] ||
                          0;
                        const std = Math.sqrt(variance);

                        return (
                          <tr
                            key={i}
                            className="text-center"
                          >
                            <td className="border p-2">
                              {
                                [
                                  "Tx",
                                  "Ty",
                                  "Tz",
                                  "Rx",
                                  "Ry",
                                  "Rz",
                                  "S",
                                ][i]
                              }
                            </td>

                            <td className="border p-2">
                              {value?.toFixed(6)}
                            </td>

                            <td className="border p-2">
                              {std?.toFixed(6)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>

                {/* GLOBAL TEST */}
                <div className="mt-3 text-sm">
                  Uji Global:{" "}
                  <span
                    className={`font-semibold ${
                      proj.globalTest?.result
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {proj.globalTest?.result
                      ? "Memenuhi"
                      : "Tidak"}
                  </span>
                </div>

                {/* BUTTON */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDetail(proj)}
                    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                  >
                    Detail →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}