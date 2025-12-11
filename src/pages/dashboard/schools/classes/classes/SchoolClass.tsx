// src/pages/dashboard/school/class/SchoolClass.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios, { getActiveschoolId } from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* DataTable */
import {
  cardHover,
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

/* Auth */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CRowActions from "@/components/costum/table/CRowAction";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";

/* ========== Types ========== */
export type ClassStatus = "active" | "inactive";

/** Bentuk data dari API compact: /api/u/classes/list?mode=compact */
type ApiClassCompact = {
  class_id: string;
  class_slug: string;
  class_name: string;
  class_start_date?: string | null;
  class_end_date?: string | null;
  class_quota_total?: number | null;
  class_quota_taken?: number | null;
  class_status: "active" | "inactive";

  class_total_class_sections_active: number;
  class_total_class_sections: number;
  class_total_students_active: number;
  class_total_students: number;

  class_created_at: string;
  class_updated_at: string;
};

/* Row yang dipakai di tabel */
type MiddleClassRow = {
  id: string;
  name: string;
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
  quotaTaken?: number | null;
  quotaTotal?: number | null;
  status: "active" | "inactive";

  totalSectionsActive: number;
  totalSections: number;
  totalStudentsActive: number;
  totalStudents: number;
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

const USER_PREFIX = "/api/u";

/* ================= Fetcher (API baru) ================= */
async function fetchClassesCompact(
  schoolId: string | null,
  params?: { q?: string }
): Promise<ApiClassCompact[]> {
  if (!schoolId) return [];

  const p: Record<string, any> = {
    page: 1,
    per_page: 200,
    mode: "compact",
  };

  if (params?.q?.trim()) {
    p.q = params.q.trim();
  }

  const res = await axios.get(`${USER_PREFIX}/classes/list`, { params: p });
  return res.data?.data ?? [];
}

/* ================= Page ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolClass: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* school id (buat queryKey & guard, API tetap pakai JWT) */
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
      showBack,
    });
  }, [setHeader, showBack]);

  /* Query text (search) */
  const [query, setQuery] = useState("");

  /* Fetch Query (API baru) */
  const classesQ = useQuery({
    queryKey: ["classes-compact", schoolId, query],
    enabled: Boolean(schoolId),
    queryFn: () => fetchClassesCompact(schoolId, { q: query }),
    staleTime: 60_000,
  });

  /* Convert rows dari API compact → MiddleClassRow */
  const rows: MiddleClassRow[] = useMemo(
    () =>
      (classesQ.data ?? []).map((c) => ({
        id: c.class_id,
        name: c.class_name,
        slug: c.class_slug,
        startDate: c.class_start_date,
        endDate: c.class_end_date,
        quotaTaken: c.class_quota_taken,
        quotaTotal: c.class_quota_total,
        status: c.class_status,

        totalSectionsActive: c.class_total_class_sections_active,
        totalSections: c.class_total_class_sections,
        totalStudentsActive: c.class_total_students_active,
        totalStudents: c.class_total_students,
      })),
    [classesQ.data]
  );

  /* Stats */
  const statsSlot = classesQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin h-4 w-4" /> Memuat kelas…
    </div>
  ) : classesQ.isError ? (
    <div className="text-sm text-destructive">Gagal memuat kelas.</div>
  ) : (
    (() => {
      const totalClasses = rows.length;
      const activeClasses = rows.filter((r) => r.status === "active").length;

      const totalStudentsActive = rows.reduce(
        (acc, r) => acc + (r.totalStudentsActive ?? 0),
        0
      );
      const totalStudents = rows.reduce(
        (acc, r) => acc + (r.totalStudents ?? 0),
        0
      );

      return (
        <div className="w-full overflow-hidden rounded-xl border">
          {/* Header hijau */}
          <div className="grid grid-cols-2 bg-emerald-950 text-emerald-300 text-xs sm:text-sm font-medium">
            <div className="px-3 py-2 text-center border-r border-emerald-800">
              Kelas (aktif / total)
            </div>
            <div className="px-3 py-2 text-center">Siswa (aktif / total)</div>
          </div>

          {/* Angka */}
          <div className="grid grid-cols-2 text-sm bg-card">
            <div className="px-3 py-3 text-center">
              <span className="font-semibold tabular-nums">
                {activeClasses}
              </span>
              <span className="mx-1">/</span>
              <span className="tabular-nums">{totalClasses}</span>
            </div>

            <div className="px-3 py-3 text-center">
              <span className="font-semibold tabular-nums">
                {totalStudentsActive}
              </span>
              <span className="mx-1">/</span>
              <span className="tabular-nums">{totalStudents}</span>
            </div>
          </div>
        </div>
      );
    })()
  );

  /* ===== Columns: Kelas (pakai field compact) ===== */
  const columns: ColumnDef<MiddleClassRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Kelas",
        minW: "180px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div>
            <div className="font-medium whitespace-normal break-words">
              {r.name}
            </div>

          </div>
        ),
      },
      {
        id: "period",
        header: "Periode",
        minW: "170px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div className="text-sm whitespace-normal break-words">
            {fmtDate(r.startDate)} — {fmtDate(r.endDate)}
          </div>
        ),
      },
      {
        id: "students",
        header: "Siswa Aktif",
        minW: "150px",
        align: "center",
        className: "text-center",
        cell: (r) => (
          <span className="font-medium tabular-nums">
            {r.totalStudentsActive} / {r.totalStudents}
          </span>
        ),
      },
      {
        id: "sections",
        header: "Rombel Aktif",
        minW: "140px",
        align: "center",
        className: "text-center",
        cell: (r) => (
          <span className="font-medium tabular-nums">
            {r.totalSectionsActive} / {r.totalSections}
          </span>
        ),
      },
      {
        id: "quota",
        header: "Kuota Terisi",
        align: "center",
        minW: "140px",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1 text-sm tabular-nums">
            <span className="font-medium">{r.quotaTaken ?? 0}</span>
            <span className="opacity-70">/</span>
            <span className="font-medium">{r.quotaTotal ?? "∞"}</span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        align: "center",
        minW: "100px",
        cell: (r) => <CBadgeStatus status={r.status} />,
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
            defaultQuery={query}
            onQueryChange={(val) => {
              if (val !== query) {
                setQuery(val);
              }
            }}
            searchByKeys={["name", "slug"]}
            searchPlaceholder="Cari nama/slug kelas…"
            statsSlot={statsSlot}
            loading={classesQ.isLoading}
            error={classesQ.isError ? "Gagal memuat kelas." : null}
            columns={columns}
            rows={rows}
            getRowId={(r) => r.id}
            stickyHeader
            zebra
            viewModes={["table", "card"]}
            defaultView="table"
            storageKey={`classes:${schoolId}`}
            onRowClick={(r) => navigate(`${r.id}`)}
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            /* ACTIONS */
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
                    },
                  })
                }
                onEdit={() => navigate(`edit/${row.id}`)}
                onDelete={() => console.log("hapus kelas", row.id)}
              />
            )}
            /* CARD RENDERING */
            renderCard={(r) => (
              <div
                className={cn(
                  "p-4 border rounded-xl space-y-3 bg-card",
                  cardHover
                )}
                onClick={() => navigate(`${r.id}`)}
              >
                <div className="font-semibold">{r.name}</div>

                <div className="text-xs text-muted-foreground">
                  Slug: {r.slug}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">Periode</div>
                    <div className="font-medium">
                      {fmtDate(r.startDate)} — {fmtDate(r.endDate)}
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">
                      Kuota Terisi
                    </div>
                    <div className="font-medium">
                      {r.quotaTaken ?? 0} / {r.quotaTotal ?? "∞"}
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <CBadgeStatus status={r.status} />
                  </div>
                </div>

                {/* Siswa & rombel */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="border rounded p-2">
                    <div className="text-[11px] text-muted-foreground">
                      Siswa (aktif / total)
                    </div>
                    <div className="font-medium text-sm tabular-nums">
                      {r.totalStudentsActive} / {r.totalStudents}
                    </div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-[11px] text-muted-foreground">
                      Rombel aktif / total
                    </div>
                    <div className="font-medium text-sm tabular-nums">
                      {r.totalSectionsActive} / {r.totalSections}
                    </div>
                  </div>
                </div>

                {/* Actions */}
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
        </div>
      </main>
    </div>
  );
};

export default SchoolClass;
