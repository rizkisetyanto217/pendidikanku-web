// src/pages/sekolahislamku/pages/student/MyClass.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Info,
  GraduationCap,
  BookOpen,
  Activity,
  FileText,
  ClipboardList,
} from "lucide-react";

/* Breadcrumb (opsional) */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/* Data fetching */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/* ===== Helpers ===== */
const dateLong = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ============ Types dari API ============ */

type StudentClassEnrollmentStatus =
  | "pending"
  | "accepted"
  | "waitlisted"
  | "rejected"
  | "canceled";

type StudentClassEnrollmentRow = {
  student_class_enrollments_id: string;
  student_class_enrollments_class_id: string;
  student_class_enrollments_class_name: string;
  student_class_enrollments_class_name_snapshot: string;
  student_class_enrollments_class_slug_snapshot: string;
  student_class_enrollments_class_section_id: string | null;
  student_class_enrollments_class_section_name_snapshot: string | null;
  student_class_enrollments_status: StudentClassEnrollmentStatus;
  student_class_enrollments_total_due_idr: number;
  student_class_enrollments_applied_at: string;
  student_class_enrollments_accepted_at: string | null;
  student_class_enrollments_created_at: string;
  student_class_enrollments_updated_at: string;
  student_class_enrollments_term_name_snapshot: string;
  student_class_enrollments_term_academic_year_snapshot: string;
  student_class_enrollments_term_angkatan_snapshot: number;
  student_class_enrollments_username: string;
  // tambahkan field lain kalau perlu
};

type ListResponse<T> = {
  success?: boolean;
  message: string;
  data: T[];
};

/* ===================== Page ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentMyClass({ showBack = false, backTo }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const base = `/${slug}/murid`;

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* Breadcrumb/title */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader?.({
      title: "Kelas Saya",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  /* ===== Fetch data dari API ===== */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-my-classes"],
    queryFn: async (): Promise<StudentClassEnrollmentRow[]> => {
      // SESUAIKAN PATH kalau di backend kamu prefix-nya beda
      const res = await api.get<ListResponse<StudentClassEnrollmentRow>>(
        "/u/class-enrollments/list",
        { params: { student_id: "me" } }
      );
      return res.data.data ?? [];
    },
  });

  const [q, setQ] = useState("");

  // Filter by search
  const filtered = useMemo(() => {
    const rows = data ?? [];
    const key = q.trim().toLowerCase();
    if (!key) return rows;

    return rows.filter((r) => {
      const name =
        r.student_class_enrollments_class_name ||
        r.student_class_enrollments_class_name_snapshot ||
        "";
      const term = r.student_class_enrollments_term_name_snapshot || "";
      const year =
        r.student_class_enrollments_term_academic_year_snapshot || "";
      const section =
        r.student_class_enrollments_class_section_name_snapshot || "";
      return (
        name.toLowerCase().includes(key) ||
        term.toLowerCase().includes(key) ||
        year.toString().toLowerCase().includes(key) ||
        section.toLowerCase().includes(key)
      );
    });
  }, [data, q]);

  // Kelompokkan:
  const accepted = (filtered ?? []).filter(
    (r) => r.student_class_enrollments_status === "accepted"
  );

  const withSection = accepted.filter(
    (r) => !!r.student_class_enrollments_class_section_id
  );
  const withoutSection = accepted.filter(
    (r) => !r.student_class_enrollments_class_section_id
  );

  const others = (filtered ?? []).filter(
    (r) => r.student_class_enrollments_status !== "accepted"
  );

  /* ===== Loading / error state ===== */
  if (isLoading) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="w-full">
          <div className="mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
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
              <h1 className="text-lg font-semibold md:text-xl">Kelas Saya</h1>
            </div>
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Memuat daftar kelas…
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="w-full">
          <div className="mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3">
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
              <h1 className="text-lg font-semibold md:text-xl">Kelas Saya</h1>
            </div>
            <Card>
              <CardContent className="p-6 text-sm text-destructive">
                Gagal memuat kelas. Coba muat ulang halaman.
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Back + title */}
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
            <h1 className="text-lg font-semibold md:text-xl">Kelas Saya</h1>
          </div>

          {/* Search */}
          <CardContent className="md:p-5">
            <div className="relative w-full md:w-96">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kelas / angkatan / rombel…"
                className="pl-9"
              />
            </div>
          </CardContent>

          {/* ===== Section: butuh pilih rombel ===== */}
          <Section
            title="Belum Punya Rombel"
            hint={
              withoutSection.length
                ? `${withoutSection.length} kelas menunggu penempatan`
                : undefined
            }
            emptyText="Tidak ada kelas yang menunggu penempatan."
          >
            {withoutSection.map((row) => (
              <NeedSectionCard
                key={row.student_class_enrollments_id}
                row={row}
                base={base}
              />
            ))}
          </Section>

          {/* ===== Section: Kelas Aktif (sudah punya rombel) ===== */}
          <Section
            title="Kelas Aktif"
            hint={`${withSection.length} kelas`}
            emptyText="Belum ada kelas aktif."
          >
            {withSection.map((row) => (
              <ActiveEnrollmentCard
                key={row.student_class_enrollments_id}
                row={row}
                base={base}
              />
            ))}
          </Section>

          {/* ===== Section: Status lain (pending / waitlist / dst) ===== */}
          {others.length > 0 && (
            <Section
              title="Pendaftaran Lainnya"
              hint={`${others.length} pendaftaran`}
              emptyText="Tidak ada pendaftaran lain."
            >
              {others.map((row) => (
                <OtherEnrollmentCard
                  key={row.student_class_enrollments_id}
                  row={row}
                />
              ))}
            </Section>
          )}
        </div>
      </main>
    </div>
  );
}

/* ================= Components ================= */

function Section({
  title,
  hint,
  emptyText,
  children,
}: {
  title: string;
  hint?: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const isEmpty =
    React.Children.count(children) === 0 ||
    (Array.isArray(children) && children.length === 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        {hint && (
          <Badge variant="outline" className="h-6">
            {hint}
          </Badge>
        )}
      </div>
      {isEmpty ? (
        <Card>
          <CardContent className="p-6 text-sm text-center text-muted-foreground">
            {emptyText}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">{children}</div>
      )}
    </div>
  );
}

/* Kartu untuk enrollment yang SUDAH punya class_section_id */
function ActiveEnrollmentCard({
  row,
  base,
}: {
  row: StudentClassEnrollmentRow;
  base: string;
}) {
  const name =
    row.student_class_enrollments_class_name ||
    row.student_class_enrollments_class_name_snapshot;
  const sectionName = row.student_class_enrollments_class_section_name_snapshot;
  const term = row.student_class_enrollments_term_name_snapshot;
  const year = row.student_class_enrollments_term_academic_year_snapshot;

  const go = (path: string) => (window.location.href = `${base}${path}`);

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{name}</span>
          <Badge variant="secondary" className="h-6">
            AKTIF
          </Badge>
          {sectionName && (
            <Badge variant="outline" className="h-6">
              {sectionName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-5 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Angkatan {term} • {year}
          </span>
        </div>

        <div className="mt-4 border-t pt-3">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3">
                <span className="text-sm text-muted-foreground">
                  Aksi cepat
                </span>
                <ClipboardList
                  size={18}
                  className="transition-transform data-[state=open]:rotate-180"
                />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    go(
                      `/menu-utama/my-class/${row.student_class_enrollments_class_id}/kehadiran`
                    )
                  }
                  className="inline-flex gap-2"
                >
                  <Activity size={16} />
                  Kehadiran
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    go(
                      `/menu-utama/my-class/${row.student_class_enrollments_class_id}/materi`
                    )
                  }
                  className="inline-flex gap-2"
                >
                  <BookOpen size={16} />
                  Materi
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    go(
                      `/menu-utama/my-class/${row.student_class_enrollments_class_id}/tugas`
                    )
                  }
                  className="inline-flex gap-2"
                >
                  <FileText size={16} />
                  Tugas
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    go(
                      `/menu-utama/my-class/${row.student_class_enrollments_class_id}/quiz`
                    )
                  }
                  className="inline-flex gap-2"
                >
                  <ClipboardList size={16} />
                  Quiz
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${base}/kelas/${row.student_class_enrollments_class_id}/score`)
                  }
                  className="inline-flex gap-2"
                >
                  <GraduationCap size={16} />
                  Nilai
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}

/* Kartu untuk enrollment yang BELUM punya class_section_id → CTA pilih rombel */
function NeedSectionCard({
  row,
  base,
}: {
  row: StudentClassEnrollmentRow;
  base: string;
}) {
  const name =
    row.student_class_enrollments_class_name ||
    row.student_class_enrollments_class_name_snapshot;
  const term = row.student_class_enrollments_term_name_snapshot;
  const year = row.student_class_enrollments_term_academic_year_snapshot;

  const navigate = useNavigate();

  const handleChooseSection = () => {
    // Di sini kamu tinggal arahkan ke halaman "Pilih Rombel"
    // yang nanti menampilkan daftar class_sections berdasarkan enrollment ini.
    // Contoh route (silakan sesuaikan):
    navigate(
      `${base}/menu-utama/enrollments/${row.student_class_enrollments_id}/pilih-kelas`
    );
  };

  return (
    <Card className={cn("border-dashed")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{name}</span>
          <Badge variant="outline" className="h-6">
            DITERIMA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-5 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Angkatan {term} • {year}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5" />
            <span>
              Kamu sudah diterima di kelas ini, tetapi belum ditempatkan di
              rombel (kelas paralel). Silakan pilih rombel yang tersedia.
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleChooseSection}
            className="inline-flex gap-2"
          >
            Pilih Rombel / Gabung Kelas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* Kartu untuk status selain accepted (pending, waitlist, dst) */
function OtherEnrollmentCard({ row }: { row: StudentClassEnrollmentRow }) {
  const name =
    row.student_class_enrollments_class_name ||
    row.student_class_enrollments_class_name_snapshot;
  const term = row.student_class_enrollments_term_name_snapshot;
  const year = row.student_class_enrollments_term_academic_year_snapshot;

  const statusLabel = row.student_class_enrollments_status.toUpperCase();

  return (
    <Card className="p-0 overflow-hidden border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{name}</span>
          <Badge variant="outline" className="h-6">
            {statusLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 md:px-5 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            Angkatan {term} • {year}
          </span>
          <span>
            • Diajukan: {dateLong(row.student_class_enrollments_applied_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}