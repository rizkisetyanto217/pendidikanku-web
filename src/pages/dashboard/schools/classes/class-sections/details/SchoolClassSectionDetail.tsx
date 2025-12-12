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

/* =========================================================
   Types (API terbaru /api/u/class-sections/list?nested=csst&id=...)
========================================================= */

type StatusStr = "active" | "inactive" | string;

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
  csst_id: string;
  csst_class_subject_id?: string | null;
  csst_school_teacher_id?: string | null;

  csst_delivery_mode?: string | null;

  csst_class_section_slug_cache?: string | null;
  csst_class_section_name_cache?: string | null;
  csst_class_section_code_cache?: string | null;

  csst_school_teacher_slug_cache?: string | null;
  csst_school_teacher_cache?: TeacherCache | null;

  csst_subject_id?: string | null;
  csst_subject_name_cache?: string | null;
  csst_subject_code_cache?: string | null;
  csst_subject_slug_cache?: string | null;

  csst_status?: StatusStr;
  csst_created_at?: string | null;
  csst_updated_at?: string | null;

  // kalau backend kadang ngasih fallback string (optional)
  csst_school_teacher_name_cache?: string | null;
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

  // ✅ NEW
  class_section_status?: StatusStr;

  class_section_created_at: string;
  class_section_updated_at: string;

  class_section_class_name_cache?: string | null;
  class_section_class_slug_cache?: string | null;
  class_section_class_parent_id?: string | null;
  class_section_class_parent_name_cache?: string | null;
  class_section_class_parent_slug_cache?: string | null;
  class_section_class_parent_level_cache?: number | null;

  class_section_academic_term_id?: string | null;
  class_section_academic_term_name_cache?: string | null;
  class_section_academic_term_slug_cache?: string | null;
  class_section_academic_term_academic_year_cache?: string | null;
  class_section_academic_term_angkatan_cache?: number | null;

  class_section_school_teacher_id?: string | null;
  class_section_school_teacher_cache?: TeacherCache | null;

  class_section_subject_teachers_enrollment_mode?: string | null;
  class_section_subject_teachers_self_select_requires_approval?: boolean | null;

  // aggregate CSST (baru)
  class_section_subject_teacher?: ApiCsst[];
  class_section_subject_teacher_count?: number | null;
  class_section_subject_teacher_active_count?: number | null;

  // (lama masih bisa muncul, biar aman)
  class_section_total_class_class_section_subject_teachers?: number | null;
  class_section_total_class_class_section_subject_teachers_active?:
    | number
    | null;
};

type ClassSectionListResp = {
  success: boolean;
  message: string;
  data: ApiClassSection[];
  pagination?: any;
  include?: Record<string, unknown>;
};

type ClassView = {
  classId: string;
  className: string;
  classSlug: string;
  parentName: string;
  parentSlug: string;
  parentLevel: number | null;
};

type CsstRow = {
  id: string;

  subjectName: string;
  subjectCode?: string | null;
  subjectSlug?: string | null;

  teacherId?: string | null;
  teacherName?: string | null;
  teacherAvatarUrl?: string | null;
  teacherCode?: string | null;
  teacherWhatsappUrl?: string | null;
  teacherTitlePrefix?: string | null;
  teacherTitleSuffix?: string | null;

  deliveryMode?: string | null;

  isActive: boolean;
  createdAt?: string | null;
};

/* =========================================================
   Utils
========================================================= */

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

function isActiveFromStatus(status?: StatusStr): boolean {
  if (!status) return true;
  return String(status).toLowerCase() === "active";
}

function formatTeacherName(
  t?: {
    name?: string | null;
    title_prefix?: string | null;
    title_suffix?: string | null;
  } | null
) {
  if (!t?.name) return "—";
  const prefix = t.title_prefix ? `${t.title_prefix} ` : "";
  const suffix = t.title_suffix ? `, ${t.title_suffix}` : "";
  return `${prefix}${t.name}${suffix}`;
}

type LocationState = {
  sections?: ApiClassSection[];
  selectedSectionId?: string;
};

const SchoolClassSectionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId, classSectionId } = useParams<{
    schoolId: string;
    classSectionId: string;
  }>();

  const safeSectionId = classSectionId ?? "";

  const { setHeader } = useDashboardHeader();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const sectionsFromState = state.sections;

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
      return res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const allSections: ApiClassSection[] = useMemo(() => {
    const fromApi = sectionsQ.data?.data ?? [];
    const fromState = sectionsFromState ?? [];
    if (fromApi.length > 0) return fromApi;
    if (fromState.length > 0) return fromState;
    return [];
  }, [sectionsQ.data, sectionsFromState]);

  const currentSection: ApiClassSection | null = useMemo(() => {
    if (allSections.length === 0) return null;
    if (!safeSectionId) return allSections[0];
    return (
      allSections.find((s) => s.class_section_id === safeSectionId) ??
      allSections[0]
    );
  }, [allSections, safeSectionId]);

  const classView: ClassView = useMemo(() => {
    const first = currentSection ?? allSections[0];
    if (first) {
      return {
        classId: first.class_section_class_id,
        className: first.class_section_class_name_cache || "Tanpa Nama",
        classSlug: first.class_section_class_slug_cache || "-",
        parentName: first.class_section_class_parent_name_cache || "-",
        parentSlug: first.class_section_class_parent_slug_cache || "-",
        parentLevel: first.class_section_class_parent_level_cache ?? null,
      };
    }
    return {
      classId: "",
      className: "Detail Kelas",
      classSlug: safeSectionId || "-",
      parentName: "-",
      parentSlug: "-",
      parentLevel: null,
    };
  }, [currentSection, allSections, safeSectionId]);

  const { className, classSlug, parentName, parentLevel } = classView;

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

  if (sectionsQ.isLoading && !currentSection) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" /> Memuat detail rombel…
      </div>
    );
  }

  if (sectionsError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-3 p-6 text-center">
        <div className="text-sm text-destructive">
          Gagal memuat detail rombel.
        </div>
        <div className="break-all text-xs text-muted-foreground">
          {sectionsError}
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

  if (!currentSection) {
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
  const sectionIsActive = isActiveFromStatus(
    currentSection.class_section_status
  );

  /* ===== Students + quota ===== */
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

  const quotaTotal = currentSection.class_section_quota_total ?? 0;
  const quotaTaken = currentSection.class_section_quota_taken ?? 0;
  const quotaRemaining =
    quotaTotal > 0 ? Math.max(quotaTotal - quotaTaken, 0) : 0;

  /* ===== homeroom ===== */
  const homeroom = currentSection.class_section_school_teacher_cache ?? null;

  /* ===== enrollment ===== */
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

  /* ===== CSST mapping (✅ teacher from csst_school_teacher_cache) ===== */
  const csstRows: CsstRow[] = useMemo(() => {
    const raw = currentSection.class_section_subject_teacher ?? [];
    return raw.map((item) => {
      const t = item.csst_school_teacher_cache ?? null;
      const teacherId = item.csst_school_teacher_id ?? t?.id ?? null;

      return {
        id: item.csst_id,
        subjectName:
          item.csst_subject_name_cache ??
          item.csst_subject_code_cache ??
          "Tanpa nama mapel",
        subjectCode: item.csst_subject_code_cache ?? null,
        subjectSlug: item.csst_subject_slug_cache ?? null,

        teacherId,
        teacherName:
          t?.name ??
          item.csst_school_teacher_name_cache ??
          (teacherId ? `Guru (${teacherId.slice(0, 8)}…)` : null),
        teacherAvatarUrl: t?.avatar_url ?? null,
        teacherCode: t?.teacher_code ?? null,
        teacherWhatsappUrl: t?.whatsapp_url ?? null,
        teacherTitlePrefix: t?.title_prefix ?? null,
        teacherTitleSuffix: t?.title_suffix ?? null,

        deliveryMode: item.csst_delivery_mode ?? null,

        isActive: isActiveFromStatus(item.csst_status),
        createdAt: item.csst_created_at ?? null,
      };
    });
  }, [currentSection]);

  const totalCsst =
    currentSection.class_section_subject_teacher_count ??
    currentSection.class_section_total_class_class_section_subject_teachers ??
    csstRows.length;

  const activeCsst =
    currentSection.class_section_subject_teacher_active_count ??
    currentSection.class_section_total_class_class_section_subject_teachers_active ??
    csstRows.filter((c) => c.isActive).length;

  /* ===== Columns DataTable CSST ===== */
  const csstColumns: ColumnDef<CsstRow>[] = useMemo(
    () => [
      {
        id: "subjectName",
        header: "Mata Pelajaran",
        minW: "280px",
        align: "left",
        cell: (r) => (
          <div className="text-left">
            <div className="font-medium">{r.subjectName}</div>
            <div className="text-[11px] text-muted-foreground">
              Kode: <span className="font-mono">{r.subjectCode ?? "—"}</span>
              {r.deliveryMode ? (
                <>
                  {" "}
                  • Mode: <span className="font-mono">{r.deliveryMode}</span>
                </>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: "teacherName",
        header: "Guru",
        minW: "280px",
        align: "left",
        cell: (r) => (
          <div className="flex items-start gap-3">
            {r.teacherAvatarUrl ? (
              <img
                src={r.teacherAvatarUrl}
                alt={r.teacherName ?? "Guru"}
                className="h-9 w-9 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            <div className="min-w-0">
              <div className="font-medium text-sm">
                {formatTeacherName(
                  r.teacherName
                    ? {
                        name: r.teacherName,
                        title_prefix: r.teacherTitlePrefix,
                        title_suffix: r.teacherTitleSuffix,
                      }
                    : null
                )}
              </div>

              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Kode guru:{" "}
                <span className="font-mono">{r.teacherCode ?? "—"}</span>
              </div>

              {r.teacherWhatsappUrl && (
                <a
                  href={r.teacherWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "createdAt",
        header: "Dibuat",
        minW: "170px",
        align: "center",
        cell: (r) => (
          <span className="text-xs">{formatDateTime(r.createdAt)}</span>
        ),
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

      {/* Info rombel + wali kelas */}
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
                  variant={sectionIsActive ? "default" : "outline"}
                >
                  {sectionIsActive ? "Aktif" : "Nonaktif"}
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
                    Detail rombel ini memakai endpoint{" "}
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
                      {formatTeacherName(homeroom)}
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
            searchByKeys={[
              "subjectName",
              "subjectCode",
              "teacherName",
              "deliveryMode",
            ]}
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
