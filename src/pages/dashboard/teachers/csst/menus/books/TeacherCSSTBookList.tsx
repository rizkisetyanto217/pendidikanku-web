// src/pages/dasboard/teacher/books/TeacherCSSTBookList.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Pencil, Trash2, Eye } from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ============ shadcn/ui ============ */
import { Button } from "@/components/ui/button";

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
} from "@/components/costum/table/CDataTable";

/* =========================================================
   CONFIG + TYPES
========================================================= */

type BookStatus = "available" | "borrowed" | "archived";

export type ClassBook = {
  id: string;
  class_id: string; // di sini = class_subject_id
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

/* === Bentuk data API /api/u/class-subject-books/list === */
type ApiClassSubjectBook = {
  class_subject_book_id: string;
  class_subject_book_school_id: string;
  class_subject_book_class_subject_id: string;
  class_subject_book_book_id: string;
  class_subject_book_slug: string;
  class_subject_book_is_primary: boolean;
  class_subject_book_is_required: boolean;
  class_subject_book_is_active: boolean;
  class_subject_book_book_title_cache: string;
  class_subject_book_book_author_cache?: string | null;
  class_subject_book_book_slug_cache?: string | null;
  class_subject_book_book_image_url_cache?: string | null;
  class_subject_book_subject_id: string;
  class_subject_book_subject_code_cache?: string | null;
  class_subject_book_subject_name_cache?: string | null;
  class_subject_book_subject_slug_cache?: string | null;
  class_subject_book_created_at: string;
  class_subject_book_updated_at: string;
};

type ApiListResponse = {
  data: ApiClassSubjectBook[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
  };
  success: boolean;
  message: string;
};

/* =========================================================
   API REAL: list subject books
========================================================= */
async function fetchClassBooks(subjectId: string): Promise<ClassBook[]> {
  if (!subjectId) return [];

  const res = await axios.get<ApiListResponse>(
    "/api/u/class-subject-books/list",
    {
      params: { subject_id: subjectId },
    }
  );

  const rows = res.data?.data ?? [];
  return rows.map((row) => ({
    id: row.class_subject_book_id,
    class_id: row.class_subject_book_class_subject_id,
    title: row.class_subject_book_book_title_cache,
    author: row.class_subject_book_book_author_cache ?? undefined,
    subject: row.class_subject_book_subject_name_cache ?? undefined,
    // sederhana: aktif = available, tidak aktif = archived
    status: row.class_subject_book_is_active ? "available" : "archived",
    cover_url: row.class_subject_book_book_image_url_cache ?? null,
    description: undefined,
    created_at: row.class_subject_book_created_at,
  }));
}

/* Untuk sementara: operasi create/update/delete belum disambungkan ke API */
async function createClassBook(
  _input: Omit<ClassBook, "id" | "created_at">
): Promise<null> {
  console.warn("[createClassBook] belum diimplementasikan");
  return null;
}

async function updateClassBook(
  _id: string,
  _classId: string,
  _patch: Partial<ClassBook>
): Promise<null> {
  console.warn("[updateClassBook] belum diimplementasikan");
  return null;
}

async function deleteClassBook(_id: string): Promise<{ ok: boolean }> {
  console.warn("[deleteClassBook] belum diimplementasikan");
  return { ok: true };
}

/* =========================================================
   QUERY KEYS
========================================================= */
const QK = {
  BOOKS: (subjectId: string) => ["class-subject-books", subjectId] as const,
};

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

/* ===================== Page (pakai CDataTable) ===================== */
export default function TeacherCSSTBookList() {
  const navigate = useNavigate();
  const location = useLocation();

  // subjectId dikirim lewat navigate(..., { state: { subjectId } })
  const subjectId =
    (location.state as { subjectId?: string } | null)?.subjectId ?? "";

  const qc = useQueryClient();

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Buku",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Detail Mapel" },
        { label: "Buku" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  useEffect(() => {
    if (!subjectId) {
      console.warn(
        "[TeacherCSSTBookList] subjectId tidak ditemukan di location.state"
      );
    }
  }, [subjectId]);

  const booksQ = useQuery({
    queryKey: QK.BOOKS(subjectId || "unknown"),
    queryFn: () => fetchClassBooks(subjectId),
    enabled: !!subjectId,
    staleTime: 2 * 60_000,
    placeholderData: (prev) => prev ?? [],
  });

  const deleteBook = useMutation({
    mutationFn: (id: string) => deleteClassBook(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QK.BOOKS(subjectId || "unknown") }),
  });

  const books = booksQ.data ?? [];

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
            // eslint-disable-next-line jsx-a11y/alt-text
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
            {b.author && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {b.author}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "subject",
      header: "Mapel",
      minW: "140px",
      cell: (b) => b.subject ?? "-",
    },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      cell: (b) =>
        b.status === "available"
          ? "Aktif"
          : b.status === "archived"
            ? "Nonaktif"
            : "—",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          <CDataTable<ClassBook>
            /* ===== Toolbar ===== */
            title="Buku Mapel"
            onBack={() => navigate(-1)}
            onAdd={() => navigate("new")}
            addLabel="Tambah"
            controlsPlacement="above"
            /* Search (client-side) */
            defaultQuery=""
            searchByKeys={["title", "author", "subject"]}
            /* ===== Data ===== */
            loading={booksQ.isLoading}
            error={booksQ.isError || !subjectId ? "Gagal memuat buku." : null}
            columns={columns}
            rows={books}
            getRowId={(b) => b.id}
            /* Klik baris = misalnya ke detail buku (nanti bisa diisi) */
            onRowClick={(row) => navigate(`${row.id}`)}
            /* Actions menu */
            renderActions={(b) => (
              <ActionsMenu
                onView={() => navigate(`${b.id}`)}
                onEdit={() => navigate(`${b.id}/edit`)}
                onDelete={() => {
                  setToDelete(b);
                  setConfirmOpen(true);
                }}
              />
            )}
            actions={{
              mode: "inline",
              onView: (row) => navigate(`${row.id}`),
              onEdit: (row) => navigate(`${row.id}/edit`),
              onDelete: (row) => {
                setToDelete(row);
                setConfirmOpen(true);
              },
            }}
            pageSize={20}
          />
        </div>
      </main>

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

/* =========================================================
   Export helper untuk halaman form (sementara TODO)
========================================================= */
export { fetchClassBooks, createClassBook, updateClassBook };