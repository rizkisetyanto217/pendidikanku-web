// src/pages/sekolahislamku/assignment/ModalEditAssignment.tsx
import React, { useEffect, useMemo, useState } from "react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export type EditAssignmentPayload = {
  title: string;
  kelas?: string;
  dueDate: string; // ISO string
  total: number;
  submitted?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    title?: string;
    kelas?: string;
    dueDate?: string; // ISO
    total?: number;
    submitted?: number;
  };
  onSubmit: (payload: EditAssignmentPayload) => void;
  onDelete?: () => void; // jika diisi, tampilkan tombol Hapus
};

/** ISO -> value untuk <input type="datetime-local"> (tanpa timezone offset) */
const isoToLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

/** value "yyyy-MM-ddTHH:mm" -> ISO */
const localInputToISO = (val: string) => {
  if (!val) return new Date().toISOString();
  // new Date(val) akan dianggap lokal oleh browser
  return new Date(val).toISOString();
};

export default function CTeacherModalEditAssignment({
  open,
  onClose,
  defaultValues,
  onSubmit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [kelas, setKelas] = useState(defaultValues?.kelas ?? "");
  const [dueLocal, setDueLocal] = useState(
    isoToLocalInput(defaultValues?.dueDate)
  );
  const [total, setTotal] = useState<number>(defaultValues?.total ?? 0);
  const [submitted, setSubmitted] = useState<number | undefined>(
    defaultValues?.submitted
  );

  // Reset ketika dibuka / data berubah
  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setKelas(defaultValues?.kelas ?? "");
    setDueLocal(isoToLocalInput(defaultValues?.dueDate));
    setTotal(defaultValues?.total ?? 0);
    setSubmitted(defaultValues?.submitted);
  }, [
    open,
    defaultValues?.title,
    defaultValues?.kelas,
    defaultValues?.dueDate,
    defaultValues?.total,
    defaultValues?.submitted,
  ]);

  const disabled = useMemo(() => {
    return !title.trim() || !dueLocal || total < 0 || (submitted ?? 0) < 0;
  }, [title, dueLocal, total, submitted]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit({
      title: title.trim(),
      kelas: kelas.trim() || undefined,
      dueDate: localInputToISO(dueLocal),
      total: Number.isFinite(total) ? total : 0,
      submitted:
        submitted === undefined || Number.isNaN(submitted)
          ? undefined
          : submitted,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Tugas</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Perbarui informasi tugas dan simpan perubahan.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul */}
          <div className="grid gap-1.5">
            <Label htmlFor="title">Judul Tugas</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Evaluasi Wudhu"
            />
          </div>

          {/* Kelas (opsional) */}
          <div className="grid gap-1.5">
            <Label htmlFor="kelas">Kelas (opsional)</Label>
            <Input
              id="kelas"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="contoh: TPA A"
            />
          </div>

          {/* Batas Pengumpulan */}
          <div className="grid gap-1.5">
            <Label htmlFor="due">Batas Pengumpulan</Label>
            <Input
              id="due"
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
            />
          </div>

          {/* Total & Submitted */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="total">Total (target pengumpulan)</Label>
              <Input
                id="total"
                type="number"
                inputMode="numeric"
                min={0}
                value={Number.isFinite(total) ? total : 0}
                onChange={(e) => setTotal(Number(e.target.value || 0))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="submitted">Terkumpul (opsional)</Label>
              <Input
                id="submitted"
                type="number"
                inputMode="numeric"
                min={0}
                value={submitted ?? ""}
                onChange={(e) =>
                  setSubmitted(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                onClick={onDelete}
              >
                Hapus
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={disabled}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
