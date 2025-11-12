// src/pages/sekolahislamku/finance/CreateInvoiceModal.shadcn.tsx
import * as React from "react";
import { Calendar as CalendarIcon, PlusCircle, X } from "lucide-react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type FormValue = {
  title: string;
  amount: number | "";
  due_date: string; // yyyy-mm-dd
  class_name?: string;
  type?: string;
  student_id?: string;
  description?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;

  classOptions?: string[];
  typeOptions?: string[];
  studentOptions?: Array<{ value: string; label: string }>;

  onSubmit: (data: FormValue) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;

  defaultValues?: Partial<FormValue>;
};

export default function CreateInvoiceModalShadcn({
  open,
  onClose,
  classOptions = [],
  typeOptions = [],
  studentOptions = [],
  onSubmit,
  loading = false,
  error = null,
  defaultValues = {},
}: Props) {
  const [form, setForm] = React.useState<FormValue>({
    title: defaultValues.title ?? "",
    amount: defaultValues.amount ?? ("" as number | ""),
    due_date: defaultValues.due_date ?? new Date().toISOString().slice(0, 10),
    class_name: defaultValues.class_name ?? "",
    type: defaultValues.type ?? "",
    student_id: defaultValues.student_id ?? "",
    description: defaultValues.description ?? "",
  });

  // re-hydrate ketika modal dibuka ulang / default berubah
  React.useEffect(() => {
    if (!open) return;
    setForm({
      title: defaultValues.title ?? "",
      amount: defaultValues.amount ?? ("" as number | ""),
      due_date: defaultValues.due_date ?? new Date().toISOString().slice(0, 10),
      class_name: defaultValues.class_name ?? "",
      type: defaultValues.type ?? "",
      student_id: defaultValues.student_id ?? "",
      description: defaultValues.description ?? "",
    });
  }, [open, defaultValues]);

  const set = <K extends keyof FormValue>(k: K, v: FormValue[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canSubmit =
    !!form.title &&
    !!form.due_date &&
    form.amount !== "" &&
    Number(form.amount) > 0;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    await onSubmit({
      ...form,
      amount: Number(form.amount || 0),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent
        className="max-w-[720px] p-0 overflow-hidden"
        aria-describedby={undefined}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="p-0">
            <DialogHeaderBar onClose={onClose} />
          </CardHeader>

          <Separator />

          <CardContent className="p-4 md:p-6 space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Judul */}
              <div className="space-y-2">
                <Label htmlFor="inv-title">Judul</Label>
                <Input
                  id="inv-title"
                  placeholder="Contoh: SPP September"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>

              {/* Nominal */}
              <div className="space-y-2">
                <Label htmlFor="inv-amount">Nominal</Label>
                <Input
                  id="inv-amount"
                  type="number"
                  min={0}
                  placeholder="cth: 150000"
                  value={form.amount}
                  onChange={(e) =>
                    set(
                      "amount",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              {/* Jatuh Tempo */}
              <div className="space-y-2">
                <Label htmlFor="inv-due-date">Jatuh Tempo</Label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <Input
                    id="inv-due-date"
                    type="date"
                    value={form.due_date}
                    onChange={(e) => set("due_date", e.target.value)}
                  />
                </div>
              </div>

              {/* Jenis */}
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Select
                  value={form.type ?? ""}
                  onValueChange={(v) => set("type", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">(Kosong)</SelectItem>
                    {typeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kelas */}
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Select
                  value={form.class_name ?? ""}
                  onValueChange={(v) => set("class_name", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua / umum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua / umum</SelectItem>
                    {classOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Siswa */}
              <div className="space-y-2">
                <Label>Siswa (opsional)</Label>
                <Select
                  value={form.student_id ?? ""}
                  onValueChange={(v) => set("student_id", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {studentOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deskripsi */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="inv-desc">Deskripsi (opsional)</Label>
                <Textarea
                  id="inv-desc"
                  rows={3}
                  placeholder="Keterangan tambahan…"
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </div>

            {!canSubmit && (
              <p className="text-xs text-muted-foreground">
                * Wajib isi: Judul, Nominal & Jatuh Tempo
              </p>
            )}
          </CardContent>

          <Separator />

          <DialogFooter className="p-4 md:p-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
              {loading ? "Menyimpan…" : "Simpan Tagihan"}
            </Button>
          </DialogFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

/* ============== Subcomponents ============== */
function DialogHeaderBar({ onClose }: { onClose: () => void }) {
  return (
    <DialogHeader className="p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <PlusCircle className="h-4 w-4" />
          </span>
          <div>
            <DialogTitle className="leading-tight">Buat Tagihan</DialogTitle>
            <DialogDescription className="mt-0.5">
              Masukkan detail tagihan yang akan dibuat.
            </DialogDescription>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </DialogHeader>
  );
}
