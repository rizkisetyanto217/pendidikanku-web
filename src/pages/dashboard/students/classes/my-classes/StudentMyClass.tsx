// src/pages/dasboard/student/StudentMyClass.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Info } from "lucide-react";

/* Breadcrumb (opsional) */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* Data fetching */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

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

const mapEnrollmentToBadge = (s: StudentClassEnrollmentStatus): "active" | "inactive" | "pending" => {
  switch (s) {
    case "accepted":
      return "active";
    case "pending":
    case "waitlisted":
      return "pending";
    case "rejected":
    case "canceled":
    default:
      return "inactive";
  }
};


/* ============ Types dari API ============ */

type StudentClassEnrollmentStatus =
  | "pending"
  | "accepted"
  | "waitlisted"
  | "rejected"
  | "canceled";

/** Bentuk satu CSST di dalam class_section_subject_teachers */
type ClassSectionSubjectTeacherRow = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_subject_name_snapshot?: string | null;
  class_section_subject_teacher_subject_code_snapshot?: string | null;
  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;
};

export type ClassSectionRow = {
  class_section_id: string;
  class_section_name: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_code?: string;
  class_section_total_students?: number | null;
  class_section_is_active?: boolean | null;
  class_section_academic_term_id?: string | null;
  class_section_academic_term_name_snapshot?: string | null;
  class_section_academic_term_slug_snapshot?: string | null;
  class_section_academic_term_academic_year_snapshot?: string | null;
  class_section_image_url?: string | null;
  class_section_school_teacher_id?: string | null;

  class_section_subject_teachers?: ClassSectionSubjectTeacherRow[];
};

export type StudentClassEnrollmentRow = {
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

  class_sections?: ClassSectionRow[];
};

type ListResponse<T> = {
  success?: boolean;
  message: string;
  data: T[];
};

/* ===================== Page ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentMyClass({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();

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
    queryKey: ["student-my-classes-with-sections"],
    queryFn: async (): Promise<StudentClassEnrollmentRow[]> => {
      const res = await api.get<ListResponse<StudentClassEnrollmentRow>>(
        "/u/class-enrollments/list",
        {
          params: {
            student_id: "me",
            include: "class_sections,csst",
          },
        }
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

  const stats = {
    active: withSection.length,
    noSection: withoutSection.length,
    others: others.length,
  };

  /* ===== Loading / error state ===== */
  if (isLoading) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="mx-auto">
          <div className="flex items-center gap-3 mb-4">
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
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="mx-auto">
          <div className="flex items-center gap-3 mb-4">
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
        </main>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Back + title */}
        <div className="flex items-center justify-between gap-3">
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
            <div>
              <h1 className="text-lg font-semibold md:text-xl">Kelas Saya</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Lihat daftar kelas yang kamu ikuti dan rombel yang sedang aktif.
              </p>
            </div>
          </div>
        </div>

        {/* Summary + Search */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-stretch">
          <Card className="border-muted">
            <CardContent className="p-4 md:p-5 flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ringkasan
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <SummaryPill label="Kelas aktif" value={stats.active} />
                <SummaryPill
                  label="Belum punya rombel"
                  value={stats.noSection}
                />
                <SummaryPill label="Pendaftaran lain" value={stats.others} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardContent className="p-4 md:p-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Cari Kelas
              </p>
              <div className="relative w-full">
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
          </Card>
        </div>

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
            <NeedSectionCard key={row.student_class_enrollments_id} row={row} />
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
      </main>
    </div>
  );
}

/* ================= Components ================= */

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2 flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-base md:text-lg font-semibold">{value}</span>
    </div>
  );
}

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
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        {hint && (
          <Badge variant="outline" className="h-6 text-xs">
            {hint}
          </Badge>
        )}
      </div>
      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-center text-muted-foreground">
            {emptyText}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">{children}</div>
      )}
    </section>
  );
}

function ActiveEnrollmentCard({ row }: { row: StudentClassEnrollmentRow }) {
  const navigate = useNavigate();

  const name =
    row.student_class_enrollments_class_name ||
    row.student_class_enrollments_class_name_snapshot;

  const currentSection =
    row.class_sections?.find(
      (s) =>
        s.class_section_id === row.student_class_enrollments_class_section_id
    ) ?? null;

  const sectionName =
    currentSection?.class_section_name ||
    row.student_class_enrollments_class_section_name_snapshot;

  const term = row.student_class_enrollments_term_name_snapshot;
  const year = row.student_class_enrollments_term_academic_year_snapshot;

  const imageUrl = currentSection?.class_section_image_url || undefined;
  const cssts = currentSection?.class_section_subject_teachers ?? [];
  const studentsCount = currentSection?.class_section_total_students ?? null;

  const handleClickCSST = (csstId: string) => {
    navigate(`mapel/${csstId}`);
  };

  // 🔹 klik card → detail rombel (student class section detail)
  const handleOpenSectionDetail = () => {
    if (!currentSection) return;
    navigate(`rombel/${currentSection.class_section_id}`, {
      state: {
        enrollment: row,
        section: currentSection,
      },
    });
  };

  return (
    <Card
      className="overflow-hidden border-muted/80 cursor-pointer hover:bg-muted/40 hover:border-muted-foreground/60 transition"
      onClick={handleOpenSectionDetail}
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-5 p-4 md:p-5">
        {imageUrl && (
          <div className="w-full md:w-28 lg:w-32 aspect-[4/3] rounded-md overflow-hidden border bg-muted shrink-0">
            <img
              src={imageUrl}
              alt={sectionName ?? name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold truncate">
              {name}
            </h3>
            <CBadgeStatus
              status="active"
              className="h-6 text-xs"
            />

            {sectionName && (
              <Badge variant="outline" className="h-6 text-xs">
                {sectionName}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Angkatan {term} • {year}
          </p>

          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
            {studentsCount !== null && (
              <span>{studentsCount} siswa di rombel ini</span>
            )}
            {cssts.length > 0 && <span>{cssts.length} mata pelajaran</span>}
          </div>

          {cssts.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Mata pelajaran di rombel ini:
              </p>
              <div className="flex flex-wrap gap-2">
                {cssts.map((s) => {
                  const subject =
                    s.class_section_subject_teacher_subject_name_snapshot ??
                    "Mata pelajaran";
                  const code =
                    s.class_section_subject_teacher_subject_code_snapshot ?? "";
                  const teacher =
                    s.class_section_subject_teacher_school_teacher_name_snapshot ??
                    "";

                  return (
                    <button
                      key={s.class_section_subject_teacher_id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // biar nggak ikut buka detail rombel
                        handleClickCSST(s.class_section_subject_teacher_id);
                      }}
                      className="px-2.5 py-1.5 rounded-md border bg-muted/40 text-xs flex flex-col gap-0.5 text-left hover:bg-muted transition-colors"
                    >
                      <span className="font-medium leading-snug">
                        {code ? `${code} • ${subject}` : subject}
                      </span>
                      {teacher && (
                        <span className="text-[11px] text-muted-foreground">
                          {teacher}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function NeedSectionCard({ row }: { row: StudentClassEnrollmentRow }) {
  const name =
    row.student_class_enrollments_class_name ||
    row.student_class_enrollments_class_name_snapshot;
  const term = row.student_class_enrollments_term_name_snapshot;
  const year = row.student_class_enrollments_term_academic_year_snapshot;

  const navigate = useNavigate();

  const handleChooseSection = () => {
    navigate(`${row.student_class_enrollments_id}/pilih-kelas`, {
      state: {
        enrollment: row,
        sections: row.class_sections ?? [],
      },
    });
  };

  return (
    <Card className={cn("border-dashed")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{name}</span>
          <CBadgeStatus
            status="active"
            className="h-6"
          />

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

  return (
    <Card className="p-0 overflow-hidden border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{name}</span>
          <CBadgeStatus
            status={mapEnrollmentToBadge(row.student_class_enrollments_status)}
            className="h-6"
          />

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