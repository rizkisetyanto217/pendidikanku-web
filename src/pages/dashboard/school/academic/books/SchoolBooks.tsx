// src/pages/sekolahislamku/dashboard-school/books/SchoolBooks.shadcn.tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ExternalLink,
  Search as SearchIcon,
  ImageOff,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Info,
  Loader2,
  BookOpen,
  Link as LinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";


/* =========================================================
   Types API (PUBLIC)
========================================================= */
export type SectionLite = {
  class_sections_id: string;
  class_sections_name: string;
  class_sections_slug?: string | null;
  class_sections_code?: string | null;
  class_sections_capacity?: number | null;
  class_sections_is_active: boolean;
};

export type UsageItem = {
  class_subject_books_id: string;
  class_subjects_id: string;
  subjects_id: string;
  classes_id: string;
  sections: SectionLite[];
};

export type BookAPI = {
  books_id: string;
  books_school_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
  books_slug?: string | null;
  usages: UsageItem[];
};

export type BooksResponse = {
  data: BookAPI[];
  pagination?: { limit: number; offset: number; total: number };
};

type PublicBook = {
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
type PublicBooksResponse = { data: PublicBook[] };

/* =========================================================
   Helpers & Form Types
========================================================= */
const yyyyMmDdLocal = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export type BookFormInput = {
  book_title: string;
  book_author?: string | null;
  book_desc?: string | null;
  books_url?: string | null;
  file?: File | null;
  files?: File[] | null;
  urls?: string[] | null;
};

function buildBookFormData(input: BookFormInput) {
  const fd = new FormData();
  fd.set("book_title", input.book_title);
  if (input.book_author != null) fd.set("book_author", input.book_author);
  if (input.book_desc != null) fd.set("book_desc", input.book_desc);
  if (input.books_url != null) fd.set("books_url", input.books_url);
  if (input.file) fd.set("file", input.file);
  if (input.files && input.files.length)
    input.files.forEach((f) => fd.append("files", f));
  if (input.urls && input.urls.length)
    fd.set("urls_json", JSON.stringify(input.urls));
  return fd;
}

/* =========================================================
   Data Hook: /public/{school_id}/books/list
========================================================= */
function useBooksListPublic(params: {
  schoolId: string;
  limit: number;
  offset: number;
}) {
  const { schoolId, limit, offset } = params;
  return useQuery<BooksResponse>({
    queryKey: ["books-list-public", { schoolId, limit, offset }],
    queryFn: async () => {
      const r = await axios.get<PublicBooksResponse>(
        `/public/${encodeURIComponent(schoolId)}/books/list`,
        { withCredentials: false, params: { _: Date.now() } }
      );

      const mapped: BookAPI[] = (r.data?.data ?? []).map((b) => ({
        books_id: b.book_id,
        books_school_id: b.book_school_id,
        books_title: b.book_title,
        books_author: b.book_author ?? null,
        books_desc: b.book_desc ?? null,
        books_url: null,
        books_image_url: b.book_image_url ?? null,
        books_slug: b.book_slug ?? null,
        usages: [],
      }));

      // simple client-pagination dari list public
      const total = mapped.length;
      const sliced = mapped.slice(offset, Math.min(offset + limit, total));
      return { data: sliced, pagination: { limit, offset, total } };
    },
    placeholderData: (prev) =>
      prev ?? { data: [], pagination: { limit, offset, total: 0 } },
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: "always",
    retry: 1,
  });
}

/* =========================================================
   Admin Mutations
========================================================= */
function useCreateBook(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BookFormInput) => {
      const fd = buildBookFormData(payload);
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
      await qc.refetchQueries({
        queryKey: ["books-list-public"],
        type: "active",
      });
    },
  });
}
function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { bookId: string; payload: BookFormInput }) => {
      const fd = buildBookFormData(args.payload);
      const { data } = await axios.patch(
        `/api/a/books/${encodeURIComponent(args.bookId)}`,
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
      await qc.refetchQueries({
        queryKey: ["books-list-public"],
        type: "active",
      });
    },
  });
}
function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data } = await axios.delete(
        `/api/a/books/${encodeURIComponent(bookId)}`,
        {
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["books-list-public"] });
      await qc.refetchQueries({
        queryKey: ["books-list-public"],
        type: "active",
      });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Gagal menghapus buku.");
    },
  });
}

/* =========================================================
   Modal: Create/Edit (shadcn Dialog)
========================================================= */
type BookLite = {
  books_id?: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
};
type BookModalForm = BookFormInput;

function BookModal({
  open,
  setOpen,
  mode,
  book,
  onSubmit,
  submitting,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  mode: "create" | "edit";
  book: BookLite | null;
  onSubmit: (data: BookModalForm) => Promise<void> | void;
  submitting?: boolean;
}) {
  const isEdit = mode === "edit";
  const DEFAULT_FORM: BookModalForm = {
    book_title: "",
    book_author: "",
    book_desc: "",
    books_url: "",
    file: null,
    files: null,
    urls: [],
  };
  const [form, setForm] = useState<BookModalForm>(DEFAULT_FORM);
  const [preview, setPreview] = useState<string | null>(
    book?.books_image_url ?? null
  );

  useEffect(() => {
    if (!open) return;
    if (isEdit && book) {
      setForm({
        book_title: book.books_title ?? "",
        book_author: book.books_author ?? "",
        book_desc: book.books_desc ?? "",
        books_url: book.books_url ?? "",
        file: null,
        files: null,
        urls: [],
      });
      setPreview(book.books_image_url ?? null);
    } else {
      setForm(DEFAULT_FORM);
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, book?.books_id]);

  useEffect(() => {
    if (!form.file) return;
    const u = URL.createObjectURL(form.file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [form.file]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && setOpen(v)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Buku" : "Tambah Buku"}</DialogTitle>
          <DialogDescription>
            Isi informasi buku lalu simpan. Bidang bertanda * wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-12">
            {/* Preview & File */}
            <div className="md:col-span-4">
              <div className="rounded-xl border bg-card">
                <AspectRatio ratio={3 / 4} className="grid place-items-center">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      className="h-full w-full rounded-xl object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-xs text-muted-foreground">
                      <ImageOff className="h-4 w-4" />
                      <span>Preview cover</span>
                    </div>
                  )}
                </AspectRatio>
              </div>
              <Input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={(e) =>
                  setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
                }
              />
            </div>

            {/* Form */}
            <div className="grid gap-3 md:col-span-8">
              <div className="grid gap-1">
                <Label>Judul *</Label>
                <Input
                  required
                  value={form.book_title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, book_title: e.target.value }))
                  }
                  placeholder="cth. Matematika Kelas 7"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label>Penulis</Label>
                  <Input
                    value={form.book_author ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, book_author: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label>URL</Label>
                  <Input
                    value={form.books_url ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, books_url: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label>Deskripsi</Label>
                <Textarea
                  value={form.book_desc ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, book_desc: e.target.value }))
                  }
                  className="min-h-[96px]"
                />
              </div>

              <div className="grid gap-1">
                <Label>
                  URL gambar eksternal (opsional) — Enter untuk menambah
                </Label>
                <Input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = (e.target as HTMLInputElement).value.trim();
                      if (!v) return;
                      setForm((f) => ({ ...f, urls: [...(f.urls ?? []), v] }));
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                {!!form.urls?.length && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {form.urls.map((u, i) => (
                      <span
                        key={i}
                        className="mr-2 inline-flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" /> {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!!submitting}
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!!submitting}>
              {submitting ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   Page
========================================================= */
const SchoolBooks: React.FC<{
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}> = ({ showBack = false, backTo, backLabel = "Kembali" }) => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // Ambil schoolId dari path param
  const params = useParams<{
    schoolId?: string;
    school_id?: string;
    slug?: string;
  }>();
  const schoolId = params.schoolId || params.school_id || "";
  const base = params.slug ? `/${encodeURIComponent(params.slug)}` : "";

  /* 🔎 Search sinkron URL */
  const q = sp.get("q") ?? "";
  const setQ = (val: string) => {
    const next = new URLSearchParams(sp);
    if (val) next.set("q", val);
    else next.delete("q");
    next.set("offset", "0");
    setSp(next, { replace: true });
  };

  /* ⏭ Pagination sinkron URL */
  const limit = Number(sp.get("limit") ?? 20);
  const offset = Number(sp.get("offset") ?? 0);
  const setLimit = (n: number) => {
    const next = new URLSearchParams(sp);
    next.set("limit", String(n));
    next.set("offset", "0");
    setSp(next, { replace: true });
  };
  const handlePrev = () => {
    const next = new URLSearchParams(sp);
    next.set("offset", String(Math.max(0, offset - limit)));
    setSp(next, { replace: true });
  };
  const handleNext = (total: number) => {
    const next = new URLSearchParams(sp);
    const newOffset = Math.min(offset + limit, Math.max(0, total - 1));
    next.set("offset", String(newOffset));
    setSp(next, { replace: true });
  };

  /* Fetch data */
  const booksQ = useBooksListPublic({ schoolId, limit, offset });
  const data = booksQ.data?.data ?? [];
  const total = booksQ.data?.pagination?.total ?? 0;

  /* Filter client-side dari q */
  const items = useMemo(() => {
    const text = (q || "").trim().toLowerCase();
    if (!text) return data;
    return data.filter((b) =>
      [b.books_title, b.books_author, b.books_slug]
        .filter(Boolean)
        .join("\n")
        .toLowerCase()
        .includes(text)
    );
  }, [data, q]);

  // *** Actions
  const createBook = useCreateBook(schoolId);
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalBook, setModalBook] = useState<BookLite | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BookAPI | null>(null);

  /* ====== Mobile Card ====== */
  const CardItem = (b: BookAPI) => (
    <Card
      key={b.books_id}
      className="cursor-pointer"
      onClick={() => {
        const qs = new URLSearchParams(sp).toString();
        const url = `${base}/sekolah/buku/detail/${b.books_id}${
          qs ? `?${qs}` : ""
        }`;
        navigate(url);
      }}
    >
      <CardContent className="flex gap-3 p-4">
        <div className="shrink-0">
          {b.books_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.books_image_url}
              alt={b.books_title}
              className="h-16 w-12 rounded-md object-cover"
            />
          ) : (
            <div className="grid h-16 w-12 place-items-center rounded-md bg-muted">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">
            {b.books_title || "(Tanpa judul)"}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {b.books_author || "-"}
          </div>
          {!!b.books_desc && (
            <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {b.books_desc}
            </div>
          )}
          <div
            className="mt-3 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {b.books_url && (
              <a
                href={b.books_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Kunjungi
              </a>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-1"
                onClick={() => {
                  setModalMode("edit");
                  setModalBook({
                    books_id: b.books_id,
                    books_title: b.books_title,
                    books_author: b.books_author,
                    books_desc: b.books_desc,
                    books_url: b.books_url,
                    books_image_url: b.books_image_url ?? undefined,
                  });
                  setModalOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={() => {
                  setDeleteTarget(b);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Header */}
      <div className="hidden items-center gap-2 border-b p-4 md:flex md:p-5">
        {showBack && (
          <Button
            variant="ghost"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {backLabel}
          </Button>
        )}
        <h1 className="text-base font-semibold md:text-lg">Daftar Buku</h1>
      </div>

      {/* Toolbar */}
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3 px-4 pt-4 md:px-6 md:pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul, penulis, atau slug…"
              className="w-full pl-9"
            />
            <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          <Select
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Per halaman" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100, 200].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / halaman
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="gap-1"
            onClick={() => {
              setModalMode("create");
              setModalBook(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Buku
          </Button>
        </div>
      </div>

      <main className="w-full">
        <div className="mx-auto mt-3 flex max-w-screen-2xl flex-col gap-6 px-4 md:px-6">
          {/* List */}
          <Card>
            <CardHeader className="flex items-center justify-between space-y-0 p-4 md:p-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" /> Daftar Buku
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {booksQ.isFetching
                  ? "memuat…"
                  : `${booksQ.data?.pagination?.total ?? 0} total`}
              </div>
            </CardHeader>
            <Separator />

            <CardContent className="p-4 md:p-5">
              {booksQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat…
                </div>
              ) : (booksQ.data?.pagination?.total ?? 0) === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" /> Belum ada buku.
                </div>
              ) : items.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" /> Tidak ada hasil untuk
                  pencarianmu.
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="grid gap-3 md:hidden">
                    {items.map((b) => CardItem(b))}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <div className="w-full overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">No</TableHead>
                            <TableHead className="w-[64px]">Cover</TableHead>
                            <TableHead>Judul & Penulis</TableHead>
                            <TableHead className="w-[200px]">Slug</TableHead>
                            <TableHead className="w-[160px]">
                              Dipakai di
                            </TableHead>
                            <TableHead className="w-[220px]">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((r, i) => (
                            <TableRow
                              key={r.books_id}
                              className="cursor-pointer"
                              onClick={() => {
                                const qs = new URLSearchParams(sp).toString();
                                const url = `${base}/sekolah/buku/detail/${
                                  r.books_id
                                }${qs ? `?${qs}` : ""}`;
                                navigate(url);
                              }}
                            >
                              <TableCell>{offset + i + 1}</TableCell>
                              <TableCell>
                                {r.books_image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={r.books_image_url}
                                    alt={r.books_title}
                                    className="h-14 w-10 rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="grid h-14 w-10 place-items-center rounded-md bg-muted">
                                    <ImageOff className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="min-w-0">
                                  <div className="truncate font-medium">
                                    {r.books_title || "(Tanpa judul)"}
                                  </div>
                                  <div className="truncate text-sm text-muted-foreground">
                                    {r.books_author || "-"}
                                  </div>
                                  {!!r.books_desc && (
                                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                      {r.books_desc}
                                    </div>
                                  )}
                                  {r.books_url && (
                                    <a
                                      href={r.books_url}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="mt-1 inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />{" "}
                                      Kunjungi
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{r.books_slug ?? "-"}</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="gap-1"
                                    onClick={() => {
                                      setModalMode("edit");
                                      setModalBook({
                                        books_id: r.books_id,
                                        books_title: r.books_title,
                                        books_author: r.books_author,
                                        books_desc: r.books_desc,
                                        books_url: r.books_url,
                                        books_image_url:
                                          r.books_image_url ?? undefined,
                                      });
                                      setModalOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1"
                                    onClick={() => {
                                      setDeleteTarget(r);
                                      setDeleteOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      {items.length
                        ? `${offset + 1}–${Math.min(
                            offset + limit,
                            total
                          )} dari ${total}`
                        : `0 dari ${total}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={offset <= 0}
                        onClick={handlePrev}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={offset + limit >= total}
                        onClick={() => handleNext(total)}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timestamp kecil */}
          <div className="px-1 text-sm text-muted-foreground">
            {yyyyMmDdLocal()}
          </div>
        </div>
      </main>

      {/* Create / Edit Dialog */}
      <BookModal
        open={modalOpen}
        setOpen={setModalOpen}
        mode={modalMode}
        book={modalBook}
        submitting={
          modalMode === "create" ? createBook.isPending : updateBook.isPending
        }
        onSubmit={async (form) => {
          if (modalMode === "create") {
            await createBook.mutateAsync(form);
          } else if (modalBook?.books_id) {
            await updateBook.mutateAsync({
              bookId: modalBook.books_id,
              payload: form,
            });
          }
        }}
      />

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Buku?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus buku{" "}
              <span className="font-medium">“{deleteTarget?.books_title}”</span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteBook.mutateAsync(deleteTarget.books_id);
                setDeleteOpen(false);
              }}
            >
              {deleteBook.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchoolBooks;
