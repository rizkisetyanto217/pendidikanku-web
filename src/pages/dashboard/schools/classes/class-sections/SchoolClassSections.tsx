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
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ========= Types dari API /u/class-sections/list ========= */

type EnrollmentMode = "self_select" | "assigned" | "closed" | string;

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code: string | null;
  class_section_schedule: any | null;
  class_section_capacity: number | null;
  class_section_total_students: number | null;
  class_section_group_url: string | null;
  class_section_image_url: string | null;
  class_section_image_object_key: string | null;
  class_section_image_url_old: string | null;
  class_section_image_object_key_old: string | null;
  class_section_image_delete_pending_until: string | null;
  class_section_is_active: boolean;
  class_section_created_at: string;
  class_section_updated_at: string;
  class_section_class_name_snapshot: string;
  class_section_class_slug_snapshot: string;
  class_section_class_parent_id: string;
  class_section_class_parent_name_snapshot: string;
  class_section_class_parent_slug_snapshot: string;
  class_section_class_parent_level_snapshot: number;
  class_section_academic_term_id: string;
  class_section_snapshot_updated_at: string;
  class_section_subject_teachers_enrollment_mode: EnrollmentMode;
  class_section_subject_teachers_self_select_requires_approval: boolean;
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
  mode: EnrollmentMode,
  needApproval: boolean
): string {
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
  return useQuery({
    queryKey: ["sections-user-all", classId ?? null],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: 1,
        per_page: 100,
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
  const totalStudents = section.class_section_total_students ?? 0;
  const capacity = section.class_section_capacity ?? null;

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
                {section.class_section_class_parent_name_snapshot}
              </div>
              <div className="text-xs font-semibold leading-tight">
                {section.class_section_class_name_snapshot}
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
                    {section.class_section_class_slug_snapshot}
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
                  Level / Parent
                </div>
                <div className="font-medium">
                  {section.class_section_class_parent_name_snapshot}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {section.class_section_class_parent_slug_snapshot}
                  </span>
                  <span>
                    Level {section.class_section_class_parent_level_snapshot}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-background/40 p-3">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Siswa & Kapasitas
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
                    Kapasitas:{" "}
                    {capacity !== null && capacity > 0 ? capacity : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode + link + tombol kelola */}
            <div className="flex flex-col gap-2 rounded-lg border bg-background/40 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-2 text-[11px]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <div className="font-medium">Mode mapel &amp; pengajar</div>
                  <div className="text-muted-foreground">{modeLabel}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 md:pt-0">
                {section.class_section_group_url && (
                  <a
                    href={section.class_section_group_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] text-primary hover:bg-primary/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon className="h-3 w-3" />
                    Link Grup
                  </a>
                )}

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

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (statusFilter === "active" && !s.class_section_is_active) return false;
      if (statusFilter === "inactive" && s.class_section_is_active)
        return false;
      if (modeFilter !== "all") {
        if (s.class_section_subject_teachers_enrollment_mode !== modeFilter) {
          return false;
        }
      }
      return true;
    });
  }, [sections, statusFilter, modeFilter]);

  const isFiltered = statusFilter !== "all" || modeFilter !== "all";

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
                <span className="font-medium">
                  {sections[0]?.class_section_class_name_snapshot ??
                    "yang dipilih"}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm">
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
                onOpenDetail={
                  () => navigate(`${section.class_section_id}`) // detail rombel (Kelola Mapel & Pengajar)
                }
                onEdit={
                  () => navigate(`edit/${section.class_section_id}`) // ➜ form edit rombel
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
