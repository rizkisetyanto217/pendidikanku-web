// src/pages/sekolahislamku/dashboard-school/books/SchoolBooks.tsx
import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ImageOff,
  Pencil,
  Trash2,
  Info,
  Loader2,
  MoreHorizontal,
  Eye,
  ArrowLeft,
} from "lucide-react";

/* ✅ Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

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
   Types (disesuaikan dengan /api/u/books/list)
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

export type BooksResponse = {
  data: BookAPI[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

/* =========================================================
   Fetch list (USER) - /api/u/books/list
========================================================= */
function useBooksList(params: { schoolId: string }) {
  const { schoolId } = params; // masih dipakai buat context & routing

  return useQuery<BooksResponse>({
    queryKey: ["books-list-public", { schoolId }],
    queryFn: async () => {
      const r = await axios.get<BooksResponse>("/u/books/list", {
        withCredentials: true,
        params: { _: Date.now() },
      });

      const rows = (r.data?.data ?? []) as BookAPI[];

      return {
        data: rows,
        pagination: r.data?.pagination,
      };
    },
    placeholderData: (prev) =>
      prev ?? {
        data: [],
        pagination: {
          page: 1,
          per_page: 0,
          total: 0,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      },
  });
}

/* =========================================================
   CRUD hooks (tetap pakai /api/a/... seperti sebelumnya)
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
  const [title, setTitle] = useState(book?.book_title ?? "");
  const [author, setAuthor] = useState(book?.book_author ?? "");
  const [desc, setDesc] = useState(book?.book_desc ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    book?.book_image_url ?? null
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
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolBooks({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Buku" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const params = useParams<{ schoolId?: string }>();
  const schoolId = params.schoolId || "";

  const booksQ = useBooksList({ schoolId });
  const rows = booksQ.data?.data ?? [];

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
          r.book_image_url ? (
            <img
              src={r.book_image_url}
              alt={r.book_title}
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
        align: "center",
        minW: "260px",
        cell: (r) => (
          <div>
            <div className="truncate font-medium">{r.book_title}</div>
            <div className="truncate text-sm text-muted-foreground">
              {r.book_author || "-"}
            </div>
          </div>
        ),
      },
      {
        id: "desc",
        header: "Deskripsi",
        minW: "260px",
        align: "center",
        cell: (r) => (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {r.book_desc || "—"}
          </div>
        ),
      },
      // ❌ Kolom slug dihapus dari table utama
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
    <div className="text-sm text-muted-foreground">
      Total buku: {rows.length}
    </div>
  );

  /* ====== Actions (Dropdown) — konsisten Academic ====== */
  const renderActions = (r: BookAPI) => (
    <ActionsMenu
      onView={() =>
        navigate(`/${schoolId}/sekolah/buku/${r.book_id}`, {
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
          {/* Header Back seperti SchoolAcademic */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="font-semibold text-lg md:text-xl">Daftar Buku</h1>
          </div>

          <DataTable<BookAPI>
            /* ===== Toolbar (sama Academic) ===== */
            onAdd={() => {
              setModalMode("create");
              setModalBook(null);
              setModalOpen(true);
            }}
            addLabel="Tambah"
            controlsPlacement="above"
            /* ===== Search ===== */
            defaultQuery=""
            searchPlaceholder="Cari judul atau penulis…"
            searchByKeys={["book_title", "book_author", "book_slug"]}
            /* ===== Stats ===== */
            statsSlot={statsSlot}
            /* ===== Data ===== */
            loading={booksQ.isLoading}
            error={
              booksQ.isError ? (booksQ.error as any)?.message ?? "Error" : null
            }
            columns={columns}
            rows={rows}
            getRowId={(r) => r.book_id}
            /* ===== UX ===== */
            defaultAlign="center"
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
              navigate(`${r.book_id}`, {
                state: { book: r },
              })
            }
            /* Renderer kartu */
            renderCard={(r) => (
              <div className="rounded-xl border space-y-3 p-3">
                <div className="flex gap-3">
                  <div className="w-16">
                    {r.book_image_url ? (
                      <img
                        src={r.book_image_url}
                        alt={r.book_title}
                        className="h-24 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="grid h-24 w-16 place-items-center rounded-md bg-muted">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{r.book_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.book_author || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {r.book_desc || "Belum ada deskripsi."}
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
          else if (modalBook?.book_id)
            await updateBook.mutateAsync({
              id: modalBook.book_id,
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
              <span className="font-medium">“{deleteTarget?.book_title}”</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return;
                await deleteBook.mutateAsync(deleteTarget.book_id);
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