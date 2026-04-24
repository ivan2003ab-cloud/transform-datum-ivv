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

function ResidualChart({ raw, v }: any) {
  const data = raw.map((p: any, i: number) => {
    const base = i * 3;
    return {
      name: p,
      dx: v[base]?.[0] ?? 0,
      dy: v[base + 1]?.[0] ?? 0,
      dz: v[base + 2]?.[0] ?? 0,
    };
  });

  return (
    <div className="h-full w-full bg-white pt-20 p-2">
      <h2 className="text-center text-sm font-semibold mb-2">
        Residu (m)
      </h2>

      <ResponsiveContainer width="100%" height={250}>
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