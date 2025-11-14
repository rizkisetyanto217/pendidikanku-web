// src/pages/dashboard/school/class/SchoolClassParents.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Info, Loader2 } from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,

} from "@/components/ui/select";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Modal */
import TambahLevel from "./components/CSchoolAddLevel";

/* DataTable */
import {
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* ================= Types ================= */
export interface Level {
  id: string;
  name: string;
  slug: string;
  level?: string | null;
  fee?: number | null;
  is_active: boolean;
}

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

function mapClassParent(x: ApiClassParent): Level & {
  totalClasses?: number | null;
} {
  return {
    id: x.class_parent_id,
    name: x.class_parent_name,
    slug: x.class_parent_slug,
    level: x.class_parent_level != null ? String(x.class_parent_level) : null,
    fee: null,
    is_active: x.class_parent_is_active,
    totalClasses: x.class_parent_total_classes ?? null,
  };
}

/* ================= Helpers ================= */
const uid = (p = "tmp") =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const toSlug = (s: string) =>
  (s || "level-baru").toLowerCase().trim().replace(/\s+/g, "-");

/* ================= Fetchers ================= */
async function fetchLevelsPublic(
  schoolId: string
): Promise<(Level & { totalClasses?: number | null })[]> {
  const res = await axios.get<{ data: ApiClassParent[] }>(
    `/public/${schoolId}/class-parents/list`
  );
  return (res.data?.data ?? []).map(mapClassParent);
}

/* ================= Page ================= */
const SchoolClassParent: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { schoolId } = useParams<{ schoolId: string }>();
  const hasSchool = Boolean(schoolId);
  const [sp, setSp] = useSearchParams();

  const [openTambahLevel, setOpenTambahLevel] = useState(false);

  const q = (sp.get("q") ?? "").trim();
  const [page, setPage] = useState(() => Number(sp.get("page") ?? 1) || 1);
  const [perPage, setPerPage] = useState(
    () => Number(sp.get("per") ?? 20) || 20
  );

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
    queryKey: ["levels-public", schoolId],
    enabled: hasSchool,
    queryFn: () => fetchLevelsPublic(schoolId!),
    staleTime: 60_000,
  });

  const allLevels = levelsQ.data ?? [];

  /* Filter + search FE */
  const filtered = useMemo(() => {
    if (!q) return allLevels;
    const qq = q.toLowerCase();
    return allLevels.filter(
      (lv) =>
        lv.name.toLowerCase().includes(qq) ||
        lv.slug.toLowerCase().includes(qq) ||
        (lv.level ?? "").toLowerCase().includes(qq)
    );
  }, [allLevels, q]);

  const totalLocal = filtered.length;
  const pagedRows = filtered.slice((page - 1) * perPage, page * perPage);

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
        <div className="text-xs text-muted-foreground">Jumlah Tingkat</div>
        <div className="font-medium">{totalLocal}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Aktif</div>
        <div className="font-medium">
          {filtered.filter((lv) => lv.is_active).length}
        </div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-muted-foreground">Total Kelas</div>
        <div className="font-medium">
          {filtered.reduce((acc, lv) => acc + (lv.totalClasses ?? 0), 0)}
        </div>
      </div>
    </div>
  );

  /* Columns */
  type Row = Level & { totalClasses?: number | null };

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Tingkat",
        minW: "240px",
        align: "center",
        cell: (r) => (
          <div>
            <div className="font-medium truncate">{r.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground truncate">
              Slug: {r.slug}
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
        id: "total",
        header: "Jumlah Kelas",
        minW: "120px",
        align: "center",
        cell: (r) => (
          <span className="tabular-nums">{r.totalClasses ?? 0}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        minW: "110px",
        align: "center",
        cell: (r) => (
          <span
            className={cn(
              "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1",
              r.is_active
                ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                : "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20"
            )}
          >
            {r.is_active ? "Aktif" : "Nonaktif"}
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

  const handleLevelCreated = (payload?: any) => {
    const lvl: Row = {
      id: payload?.id ?? uid("lv"),
      name: payload?.name ?? "Level Baru",
      slug: payload?.slug ?? toSlug(payload?.name ?? ""),
      level: payload?.level ?? null,
      fee: payload?.fee ?? null,
      is_active: payload?.is_active ?? true,
      totalClasses: 0,
    };
    qc.setQueryData<Row[]>(["levels-public", schoolId], (old = []) => [
      lvl,
      ...(old ?? []),
    ]);
    setOpenTambahLevel(false);
  };

  return (
    <div className="h-full w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex-col gap-6">
          {/* Header sederhana */}
          <div className="md:flex hidden gap-3 items-center">
            <h1 className="font-semibold text-lg md:text-xl">Level</h1>
          </div>

          {/* Daftar Tingkat */}

          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">

              </CardTitle>
              <Button size="sm" onClick={() => setOpenTambahLevel(true)}>
                <Plus size={16} className="mr-2" /> Tambah Tingkat
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <DataTable<Row>
              onAdd={() => setOpenTambahLevel(true)}
              addLabel="Tambah Tingkat"
              controlsPlacement="above"
              defaultQuery={q}
              onQueryChange={handleQueryChange}
              filterer={() => true}
              searchByKeys={["name", "slug", "level"]}
              searchPlaceholder="Cari nama/slug/level…"
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
              storageKey={`class-parents:${schoolId}`}
              onRowClick={(r) =>
                navigate(`/${schoolId}/sekolah/kelas/tingkat/${r.id}`)
              }
              pageSize={perPage}
              pageSizeOptions={[10, 20, 50, 100, 200]}
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
                >

                </Select>
              </div>
            </div>
          </CardContent>

        </div>
      </main>

      {/* Modal tambah level */}
      <TambahLevel
        open={openTambahLevel}
        onClose={() => setOpenTambahLevel(false)}
        onCreated={handleLevelCreated}
      />
    </div>
  );
};

export default SchoolClassParent;
