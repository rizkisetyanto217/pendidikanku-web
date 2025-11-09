// src/pages/sekolahislamku/class/ModalEditManagementClass.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ClassInfo = {
  className?: string;
  students?: number;
  lastSubject?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  defaultValue?: ClassInfo;
  onSubmit: (val: ClassInfo) => Promise<void> | void;
};

export default function ModalEditManagementClass({
  open,
  onClose,
  title = "Edit Kelas",
  defaultValue,
  onSubmit,
}: Props) {
  const [className, setClassName] = useState(defaultValue?.className ?? "");
  const [students, setStudents] = useState<string>(
    typeof defaultValue?.students === "number"
      ? String(defaultValue.students)
      : ""
  );
  const [lastSubject, setLastSubject] = useState(
    defaultValue?.lastSubject ?? ""
  );
  const [loading, setLoading] = useState(false);

  // Reset setiap kali modal dibuka/prop berubah
  useEffect(() => {
    if (!open) return;
    setClassName(defaultValue?.className ?? "");
    setStudents(
      typeof defaultValue?.students === "number"
        ? String(defaultValue.students)
        : ""
    );
    setLastSubject(defaultValue?.lastSubject ?? "");
  }, [open, defaultValue]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await onSubmit({
        className: className.trim() || undefined,
        students: students ? Number(students) : undefined,
        lastSubject: lastSubject.trim() || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Kelas */}
          <div className="grid gap-1.5">
            <Label htmlFor="className">Nama Kelas</Label>
            <Input
              id="className"
              value={className}
              onChange={(e) => setClassName(e.currentTarget.value)}
              placeholder="Misal: TPA A / Kelas 7A"
            />
          </div>

          {/* Jumlah Siswa */}
          <div className="grid gap-1.5">
            <Label htmlFor="students">Jumlah Siswa</Label>
            <Input
              id="students"
              type="number"
              inputMode="numeric"
              min={0}
              value={students}
              onChange={(e) => setStudents(e.currentTarget.value)}
              placeholder="Misal: 30"
            />
          </div>

          {/* Pelajaran Terakhir */}
          <div className="grid gap-1.5">
            <Label htmlFor="lastSubject">Pelajaran Terakhir</Label>
            <Input
              id="lastSubject"
              value={lastSubject}
              onChange={(e) => setLastSubject(e.currentTarget.value)}
              placeholder="Misal: Tahfidz Juz 30"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
