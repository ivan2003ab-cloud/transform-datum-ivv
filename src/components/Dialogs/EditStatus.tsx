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

  const onSubmit = async () => {
    setLoading(true);
    try {
      const updated = editData.map((item: any) => {
        if (item.status !== "sekutu") {
          const { selected, ...rest } = item;
          return rest;
        }
        return item;
      });

      await handleRecalculate(updated);
    } catch (err) {
      console.error(err);
      alert("Recalculation gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[80vw] !max-w-[1000px] p-0">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg">
            Edit Status Titik
          </DialogTitle>
        </DialogHeader>

        {/* CONTENT */}
        <div className="h-[70vh] overflow-y-auto px-6 py-4">

          <table className="w-full text-[13px] border border-gray-300">

            <thead className="bg-gradient-to-r from-blue-800 to-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="p-3 border text-center">Point</th>
                <th className="p-3 border text-center">X1</th>
                <th className="p-3 border text-center">Y1</th>
                <th className="p-3 border text-center">Z1</th>
                <th className="p-3 border text-center">X2</th>
                <th className="p-3 border text-center">Y2</th>
                <th className="p-3 border text-center">Z2</th>
                <th className="p-3 border text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {editData.map((row: any, i: number) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-3 border font-medium text-center">
                    {row.point}
                  </td>

                  <td className="p-3 border text-center">
                    {row.x1?.toFixed(3)}
                  </td>
                  <td className="p-3 border text-center">
                    {row.y1?.toFixed(3)}
                  </td>
                  <td className="p-3 border text-center">
                    {row.z1?.toFixed(3)}
                  </td>

                  <td className="p-3 border text-center">
                    {row.x2?.toFixed(3)}
                  </td>
                  <td className="p-3 border text-center">
                    {row.y2?.toFixed(3)}
                  </td>
                  <td className="p-3 border text-center">
                    {row.z2?.toFixed(3)}
                  </td>

                  <td className="p-3 border text-center">
                    <select
                      value={row.status}
                      onChange={(e) => {
                        const updated = [...editData];
                        updated[i].status = e.target.value;
                        setEditData(updated);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                      disabled={loading}
                    >
                      <option value="sekutu">sekutu</option>
                      <option value="uji">uji</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t flex justify-between">

          <Button
            onClick={onSubmit}
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2"
          >
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? "Processing..." : "Recalculate"}
          </Button>

          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Tutup
            </Button>
          </DialogClose>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}