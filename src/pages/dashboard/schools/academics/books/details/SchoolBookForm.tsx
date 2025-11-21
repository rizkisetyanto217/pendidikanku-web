// src/pages/sekolahislamku/dashboard-school/books/SchoolBookForm.tsx
import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, ImageOff, Info, Loader2 } from "lucide-react";

/* Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

/* =========================================================
   Types — sama dengan SchoolBooks.tsx
========================================================= */
export type BookAPI = {
  book_id: string;
  book_school_id: string;
  book_title: string;
  book_author?: string | null;
  book_desc?: string | null;
  book_slug?: string | null;
  book_image_url?: string | null;
  book_image_object_key?: string | null;
  book_created_at?: string;
  book_updated_at?: string;
  book_is_deleted?: boolean;
};

type BookDetailResponse = {
  data?: BookAPI;
  [key: string]: any;
};

/* =========================================================
   Helpers
========================================================= */
function extractErrorMessage(err: any) {
  const d = err?.response?.data;
  if (!d) return err?.message || "Request error";
  if (typeof d === "string") return d;
  if (d.message) return d.message;
  if (Array.isArray(d.errors)) {
    return d.errors
      .map((e: any) => [e.field, e.message].filter(Boolean).join(": "))
      .join("\n");
  }
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
}

/* =========================================================
   Page Add/Edit Buku
========================================================= */
const SchoolBookForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ schoolId?: string; id?: string }>();
  const schoolId = params.schoolId ?? "";
  const bookId = params.id;
  const isEditMode = Boolean(bookId && bookId !== "new");

  const qc = useQueryClient();
  const { setHeader } = useDashboardHeader();

  // data dari state (kalau datang dari list)
  const stateBook = (location.state as { book?: BookAPI } | undefined)?.book;

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Edit Buku" : "Tambah Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        {
          label: "Buku",
          href: `/${schoolId}/sekolah/buku`,
        },
        { label: isEditMode ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEditMode, schoolId]);

  /* ========== Query detail (kalau edit & tidak bawa state) ========== */
  const detailQ = useQuery<BookAPI, Error>({
    queryKey: ["book-detail", bookId],
    enabled: isEditMode && !!bookId && !stateBook,
    queryFn: async () => {
      const res = await axios.get<BookDetailResponse>(`/u/books/${bookId}`, {
        withCredentials: true,
      });
      const data = (res.data as any).data ?? (res.data as any);
      return data as BookAPI;
    },
  });

  const book: BookAPI | undefined = useMemo(() => {
    if (stateBook) return stateBook;
    if (!isEditMode) return undefined;
    return detailQ.data;
  }, [stateBook, detailQ.data, isEditMode]);

  /* ========== Form state ========== */
  const [title, setTitle] = useState<string>(stateBook?.book_title ?? "");
  const [author, setAuthor] = useState<string>(stateBook?.book_author ?? "");
  const [desc, setDesc] = useState<string>(stateBook?.book_desc ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    stateBook?.book_image_url ?? null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // sinkron ketika detail book datang
  useEffect(() => {
    if (!book) return;
    setTitle(book.book_title ?? "");
    setAuthor(book.book_author ?? "");
    setDesc(book.book_desc ?? "");
    if (!file) {
      setPreview(book.book_image_url ?? null);
    }
  }, [book]);

  // handle preview file baru
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const canSubmit = title.trim().length > 0 && !!schoolId;

  /* ========== Mutations ========== */
  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data } = await axios.post(
        `/api/a/${encodeURIComponent(schoolId)}/books`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list-public"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data } = await axios.patch(
        `/api/a/books/${encodeURIComponent(bookId!)}`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list-public"] });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const loadingDetail = isEditMode && !book && detailQ.isLoading;
  const detailError = isEditMode && !book && detailQ.isError;

  const handleBack = () => {
    navigate(`/${schoolId}/sekolah/buku`);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setSubmitError(null);

      const fd = new FormData();
      fd.set("book_title", title.trim());
      fd.set("book_author", author ?? "");
      fd.set("book_desc", desc ?? "");
      if (file) {
        fd.set("file", file);
      }

      if (isEditMode && bookId) {
        updateMutation.mutate(fd, {
          onSuccess: () => {
            navigate(`/${schoolId}/sekolah/buku`, { replace: true });
          },
          onError: (err: any) => {
            setSubmitError(extractErrorMessage(err));
          },
        });
      } else {
        createMutation.mutate(fd, {
          onSuccess: () => {
            navigate(`/${schoolId}/sekolah/buku`, { replace: true });
          },
          onError: (err: any) => {
            setSubmitError(extractErrorMessage(err));
          },
        });
      }
    },
    [
      canSubmit,
      title,
      author,
      desc,
      file,
      isEditMode,
      bookId,
      schoolId,
      updateMutation,
      createMutation,
      navigate,
    ]
  );

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto max-w-3xl flex flex-col gap-4 lg:gap-6 py-4">
          {/* Header dengan tombol back */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEditMode ? "Edit Buku" : "Tambah Buku"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Perbarui informasi buku perpustakaan."
                  : "Tambah buku baru ke perpustakaan sekolah."}
              </p>
            </div>
          </div>

          {loadingDetail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat data buku…
            </div>
          )}

          {detailError && (
            <div className="rounded-xl border p-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" /> Gagal memuat data buku.
              </div>
              <pre className="text-xs opacity-70 overflow-auto">
                {extractErrorMessage(detailQ.error)}
              </pre>
              <Button size="sm" onClick={() => detailQ.refetch()}>
                Coba lagi
              </Button>
            </div>
          )}

          <Card className="border">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {isEditMode ? "Form Edit Buku" : "Form Tambah Buku"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-12 gap-4">
                  {/* Cover */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="rounded-xl border bg-card">
                      <AspectRatio
                        ratio={3 / 4}
                        className="grid place-items-center"
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-xs text-muted-foreground">
                            <ImageOff className="h-4 w-4" />
                            <span>Preview cover</span>
                          </div>
                        )}
                      </AspectRatio>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="book_file">Cover Buku</Label>
                      <Input
                        id="book_file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Kosongkan bila tidak ingin mengubah cover.
                      </p>
                    </div>
                  </div>

                  {/* Title, author, desc */}
                  <div className="md:col-span-8 grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="book_title">Judul *</Label>
                      <Input
                        id="book_title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Fiqih Ibadah Dasar"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="book_author">Penulis</Label>
                      <Input
                        id="book_author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Contoh: Ustadz Fulan"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="book_desc">Deskripsi</Label>
                      <Textarea
                        id="book_desc"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="min-h-[120px]"
                        placeholder="Ringkasan isi buku atau keterangan lain."
                      />
                    </div>
                  </div>
                </div>

                {/* Info kecil */}
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs md:text-sm text-muted-foreground flex gap-2">
                  <Info className="h-4 w-4 mt-[2px]" />
                  <div>
                    <div className="font-medium">Ringkasan</div>
                    <div className="mt-1">
                      <span className="font-semibold">
                        {title || "Judul belum diisi"}
                      </span>
                      {author && <span> — {author}</span>}
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs whitespace-pre-wrap">
                    <span className="font-medium">Gagal menyimpan:</span>{" "}
                    {submitError}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan…
                    </span>
                  ) : isEditMode ? (
                    "Simpan Perubahan"
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolBookForm;
