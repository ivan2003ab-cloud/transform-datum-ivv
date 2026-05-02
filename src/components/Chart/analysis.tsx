import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ResidualChart({ raw, v, rmse }: any) {
  const [mode, setMode] = useState<"sekutu" | "uji">("sekutu");

  const buildSekutu = () => {
  let calcIndex = 0;

  return raw
    .filter(
      (p: any) =>
        p.status?.toLowerCase() === "sekutu" &&
        p.selected === "selected"
    )
    .map((p: any) => {
      const base = calcIndex * 3;
      calcIndex++;

      return {
        name: p.point,
        dx: v[base]?.[0] ?? 0,
        dy: v[base + 1]?.[0] ?? 0,
        dz: v[base + 2]?.[0] ?? 0,
      };
    });
};

  const buildUji = () => {
    if (!rmse?.hasil) return [];

    return rmse.hasil.map((p: any) => ({
      name: p.point,
      dx: p.dx,
      dy: p.dy,
      dz: p.dz,
    }));
  };

  const data = mode === "sekutu" ? buildSekutu() : buildUji();

  return (
    <div className="h-full w-full bg-white p-3 pt-10">
      {/* TOGGLE */}
      <div className="flex justify-center mb-3">
  <div className="flex items-center gap-2 text-sm font-semibold">
    <span>Residu Titik</span>

    <select
      value={mode}
      onChange={(e) => setMode(e.target.value as "sekutu" | "uji")}
      className="px-3 py-1 rounded-full bg-gray-100 border text-sm font-medium focus:outline-none"
    >
      <option value="sekutu">Sekutu</option>
      <option value="uji">Uji</option>
    </select>
    <span>(m)</span>
  </div>
</div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            fontSize={10}
            angle={-30}
            textAnchor="end"
            height={50}
          />

          <YAxis
            fontSize={10}
            tickFormatter={(v) => v.toFixed(2)}
          />

          <Tooltip formatter={(v: any) => Number(v).toFixed(4)} />

          <Legend wrapperStyle={{ fontSize: "10px" }} />

          <Bar dataKey="dx" fill="#3b82f6" name="ΔX" />
          <Bar dataKey="dy" fill="#f97316" name="ΔY" />
          <Bar dataKey="dz" fill="#9ca3af" name="ΔZ" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ResidualChart;