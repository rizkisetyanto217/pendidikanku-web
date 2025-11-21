import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ArrowLeft, Loader2 } from "lucide-react";

/* Dashboard header (breadcrumb) */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* Ambil tipe & dummy API dari list */
import {
  type ClassBook,
  // helper dummy yang baru di-export
  fetchClassBooks,
  createClassBook,
  updateClassBook,
} from "../TeacherCSSTBookList";

/* ===========================
   Types & helpers
=========================== */

type FormValues = Omit<ClassBook, "id" | "created_at">;

type Params = {
  id: string; // classId
  bookId?: string; // opsional => kalau ada = edit
};

/* ===========================
   Component
=========================== */

export default function TeacherCSSTBookForm() {
  const { id: classId, bookId } = useParams<Params>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isEdit = !!bookId;

  /* ===========================
     Header / Breadcrumb
  ============================ */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: isEdit ? "Edit Buku" : "Tambah Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Detail Mapel" },
        {
          label: "Buku",
          href: "../books", // sesuaikan dengan struktur route-mu
        },
        { label: isEdit ? "Edit" : "Tambah" },
      ],
      actions: null,
    });
  }, [setHeader, isEdit]);

  /* ===========================
     State form
  ============================ */

  const [form, setForm] = useState<FormValues>({
    class_id: classId ?? "",
    title: "",
    author: "",
    subject: "",
    isbn: "",
    year: undefined,
    pages: undefined,
    status: "available",
    cover_url: "",
    description: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ===========================
     Load detail saat edit
  ============================ */

  const {
    data: detail,
    isLoading: loadingDetail,
    isError: detailError,
  } = useQuery({
    queryKey: ["class-book-detail", classId, bookId],
    enabled: isEdit && !!classId && !!bookId,
    queryFn: async () => {
      const list = await fetchClassBooks(classId!);
      const found = list.find((b) => b.id === bookId);
      if (!found) {
        throw new Error("Buku tidak ditemukan");
      }
      return found;
    },
  });

  useEffect(() => {
    if (!detail || !isEdit) return;
    setForm({
      class_id: detail.class_id,
      title: detail.title,
      author: detail.author ?? "",
      subject: detail.subject ?? "",
      isbn: detail.isbn ?? "",
      year: detail.year ?? undefined,
      pages: detail.pages ?? undefined,
      status: detail.status,
      cover_url: detail.cover_url ?? "",
      description: detail.description ?? "",
    });
  }, [detail, isEdit]);

  /* ===========================
     Mutations
  ============================ */

  const createMut = useMutation({
    mutationFn: async (payload: FormValues) => {
      setErrorMsg(null);
      const withClassId = { ...payload, class_id: classId ?? "" };
      return createClassBook(withClassId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-books", classId] });
      navigate(-1);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menambahkan buku.";
      setErrorMsg(msg);
    },
  });

  const updateMut = useMutation({
    mutationFn: async (payload: FormValues) => {
      if (!bookId || !classId) throw new Error("Buku tidak valid");
      setErrorMsg(null);
      const withClassId = { ...payload, class_id: classId };
      return updateClassBook(bookId, classId, withClassId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-books", classId] });
      navigate(-1);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengupdate buku.";
      setErrorMsg(msg);
    },
  });

  const submitting =
    createMut.isPending || updateMut.isPending || (isEdit && loadingDetail);

  /* ===========================
     Handlers
  ============================ */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("Judul buku wajib diisi.");
      return;
    }

    if (isEdit) {
      updateMut.mutate(form);
    } else {
      createMut.mutate(form);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  /* ===========================
     Render
  ============================ */

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex max-w-3xl flex-col gap-4 py-4">
        {/* Header lokal */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={handleBack}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-xl">
              {isEdit ? "Edit Buku" : "Tambah Buku"}
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {isEdit
                ? "Perbarui informasi buku yang digunakan di kelas ini."
                : "Tambahkan buku referensi atau materi yang digunakan di kelas ini."}
            </p>
          </div>
        </div>

        {/* Error detail saat edit */}
        {isEdit && detailError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-3 text-sm text-destructive">
              Tidak bisa memuat data buku. Coba kembali ke halaman sebelumnya.
            </CardContent>
          </Card>
        )}

        {/* Error submit */}
        {errorMsg && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-3 text-xs text-destructive">
              {errorMsg}
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Informasi Buku
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  placeholder="Contoh: Tahsin Juz Amma Dasar"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  disabled={submitting}
                />
                <p className="text-[11px] text-muted-foreground">
                  Nama buku seperti yang akan terlihat oleh guru & siswa.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author">Penulis</Label>
                  <Input
                    id="author"
                    placeholder="Nama penulis"
                    value={form.author ?? ""}
                    onChange={(e) => setField("author", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Mapel</Label>
                  <Input
                    id="subject"
                    placeholder="Contoh: Al-Qur'an, Fiqih, Matematika…"
                    value={form.subject ?? ""}
                    onChange={(e) => setField("subject", e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    placeholder="978-623-000-001"
                    value={form.isbn ?? ""}
                    onChange={(e) => setField("isbn", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2024"
                    value={form.year ?? ""}
                    onChange={(e) =>
                      setField(
                        "year",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="pages">Jumlah halaman</Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="120"
                    value={form.pages ?? ""}
                    onChange={(e) =>
                      setField(
                        "pages",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cover_url">URL Sampul (opsional)</Label>
                  <Input
                    id="cover_url"
                    placeholder="https://…"
                    value={form.cover_url ?? ""}
                    onChange={(e) => setField("cover_url", e.target.value)}
                    disabled={submitting}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Jika diisi, akan ditampilkan sebagai thumbnail di daftar
                    buku.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Ringkasan isi buku atau catatan penggunaan untuk kelas ini…"
                  value={form.description ?? ""}
                  onChange={(e) => setField("description", e.target.value)}
                  disabled={submitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={submitting}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Batal
            </Button>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan…
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Buku"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
