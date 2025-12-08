// src/pages/dashboard/school/classes/details/SchoolClassDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Loader2, Users, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";

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

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code: string;
  class_section_schedule: any | null;
  class_section_capacity: number | null;
  class_section_total_students: number;
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

  class_section_academic_term_id: string | null;
  class_section_snapshot_updated_at: string;

  class_section_subject_teachers_enrollment_mode?: string | null;
  class_section_subject_teachers_self_select_requires_approval: boolean;

  class_section_class_room_id?: string | null;
  class_section_class_room_slug_snapshot?: string | null;
  class_section_class_room_name_snapshot?: string | null;
  class_section_class_room_location_snapshot?: string | null;
  class_section_class_room_snapshot?: RoomSnapshot | null;
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

/* Row untuk DataTable */
type SectionRow = {
  id: string;
  name: string;
  slug: string;
  code: string;
  roomName?: string | null;
  roomLocation?: string | null;
  isVirtual?: boolean;
  capacity?: number | null;
  totalStudents: number;
  enrollmentMode?: string | null; // boleh null/undefined
  requiresApproval: boolean;
  isActive: boolean;
};

/* View model kelas */
type ClassView = {
  classId: string;
  className: string;
  classSlug: string;
  parentName: string;
  parentSlug: string;
  parentLevel: number;
};

/* State yang dikirim dari SchoolClass.tsx */
type LocationState = {
  className?: string;
  classSlug?: string;
  parentName?: string;
  parentLevel?: number | null;
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

const normalizeEnrollmentMode = (mode?: string | null): string => {
  if (!mode) return "-";
  return mode.replace(/_/g, " ");
};

/* ========== Page ========== */

const SchoolClassDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const { schoolId, classId } = useParams<{
    schoolId: string;
    classId: string;
  }>();

  const { setHeader } = useDashboardHeader();

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roomFilter, setRoomFilter] = useState<
    "all" | "virtual" | "physical" | "unset"
  >("all");

  /* ===== Fetch class sections untuk 1 class_id ===== */
  const sectionsQ = useQuery<ClassSectionListResp, AxiosError>({
    queryKey: ["class-sections", classId],
    enabled: !!classId,
    queryFn: async () => {
      const res = await axios.get<ClassSectionListResp>(
        "/u/class-sections/list",
        {
          params: {
            class_id: classId,
            page: 1,
            per_page: 100,
          },
        }
      );
      return res.data;
    },
    staleTime: 60_000,
  });

  const sections: ApiClassSection[] = sectionsQ.data?.data ?? [];

  /* ===== Ambil info kelas (prioritas state, fallback snapshot) ===== */
  const safeClassId = classId ?? "";

  const classView: ClassView = useMemo(() => {
    const first = sections[0];

    const classNameFromState = locationState.className;
    const classSlugFromState = locationState.classSlug;
    const parentNameFromState = locationState.parentName;
    const parentLevelFromState = locationState.parentLevel;

    const className =
      classNameFromState ||
      first?.class_section_class_name_snapshot ||
      "Detail Kelas";

    const classSlug =
      classSlugFromState ||
      first?.class_section_class_slug_snapshot ||
      safeClassId ||
      "-";

    const parentName =
      parentNameFromState ||
      first?.class_section_class_parent_name_snapshot ||
      "-";

    const parentSlug = first?.class_section_class_parent_slug_snapshot || "-";

    const parentLevel =
      parentLevelFromState ??
      first?.class_section_class_parent_level_snapshot ??
      0;

    return {
      classId: safeClassId,
      className,
      classSlug,
      parentName,
      parentSlug,
      parentLevel,
    };
  }, [sections, safeClassId, locationState]);

  /* ===== Set header top bar ===== */
  useEffect(() => {
    setHeader({
      title: `Kelas: ${classView.className}`,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        {
          label: "Data Kelas",
          href: `/${schoolId}/sekolah/kelas/daftar-kelas `,
        },
        { label: classView.className },
      ],
      showBack: true,
    });
  }, [classView, schoolId, setHeader]);

  /* ===== Map ke row DataTable ===== */
  const rows: SectionRow[] = useMemo(() => {
    return sections.map((s) => {
      const roomSnap = s.class_section_class_room_snapshot ?? null;

      const roomName =
        s.class_section_class_room_name_snapshot || roomSnap?.name || null;
      const roomLocation =
        s.class_section_class_room_location_snapshot ||
        roomSnap?.location ||
        null;
      const isVirtual =
        roomSnap?.is_virtual ?? (roomSnap?.platform ? true : undefined);

      const capacity = s.class_section_capacity ?? roomSnap?.capacity ?? null;

      return {
        id: s.class_section_id,
        name: s.class_section_name,
        slug: s.class_section_slug,
        code: s.class_section_code,
        roomName,
        roomLocation,
        isVirtual,
        capacity,
        totalStudents: s.class_section_total_students,
        enrollmentMode:
          s.class_section_subject_teachers_enrollment_mode ?? null,
        requiresApproval:
          s.class_section_subject_teachers_self_select_requires_approval,
        isActive: s.class_section_is_active,
      };
    });
  }, [sections]);

  /* ===== Stats kecil di atas tabel (pakai semua rows) ===== */
  const totalSections = rows.length;
  const totalStudents = rows.reduce(
    (acc, r) => acc + (r.totalStudents || 0),
    0
  );
  const virtualCount = rows.filter((r) => r.isVirtual).length;

  /* ===== Filtered rows untuk tabel ===== */
  const filteredRows: SectionRow[] = useMemo(() => {
    return rows.filter((r) => {
      // filter status
      if (statusFilter === "active" && !r.isActive) return false;
      if (statusFilter === "inactive" && r.isActive) return false;

      // filter ruang
      if (roomFilter === "virtual" && !r.isVirtual) return false;
      if (roomFilter === "physical" && r.isVirtual) return false;
      if (roomFilter === "unset" && (r.roomName || r.isVirtual)) return false;

      return true;
    });
  }, [rows, statusFilter, roomFilter]);

  /* ===== Columns DataTable ===== */
  const columns: ColumnDef<SectionRow>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Nama Rombel",
        minW: "260px",
        cell: (r) => (
          <div className="space-y-1">
            <div className="font-medium">{r.name}</div>
            <div className="text-[11px] text-muted-foreground">
              Kode: <span className="font-mono">{r.code}</span>
            </div>
          </div>
        ),
      },
      {
        id: "room",
        header: "Ruang / Platform",
        minW: "220px",
        cell: (r) => {
          if (!r.roomName && !r.isVirtual) {
            return (
              <span className="text-xs text-muted-foreground">
                Belum diatur
              </span>
            );
          }

          return (
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {r.isVirtual ? <span>Virtual</span> : <span>Ruang fisik</span>}
              </div>
              {r.roomName && <div className="font-medium">{r.roomName}</div>}
              {r.roomLocation && (
                <div className="text-[11px] text-muted-foreground">
                  {r.roomLocation}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "capacity",
        header: "Kapasitas",
        align: "center",
        minW: "110px",
        cell: (r) =>
          r.capacity != null ? (
            <span className="tabular-nums">{r.capacity}</span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tidak dibatasi
            </span>
          ),
      },
      {
        id: "students",
        header: "Jumlah Siswa",
        align: "center",
        minW: "120px",
        cell: (r) => (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Users className="h-3 w-3" />
            {r.totalStudents}
          </span>
        ),
      },
      {
        id: "enrollment",
        header: "Mode Pendaftaran",
        align: "center",
        minW: "160px",
        cell: (r) => (
          <div className="text-xs space-y-1">
            <div className="capitalize">
              {normalizeEnrollmentMode(r.enrollmentMode)}
            </div>
            {r.enrollmentMode === "self_select" && (
              <div className="text-[11px] text-muted-foreground">
                {r.requiresApproval
                  ? "Perlu persetujuan admin"
                  : "Otomatis masuk"}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        align: "center",
        minW: "100px",
        cell: (r) => (
          <CBadgeStatus
            status={r.isActive ? "active" : "inactive"}
            className="justify-center"
          />
        ),
      },

      {
        id: "actions",
        header: "",
        align: "right",
        minW: "180px",
        cell: (r) => (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={() =>
                navigate(`/${schoolId}/sekolah/kelas/rombel/${r.id}/siswa`)
              }
            >
              Siswa
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={() =>
                navigate(`/${schoolId}/sekolah/kelas/rombel/${r.id}/jadwal`)
              }
            >
              Jadwal
            </Button>
          </div>
        ),
      },
    ],
    [navigate, schoolId]
  );

  /* ===== Precompute error string ===== */
  const sectionsError: string | null = sectionsQ.isError
    ? extractErrorMessage(sectionsQ.error)
    : null;

  /* ===== State: loading / error ===== */

  if (sectionsQ.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="animate-spin" /> Memuat detail kelas…
      </div>
    );
  }

  if (sectionsError) {
    const msg = sectionsError ?? "Data kelas tidak ditemukan.";

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-3 text-center">
        <div className="text-destructive text-sm">
          Gagal memuat detail kelas.
        </div>
        <div className="text-xs text-muted-foreground break-all">{msg}</div>
        <Button
          variant="outline"
          onClick={() => navigate(`/${schoolId}/sekolah/kelas/daftar-kelas `)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke daftar kelas
        </Button>
      </div>
    );
  }

  /* ===== Render utama ===== */

  return (
    <div className="space-y-4">
      {/* Header lokal halaman */}
      <div className="flex items-center justify-between gap-3">
        <div className="md:flex hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/${schoolId}/sekolah/kelas/daftar-kelas `)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{classView.className}</h1>
            <p className="text-xs text-muted-foreground">
              Slug: <span className="font-mono">{classView.classSlug}</span> •
              Tingkat: {classView.parentName}{" "}
              {classView.parentLevel != null &&
                `(Level ${classView.parentLevel})`}
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan kecil */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Total Rombel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-semibold">{totalSections}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rombel di kelas {classView.className}
            </p>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate(`murid`)}
          className="cursor-pointer transition hover:border-primary/60 hover:shadow-sm"
        >
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Total Siswa (semua rombel)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-semibold tabular-nums">
              {totalStudents}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Akumulasi dari seluruh rombel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-xs text-muted-foreground">
              Rombel Virtual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-semibold tabular-nums">
              {virtualCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Menggunakan ruang/platform online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel rombel */}
      <Card>
        <CardHeader className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <CardTitle className="text-base">
            Daftar Rombel / Kelas Paralel
          </CardTitle>

          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() =>
              navigate(
                `/${schoolId}/sekolah/kelas/${classView.classId}/rombel/new`
              )
            }
          >
            Tambah Rombel
          </Button>
        </CardHeader>
        <CardContent className="pb-4">
          {sectionsError && (
            <div className="mb-2 text-xs text-destructive">{sectionsError}</div>
          )}

          {/* Filter bar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Status:</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={statusFilter === "all" ? "secondary" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setStatusFilter("all")}
                  >
                    Semua
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "active" ? "secondary" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setStatusFilter("active")}
                  >
                    Aktif
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      statusFilter === "inactive" ? "secondary" : "ghost"
                    }
                    className="h-7 px-2"
                    onClick={() => setStatusFilter("inactive")}
                  >
                    Nonaktif
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Ruang:</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={roomFilter === "all" ? "secondary" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setRoomFilter("all")}
                  >
                    Semua
                  </Button>
                  <Button
                    size="sm"
                    variant={roomFilter === "virtual" ? "secondary" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setRoomFilter("virtual")}
                  >
                    Virtual
                  </Button>
                  <Button
                    size="sm"
                    variant={roomFilter === "physical" ? "secondary" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setRoomFilter("physical")}
                  >
                    Fisik
                  </Button>
                  <Button
                    size="sm"
                    variant={roomFilter === "unset" ? "secondary" : "ghost"}
                    className="h-7 px-2"
                    onClick={() => setRoomFilter("unset")}
                  >
                    Belum diatur
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DataTable<SectionRow>
            rows={filteredRows}
            columns={columns}
            loading={sectionsQ.isLoading}
            getRowId={(r) => r.id}
            searchByKeys={["name", "slug", "code", "roomName"]}
            searchPlaceholder="Cari rombel, kode, atau ruang…"
            pageSize={20}
            pageSizeOptions={[10, 20, 50]}
            stickyHeader
            zebra
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolClassDetail;
