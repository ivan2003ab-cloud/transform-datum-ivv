"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function rmse({ open, onOpenChange, data }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Hasil Pengujian Titik Uji</DialogTitle>
        </DialogHeader>

        {data?.test?.rmse?.rmse3D === null ? (
          <div className="text-center text-gray-500">
            Anda tidak mendefinisikan titik uji
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div>RMSE X: {data?.test?.rmse?.rmseX.toFixed(4)} m</div>
            <div>RMSE Y: {data?.test?.rmse?.rmseY.toFixed(4)} m</div>
            <div>RMSE Z: {data?.test?.rmse?.rmseZ.toFixed(4)} m</div>
            <div className="font-semibold">
              RMSE 3D: {data?.test?.rmse?.rmse3D.toFixed(4)} m
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}