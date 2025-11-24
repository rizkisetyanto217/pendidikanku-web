import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, CalendarDays, BookOpen, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import type {
  StudentClassEnrollmentRow,
  ClassSectionRow,
} from "../StudentMyClass";

// kalau API punya field group_url, kita tampung di sini
type SectionWithMeta = ClassSectionRow & {
  class_section_group_url?: string | null;
};

/** CSST view model untuk kartu mapel */
type CsstItem = {
  id: string;
  subject: string;
  code?: string;
  teacher?: string;
  // untuk sementara jadikan placeholder; bisa diisi dari jadwal kalau sudah ada di API
  day?: string;
  time?: string;
  room?: string;
  isActive: boolean;
  enrolled: number;
  nextTopic?: string;
};

type LocationState = {
  enrollment: StudentClassEnrollmentRow;
  section: ClassSectionRow;
};

export default function StudentClassSection() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setHeader } = useDashboardHeader();

  const { enrollment, section } = (state ?? {}) as LocationState;

  // guard kalau halaman diakses tanpa state (misal refresh direct)
  const hasData = !!enrollment && !!section;

  const sectionData = section as SectionWithMeta;

  const studentsCount = sectionData.class_section_total_students ?? 0;
  const termName = enrollment?.student_class_enrollments_term_name_snapshot;
  const year =
    enrollment?.student_class_enrollments_term_academic_year_snapshot;

  const csstItems: CsstItem[] = useMemo(() => {
    const list = sectionData.class_section_subject_teachers ?? [];
    return list.map((csst) => ({
      id: csst.class_section_subject_teacher_id,
      subject:
        csst.class_section_subject_teacher_subject_name_snapshot ??
        "Mata pelajaran",
      code:
        csst.class_section_subject_teacher_subject_code_snapshot ?? undefined,
      teacher:
        csst.class_section_subject_teacher_school_teacher_name_snapshot ??
        undefined,
      // placeholder jadwal/room
      day: undefined,
      time: undefined,
      room: undefined,
      isActive: true,
      enrolled: studentsCount,
      nextTopic: undefined,
    }));
  }, [sectionData, studentsCount]);

  useEffect(() => {
    if (!hasData) return;

    const className =
      enrollment.student_class_enrollments_class_name ||
      enrollment.student_class_enrollments_class_name_snapshot;

    setHeader?.({
      title: "Detail Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya", href: "../" },
        { label: className || "Detail Kelas" },
      ],
      actions: null,
      showBack: true,
    });
  }, [setHeader, hasData, enrollment]);

  const handleBack = () => navigate(-1);

  if (!hasData) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="w-full">
          <div className="mx-auto flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Detail Kelas</h1>
            </div>
            <Card>
              <CardContent className="p-6 text-sm text-destructive">
                Data kelas tidak tersedia. Coba kembali ke halaman "Kelas Saya"
                lalu buka detail kelas dari sana.
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const className =
    enrollment.student_class_enrollments_class_name ||
    enrollment.student_class_enrollments_class_name_snapshot;

  const sectionName = sectionData.class_section_name;
  const groupUrl = sectionData.class_section_group_url || undefined;

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Top bar (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Detail Kelas</h1>
          </div>

          {/* Header */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-lg md:text-xl font-semibold truncate">
                    {className || <Skeleton className="h-5 w-48" />}
                  </div>
                  {sectionName && (
                    <Badge variant="outline" className="text-xs h-6">
                      {sectionName}
                    </Badge>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Angkatan {termName} • {year}
                  </span>
                  <span>• {studentsCount} siswa di rombel ini</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== Overview cards ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ringkasan Rombel
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {/* Jumlah Murid */}
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>Jumlah Murid</span>
                  </div>

                  <div className="text-xl font-semibold mt-1">
                    {studentsCount}
                  </div>
                </Card>

                {/* Grup WhatsApp (opsional kalau ada link) */}
                {groupUrl && (
                  <Card
                    className="p-4 cursor-pointer transition hover:shadow-md"
                    onClick={() => window.open(groupUrl, "_blank")}
                  >
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>Grup WhatsApp Kelas</span>
                    </div>

                    <div className="text-md font-semibold mt-1 underline">
                      Buka Link
                    </div>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ===== Daftar Mapel (CSST) ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Daftar Mapel di Rombel Ini
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              {csstItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Belum ada mata pelajaran yang terdaftar di rombel ini.
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {csstItems.map((m) => (
                    <Card
                      key={m.id}
                      className="p-4 transition hover:shadow-md cursor-pointer"
                      onClick={() => navigate(`../mapel/${m.id}`)}
                      aria-label={`Buka mapel ${m.subject}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {m.code ? `${m.code} • ${m.subject}` : m.subject}
                          </div>
                          {m.teacher && (
                            <div className="text-xs text-muted-foreground truncate">
                              Guru: {m.teacher}
                            </div>
                          )}
                        </div>
                        <Badge variant="default" className="text-[10px]">
                          Aktif
                        </Badge>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-3 w-3" />
                        <span>
                          {m.day && m.time
                            ? `${m.day} • ${m.time}`
                            : "Jadwal belum diatur"}
                        </span>
                      </div>

                      {m.nextTopic && (
                        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                          <BookOpen className="h-3 w-3" />
                          <span>{m.nextTopic}</span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-[10px] flex items-center gap-1"
                        >
                          {m.room ?? "Ruang belum diatur"}
                        </Badge>
                        <div className="text-sm">
                          <Users className="h-3 w-3 inline mr-1" />
                          {m.enrolled}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
