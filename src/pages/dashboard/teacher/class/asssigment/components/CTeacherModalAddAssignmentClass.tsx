// src/pages/sekolahislamku/assignment/ModalAddAssignmentClass.shadcn.tsx
import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export type AddAssignmentClassPayload = {
  title: string;
  kelas?: string;
  dueDate: string; // ISO string
  total: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddAssignmentClassPayload) => void;
};

/** Convert value from <input type="datetime-local"> (treated as local time) to ISO */
function localDateTimeToISO(local: string) {
  // local format: YYYY-MM-DDTHH:mm (maybe with :ss)
  if (!local) return "";
  const [d, t = "00:00"] = local.split("T");
  const [y, m, day] = d.split("-").map((n) => Number(n));
  const [hh, mm] = t.split(":").map((n) => Number(n));
  const dt = new Date();
  dt.setFullYear(y, (m || 1) - 1, day || 1);
  dt.setHours(hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
}

type FormProps = {
  title: string;
  setTitle: (v: string) => void;
  kelas: string;
  setKelas: (v: string) => void;
  dueDate: string; // datetime-local
  setDueDate: (v: string) => void;
  total: number;
  setTotal: (n: number) => void;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
  disableSubmit?: boolean;
};

function FormBody({
  title,
  setTitle,
  kelas,
  setKelas,
  dueDate,
  setDueDate,
  total,
  setTotal,
  error,
  onSubmit,
  onClose,
  disableSubmit,
}: FormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="px-5 pb-5 space-y-4"
    >
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
          placeholder="Contoh: Evaluasi Tajwid"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="kelas">Kelas (opsional)</Label>
        <Input
          id="kelas"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          placeholder="Contoh: TPA A"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Batas Pengumpulan</Label>
        <Input
          id="dueDate"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="total">Total Target</Label>
        <Input
          id="total"
          type="number"
          min={0}
          inputMode="numeric"
          value={Number.isNaN(total) ? 0 : total}
          onChange={(e) => setTotal(Number(e.target.value))}
        />
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Batal
        </Button>
        <Button type="submit" disabled={!!disableSubmit}>
          Simpan
        </Button>
      </div>
    </form>
  );
}

const ModalAddAssignmentClass: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [kelas, setKelas] = useState("");
  const [dueDate, setDueDate] = useState(""); // datetime-local string
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Tutup dengan ESC otomatis ditangani oleh shadcn (Dialog/Sheet).
  // Reset ketika modal tertutup.
  useEffect(() => {
    if (!open) {
      setTitle("");
      setKelas("");
      setDueDate("");
      setTotal(0);
      setError(null);
    }
  }, [open]);

  const isValid = useMemo(
    () => title.trim().length > 0 && !!dueDate,
    [title, dueDate]
  );

  const submit = () => {
    if (!isValid) {
      setError("Judul dan batas pengumpulan wajib diisi.");
      return;
    }
    const payload: AddAssignmentClassPayload = {
      title: title.trim(),
      kelas: kelas.trim() || undefined,
      dueDate: localDateTimeToISO(dueDate),
      total: Number(total) || 0,
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <>
      {/* Mobile: Sheet (bottom drawer) */}
      <div className="md:hidden">
        <Sheet
          open={open}
          onOpenChange={(v) => {
            if (!v) onClose();
          }}
        >
          <SheetContent
            side="bottom"
            className="h-auto max-h-[85svh] overflow-y-auto p-0"
          >
            <SheetHeader className="px-5 pt-5">
              <SheetTitle className="text-base">Tambah Tugas Kelas</SheetTitle>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetHeader>

            <FormBody
              title={title}
              setTitle={setTitle}
              kelas={kelas}
              setKelas={setKelas}
              dueDate={dueDate}
              setDueDate={setDueDate}
              total={total}
              setTotal={setTotal}
              error={error}
              onSubmit={submit}
              onClose={onClose}
              disableSubmit={!isValid}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Dialog (centered) */}
      <div className="hidden md:block">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            if (!v) onClose();
          }}
        >
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <DialogHeader className="px-5 pt-5">
              <DialogTitle className="text-base">
                Tambah Tugas Kelas
              </DialogTitle>
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

            <FormBody
              title={title}
              setTitle={setTitle}
              kelas={kelas}
              setKelas={setKelas}
              dueDate={dueDate}
              setDueDate={setDueDate}
              total={total}
              setTotal={setTotal}
              error={error}
              onSubmit={submit}
              onClose={onClose}
              disableSubmit={!isValid}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ModalAddAssignmentClass;
