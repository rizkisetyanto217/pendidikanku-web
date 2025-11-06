// src/pages/sekolahislamku/teacher/components/ModalGrading.shadcn.tsx
import React, { useEffect, useState } from "react";


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

export type ModalGradingProps = {
  open: boolean;
  onClose: () => void;
  student?: { id: string; name: string; score?: number };
  assignmentTitle?: string;
  assignmentClassName?: string;
  onSubmit: (payload: { id: string; score: number }) => void;
};

export default function CTeacherModalGrading({
  open,
  onClose,
  student,
  assignmentTitle,
  assignmentClassName,
  onSubmit,
}: ModalGradingProps) {
  const [score, setScore] = useState<number | "">("");

  useEffect(() => {
    setScore(student?.score ?? "");
  }, [student]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (score === "") return;
    const n = Number(score);
    if (Number.isNaN(n) || n < 0 || n > 100) return;
    onSubmit({ id: student?.id ?? "new", score: n });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {student ? `Nilai ${student.name}` : "Buat Penilaian"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Isi nilai antara 0–100 untuk menyimpan penilaian.
          </DialogDescription>
        </DialogHeader>

        {/* Info siswa + konteks tugas */}
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Siswa: </span>
            <span className="font-medium">
              {student?.name ?? "Belum dipilih"}
            </span>
          </p>
          {assignmentClassName && (
            <p>
              <span className="text-muted-foreground">Kelas: </span>
              <span className="font-medium">{assignmentClassName}</span>
            </p>
          )}
          {assignmentTitle && (
            <p>
              <span className="text-muted-foreground">Tugas: </span>
              <span className="font-medium">{assignmentTitle}</span>
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="score">Nilai (0–100)</Label>
            <Input
              id="score"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={score}
              onChange={(e) =>
                setScore(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="contoh: 85"
            />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                score === "" || Number(score) < 0 || Number(score) > 100
              }
            >
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
