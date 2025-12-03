// src/pages/dashboard/school/class/SchoolClass.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios, { getActiveschoolId } from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* DataTable */
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

/* Auth */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CRowActions from "@/components/costum/table/CRowAction";

/* ========== Types ========== */
export type ClassStatus = "active" | "inactive";


type ApiClass = {
  class_id: string;
  class_school_id: string;
  class_parent_id: string;
  class_slug: string;
  class_name: string;
  class_start_date?: string | null;
  class_end_date?: string | null;
  class_term_id?: string | null;
  class_registration_opens_at?: string | null;
  class_registration_closes_at?: string | null;
  class_quota_total?: number | null;
  class_quota_taken?: number | null;
  class_status: "active" | "inactive";
  class_image_url?: string | null;
  class_parent_code_snapshot?: string | null;
  class_parent_name_snapshot?: string | null;
  class_parent_slug_snapshot?: string | null;
  class_parent_level_snapshot?: number | null;
  class_term_academic_year_snapshot?: string | null;
  class_term_name_snapshot?: string | null;
  class_term_slug_snapshot?: string | null;
  class_term_angkatan_snapshot?: string | null;
  class_created_at: string;
  class_updated_at: string;
};


/* Table Row */
type MiddleClassRow = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentSlug?: string | null;
  parentName?: string | null;
  parentLevel?: number | null;
  term?: string | null;
  regOpen?: string | null;
  regClose?: string | null;
  quotaTaken?: number | null;
  quotaTotal?: number | null;
  status: "active" | "inactive";
};

/* Helpers */
const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

/* ================= Fetchers ================= */
async function fetchClassesPublic(
  schoolId: string | null,
  params?: { q?: string; status?: ClassStatus | "all"; levelId?: string }
): Promise<ApiClass[]> {
  if (!schoolId) return [];
  const p: Record<string, any> = {};
  if (params?.q?.trim()) p.search = params.q.trim();
  if (params?.status && params.status !== "all")
    p.active_only = params.status === "active";
  if (params?.levelId) p.class_parent_id = params.levelId;

  const res = await axios.get(`/public/${schoolId}/classes/list`, { params: p });
  return res.data?.data ?? [];
}

/* ================= Page ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolClass: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* school id */
  const currentUserQ = useCurrentUser();
  const membership = currentUserQ.data?.membership;
  const schoolId = membership?.school_id || getActiveschoolId() || null;

  /* Header */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Daftar Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Daftar Kelas" },
      ],
      actions: null,
    });
  }, [setHeader]);

  /* Query params */
  const [query, setQuery] = useState("");
  const [status] = useState<ClassStatus | "all">("all");
  const [levelId] = useState<string>("");


  /* Pagination */
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);



  /* Fetch Query */
  const classesQ = useQuery({
    queryKey: ["classes-public", schoolId, query, status, levelId],
    enabled: Boolean(schoolId),
    queryFn: () => fetchClassesPublic(schoolId, { q: query, status, levelId }),
    staleTime: 60000,
  });

  /* Convert rows */
  const rows: MiddleClassRow[] = useMemo(
    () =>
      (classesQ.data ?? []).map((c) => ({
        id: c.class_id,
        name: c.class_name ?? c.class_parent_name_snapshot ?? "-",
        slug: c.class_slug,
        parentName: c.class_parent_name_snapshot,
        parentLevel: c.class_parent_level_snapshot ?? undefined,
        term:
          c.class_term_academic_year_snapshot &&
            c.class_term_name_snapshot
            ? `${c.class_term_academic_year_snapshot} — ${c.class_term_name_snapshot}`
            : c.class_term_academic_year_snapshot ??
            c.class_term_name_snapshot ??
            "-",
        regOpen: c.class_registration_opens_at,
        regClose: c.class_registration_closes_at,
        quotaTaken: c.class_quota_taken,
        quotaTotal: c.class_quota_total,
        status: c.class_status,
      })),
    [classesQ.data]
  );

  /* Page slice */
  const filtered = rows.filter((r) => !levelId || r.parentLevel === Number(levelId));
  const pagedRows = filtered.slice((page - 1) * perPage, page * perPage);



  /* Stats */
  const statsSlot = classesQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin h-4 w-4" /> Memuat kelas…
    </div>
  ) : (
    <div className="grid gap-3 md:grid-cols-3 text-sm">
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Jumlah Kelas</div>
        <div className="font-medium">{filtered.length}</div>
      </div>

      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Aktif</div>
        <div className="font-medium">
          {filtered.filter((r) => r.status === "active").length}
        </div>
      </div>

      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Total Terisi</div>
        <div className="font-medium">
          {filtered.reduce((a, r) => a + (r.quotaTaken ?? 0), 0)}
        </div>
      </div>
    </div>
  );

  /* ===== Columns: Kelas ===== */
  const columns: ColumnDef<MiddleClassRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Kelas",
        minW: "260px",
        cell: (r) => (
          <div className="text-center">
            <div className="font-medium truncate">{r.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground truncate">
              Slug: {r.slug}
            </div>
          </div>
        ),
      },
      {
        id: "parent",
        header: "Tingkat",
        minW: "160px",
        align: "center",
        cell: (r) => (
          <span className="truncate">
            {r.parentName ?? "-"}
            {r.parentLevel != null ? ` (Level ${r.parentLevel})` : ""}
          </span>
        ),
      },
      {
        id: "term",
        header: "Periode Akademik",
        minW: "180px",
        align: "center",
        cell: (r) => r.term ?? "-",
      },
      {
        id: "reg",
        header: "Jendela Pendaftaran",
        minW: "220px",
        align: "center",
        cell: (r) => (
          <span className="truncate">
            {fmtDate(r.regOpen)} — {fmtDate(r.regClose)}
          </span>
        ),
      },
      {
        id: "quota",
        header: "Kuota",
        align: "center",
        minW: "140px",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1 text-sm tabular-nums">
            <span className="font-medium">
              {r.quotaTaken ?? 0}
            </span>
            <span className="opacity-70">/</span>
            <span className="font-medium">
              {r.quotaTotal ?? "∞"}
            </span>
          </div>
        ),
      },

      {
        id: "status",
        header: "Status",
        align: "center",
        minW: "100px",
        cell: (r) => (
          <span
            className={cn(
              "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1",
              r.status === "active"
                ? "bg-sky-500/15 text-sky-500 ring-sky-500/25"
                : "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"
            )}
          >
            {r.status === "active" ? "Aktif" : "Nonaktif"}
          </span>
        ),
      },
    ],
    []
  );

  /* ===== Layout ===== */
  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            )}
            <h1 className="font-semibold text-lg md:text-xl">Daftar Kelas</h1>
          </div>

          <DataTable<MiddleClassRow>
            onAdd={() => navigate("new")}
            addLabel="Tambah"
            controlsPlacement="above"
            onQueryChange={(val) => {
              if (val !== query) {
                setQuery(val);
              }
            }}
            searchByKeys={["name", "slug", "term", "parentName"]}
            searchPlaceholder="Cari nama/slug/tingkat/periode…"
            statsSlot={statsSlot}
            loading={classesQ.isLoading}
            error={classesQ.isError ? "Gagal memuat kelas." : null}
            columns={columns}
            rows={pagedRows}
            getRowId={(r) => r.id}
            stickyHeader
            zebra
            viewModes={["table", "card"]}
            defaultView="table"
            storageKey={`classes:${schoolId}`}
            onRowClick={(r) => navigate(`${r.id}`)}
            pageSize={perPage}
            pageSizeOptions={[10, 20, 50, 100, 200]}

            /* ===================================
               ACTIONS (diambil alih oleh CRowActions)
               =================================== */
            renderActions={(row, view) => (
              <CRowActions
                row={row}
                mode="inline"
                size="sm"
                forceMenu={view === "table"} // table = menu, card = inline
                onView={() =>
                  navigate(`${row.id}`, {
                    state: {
                      className: row.name,
                      parentName: row.parentName,
                      parentLevel: row.parentLevel,
                    },
                  })
                }
                onEdit={() => navigate(`edit/${row.id}`)}
                onDelete={() => console.log("hapus kelas", row.id)}
              />
            )}

            /* =======================
               CARD RENDERING
               ======================= */
            renderCard={(r) => (
              <div
                className="p-4 border rounded-xl space-y-3 cursor-pointer hover:border-primary/40"
                onClick={() => navigate(`${r.id}`)}
              >
                <div className="font-semibold">{r.name}</div>

                <div className="text-xs text-muted-foreground">
                  Slug: {r.slug}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">Tingkat</div>
                    <div className="font-medium">
                      {r.parentName}
                      {r.parentLevel != null ? ` (Lvl ${r.parentLevel})` : ""}
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">Kuota</div>
                    <div className="font-medium">
                      {r.quotaTaken ?? 0} / {r.quotaTotal ?? "∞"}
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-xs ring-1",
                        r.status === "active"
                          ? "bg-sky-500/15 text-sky-500 ring-sky-500/25"
                          : "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"
                      )}
                    >
                      {r.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div
                  className="flex justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CRowActions
                    row={r}
                    mode="inline"
                    size="sm"
                    onView={() => navigate(`${r.id}`)}
                    onEdit={() => navigate(`edit/${r.id}`)}
                    onDelete={() => console.log("hapus kelas", r.id)}
                  />
                </div>
              </div>
            )}
          />

          {/* Footer pagination */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="order-1 sm:order-2 flex items-center gap-2">
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              ></Select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolClass;
