// src/pages/dashboard/school/classes/details/SchoolClassSectionDetail.tsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Loader2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

// Reuse type dari list kelas
import type { ApiClassSection as ApiClassSectionFromList } from "../SchoolClassSections";

/* ========== Types dari API /u/class-sections/list ========== */

type RoomSnapshot = {
  code?: string;
  name?: string;
  slug?: string;
  join_url?: string;
  platform?: string;
  capacity?: number;
  location?: string;
  is_virtual?: boolean;
};

// Sesuai payload class_sections_student_class_sections
type ApiStudentClassSection = {
  student_class_section_id: string;
  student_class_section_school_student_id: string;
  student_class_section_section_id: string;
  student_class_section_school_id: string;

  student_class_section_section_slug_snapshot: string;
  student_class_section_student_code_snapshot?: string | null;

  student_class_section_status: string; // "active", "inactive", "completed"
  student_class_section_result?: string | null;

  student_class_section_user_profile_name_snapshot?: string | null;
  student_class_section_user_profile_avatar_url_snapshot?: string | null;
  student_class_section_user_profile_whatsapp_url_snapshot?: string | null;
  student_class_section_user_profile_gender_snapshot?: string | null;

  student_class_section_assigned_at: string;
  student_class_section_unassigned_at?: string | null;
  student_class_section_completed_at?: string | null;

  student_class_section_created_at: string;
  student_class_section_updated_at: string;
  student_class_section_deleted_at?: string | null;
};

// extend dikit dari type list
type ApiClassSection = ApiClassSectionFromList & {
  class_section_schedule?: any | null;
  class_section_group_url?: string | null;
  class_section_image_object_key?: string | null;
  class_section_image_url_old?: string | null;
  class_section_image_object_key_old?: string | null;
  class_section_image_delete_pending_until?: string | null;
  class_section_created_at?: string;
  class_section_updated_at?: string;
  class_section_snapshot_updated_at?: string;
  class_section_class_room_snapshot?: RoomSnapshot | null;

  // tambahan dari with_student_class_sections
  class_sections_student_class_sections?: ApiStudentClassSection[];
  class_sections_student_class_sections_count?: number;
  class_sections_student_class_sections_active_count?: number;
};

type ClassSectionListResp = {
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
};

/* View model kelas (diambil dari snapshot) */
type ClassView = {
  classId: string;
  className: string;
  classSlug: string;
  parentName: string;
  parentSlug: string;
  parentLevel: number;
};

/* ========== CSST (mapel & pengajar) ========== */
type CsstRow = {
  id: string;
  subjectName: string;
  isActive: boolean;
  totalAttendance: number;
  teacherId?: string | null;
};

/* ========== Row untuk DataTable siswa ========== */
type StudentRow = {
  id: string;
  name: string;
  code: string;
  gender?: string | null;
  avatarUrl?: string | null;
  whatsappUrl?: string | null;
  assignedAt?: string | null;
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

/* ========================================================================
   Page utama (detail per class_section)
   ======================================================================== */

type LocationState = {
  sections?: ApiClassSection[];
  selectedSectionId?: string;
};

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

  /* ===== Fetch class section detail (with_csst + with_student_class_sections) ===== */
  const sectionsQ = useQuery<ClassSectionListResp, AxiosError>({
    queryKey: [
      "class-sections-detail",
      safeSectionId,
      "with_csst",
      "with_student_class_sections",
    ],
    enabled: !!safeSectionId,
    queryFn: async () => {
      const res = await axios.get<ClassSectionListResp>(
        "/u/class-sections/list",
        {
          params: {
            id: safeSectionId,
            with_csst: true,
            with_student_class_sections: true,
            page: 1,
            per_page: 1,
          },
        }
      );
      console.log(
        "[CLASS DETAIL] /u/class-sections/list response.raw:",
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

  // rombel yang sedang di-detail-kan (by class_section_id di URL)
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

  /* ===== Ambil info kelas dari snapshot ===== */
  const classView: ClassView = useMemo(() => {
    const first = currentSection ?? allSections[0];

    if (first) {
      const view = {
        classId: first.class_section_class_id,
        className: first.class_section_class_name_snapshot || "Tanpa Nama",
        classSlug: first.class_section_class_slug_snapshot || "-",
        parentName: first.class_section_class_parent_name_snapshot || "-",
        parentSlug: first.class_section_class_parent_slug_snapshot || "-",
        parentLevel: first.class_section_class_parent_level_snapshot ?? 0,
      };
      console.log("[CLASS DETAIL] classView:", view);
      return view;
    }

    const fallback = {
      classId: "",
      className: "Detail Kelas",
      classSlug: safeSectionId || "-",
      parentName: "-",
      parentSlug: "-",
      parentLevel: 0,
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
    });
  }, [setHeader, schoolId, className]);

  /* ===== CSST rows ===== */
  const csstRows: CsstRow[] = useMemo(() => {
    const list = (currentSection?.class_sections_csst ?? []) as any[];
    const mapped = list.map((item) => ({
      id: item.id,
      subjectName:
        item.class_subject?.subject?.name ??
        item.class_subject?.id ??
        "Tanpa nama mapel",
      isActive: Boolean(item.is_active),
      totalAttendance: item.stats?.total_attendance ?? 0,
      teacherId: item.teacher?.id ?? null,
    }));

    console.log("[CLASS DETAIL] csstRows:", {
      rawLength: list.length,
      mappedLength: mapped.length,
      rows: mapped,
    });

    return mapped;
  }, [currentSection]);

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
            {r.teacherId && (
              <div className="text-[11px] text-muted-foreground">
                Guru (school_teacher_id):{" "}
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

  const totalCsst =
    currentSection?.class_sections_csst_count ?? csstRows.length;
  const activeCsst =
    currentSection?.class_sections_csst_active_count ??
    csstRows.filter((c) => c.isActive).length;

  /* ===== STUDENT LIST dari currentSection.class_sections_student_class_sections ===== */

  const studentList: ApiStudentClassSection[] = useMemo(() => {
    const raw = (currentSection?.class_sections_student_class_sections ??
      []) as ApiStudentClassSection[];

    console.log("[CLASS DETAIL] studentList raw:", {
      length: raw.length,
      items: raw,
    });

    return raw;
  }, [currentSection]);

  // total siswa: pakai aggregate dari class_section kalau ada, kalau tidak fallback ke length array
  const totalStudents =
    currentSection?.class_section_total_students ??
    currentSection?.class_sections_student_class_sections_count ??
    studentList.length;

  const totalStudentsActive =
    currentSection?.class_section_total_students_active ??
    currentSection?.class_sections_student_class_sections_active_count ??
    studentList.filter((s) => s.student_class_section_status === "active")
      .length;

  const totalAttendanceSum = csstRows.reduce(
    (acc, row) => acc + (row.totalAttendance || 0),
    0
  );

  console.log("[CLASS DETAIL] aggregates:", {
    totalCsst,
    activeCsst,
    totalStudents,
    totalStudentsActive,
    totalAttendanceSum,
  });

  /* ===== Student rows untuk DataTable ===== */
  const studentRows: StudentRow[] = useMemo(() => {
    const filtered = studentList.filter(
      (s) => s.student_class_section_status === "active"
    );

    const mapped = filtered.map((s) => ({
      id: s.student_class_section_id,
      name:
        s.student_class_section_user_profile_name_snapshot || "(Tanpa nama)",
      code: s.student_class_section_student_code_snapshot ?? "-",
      gender: s.student_class_section_user_profile_gender_snapshot,
      avatarUrl:
        s.student_class_section_user_profile_avatar_url_snapshot ?? null,
      whatsappUrl:
        s.student_class_section_user_profile_whatsapp_url_snapshot ?? null,
      assignedAt: s.student_class_section_assigned_at,
    }));

    console.log("[CLASS DETAIL] studentRows (active only):", {
      rawLength: studentList.length,
      activeLength: filtered.length,
      mappedLength: mapped.length,
      rows: mapped,
    });

    return mapped;
  }, [studentList]);

  /* ===== Columns DataTable siswa ===== */
  const studentColumns: ColumnDef<StudentRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Siswa",
        minW: "220px",
        align: "left",
        cell: (r) => (
          <div className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center text-[10px] font-semibold uppercase">
              {r.avatarUrl ? (
                <img
                  src={r.avatarUrl}
                  alt={r.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                (r.name || "?")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
              )}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{r.name}</div>
              <div className="text-[11px] text-muted-foreground">
                Gender: {r.gender || "-"}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "code",
        header: "NIS",
        minW: "120px",
        align: "left",
        cell: (r) => <span className="font-mono text-xs">{r.code || "-"}</span>,
      },
      {
        id: "assignedAt",
        header: "Masuk Rombel",
        minW: "160px",
        align: "center",
        cell: (r) => (
          <span className="text-xs">{formatDateTime(r.assignedAt)}</span>
        ),
      },
      {
        id: "whatsapp",
        header: "Kontak",
        minW: "120px",
        align: "center",
        cell: (r) =>
          r.whatsappUrl ? (
            <a
              href={r.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:underline"
            >
              <Phone className="h-3 w-3" />
              Chat WhatsApp
            </a>
          ) : (
            <span className="text-[11px] text-muted-foreground">-</span>
          ),
      },
    ],
    []
  );

  const sectionsError: string | null = sectionsQ.isError
    ? extractErrorMessage(sectionsQ.error)
    : null;

  /* ===== State: loading / error ===== */

  if (sectionsQ.isLoading && !currentSection) {
    console.log("[CLASS DETAIL] loading initial state");
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="animate-spin" /> Memuat detail rombel…
      </div>
    );
  }

  if (sectionsError) {
    const msg = sectionsError ?? "Data rombel tidak ditemukan.";
    console.log("[CLASS DETAIL] sectionsError:", msg);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-3 text-center">
        <div className="text-destructive text-sm">
          Gagal memuat detail rombel.
        </div>
        <div className="text-xs text-muted-foreground break-all">{msg}</div>
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
      <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-3 text-center">
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

  /* ===== Render utama ===== */

  return (
    <div className="space-y-4">
      {/* Header lokal halaman */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/${schoolId}/sekolah/kelas/semua-kelas`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{className}</h1>
            <p className="text-xs text-muted-foreground">
              Slug kelas: <span className="font-mono">{classSlug}</span> •
              Tingkat: {parentName}{" "}
              {parentLevel != null && `(Level ${parentLevel})`}
              {" • Rombel: "}
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
              Total Mapel / Pengajar (rombel ini)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-semibold tabular-nums">
              {totalCsst}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Aktif: <span className="font-semibold">{activeCsst}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Total Siswa (rombel ini)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-semibold tabular-nums">
              {totalStudents}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Aktif:{" "}
              <span className="font-semibold">{totalStudentsActive}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Total Pertemuan (semua mapel)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-semibold tabular-nums">
              {totalAttendanceSum}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Akumulasi dari <span className="font-semibold">{totalCsst}</span>{" "}
              mapel di rombel ini.
            </p>
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
            searchByKeys={["subjectName"]}
            searchPlaceholder="Cari nama mapel…"
            pageSize={10}
            pageSizeOptions={[10, 20, 50]}
            stickyHeader
            zebra
            viewModes={["table"]}
          />
        </CardContent>
      </Card>

      {/* Tabel siswa aktif di rombel */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              Siswa Aktif di Rombel Ini
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Data dari endpoint:{" "}
              <code>
                /u/class-sections/list?id={currentSectionId}
                &with_student_class_sections=true&with_csst=true
              </code>
              .
            </p>
          </div>
          {sectionsQ.isLoading && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Memuat siswa aktif…
            </div>
          )}
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          <DataTable<StudentRow>
            rows={studentRows}
            columns={studentColumns}
            loading={sectionsQ.isLoading && studentRows.length === 0}
            getRowId={(r) => r.id}
            searchByKeys={["name", "code"]}
            searchPlaceholder="Cari nama atau NIS…"
            pageSize={20}
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