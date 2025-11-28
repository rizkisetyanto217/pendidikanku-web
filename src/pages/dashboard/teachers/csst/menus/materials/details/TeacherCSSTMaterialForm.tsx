// src/pages/sekolahislamku/teacher/TeacherCSSTMaterialForm.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  Download,
  Link as LinkIcon,
  PlayCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { Material } from "../TeacherCSSTMaterialList";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =============================
   Types & Helpers
============================= */

type MaterialType = "article" | "file" | "link" | "youtube";

type FormValues = {
  title: string;
  type: MaterialType;
  description: string;
  content: string;
  url: string;
  fileName: string;
  fileSize: string;
};

const MATERIALS_QK = (classId: string) =>
  ["class", classId, "materials"] as const;

const TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: "article", label: "Artikel" },
  { value: "file", label: "File / PDF" },
  { value: "link", label: "Link" },
  { value: "youtube", label: "YouTube" },
];

/* =============================
   Page Component
============================= */

type Params = {
  id: string; // classId
  materialId?: string;
};

export default function TeacherCSSTMaterialForm() {
  const { id, materialId } = useParams<Params>();
  const classId = id;
  const isEdit = Boolean(materialId);

  const navigate = useNavigate();
  const qc = useQueryClient();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Tambah Materi",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Detail mapel", href: "akademik/ruangan" },
        { label: "Tambah Materi" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const [form, setForm] = useState<FormValues>({
    title: "",
    type: "article",
    description: "",
    content: "",
    url: "",
    fileName: "",
    fileSize: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  /* =============================
     Load data untuk edit
  ============================== */
  useEffect(() => {
    if (!isEdit || !classId || !materialId) return;

    const materials = qc.getQueryData<Material[]>(MATERIALS_QK(classId)) ?? [];

    const target = materials.find((m) => m.id === materialId);
    if (!target) {
      setNotFound(true);
      return;
    }

    setForm({
      title: target.title ?? "",
      type: (target.type as MaterialType) ?? "article",
      description: target.description ?? "",
      content: target.content ?? "",
      url: target.url ?? "",
      fileName: target.fileName ?? "",
      fileSize: target.fileSize ? String(target.fileSize) : "",
    });
  }, [isEdit, classId, materialId, qc]);

  const handleChange =
    (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleTypeChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      type: value as MaterialType,
      // reset field yang tidak relevan
      content: value === "article" ? prev.content : "",
      url: value === "article" ? "" : prev.url,
      fileName: value === "file" ? prev.fileName : "",
      fileSize: value === "file" ? prev.fileSize : "",
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  /* =============================
     Submit
  ============================== */

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!classId) {
      setErrorMsg("Class ID tidak ditemukan di URL.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMsg("Judul materi wajib diisi.");
      return;
    }

    if (form.type !== "article" && !form.url.trim()) {
      setErrorMsg("URL wajib diisi untuk jenis selain artikel.");
      return;
    }

    if (form.type === "file" && !form.fileName.trim()) {
      setErrorMsg("Nama file wajib diisi untuk jenis file/PDF.");
      return;
    }

    let parsedFileSize: number | undefined;
    if (form.fileSize.trim()) {
      const n = Number(form.fileSize);
      if (Number.isNaN(n) || n < 0) {
        setErrorMsg("Ukuran file harus berupa angka >= 0.");
        return;
      }
      parsedFileSize = n;
    }

    const nowISO = new Date().toISOString();

    qc.setQueryData<Material[]>(MATERIALS_QK(classId), (old = []) => {
      if (isEdit && materialId) {
        // update
        return old.map((m) =>
          m.id !== materialId
            ? m
            : {
                ...m,
                title: form.title.trim(),
                type: form.type,
                description: form.description.trim() || undefined,
                content:
                  form.type === "article"
                    ? form.content.trim() || undefined
                    : undefined,
                url:
                  form.type !== "article"
                    ? form.url.trim() || undefined
                    : undefined,
                fileName:
                  form.type === "file"
                    ? form.fileName.trim() || undefined
                    : undefined,
                fileSize:
                  form.type === "file"
                    ? parsedFileSize ?? undefined
                    : undefined,
                updatedAt: nowISO,
              }
        );
      }

      // create baru
      const newItem: Material = {
        id: `m-${Date.now()}`,
        classId,
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
        content:
          form.type === "article"
            ? form.content.trim() || undefined
            : undefined,
        url: form.type !== "article" ? form.url.trim() || undefined : undefined,
        fileName:
          form.type === "file" ? form.fileName.trim() || undefined : undefined,
        fileSize:
          form.type === "file" ? parsedFileSize ?? undefined : undefined,
        createdAt: nowISO,
        author: "Guru", // bisa diganti dari context guru kalau sudah ada
      };

      return [newItem, ...old];
    });

    setSuccessMsg(
      isEdit ? "Materi berhasil diperbarui." : "Materi berhasil dibuat."
    );

    // balik ke list setelah sedikit delay
    setTimeout(() => {
      navigate(-1);
    }, 600);
  };

  /* =============================
     Render
  ============================== */

  const isBusy = false; // nanti kalau pakai API beneran bisa diganti pakai state mutation

  const TypeIcon = ({ t }: { t: MaterialType }) =>
    t === "article" ? (
      <FileText className="h-4 w-4" />
    ) : t === "file" ? (
      <Download className="h-4 w-4" />
    ) : t === "link" ? (
      <LinkIcon className="h-4 w-4" />
    ) : (
      <PlayCircle className="h-4 w-4" />
    );

  return (
    <div className="w-full bg-background text-foreground py-6">
      <main className="mx-auto space-y-6">
        {/* Header */}
        <div className="md:flex hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-xl">
              {isEdit ? "Edit Materi" : "Tambah Materi"}
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {isEdit
                ? "Perbarui informasi materi pembelajaran kelas."
                : "Buat materi pembelajaran untuk kelas ini."}
            </p>
          </div>
        </div>

        {isEdit && notFound && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-3 text-sm text-destructive">
              Materi tidak ditemukan di cache. Kembali ke daftar materi lalu
              coba lagi.
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TypeIcon t={form.type} />
                Informasi Materi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Judul */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={handleChange("title")}
                  placeholder="Contoh: Adab Menuntut Ilmu"
                  disabled={isBusy}
                />
                <p className="text-xs text-muted-foreground">
                  Judul yang akan terlihat oleh siswa.
                </p>
              </div>

              {/* Jenis */}
              <div className="space-y-1.5">
                <Label>Jenis Materi</Label>
                <div className="flex items-center gap-3">
                  <Select
                    value={form.type}
                    onValueChange={handleTypeChange}
                    disabled={isBusy}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sesuaikan jenis dengan bentuk materi yang ingin dibagikan.
                </p>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange("description")}
                  placeholder="Ringkasan singkat materi untuk siswa…"
                  disabled={isBusy}
                />
              </div>
            </CardContent>
          </Card>

          {/* Konten spesifik per jenis */}
          {form.type === "article" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Isi Artikel</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="content"
                  rows={10}
                  value={form.content}
                  onChange={handleChange("content")}
                  placeholder="Tulis isi artikel (boleh markdown / plain text)…"
                  disabled={isBusy}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Siswa akan membaca konten ini langsung di aplikasi.
                </p>
              </CardContent>
            </Card>
          )}

          {(form.type === "link" || form.type === "youtube") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {form.type === "youtube" ? "URL YouTube" : "URL Materi"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="url">
                  {form.type === "youtube" ? "URL Video YouTube" : "URL"}
                </Label>
                <Input
                  id="url"
                  value={form.url}
                  onChange={handleChange("url")}
                  placeholder="https://…"
                  disabled={isBusy}
                />
                <p className="text-xs text-muted-foreground">
                  Pastikan URL dapat diakses oleh siswa.
                </p>
              </CardContent>
            </Card>
          )}

          {form.type === "file" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">File / Dokumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fileUrl">URL File</Label>
                  <Input
                    id="fileUrl"
                    value={form.url}
                    onChange={handleChange("url")}
                    placeholder="https://…/dokumen.pdf"
                    disabled={isBusy}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fileName">Nama File</Label>
                  <Input
                    id="fileName"
                    value={form.fileName}
                    onChange={handleChange("fileName")}
                    placeholder="dokumen.pdf"
                    disabled={isBusy}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fileSize">
                    Ukuran File (byte) – opsional
                  </Label>
                  <Input
                    id="fileSize"
                    type="number"
                    min={0}
                    value={form.fileSize}
                    onChange={handleChange("fileSize")}
                    placeholder="Contoh: 325120"
                    disabled={isBusy}
                  />
                  <p className="text-xs text-muted-foreground">
                    Hanya untuk informasi; tidak memengaruhi upload.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error / success */}
          {(errorMsg || successMsg) && (
            <Card className="border-muted/70 bg-muted/10">
              <CardContent className="py-3 text-xs">
                {errorMsg && <div className="text-destructive">{errorMsg}</div>}
                {successMsg && (
                  <div className="text-emerald-600">{successMsg}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={isBusy}>
              Batal
            </Button>
            <Button type="submit" disabled={isBusy} className="min-w-[150px]">
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
