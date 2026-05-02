"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UjiGlobal({ open, onOpenChange, data }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Uji Global</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            Hasil:{" "}
            <span className={data?.test?.global?.result ? "text-green-600" : "text-red-600"}>
              {data?.test?.global?.result ? "Memenuhi" : "Tidak"}
            </span>
          </div>

          <div>Aposteriori: {data?.test?.global?.aposteriori?.toFixed(6)}</div>
          <div>X hitung: {data?.test?.global?.Xhitung?.toFixed(6)}</div>
          <div>X tabel: {data?.test?.global?.Xtabel?.toFixed(6)}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}