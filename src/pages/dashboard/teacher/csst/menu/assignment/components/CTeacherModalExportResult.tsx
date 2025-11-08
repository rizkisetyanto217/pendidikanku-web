// src/pages/sekolahislamku/teacher/components/CTeacherModalExportResult.shadcn.tsx
import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  /** Terima FormData agar backend mudah menerima multipart */
  onExport: (form: FormData) => void;
};

export default function CTeacherModalExportResult({
  open,
  onClose,
  defaultName = "rekap-penilaian",
  onExport,
}: Props) {
  const [filename, setFilename] = useState(defaultName);
  const [format, setFormat] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [includeScores, setIncludeScores] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  // reset ketika dibuka
  useEffect(() => {
    if (!open) return;
    setFilename(defaultName);
    setFormat("xlsx");
    setIncludeScores(true);
    setFile(null);
  }, [open, defaultName]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("filename", (filename || defaultName).trim());
    fd.append("format", format);
    fd.append("includeScores", includeScores ? "1" : "0");
    if (file) fd.append("attachment", file); // key: attachment
    onExport(fd);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Hasil Penilaian</DialogTitle>
        </DialogHeader>

        <Separator />

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-4 pt-2"
        >
          {/* Nama file */}
          <div className="grid gap-1.5">
            <Label htmlFor="filename">Nama berkas</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="rekap-penilaian"
            />
          </div>

          {/* Format */}
          <div className="grid gap-1.5">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File (opsional) */}
          <div className="grid gap-1.5">
            <Label htmlFor="file">Lampiran (opsional)</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.csv,.pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} — {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          {/* Include scores */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="includeScores"
              checked={includeScores}
              onCheckedChange={(v) => setIncludeScores(Boolean(v))}
            />
            <Label htmlFor="includeScores" className="text-sm">
              Sertakan nilai siswa
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" className="gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
