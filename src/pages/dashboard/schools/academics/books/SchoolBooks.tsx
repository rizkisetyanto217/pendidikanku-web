// src/pages/sekolahislamku/dashboard-school/books/SchoolBooks.shadcn.tsx
import * as React from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ExternalLink,
  ImageOff,
  Pencil,
  Trash2,
  Info,
  Loader2,

  MoreHorizontal,
  Eye,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ✅ DataTable baru — sama seperti Academic */
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

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
function useBooksListPublic(params: { schoolId: string }) {
  const { schoolId } = params;
  return useQuery<BooksResponse>({
    queryKey: ["books-list-public", { schoolId }],
    queryFn: async () => {
      const r = await axios.get(
        `/public/${encodeURIComponent(schoolId)}/books/list`,
        { withCredentials: false, params: { _: Date.now() } }
      );
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
      })) as BookAPI[];
      return {
        data: mapped,
        pagination: { limit: mapped.length, offset: 0, total: mapped.length },
      };
    },
    placeholderData: (prev) =>
      prev ?? { data: [], pagination: { limit: 0, offset: 0, total: 0 } },
  });
}

/* =========================================================
   CRUD hooks
========================================================= */
function useCreateBook(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await axios.post(
        `/api/a/${encodeURIComponent(schoolId)}/books`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}
function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
      const { data } = await axios.patch(
        `/api/a/books/${encodeURIComponent(id)}`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}
function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(
        `/api/a/books/${encodeURIComponent(id)}`,
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}

/* =========================================================
   Actions Menu (Dropdown) — konsisten Academic
========================================================= */
function ActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView} className="gap-2">
            <Eye size={14} /> Lihat
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2">
            <Pencil size={14} /> Edit
          </DropdownMenuItem>
        )}
        {(onView || onEdit) && onDelete && <DropdownMenuSeparator />}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 size={14} /> Hapus
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  book: BookAPI | null;
  onSubmit: (data: FormData) => Promise<void> | void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(book?.books_title ?? "");
  const [author, setAuthor] = useState(book?.books_author ?? "");
  const [desc, setDesc] = useState(book?.books_desc ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    book?.books_image_url ?? null
  );

  React.useEffect(() => {
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
          <DialogTitle>
            {mode === "edit" ? "Edit Buku" : "Tambah Buku"}
          </DialogTitle>
          <DialogDescription>Isi informasi buku lalu simpan.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <div className="rounded-xl border bg-card">
                <AspectRatio ratio={3 / 4} className="grid place-items-center">
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
              <Input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="grid md:col-span-8 gap-3">
              <div className="grid gap-1">
                <Label>Judul *</Label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label>Penulis</Label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label>Deskripsi</Label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="min-h-[96px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
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
   Page — sama layout & interaksi dengan Academic
========================================================= */
export default function SchoolBooks() {
  const navigate = useNavigate();
  const params = useParams<{ schoolId?: string }>();
  const schoolId = params.schoolId || "";

  const booksQ = useBooksListPublic({ schoolId });
  const rows = booksQ.data?.data ?? [];
  const total = booksQ.data?.pagination?.total ?? 0;

  const createBook = useCreateBook(schoolId);
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalBook, setModalBook] = useState<BookAPI | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BookAPI | null>(null);

  /* ====== Kolom DataTable ====== */
  const columns = useMemo<ColumnDef<BookAPI>[]>(() => {
    return [
      {
        id: "no",
        header: "No",
        minW: "60px",
        align: "center",
        headerClassName: "w-[60px]",
        cell: (_row, meta) => <span>{(meta?.absoluteIndex ?? 0) + 1}</span>,
      },
      {
        id: "cover",
        header: "Cover",
        minW: "64px",
        align: "center",
        className: "align-middle",
        headerClassName: "w-[64px]",
        cell: (r) =>
          r.books_image_url ? (
            <img
              src={r.books_image_url}
              alt={r.books_title}
              className="h-14 w-10 rounded-md object-cover mx-auto"
            />
          ) : (
            <div className="grid h-14 w-10 place-items-center rounded-md bg-muted mx-auto">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
            </div>
          ),
      },
      {
        id: "title_author",
        header: "Judul & Penulis",
        align: "left",
        minW: "260px",
        cell: (r) => (
          <div className="text-left">
            <div className="truncate font-medium">{r.books_title}</div>
            <div className="truncate text-sm text-muted-foreground">
              {r.books_author || "-"}
            </div>
            {r.books_url && (
              <a
                href={r.books_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4"
                onClick={(e) => e.stopPropagation()}
                data-interactive
              >
                <ExternalLink className="h-3.5 w-3.5" /> Kunjungi
              </a>
            )}
          </div>
        ),
      },
      {
        id: "slug",
        header: "Slug",
        minW: "200px",
        align: "left",
        cell: (r) => r.books_slug ?? "-",
      },
    ];
  }, []);

  /* ====== Stats slot — sama gaya Academic ====== */
  const statsSlot = booksQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Memuat buku…
    </div>
  ) : booksQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4" /> Gagal memuat buku.
      </div>
      <Button size="sm" onClick={() => booksQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">{total} total</div>
  );

  /* ====== Actions (Dropdown) — konsisten Academic ====== */
  const renderActions = (r: BookAPI) => (
    <ActionsMenu
      onView={() =>
        navigate(`/${schoolId}/sekolah/buku/detail/${r.books_id}`, {
          state: { book: r },
        })
      }
      onEdit={() => {
        setModalMode("edit");
        setModalBook(r);
        setModalOpen(true);
      }}
      onDelete={() => {
        setDeleteTarget(r);
        setDeleteOpen(true);
      }}
    />
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          <DataTable<BookAPI>
            /* ===== Toolbar (sama Academic) ===== */
            title="Daftar Buku"
            onBack={() => navigate(-1)}
            onAdd={() => {
              setModalMode("create");
              setModalBook(null);
              setModalOpen(true);
            }}
            addLabel="Tambah"
            controlsPlacement="above"
            /* ===== Search ===== */
            defaultQuery=""
            searchPlaceholder="Cari judul, penulis, atau slug…"
            searchByKeys={["books_title", "books_author", "books_slug"]}
            /* ===== Stats ===== */
            statsSlot={statsSlot}
            /* ===== Data ===== */
            loading={booksQ.isLoading}
            error={
              booksQ.isError ? (booksQ.error as any)?.message ?? "Error" : null
            }
            columns={columns}
            rows={rows}
            getRowId={(r) => r.books_id}
            /* ===== UX ===== */
            defaultAlign="left"
            stickyHeader
            zebra
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            viewModes={["table", "card"]}
            defaultView="table"
            /* Aksi pakai Dropdown (renderActions) */
            renderActions={renderActions}
            /* Klik baris/card → detail */
            onRowClick={(r) =>
              navigate(`/${schoolId}/sekolah/buku/detail/${r.books_id}`, {
                state: { book: r },
              })
            }
            /* Renderer kartu */
            renderCard={(r) => (
              <div className="rounded-xl borderspace-y-3">
                <div className="flex gap-3">
                  <div className="w-16">
                    {r.books_image_url ? (
                      <img
                        src={r.books_image_url}
                        alt={r.books_title}
                        className="h-24 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="grid h-24 w-16 place-items-center rounded-md bg-muted">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{r.books_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.books_author || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.books_slug || "-"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">{renderActions(r)}</div>
              </div>
            )}
          />
        </div>
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
          else if (modalBook?.books_id)
            await updateBook.mutateAsync({
              id: modalBook.books_id,
              payload: fd,
            });
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Buku?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus buku{" "}
              <span className="font-medium">“{deleteTarget?.books_title}”</span>
              ?
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
