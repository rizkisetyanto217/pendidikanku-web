// src/pages/sekolahislamku/dashboard-school/books/SchoolBooks.shadcn.tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ExternalLink,
  ImageOff,
  ArrowLeft,
  Pencil,
  Trash2,
  Info,
  Loader2,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ✅ Import toolbar baru
import { CMainSearchListButton } from "@/components/CMainSearchListButton";

/* =========================================================
   Types
========================================================= */
export type BookAPI = {
  books_id: string;
  books_school_id: string;
  books_title: string;
  books_author?: string | null;
  books_desc?: string | null;
  books_url?: string | null;
  books_image_url?: string | null;
  books_slug?: string | null;
  usages: any[];
};
export type BooksResponse = {
  data: BookAPI[];
  pagination?: { limit: number; offset: number; total: number };
};

/* =========================================================
   Fetch list public
========================================================= */
function useBooksListPublic(params: { schoolId: string; limit: number; offset: number }) {
  const { schoolId, limit, offset } = params;
  return useQuery<BooksResponse>({
    queryKey: ["books-list-public", { schoolId, limit, offset }],
    queryFn: async () => {
      const r = await axios.get(`/public/${encodeURIComponent(schoolId)}/books/list`, {
        withCredentials: false,
        params: { _: Date.now() },
      });
      const mapped = (r.data?.data ?? []).map((b: any) => ({
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
      const total = mapped.length;
      const sliced = mapped.slice(offset, Math.min(offset + limit, total));
      return { data: sliced, pagination: { limit, offset, total } };
    },
    placeholderData: (prev) => prev ?? { data: [], pagination: { limit, offset, total: 0 } },
  });
}

/* =========================================================
   CRUD hooks
========================================================= */
function useCreateBook(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.post(`/api/a/${encodeURIComponent(schoolId)}/books`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}
function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
      const { data } = await axios.patch(`/api/a/books/${encodeURIComponent(id)}`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}
function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/a/books/${encodeURIComponent(id)}`, {
        withCredentials: true,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}

/* =========================================================
   Modal Form
========================================================= */
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
  book: any | null;
  onSubmit: (data: FormData) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(book?.books_title ?? "");
  const [author, setAuthor] = useState(book?.books_author ?? "");
  const [desc, setDesc] = useState(book?.books_desc ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(book?.books_image_url ?? null);

  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("book_title", title);
    fd.set("book_author", author);
    fd.set("book_desc", desc);
    if (file) fd.set("file", file);
    await onSubmit(fd);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Buku" : "Tambah Buku"}</DialogTitle>
          <DialogDescription>Isi informasi buku lalu simpan.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <div className="rounded-xl border bg-card">
                <AspectRatio ratio={3 / 4} className="grid place-items-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-xs text-muted-foreground">
                      <ImageOff className="h-4 w-4" />
                      <span>Preview cover</span>
                    </div>
                  )}
                </AspectRatio>
              </div>
              <Input type="file" accept="image/*" className="mt-3" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="grid md:col-span-8 gap-3">
              <div className="grid gap-1">
                <Label>Judul *</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>Penulis</Label>
                <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label>Deskripsi</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-[96px]" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
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
export default function SchoolBooks() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const params = useParams<{ schoolId?: string }>();
  const schoolId = params.schoolId || "";

  const q = sp.get("q") ?? "";
  const setQ = (v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set("q", v);
    else next.delete("q");
    next.set("offset", "0");
    setSp(next, { replace: true });
  };

  const limit = Number(sp.get("limit") ?? 20);
  const offset = Number(sp.get("offset") ?? 0);
  const setLimit = (n: number) => {
    const next = new URLSearchParams(sp);
    next.set("limit", String(n));
    next.set("offset", "0");
    setSp(next, { replace: true });
  };

  const booksQ = useBooksListPublic({ schoolId, limit, offset });
  const data = booksQ.data?.data ?? [];
  const total = booksQ.data?.pagination?.total ?? 0;
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter((b) => [b.books_title, b.books_author].join("\n").toLowerCase().includes(t));
  }, [data, q]);

  const createBook = useCreateBook(schoolId);
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalBook, setModalBook] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BookAPI | null>(null);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-5 w-5" />
          Kembali
        </Button>
        <h1 className="text-lg font-semibold">Daftar Buku</h1>
      </div>

      {/* ✅ Gunakan komponen toolbar baru */}
      <div className="mx-auto w-full max-w-screen-2xl pt-4 md:pt-6">
        <CMainSearchListButton
          searchValue={q}
          onSearchChange={setQ}
          searchPlaceholder="Cari judul, penulis, atau slug…"
          showListSelect
          listValue={limit}
          listOptions={[10, 20, 50, 100, 200]}
          onListChange={setLimit}
          showButton
          buttonLabel="Buku"
          onButtonClick={() => {
            setModalMode("create");
            setModalBook(null);
            setModalOpen(true);
          }}
        />
      </div>

      <main className="mx-auto mt-3 max-w-screen-2xl space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between space-y-0 p-4 md:p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" /> Daftar Buku
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {booksQ.isFetching ? "memuat…" : `${total} total`}
            </div>
          </CardHeader>
          <Separator />

          <CardContent className="p-4 md:p-5">
            {booksQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat…
              </div>
            ) : total === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
                <Info className="h-4 w-4" /> Belum ada buku.
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">No</TableHead>
                      <TableHead className="w-[64px]">Cover</TableHead>
                      <TableHead>Judul & Penulis</TableHead>
                      <TableHead className="w-[200px]">Slug</TableHead>
                      <TableHead className="w-[220px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((r, i) => (
                      <TableRow key={r.books_id}>
                        <TableCell>{offset + i + 1}</TableCell>
                        <TableCell>
                          {r.books_image_url ? (
                            <img src={r.books_image_url} alt={r.books_title} className="h-14 w-10 rounded-md object-cover" />
                          ) : (
                            <div className="grid h-14 w-10 place-items-center rounded-md bg-muted">
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="truncate font-medium">{r.books_title}</div>
                          <div className="truncate text-sm text-muted-foreground">{r.books_author}</div>
                          {r.books_url && (
                            <a href={r.books_url} target="_blank" className="text-sm text-primary underline underline-offset-4 inline-flex items-center gap-1">
                              <ExternalLink className="h-3.5 w-3.5" /> Kunjungi
                            </a>
                          )}
                        </TableCell>
                        <TableCell>{r.books_slug ?? "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-1"
                              onClick={() => {
                                setModalMode("edit");
                                setModalBook(r);
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
            )}
          </CardContent>
        </Card>

        <div className="px-1 text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
      </main>

      {/* Modal & Delete Dialog */}
      <BookModal
        open={modalOpen}
        setOpen={setModalOpen}
        mode={modalMode}
        book={modalBook}
        submitting={createBook.isPending || updateBook.isPending}
        onSubmit={async (fd) => {
          if (modalMode === "create") await createBook.mutateAsync(fd);
          else if (modalBook?.books_id) await updateBook.mutateAsync({ id: modalBook.books_id, payload: fd });
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Buku?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus buku{" "}
              <span className="font-medium">“{deleteTarget?.books_title}”</span>?
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
}