// src/pages/pendidikanku-dashboard/dashboard-school/class/SchoolClass.tsx
import { useMemo, useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Layers,
  ArrowLeft,
  Pencil,
  Info,
  Loader2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

export interface ClassRow {
  id: string;
  code: string;
  name: string;
  grade: string;
  homeroom: string;
  studentCount: number;
  schedule: string;
  status: ClassStatus;
  classId?: string;
}

export interface Level {
  id: string;
  name: string;
  slug: string;
  level?: string | null;
  fee?: number | null;
  is_active: boolean;
}

type ApiSchedule = {
  start?: string;
  end?: string;
  days?: string[];
  location?: string;
};

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_teacher_id?: string | null;
  class_section_assistant_teacher_id?: string | null;
  class_section_class_room_id?: string | null;
  class_section_leader_student_id?: string | null;
  class_section_slug: string;
  class_section_name: string;
  class_section_code?: string | null;
  class_section_schedule?: ApiSchedule | null;
  class_section_capacity?: number | null;
  class_section_total_students?: number | null;
  class_section_group_url?: string | null;
  class_section_image_url?: string | null;
  class_section_is_active: boolean;
  class_section_created_at: string;
  class_section_updated_at: string;
  class_section_parent_name_snap?: string | null;
  class_section_parent_code_snap?: string | null;
  class_section_parent_slug_snap?: string | null;
  class_section_class_slug_snap?: string | null;
  class_section_class_name_snap?: string | null;
};

type ApiListSections = {
  data: ApiClassSection[];
  pagination?: { total?: number; total_pages?: number };
};

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

type MiddleClassChip = {
  id: string;
  name: string;
  slug?: string | null;
  count: number;
};

/* NEW: SectionRow untuk DataTable */
type SectionRow = {
  id: string;
  code: string;
  name: string;
  level?: string | null;
  clazz?: string | null;
  scheduleText: string;
  shift: "Pagi" | "Sore" | "-";
  capacity?: number | null;
  studentCount: number;
  status: "active" | "inactive";
  classId?: string;
};

/* ================= Helpers ================= */
const scheduleToText = (sch?: ApiSchedule | null): string => {
  if (!sch) return "-";
  const days = (sch?.days ?? []).join(", ");
  const time = [sch?.start, sch?.end].every(Boolean)
    ? `${sch?.start}–${sch?.end}`
    : sch?.start || sch?.end || "";
  const loc = sch?.location ? ` @${sch.location}` : "";
  const left = [days, time].filter(Boolean).join(" ");
  return left ? `${left}${loc}` : "-";
};

const getShiftFromSchedule = (
  sch?: ApiSchedule | null
): "Pagi" | "Sore" | "-" => {
  if (!sch?.start) return "-";
  const [hh] = sch.start.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(hh)) return "-";
  return hh < 12 ? "Pagi" : "Sore";
};

const uid = (p = "tmp") =>
  `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ================= Fetchers ================= */
async function fetchClassSections({
  schoolId,
  q,
  status,
  classId,
  page,
  perPage,
}: {
  schoolId: string;
  q?: string;
  status?: ClassStatus | "all";
  classId?: string;
  page?: number;
  perPage?: number;
}): Promise<ApiListSections> {
  const params: Record<string, any> = {};
  if (q?.trim()) params.search = q.trim();
  if (status && status !== "all") params.active_only = status === "active";
  if (classId) params.class_parent_id = classId;
  if (page) params.page = page;
  if (perPage) params.per_page = perPage;

  const res = await axios.get<ApiListSections>(
    `/public/${schoolId}/class-sections/list`,
    { params }
  );
  return res.data ?? { data: [] };
}

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

/* =========== UI: Chips yang lebih clean + counter kecil =========== */
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

/* ====== Actions Menu (lihat / edit) ====== */
function SectionActions({
  onView,
  onEdit,
}: {
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreHorizontal size={18} />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================= Page ================= */
const SchoolClass: React.FC<{
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}> = ({ showBack = false, backTo, backLabel = "Kembali" }) => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();

  const [openTambah, setOpenTambah] = useState(false);
  const [openTambahLevel, setOpenTambahLevel] = useState(false);

  const { schoolId } = useParams<{ schoolId: string }>();
  const hasSchool = Boolean(schoolId);

  const q = (sp.get("q") ?? "").trim();
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const shift = (sp.get("shift") ?? "all") as "Pagi" | "Sore" | "all";
  const levelId = sp.get("level_id") ?? "";
  const classId = sp.get("class_id") ?? "";

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

  const selectedLevelSlug = useMemo(() => {
    const lv = (levelsQ.data ?? []).find((x) => x.id === levelId);
    return lv?.slug ?? null;
  }, [levelsQ.data, levelId]);

  const classesQ = useQuery({
    queryKey: ["classes-public", schoolId, q, status, levelId],
    enabled: hasSchool,
    queryFn: () => fetchClassesPublic(schoolId!, { q, status, levelId }),
    staleTime: 60_000,
  });

  const {
    data: apiRes,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["class-sections", schoolId, q, status, levelId, page, perPage],
    enabled: hasSchool,
    queryFn: () =>
      fetchClassSections({
        schoolId: schoolId!,
        q,
        status,
        classId: levelId || undefined,
        page,
        perPage,
      }),
    staleTime: 60_000,
  });

  const apiItems = apiRes?.data ?? [];
  const serverTotal = apiRes?.pagination?.total;
  const serverTotalPages = apiRes?.pagination?.total_pages;

  useEffect(() => {
    if (!openTambah) refetch();
  }, [openTambah, refetch]);

  const sectionCountByClassId = useMemo(() => {
    const m = new Map<string, number>();
    (apiItems ?? []).forEach((s) => {
      if (!s.class_section_class_id) return;
      const okLevel =
        !selectedLevelSlug ||
        s.class_section_parent_slug_snap === selectedLevelSlug;
      if (!okLevel) return;
      m.set(
        s.class_section_class_id,
        (m.get(s.class_section_class_id) ?? 0) + 1
      );
    });
    return m;
  }, [apiItems, selectedLevelSlug]);

  const classChips: MiddleClassChip[] = useMemo(() => {
    const arr = (classesQ.data ?? [])
      .filter(
        (c) =>
          !selectedLevelSlug ||
          c.class_parent_slug_snapshot === selectedLevelSlug
      )
      .map((c) => {
        const label =
          c.class_name && c.class_name.trim().length > 0
            ? c.class_name
            : [
                c.class_parent_name_snapshot ?? "Class",
                c.class_term_name_snapshot ?? "",
                c.class_term_academic_year_snapshot ?? "",
              ]
                .filter(Boolean)
                .join(" — ");

        return {
          id: c.class_id,
          name: label,
          slug: c.class_slug,
          count: sectionCountByClassId.get(c.class_id) ?? 0,
        };
      });
    return arr.sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [classesQ.data, selectedLevelSlug, sectionCountByClassId]);

  useEffect(() => {
    if (classId && !classChips.find((c) => c.id === classId)) {
      const next = new URLSearchParams(sp);
      next.delete("class_id");
      setSp(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevelSlug, classChips.length]);

  const mappedRows: SectionRow[] = useMemo(
    () =>
      (apiItems ?? []).map((it) => ({
        id: it.class_section_id,
        classId: it.class_section_class_id,
        code: it.class_section_code ?? "-",
        name: it.class_section_name,
        level: it.class_section_parent_name_snap ?? null,
        clazz: it.class_section_class_name_snap ?? null,
        scheduleText: scheduleToText(it.class_section_schedule),
        shift: getShiftFromSchedule(it.class_section_schedule),
        capacity: it.class_section_capacity ?? null,
        studentCount: it.class_section_total_students ?? 0,
        status: it.class_section_is_active ? "active" : "inactive",
      })),
    [apiItems]
  );

  const filteredRows = useMemo(() => {
    return mappedRows.filter((r) => {
      const apiItem = (apiItems ?? []).find((x) => x.class_section_id === r.id);
      const okLevel =
        !selectedLevelSlug ||
        apiItem?.class_section_parent_slug_snap === selectedLevelSlug;
      const okClass = !classId || r.classId === classId;
      const okShift = shift === "all" || r.shift === shift;
      return okLevel && okClass && okShift;
    });
  }, [mappedRows, apiItems, selectedLevelSlug, classId, shift]);

  const sectionCountByLevel = useMemo(() => {
    const m = new Map<string, number>();
    (apiItems ?? []).forEach((it) => {
      const s = it.class_section_parent_slug_snap;
      if (!s) return;
      m.set(s, (m.get(s) ?? 0) + 1);
    });
    return m;
  }, [apiItems]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    v ? next.set(k, v) : next.delete(k);
    if (k === "level_id") next.delete("class_id");
    next.set("page", "1");
    setSp(next, { replace: true });
    if (k === "level_id" || k === "class_id") setPage(1);
  };

  const levels = levelsQ.data ?? [];
  const toSlug = (s: string) =>
    (s || "level-baru").toLowerCase().trim().replace(/\s+/g, "-");

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
    const dummy: ApiClassSection = {
      class_section_id: (row as any).id ?? uid("sec"),
      class_section_class_id: (row as any).classId ?? "",
      class_section_school_id: (row as any).schoolId ?? schoolId!,
      class_section_teacher_id: (row as any).teacherId ?? null,
      class_section_slug: (row as any).slug ?? toSlug(row.name ?? "kelas-baru"),
      class_section_name: row.name ?? "Kelas Baru",
      class_section_code: (row as any).code ?? "-",
      class_section_capacity: (row as any).capacity ?? null,
      class_section_schedule: (row as any).schedule ?? {
        days: [],
        start: undefined,
        end: undefined,
      },
      class_section_total_students: (row as any).studentCount ?? 0,
      class_section_is_active: (row as any).is_active ?? true,
      class_section_created_at: new Date().toISOString(),
      class_section_updated_at: new Date().toISOString(),
      class_section_parent_slug_snap: selectedLevelSlug ?? undefined,
    };

    qc.setQueryData<ApiListSections>(
      ["class-sections", schoolId, q, status, levelId, page, perPage],
      (old) => ({
        data: [dummy, ...((old?.data ?? []) as ApiClassSection[])],
        pagination: old?.pagination,
      })
    );

    setOpenTambah(false);
  };

  const goEditLevel = (e: ReactMouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/${schoolId}/sekolah/kelas/tingkat/${id}`);
  };
  const goEditClass = (e: ReactMouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/${schoolId}/sekolah/kelas/kelas/${id}`);
  };

  /* ===== Columns: compact & rapi ===== */
  const columns: ColumnDef<SectionRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Section",
        align: "left",
        minW: "280px",
        cell: (r) => (
          <div className="text-left">
            <div className="font-medium truncate">{r.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground truncate">
              Kode: {r.code}
            </div>
          </div>
        ),
      },
      {
        id: "level",
        header: "Tingkat",
        align: "left",
        minW: "160px",
        cell: (r) => <span className="truncate">{r.level ?? "-"}</span>,
      },
      {
        id: "clazz",
        header: "Kelas (Middle)",
        align: "left",
        minW: "180px",
        cell: (r) => <span className="truncate">{r.clazz ?? "-"}</span>,
      },
      {
        id: "schedule",
        header: "Jadwal",
        align: "left",
        minW: "240px",
        cell: (r) => <span className="truncate">{r.scheduleText}</span>,
      },
      {
        id: "capacity",
        header: "Kapasitas",
        align: "center",
        minW: "100px",
        cell: (r) => r.capacity ?? "-",
      },
      {
        id: "studentCount",
        header: "Siswa",
        align: "center",
        minW: "90px",
        cell: (r) => r.studentCount,
      },
      {
        id: "shift",
        header: "Shift",
        align: "center",
        minW: "90px",
        cell: (r) => r.shift,
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

  /* ===== Query handler (sinkron URL) ===== */
  const handleQueryChange = (val: string) => {
    const copy = new URLSearchParams(sp);
    if (val) copy.set("q", val);
    else copy.delete("q");
    copy.set("page", "1");
    setSp(copy, { replace: true });
    setPage(1);
  };

  /* ===== Stats Slot ===== */
  const totalFromServer = serverTotal;
  const totalLocal = filteredRows.length;
  const total = totalFromServer ?? totalLocal;

  const statsSlot = isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat section…
    </div>
  ) : isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2">
        <Info size={16} /> Gagal memuat section.
      </div>
      <Button size="sm" onClick={() => refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">{total} total</div>
  );

  /* ===== Pagination: server atau client ===== */
  const totalPages =
    serverTotalPages ??
    Math.max(1, Math.ceil((totalLocal || 0) / Math.max(1, perPage)));

  const pagedRows =
    serverTotalPages != null
      ? filteredRows
      : filteredRows.slice((page - 1) * perPage, page * perPage);

  /* ===== Layout ===== */
  return (
    <div className="h-full w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 px-4 md:px-6 py-4 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              {showBack && (
                <Button
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  variant="ghost"
                  size="icon"
                  aria-label={backLabel}
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h1 className="text-lg">Seluruh Kelas</h1>
            </div>
            <div className="hidden sm:block">
              <Button size="sm" onClick={() => setOpenTambah(true)}>
                <Plus size={16} className="mr-2" /> Tambah Section
              </Button>
            </div>
          </div>

          {/* Panel Tingkat (LEVEL) */}
          <Card>
            <CardHeader className="py-3 px-4 md:px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers size={18} /> Tingkat
                </CardTitle>
                <Button onClick={() => setOpenTambahLevel(true)} size="sm">
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
                {(levels ?? []).map((lv) => {
                  const cnt = sectionCountByLevel.get(lv.slug) ?? 0;
                  const active = levelId === lv.id;
                  return (
                    <ChipWithCount
                      key={lv.id}
                      active={active}
                      label={lv.name}
                      count={cnt}
                      title={lv.slug}
                      onClick={() => setParam("level_id", lv.id)}
                      onEdit={(e) => goEditLevel(e, lv.id)}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Panel Kelas (middle) */}
          <Card>
            <CardHeader className="py-3 px-4 md:px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers size={18} /> Kelas (Dalam Tingkat)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 px-4 md:px-5">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={classId ? "outline" : "secondary"}
                  size="sm"
                  className="h-8"
                  onClick={() => setParam("class_id", "")}
                >
                  Semua Kelas
                </Button>
                {classChips.map((c) => {
                  const active = classId === c.id;
                  return (
                    <ChipWithCount
                      key={c.id}
                      active={active}
                      label={c.name}
                      count={c.count}
                      title={c.slug ?? c.name}
                      onClick={() => setParam("class_id", c.id)}
                      onEdit={(e) => goEditClass(e, c.id)}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daftar Section (DataTable) */}
          <Card>
            <CardHeader className="py-3 px-4 md:px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Daftar Kelas Paralel (Section)
                </CardTitle>
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
              <DataTable<SectionRow>
                onAdd={() => setOpenTambah(true)}
                addLabel="Tambah"
                controlsPlacement="above"
                defaultQuery={q}
                onQueryChange={handleQueryChange}
                filterer={() => true}
                searchPlaceholder="Cari nama/kode/jadwal…"
                statsSlot={statsSlot}
                loading={isLoading}
                error={isError ? (error as any)?.message ?? "Error" : null}
                columns={columns}
                rows={pagedRows}
                getRowId={(r) => r.id}
                defaultAlign="left"
                stickyHeader
                zebra
                viewModes={["table", "card"] as ViewMode[]}
                defaultView="table"
                storageKey={`sections:${schoolId}`}
                onRowClick={(r) => navigate(`kelola/${r.id}`)}
                renderActions={(r) => (
                  <SectionActions
                    onView={() => navigate(`kelola/${r.id}`)}
                    onEdit={() => navigate(`kelola/${r.id}`)}
                  />
                )}
                pageSize={perPage}
                pageSizeOptions={[10, 20, 50, 100, 200]}
              />

              {/* Footer pagination (kanan) */}
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="order-2 sm:order-1">
                  {pagedRows.length
                    ? `${(page - 1) * perPage + 1}-${Math.min(
                        page * perPage,
                        total
                      )} dari ${total}`
                    : `0 dari ${total}`}
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
