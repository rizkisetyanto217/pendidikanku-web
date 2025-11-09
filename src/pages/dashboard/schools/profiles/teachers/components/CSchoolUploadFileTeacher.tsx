// src/components/schools/CSchoolUploadFileTeacher.tsx
import React, { useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

/* ===== shadcn/ui yang sudah ada di project ===== */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* ===== Toast primitives milikmu (tanpa hook) ===== */
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  type ToastProps,
} from "@/components/ui/toast";

type Props = {
  open: boolean;
  onClose: () => void;
  // kept for backward-compat only; ignored
  palette?: unknown;
  /** Optional: callback saat upload diklik; return Promise utk handle loading */
  onUpload?: (file: File) => Promise<void> | void;
};

const ALLOWED = [
  ".csv",
  ".xls",
  ".xlsx",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const humanKB = (n: number) => `${(n / 1024).toFixed(1)} KB`;

const CSchoolUploadFileTeacher: React.FC<Props> = ({
  open,
  onClose,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ==== LOCAL TOAST (tanpa useToast) ====
  const [toastOpen, setToastOpen] = useState(false);
  const [toastVariant, setToastVariant] =
    useState<ToastProps["variant"]>("default");
  const [toastTitle, setToastTitle] = useState<string>("");
  const [toastDesc, setToastDesc] = useState<string>("");

  const showToast = (
    variant: ToastProps["variant"],
    title: string,
    description?: string
  ) => {
    setToastVariant(variant);
    setToastTitle(title);
    setToastDesc(description || "");
    setToastOpen(false); // reset supaya animasi muncul lagi
    requestAnimationFrame(() => setToastOpen(true));
  };

  const resetAll = () => {
    setFile(null);
    setError("");
    setSubmitting(false);
  };

  const handlePick = (f: File | null) => {
    if (!f) {
      resetAll();
      return;
    }
    const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
    const mimeOk = ALLOWED.includes(f.type);
    const extOk = ALLOWED.includes(ext);
    if (!mimeOk && !extOk) {
      setError("Format tidak didukung. Gunakan CSV atau Excel (xls/xlsx).");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    handlePick(f ?? null);
  };

  const onSubmit = async () => {
    if (!file || error) return;
    try {
      setSubmitting(true);
      if (onUpload) {
        await onUpload(file);
        showToast("default", "Upload berhasil", `${file.name} terkirim.`);
      } else {
        // fallback dummy
        console.log("Upload GURU (dummy):", file);
        showToast(
          "default",
          "Simulasi upload",
          `${file.name} diterima (dummy).`
        );
      }
      resetAll();
      onClose();
    } catch (e: any) {
      showToast(
        "destructive",
        "Gagal upload",
        e?.message ?? "Terjadi kesalahan tak terduga."
      );
      setSubmitting(false);
    }
  };

  return (
    <ToastProvider>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            resetAll();
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-secondary text-secondary-foreground">
                <Upload size={16} />
              </div>
              <div>
                <DialogTitle>Import Guru</DialogTitle>
                <DialogDescription>
                  Unggah file <b>CSV</b> atau <b>Excel</b> (xls/xlsx).
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Format yang didukung: <Badge variant="secondary">CSV</Badge>{" "}
              <Badge variant="secondary">XLS</Badge>{" "}
              <Badge variant="secondary">XLSX</Badge>
            </div>

            {/* Dropzone + picker */}
            <div
              className="border rounded-md px-4 py-8 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED.filter((x) => x.startsWith(".")).join(",")}
                className="hidden"
                onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet />
                <div className="text-sm">
                  {file ? (
                    <span className="font-medium">{file.name}</span>
                  ) : (
                    "Klik atau tarik file ke sini"
                  )}
                </div>
                {!file && (
                  <p className="text-xs text-muted-foreground">
                    Maks. 10MB. Hanya CSV/XLS/XLSX.
                  </p>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-destructive border border-destructive/40 bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            {/* Info file */}
            {file && !error && (
              <div className="text-xs border rounded-md px-3 py-2">
                <div>
                  <b>Nama:</b> {file.name}
                </div>
                <div>
                  <b>Ukuran:</b> {humanKB(file.size)}
                </div>
                <Button
                  variant="link"
                  className="px-0 h-auto mt-1 text-xs"
                  onClick={() => handlePick(null)}
                >
                  Ganti file
                </Button>
              </div>
            )}

            <Separator />

            {/* Keterangan mapping sederhana */}
            <div className="space-y-1">
              <Label>Template kolom (disarankan)</Label>
              <p className="text-xs text-muted-foreground">
                <code>name</code>, <code>email</code>, <code>phone</code>,{" "}
                <code>nip</code>, <code>subject</code>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetAll();
                onClose();
              }}
            >
              Batal
            </Button>
            <Button
              disabled={!file || !!error || submitting}
              onClick={onSubmit}
            >
              {submitting ? "Mengunggah..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renderer toast lokal (menggunakan primitives milikmu) */}
      <Toast
        variant={toastVariant}
        open={toastOpen}
        onOpenChange={setToastOpen}
        // auto close bisa ditambah pakai onOpenChange + timeout kalau perlu
      >
        <div className="grid gap-1">
          {toastTitle && <ToastTitle>{toastTitle}</ToastTitle>}
          {toastDesc && <ToastDescription>{toastDesc}</ToastDescription>}
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

export default CSchoolUploadFileTeacher;
