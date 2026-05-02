"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SaveProject({
  open,
  onOpenChange,
  projectName,
  setProjectName,
  handleSave,
  saving,
  saved,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simpan Project</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          placeholder="Nama project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => onOpenChange(false)}>Batal</button>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {saved ? "✓ Tersimpan" : saving ? "Loading..." : "Simpan"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}