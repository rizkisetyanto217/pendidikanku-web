// src/pages/dashboard/school/classes/details/SchoolClassDetail.tsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Loader2, Users, MapPin, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CDataTable as DataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

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

  class_section_subject_teachers_enrollment_mode: string;
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
  enrollmentMode: string;
  requiresApproval: boolean;
  isActive: boolean;
};

/* View model kelas (diambil dari snapshot baris pertama) */
type ClassView = {
  classId: string;
  className: string;
  classSlug: string;
  parentName: string;
  parentSlug: string;
  parentLevel: number;
};

/* ========== Types API /a/class-enrollments/list (view=compact) ========== */

type ApiClassEnrollment = {
  student_class_enrollments_id: string;
  student_class_enrollments_status: "accepted" | "pending" | "rejected";
  student_class_enrollments_total_due_idr: number;
  student_class_enrollments_school_student_id: string;
  student_class_enrollments_student_name: string;
  student_class_enrollments_class_id: string;
  student_class_enrollments_class_name: string;
  student_class_enrollments_term_id: string;
  student_class_enrollments_term_name_snapshot: string;
  student_class_enrollments_term_academic_year_snapshot: string;
  student_class_enrollments_term_angkatan_snapshot: number;
  payment_status: "paid" | "unpaid" | "pending";
  payment_checkout_url: string | null;
  student_class_enrollments_applied_at: string;
};

type ClassEnrollmentsListResp = {
  success: boolean;
  message: string;
  data: ApiClassEnrollment[];
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

type EnrollmentRow = {
  id: string;
  studentName: string;
  totalDueIdr: number;
  status: ApiClassEnrollment["student_class_enrollments_status"];
  paymentStatus: ApiClassEnrollment["payment_status"];
  checkoutUrl: string | null;
  appliedAt: string;
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

const formatDateTime = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRupiah = (amount: number) =>
  amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

/* ========================================================================
   Child: Card daftar enrollment kelas (filter by class_id saja)
   ======================================================================== */

type ClassEnrollmentsCardProps = {
  classId: string;
};

const ClassEnrollmentsCard: React.FC<ClassEnrollmentsCardProps> = ({
  classId,
}) => {
  const enabled = !!classId;

  console.log("[ClassEnrollmentsCard] props", { classId, enabled });

  const enrollmentsQ = useQuery<ClassEnrollmentsListResp, AxiosError>({
    queryKey: ["class-enrollments", classId],
    enabled,
    queryFn: async () => {
      console.log("[class-enrollments] fetching with params", {
        class_id: classId,
      });

      const res = await axios.get<ClassEnrollmentsListResp>(
        "/a/class-enrollments/list",
        {
          params: {
            view: "compact",
            class_id: classId,
          },
        }
      );

      console.log(
        "[class-enrollments] response",
        res.status,
        Array.isArray(res.data?.data) ? res.data.data.length : "no data"
      );

      return res.data;
    },
    staleTime: 60_000,
  });

  const rows: EnrollmentRow[] = useMemo(() => {
    const data = enrollmentsQ.data?.data ?? [];
    console.log("[class-enrollments] map rows, count =", data.length);
    console.log(
      "[class-enrollments] sample names =",
      data.map((d) => d.student_class_enrollments_student_name)
    );

    return data.map((it) => ({
      id: it.student_class_enrollments_id,
      studentName:
        it.student_class_enrollments_student_name ||
        "(Tanpa nama / belum sinkron)",
      totalDueIdr: it.student_class_enrollments_total_due_idr,
      status: it.student_class_enrollments_status,
      paymentStatus: it.payment_status,
      checkoutUrl: it.payment_checkout_url,
      appliedAt: it.student_class_enrollments_applied_at,
    }));
  }, [enrollmentsQ.data]);

  const totalPaid = rows
    .filter((r) => r.paymentStatus === "paid")
    .reduce((acc, r) => acc + r.totalDueIdr, 0);

  const columns: ColumnDef<EnrollmentRow>[] = useMemo(
    () => [
      {
        id: "student",
        header: "Siswa",
        minW: "220px",
        cell: (r) => (
          <div className="space-y-1">
            <div className="font-medium truncate">{r.studentName}</div>
            <div className="text-[11px] text-muted-foreground">
              ID Enroll:{" "}
              <span className="font-mono">
                {r.id.slice(0, 8)}…{r.id.slice(-4)}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Total Tagihan",
        align: "right",
        minW: "140px",
        cell: (r) => (
          <span className="tabular-nums">{formatRupiah(r.totalDueIdr)}</span>
        ),
      },
      {
        id: "status",
        header: "Status Enroll",
        align: "center",
        minW: "120px",
        cell: (r) => (
          <Badge variant={r.status === "accepted" ? "default" : "secondary"}>
            {r.status === "accepted"
              ? "Diterima"
              : r.status === "pending"
              ? "Menunggu"
              : "Ditolak"}
          </Badge>
        ),
      },
      {
        id: "payment",
        header: "Status Pembayaran",
        align: "center",
        minW: "160px",
        cell: (r) => {
          let color =
            "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1";
          if (r.paymentStatus === "paid") {
            color += " bg-emerald-500/10 text-emerald-500 ring-emerald-500/30";
          } else if (r.paymentStatus === "pending") {
            color += " bg-amber-500/10 text-amber-500 ring-amber-500/30";
          } else {
            color += " bg-zinc-500/10 text-zinc-500 ring-zinc-500/30";
          }

          return (
            <div className="space-y-1 text-xs">
              <span className={color}>
                {r.paymentStatus === "paid"
                  ? "Lunas"
                  : r.paymentStatus === "pending"
                  ? "Menunggu"
                  : "Belum dibayar"}
              </span>
              {r.checkoutUrl && (
                <a
                  href={r.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-[11px] text-sky-500 hover:underline truncate max-w-[200px]"
                >
                  Link pembayaran
                </a>
              )}
            </div>
          );
        },
      },
      {
        id: "appliedAt",
        header: "Tanggal Daftar",
        align: "center",
        minW: "160px",
        cell: (r) => (
          <span className="text-xs">{formatDateTime(r.appliedAt)}</span>
        ),
      },
    ],
    []
  );

  const errorText = enrollmentsQ.isError
    ? extractErrorMessage(enrollmentsQ.error)
    : null;

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">
            Pendaftar / Enrollment Kelas
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Data dari endpoint: <code>/a/class-enrollments/list</code> (view=
            <code>compact</code>, filter by <code>class_id</code>)
          </p>
        </div>
        {enabled && enrollmentsQ.isLoading && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Memuat enrollment…
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
        {errorText && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <div>
              <div className="font-medium mb-0.5">
                Gagal memuat data enrollment.
              </div>
              <div className="break-all">{errorText}</div>
            </div>
          </div>
        )}

        {/* Ringkasan kecil */}
        {rows.length > 0 && (
          <div className="grid gap-3 md:grid-cols-3 text-xs">
            <div className="rounded-lg border p-3">
              <div className="text-[11px] text-muted-foreground">
                Total Pendaftar
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {rows.length}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-[11px] text-muted-foreground">
                Total Dibayar
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {formatRupiah(totalPaid)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-[11px] text-muted-foreground">
                Lunas / Belum
              </div>
              <div className="text-sm mt-1">
                Lunas:{" "}
                <span className="font-semibold">
                  {rows.filter((r) => r.paymentStatus === "paid").length}
                </span>{" "}
                • Belum:{" "}
                <span className="font-semibold">
                  {rows.filter((r) => r.paymentStatus !== "paid").length}
                </span>
              </div>
            </div>
          </div>
        )}

        <DataTable<EnrollmentRow>
          rows={rows}
          columns={columns}
          loading={enrollmentsQ.isLoading && enabled}
          getRowId={(r) => r.id}
          searchByKeys={["studentName"]}
          searchPlaceholder="Cari nama siswa…"
          pageSize={20}
          pageSizeOptions={[10, 20, 50]}
          stickyHeader
          zebra
        />
      </CardContent>
    </Card>
  );
};

/* ========================================================================
   Page utama
   ======================================================================== */

const SchoolClassDetail: React.FC = () => {
  const navigate = useNavigate();
  const { schoolId, classId } = useParams<{
    schoolId: string;
    classId: string;
  }>();

  const { setHeader } = useDashboardHeader();
  const safeClassId = classId ?? "";

  /* ===== Fetch class sections untuk 1 class_id ===== */
  const sectionsQ = useQuery<ClassSectionListResp, AxiosError>({
    queryKey: ["class-sections", safeClassId],
    enabled: !!safeClassId,
    queryFn: async () => {
      console.log("[class-sections] fetching for class_id", safeClassId);
      const res = await axios.get<ClassSectionListResp>(
        "/u/class-sections/list",
        {
          params: {
            class_id: safeClassId,
            page: 1,
            per_page: 100,
          },
        }
      );
      console.log(
        "[class-sections] response",
        res.status,
        Array.isArray(res.data?.data) ? res.data.data.length : "no data"
      );
      return res.data;
    },
    staleTime: 60_000,
  });

  const sections: ApiClassSection[] = useMemo(
    () => sectionsQ.data?.data ?? [],
    [sectionsQ.data]
  );

  /* ===== Ambil info kelas dari snapshot baris pertama ===== */
  const classView: ClassView = useMemo(() => {
    const first = sections[0];

    if (first) {
      const view: ClassView = {
        classId: safeClassId,
        className: first.class_section_class_name_snapshot || "Tanpa Nama",
        classSlug: first.class_section_class_slug_snapshot || "-",
        parentName: first.class_section_class_parent_name_snapshot || "-",
        parentSlug: first.class_section_class_parent_slug_snapshot || "-",
        parentLevel: first.class_section_class_parent_level_snapshot ?? 0,
      };
      console.log("[classView] from first section", view);
      return view;
    }

    const fallback: ClassView = {
      classId: safeClassId,
      className: "Detail Kelas",
      classSlug: safeClassId || "-",
      parentName: "-",
      parentSlug: "-",
      parentLevel: 0,
    };
    console.log("[classView] fallback (no sections)", fallback);
    return fallback;
  }, [sections, safeClassId]);

  const {
    classId: viewClassId,
    className,
    classSlug,
    parentName,
    parentLevel,
  } = classView;

  /* ===== Set header top bar ===== */
  useEffect(() => {
    setHeader({
      title: `Kelas: ${className}`,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        {
          label: "Data Kelas",
          href: `/${schoolId}/sekolah/kelas/daftar-kelas`,
        },
        { label: className },
      ],
    });
  }, [setHeader, schoolId, className]);

  /* ===== Map ke row DataTable ===== */
  const rows: SectionRow[] = useMemo(() => {
    const mapped = sections.map((s) => {
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
        enrollmentMode: s.class_section_subject_teachers_enrollment_mode,
        requiresApproval:
          s.class_section_subject_teachers_self_select_requires_approval,
        isActive: s.class_section_is_active,
      };
    });

    console.log("[class-sections] mapped rows", mapped.length);
    return mapped;
  }, [sections]);

  /* ===== Stats kecil di atas tabel ===== */
  const totalSections = rows.length;
  const totalStudents = rows.reduce(
    (acc, r) => acc + (r.totalStudents || 0),
    0
  );
  const virtualCount = rows.filter((r) => r.isVirtual).length;

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
              Slug: <span className="font-mono">{r.slug}</span>
            </div>
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
              {r.enrollmentMode.replace(/_/g, " ")}
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
          onClick={() => navigate(`/${schoolId}/sekolah/kelas/daftar-kelas`)}
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
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/${schoolId}/sekolah/kelas/daftar-kelas`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{className}</h1>
            <p className="text-xs text-muted-foreground">
              Slug: <span className="font-mono">{classSlug}</span> • Tingkat:{" "}
              {parentName} {parentLevel != null && `(Level ${parentLevel})`}
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
              Rombel di kelas {className}
            </p>
          </CardContent>
        </Card>

        <Card>
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
        <CardHeader className="py-3">
          <CardTitle className="text-base">
            Daftar Rombel / Kelas Paralel
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {sectionsError && (
            <div className="mb-2 text-xs text-destructive">{sectionsError}</div>
          )}

          <DataTable<SectionRow>
            rows={rows}
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

      {/* Card daftar enrollment kelas (filter by class_id) */}
      <ClassEnrollmentsCard classId={viewClassId} />
    </div>
  );
};

export default SchoolClassDetail;