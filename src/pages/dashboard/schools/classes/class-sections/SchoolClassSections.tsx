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
  User,
  ClipboardList,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";

/* =========================================================
   Types (RAW API)
   - Support API terbaru (class_section_status, csst_*)
   - Masih aman kalau ada sisa field lama
========================================================= */

type StatusStr = "active" | "inactive" | string;
type ViewMode = "card" | "table";

type CompactTeacher = {
  id: string;
  name: string;
  avatar_url?: string | null;
  teacher_code?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
  gender?: string | null;
};

type ApiCsstRaw = {
  // NEW
  csst_id?: string;
  csst_delivery_mode?: string;
  csst_status?: StatusStr;

  csst_subject_id?: string;
  csst_subject_name_cache?: string;
  csst_subject_code_cache?: string;

  csst_school_teacher_cache?: CompactTeacher;

  // LEGACY fallback (yang panjang)
  class_section_subject_teacher_id?: string;
  class_section_subject_teacher_delivery_mode?: string;
  class_section_subject_teacher_is_active?: boolean;

  class_section_subject_teacher_subject_id?: string;
  class_section_subject_teacher_subject_name_cache?: string;
  class_section_subject_teacher_subject_code_cache?: string;

  class_section_subject_teacher_school_teacher_cache?: CompactTeacher;
  class_section_subject_teacher_school_teacher_name_cache?: string;

  class_section_subject_teacher_total_attendance?: number;
  class_section_subject_teacher_total_assessments?: number;
  class_section_subject_teacher_total_assessments_graded?: number;
  class_section_subject_teacher_total_assessments_ungraded?: number;
};

export type ApiClassSectionRaw = {
  class_section_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code?: string | null;

  class_section_image_url?: string | null;

  // NEW status string
  class_section_status?: StatusStr;

  // LEGACY boolean
  class_section_is_active?: boolean;

  class_section_quota_total?: number;
  class_section_quota_taken?: number;

  // NEW cache
  class_section_school_teacher_cache?: CompactTeacher;

  // LEGACY
  class_section_school_teacher?: CompactTeacher | null;
  class_section_school_teacher_id?: string | null;

  class_section_subject_teacher?: ApiCsstRaw[];

  class_section_subject_teacher_count?: number;
  class_section_subject_teacher_active_count?: number;
};

type ApiSectionList = {
  data: ApiClassSectionRaw[];
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
  success: boolean;
  message: string;
};

/* =========================================================
   Helpers normalize (RAW → consistent usage)
========================================================= */
function formatTeacherFullName(t?: CompactTeacher | null) {
  if (!t) return "-";
  const name = (t.name ?? "").trim();
  const prefix = (t.title_prefix ?? "").trim();
  const suffix = (t.title_suffix ?? "").trim();

  const core = [prefix, name].filter(Boolean).join(" ").trim();
  if (!core) return "-";
  return suffix ? `${core}, ${suffix}` : core;
}

function toBoolActive(status?: StatusStr, legacyBool?: boolean) {
  if (typeof legacyBool === "boolean") return legacyBool;
  if (!status) return true;
  return String(status).toLowerCase() === "active";
}

function getSectionIsActive(s: ApiClassSectionRaw) {
  return toBoolActive(s.class_section_status, s.class_section_is_active);
}

function getHomeroom(s: ApiClassSectionRaw): CompactTeacher | null {
  return (
    s.class_section_school_teacher ??
    s.class_section_school_teacher_cache ??
    null
  );
}

function getCsstId(c: ApiCsstRaw) {
  return c.class_section_subject_teacher_id || c.csst_id || crypto.randomUUID();
}

function getCsstIsActive(c: ApiCsstRaw) {
  return toBoolActive(c.csst_status, c.class_section_subject_teacher_is_active);
}

function getCsstSubjectName(c: ApiCsstRaw) {
  return (
    c.class_section_subject_teacher_subject_name_cache ||
    c.csst_subject_name_cache ||
    c.class_section_subject_teacher_subject_code_cache ||
    c.csst_subject_code_cache ||
    c.class_section_subject_teacher_subject_id ||
    c.csst_subject_id ||
    "-"
  );
}

function getCsstTeacher(c: ApiCsstRaw) {
  return (
    c.class_section_subject_teacher_school_teacher_cache ||
    c.csst_school_teacher_cache ||
    null
  );
}

function getCsstTeacherName(c: ApiCsstRaw) {
  const t = getCsstTeacher(c);
  return (
    t?.name || c.class_section_subject_teacher_school_teacher_name_cache || "-"
  );
}

function getCsstDeliveryMode(c: ApiCsstRaw) {
  return (
    c.class_section_subject_teacher_delivery_mode || c.csst_delivery_mode || "-"
  );
}

/* =========================================================
   Filter Types
========================================================= */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

/* =========================================================
   Query
========================================================= */

function useSections(classId?: string | undefined | null) {
  return useQuery<ApiClassSectionRaw[]>({
    queryKey: ["sections-user-compact-csst", classId ?? null],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: 1,
        per_page: 100,
        mode: "compact",
        nested: "csst",
      };
      if (classId) params.class_id = classId;

      const res = await axios.get<ApiSectionList>(
        "/api/u/class-sections/list",
        {
          params,
        }
      );
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   Small UI
========================================================= */

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

/* =========================================================
   Section Card (Tampilan card tetap sama, cuma mapping fieldnya)
========================================================= */

function SectionCard({
  section,
  onOpenDetail,
}: {
  section: ApiClassSectionRaw;
  onOpenDetail: () => void;
}) {
  const isActive = getSectionIsActive(section);

  const quotaTotal = section.class_section_quota_total ?? 0;
  const quotaTaken = section.class_section_quota_taken ?? 0;
  const quotaRemaining =
    quotaTotal > 0 ? Math.max(quotaTotal - quotaTaken, 0) : 0;

  const homeroom = getHomeroom(section);

  const csstList = section.class_section_subject_teacher ?? [];
  const csstCount =
    section.class_section_subject_teacher_count ?? csstList.length;
  const csstActiveCount =
    section.class_section_subject_teacher_active_count ??
    csstList.filter((x) => getCsstIsActive(x)).length;

  const cardClassName = `
    group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border
    transition-all duration-200
    hover:-translate-y-1 hover:bg-primary/5 hover:border-primary
    ${isActive ? "border-emerald-500/60" : "border-border/70"}
  `;

  const stripClassName = `
    absolute inset-y-0 left-0 w-1 rounded-r-full
    ${isActive ? "bg-emerald-500" : "bg-muted-foreground/40"}
  `;

  const statusBadgeClassName = `
    pointer-events-auto border px-2 py-0.5 text-[10px] font-semibold
    ${isActive ? "bg-emerald-500 text-emerald-950" : "bg-black/40"}
  `;

  return (
    <Card className={cardClassName} onClick={onOpenDetail}>
      {/* Strip accent kiri */}
      <span className={stripClassName} />

      <div className="flex flex-col gap-0 md:flex-row">
        {/* Thumbnail kiri */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 md:w-64 md:min-h-[160px]">
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

          {/* overlay nama kelas di bawah */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-6 text-xs text-white">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/80">
                <Layers className="h-3 w-3" />
                Rombel
              </div>
              <div className="text-xs font-semibold leading-tight">
                {section.class_section_name}
              </div>
            </div>
            <CBadgeStatus
              status={isActive ? "active" : "inactive"}
              className={statusBadgeClassName}
            />
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
                    {section.class_section_slug}
                  </span>
                  {section.class_section_code && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5">
                      <Hash className="h-3 w-3" />
                      {section.class_section_code}
                    </span>
                  )}
                </div>
              </div>

              {quotasBadge(quotaTotal, quotaTaken, quotaRemaining)}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-3 pt-0 text-xs md:px-4 md:pb-4">
            {/* Meta grid */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* Wali kelas */}
              <div className="rounded-lg border bg-background/40 p-3">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Wali kelas
                </div>
                {homeroom ? (
                  <div className="flex items-center gap-3">
                    {homeroom.avatar_url ? (
                      <img
                        src={homeroom.avatar_url}
                        alt={homeroom.name}
                        className="h-8 w-8 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">
                        {formatTeacherFullName(homeroom)}
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Kode: {homeroom.teacher_code ?? "-"}
                      </div>
                      {homeroom.whatsapp_url && (
                        <a
                          href={homeroom.whatsapp_url}
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-[11px] text-emerald-600 hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-muted-foreground">
                    Belum diatur wali kelas.
                  </div>
                )}
              </div>

              {/* Kuota & summary CSST */}
              <div className="rounded-lg border bg-background/40 p-3">
                <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Kuota &amp; Pengajar Mapel
                </div>

                <div className="flex items-center justify-between text-[13px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold">{quotaTotal}</span>
                    <span className="text-[11px] text-muted-foreground">
                      kapasitas
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Terisi: {quotaTaken} • Sisa: {quotaRemaining}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" />
                    Mapel/Pengajar:{" "}
                    <span className="font-semibold">{csstCount}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Aktif:{" "}
                    <span className="font-semibold">{csstActiveCount}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mapel & pengajar */}
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
                      const subjectName = getCsstSubjectName(csst);
                      const teacher = getCsstTeacher(csst);
                      const teacherName = getCsstTeacherName(csst);

                      const isCsstActive = getCsstIsActive(csst);

                      const attendance =
                        csst.class_section_subject_teacher_total_attendance ??
                        0;
                      const totalAssess =
                        csst.class_section_subject_teacher_total_assessments ??
                        0;
                      const graded =
                        csst.class_section_subject_teacher_total_assessments_graded ??
                        0;
                      const ungraded =
                        csst.class_section_subject_teacher_total_assessments_ungraded ??
                        0;

                      return (
                        <div
                          key={getCsstId(csst)}
                          className="flex h-full flex-col justify-between rounded-2xl border bg-background/70 px-4 py-3 text-[11px]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold">
                                {subjectName}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {teacher?.avatar_url ? (
                                  <img
                                    src={teacher.avatar_url}
                                    alt={formatTeacherFullName(teacher)}
                                    className="h-5 w-5 rounded-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="font-medium">
                                  {teacherName}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Mode: {getCsstDeliveryMode(csst)}
                              </div>
                            </div>
                            <CBadgeStatus
                              status={isCsstActive ? "active" : "inactive"}
                              className="h-6 rounded-full px-3 text-[10px] font-semibold"
                            />
                          </div>

                          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                            <div>
                              <div className="text-[10px]">Kehadiran</div>
                              <div className="font-semibold">{attendance}</div>
                            </div>
                            <div>
                              <div className="text-[10px]">Penilaian</div>
                              <div className="font-semibold">{totalAssess}</div>
                            </div>
                            <div>
                              <div className="text-[10px]">Nilai</div>
                              <div className="font-semibold">
                                {graded} / {ungraded}
                              </div>
                            </div>
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

function quotasBadge(
  quotaTotal: number,
  quotaTaken: number,
  quotaRemaining: number
) {
  return (
    <div className="rounded-md bg-muted px-2 py-1 text-right">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        Kuota
      </div>
      <div className="font-mono text-[11px]">
        {quotaTaken}/{quotaTotal} &nbsp;
        <span className="text-[10px] text-muted-foreground">
          (sisa {quotaRemaining})
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   Table View (simple, sesuai data yg sama)
========================================================= */

function SectionTable({
  rows,
  onOpenDetail,
}: {
  rows: ApiClassSectionRaw[];
  onOpenDetail: (s: ApiClassSectionRaw) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead className="px-4 text-primary font-semibold">
                Rombel
              </TableHead>
              <TableHead className="px-4 text-primary font-semibold">
                Kode
              </TableHead>
              <TableHead className="px-4 text-primary font-semibold">
                Status
              </TableHead>
              <TableHead className="px-4 text-primary font-semibold">
                Kuota
              </TableHead>
              <TableHead className="px-4 text-primary font-semibold">
                Wali Kelas
              </TableHead>
              <TableHead className="px-4 text-primary font-semibold">
                Mapel/Pengajar
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => {
              const isActive = getSectionIsActive(s);
              const quotaTotal = s.class_section_quota_total ?? 0;
              const quotaTaken = s.class_section_quota_taken ?? 0;
              const homeroom = getHomeroom(s);
              const csstList = s.class_section_subject_teacher ?? [];
              const csstCount =
                s.class_section_subject_teacher_count ?? csstList.length;
              const csstActiveCount =
                s.class_section_subject_teacher_active_count ??
                csstList.filter((x) => getCsstIsActive(x)).length;

              return (
                <TableRow
                  key={s.class_section_id}
                  className="cursor-pointer hover:bg-accent/20"
                  onClick={() => onOpenDetail(s)}
                >
                  <TableCell className="px-4">
                    <div className="font-semibold">{s.class_section_name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {s.class_section_slug}
                    </div>
                  </TableCell>

                  <TableCell className="px-4">
                    {s.class_section_code ?? "-"}
                  </TableCell>

                  <TableCell className="px-4">
                    <CBadgeStatus status={isActive ? "active" : "inactive"} />
                  </TableCell>

                  <TableCell className="px-4">
                    <div className="font-mono text-xs">
                      {quotaTaken}/{quotaTotal}
                    </div>
                  </TableCell>

                  <TableCell className="px-4">
                    {homeroom ? (
                      <div className="flex items-center gap-2">
                        {homeroom.avatar_url ? (
                          <img
                            src={homeroom.avatar_url}
                            alt={homeroom.name}
                            className="h-6 w-6 rounded-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="text-xs">
                          <div className="font-semibold">
                            {formatTeacherFullName(homeroom)}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {homeroom.teacher_code ?? "-"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="px-4">
                    <div className="text-xs">
                      <span className="font-semibold">{csstCount}</span>{" "}
                      <span className="text-muted-foreground">
                        (aktif {csstActiveCount})
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/* =========================================================
   PAGE
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

  // ✅ toggle view (persist)
  const STORAGE_KEY = "SchoolSection:viewMode";
  const [view, setView] = useState<ViewMode>(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY) as ViewMode | null;
      return v === "table" || v === "card" ? v : "card";
    } catch {
      return "card";
    }
  });

  const changeView = (m: ViewMode) => {
    setView(m);
    try {
      window.localStorage.setItem(STORAGE_KEY, m);
    } catch {}
  };

  const activeCount = sections.filter((s) => getSectionIsActive(s)).length;
  const totalQuota = sections.reduce(
    (acc, s) => acc + (s.class_section_quota_total ?? 0),
    0
  );
  const totalTaken = sections.reduce(
    (acc, s) => acc + (s.class_section_quota_taken ?? 0),
    0
  );
  const totalCsstAll = sections.reduce(
    (acc, s) =>
      acc +
      (s.class_section_subject_teacher_count ??
        s.class_section_subject_teacher?.length ??
        0),
    0
  );
  const totalCsstActiveAll = sections.reduce((acc, s) => {
    const list = s.class_section_subject_teacher ?? [];
    const v =
      s.class_section_subject_teacher_active_count ??
      list.filter((x) => getCsstIsActive(x)).length;
    return acc + v;
  }, 0);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const isActive = getSectionIsActive(s);
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
      return true;
    });
  }, [sections, statusFilter]);

  const isFiltered = statusFilter !== "all";
  const programName = sections[0]?.class_section_name ?? "yang dipilih";

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex flex-col gap-6 py-4">
        {/* Header lokal */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="md:flex hidden items-center gap-3">
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

            {/* ✅ Toggle view (table/card) */}
            <div className="flex rounded-md border bg-background">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Tabel"
                aria-pressed={view === "table"}
                className={`rounded-none ${view === "table" ? "bg-muted" : ""}`}
                onClick={() => changeView("table")}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Kartu"
                aria-pressed={view === "card"}
                className={`rounded-none ${view === "card" ? "bg-muted" : ""}`}
                onClick={() => changeView("card")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            <Badge variant="outline" className="font-normal">
              Total:{" "}
              <span className="ml-1 font-semibold">{sections.length}</span>
            </Badge>
            <Badge variant="outline" className="font-normal">
              Aktif: <span className="ml-1 font-semibold">{activeCount}</span>
            </Badge>
            <Badge variant="outline" className="font-normal">
              Kuota:{" "}
              <span className="ml-1 font-semibold">
                {totalTaken} / {totalQuota} terisi
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
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && <LoadingGrid />}

        {/* Empty state */}
        {!isLoading && filteredSections.length === 0 && (
          <EmptyState isFiltered={isFiltered} />
        )}

        {/* ✅ Render table/card */}
        {!isLoading && filteredSections.length > 0 && (
          <>
            {view === "table" ? (
              <SectionTable
                rows={filteredSections}
                onOpenDetail={(s) =>
                  navigate(`${s.class_section_id}`, {
                    state: {
                      sections,
                      selectedSectionId: s.class_section_id,
                    },
                  })
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {filteredSections.map((section) => (
                  <SectionCard
                    key={section.class_section_id}
                    section={section}
                    onOpenDetail={() =>
                      navigate(`${section.class_section_id}`, {
                        state: {
                          sections,
                          selectedSectionId: section.class_section_id,
                        },
                      })
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
