// src/pages/sekolahislamku/assignment/ModalEditAssignmentClass.shadcn.tsx
import { useEffect, useMemo, useState } from "react";
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

export type EditAssignmentPayload = {
  title: string;
  dueDate: string; // ISO
  total: number;
  submitted?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<{
    title: string;
    dueDate: string; // ISO
    total: number;
    submitted: number;
  }>;
  onSubmit: (payload: EditAssignmentPayload) => void;
};

/* ============== Utils waktu ============== */
const pad = (n: number) => String(n).padStart(2, "0");

/** ISO -> "yyyy-MM-ddTHH:mm" (untuk input datetime-local) */
function isoToLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** "yyyy-MM-ddTHH:mm" (local) -> ISO tanpa kejutan offset */
function localToISO(local: string) {
  if (!local) return new Date().toISOString();
  const [date, time = "00:00"] = local.split("T");
  const [y, m, day] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date();
  dt.setFullYear(y || 1970, (m || 1) - 1, day || 1);
  dt.setHours(hh || 0, mm || 0, 0, 0);
  return dt.toISOString();
}

/* ============== Body Form (dipakai Dialog & Sheet) ============== */
type FormBodyProps = {
  title: string;
  setTitle: (v: string) => void;
  dueLocal: string;
  setDueLocal: (v: string) => void;
  total: number;
  setTotal: (n: number) => void;
  submitted?: number;
  setSubmitted: (n: number | undefined) => void;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
  disableSubmit?: boolean;
};

function FormBody({
  title,
  setTitle,
  dueLocal,
  setDueLocal,
  total,
  setTotal,
  submitted,
  setSubmitted,
  error,
  onSubmit,
  onClose,
  disableSubmit,
}: FormBodyProps) {
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
          placeholder="Contoh: Evaluasi Wudhu"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Batas Pengumpulan</Label>
        <Input
          id="dueDate"
          type="datetime-local"
          value={dueLocal}
          onChange={(e) => setDueLocal(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total">Target Total</Label>
          <Input
            id="total"
            type="number"
            min={0}
            inputMode="numeric"
            value={Number.isNaN(total) ? 0 : total}
            onChange={(e) => setTotal(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="submitted">Terkumpul (opsional)</Label>
          <Input
            id="submitted"
            type="number"
            min={0}
            inputMode="numeric"
            value={submitted ?? ""}
            onChange={(e) =>
              setSubmitted(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end gap-2">
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

/* ============== Modal ============== */
export default function ModalEditAssignmentClass({
  open,
  onClose,
  defaultValues,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [dueLocal, setDueLocal] = useState(
    isoToLocalInput(defaultValues?.dueDate)
  );
  const [total, setTotal] = useState<number>(defaultValues?.total ?? 0);
  const [submitted, setSubmitted] = useState<number | undefined>(
    defaultValues?.submitted
  );
  const [error, setError] = useState<string | null>(null);

  // Reset saat modal dibuka / defaultValues berubah
  useEffect(() => {
    if (!open) return;
    setTitle(defaultValues?.title ?? "");
    setDueLocal(isoToLocalInput(defaultValues?.dueDate));
    setTotal(defaultValues?.total ?? 0);
    setSubmitted(defaultValues?.submitted);
    setError(null);
  }, [
    open,
    defaultValues?.title,
    defaultValues?.dueDate,
    defaultValues?.total,
    defaultValues?.submitted,
  ]);

  // ESC close (Dialog/Sheet sudah handle, tapi tidak masalah punya guard ini)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const disabled = useMemo(
    () => !title.trim() || !dueLocal || total < 0 || (submitted ?? 0) < 0,
    [title, dueLocal, total, submitted]
  );

  const submit = () => {
    if (disabled) {
      setError(
        "Harap lengkapi data dengan benar (judul & tanggal wajib, angka ≥ 0)."
      );
      return;
    }
    onSubmit({
      title: title.trim(),
      dueDate: localToISO(dueLocal),
      total: Number.isFinite(total) ? total : 0,
      submitted:
        submitted === undefined || Number.isNaN(submitted)
          ? undefined
          : submitted,
    });
    onClose();
  };

  return (
    <>
      {/* Mobile: Sheet */}
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
              <SheetTitle className="text-base">Edit Tugas</SheetTitle>
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
              dueLocal={dueLocal}
              setDueLocal={setDueLocal}
              total={total}
              setTotal={setTotal}
              submitted={submitted}
              setSubmitted={setSubmitted}
              error={error}
              onSubmit={submit}
              onClose={onClose}
              disableSubmit={disabled}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Dialog */}
      <div className="hidden md:block">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            if (!v) onClose();
          }}
        >
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <DialogHeader className="px-5 pt-5">
              <DialogTitle className="text-base">Edit Tugas</DialogTitle>
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
              dueLocal={dueLocal}
              setDueLocal={setDueLocal}
              total={total}
              setTotal={setTotal}
              submitted={submitted}
              setSubmitted={setSubmitted}
              error={error}
              onSubmit={submit}
              onClose={onClose}
              disableSubmit={disabled}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
