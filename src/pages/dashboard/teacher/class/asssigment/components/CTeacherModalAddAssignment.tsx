// src/pages/sekolahislamku/assignment/ModalAddAssignment.shadcn.tsx
import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export type AddAssignmentPayload = {
  title: string;
  kelas?: string;
  dueDate: string; // ISO
  total: number;
};

interface ModalAddAssignmentProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddAssignmentPayload) => void;
}

function toLocalNoonISO(dateStr: string) {
  // Hindari geser zona waktu saat hanya memilih "tanggal" (tanpa jam)
  // Set jam 12:00 lokal agar aman dari DST dan offset
  const d = new Date(dateStr);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

const ModalAddAssignment: React.FC<ModalAddAssignmentProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [kelas, setKelas] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // reset saat modal ditutup
  useEffect(() => {
    if (!open) {
      setTitle("");
      setKelas("");
      setDueDate("");
      setTotal(0);
      setError(null);
    }
  }, [open]);

  const isValid = useMemo(() => {
    return title.trim().length > 0 && !!dueDate;
  }, [title, dueDate]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) {
      setError("Judul dan batas waktu wajib diisi.");
      return;
    }
    const payload: AddAssignmentPayload = {
      title: title.trim(),
      kelas: kelas.trim() || undefined,
      dueDate: toLocalNoonISO(dueDate),
      total: Number(total) || 0,
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="text-base">Tambah Tugas</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Terjadi Kesalahan</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Judul Tugas</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tugas Bab 1 - Pecahan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas (opsional)</Label>
            <Input
              id="kelas"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="Contoh: VII-B / IPA-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Batas Waktu</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total Siswa</Label>
            <Input
              id="total"
              type="number"
              min={0}
              value={Number.isNaN(total) ? 0 : total}
              onChange={(e) => setTotal(Number(e.target.value))}
              inputMode="numeric"
            />
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={!isValid}>
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalAddAssignment;
