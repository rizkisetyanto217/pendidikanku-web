// src/pages/pendidikanku-dashboard/dashboard-school/class/SchoolClass.tsx
import { useMemo, useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSearchParams,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Plus, Layers, ArrowLeft, Pencil } from "lucide-react";
import axios from "@/lib/axios";

// ⬇️ shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Modal-mu tetap dipakai
import TambahKelas, {
  type ClassRow as NewClassRow,
} from "./components/CSchoolAddClass";
import TambahLevel from "./components/CSchoolAddLevel";

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
  /** id class (middle layer) */
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

  // snapshot ringkas parent (LEVEL)
  class_section_parent_name_snap?: string | null;
  class_section_parent_code_snap?: string | null;
  class_section_parent_slug_snap?: string | null;

  // (opsional) snapshot class (middle) bila backend kirim
  class_section_class_slug_snap?: string | null;
  class_section_class_name_snap?: string | null;
};

type ApiListSections = {
  data: ApiClassSection[];
};

/* ====== PUBLIC class-parents (levels) ====== */
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

/* ====== PUBLIC classes (middle layer) ====== */
type ApiClass = {
  class_id: string;
  class_school_id: string;
  class_parent_id: string;
  class_slug: string;
  class_name: string; // bisa kosong
  class_start_date?: string | null;
  class_end_date?: string | null;
  class_term_id?: string | null;
  class_registration_opens_at?: string | null;
  class_registration_closes_at?: string | null;
  class_quota_taken?: number | null;
  class_status: "active" | "inactive";
  class_image_url?: string | null;

  // snapshots
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

/* ================= Helpers ================= */
const parseGrade = (code?: string | null, name?: string): string => {
  const from = (code ?? name ?? "").toString();
  const m = from.match(/\d+/);
  return m ? m[0] : "-";
};

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
}: {
  schoolId: string;
  q?: string;
  status?: ClassStatus | "all";
  classId?: string; // kalau BE support filter by class_parent_id (level) akan ikut dipakai
}): Promise<ApiClassSection[]> {
  const params: Record<string, any> = {};
  if (q?.trim()) params.search = q.trim();
  if (status && status !== "all") params.active_only = status === "active";
  if (classId) params.class_parent_id = classId;
  const res = await axios.get<ApiListSections>(
    `/public/${schoolId}/class-sections/list`,
    { params }
  );
  return res.data?.data ?? [];
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

/* ================= Small UI: FilterChip ================= */
function FilterChip({
  active,
  children,
  onClick,
  title,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <Button
      variant={active ? "secondary" : "outline"}
      size="sm"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 h-auto",
        active && "font-semibold",
        className
      )}
    >
      {children}
    </Button>
  );
}

/* ================= Card ================= */
function ClassCard({ r }: { r: ClassRow }) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Kode • Tingkat</div>
            <div className="font-semibold text-sm truncate">
              {r.code} • {r.grade}
            </div>
          </div>
          <Badge variant={r.status === "active" ? "default" : "outline"}>
            {r.status === "active" ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Nama Kelas</div>
          <div className="text-sm font-medium truncate">{r.name}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Wali Kelas</div>
            <div className="text-sm truncate">{r.homeroom}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Siswa</div>
            <div className="text-sm">{r.studentCount}</div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Jadwal</div>
          <div className="text-sm break-words">{r.schedule || "-"}</div>
        </div>

        <div className="pt-1 flex justify-end gap-2">
          <Link to={`kelola/${r.id}`} state={{ classData: r }}>
            <Button size="sm">Kelola</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
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

  // ✅ Ambil :schoolId dari protected route
  const { schoolId } = useParams<{ schoolId: string }>();
  const hasSchool = Boolean(schoolId);

  const q = (sp.get("q") ?? "").trim();
  const status = (sp.get("status") ?? "all") as ClassStatus | "all";
  const shift = (sp.get("shift") ?? "all") as "Pagi" | "Sore" | "all";

  // filter chip
  const levelId = sp.get("level_id") ?? "";
  const classId = sp.get("class_id") ?? "";

  // Levels dari endpoint publik
  const levelsQ = useQuery({
    queryKey: ["levels-public", schoolId],
    enabled: hasSchool,
    queryFn: () => fetchLevelsPublic(schoolId!),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // slug level terpilih (untuk filter client-side via snapshot)
  const selectedLevelSlug = useMemo(() => {
    const lv = (levelsQ.data ?? []).find((x) => x.id === levelId);
    return lv?.slug ?? null;
  }, [levelsQ.data, levelId]);

  // Class sections
  const {
    data: apiItems = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["class-sections", schoolId, q, status, levelId],
    enabled: hasSchool,
    queryFn: () =>
      fetchClassSections({
        schoolId: schoolId!,
        q,
        status,
        classId: levelId || undefined, // kalau BE belum support, tetap aman
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Classes (middle layer)
  const classesQ = useQuery({
    queryKey: ["classes-public", schoolId, q, status, levelId],
    enabled: hasSchool,
    queryFn: () => fetchClassesPublic(schoolId!, { q, status, levelId }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!openTambah) refetch();
  }, [openTambah, refetch]);

  // Hitung jumlah section per CLASS ID (untuk chip count)
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

  // Daftar chip class
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

  // Reset class_id kalau tidak relevan dengan level terpilih
  useEffect(() => {
    if (classId && !classChips.find((c) => c.id === classId)) {
      const next = new URLSearchParams(sp);
      next.delete("class_id");
      setSp(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevelSlug, classChips.length]);

  // Map ke row grid (section)
  const mappedRows: ClassRow[] = useMemo(
    () =>
      (apiItems ?? []).map((it) => ({
        id: it.class_section_id,
        classId: it.class_section_class_id, // id "class" (middle layer)
        code: it.class_section_code ?? "-",
        name: it.class_section_name,
        grade: parseGrade(it.class_section_code, it.class_section_name),
        homeroom: "-", // endpoint publik belum kirim nama wali
        studentCount: it.class_section_total_students ?? 0,
        schedule: scheduleToText(it.class_section_schedule),
        status: it.class_section_is_active ? "active" : "inactive",
      })),
    [apiItems]
  );

  // FILTER: level + class + shift
  const filteredRows = useMemo(() => {
    return mappedRows.filter((r) => {
      const apiItem = (apiItems ?? []).find((x) => x.class_section_id === r.id);
      const okLevel =
        !selectedLevelSlug ||
        apiItem?.class_section_parent_slug_snap === selectedLevelSlug;

      const okClass = !classId || r.classId === classId;

      const rowShift = getShiftFromSchedule(apiItem?.class_section_schedule);
      const okShift = shift === "all" || rowShift === shift;

      return okLevel && okClass && okShift;
    });
  }, [mappedRows, apiItems, selectedLevelSlug, classId, shift]);

  // Counter section per level (chip level)
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
    if (k === "level_id") next.delete("class_id"); // reset class saat level berubah
    setSp(next, { replace: true });
  };

  const items = filteredRows;
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
    // dummy untuk optimistic UI
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

    qc.setQueryData<ApiClassSection[]>(
      ["class-sections", schoolId, q, status, levelId],
      (old = []) => [dummy, ...(old ?? [])]
    );

    setOpenTambah(false);
  };

  /* ==== helper: go edit without changing filter ==== */
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

  return (
    <div className="h-full w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* ================= Header ================= */}
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg flex items-center">
                <div className="items-center md:flex">
                  {showBack && (
                    <Button
                      onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                      aria-label={backLabel}
                    >
                      <ArrowLeft size={20} />
                    </Button>
                  )}
                </div>
                <h1>Seluruh Kelas</h1>
              </div>
            </div>

            {/* ===== Panel Tingkat (LEVEL) ===== */}
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
                <div className="flex flex-wrap gap-2 min-w-0">
                  {/* Semua Tingkat */}
                  <FilterChip
                    active={!levelId}
                    onClick={() => setParam("level_id", "")}
                  >
                    Semua Tingkat
                  </FilterChip>

                  {/* Item Level + ✏️ */}
                  {(levels ?? []).map((lv) => {
                    const cnt = sectionCountByLevel.get(lv.slug) ?? 0;
                    const active = levelId === lv.id;
                    return (
                      <div
                        key={lv.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border border-border"
                        )}
                      >
                        <FilterChip
                          active={active}
                          onClick={() => setParam("level_id", lv.id)}
                          title={lv.slug}
                          className="rounded-r-none"
                        >
                          {lv.name}{" "}
                          <span className="text-muted-foreground">({cnt})</span>
                        </FilterChip>
                        <Button
                          variant={active ? "secondary" : "outline"}
                          size="icon"
                          className="rounded-l-none h-auto p-1 pr-2"
                          title="Edit Tingkat"
                          onClick={(e) => goEditLevel(e, lv.id)}
                        >
                          <Pencil size={14} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ===== Panel CLASS (middle chips) ===== */}
            <Card>
              <CardHeader className="py-3 px-4 md:px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers size={18} /> Kelas (Dalam Tingkat)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 px-4 md:px-5">
                <div className="flex flex-wrap gap-2 min-w-0">
                  {/* Semua Kelas */}
                  <FilterChip
                    active={!classId}
                    onClick={() => setParam("class_id", "")}
                  >
                    Semua Kelas
                  </FilterChip>

                  {/* Item Class + ✏️ */}
                  {classChips.map((c) => {
                    const active = classId === c.id;
                    return (
                      <div
                        key={c.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-border"
                      >
                        <FilterChip
                          active={active}
                          onClick={() => setParam("class_id", c.id)}
                          title={c.slug ?? c.name}
                          className="rounded-r-none"
                        >
                          {c.name}{" "}
                          <span className="text-muted-foreground">
                            ({c.count})
                          </span>
                        </FilterChip>
                        <Button
                          variant={active ? "secondary" : "outline"}
                          size="icon"
                          className="rounded-l-none h-auto p-1 pr-2"
                          title="Edit Kelas (middle)"
                          onClick={(e) => goEditClass(e, c.id)}
                        >
                          <Pencil size={14} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ===== Daftar Section (grid) ===== */}
            <Card>
              <CardHeader className="py-3 px-4 md:px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Daftar Kelas Paralel (Section)
                  </CardTitle>
                  <Button onClick={() => setOpenTambah(true)} size="sm">
                    <Plus className="mr-2" size={16} /> Tambah Section
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="px-4 md:px-5 pb-4">
                {items.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">
                    Tidak ada data yang cocok.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3 md:gap-4">
                    {items.map((r) => (
                      <ClassCard key={r.id} r={r} />
                    ))}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">
                      Menampilkan {items.length} section
                    </span>
                    {isFetching && <span>• Menyegarkan…</span>}
                  </div>
                  <Button
                    variant="link"
                    className="px-0 h-auto"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    {isFetching ? "Menyegarkan…" : "Refresh"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
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
