// src/pages/sekolahislamku/pages/academic/SchoolSubject.table.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

/* icons */
import { ArrowLeft, ArrowUpDown, Loader2, AlertCircle } from "lucide-react";

/* ---------- BreadCrum ---------- */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Context user dari simple-context (JWT) */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* DataTable */
import {
  cardHover,
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";
import CRowActions from "@/components/costum/table/CRowAction";
import { cn } from "@/lib/utils";
import CDeleteDialog from "@/components/costum/common/buttons/CDeleteDialog";

/* ================= Types ================= */
export type SubjectStatus = "active" | "inactive";

export type SubjectRow = {
  id: string; // subject_id
  code: string;
  name: string;
  status: SubjectStatus;
  class_count: number;
  total_hours_per_week: number | null;
  book_count: number;
  assignments: ClassSubjectItem[];
};

type SubjectsAPIItem = {
  subject_id: string;
  subject_school_id: string;
  subject_code: string | null;
  subject_name: string;
  subject_desc?: string | null;
  subject_slug?: string | null;
  subject_image_url?: string | null;
  subject_is_active: boolean;
  subject_created_at: string;
  subject_updated_at: string;
};

type SubjectsAPIResp = {
  data: SubjectsAPIItem[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
};

type ClassSubjectItem = {
  class_subject_id: string;
  class_subject_school_id: string;
  class_subject_parent_id: string;
  class_subject_subject_id: string;
  class_subject_slug: string;
  class_subject_order_index: number | null;
  class_subject_hours_per_week: number | null;
  class_subject_min_passing_score: number | null;
  class_subject_weight_on_report: number | null;
  class_subject_is_core: boolean | null;
  class_subject_subject_name_snapshot: string;
  class_subject_subject_code_snapshot: string | null;
  class_subject_subject_slug_snapshot: string | null;
  class_subject_subject_url_snapshot: string | null;
  class_subject_is_active: boolean;
  class_subject_created_at: string;
  class_subject_updated_at: string;
};

type ClassSubjectsAPIResp = {
  data: ClassSubjectItem[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

type ClassSubjectBookItem = {
  class_subject_book_id: string;
  class_subject_book_school_id: string;
  class_subject_book_class_subject_id: string;
  class_subject_book_book_id: string;
  class_subject_book_slug: string;
  class_subject_book_is_active: boolean;
  class_subject_book_book_title_snapshot: string;
  class_subject_book_book_author_snapshot: string | null;
  class_subject_book_book_slug_snapshot: string;
  class_subject_book_book_image_url_snapshot: string | null;
  class_subject_book_subject_id_snapshot: string;
  class_subject_book_subject_code_snapshot: string;
  class_subject_book_subject_name_snapshot: string;
  class_subject_book_subject_slug_snapshot: string;
  class_subject_book_created_at: string;
  class_subject_book_updated_at: string;
};

type CSBListResp = {
  data: ClassSubjectBookItem[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

/* ================= Const ================= */
const API_PREFIX = "/u"; // user-scope
const ADMIN_PREFIX = "/a";

/* ================= Helpers ================= */
const sumHours = (arr: ClassSubjectItem[]) => {
  const hrs = arr
    .map((x) => x.class_subject_hours_per_week ?? 0)
    .filter((n) => Number.isFinite(n));
  if (hrs.length === 0) return null;
  return hrs.reduce((a, b) => a + b, 0);
};

/* ================= Mutations ================= */
function useDeleteSubjectMutation(school_id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (subjectId: string) => {
      const { data } = await axios.delete(
        `${ADMIN_PREFIX}/${encodeURIComponent(school_id)}/subjects/${subjectId}`
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects-merged", school_id] });
    },
  });
}


/* ================= Page (TABLE) ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolSubject: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const { setHeader } = useDashboardHeader();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubjectRow | null>(null);

  const openDeleteDialog = (row: SubjectRow) => {
    setSelectedRow(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedRow) return;
    delMut.mutate(selectedRow.id, {
      onSuccess: () => setDeleteDialogOpen(false),
    });
  };

  useEffect(() => {
    setHeader({
      title: "Mata Pelajaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Mata Pelajaran" },
      ],
      actions: null,
    });
  }, [setHeader, showBack]);

  // Ambil schoolId dari simple-context (JWT), bukan URL params
  const { data: currentUser } = useCurrentUser();
  const schoolId = currentUser?.membership?.school_id ?? "";

  // DELETE mutation (gunakan subjectId dari row)
  const delMut = useDeleteSubjectMutation(schoolId);


  // controls (mengikat ke DataTable)
  const [query, setQuery] = useState("");
  const [onlyActive] = useState<"1" | "0">("1");
  const [sortBy, setSortBy] = useState<
    "name-asc" | "name-desc" | "code-asc" | "code-desc"
  >("name-asc");



  const mergedQ = useQuery({
    queryKey: ["subjects-merged", schoolId],
    enabled: !!schoolId,
    queryFn: async (): Promise<SubjectRow[]> => {
      const [subjectsResp, classSubjectsResp, booksResp] = await Promise.all([
        // SUBJECTS — /u/subjects/list (ambil school dari JWT)
        axios
          .get<SubjectsAPIResp>(`${API_PREFIX}/subjects/list`, {
            params: { page: 1, per_page: 500 },
          })
          .then((r) => r.data),

        // CLASS SUBJECTS — /u/class-subjects/list
        axios
          .get<ClassSubjectsAPIResp>(`${API_PREFIX}/class-subjects/list`, {
            params: { page: 1, per_page: 1000 },
          })
          .then((r) => r.data),

        // CLASS SUBJECT BOOKS — /u/class-subject-books/list
        axios
          .get<CSBListResp>(`${API_PREFIX}/class-subject-books/list`, {
            params: { page: 1, per_page: 1000 },
          })
          .then((r) => r.data),
      ]);

      const classBySubject = new Map<string, ClassSubjectItem[]>();
      for (const cs of classSubjectsResp.data) {
        const key = cs.class_subject_subject_id;
        if (!classBySubject.has(key)) classBySubject.set(key, []);
        classBySubject.get(key)!.push(cs);
      }

      const bookCountBySubject = new Map<string, number>();
      for (const b of booksResp.data) {
        const sid = b.class_subject_book_subject_id_snapshot;
        bookCountBySubject.set(sid, (bookCountBySubject.get(sid) ?? 0) + 1);
      }

      const rows: SubjectRow[] = subjectsResp.data.map((s) => {
        const assignments = classBySubject.get(s.subject_id) ?? [];
        return {
          id: s.subject_id,
          code: s.subject_code ?? "",
          name: s.subject_name,
          status: s.subject_is_active ? "active" : "inactive",
          class_count: assignments.length,
          total_hours_per_week: sumHours(assignments),
          book_count: bookCountBySubject.get(s.subject_id) ?? 0,
          assignments,
        };
      });

      return rows;
    },
  });

  /* ===== transform -> filter + sort di layer tabel ===== */
  const rowsFilteredSorted = useMemo(() => {
    let arr = (mergedQ.data ?? []).slice();

    if (onlyActive === "1") {
      arr = arr.filter((s) => s.status === "active");
    }
    if (query.trim()) {
      const k = query.trim().toLowerCase();
      arr = arr.filter(
        (s) =>
          s.name.toLowerCase().includes(k) || s.code.toLowerCase().includes(k)
      );
    }

    const [key, dir] = (sortBy || "name-asc").split("-") as [
      "name" | "code",
      "asc" | "desc"
    ];
    const asc = dir !== "desc";
    arr.sort((a, b) => {
      const A = (key === "code" ? a.code : a.name).toLowerCase();
      const B = (key === "code" ? b.code : b.name).toLowerCase();
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });

    return arr;
  }, [mergedQ.data, query, onlyActive, sortBy]);

  /* ===== Columns ===== */
  const columns: ColumnDef<SubjectRow>[] = [
    {
      id: "code",
      header: "Kode",
      minW: "120px",
      align: "left",
      className: "text-left",
      cell: (r) => (r.code ? <span className="font-mono">{r.code}</span> : "-"),
    },
    {
      id: "name",
      header: "Nama",
      minW: "220px",
      align: "left",
      className: "text-left",
      cell: (r) => (
        <div>
          <div className="font-medium">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {r.assignments.length} kelas ditugaskan
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      cell: (r) => (
        <CBadgeStatus
          status={
            r.status === "active"
              ? "active"
              : r.status === "inactive"
                ? "inactive"
                : "pending"
          }
        />
      ),
    },

    {
      id: "class_count",
      header: "Kelas",
      minW: "80px",
      cell: (r) => r.class_count,
    },
    {
      id: "total_hours_per_week",
      header: "Jam/Minggu",
      minW: "110px",
      cell: (r) => r.total_hours_per_week ?? "-",
    },
    {
      id: "book_count",
      header: "Buku",
      minW: "80px",
      cell: (r) => r.book_count,
    },
  ];

  /* ===== Right controls slot ===== */
  const RightSlot = (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
        <SelectTrigger className="h-9 w-[170px]" data-interactive>
          <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Urutkan" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="name-asc">Nama A→Z</SelectItem>
          <SelectItem value="name-desc">Nama Z→A</SelectItem>
          <SelectItem value="code-asc">Kode A→Z</SelectItem>
          <SelectItem value="code-desc">Kode Z→A</SelectItem>
        </SelectContent>
      </Select>

      {/* Tambah sekarang diarahkan ke halaman form */}
      <Button className="gap-1" onClick={() => navigate("new")}>
        + Tambah
      </Button>
    </div>
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="flex flex-col gap-6">
          {/* Header minimal (back + title) */}
          <div className="flex items-center justify-between">
            <div className="md:flex hidden items-center gap-3">
              {showBack && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer self-start">
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h1 className="font-semibold text-lg md:text-xl">
                Mata Pelajaran
              </h1>
            </div>
          </div>

          {/* Loading / Error */}
          {mergedQ.isLoading && (
            <Card>
              <CardContent className="p-6 text-center flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" /> Memuat…
              </CardContent>
            </Card>
          )}
          {mergedQ.isError && (
            <Card>
              <CardContent className="p-6 text-center text-destructive flex items-center gap-2">
                <AlertCircle /> Gagal memuat data.
              </CardContent>
            </Card>
          )}

          {/* DataTable */}
          {!mergedQ.isLoading && !mergedQ.isError && (
            <DataTable<SubjectRow>
              className="px-0"
              defaultQuery={query}
              onQueryChange={setQuery}
              searchByKeys={["name", "code"]}
              searchPlaceholder="Cari nama/kode…"
              rows={rowsFilteredSorted}
              columns={columns}
              getRowId={(r) => r.id}
              loading={false}
              error={null}
              pageSize={30}
              pageSizeOptions={[20, 30, 50]}
              viewModes={["table", "card"]}
              defaultView="table"
              stickyHeader
              zebra
              rightSlot={RightSlot}
              onRowClick={(row) => navigate(`${row.id}`)}
              storageKey="subjects.table.view"
              minTableWidth={880}
              renderActions={(row, view) => (
                <CRowActions
                  row={row}
                  mode="inline"
                  size="sm"
                  onView={() => navigate(`${row.id}`)}
                  onEdit={() =>
                    navigate(`edit/${row.id}`, {
                      state: { subject: row },
                    })
                  }
                  onDelete={() => openDeleteDialog(row)}
                  forceMenu={view === "table"}
                />
              )}
              renderCard={(r) => (
                <div
                  className={cn(
                    "rounded-xl border p-4 space-y-3 bg-card",
                    cardHover
                  )}
                  onClick={() => navigate(`${r.id}`)}
                >


                  {/* Header + Status */}
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.name}</div>
                    <CBadgeStatus status={r.status === "active" ? "active" : "inactive"} />
                  </div>

                  {/* Info Kode */}
                  <div className="text-xs text-muted-foreground">
                    Kode: {r.code || "-"}
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded border p-2">
                      <div className="text-xs text-muted-foreground">Kelas</div>
                      <div className="font-medium">{r.class_count}</div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-xs text-muted-foreground">Jam/Mgg</div>
                      <div className="font-medium">
                        {r.total_hours_per_week ?? "-"}
                      </div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-xs text-muted-foreground">Buku</div>
                      <div className="font-medium">{r.book_count}</div>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div
                    className="flex justify-end"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <CRowActions
                      row={r}
                      mode="inline"
                      size="sm"
                      onView={() => navigate(`${r.id}`)}
                      onEdit={() => navigate(`edit/${r.id}`, { state: { subject: r } })}
                      onDelete={() => openDeleteDialog(r)}
                      forceMenu={false}
                    />
                  </div>
                </div>
              )}
            />
          )}
          <CDeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
            loading={delMut.isPending}
            title={`Hapus Mata Pelajaran "${selectedRow?.name}"?`}
            description="Tindakan ini tidak dapat dibatalkan."
          />
        </div>
      </main>
    </div>
  );
};

export default SchoolSubject;
