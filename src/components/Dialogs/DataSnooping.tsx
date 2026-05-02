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
      <DialogContent className="!w-[1000px] !max-w-[1000px] p-0">

        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Detail Data Snooping</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[70vh] overflow-auto">

          <div className="flex gap-2 mb-3">
            <Button variant="secondary" onClick={selectAll}>
              Select All
            </Button>

            <Button variant="secondary" onClick={clearAll}>
              Clear
            </Button>
          </div>

          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-200">
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

        <DialogFooter className="px-6 py-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}