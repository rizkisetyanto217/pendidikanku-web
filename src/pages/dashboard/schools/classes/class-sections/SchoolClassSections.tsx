// src/pages/dashboard/school/classes/class-list/section/SchoolSection.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import {
  ArrowLeft,
  Layers,
  Users,
  BookOpen,
  Hash,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ========= Types dari API /u/class-sections/list?with_csst=true ========= */

type EnrollmentMode = "self_select" | "assigned" | "closed" | string;

type CsstStats = {
  total_attendance?: number | null;
};

type CsstSubject = {
  id: string;
  subject?: {
    id: string;
    name: string;
  } | null;
};

type CsstTeacher = {
  id: string;
};

type CsstRoom = {
  id: string;
};

type ApiCsstItem = {
  id: string;
  is_active: boolean;
  teacher?: CsstTeacher | null;
  class_subject?: CsstSubject | null;
  room?: CsstRoom | null;
  stats?: CsstStats | null;
};

type ApiClassSection = {
  // agregat siswa
  class_section_total_students?: number | null;
  class_section_total_students_active?: number | null;
  class_section_total_students_male?: number | null;
  class_section_total_students_female?: number | null;
  class_section_total_students_male_active?: number | null;
  class_section_total_students_female_active?: number | null;

  // info akademik
  class_section_academic_term_id?: string | null;
  class_section_academic_year_snapshot?: string | null;
  class_section_academic_term_name_snapshot?: string | null;
  class_section_academic_term_slug_snapshot?: string | null;

  // agregat mapel/pengajar
  class_section_total_class_class_section_subject_teachers?: number | null;
  class_section_total_class_class_section_subject_teachers_active?:
    | number
    | null;
  class_sections_csst_count?: number | null;
  class_sections_csst_active_count?: number | null;

  // CSST detail
  class_sections_csst?: ApiCsstItem[];

  // info guru/ruang (opsional)
  class_section_school_teacher_id?: string | null;
  class_section_class_room_id?: string | null;
  class_section_class_room_name_snapshot?: string | null;
  class_section_class_room_slug_snapshot?: string | null;
  class_section_class_room_location_snapshot?: string | null;

  // existing fields yang mungkin tetap ada
  class_section_id: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code?: string | null;
  class_section_image_url?: string | null;
  class_section_is_active: boolean;

  // optional snapshots lama (kalau ada)
  class_section_class_name_snapshot?: string;
  class_section_class_slug_snapshot?: string;
  class_section_class_parent_id?: string;
  class_section_class_parent_name_snapshot?: string;
  class_section_class_parent_slug_snapshot?: string;
  class_section_class_parent_level_snapshot?: number;

  // enrollment mode (kalau di-join)
  class_section_subject_teachers_enrollment_mode?: EnrollmentMode;
  class_section_subject_teachers_self_select_requires_approval?: boolean;
};

type ApiSectionList = {
  data: ApiClassSection[];
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

/* ========= Filter Types & Options ========= */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

type StatusFilter = "all" | "active" | "inactive";
type ModeFilter = "all" | "self_select" | "assigned" | "closed";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

const MODE_FILTER_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "self_select", label: "Siswa pilih sendiri" },
  { value: "assigned", label: "Ditentukan admin" },
  { value: "closed", label: "Tutup" },
];

/* ========= Helpers ========= */

function enrollmentModeLabel(
  mode: EnrollmentMode | undefined,
  needApproval: boolean | undefined
): string {
  if (!mode) return "Belum diatur";

  if (mode === "self_select") {
    return needApproval
      ? "Siswa pilih sendiri (perlu approval)"
      : "Siswa pilih sendiri";
  }
  if (mode === "assigned") return "Mapel & pengajar ditentukan admin";
  if (mode === "closed") return "Tutup / tidak menerima penugasan baru";
  return mode;
}

/* ========= Query: ambil semua sections (API user-scope) ========= */

function useSections(classId?: string | undefined | null) {
  return useQuery<ApiClassSection[]>({
    queryKey: ["sections-user-all", classId ?? null, "with_csst"],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: 1,
        per_page: 100,
        with_csst: true,
      };
      if (classId) params.class_id = classId;

      const res = await axios.get<ApiSectionList>("/u/class-sections/list", {
        params,
      });
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* ========= Small UI ========= */

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {isFiltered
          ? "Tidak ada rombel yang cocok dengan filter."
          : "Belum ada rombel untuk ditampilkan."}
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden animate-pulse border-muted/40 bg-muted/10"
        >
          <div className="h-24 w-full bg-muted/60" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-muted/60" />
                <div className="h-2.5 w-24 rounded bg-muted/40" />
              </div>
              <div className="h-5 w-14 rounded-full bg-muted/50" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-10 rounded bg-muted/40" />
              <div className="h-10 rounded bg-muted/40" />
            </div>
            <div className="h-8 rounded bg-muted/40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ========= Section Card ========= */

function SectionCard({
  section,
  onOpenDetail,
  onEdit,
}: {
  section: ApiClassSection;
  onOpenDetail: () => void;
  onEdit?: () => void;
}) {
  // agregat siswa
  const totalStudents = section.class_section_total_students ?? 0;
  const totalStudentsActive = section.class_section_total_students_active ?? 0;
  const male = section.class_section_total_students_male ?? 0;
  const female = section.class_section_total_students_female ?? 0;
  const maleActive = section.class_section_total_students_male_active ?? 0;
  const femaleActive = section.class_section_total_students_female_active ?? 0;

  // agregat CSST
  const csstList = section.class_sections_csst ?? [];
  const csstCount = section.class_sections_csst_count ?? csstList.length;
  const csstActiveCount = section.class_sections_csst_active_count ?? 0;

  const totalSubjects =
    section.class_section_total_class_class_section_subject_teachers ??
    csstCount;
  const totalSubjectsActive =
    section.class_section_total_class_class_section_subject_teachers_active ??
    csstActiveCount;

  const isActive = section.class_section_is_active;
  const modeLabel = enrollmentModeLabel(
    section.class_section_subject_teachers_enrollment_mode,
    section.class_section_subject_teachers_self_select_requires_approval
  );

  const cardClassName = `group relative flex cursor-pointer flex-col overflow-hidden border transition-all duration-150 ${
    isActive
      ? "border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-950/10"
      : "border-border/70 hover:border-primary/50 hover:bg-muted/10"
  }`;

  const stripClassName = `absolute inset-y-0 left-0 w-1 rounded-r-full ${
    isActive ? "bg-emerald-500" : "bg-muted-foreground/40"
  }`;

  const statusBadgeClassName = `pointer-events-auto border px-2 py-0.5 text-[10px] font-semibold ${
    isActive ? "bg-emerald-500 text-emerald-950" : "bg-black/40"
  }`;

  const academicYear = section.class_section_academic_year_snapshot;
  const termName = section.class_section_academic_term_name_snapshot;
  const termSlug = section.class_section_academic_term_slug_snapshot;

  const parentName =
    section.class_section_class_parent_name_snapshot ?? "Tanpa level";
  const parentSlug = section.class_section_class_parent_slug_snapshot ?? "-";
  const parentLevel =
    section.class_section_class_parent_level_snapshot ?? undefined;

  const roomName = section.class_section_class_room_name_snapshot;
  const roomLocation = section.class_section_class_room_location_snapshot;
  const roomSlug = section.class_section_class_room_slug_snapshot;

  return (
    <Card className={cardClassName} onClick={onOpenDetail}>
      {/* Strip accent kiri */}
      <span className={stripClassName} />

      <div className="flex flex-col gap-0 md:flex-row">
        {/* Thumbnail kiri */}
        <div className="relative w-full md:w-64 md:min-h-[160px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {section.class_section_image_url ? (
            <img
              src={section.class_section_image_url}
              alt={section.class_section_name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[140px] w-full items-center justify-center gap-2 text-xs text-muted-foreground/80">
              <Layers className="h-4 w-4" />
              <span>Belum ada gambar kelas</span>
            </div>
          )}

          {/* overlay nama kelas singkat di pojok kiri bawah */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-6 text-xs text-white">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/80">
                <Layers className="h-3 w-3" />
                {parentName}
              </div>
              <div className="text-xs font-semibold leading-tight">
                {section.class_section_class_name_snapshot ??
                  section.class_section_name}
              </div>
            </div>
            <Badge
              variant={isActive ? "default" : "outline"}
              className={statusBadgeClassName}
            >
              {isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </div>

        {/* Konten kanan */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="pb-2 pt-3 md:px-4 md:pb-3 md:pt-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold leading-tight">
                  {section.class_section_name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                    <BookOpen className="h-3 w-3" />
                    {section.class_section_class_slug_snapshot ??
                      section.class_section_class_id}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5">
                    <Hash className="h-3 w-3" />
                    {section.class_section_slug}
                  </span>
                </div>
              </div>

              {section.class_section_code && (
                <div className="rounded-md bg-muted px-2 py-1 text-right">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Kode
                  </div>
                  <div className="font-mono text-[11px]">
                    {section.class_section_code}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-3 pt-0 text-xs md:px-4 md:pb-4">
            {/* Meta grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border bg-background/40 p-3">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Level / Parent &amp; Tahun Ajaran
                </div>
                <div className="font-medium">{parentName}</div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{parentSlug}</span>
                  {parentLevel != null && <span>Level {parentLevel}</span>}
                </div>
                {(academicYear || termName) && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {academicYear && <span>TA {academicYear}</span>}
                    {academicYear && termName && " • "}
                    {termName && (
                      <span>
                        {termName}
                        {termSlug && ` (${termSlug})`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border bg-background/40 p-3">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Siswa, Kapasitas &amp; Ruang
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold">
                      {totalStudents > 0 ? totalStudents : "-"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      siswa
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Aktif: {totalStudentsActive}
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                  <div>
                    Laki-laki / Perempuan: {male} / {female}
                  </div>
                  <div>
                    Aktif Lk / Pr: {maleActive} / {femaleActive}
                  </div>
                  {(roomName || roomLocation || roomSlug) && (
                    <div className="pt-1 text-[11px]">
                      Ruang:{" "}
                      <span className="font-medium">
                        {roomName ?? roomSlug ?? "-"}
                      </span>
                      {roomLocation && ` • ${roomLocation}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mode + agregat mapel/pengajar */}
            <div className="flex flex-col gap-2 rounded-lg border bg-background/40 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-1 text-[11px]">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                  <div>
                    <div className="font-medium">Mode mapel &amp; pengajar</div>
                    <div className="text-muted-foreground">{modeLabel}</div>
                  </div>
                </div>
                <div className="pl-5 text-[11px] text-muted-foreground">
                  Total mapel/pengajar: {totalSubjects} (aktif:{" "}
                  {totalSubjectsActive})
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 md:pt-0">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    Edit Info
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail();
                  }}
                >
                  Kelola Mapel &amp; Pengajar
                </Button>
              </div>
            </div>

            {/* Mapel & pengajar – grid card 2 kolom */}
            <Card className="rounded-2xl border bg-background/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 pb-2">
                <CardTitle className="text-sm">Mapel &amp; pengajar</CardTitle>
                <div className="text-[11px] text-muted-foreground">
                  Total: <span className="font-semibold">{csstCount}</span> •{" "}
                  Aktif:{" "}
                  <span className="font-semibold">{csstActiveCount}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-1 pb-3">
                {csstList.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground">
                    Belum ada mapel/pengajar di rombel ini.
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {csstList.map((csst) => {
                      const subjectName =
                        csst.class_subject?.subject?.name ??
                        csst.class_subject?.id ??
                        "Tanpa nama mapel";

                      const isCsstActive = csst.is_active;
                      const attendance = csst.stats?.total_attendance ?? 0;

                      return (
                        <div
                          key={csst.id}
                          className="flex h-full flex-col justify-between rounded-2xl border bg-background/70 px-4 py-3 text-[11px]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold">
                                {subjectName}
                              </div>
                            </div>
                            <Badge
                              className="h-6 rounded-full px-3 text-[10px] font-semibold"
                              variant={isCsstActive ? "default" : "outline"}
                            >
                              {isCsstActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>

                          <div className="mt-1 text-[10px] text-muted-foreground">
                            Kehadiran:{" "}
                            <span className="font-semibold">{attendance}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE: Daftar Class Sections (rombongan belajar)
========================================================= */

export default function SchoolClassSection({
  showBack = false,
  backTo,
}: Props) {
  const { classId } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Semua Rombel",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Semua Rombel" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const { data: sections = [], isLoading } = useSections(classId);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  const activeCount = sections.filter((s) => s.class_section_is_active).length;
  const totalStudentsAll = sections.reduce(
    (acc, s) => acc + (s.class_section_total_students ?? 0),
    0
  );
  const totalStudentsActiveAll = sections.reduce(
    (acc, s) => acc + (s.class_section_total_students_active ?? 0),
    0
  );
  const totalCsstAll = sections.reduce(
    (acc, s) => acc + (s.class_sections_csst_count ?? 0),
    0
  );
  const totalCsstActiveAll = sections.reduce(
    (acc, s) => acc + (s.class_sections_csst_active_count ?? 0),
    0
  );

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (statusFilter === "active" && !s.class_section_is_active) return false;
      if (statusFilter === "inactive" && s.class_section_is_active)
        return false;
      if (modeFilter !== "all") {
        if (
          s.class_section_subject_teachers_enrollment_mode !== undefined &&
          s.class_section_subject_teachers_enrollment_mode !== modeFilter
        ) {
          return false;
        }
      }
      return true;
    });
  }, [sections, statusFilter, modeFilter]);

  const isFiltered = statusFilter !== "all" || modeFilter !== "all";

  const programName =
    sections[0]?.class_section_class_name_snapshot ??
    sections[0]?.class_section_name ??
    "yang dipilih";

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex flex-col gap-6 py-4">
        {/* Header lokal */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold md:text-xl">Semua Rombel</h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Rombongan belajar dari program{" "}
                <span className="font-medium">{programName}</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <Button size="sm" onClick={() => navigate("new")} className="mr-1">
              + Tambah Rombel
            </Button>
            <Badge variant="outline" className="font-normal">
              Total:{" "}
              <span className="ml-1 font-semibold">{sections.length}</span>
            </Badge>
            <Badge variant="outline" className="font-normal">
              Aktif: <span className="ml-1 font-semibold">{activeCount}</span>
            </Badge>
            <Badge variant="outline" className="font-normal">
              Siswa:{" "}
              <span className="ml-1 font-semibold">
                {totalStudentsAll} / {totalStudentsActiveAll} aktif
              </span>
            </Badge>
            <Badge variant="outline" className="font-normal">
              Mapel/Pengajar:{" "}
              <span className="ml-1 font-semibold">
                {totalCsstAll} / {totalCsstActiveAll} aktif
              </span>
            </Badge>
          </div>
        </div>

        {/* Filter bar */}
        <Card className="border-muted/60 bg-muted/5">
          <CardContent className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-muted-foreground md:text-sm">
              Menampilkan{" "}
              <span className="font-semibold">{filteredSections.length}</span>{" "}
              dari <span className="font-semibold">{sections.length}</span>{" "}
              rombel.
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status filter */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Status:</span>
                <div className="flex rounded-md border bg-background">
                  {STATUS_FILTER_OPTIONS.map(({ value, label }) => {
                    const active = statusFilter === value;
                    const extraClass =
                      value === "all"
                        ? "rounded-l-md"
                        : value === "inactive"
                        ? "rounded-r-md"
                        : "";

                    return (
                      <Button
                        key={value}
                        type="button"
                        variant={active ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 rounded-none px-3 text-xs ${extraClass}`}
                        onClick={() => setStatusFilter(value)}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Mode filter */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Mode:</span>
                <div className="flex rounded-md border bg-background">
                  {MODE_FILTER_OPTIONS.map(({ value, label }) => {
                    const active = modeFilter === value;
                    return (
                      <Button
                        key={value}
                        type="button"
                        variant={active ? "default" : "ghost"}
                        size="sm"
                        className="h-8 rounded-none px-3 text-[11px]"
                        onClick={() => setModeFilter(value)}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && <LoadingGrid />}

        {/* Empty state */}
        {!isLoading && filteredSections.length === 0 && (
          <EmptyState isFiltered={isFiltered} />
        )}

        {/* List sections */}
        {!isLoading && filteredSections.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredSections.map((section) => (
              <SectionCard
                key={section.class_section_id}
                section={section}
                onOpenDetail={() => navigate(`${section.class_section_id}`)}
                onEdit={() => navigate(`edit/${section.class_section_id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
