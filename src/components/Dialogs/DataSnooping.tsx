"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

/* STATUS ICON */
const StatusIcon = ({ value }: { value: number }) =>
  value === 1 ? (
    <Check className="w-4 h-4 text-green-600 mx-auto" />
  ) : (
    <X className="w-4 h-4 text-red-600 mx-auto" />
  );

export default function SnoopingDialog({
  open,
  onOpenChange,
  snoopRows,
  rawData,
  handleRecalculate,
  fTabel
}: any) {

  const renderStatus = (val: number, active: boolean) =>
    active ? <StatusIcon value={val} /> : "-";

  const togglePoint = (point: string) => {
    const updated = rawData.map((item: any) => {
      if (item.point !== point) return item;

      if (item.selected === "selected") {
        const { selected, ...rest } = item;
        return rest;
      }

      return { ...item, selected: "selected" };
    });

    handleRecalculate(updated);
  };

  const selectAll = () => {
    const updated = rawData.map((item: any) =>
      item.status === "sekutu"
        ? { ...item, selected: "selected" }
        : item
    );

    handleRecalculate(updated);
  };

  const clearAll = () => {
    const updated = rawData.map((item: any) => {
      const { selected, ...rest } = item;
      return rest;
    });

    handleRecalculate(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] md:w-[1000px] md:max-w-[1000px] max-h-[90vh] p-0">

        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Detail Data Snooping</DialogTitle>
        </DialogHeader>

        <div className="px-4 md:px-6 py-2 space-y-4 max-h-[70vh] overflow-y-auto">

          <div className="flex flex-row gap-2 mb-3">
            <Button variant="secondary" onClick={selectAll} className={"flex-1 sm:flex-none"}>
              Select All
            </Button>
            <Button variant="secondary" onClick={clearAll} className={"flex-1 sm:flex-none"}>
              Clear
            </Button>
          </div>
          <div className="overflow-auto border rounded-lg max-h-[45vh]">
          <table className="min-w-[950px] md:min-w-full text-xs md:text-sm w-full border-collapse border-gray-300">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border p-2">Use</th>
                <th className="border p-2">Point</th>
                <th className="border p-2">Vx</th>
                <th className="border p-2">Svx</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Vy</th>
                <th className="border p-2">Svy</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Vz</th>
                <th className="border p-2">Svz</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {snoopRows.map((row: any, i: number) => {
                const active = row.selected === "selected";

                return (
                  <tr key={i} className="text-center">
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => togglePoint(row.no)}
                      />
                    </td>

                    <td className="border p-2">{row.no}</td>

                    <td className="border p-2">
                      {active ? row.vx?.toFixed(4) : "-"}
                    </td>
                    <td className="border p-2">
                      {active ? row.svx?.toFixed(4) : "-"}
                    </td>
                    <td className="border p-2">
                      {renderStatus(row.statusX, active)}
                    </td>

                    <td className="border p-2">
                      {active ? row.vy?.toFixed(4) : "-"}
                    </td>
                    <td className="border p-2">
                      {active ? row.svy?.toFixed(4) : "-"}
                    </td>
                    <td className="border p-2">
                      {renderStatus(row.statusY, active)}
                    </td>

                    <td className="border p-2">
                      {active ? row.vz?.toFixed(4) : "-"}
                    </td>
                    <td className="border p-2">
                      {active ? row.svz?.toFixed(4) : "-"}
                    </td>
                    <td className="border p-2">
                      {renderStatus(row.statusZ, active)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        <DialogFooter className="px-4 md:px-6 pt-4 pb-6 md:pb-4 border-t flex flex-col items-start gap-3">

  {/* INFO */}
  <div className="flex flex-col gap-2 text-sm text-gray-700 w-full">

    {/* F TABLE */}
    <div className="font-medium text-blue-900">
      Nilai Tabel Fisher:{" "}
      {typeof fTabel === "number"
        ? fTabel.toFixed(3)
        : "-"}
    </div>

    {/* STATUS */}
    <div className="flex flex-row gap-2 items-center md:gap-6">

      <span className="flex items-center gap-2">
        <Check className="w-4 h-4 text-green-600" />

        Memenuhi uji Fisher
      </span>

      <span className="flex items-center gap-2">
        <X className="w-4 h-4 text-red-600" />

        Tidak memenuhi uji Fisher
      </span>
    </div>

    {/* NOTE */}
    <div className="text-gray-500 leading-relaxed">
      Tidak memenuhi uji Fisher menunjukkan bahwa data kemungkinan mengandung kesalahan kasar. Pengguna dapat menghapus data tersebut dengan melakukan unselect pada titik terkait.
    </div>
  </div>
  
        </DialogFooter>
          
      </DialogContent>
    </Dialog>
  );
}