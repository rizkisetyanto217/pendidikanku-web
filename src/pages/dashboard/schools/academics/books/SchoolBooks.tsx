// src/pages/dashboard/schools/academics/books/SchoolBooks.tsx
import { useMemo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ImageOff,
  Info,
  Loader2,
  ArrowLeft,
  ExternalLink, // ✅ icon buat tombol link
} from "lucide-react";

/* Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Button } from "@/components/ui/button";

/* DataTable */
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

/* CRowActions */
import CRowActions from "@/components/costum/table/CRowAction";
import CDeleteDialog from "@/components/costum/common/buttons/CDeleteDialog";


/* =========================================================
   Types (disesuaikan dengan /api/u/books/list?mode=compact)
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
  book_purchase_url?: string | null; // ✅ dari API
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
    count?: number;
    per_page_options?: number[];
  };
};

/* =========================================================
   Fetch list (USER) - /u/books/list?mode=compact
========================================================= */
function useBooksList(_schoolId: string) {
  return useQuery<BooksResponse>({
    queryKey: ["books-list-public"],
    queryFn: async () => {
      const r = await axios.get<BooksResponse>("/u/books/list", {
        params: { mode: "compact" },
        withCredentials: true,
      });
      return r.data;
    },
    placeholderData: { data: [] },
  });
}

/* =========================================================
   DELETE hook (masih pakai /api/a/...)
========================================================= */
function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      axios.delete(`/api/a/books/${id}`, { withCredentials: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["books-list-public"] }),
  });
}

/* =========================================================
   Page — integrasi dengan halaman add/edit
========================================================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolBooks({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const { schoolId = "" } = useParams();

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

  /* Fetch */
  const booksQuery = useBooksList(schoolId);
  const deleteBook = useDeleteBook();

  const rows = booksQuery.data?.data ?? [];
  const totalBooks = booksQuery.data?.pagination?.total ?? rows.length ?? 0;

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
        align: "left",
        className: "text-left",
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
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {r.book_desc || "—"}
          </div>
        ),
      },
      {
        id: "purchase",
        header: "Link Pembelian",
        minW: "160px",
        align: "center",
        className: "text-center",

        cell: (r) =>
          r.book_purchase_url ? (
            <Button variant="outline" asChild className="gap-1">
              <a
                href={r.book_purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // biar tidak trigger row-click
              >
                <ExternalLink className="h-3 w-3" />
                <span>Buka</span>
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ];
  }, []);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookAPI | null>(null);

  const openDeleteDialog = (book: BookAPI) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedBook) return;
    deleteBook.mutate(selectedBook.book_id, {
      onSuccess: () => setDeleteDialogOpen(false),
    });
  };


  /* ================== STATS SLOT ================== */
  const statsSlot = booksQuery.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Memuat daftar buku…
    </div>
  ) : booksQuery.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4" /> Gagal memuat buku.
      </div>
      <Button size="sm" onClick={() => booksQuery.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">
      Total buku: {totalBooks}
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header Back seperti SchoolAcademic */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="font-semibold text-lg md:text-xl">Daftar Buku</h1>
          </div>

          {/* ======================================
              DATA TABLE PAKAI CRowActions
          ====================================== */}
          <DataTable<BookAPI>
            onAdd={() => navigate("new")}
            addLabel="Tambah"
            controlsPlacement="above"
            defaultQuery=""
            searchPlaceholder="Cari judul atau penulis…"
            searchByKeys={["book_title", "book_author"]}
            statsSlot={statsSlot}
            loading={booksQuery.isLoading}
            error={booksQuery.isError ? "Gagal memuat buku" : null}
            columns={columns}
            rows={rows}
            getRowId={(r) => r.book_id}
            stickyHeader
            zebra
            viewModes={["table", "card"]}
            onRowClick={(r) => navigate(`${r.book_id}`, { state: { book: r } })}
            renderActions={(r, view) => (
              <CRowActions
                row={r}
                mode="inline"
                size="sm"
                onView={() => navigate(`${r.book_id}`, { state: { book: r } })}
                onEdit={() =>
                  navigate(`edit/${r.book_id}`, { state: { book: r } })
                }
                onDelete={() => openDeleteDialog(r)}
                forceMenu={view === "table"}
              />
            )}
          />
          <CDeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            loading={deleteBook.isPending}
            title={`Hapus Buku "${selectedBook?.book_title}"?`}
            description="Tindakan ini tidak dapat dibatalkan."
          />
        </div>
      </main>
    </div>
  );
}