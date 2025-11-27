// src/pages/dashboard/school/class/SchoolClass.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Info, Loader2 } from "lucide-react";
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
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* ✅ Current user context */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* ================= Types ================= */
export type ClassStatus = "active" | "inactive";

/* PUBLIC classes (middle layer) */
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
type ApiListClasses = { data: ApiClass[] };

/* Row untuk DataTable KELAS */
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

/* ================= Helpers ================= */
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
  const res = await axios.get<ApiListClasses>(
    `/public/${schoolId}/classes/list`,
    { params: p }
  );
  return res.data?.data ?? [];
}

/* ================= Page ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolClass: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Ambil school_id dari token + fallback cookie */
  const currentUserQ = useCurrentUser();
  const activeMembership = currentUserQ.data?.membership ?? null;
  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;
  const hasSchool = Boolean(schoolId);

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

  const q = (sp.get("q") ?? "").trim();
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const levelId = sp.get("level_id") ?? ""; // tetap didukung via query

  const [page, setPage] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage, setPerPage] = useState(
    () => Number(sp.get("per") ?? 20) || 20
  );
  useEffect(() => {
    const copy = new URLSearchParams(sp);
    copy.set("page", String(page));
    copy.set("per", String(perPage));
    setSp(copy, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  /* ===== Data ===== */
  const classesQ = useQuery({
    queryKey: ["classes-public", schoolId, q, status, levelId],
    enabled: hasSchool,
    queryFn: () => fetchClassesPublic(schoolId, { q, status, levelId }),
    staleTime: 60_000,
  });

  /* ===== DataTable rows ===== */
  const classRows: MiddleClassRow[] = useMemo(() => {
    return (classesQ.data ?? []).map((c) => ({
      id: c.class_id,
      name:
        c.class_name ||
        [
          c.class_parent_name_snapshot,
          c.class_term_name_snapshot,
          c.class_term_academic_year_snapshot,
        ]
          .filter(Boolean)
          .join(" — "),
      slug: c.class_slug,
      parentId: c.class_parent_id,
      parentSlug: c.class_parent_slug_snapshot ?? null,
      parentName: c.class_parent_name_snapshot,
      parentLevel: c.class_parent_level_snapshot ?? undefined,
      term:
        c.class_term_academic_year_snapshot && c.class_term_name_snapshot
          ? `${c.class_term_academic_year_snapshot} — ${c.class_term_name_snapshot}`
          : c.class_term_academic_year_snapshot || c.class_term_name_snapshot,
      regOpen: c.class_registration_opens_at ?? null,
      regClose: c.class_registration_closes_at ?? null,
      quotaTaken: c.class_quota_taken ?? null,
      quotaTotal: c.class_quota_total ?? null,
      status: c.class_status,
    }));
  }, [classesQ.data]);

  /* ===== FE filter by levelId (kalau datang dari URL) ===== */
  const filteredRows = useMemo(
    () => classRows.filter((r) => !levelId || r.parentId === levelId),
    [classRows, levelId]
  );

  /* ===== Pagination client-side ===== */
  const totalLocal = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);

  /* ===== Stats Slot ===== */
  const statsSlot = classesQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat kelas…
    </div>
  ) : classesQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat kelas.
      </div>
      <Button size="sm" onClick={() => classesQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="grid gap-3 md:grid-cols-3 text-sm">
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Jumlah Kelas</div>
        <div className="font-medium">{totalLocal}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Aktif</div>
        <div className="font-medium">
          {filteredRows.filter((r) => r.status === "active").length}
        </div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Terisi Total</div>
        <div className="font-medium">
          {filteredRows.reduce((acc, r) => acc + (r.quotaTaken ?? 0), 0)}
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
        minW: "120px",
        cell: (r) =>
          r.quotaTotal != null ? (
            <span className="tabular-nums">
              {r.quotaTaken ?? 0} / {r.quotaTotal}
            </span>
          ) : (
            <span className="tabular-nums">{r.quotaTaken ?? 0} / ∞</span>
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

  /* ===== Query handlers ===== */
  const handleQueryChange = (val: string) => {
    const copy = new URLSearchParams(sp);
    if (val) copy.set("q", val);
    else copy.delete("q");
    copy.set("page", "1");
    setSp(copy, { replace: true });
    setPage(1);
  };

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
            onAdd={() => navigate("new")} // ➜ /sekolah/kelas/daftar-kelas/new
            addLabel="Tambah"
            controlsPlacement="above"
            defaultQuery={q}
            onQueryChange={handleQueryChange}
            filterer={() => true}
            searchByKeys={["name", "slug", "parentName", "term"]}
            searchPlaceholder="Cari nama/slug/tingkat/periode…"
            statsSlot={statsSlot}
            loading={classesQ.isLoading}
            error={
              classesQ.isError
                ? (classesQ.error as any)?.message ?? "Error"
                : null
            }
            columns={columns}
            rows={pagedRows}
            getRowId={(r) => r.id}
            stickyHeader
            zebra
            viewModes={["table", "card"] as ViewMode[]}
            defaultView="table"
            storageKey={`classes:${schoolId ?? "unknown"}`}
            // ⬇️ kirim state ke detail kelas
            onRowClick={(r) =>
              navigate(`${r.id}`, {
                state: {
                  className: r.name,
                  classSlug: r.slug,
                  parentName: r.parentName,
                  parentLevel: r.parentLevel,
                },
              })
            }
            pageSize={perPage}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            enableActions
            actions={{
              mode: "menu",
              onView: (row) =>
                navigate(`${row.id}`, {
                  state: {
                    className: row.name,
                    classSlug: row.slug,
                    parentName: row.parentName,
                    parentLevel: row.parentLevel,
                  },
                }),
              onEdit: (row) =>
                navigate(`edit/${row.id}`, {
                  state: { classRow: row }, // bisa dipakai buat prefill SchoolClassForm
                }),
              labels: {
                view: "Detail",
                edit: "Edit",
              },
              size: "sm",
            }}
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
