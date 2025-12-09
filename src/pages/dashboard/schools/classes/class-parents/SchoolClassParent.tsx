// src/pages/dashboard/school/class/SchoolClassParents.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Info, Loader2, ImageOff } from "lucide-react";
import axios, { getActiveschoolId } from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* DataTable */
import {
  cardHover,
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* ✅ Current user context (ambil school_id dari token) */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";
import CRowActions from "@/components/costum/table/CRowAction";
import { cn } from "@/lib/utils";

/* ================= Types ================= */

type ApiClassParent = {
  class_parent_id: string;
  class_parent_school_id: string;
  class_parent_class_section_active_count: number;
  class_parent_class_section_count: number;
  class_parent_student_active_count: number;
  class_parent_student_count: number;
  class_parent_name: string;
  class_parent_code?: string | null;
  class_parent_slug: string;
  class_parent_level?: number | null;
  class_parent_is_active: boolean;
  class_parent_image_url?: string | null;
  class_parent_created_at: string;
  class_parent_updated_at: string;
  class_parent_is_deleted: boolean;
};

export interface Level {
  id: string;
  school_id: string;
  name: string;
  code?: string | null;
  slug: string;
  level?: string | null;
  fee?: number | null;
  is_active: boolean;
  is_deleted: boolean;

  class_section_active_count: number;
  class_section_count: number;
  student_active_count: number;
  student_count: number;

  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

function mapClassParent(x: ApiClassParent): Level {
  return {
    id: x.class_parent_id,
    school_id: x.class_parent_school_id,
    name: x.class_parent_name,
    code: x.class_parent_code ?? null,
    slug: x.class_parent_slug,
    level: x.class_parent_level != null ? String(x.class_parent_level) : null,
    fee: null,
    is_active: x.class_parent_is_active,
    is_deleted: x.class_parent_is_deleted,

    class_section_active_count: x.class_parent_class_section_active_count,
    class_section_count: x.class_parent_class_section_count,
    student_active_count: x.class_parent_student_active_count,
    student_count: x.class_parent_student_count,

    image_url: x.class_parent_image_url ?? null,
    created_at: x.class_parent_created_at,
    updated_at: x.class_parent_updated_at,
  };
}

/* ================= Fetchers ================= */

async function fetchClassParents(schoolId: string | null): Promise<Level[]> {
  if (!schoolId) return [];
  const res = await axios.get<{ data: ApiClassParent[] }>(
    "/api/u/class-parents/list",
    {
      params: {
        mode: "compact",
      },
    }
  );
  return (res.data?.data ?? []).map(mapClassParent);
}

/* ================= Utils ================= */

const formatDate = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID");
};

/* ================= Page ================= */
const SchoolClassParent: React.FC = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const q = (sp.get("q") ?? "").trim();
  const [page, setPage] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage, setPerPage] = useState(
    () => Number(sp.get("per") ?? 20) || 20
  );

  /* ✅ Ambil school_id dari token (simple-context) + fallback cookie */
  const currentUserQ = useCurrentUser();
  const activeMembership = currentUserQ.data?.membership ?? null;
  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;
  const hasSchool = Boolean(schoolId);

  // sync page/perPage ke URL
  useEffect(() => {
    const copy = new URLSearchParams(sp);
    copy.set("page", String(page));
    copy.set("per", String(perPage));
    setSp(copy, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  /* Header */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Level",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Level" },
      ],
      actions: null,
    });
  }, [setHeader]);

  /* Query */
  const levelsQ = useQuery({
    queryKey: ["class-parents-compact", schoolId],
    enabled: hasSchool,
    queryFn: () => fetchClassParents(schoolId),
    staleTime: 60_000,
  });

  const allLevels = levelsQ.data ?? [];

  /* Filter + search FE */
  const filtered = useMemo(() => {
    if (!q) return allLevels;
    const qq = q.toLowerCase();
    return allLevels.filter((lv) => {
      const levelStr = lv.level ?? "";
      return (
        lv.name.toLowerCase().includes(qq) ||
        lv.slug.toLowerCase().includes(qq) ||
        (lv.code ?? "").toLowerCase().includes(qq) ||
        levelStr.toLowerCase().includes(qq)
      );
    });
  }, [allLevels, q]);

  const totalLocal = filtered.length;
  const pagedRows = filtered.slice((page - 1) * perPage, page * perPage);

  const totalClassesActive = filtered.reduce(
    (acc, lv) => acc + lv.class_section_active_count,
    0
  );
  const totalClasses = filtered.reduce(
    (acc, lv) => acc + lv.class_section_count,
    0
  );
  const totalStudentsActive = filtered.reduce(
    (acc, lv) => acc + lv.student_active_count,
    0
  );
  const totalStudents = filtered.reduce((acc, lv) => acc + lv.student_count, 0);

  /* Stats */
  const statsSlot = levelsQ.isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat tingkat…
    </div>
  ) : levelsQ.isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat tingkat.
      </div>
      <Button size="sm" onClick={() => levelsQ.refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="grid gap-3 md:grid-cols-3 text-sm">
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Jumlah Level</div>
        <div className="font-medium">{totalLocal}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">
          Total Kelas (aktif / total)
        </div>
        <div className="font-medium tabular-nums">
          {totalClassesActive} / {totalClasses}
        </div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">
          Total Siswa (aktif / total)
        </div>
        <div className="font-medium tabular-nums">
          {totalStudentsActive} / {totalStudents}
        </div>
      </div>
    </div>
  );

  /* Columns */
  type Row = Level;

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Level",
        minW: "260px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div className="space-y-0.5">
            <div className="font-medium truncate">{r.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              Kode: {r.code || "-"} • Slug: {r.slug}
            </div>
          </div>
        ),
      },
      {
        id: "level",
        header: "Level",
        minW: "80px",
        align: "center",
        cell: (r) => r.level ?? "-",
      },
      {
        id: "classes",
        header: "Kelas (aktif / total)",
        minW: "150px",
        align: "center",
        cell: (r) => (
          <span className="tabular-nums">
            {r.class_section_active_count} / {r.class_section_count}
          </span>
        ),
      },
      {
        id: "students",
        header: "Siswa (aktif / total)",
        minW: "160px",
        align: "center",
        cell: (r) => (
          <span className="tabular-nums">
            {r.student_active_count} / {r.student_count}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        minW: "110px",
        align: "center",
        cell: (r) => {
          const status =
            r.is_deleted === true
              ? "inactive"
              : r.is_active === true
              ? "active"
              : "inactive";

          return <CBadgeStatus status={status} />;
        },
      },
      {
        id: "created_at",
        header: "Dibuat",
        minW: "140px",
        align: "center",
        cell: (r) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(r.created_at)}
          </span>
        ),
      },
      {
        id: "updated_at",
        header: "Diupdate",
        minW: "140px",
        align: "center",
        cell: (r) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(r.updated_at)}
          </span>
        ),
      },
    ],
    []
  );

  /* Handlers */
  const handleQueryChange = (val: string) => {
    const copy = new URLSearchParams(sp);
    if (val) copy.set("q", val);
    else copy.delete("q");
    copy.set("page", "1");
    setSp(copy, { replace: true });
    setPage(1);
  };

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header sederhana */}
          <div className="md:flex hidden gap-3 items-center">
            <h1 className="font-semibold text-lg md:text-xl">Level</h1>
          </div>

          {/* Daftar Tingkat */}
          <DataTable<Row>
            onAdd={() => navigate("new")}
            addLabel="Tambah"
            controlsPlacement="above"
            defaultQuery={q}
            onQueryChange={handleQueryChange}
            filterer={() => true}
            searchByKeys={["name", "slug", "level", "code"]}
            searchPlaceholder="Cari nama/kode/slug/level…"
            statsSlot={statsSlot}
            loading={levelsQ.isLoading}
            error={
              levelsQ.isError
                ? (levelsQ.error as any)?.message ?? "Error"
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
            storageKey={`class-parents:${schoolId ?? "unknown"}`}
            onRowClick={(r) => navigate(`${r.id}`)}
            pageSize={perPage}
            pageSizeOptions={[10, 20, 50, 100, 200]}
            renderActions={(row, view) => (
              <CRowActions
                row={row}
                mode="inline"
                size="sm"
                onView={() => navigate(`${row.id}`)}
                onEdit={() => navigate(`edit/${row.id}`)}
                onDelete={() => console.log("delete", row.id)}
                forceMenu={view === "table"} // TABLE = menu, CARD = inline
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
                {/* Thumbnail */}
                {r.image_url ? (
                  <div className="relative w-full pb-[40%] overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={r.image_url}
                      alt={r.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border bg-muted/40 py-6 text-xs text-muted-foreground gap-2">
                    <ImageOff size={14} />
                    Tidak ada gambar
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Kode: {r.code || "-"} • Slug: {r.slug}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">Level</div>
                    <div className="font-medium">{r.level ?? "-"}</div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">
                      Kelas (aktif / total)
                    </div>
                    <div className="font-medium tabular-nums">
                      {r.class_section_active_count} / {r.class_section_count}
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground">
                      Siswa (aktif / total)
                    </div>
                    <div className="font-medium tabular-nums">
                      {r.student_active_count} / {r.student_count}
                    </div>
                  </div>

                  <div className="border rounded p-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Status
                    </div>
                    <CBadgeStatus
                      status={
                        r.is_deleted
                          ? "inactive"
                          : r.is_active
                          ? "active"
                          : "inactive"
                      }
                    />
                  </div>

                  <div className="border rounded p-2 col-span-2 md:col-span-1">
                    <div className="text-xs text-muted-foreground">
                      Dibuat / Diupdate
                    </div>
                    <div className="text-[11px] leading-tight text-muted-foreground">
                      <div>Dibuat: {formatDate(r.created_at)}</div>
                      <div>Update: {formatDate(r.updated_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Aksi CARD VIEW */}
                <div
                  className="flex justify-end"
                  onClick={(e) => e.stopPropagation()} // cegah navigasi
                >
                  <CRowActions
                    row={r}
                    mode="inline"
                    size="sm"
                    onView={() => navigate(`${r.id}`)}
                    onEdit={() => navigate(`edit/${r.id}`)}
                    onDelete={() => console.log("delete", r.id)}
                    forceMenu={false}
                  />
                </div>
              </div>
            )}
          />

          {/* Footer pagination (opsi perPage) */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="order-1 sm:order-2 flex items-center gap-2">
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setPage(1);
                }}
              >
                {/* Kalau mau, nanti bisa diisi SelectTrigger/Content */}
              </Select>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolClassParent;
