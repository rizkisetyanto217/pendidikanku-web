import { useMemo, useRef, useState, useEffect } from "react";
import type { DragEvent } from "react";
import { UploadCloud, File as FileIcon, Trash2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    month: string;
    format: "xlsx" | "csv" | "pdf";
    file?: File | null;
  }) => void;
  accept?: string; // contoh: ".xlsx,.csv,.pdf"
  maxSizeMB?: number;
};

export default function SchoolExportModal({
  open,
  onClose,
  onSubmit,
  accept = ".xlsx,.csv,.pdf",
  maxSizeMB = 10,
}: ExportModalProps) {
  const [month, setMonth] = useState("");
  const [format, setFormat] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // reset saat dibuka
  useEffect(() => {
    if (!open) return;
    setMonth("");
    setFormat("xlsx");
    setFile(null);
    setIsDragging(false);
  }, [open]);

  const maxBytes = useMemo(() => maxSizeMB * 1024 * 1024, [maxSizeMB]);

  const handleFiles = (f?: File) => {
    if (!f) return;
    if (f.size > maxBytes) {
      alert(`Ukuran file melebihi ${maxSizeMB}MB`);
      return;
    }
    if (
      accept &&
      !accept
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .some((ext) => f.name.toLowerCase().endsWith(ext))
    ) {
      alert(`Tipe file tidak didukung. Boleh: ${accept}`);
      return;
    }
    setFile(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    handleFiles(f ?? undefined);
  };

  const submit = () => {
    onSubmit({ month, format, file: file ?? undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export / Upload Data</DialogTitle>
          <DialogDescription>
            Pilih periode, format export, dan (opsional) unggah file untuk
            diproses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Periode Bulan */}
          <div className="space-y-1">
            <Label htmlFor="month">Periode Bulan</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="yyyy-mm"
            />
          </div>

          {/* Format Export */}
          <div className="space-y-1">
            <Label htmlFor="format">Format Export</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Area (opsional) */}
          <div className="space-y-2">
            <Label>Upload File (opsional)</Label>

            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`rounded-2xl border border-dashed px-4 py-6 text-center cursor-pointer transition
                  ${isDragging ? "ring-2 ring-primary/60" : ""}`}
              >
                <div className="mx-auto mb-2 w-10 h-10 rounded-full grid place-items-center bg-muted">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-sm">Tarik & letakkan file di sini</p>
                <p className="text-xs text-muted-foreground mt-1">
                  atau klik untuk memilih. Boleh: {accept} • Maks {maxSizeMB}MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files?.[0])}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileIcon className="h-4 w-4" />
                  <div className="truncate">
                    <div className="text-sm truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  aria-label="Hapus file"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit}>
            {file ? "Upload & Proses" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
