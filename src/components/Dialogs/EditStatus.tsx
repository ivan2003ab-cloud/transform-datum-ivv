"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function EditStatus({
  open,
  onOpenChange,
  editData,
  setEditData,
  handleRecalculate,
}: any) {
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(1);

  // =========================
  // 📊 STATISTIK
  // =========================
  const getStats = () => {
    if (!editData || editData.length === 0) {
      return {
        meanDx: 0,
        meanDy: 0,
        meanDz: 0,
        stdDx: 0,
        stdDy: 0,
        stdDz: 0,
      };
    }

    const dx = editData.map((r: any) => (r.x2 ?? 0) - (r.x1 ?? 0));
    const dy = editData.map((r: any) => (r.y2 ?? 0) - (r.y1 ?? 0));
    const dz = editData.map((r: any) => (r.z2 ?? 0) - (r.z1 ?? 0));

    const mean = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    const std = (arr: number[]) => {
      const m = mean(arr);
      return Math.sqrt(
        arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) /
          arr.length
      );
    };

    return {
      meanDx: mean(dx),
      meanDy: mean(dy),
      meanDz: mean(dz),
      stdDx: std(dx),
      stdDy: std(dy),
      stdDz: std(dz),
    };
  };

  const stats = getStats();

  // =========================
  // 🎯 COLOR LOGIC
  // =========================
  const getColor = (val: number, mean: number, std: number) => {
    if (std === 0) return "bg-gray-100";
    return Math.abs(val - mean) <= confidence * std
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700 font-semibold";
  };

  // =========================
  // 🚀 SUBMIT
  // =========================
  const onSubmit = async () => {
    setLoading(true);
    try {
      await handleRecalculate(editData);
    } catch (err) {
      console.error(err);
      alert("Recalculation gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[80vw] !max-w-[800px] p-0">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Status Titik</DialogTitle>
        </DialogHeader>

        {/* CONTENT */}
        <div className="px-6 py-1 space-y-4">

          {/* CONFIDENCE */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium">
              Tingkat kepercayaan:
            </span>
            <select
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="border px-2 py-1 rounded"
            >
              <option value={1}>68% (1σ)</option>
              <option value={2}>95% (2σ)</option>
              <option value={3}>99% (3σ)</option>
            </select>
          </div>

          {/* TABLE HEADER (FIXED) */}
          <div className="h-[45vh] overflow-y-auto border rounded-lg">

  <table className="w-full table-fixed text-sm border-collapse">

    {/*FIX LEBAR KOLOM */}
    <colgroup>
      <col className="w-[20%]" />
      <col className="w-[20%]" />
      <col className="w-[20%]" />
      <col className="w-[20%]" />
      <col className="w-[20%]" />
    </colgroup>

    {/* HEADER */}
    <thead className="bg-slate-800 text-white sticky top-0">
      <tr>
        <th className="p-2 text-center">Point</th>
        <th className="p-2 text-center">ΔX</th>
        <th className="p-2 text-center">ΔY</th>
        <th className="p-2 text-center">ΔZ</th>
        <th className="p-2 text-center">Status</th>
      </tr>
    </thead>

    {/* BODY */}
    <tbody>
      {editData.map((row: any, i: number) => {
        const dx = (row.x2 ?? 0) - (row.x1 ?? 0);
        const dy = (row.y2 ?? 0) - (row.y1 ?? 0);
        const dz = (row.z2 ?? 0) - (row.z1 ?? 0);

        return (
          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>

            <td className="p-2 text-center border">{row.point}</td>

            <td className={`p-2 text-center border ${getColor(dx, stats.meanDx, stats.stdDx)}`}>
              {dx.toFixed(3)}
            </td>

            <td className={`p-2 text-center border ${getColor(dy, stats.meanDy, stats.stdDy)}`}>
              {dy.toFixed(3)}
            </td>

            <td className={`p-2 text-center border ${getColor(dz, stats.meanDz, stats.stdDz)}`}>
              {dz.toFixed(3)}
            </td>

            <td className="p-2 text-center border">
              <select
                value={row.status}
                onChange={(e) => {
                  const updated = [...editData];
                  updated[i].status = e.target.value;
                  setEditData(updated);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="sekutu">sekutu</option>
                <option value="uji">uji</option>
              </select>
            </td>

          </tr>
        );
      })}
    </tbody>

  </table>
</div>

          {/* FOOTER FIXED */}
          <div className="mt-2 border rounded-lg overflow-hidden text-sm">

  <table className="w-full table-fixed border-collapse">

    <colgroup>
      <col className="w-[20%]" />
      <col className="w-[20%]" />
      <col className="w-[20%]" />
      <col className="w-[20%]" />
      <col className="w-[20%]" />
    </colgroup>

    <tbody className="bg-gray-100 font-semibold">

      <tr>
        <td className="p-2 text-center border">Rata-rata</td>
        <td className="p-2 text-center border">{stats.meanDx.toFixed(3)}</td>
        <td className="p-2 text-center border">{stats.meanDy.toFixed(3)}</td>
        <td className="p-2 text-center border">{stats.meanDz.toFixed(3)}</td>
        <td className="border"></td>
      </tr>

      <tr>
        <td className="p-2 text-center border">Simpangan Baku</td>
        <td className="p-2 text-center border">{stats.stdDx.toFixed(3)}</td>
        <td className="p-2 text-center border">{stats.stdDy.toFixed(3)}</td>
        <td className="p-2 text-center border">{stats.stdDz.toFixed(3)}</td>
        <td className="border"></td>
      </tr>

    </tbody>

  </table>
</div>

        </div>

        {/* FOOTER BUTTON */}
        <DialogFooter className="px-6 py-3 border-t flex items-center">

          {/* LEGEND */}
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
              <span>Memenuhi (±{confidence}σ)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
              <span>Tidak memenuhi</span>
            </div>
          </div>

          {/* BUTTON */}
          <div className="ml-auto flex gap-2">
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
            >
              {loading && <Spinner />}
              {loading ? "Processing..." : "Recalculate"}
            </Button>

            <DialogClose asChild>
              <Button variant="outline">Tutup</Button>
            </DialogClose>
          </div>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}