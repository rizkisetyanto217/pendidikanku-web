// src/pages/.../SchoolRegistrationsListStudent.tsx
import * as React from "react";
import { useMemo, useState, useEffect } from "react";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* DataTable custom */
import {
  DataTable as CDataTable,
  type ColumnDef,
} from "@/components/costum/table/CDataTable";

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/* 🔌 API + React Query */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

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

/* ====== API TYPES (sesuai response enrolment compact) ====== */

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

  // ⬇️ ID pembayaran terakhir (silakan samakan dgn field backend)
  student_class_enrollments_last_payment_id?: string | null;

  student_class_enrollments_applied_at?: string | null;
};

type ApiEnrollmentListResponse = {
  success: boolean;
  message: string;
  data: ApiEnrollment[];
};

/* ====== FILTER TERM (dibangun dari snapshot di row) ====== */

type TermOption = {
  id: string;
  academic_year: string;
  name: string;
  angkatan?: number | null;
};

type RegistrationStatus = "menunggu" | "diterima" | "ditolak";
type PaymentStatus = "belum_bayar" | "sebagian" | "lunas";

type StudentReg = {
  reg_id: string;
  reg_no: string;
  name: string;
  class_id?: string | null;
  class_name?: string | null;
  submitted_at?: string | null;
  status: RegistrationStatus;
  amount_due_idr?: number | null;
  payment_status: PaymentStatus;
  gender_raw?: string | null;
  payment_id?: string | null; // ⬅️ untuk detail pembayaran
};

const CLASSES: { class_id: string; class_name: string }[] = [
  // hanya untuk dialog dummy "Tambah Pendaftar"
  { class_id: "c1", class_name: "Kelas 1A" },
  { class_id: "c2", class_name: "Kelas 1B" },
  { class_id: "c3", class_name: "Kelas 2A" },
];

/* ===== Helper mapping status dari API → label UI ===== */

function mapEnrollmentStatus(raw: string): RegistrationStatus {
  switch (raw) {
    case "accepted":
      return "diterima";
    case "rejected":
    case "cancelled":
      return "ditolak";
    default:
      return "menunggu";
  }
}

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

  // antisipasi value "male"/"m"/"laki"/"l"
  if (s.startsWith("m") || s.startsWith("l")) return "L";

  // antisipasi value "female"/"f"/"perempuan"/"p"
  if (s.startsWith("f") || s.startsWith("p")) return "P";

  return "-";
}

/* ===== Dialog Tambah Manual Pendaftar (dummy) ===== */
function AddStudentDialog() {
  const [name, setName] = useState("Nama Calon Murid");
  const [cls, setCls] = useState<string | "none">("none");
  const [amount, setAmount] = useState<number>(150_000);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tambah Pendaftar Manual</DialogTitle>
        <DialogDescription>
          Simulasi menambah entri pendaftaran murid.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Nama</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Kelas (opsional)</Label>
          <Select value={cls} onValueChange={(v) => setCls(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">(Belum memilih)</SelectItem>
              {CLASSES.map((c) => (
                <SelectItem key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nominal Biaya (IDR)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))}
          />
        </div>
      </div>
      <Separator className="my-2" />
      <div className="rounded-md bg-muted p-3 text-sm">
        <div className="font-medium">Preview payload:</div>
        <pre className="mt-1 whitespace-pre-wrap break-all text-xs">
          {JSON.stringify(
            {
              name,
              class_id: cls === "none" ? null : cls,
              amount_idr: amount,
              status: "menunggu",
            },
            null,
            2
          )}
        </pre>
      </div>
      <DialogFooter>
        <Button
          onClick={() =>
            alert("Submit dummy. Integrasikan ke API untuk produksi.")
          }
        >
          Simpan (dummy)
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ===== Komponen Halaman ===== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolRegistrationsListStudent({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "PMB — Daftar Pendaftar",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pendaftaran" },
        { label: "Murid" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  /* 🔌 Fetch data dari API */
  const {
    data: enrollments,
    isLoading,
    isError,
    error,
  } = useQuery<ApiEnrollment[], Error>({
    queryKey: ["admin-class-enrollments", "registration"],
    queryFn: async () => {
      const res = await api.get<ApiEnrollmentListResponse>(
        "/api/a/class-enrollments/list",
        {
          params: {
            view: "compact",
            category: "registration",
          },
        }
      );
      return res.data.data ?? [];
    },
  });

  /* 🎯 Term options dari snapshot di data enrolment */
  const termOptions: TermOption[] = useMemo(() => {
    if (!enrollments) return [];
    const map = new Map<string, TermOption>();

    enrollments.forEach((e) => {
      const id = e.student_class_enrollments_term_id;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, {
          id,
          academic_year:
            e.student_class_enrollments_term_academic_year_snapshot,
          name: e.student_class_enrollments_term_name_snapshot,
          angkatan: e.student_class_enrollments_term_angkatan_snapshot ?? null,
        });
      }
    });

    return Array.from(map.values());
  }, [enrollments]);

  const [termId, setTermId] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    // kalau awalnya "all" dan ada term, default ke term pertama
    if (termId === "all" && termOptions.length > 0) {
      setTermId(termOptions[0].id);
    }
  }, [termOptions, termId]);

  const selectedTerm =
    termId === "all"
      ? undefined
      : termOptions.find((t) => t.id === termId) || termOptions[0];

  /* 🔍 Filter rows by term */
  const filteredEnrollments = useMemo(() => {
    if (!enrollments) return [];
    if (!selectedTerm) return enrollments;
    return enrollments.filter(
      (e) => e.student_class_enrollments_term_id === selectedTerm.id
    );
  }, [enrollments, selectedTerm]);

  const rows: StudentReg[] = useMemo(
    () =>
      filteredEnrollments.map((e) => ({
        reg_id: e.student_class_enrollments_id,

        // ⬇️ No. Reg sekarang langsung pakai enrollment_id
        reg_no: e.student_class_enrollments_id,

        name: e.student_class_enrollments_student_name || "(Tanpa nama)",
        class_id: e.student_class_enrollments_class_id || null,
        class_name:
          e.student_class_enrollments_class_name ||
          e.student_class_enrollments_class_section_name_snapshot ||
          null,
        submitted_at: e.student_class_enrollments_applied_at,
        status: mapEnrollmentStatus(e.student_class_enrollments_status),
        amount_due_idr: e.student_class_enrollments_total_due_idr,
        payment_status: mapPaymentStatus(e.payment_status),

        // ⬇️ simpan raw gender
        gender_raw: e.student_class_enrollments_student_gender ?? null,

        // ⬇️ map ke payment_id untuk detail
        payment_id: e.student_class_enrollments_last_payment_id ?? null,
      })),
    [filteredEnrollments]
  );

  const statsSlot = (
    <div className="grid gap-3 md:grid-cols-3">
      <InfoItem label="Total Pendaftar" value={<b>{rows.length}</b>} />
      <InfoItem
        label="Diterima"
        value={<b>{rows.filter((r) => r.status === "diterima").length}</b>}
      />
      <InfoItem
        label="Lunas"
        value={<b>{rows.filter((r) => r.payment_status === "lunas").length}</b>}
      />
    </div>
  );

  /* 🧱 Kolom tabel */
  const cols: ColumnDef<StudentReg>[] = [
    {
      id: "reg_no",
      header: "No. Reg",
      minW: "120px",
      align: "left",
      cell: (r) => r.reg_no,
    },
    {
      id: "name",
      header: "Nama",
      minW: "200px",
      align: "left",
      cell: (r) => r.name,
    },
    // ⬇️ kolom baru JK
    {
      id: "gender",
      header: "JK",
      minW: "60px",
      align: "center",
      cell: (r) => <span>{mapGenderLP(r.gender_raw)}</span>,
    },
    {
      id: "class",
      header: "Kelas",
      minW: "160px",
      cell: (r) => {
        const label =
          r.class_name ||
          CLASSES.find((x) => x.class_id === r.class_id || "")?.class_name;

        return label ? (
          label
        ) : (
          <span className="text-muted-foreground">(Belum memilih)</span>
        );
      },
    },
    {
      id: "submitted_at",
      header: "Didaftarkan",
      minW: "160px",
      cell: (r) => dateShort(r.submitted_at),
    },
    {
      id: "status",
      header: "Status",
      minW: "120px",
      cell: (r) =>
        r.status === "diterima" ? (
          <Badge>diterima</Badge>
        ) : r.status === "ditolak" ? (
          <Badge variant="outline">ditolak</Badge>
        ) : (
          <Badge variant="secondary">menunggu</Badge>
        ),
    },
    {
      id: "amount_due_idr",
      header: "Nominal",
      minW: "140px",
      align: "right",
      cell: (r) => (r.amount_due_idr ? fmtIDR(r.amount_due_idr) : "-"),
    },
    {
      id: "payment_status",
      header: "Pembayaran",
      minW: "180px",
      cell: (r) => (
        <div className="flex items-center justify-between gap-2">
          <div>
            {r.payment_status === "lunas" ? (
              <Badge>lunas</Badge>
            ) : r.payment_status === "sebagian" ? (
              <Badge variant="secondary">sebagian</Badge>
            ) : (
              <Badge variant="outline">belum</Badge>
            )}
          </div>
          {r.payment_id && (
            <Button
              variant="ghost"
              className="h-7 px-2 text-[11px]"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `pembayaran?payment_id=${encodeURIComponent(r.payment_id!)}`
                );
              }}
            >
              Detail
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Header Back seperti SchoolAcademic */}
      <div className="md:flex hidden gap-3 items-center">
        {showBack && (
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="cursor-pointer self-start"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold md:text-xl">
            PMB - Daftar Pendaftar
          </h1>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm mb-4">
            Pantau pendaftar per-periode, status seleksi, dan pembayaran
          </p>
        </div>
      </div>

      {/* Picker Periode (dari snapshot enrolment) */}
      <Card className="mb-4">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base md:text-lg">
            Periode Akademik
          </CardTitle>
          <div className="w-full min-w-[220px] md:w-72">
            <Select
              value={selectedTerm ? selectedTerm.id : "all"}
              onValueChange={(val) =>
                val === "all" ? setTermId("all") : setTermId(val)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua periode</SelectItem>
                {termOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.academic_year} — {t.name}
                    {t.angkatan ? ` (Angkatan ke-${t.angkatan})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <InfoItem
            label="Periode dipilih"
            value={
              selectedTerm
                ? `${selectedTerm.academic_year} — ${selectedTerm.name}`
                : "Semua periode"
            }
          />
          <InfoItem
            label="Angkatan"
            value={
              selectedTerm?.angkatan
                ? `Angkatan ke-${selectedTerm.angkatan}`
                : "-"
            }
          />
          <InfoItem
            label="Total pendaftar (filter)"
            value={<b>{rows.length}</b>}
          />
        </CardContent>
      </Card>

      {/* Tabel pendaftar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            Murid Terdaftar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Export CSV (dummy)")}
            >
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <CDataTable<StudentReg>
            title="Daftar Pendaftar"
            controlsPlacement="above"
            defaultQuery=""
            searchByKeys={["reg_no", "name"]}
            statsSlot={statsSlot}
            loading={isLoading}
            error={
              isError ? error?.message || "Gagal memuat data pendaftar" : null
            }
            columns={cols}
            rows={rows}
            getRowId={(r) => r.reg_id}
            onRowClick={(r) =>
              alert(`Detail pendaftar: ${r.name}\n(No. Reg: ${r.reg_no})`)
            }
            actions={{
              mode: "inline",
              onView: (r) => alert(`Lihat: ${r.name} (dummy)`),
              onEdit: (r) => alert(`Edit: ${r.name} (dummy)`),
              onDelete: (r) => alert(`Hapus: ${r.name} (dummy)`),
              headerLabel: "Aksi",
              size: "sm",
            }}
            onAdd={() => setAddOpen(true)}
            addLabel="Tambah"
            pageSize={20}
            zebra
            stickyHeader
          />
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <AddStudentDialog />
      </Dialog>

      <div className="h-6" />
    </div>
  );
}

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
