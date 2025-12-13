// src/pages/sekolahislamku/dashboard-school/books/SchoolBookForm.tsx
import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Info, Loader2 } from "lucide-react";

/* Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
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

/* Custom */
import CPicturePreview from "@/components/costum/common/CPicturePreview";
import CActionsButton from "@/components/costum/common/buttons/CActionsButton";

/* ===================== Types ===================== */
export type BookAPI = {
  book_id: string;
  book_school_id: string;
  book_title: string;
  book_author?: string | null;
  book_desc?: string | null;
  book_slug?: string | null;
  book_image_url?: string | null;
  book_image_object_key?: string | null;

  book_purchase_url?: string | null;
  book_publisher?: string | null;
  book_publication_year?: number | null;

  book_created_at?: string;
  book_updated_at?: string;
  book_is_deleted?: boolean;
};

type BookDetailResponse = {
  success?: boolean;
  message?: string;
  data: BookAPI;
};

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

/* ===================== Form Values ===================== */
type BookFormValues = {
  book_title: string;
  book_author: string;
  book_desc: string;
  book_publisher: string;
  book_publication_year: string; // string biar input bisa kosong
  book_purchase_url: string;
};

const emptyValues: BookFormValues = {
  book_title: "",
  book_author: "",
  book_desc: "",
  book_publisher: "",
  book_publication_year: "",
  book_purchase_url: "",
};

const SchoolBookForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ schoolId?: string; id?: string }>();

  const schoolId = params.schoolId ?? "";
  const bookId = params.id;
  const isEditMode = Boolean(bookId && bookId !== "new");

  const qc = useQueryClient();
  const { setHeader } = useDashboardHeader();

  // optional: kalau kamu navigate dari list sambil bawa state
  const stateBook = (location.state as { book?: BookAPI } | null)?.book;

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Edit Buku" : "Tambah Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Buku", href: "akademik/buku" },
        { label: isEditMode ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEditMode]);

  /* ===================== Query detail (edit only) ===================== */
  const detailQ = useQuery<BookAPI, Error>({
    queryKey: ["book-detail", bookId],
    enabled: isEditMode && !!bookId && !stateBook,
    queryFn: async () => {
      const res = await axios.get<BookDetailResponse>(`/u/books/${bookId}`);
      return res.data.data;
    },
  });

  const book: BookAPI | undefined = useMemo(() => {
    if (stateBook) return stateBook;
    if (!isEditMode) return undefined;
    return detailQ.data;
  }, [stateBook, detailQ.data, isEditMode]);

  /* ===================== Form State ===================== */
  const [values, setValues] = useState<BookFormValues>(emptyValues);
  const [file, setFile] = useState<File | null>(null);

  // preview:
  // - edit mode: tampilkan image lama
  // - kalau pilih file baru: tampilkan object URL
  const [preview, setPreview] = useState<string | null>(null);

  // reset saat ganti mode / route id
  useEffect(() => {
    setValues(emptyValues);
    setFile(null);
    setPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, bookId]);

  // isi form saat edit dan book sudah ada
  useEffect(() => {
    if (!isEditMode) return;
    if (!book) return;

    setValues({
      book_title: book.book_title ?? "",
      book_author: (book.book_author ?? "") || "",
      book_desc: (book.book_desc ?? "") || "",
      book_publisher: (book.book_publisher ?? "") || "",
      book_publication_year:
        book.book_publication_year != null
          ? String(book.book_publication_year)
          : "",
      book_purchase_url: (book.book_purchase_url ?? "") || "",
    });

    // kalau belum pilih file baru, pake cover lama
    if (!file) {
      setPreview(book.book_image_url ?? null);
    }
  }, [isEditMode, book, file]);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);

    if (newFile) {
      setPreview(URL.createObjectURL(newFile));
      return;
    }

    // kalau user remove file:
    // edit mode → balik ke gambar lama
    // create mode → null
    if (isEditMode && book?.book_image_url) setPreview(book.book_image_url);
    else setPreview(null);
  };

  const canSubmit = values.book_title.trim().length > 0;

  const publicationYearNum = useMemo(() => {
    if (!values.book_publication_year.trim()) return null;
    const n = Number(values.book_publication_year);
    return Number.isFinite(n) ? n : NaN;
  }, [values.book_publication_year]);

  /* ===================== Mutations ===================== */
  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      // sesuai screenshot: POST api/a/books
      const { data } = await axios.post(`/api/a/books`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list-public"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      // kalau backend kamu beda path, tinggal ganti di sini
      const { data } = await axios.patch(`/api/a/books/${bookId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list-public"] });
      await qc.invalidateQueries({ queryKey: ["book-detail", bookId] });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleBack = () => navigate(-1);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      if (!canSubmit) return;

      // validasi publication year kalau diisi
      if (publicationYearNum !== null && !Number.isFinite(publicationYearNum)) {
        setSubmitError("Tahun terbit harus angka yang valid.");
        return;
      }

      const fd = new FormData();

      // sesuai keys form-data API
      fd.set("book_title", values.book_title.trim());

      if (values.book_author.trim())
        fd.set("book_author", values.book_author.trim());
      if (values.book_desc.trim()) fd.set("book_desc", values.book_desc.trim());
      if (values.book_publisher.trim())
        fd.set("book_publisher", values.book_publisher.trim());
      if (values.book_purchase_url.trim())
        fd.set("book_purchase_url", values.book_purchase_url.trim());

      if (publicationYearNum !== null) {
        fd.set("book_publication_year", String(publicationYearNum));
      }

      if (file) {
        fd.set("file", file);
      }

      if (isEditMode && bookId) {
        updateMutation.mutate(fd, {
          onSuccess: () =>
            navigate(`/${schoolId}/sekolah/buku`, { replace: true }),
          onError: (err: any) => setSubmitError(extractErrorMessage(err)),
        });
      } else {
        createMutation.mutate(fd, {
          onSuccess: () =>
            navigate(`/${schoolId}/sekolah/buku`, { replace: true }),
          onError: (err: any) => setSubmitError(extractErrorMessage(err)),
        });
      }
    },
    [
      canSubmit,
      publicationYearNum,
      values,
      file,
      isEditMode,
      bookId,
      navigate,
      schoolId,
      createMutation,
      updateMutation,
    ]
  );

  const loadingDetail = isEditMode && !book && detailQ.isLoading;
  const detailError = isEditMode && !book && detailQ.isError;

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="md:flex hidden items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="icon">
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

          {/* Loading / Error */}
          {loadingDetail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat data buku…
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
            </div>
          )}

          {/* FORM */}
          <Card className="border">
            <form id="bookForm" onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {isEditMode ? "Form Edit Buku" : "Form Tambah Buku"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-12 gap-4">
                  {/* Cover */}
                  <div className="md:col-span-4 space-y-3">
                    <Label>Cover Buku</Label>
                    <CPicturePreview
                      file={file}
                      preview={preview}
                      onFileChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isEditMode
                        ? "Kosongkan bila tidak ingin mengubah cover."
                        : "Upload cover (opsional)."}
                    </p>
                  </div>

                  {/* Fields */}
                  <div className="md:col-span-8 grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="book_title">Judul *</Label>
                      <Input
                        id="book_title"
                        required
                        value={values.book_title}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            book_title: e.target.value,
                          }))
                        }
                        placeholder="Contoh: Bahasa Indonesia Buku B Kelas 6"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="book_author">Penulis</Label>
                        <Input
                          id="book_author"
                          value={values.book_author}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              book_author: e.target.value,
                            }))
                          }
                          placeholder="Contoh: Salsa"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="book_publisher">Penerbit</Label>
                        <Input
                          id="book_publisher"
                          value={values.book_publisher}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              book_publisher: e.target.value,
                            }))
                          }
                          placeholder="Contoh: Harmoni buku"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="book_publication_year">
                          Tahun Terbit
                        </Label>
                        <Input
                          id="book_publication_year"
                          type="number"
                          inputMode="numeric"
                          value={values.book_publication_year}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              book_publication_year: e.target.value,
                            }))
                          }
                          placeholder="Contoh: 2022"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="book_purchase_url">URL Pembelian</Label>
                        <Input
                          id="book_purchase_url"
                          value={values.book_purchase_url}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              book_purchase_url: e.target.value,
                            }))
                          }
                          placeholder="Contoh: www.google.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="book_desc">Deskripsi</Label>
                      <Textarea
                        id="book_desc"
                        value={values.book_desc}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            book_desc: e.target.value,
                          }))
                        }
                        className="min-h-[120px]"
                        placeholder="Buku pengantar untuk pelajaran bahasa indonesia buku ke-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Ringkasan */}
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs md:text-sm text-muted-foreground flex gap-2">
                  <Info className="h-4 w-4 mt-[2px]" />
                  <div>
                    <div className="font-medium">Ringkasan</div>
                    <div className="mt-1">
                      <span className="font-semibold">
                        {values.book_title || "Judul belum diisi"}
                      </span>
                      {values.book_author && (
                        <span> — {values.book_author}</span>
                      )}
                      {values.book_publication_year && (
                        <span> ({values.book_publication_year})</span>
                      )}
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

              <CardFooter className="flex justify-end">
                <CActionsButton
                  onCancel={handleBack}
                  onSave={() => {
                    document
                      .getElementById("bookForm")
                      ?.dispatchEvent(
                        new Event("submit", { cancelable: true, bubbles: true })
                      );
                  }}
                  loadingSave={isSubmitting}
                />
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolBookForm;
