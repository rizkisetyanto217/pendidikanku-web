// src/pages/dashboard/school/class/SchoolClass.tsx
import { useMemo, useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { Plus, Layers, Pencil, Info, Loader2 } from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Modal-mu tetap dipakai */
import TambahKelas, {
  type ClassRow as NewClassRow,
} from "./components/CSchoolAddClass";
import TambahLevel from "./components/CSchoolAddLevel";

/* DataTable (gaya Room/Academic) */
import {
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* ================= Types ================= */
export type ClassStatus = "active" | "inactive";

export interface Level {
  id: string;
  name: string;
  slug: string;
  level?: string | null;
  fee?: number | null;
  is_active: boolean;
}

/* PUBLIC class-parents (levels) */
type ApiClassParent = {
  class_parent_id: string;
  class_parent_school_id: string;
  class_parent_name: string;
  class_parent_code?: string | null;
  class_parent_slug: string;
  class_parent_description?: string | null;
  class_parent_level?: number | null;
  class_parent_is_active: boolean;
  class_parent_total_classes?: number | null;
  class_parent_image_url?: string | null;
  class_parent_created_at: string;
  class_parent_updated_at: string;
};

function mapClassParent(x: ApiClassParent): Level {
  return {
    id: x.class_parent_id,
    name: x.class_parent_name,
    slug: x.class_parent_slug,
    level: x.class_parent_level != null ? String(x.class_parent_level) : null,
    fee: null,
    is_active: x.class_parent_is_active,
  };
}

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
const uid = (p = "tmp") =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const toSlug = (s: string) =>
  (s || "kelas-baru").toLowerCase().trim().replace(/\s+/g, "-");

const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

/* ================= Fetchers ================= */
async function fetchLevelsPublic(schoolId: string): Promise<Level[]> {
  const res = await axios.get<{ data: ApiClassParent[] }>(
    `/public/${schoolId}/class-parents/list`
  );
  return (res.data?.data ?? []).map(mapClassParent);
}

async function fetchClassesPublic(
  schoolId: string,
  params?: { q?: string; status?: ClassStatus | "all"; levelId?: string }
): Promise<ApiClass[]> {
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

/* =========== UI: Chips dengan counter =========== */
function ChipWithCount({
  active,
  label,
  count,
  onClick,
  onEdit,
  title,
}: {
  active?: boolean;
  label: string;
  count?: number;
  onClick?: () => void;
  onEdit?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-lg ring-1",
        active
          ? "bg-secondary text-secondary-foreground ring-border"
          : "bg-background ring-border"
      )}
      title={title}
    >
      <Button
        variant={active ? "secondary" : "outline"}
        size="sm"
        onClick={onClick}
        className={cn("rounded-none h-8 px-3", active && "font-semibold")}
      >
        <span className="truncate max-w-[14rem]">{label}</span>
        {typeof count === "number" && (
          <span className="ml-2 rounded-md bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
            {count}
          </span>
        )}
      </Button>
      {onEdit && (
        <Button
          variant={active ? "secondary" : "outline"}
          size="icon"
          className="rounded-none h-8 w-8 -ml-px"
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
        >
          <Pencil size={14} />
        </Button>
      )}
    </div>
  );
}

/* ================= Page ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolClass: React.FC<Props> = ({
  showBack = false,
  backTo,
}) => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();
  const { schoolId } = useParams<{ schoolId: string }>();
  const hasSchool = Boolean(schoolId);

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Set breadcrumb seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Data Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Data Kelas" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const [openTambah, setOpenTambah] = useState(false);
  const [openTambahLevel, setOpenTambahLevel] = useState(false);

  const q = (sp.get("q") ?? "").trim();
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const levelId = sp.get("level_id") ?? "";

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
  const levelsQ = useQuery({
    queryKey: ["levels-public", schoolId],
    enabled: hasSchool,
    queryFn: () => fetchLevelsPublic(schoolId!),
    staleTime: 60_000,
  });

  const classesQ = useQuery({
    queryKey: ["classes-public", schoolId, q, status, levelId],
    enabled: hasSchool,
    queryFn: () => fetchClassesPublic(schoolId!, { q, status, levelId }),
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

  /* ===== Filter FE by levelId ===== */
  const filteredRows = useMemo(
    () => classRows.filter((r) => !levelId || r.parentId === levelId),
    [classRows, levelId]
  );

  /* ===== Pagination client-side ===== */
  const totalLocal = filteredRows.length;
  const pagedRows = filteredRows.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(Math.max(1, totalLocal) / perPage));

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
        align: "left",
        minW: "260px",
        cell: (r) => (
          <div className="text-left">
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
        cell: (r) => r.term ?? "-",
      },
      {
        id: "reg",
        header: "Jendela Pendaftaran",
        minW: "220px",
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

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    v ? next.set(k, v) : next.delete(k);
    next.set("page", "1");
    setSp(next, { replace: true });
    if (k === "level_id") setPage(1);
  };

  const levels = levelsQ.data ?? [];

  /* ===== Handlers: tambah ===== */
  const handleLevelCreated = (payload?: any) => {
    const lvl: Level = {
      id: payload?.id ?? uid("lv"),
      name: payload?.name ?? "Level Baru",
      slug: payload?.slug ?? toSlug(payload?.name ?? ""),
      level: payload?.level ?? null,
      fee: payload?.fee ?? null,
      is_active: payload?.is_active ?? true,
    };
    qc.setQueryData<Level[]>(["levels-public", schoolId], (old = []) => [
      lvl,
      ...(old ?? []),
    ]);
    setOpenTambahLevel(false);
  };

  const handleClassCreated = (row: NewClassRow) => {
    const parentFromId = levels.find((l) => l.id === levelId) || levels[0];
    const dummy: ApiClass = {
      class_id: (row as any).id ?? uid("cls"),
      class_school_id: (row as any).schoolId ?? schoolId!,
      class_parent_id: (row as any).parentId ?? parentFromId?.id ?? "",
      class_slug: (row as any).slug ?? toSlug(row.name ?? "kelas-baru"),
      class_name: row.name ?? "Kelas Baru",
      class_status: (row as any).is_active ? "active" : "inactive",
      class_registration_opens_at: (row as any).registrationOpen ?? null,
      class_registration_closes_at: (row as any).registrationClose ?? null,
      class_quota_total: (row as any).quotaTotal ?? null,
      class_quota_taken: (row as any).studentCount ?? 0,
      class_start_date: null,
      class_end_date: null,
      class_term_id: null,
      class_image_url: null,
      class_parent_code_snapshot: null,
      class_parent_name_snapshot:
        (row as any).parentName ?? parentFromId?.name ?? null,
      class_parent_slug_snapshot:
        (row as any).parentSlug ?? parentFromId?.slug ?? null,
      class_parent_level_snapshot:
        (row as any).parentLevel ??
        (parentFromId?.level ? Number(parentFromId.level) : null),
      class_term_academic_year_snapshot: null,
      class_term_name_snapshot: null,
      class_term_slug_snapshot: null,
      class_term_angkatan_snapshot: null,
      class_created_at: new Date().toISOString(),
      class_updated_at: new Date().toISOString(),
    };

    qc.setQueryData<ApiClass[]>(
      ["classes-public", schoolId, q, status, levelId],
      (old = []) => [dummy, ...(old ?? [])]
    );

    setOpenTambah(false);
  };

  /* ===== Layout ===== */
  return (
    <div className="h-full w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* ✅ Header bagian atas seperti SchoolAcademic */}
          <div className="md:flex hidden gap-3 items-center mb-4">
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
            <h1 className="font-semibold text-lg md:text-xl">Data Kelas</h1>
          </div>

          {/* Panel Tingkat (LEVEL) */}
          <Card>
            <CardHeader className="py-3 px-4 md:px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers size={18} /> Tingkat
                </CardTitle>
                <Button
                  className="sm:hidden"
                  size="sm"
                  onClick={() => setOpenTambahLevel(true)}
                >
                  <Plus size={16} className="mr-2" /> Tambah Level
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-4 md:px-5">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={levelId ? "outline" : "secondary"}
                  size="sm"
                  className="h-8"
                  onClick={() => setParam("level_id", "")}
                >
                  Semua Tingkat
                </Button>
                {(levels ?? []).map((lv) => (
                  <ChipWithCount
                    key={lv.id}
                    active={levelId === lv.id}
                    label={lv.name}
                    count={
                      (classesQ.data ?? []).filter(
                        (c) => c.class_parent_id === lv.id
                      ).length
                    }
                    title={lv.slug}
                    onClick={() => setParam("level_id", lv.id)}
                    onEdit={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate(`/${schoolId}/sekolah/kelas/tingkat/${lv.id}`);
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daftar Kelas */}
          <Card>
            <CardHeader className="py-3 px-4 md:px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Daftar Kelas</CardTitle>
                <Button
                  className="sm:hidden"
                  size="sm"
                  onClick={() => setOpenTambah(true)}
                >
                  <Plus size={16} className="mr-2" /> Tambah
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-4 md:px-5 pb-4">
              <DataTable<MiddleClassRow>
                onAdd={() => setOpenTambah(true)}
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
                defaultAlign="left"
                stickyHeader
                zebra
                viewModes={["table", "card"] as ViewMode[]}
                defaultView="table"
                storageKey={`classes:${schoolId}`}
                onRowClick={(r) => navigate(`kelas/${r.id}`)}
                pageSize={perPage}
                pageSizeOptions={[10, 20, 50, 100, 200]}
              />

              {/* Footer pagination */}
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="order-2 sm:order-1">
                  {pagedRows.length
                    ? `${(page - 1) * perPage + 1}-${Math.min(
                      page * perPage,
                      totalLocal
                    )} dari ${totalLocal}`
                    : `0 dari ${totalLocal}`}
                </div>
                <div className="order-1 sm:order-2 flex items-center gap-2">
                  <span className="hidden sm:inline">Baris/hal</span>
                  <Select
                    value={String(perPage)}
                    onValueChange={(v) => {
                      setPerPage(Number(v));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[96px] text-sm">
                      <SelectValue placeholder={String(perPage)} />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {[10, 20, 50, 100, 200].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <TambahLevel
        open={openTambahLevel}
        onClose={() => setOpenTambahLevel(false)}
        onCreated={handleLevelCreated}
      />
      <TambahKelas
        open={openTambah}
        onClose={() => setOpenTambah(false)}
        onCreated={handleClassCreated}
      />
    </div>
  );
};

export default SchoolClass;
