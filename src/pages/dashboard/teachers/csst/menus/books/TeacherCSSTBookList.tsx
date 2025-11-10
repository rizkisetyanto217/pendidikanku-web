// src/pages/sekolahislamku/teacher/books/ClassBooksPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Loader2, Eye } from "lucide-react";

/* ============ shadcn/ui ============ */
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

/* ============ DataTable (baru) ============ */
import {
  CDataTable,
  type ColumnDef,
  type Align,
} from "@/components/costum/table/CDataTable";

/* =========================================================
   CONFIG + TYPES
========================================================= */
const USE_DUMMY = true;

type BookStatus = "available" | "borrowed" | "archived";

export type ClassBook = {
  id: string;
  class_id: string;
  title: string;
  author?: string;
  subject?: string;
  isbn?: string;
  year?: number;
  pages?: number;
  status: BookStatus;
  cover_url?: string | null;
  description?: string | null;
  created_at?: string;
};

/* =========================================================
   DUMMY STORE (persist selama sesi)
========================================================= */
const _dummyStore: Record<string, ClassBook[]> = {};
function _seedIfEmpty(classId: string) {
  if (_dummyStore[classId]) return;
  const now = new Date().toISOString();
  _dummyStore[classId] = [
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: "Tahsin Juz Amma Dasar",
      author: "Ust. Fulan",
      subject: "Al-Qur'an",
      isbn: "978-623-000-001",
      year: 2023,
      pages: 120,
      status: "available",
      cover_url:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
      description: "Materi tajwid & makhraj huruf untuk pemula.",
      created_at: now,
    },
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: "Hafalan Doa Harian Anak",
      author: "Ustzh. Amina",
      subject: "Aqidah/Fiqih",
      isbn: "978-623-000-002",
      year: 2022,
      pages: 80,
      status: "borrowed",
      cover_url:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
      description: "Kumpulan doa sehari-hari dengan terjemah.",
      created_at: now,
    },
  ];
}

/* =========================================================
   API (dummy)
========================================================= */
async function fetchClassBooks(classId: string): Promise<ClassBook[]> {
  if (!classId) return [];
  if (USE_DUMMY) {
    _seedIfEmpty(classId);
    await new Promise((r) => setTimeout(r, 300));
    return [...(_dummyStore[classId] ?? [])];
  }
  return [];
}

async function createClassBook(input: Omit<ClassBook, "id" | "created_at">) {
  if (USE_DUMMY) {
    const item: ClassBook = {
      ...input,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    _seedIfEmpty(input.class_id);
    _dummyStore[input.class_id].unshift(item);
    await new Promise((r) => setTimeout(r, 250));
    return item;
  }
}

async function updateClassBook(
  id: string,
  classId: string,
  patch: Partial<ClassBook>
) {
  if (USE_DUMMY) {
    _seedIfEmpty(classId);
    const arr = _dummyStore[classId] ?? [];
    const idx = arr.findIndex((b) => b.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...patch } as ClassBook;
    }
    await new Promise((r) => setTimeout(r, 250));
    return arr[idx];
  }
}

async function deleteClassBook(id: string, classId: string) {
  if (USE_DUMMY) {
    _seedIfEmpty(classId);
    _dummyStore[classId] = (_dummyStore[classId] ?? []).filter(
      (b) => b.id !== id
    );
    await new Promise((r) => setTimeout(r, 200));
    return { ok: true };
  }
}

/* =========================================================
   QUERY KEYS
========================================================= */
const QK = {
  BOOKS: (classId: string) => ["class-books", classId] as const,
};

/* =========================================================
   UTIL
========================================================= */



/* ===================== Actions Menu ===================== */
function ActionsMenu({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <Eye size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView} className="gap-2">
          <Eye size={14} /> Lihat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil size={14} /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 size={14} /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ===================== Form Dialog ===================== */
function BookFormDialog({
  open,
  onClose,
  initial,
  onSubmit,
  loading,
  classId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<ClassBook>;
  onSubmit: (values: Omit<ClassBook, "id" | "created_at">) => void;
  loading?: boolean;
  classId: string;
}) {
  const [values, setValues] = useState<Omit<ClassBook, "id" | "created_at">>({
    class_id: classId,
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    subject: initial?.subject ?? "",
    isbn: initial?.isbn ?? "",
    year: initial?.year ?? undefined,
    pages: initial?.pages ?? undefined,
    status: (initial?.status as BookStatus) ?? "available",
    cover_url: initial?.cover_url ?? "",
    description: initial?.description ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setValues({
      class_id: classId,
      title: initial?.title ?? "",
      author: initial?.author ?? "",
      subject: initial?.subject ?? "",
      isbn: initial?.isbn ?? "",
      year: initial?.year ?? undefined,
      pages: initial?.pages ?? undefined,
      status: (initial?.status as BookStatus) ?? "available",
      cover_url: initial?.cover_url ?? "",
      description: initial?.description ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id, classId]);

  const set = <K extends keyof Omit<ClassBook, "id" | "created_at">>(
    k: K,
    v: Omit<ClassBook, "id" | "created_at">[K]
  ) => setValues((s) => ({ ...s, [k]: v }));

  const canSubmit = values.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Buku" : "Tambah Buku"}</DialogTitle>
          <DialogDescription>
            Lengkapi detail buku di bawah ini, kemudian simpan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm">Judul</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Penulis</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.author || ""}
              onChange={(e) => set("author", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Mapel</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.subject || ""}
              onChange={(e) => set("subject", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">ISBN</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.isbn || ""}
              onChange={(e) => set("isbn", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Tahun</label>
            <input
              type="number"
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.year ?? ""}
              onChange={(e) =>
                set("year", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          <div>
            <label className="text-sm">Halaman</label>
            <input
              type="number"
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.pages ?? ""}
              onChange={(e) =>
                set(
                  "pages",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>



          <div className="md:col-span-2">
            <label className="text-sm">URL Sampul (opsional)</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.cover_url || ""}
              onChange={(e) => set("cover_url", e.target.value)}
              placeholder="https://…"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm">Deskripsi (opsional)</label>
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none w-full"
              value={values.description || ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={!!loading}>
            Batal
          </Button>
          <Button
            onClick={() => onSubmit(values)}
            disabled={!canSubmit || !!loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== Page (pakai CDataTable) ===================== */
export default function TeacherBookList() {
  const { id: classId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!classId)
      console.warn("[ClassBooksPage] Missing :id (classId) in route");
  }, [classId]);

  const booksQ = useQuery({
    queryKey: QK.BOOKS(classId),
    queryFn: () => fetchClassBooks(classId),
    enabled: !!classId,
    staleTime: 2 * 60_000,
    placeholderData: (prev) => prev ?? [],
  });

  const createBook = useMutation({
    mutationFn: (payload: Omit<ClassBook, "id" | "created_at">) =>
      createClassBook(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.BOOKS(classId) }),
  });

  const updateBook = useMutation({
    mutationFn: (vars: { id: string; patch: Partial<ClassBook> }) =>
      updateClassBook(vars.id, classId, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.BOOKS(classId) }),
  });

  const deleteBook = useMutation({
    mutationFn: (id: string) => deleteClassBook(id, classId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.BOOKS(classId) }),
  });

  const books = booksQ.data ?? [];

  /* ====== Modal states ====== */
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    editing?: ClassBook | null;
  } | null>(null);

  const [toDelete, setToDelete] = useState<ClassBook | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteBook.mutateAsync(toDelete.id);
    setConfirmOpen(false);
  };

  /* ====== Columns ====== */
  const columns: ColumnDef<ClassBook>[] = [
    {
      id: "title",
      header: "Buku",
      minW: "260px",
      cell: (b) => (
        <div className="flex items-start gap-3">
          {b.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.cover_url}
              alt={b.title}
              className="h-12 w-9 rounded object-cover border"
              loading="lazy"
            />
          ) : (
            <div className="h-12 w-9 rounded border bg-muted" />
          )}
          <div className="min-w-0">
            <div className="font-medium line-clamp-2">{b.title}</div>
            {b.description ? (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {b.description}
              </div>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "author",
      header: "Penulis",
      minW: "140px",
      cell: (b) => b.author ?? "-",
    },
    {
      id: "subject",
      header: "Mapel",
      minW: "120px",
      cell: (b) => b.subject ?? "-",
    },
    { id: "isbn", header: "ISBN", minW: "140px", cell: (b) => b.isbn ?? "-" },
    {
      id: "year",
      header: "Tahun",
      minW: "100px",
      align: "center" as Align,
      cell: (b) => b.year ?? "-",
    },
    {
      id: "pages",
      header: "Hal.",
      minW: "90px",
      align: "center" as Align,
      cell: (b) => b.pages ?? "-",
    },
  ];

  /* ====== Stats Slot (ringkas, ala Academic) ====== */




  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          <CDataTable<ClassBook>
            /* ===== Toolbar ===== */
            title="Buku Kelas"
            onBack={() => navigate(-1)}
            onAdd={() => setModal({ mode: "create" })}
            addLabel="Tambah"
            controlsPlacement="above"
            /* Search (client-side) */
            defaultQuery=""
            searchByKeys={["title", "author", "subject", "isbn"]}

            /* ===== Data ===== */
            loading={booksQ.isLoading}
            error={booksQ.isError ? "Gagal memuat buku." : null}
            columns={columns}
            rows={books}
            getRowId={(b) => b.id}
            /* Klik baris = view detail (kalau ada), sementara buka edit */
            onRowClick={(row) =>
              navigate(`${row.id}`)
            } /* Actions menu ala Academic */
            renderActions={(b) => (
              <ActionsMenu
                onView={() => setModal({ mode: "edit", editing: b })}
                onEdit={() => setModal({ mode: "edit", editing: b })}
                onDelete={() => {
                  setToDelete(b);
                  setConfirmOpen(true);
                }}
              />
            )}
            actions={{
              mode: "inline",
              onView: (row) => setModal({ mode: "edit", editing: row }),
              onEdit: (row) => setModal({ mode: "edit", editing: row }),
              onDelete: (row) => {
                setToDelete(row);
                setConfirmOpen(true);
              },
            }}
            pageSize={20}
          />
        </div>
      </main>

      {/* Dialog Add/Edit */}
      <BookFormDialog
        key={modal?.editing?.id ?? modal?.mode ?? "closed"}
        open={!!modal}
        onClose={() => setModal(null)}
        initial={modal?.editing ?? undefined}
        loading={createBook.isPending || updateBook.isPending}
        classId={classId}
        onSubmit={(v) => {
          if (modal?.mode === "edit" && modal.editing) {
            updateBook.mutate(
              { id: modal.editing.id, patch: v },
              { onSuccess: () => setModal(null) }
            );
          } else {
            createBook.mutate(v, { onSuccess: () => setModal(null) });
          }
        }}
      />

      {/* Konfirmasi Hapus */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus “{toDelete?.title ?? "Buku"}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBook.isPending}
            >
              {deleteBook.isPending ? "Menghapus…" : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
