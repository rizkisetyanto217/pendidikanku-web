// src/pages/dashboard/school/classes/details/SchoolClassStudentList.tsx
import * as React from "react";
import { useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* DataTable custom */
import {
  DataTable as CDataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

/* 🔌 API + React Query */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ArrowLeft } from "lucide-react";

/* ===== Utils ===== */
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateShort = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

/* ====== API TYPES (re-use dari enrolment compact) ====== */

type ApiEnrollment = {
  student_class_enrollments_id: string;
  student_class_enrollments_status: string;
  student_class_enrollments_total_due_idr: number;
  student_class_enrollments_school_student_id: string;
  student_class_enrollments_student_name: string;
  student_class_enrollments_student_gender?: string | null;
  student_class_enrollments_student_code?: string | null;
  student_class_enrollments_student_slug?: string | null;

  student_class_enrollments_class_id?: string | null;
  student_class_enrollments_class_name?: string | null;
  student_class_enrollments_class_section_id?: string | null;
  student_class_enrollments_class_section_name_snapshot?: string | null;
  student_class_enrollments_class_section_slug_snapshot?: string | null;

  student_class_enrollments_term_id: string;
  student_class_enrollments_term_name_snapshot: string;
  student_class_enrollments_term_academic_year_snapshot: string;
  student_class_enrollments_term_angkatan_snapshot?: number | null;

  payment_status?: string | null;
  payment_checkout_url?: string | null;

  student_class_enrollments_applied_at?: string | null;
};

type ApiEnrollmentListResponse = {
  success: boolean;
  message: string;
  data: ApiEnrollment[];
};

/* ===== Helper mapping ===== */

type PaymentStatus = "belum_bayar" | "sebagian" | "lunas";

function mapPaymentStatus(raw?: string | null): PaymentStatus {
  switch ((raw || "").toLowerCase()) {
    case "paid":
      return "lunas";
    case "partial":
    case "partial_paid":
      return "sebagian";
    default:
      return "belum_bayar";
  }
}

function mapGenderLP(raw?: string | null): "L" | "P" | "-" {
  if (!raw) return "-";
  const s = raw.toLowerCase();

  if (s.startsWith("m") || s.startsWith("l")) return "L";
  if (s.startsWith("f") || s.startsWith("p")) return "P";

  return "-";
}

/* ===== Row type untuk tabel ===== */

type ClassStudentRow = {
  enrollment_id: string;
  student_code?: string | null;
  student_name: string;
  gender_raw?: string | null;
  applied_at?: string | null;
  amount_due_idr?: number | null;
  payment_status: PaymentStatus;
  term_label?: string | null;
};

/* ===== Komponen Halaman ===== */

type Props = { showBack?: boolean; backTo?: string };

const SchoolClassStudentList: React.FC<Props> = ({
  showBack = false,
  backTo,
}) => {
  const navigate = useNavigate();
  const { schoolId, classId } = useParams<{
    schoolId: string;
    classId: string;
  }>();

  const handleBack = () =>
    backTo
      ? navigate(backTo)
      : navigate(`/${schoolId}/sekolah/kelas/daftar-kelas`);

  const { setHeader } = useDashboardHeader();

  /* 🔌 Fetch data: hanya murid yang sudah bayar & untuk class_id tertentu */
  const {
    data: enrollments,
    isLoading,
    isError,
    error,
  } = useQuery<ApiEnrollment[], Error>({
    queryKey: ["admin-class-enrollments", "class-students", classId],
    enabled: Boolean(classId),
    queryFn: async () => {
      const res = await api.get<ApiEnrollmentListResponse>(
        "/api/a/class-enrollments/list",
        {
          params: {
            view: "compact",
            category: "registration",
            payment_status: "paid",
            class_id: classId,
          },
        }
      );
      return res.data.data ?? [];
    },
  });

  /* Ambil info kelas dari snapshot baris pertama */
  const className = useMemo(
    () =>
      enrollments && enrollments.length
        ? enrollments[0].student_class_enrollments_class_name ||
          enrollments[0]
            .student_class_enrollments_class_section_name_snapshot ||
          "Kelas tanpa nama"
        : "Kelas",
    [enrollments]
  );

  const termLabel = useMemo(() => {
    if (!enrollments || !enrollments.length) return "-";
    const e = enrollments[0];
    const base = `${e.student_class_enrollments_term_academic_year_snapshot} — ${e.student_class_enrollments_term_name_snapshot}`;
    return e.student_class_enrollments_term_angkatan_snapshot
      ? `${base} (Angkatan ke-${e.student_class_enrollments_term_angkatan_snapshot})`
      : base;
  }, [enrollments]);

  /* Set header */
  useEffect(() => {
    setHeader({
      title: `Murid Kelas`,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        {
          label: "Daftar Kelas",
          href: `/${schoolId}/sekolah/kelas/daftar-kelas`,
        },
        { label: className },
        { label: "Murid" },
      ],
      showBack,
    });
  }, [setHeader, showBack, schoolId, className]);

  /* Map ke row tabel */
  const rows: ClassStudentRow[] = useMemo(
    () =>
      (enrollments ?? []).map((e) => ({
        enrollment_id: e.student_class_enrollments_id,
        student_code: e.student_class_enrollments_student_code ?? null,
        student_name:
          e.student_class_enrollments_student_name || "(Tanpa nama)",
        gender_raw: e.student_class_enrollments_student_gender ?? null,
        applied_at: e.student_class_enrollments_applied_at,
        amount_due_idr: e.student_class_enrollments_total_due_idr,
        payment_status: mapPaymentStatus(e.payment_status),
        term_label: `${e.student_class_enrollments_term_academic_year_snapshot} — ${e.student_class_enrollments_term_name_snapshot}`,
      })),
    [enrollments]
  );

  /* Stats */
  const totalStudents = rows.length;
  const totalL = rows.filter((r) => mapGenderLP(r.gender_raw) === "L").length;
  const totalP = rows.filter((r) => mapGenderLP(r.gender_raw) === "P").length;

  const statsSlot = (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoItem label="Total Murid" value={<b>{totalStudents}</b>} />
      <InfoItem label="Laki-laki (L)" value={<b>{totalL}</b>} />
      <InfoItem label="Perempuan (P)" value={<b>{totalP}</b>} />
    </div>
  );

  /* Kolom tabel */
  const cols: ColumnDef<ClassStudentRow>[] = [
    {
      id: "enrollment_id",
      header: "No. Reg",
      minW: "180px",
      cell: (r) => <span className="font-mono text-xs">{r.enrollment_id}</span>,
    },
    {
      id: "student_name",
      header: "Nama",
      minW: "200px",
      cell: (r) => (
        <div className="space-y-0.5">
          <div>{r.student_name}</div>
          {r.student_code && (
            <div className="text-[11px] text-muted-foreground">
              NIS: <span className="font-mono">{r.student_code}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "gender",
      header: "JK",
      minW: "60px",
      align: "center",
      cell: (r) => <span>{mapGenderLP(r.gender_raw)}</span>,
    },
    {
      id: "applied_at",
      header: "Didaftarkan",
      minW: "140px",
      cell: (r) => dateShort(r.applied_at),
    },
    {
      id: "term",
      header: "Periode",
      minW: "180px",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.term_label || "-"}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Nominal",
      minW: "140px",
      align: "right",
      cell: (r) =>
        r.amount_due_idr ? fmtIDR(r.amount_due_idr) : <span>-</span>,
    },
    {
      id: "payment",
      header: "Pembayaran",
      minW: "120px",
      cell: (r) =>
        r.payment_status === "lunas" ? (
          <Badge>lunas</Badge>
        ) : r.payment_status === "sebagian" ? (
          <Badge variant="secondary">sebagian</Badge>
        ) : (
          <Badge variant="outline">belum</Badge>
        ),
    },
  ];

  return (
    <div className="w-full">
      {/* Header lokal */}
      <div className="md:flex hidden gap-3 items-center mb-3">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="cursor-pointer self-start"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-lg font-semibold md:text-xl">
            Murid di {className}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm mb-1">
            Hanya menampilkan murid dengan pembayaran <b>lunas</b>.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Periode: {termLabel}
          </p>
        </div>
      </div>

      {/* Ringkasan */}
      <Card className="mb-4">
        <CardHeader className="py-3">
          <CardTitle className="text-base md:text-lg">
            Ringkasan Murid Kelas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">{statsSlot}</CardContent>
      </Card>

      {/* Tabel murid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">Daftar Murid</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <CDataTable<ClassStudentRow>
            title="Murid di Kelas"
            controlsPlacement="above"
            defaultQuery=""
            searchByKeys={["enrollment_id", "student_name", "student_code"]}
            loading={isLoading}
            error={isError ? error?.message || "Gagal memuat data murid" : null}
            columns={cols}
            rows={rows}
            getRowId={(r) => r.enrollment_id}
            onRowClick={(r) =>
              alert(
                `Detail murid: ${r.student_name}\nNo Reg: ${r.enrollment_id}`
              )
            }
            pageSize={20}
            zebra
            stickyHeader
          />
        </CardContent>
      </Card>

      <div className="h-6" />
    </div>
  );
};

export default SchoolClassStudentList;

/* ===== Small pieces ===== */
function InfoItem({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
