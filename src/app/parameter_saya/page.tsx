"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ParameterSayaPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/project/list")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleDetail = (project: any) => {
    localStorage.setItem(
      "hasil",
      JSON.stringify({
        adj: {
          params: project.parameter.values,
          xVar: project.parameter.covariance,
        },
        test: {
          global: project.globalTest,
          snoop: {
            result: project.snooping.w,
            sqrtDiag: project.snooping.std,
          },
          signif: {
            result: project.parameter.signif,
          },
        },
        pre: {},
      })
    );

    router.push("/hitung_parameter/analysis");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Parameter Saya</h1>

      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-xl shadow border"
          >
            {/* HEADER */}
            <div
              onClick={() => toggle(proj.id)}
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">
                  {proj.name}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(proj.createdAt).toLocaleString()}
                </div>
              </div>

              <div>{openId === proj.id ? "▲" : "▼"}</div>
            </div>

            {/* DROPDOWN */}
            {openId === proj.id && (
              <div className="p-4 border-t bg-gray-50">
                {/* PARAMETER TABLE */}
                <table className="w-full text-sm border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border p-2">Parameter</th>
                      <th className="border p-2">Nilai</th>
                    </tr>
                  </thead>

                  <tbody>
                    {proj.parameter?.values?.map((p: any, i: number) => (
                      <tr key={i} className="text-center">
                        <td className="border p-2">
                          {["Tx", "Ty", "Tz", "Rx", "Ry", "Rz", "S"][i]}
                        </td>
                        <td className="border p-2">
                          {p[0]?.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* GLOBAL TEST STATUS */}
                <div className="mt-3 text-sm">
                  Uji Global:{" "}
                  <span
                    className={`font-semibold ${
                      proj.globalTest?.result
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {proj.globalTest?.result ? "Memenuhi" : "Tidak"}
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