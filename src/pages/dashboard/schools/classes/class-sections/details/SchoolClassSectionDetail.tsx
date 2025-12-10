// src/pages/dashboard/school/classes/details/SchoolClassSectionDetail.tsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ArrowLeft,
  Loader2,
  Phone,
  Users,
  Hash,
  Layers,
  User,
  Info,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* ========== Types dari API /api/u/class-sections/list?nested=csst ========== */

type TeacherCache = {
  id: string;
  name: string;
  gender?: string | null;
  avatar_url?: string | null;
  teacher_code?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiCsst = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_teacher_id?: string | null;
  class_section_subject_teacher_school_teacher_name_cache?: string | null;
  class_section_subject_teacher_subject_name_cache?: string | null;
  class_section_subject_teacher_subject_code_cache?: string | null;
  class_section_subject_teacher_subject_slug_cache?: string | null;
  class_section_subject_teacher_total_attendance?: number | null;
  class_section_subject_teacher_is_active: boolean;
};

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code?: string | null;
  class_section_schedule?: any | null;

  class_section_quota_total: number;
  class_section_quota_taken: number;

  class_section_total_students_active?: number | null;
  class_section_total_students_male?: number | null;
  class_section_total_students_female?: number | null;
  class_section_total_students_male_active?: number | null;
  class_section_total_students_female_active?: number | null;

  class_section_group_url?: string | null;
  class_section_image_url?: string | null;
  class_section_image_object_key?: string | null;
  class_section_image_url_old?: string | null;
  class_section_image_object_key_old?: string | null;
  class_section_image_delete_pending_until?: string | null;

  class_section_is_active: boolean;
  class_section_created_at: string;
  class_section_updated_at: string;

  class_section_class_name_cache?: string | null;
  class_section_class_slug_cache?: string | null;
  class_section_class_parent_id?: string | null;
  class_section_class_parent_name_cache?: string | null;
  class_section_class_parent_slug_cache?: string | null;
  class_section_class_parent_level_cache?: number | null;

  class_section_school_teacher_id?: string | null;
  class_section_school_teacher_cache?: TeacherCache | null;

  class_section_subject_teachers_enrollment_mode?: string | null;
  class_section_subject_teachers_self_select_requires_approval?: boolean | null;

  // aggregate CSST
  class_section_subject_teacher?: ApiCsst[];
  class_section_subject_teacher_count?: number | null;
  class_section_subject_teacher_active_count?: number | null;

  // (lama, boleh ada / boleh tidak)
  class_section_total_class_class_section_subject_teachers?: number | null;
  class_section_total_class_class_section_subject_teachers_active?:
    | number
    | null;
};

type ClassSectionListResp = {
  success: boolean;
  message: string;
  data: ApiClassSection[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
  include?: Record<string, unknown>;
};

/* View model kelas (dari cache) */
type ClassView = {
  classId: string;
  className: string;
  classSlug: string;
  parentName: string;
  parentSlug: string;
  parentLevel: number | null;
};

/* CSST row untuk table */
type CsstRow = {
  id: string;
  subjectName: string;
  subjectCode?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  isActive: boolean;
  totalAttendance: number;
};

/* ========== Utils kecil ========== */

const extractErrorMessage = (err: unknown): string => {
  const ax = err as AxiosError<any>;
  const msgFromResp =
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    ax?.response?.statusText;
  if (msgFromResp) return String(msgFromResp);
  if (ax?.message) return ax.message;
  return "Terjadi kesalahan saat memuat data.";
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type LocationState = {
  sections?: ApiClassSection[];
  selectedSectionId?: string;
};

/* ========================================================================
   Page utama (detail per class_section)
   ======================================================================== */

const SchoolClassSectionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId, classSectionId } = useParams<{
    schoolId: string;
    classSectionId: string; // class_section_id
  }>();

  const safeSectionId = classSectionId ?? "";

  const { setHeader } = useDashboardHeader();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const sectionsFromState = state.sections;

  console.log("[CLASS DETAIL] useParams:", { schoolId, classSectionId });
  console.log("[CLASS DETAIL] location.state:", state);

  /* ===== Fetch class section detail (API baru /api/u/class-sections/list?nested=csst&id=...) ===== */
  const sectionsQ = useQuery<ClassSectionListResp, AxiosError>({
    queryKey: ["class-sections-detail", safeSectionId, "nested=csst"],
    enabled: !!safeSectionId,
    queryFn: async () => {
      const res = await axios.get<ClassSectionListResp>(
        "/api/u/class-sections/list",
        {
          params: {
            id: safeSectionId,
            nested: "csst",
            page: 1,
            per_page: 1,
          },
        }
      );
      console.log(
        "[CLASS DETAIL] /api/u/class-sections/list?nested=csst response.raw:",
        res.data
      );
      return res.data;
    },
    staleTime: 60_000,
  });

  const allSections: ApiClassSection[] = useMemo(() => {
    const fromApi = sectionsQ.data?.data ?? [];
    const fromState = sectionsFromState ?? [];

    console.log("[CLASS DETAIL] allSections computed:", {
      fromApiLength: fromApi.length,
      fromStateLength: fromState.length,
      source:
        fromApi.length > 0 ? "api" : fromState.length > 0 ? "state" : "none",
    });

    if (fromApi.length > 0) return fromApi;
    if (fromState.length > 0) return fromState;
    return [];
  }, [sectionsQ.data, sectionsFromState]);

  const currentSection: ApiClassSection | null = useMemo(() => {
    if (allSections.length === 0) {
      console.log("[CLASS DETAIL] currentSection: allSections empty");
      return null;
    }
    if (!safeSectionId) {
      console.log(
        "[CLASS DETAIL] currentSection: no safeSectionId, use first element"
      );
      return allSections[0];
    }

    const found = allSections.find((s) => s.class_section_id === safeSectionId);
    console.log("[CLASS DETAIL] currentSection resolved:", {
      safeSectionId,
      found,
    });
    return found ?? allSections[0];
  }, [allSections, safeSectionId]);

  /* ===== Ambil info kelas dari cache ===== */
  const classView: ClassView = useMemo(() => {
    const first = currentSection ?? allSections[0];

    if (first) {
      const view: ClassView = {
        classId: first.class_section_class_id,
        className: first.class_section_class_name_cache || "Tanpa Nama",
        classSlug: first.class_section_class_slug_cache || "-",
        parentName: first.class_section_class_parent_name_cache || "-",
        parentSlug: first.class_section_class_parent_slug_cache || "-",
        parentLevel: first.class_section_class_parent_level_cache ?? null,
      };
      console.log("[CLASS DETAIL] classView:", view);
      return view;
    }

    const fallback: ClassView = {
      classId: "",
      className: "Detail Kelas",
      classSlug: safeSectionId || "-",
      parentName: "-",
      parentSlug: "-",
      parentLevel: null,
    };
    console.log("[CLASS DETAIL] classView fallback:", fallback);
    return fallback;
  }, [currentSection, allSections, safeSectionId]);

  const { className, classSlug, parentName, parentLevel } = classView;

  /* ===== Set header top bar ===== */
  useEffect(() => {
    setHeader({
      title: `Kelas: ${className}`,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        {
          label: "Semua Rombel",
          href: `/${schoolId}/sekolah/kelas/semua-kelas`,
        },
        { label: className },
      ],
      showBack: true,
    });
  }, [setHeader, schoolId, className]);

  const sectionsError: string | null = sectionsQ.isError
    ? extractErrorMessage(sectionsQ.error)
    : null;

  /* ===== State: loading / error ===== */

  if (sectionsQ.isLoading && !currentSection) {
    console.log("[CLASS DETAIL] loading initial state");
    return (
      <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" /> Memuat detail rombel…
      </div>
    );
  }

  if (sectionsError) {
    const msg = sectionsError ?? "Data rombel tidak ditemukan.";
    console.log("[CLASS DETAIL] sectionsError:", msg);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-3 p-6 text-center">
        <div className="text-sm text-destructive">
          Gagal memuat detail rombel.
        </div>
        <div className="break-all text-xs text-muted-foreground">{msg}</div>
        <Button
          variant="outline"
          onClick={() => navigate(`/${schoolId}/sekolah/kelas/semua-kelas`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke semua rombel
        </Button>
      </div>
    );
  }

  if (!currentSection) {
    console.log(
      "[CLASS DETAIL] no currentSection after fetch, allSections:",
      allSections
    );
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-3 p-6 text-center">
        <div className="text-sm text-muted-foreground">
          Data rombel tidak ditemukan.
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/${schoolId}/sekolah/kelas/semua-kelas`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke semua rombel
        </Button>
      </div>
    );
  }

  const currentSectionId = currentSection.class_section_id;
  console.log("[CLASS DETAIL] render final view for section:", {
    currentSectionId,
    currentSection,
  });

  /* ===== Agregat: siswa, kuota ===== */

  const male = currentSection.class_section_total_students_male ?? 0;
  const female = currentSection.class_section_total_students_female ?? 0;
  const maleActive =
    currentSection.class_section_total_students_male_active ?? 0;
  const femaleActive =
    currentSection.class_section_total_students_female_active ?? 0;

  const totalStudents =
    male + female > 0
      ? male + female
      : currentSection.class_section_quota_taken;
  const totalStudentsActive =
    currentSection.class_section_total_students_active ??
    maleActive + femaleActive;

  /* ===== CSST mapping dari nested=csst ===== */

  const csstRows: CsstRow[] = useMemo(() => {
    const raw = (currentSection.class_section_subject_teacher ??
      []) as ApiCsst[];

    const mapped = raw.map((item) => ({
      id: item.class_section_subject_teacher_id,
      subjectName:
        item.class_section_subject_teacher_subject_name_cache ??
        item.class_section_subject_teacher_subject_code_cache ??
        "Tanpa nama mapel",
      subjectCode: item.class_section_subject_teacher_subject_code_cache,
      teacherId: item.class_section_subject_teacher_school_teacher_id ?? null,
      teacherName:
        item.class_section_subject_teacher_school_teacher_name_cache ?? null,
      isActive: Boolean(item.class_section_subject_teacher_is_active),
      totalAttendance: item.class_section_subject_teacher_total_attendance ?? 0,
    }));

    console.log("[CLASS DETAIL] csstRows:", {
      rawLength: raw.length,
      mappedLength: mapped.length,
      rows: mapped,
    });

    return mapped;
  }, [currentSection]);

  const totalCsst =
    currentSection.class_section_subject_teacher_count ??
    currentSection.class_section_total_class_class_section_subject_teachers ??
    csstRows.length;

  const activeCsst =
    currentSection.class_section_subject_teacher_active_count ??
    currentSection.class_section_total_class_class_section_subject_teachers_active ??
    csstRows.filter((c) => c.isActive).length;

  const totalAttendanceSum = csstRows.reduce(
    (acc, row) => acc + (row.totalAttendance || 0),
    0
  );

  const quotaTotal = currentSection.class_section_quota_total ?? 0;
  const quotaTaken = currentSection.class_section_quota_taken ?? 0;
  const quotaRemaining =
    quotaTotal > 0 ? Math.max(quotaTotal - quotaTaken, 0) : 0;

  const homeroom = currentSection.class_section_school_teacher_cache ?? null;

  const enrollmentMode =
    currentSection.class_section_subject_teachers_enrollment_mode;
  const enrollmentLabel =
    enrollmentMode === "self_select"
      ? "Siswa memilih sendiri"
      : enrollmentMode === "assigned"
      ? "Ditentukan admin/guru"
      : enrollmentMode === "closed"
      ? "Tertutup"
      : enrollmentMode || "-";

  const requiresApproval =
    currentSection.class_section_subject_teachers_self_select_requires_approval ??
    false;

  /* ===== Columns DataTable CSST ===== */

  const csstColumns: ColumnDef<CsstRow>[] = useMemo(
    () => [
      {
        id: "subjectName",
        header: "Mata Pelajaran",
        minW: "240px",
        align: "left",
        cell: (r) => (
          <div className="text-left">
            <div className="font-medium">{r.subjectName}</div>
            <div className="text-[11px] text-muted-foreground">
              Kode: <span className="font-mono">{r.subjectCode ?? "—"}</span>
            </div>
          </div>
        ),
      },
      {
        id: "teacherName",
        header: "Guru",
        minW: "200px",
        align: "left",
        cell: (r) => (
          <div className="text-left text-xs">
            <div className="font-medium">{r.teacherName ?? "—"}</div>
            {r.teacherId && (
              <div className="text-[11px] text-muted-foreground">
                school_teacher_id:{" "}
                <span className="font-mono">{r.teacherId}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: "totalAttendance",
        header: "Total Pertemuan",
        minW: "140px",
        align: "center",
        cell: (r) => <span className="tabular-nums">{r.totalAttendance}</span>,
      },
      {
        id: "isActive",
        header: "Status",
        minW: "120px",
        align: "center",
        cell: (r) => (
          <Badge
            className="justify-center"
            variant={r.isActive ? "default" : "secondary"}
          >
            {r.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        ),
      },
    ],
    []
  );

  /* ===== Render utama ===== */

  return (
    <div className="space-y-4">
      {/* Header lokal halaman */}
      <div className="flex items-center justify-between gap-3">
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/${schoolId}/sekolah/kelas/semua-kelas`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{className}</h1>
            <p className="text-xs text-muted-foreground">
              Slug program: <span className="font-mono">{classSlug}</span> •
              Tingkat: {parentName}{" "}
              {parentLevel != null && `(Level ${parentLevel ?? "-"})`} • Rombel:{" "}
              <span className="font-mono">
                {currentSection.class_section_slug}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan kecil */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Mapel &amp; Pengajar (rombongan belajar ini)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="tabular-nums text-xl font-semibold">
              {totalCsst}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Aktif: <span className="font-semibold">{activeCsst}</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Total pertemuan (semua mapel):{" "}
              <span className="font-semibold">{totalAttendanceSum}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Siswa &amp; Kuota (rombongan belajar ini)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-sm">
                <Users className="h-3 w-3" />
                <span className="tabular-nums font-semibold">
                  {totalStudents}
                </span>
                <span className="text-[11px] text-muted-foreground">siswa</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Aktif:{" "}
                <span className="font-semibold">{totalStudentsActive}</span>
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Lk / Pr: {male} / {female} • Aktif Lk / Pr: {maleActive} /{" "}
              {femaleActive}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Kuota:{" "}
              <span className="font-semibold">
                {quotaTaken}/{quotaTotal}
              </span>{" "}
              terisi • Sisa {quotaRemaining}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Mode Enrol Mapel &amp; Info Lainnya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <div className="text-sm font-medium">{enrollmentLabel}</div>
            {enrollmentMode === "self_select" && (
              <div className="text-[11px] text-muted-foreground">
                Approval:{" "}
                <span className="font-semibold">
                  {requiresApproval ? "Perlu persetujuan" : "Tanpa persetujuan"}
                </span>
              </div>
            )}
            <div className="mt-1 text-[11px] text-muted-foreground">
              Dibuat: {formatDateTime(currentSection.class_section_created_at)}
              <br />
              Diupdate:{" "}
              {formatDateTime(currentSection.class_section_updated_at)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info rombel (gambar, slug, kode, status) + wali kelas */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Thumbnail */}
            <div className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 md:w-60">
              {currentSection.class_section_image_url ? (
                <img
                  src={currentSection.class_section_image_url}
                  alt={currentSection.class_section_name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[120px] w-full items-center justify-center gap-2 text-xs text-muted-foreground/80">
                  <Layers className="h-4 w-4" />
                  <span>Belum ada gambar rombel</span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-6 text-xs text-white">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-white/80">
                    <Layers className="h-3 w-3" />
                    Rombel
                  </div>
                  <div className="text-xs font-semibold leading-tight">
                    {currentSection.class_section_name}
                  </div>
                </div>
                <Badge
                  className="border px-2 py-0.5 text-[10px] font-semibold"
                  variant={
                    currentSection.class_section_is_active
                      ? "default"
                      : "outline"
                  }
                >
                  {currentSection.class_section_is_active
                    ? "Aktif"
                    : "Nonaktif"}
                </Badge>
              </div>
            </div>

            {/* Info text */}
            <CardContent className="flex-1 space-y-2 py-3 md:px-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 text-[11px]"
                >
                  <BookOpen className="h-3 w-3" />
                  Program: {className}
                </Badge>
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1 text-[11px]"
                >
                  <Hash className="h-3 w-3" />
                  Kode: {currentSection.class_section_code ?? "-"}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                Slug program: <span className="font-mono">{classSlug}</span>
                <br />
                Slug rombel:{" "}
                <span className="font-mono">
                  {currentSection.class_section_slug}
                </span>
              </div>

              {currentSection.class_section_group_url && (
                <div className="pt-1 text-xs">
                  <a
                    href={currentSection.class_section_group_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    <Users className="h-3 w-3" />
                    Link grup kelas
                  </a>
                </div>
              )}

              <div className="mt-2 rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-3 w-3" />
                  <p>
                    Detail rombel ini menggunakan data snapshot &amp; CSST dari
                    endpoint{" "}
                    <span className="font-mono text-[10px]">
                      /api/u/class-sections/list?nested=csst&id=
                      {currentSectionId}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Wali kelas */}
        <Card>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Wali Kelas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-xs">
            {homeroom ? (
              <>
                <div className="flex items-center gap-3">
                  {homeroom.avatar_url ? (
                    <img
                      src={homeroom.avatar_url}
                      alt={homeroom.name}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">
                      {homeroom.title_prefix
                        ? `${homeroom.title_prefix} ${homeroom.name}${
                            homeroom.title_suffix
                              ? `, ${homeroom.title_suffix}`
                              : ""
                          }`
                        : homeroom.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Kode guru: {homeroom.teacher_code ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-muted-foreground">
                  Gender: {homeroom.gender ?? "-"}
                </div>

                {homeroom.whatsapp_url && (
                  <div className="pt-1">
                    <a
                      href={homeroom.whatsapp_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      Chat via WhatsApp
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-muted-foreground">
                Belum diatur wali kelas untuk rombel ini.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabel CSST */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">
            Mapel &amp; Pengajar (CSST) di Rombel Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <DataTable<CsstRow>
            rows={csstRows}
            columns={csstColumns}
            loading={sectionsQ.isLoading && csstRows.length === 0}
            getRowId={(r) => r.id}
            searchByKeys={["subjectName", "subjectCode", "teacherName"]}
            searchPlaceholder="Cari mapel atau nama guru…"
            pageSize={10}
            pageSizeOptions={[10, 20, 50]}
            stickyHeader
            zebra
            viewModes={["table"]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolClassSectionDetail;
