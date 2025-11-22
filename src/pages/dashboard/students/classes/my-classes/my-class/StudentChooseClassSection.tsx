// src/pages/dashboard/students/classes/my-classes/my-class/StudentChooseClassSection.tsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, MapPin, UserCircle2, Info } from "lucide-react";

/* Breadcrumb */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* Data fetching */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

/* ============ Types ============ */

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
  student_class_enrollments_status: StudentClassEnrollmentStatus;
  student_class_enrollments_term_name_snapshot: string;
  student_class_enrollments_term_academic_year_snapshot: string;
};

type ClassSectionRow = {
  class_sections_id: string;
  class_sections_name: string;
  class_sections_slug: string;
  class_sections_capacity?: number | null;
  class_sections_current_students?: number | null;
  class_sections_is_default?: boolean | null;
  class_sections_homeroom_teacher_name_snapshot?: string | null;
  class_sections_room_name_snapshot?: string | null;
  // tambah field lain kalau ada di API-mu
};

type ListResponse<T> = {
  success?: boolean;
  message: string;
  data: T[];
};

type DetailResponse<T> = {
  success?: boolean;
  message: string;
  data: T;
};

/* ===================== Page ===================== */

export default function StudentChooseClassSection() {
  const { slug, enrollment_id } = useParams<{
    slug: string;
    enrollment_id: string;
  }>();

  const navigate = useNavigate();
  const base = `/${slug}/murid`;
  const qc = useQueryClient();

  const handleBack = () => navigate(-1);

  /* Breadcrumb/title */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader?.({
      title: "Pilih Rombel",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya", href: `${slug}/murid/menu-utama/my-class` },
        { label: "Pilih Rombel" },
      ],
      showBack: true,
    });
  }, [setHeader, slug]);

  /* 1) Ambil detail enrollment (buat tahu class_id & nama kelas) */
  const {
    data: enrollment,
    isLoading: loadingEnrollment,
    isError: errorEnrollment,
  } = useQuery({
    queryKey: ["student-enrollment-detail", enrollment_id],
    enabled: !!enrollment_id,
    queryFn: async (): Promise<StudentClassEnrollmentRow> => {
      // SESUAIKAN endpoint detail enrollment di backend kamu
      const res = await api.get<DetailResponse<StudentClassEnrollmentRow>>(
        "/u/class-enrollments/detail",
        {
          params: { enrollment_id },
        }
      );
      return res.data.data;
    },
  });

  const classId = enrollment?.student_class_enrollments_class_id;

  /* 2) Ambil daftar class_sections dari class_id */
  const {
    data: sections,
    isLoading: loadingSections,
    isError: errorSections,
  } = useQuery({
    queryKey: ["class-sections-by-class", classId],
    enabled: !!classId,
    queryFn: async (): Promise<ClassSectionRow[]> => {
      // SESUAIKAN endpoint list class section
      const res = await api.get<ListResponse<ClassSectionRow>>(
        "/u/class-sections/list",
        { params: { class_id: classId } }
      );
      return res.data.data ?? [];
    },
  });

  /* 3) Mutation: join ke class_section tertentu */
  const joinMutation = useMutation({
    mutationFn: async (classSectionId: string) => {
      // SESUAIKAN endpoint join rombel di backendmu
      return api.post("/u/class-enrollments/join-class-section", {
        enrollment_id,
        class_section_id: classSectionId,
      });
    },
    onSuccess: () => {
      // Refresh data MyClass biar langsung ke-update
      qc.invalidateQueries({ queryKey: ["student-my-classes"] });

      // Bisa diarahkan kembali ke halaman Kelas Saya
      navigate(`${base}/menu-utama/my-class`);
    },
  });

  const isLoading = loadingEnrollment || loadingSections;

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Back + title */}
          <div className="flex gap-3 items-center">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="cursor-pointer self-start"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold md:text-xl">Pilih Rombel</h1>
              {enrollment && (
                <p className="text-sm text-muted-foreground">
                  {enrollment.student_class_enrollments_class_name ||
                    enrollment.student_class_enrollments_class_name_snapshot}{" "}
                  • Angkatan{" "}
                  {enrollment.student_class_enrollments_term_name_snapshot} (
                  {
                    enrollment.student_class_enrollments_term_academic_year_snapshot
                  }
                  )
                </p>
              )}
            </div>
          </div>

          {/* Info status loading / error */}
          {isLoading && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Memuat data kelas dan rombel…
              </CardContent>
            </Card>
          )}

          {errorEnrollment && (
            <Card>
              <CardContent className="p-6 text-sm text-destructive">
                Gagal memuat data pendaftaran. Coba kembali ke halaman Kelas
                Saya.
              </CardContent>
            </Card>
          )}

          {errorSections && !loadingSections && (
            <Card>
              <CardContent className="p-6 text-sm text-destructive">
                Gagal memuat daftar rombel. Coba muat ulang halaman.
              </CardContent>
            </Card>
          )}

          {/* Daftar rombel */}
          {!isLoading && sections && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold">
                  Pilih Rombel
                </h2>
                <Badge variant="outline" className="h-6">
                  {sections.length} rombel tersedia
                </Badge>
              </div>

              {sections.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-center text-muted-foreground">
                    Belum ada rombel yang tersedia untuk kelas ini. Silakan
                    hubungi admin / wali kelas.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {sections.map((s) => (
                    <ClassSectionCard
                      key={s.class_sections_id}
                      section={s}
                      onJoin={() => joinMutation.mutate(s.class_sections_id)}
                      joining={joinMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ================= Components ================= */

function ClassSectionCard({
  section,
  onJoin,
  joining,
}: {
  section: ClassSectionRow;
  onJoin: () => void;
  joining: boolean;
}) {
  const capacity = section.class_sections_capacity ?? undefined;
  const current = section.class_sections_current_students ?? 0;
  const homeroom = section.class_sections_homeroom_teacher_name_snapshot;
  const room = section.class_sections_room_name_snapshot;

  const isFull = capacity !== undefined && capacity > 0 && current >= capacity;

  return (
    <Card
      className={cn(
        "p-0 overflow-hidden",
        isFull && "opacity-80 border-dashed"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{section.class_sections_name}</span>
          {section.class_sections_is_default && (
            <Badge variant="secondary" className="h-6">
              Rombel Utama
            </Badge>
          )}
          {isFull && (
            <Badge variant="outline" className="h-6">
              PENUH
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-5 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>
              {current}
              {capacity ? ` / ${capacity}` : ""} siswa
            </span>
          </div>

          {homeroom && (
            <div className="flex items-center gap-1">
              <UserCircle2 size={14} />
              <span>Wali: {homeroom}</span>
            </div>
          )}

          {room && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{room}</span>
            </div>
          )}
        </div>

        {isFull && (
          <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
            <Info size={14} className="mt-0.5" />
            <span>
              Rombel ini sudah penuh. Kamu bisa memilih rombel lain yang masih
              tersedia.
            </span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={joining || isFull}
            onClick={onJoin}
            className="inline-flex gap-2"
          >
            {joining ? "Memproses..." : "Gabung ke Rombel Ini"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}