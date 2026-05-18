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
  // STATISTIK
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
  // COLOR LOGIC
  // =========================
  const getColor = (val: number, mean: number, std: number) => {
    if (std === 0) return "bg-gray-100";
    return Math.abs(val - mean) <= confidence * std
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700 font-semibold";
  };

  // =========================
  //SUBMIT
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
      <DialogContent className="w-[98vw] md:w-[80vw] lg:max-w-[1000px] max-h-[90vh] p-0">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Status Titik</DialogTitle>
        </DialogHeader>

        {/* CONTENT */}
        <div className="px-4 md:px-6 py-2 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* CONFIDENCE */}
          <div className="flex flex-row items-start gap-2 md:items-center mb-4">
            <span className="text-sm font-medium md">
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
          {/* TABLE */}
<div className="border rounded-lg overflow-hidden">

  {/* SCROLL AREA */}
  <div className="h-[45vh] overflow-auto">

    <table
      className="
      min-w-[650px]
      md:min-w-full
      w-full
      table-fixed
      border-collapse
      text-xs
      md:text-sm
    "
    >
      <colgroup>
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
      </colgroup>

      {/* HEADER */}
      <thead className="sticky top-0 z-20 bg-slate-800 text-white">

        <tr>
          <th className="p-2 text-center">
            Point
          </th>

          <th className="p-2 text-center">
            ΔX
          </th>

          <th className="p-2 text-center">
            ΔY
          </th>

          <th className="p-2 text-center">
            ΔZ
          </th>

          <th className="p-2 text-center">
            Status
          </th>
        </tr>

      </thead>

      <tbody>
        {editData.map((row: any, i: number) => {

          const dx =
            (row.x2 ?? 0) -
            (row.x1 ?? 0);

          const dy =
            (row.y2 ?? 0) -
            (row.y1 ?? 0);

          const dz =
            (row.z2 ?? 0) -
            (row.z1 ?? 0);

          return (

            <tr
              key={i}
              className={
                i % 2 === 0
                  ? "bg-white"
                  : "bg-gray-50"
              }
            >

              <td className="border p-2 text-center">
                {row.point}
              </td>

              <td
                className={`border p-2 text-center ${getColor(
                  dx,
                  stats.meanDx,
                  stats.stdDx
                )}`}
              >
                {dx.toFixed(3)}
              </td>

              <td
                className={`border p-2 text-center ${getColor(
                  dy,
                  stats.meanDy,
                  stats.stdDy
                )}`}
              >
                {dy.toFixed(3)}
              </td>

              <td
                className={`border p-2 text-center ${getColor(
                  dz,
                  stats.meanDz,
                  stats.stdDz
                )}`}
              >
                {dz.toFixed(3)}
              </td>

              <td className="border p-2 text-center">

                <select
                  value={row.status}
                  onChange={(e) => {
                    const updated =
                      [...editData];

                    updated[i].status =
                      e.target.value;

                    setEditData(updated);
                  }}
                  className="
                  border
                  rounded
                  px-2
                  py-1
                  text-xs
                  md:text-sm
                  w-full
                  max-w-[100px]
                "
                >
                  <option value="sekutu">
                    sekutu
                  </option>

                  <option value="uji">
                    uji
                  </option>

                </select>

              </td>

            </tr>

          );
        })}
      </tbody>

    </table>

  </div>


  {/* STATS */}
  <div className="border-t overflow-auto">

    <table
      className="
      min-w-[650px]
      md:min-w-full
      w-full
      table-fixed
      border-collapse
      text-xs
      md:text-sm
      bg-gray-100
      font-semibold
    "
    >

      <colgroup>
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
        <col className="w-[20%]" />
      </colgroup>

      <tbody>

        <tr>
          <td className="border p-2 text-center">
            Rata-rata
          </td>

          <td className="border p-2 text-center">
            {stats.meanDx.toFixed(3)}
          </td>

          <td className="border p-2 text-center">
            {stats.meanDy.toFixed(3)}
          </td>

          <td className="border p-2 text-center">
            {stats.meanDz.toFixed(3)}
          </td>

          <td className="border"></td>
        </tr>

        <tr>
          <td className="border p-2 text-center">
            Simpangan Baku
          </td>

          <td className="border p-2 text-center">
            {stats.stdDx.toFixed(3)}
          </td>

          <td className="border p-2 text-center">
            {stats.stdDy.toFixed(3)}
          </td>

          <td className="border p-2 text-center">
            {stats.stdDz.toFixed(3)}
          </td>

          <td className="border"></td>
        </tr>

      </tbody>

    </table>

  </div>

</div>

        </div>

        {/* FOOTER BUTTON */}
        <DialogFooter className="px-4 md:px-6 py-3 border-t flex flex-col gap-4 md:flex-row md:items-center">

          {/* LEGEND */}
          <div className="grid grid-cols-1 md:flex gap-3 text-xs md:text-sm">
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
          <div className="w-[150px] md:w-auto ml-auto">
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
            >
              {loading && <Spinner />}
              {loading ? "Processing..." : "Recalculate"}
            </Button>
          </div>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}