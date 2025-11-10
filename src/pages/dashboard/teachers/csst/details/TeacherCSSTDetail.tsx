// src/pages/sekolahislamku/teacher/DetailClass.tsx
import { useMemo } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* icons */
import {
  Users,
  CalendarDays,
  Clock,
  ClipboardList,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  UserSquare2,
} from "lucide-react";

/* ===== Helpers & Types ===== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    })
    : "-";

type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

/* ===== Dummy fetch ===== */
import {
  fetchStudentsByClasses,
  type ClassStudentsMap,
  type StudentSummary,
} from "../types/teacherClass";

async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  const now = new Date();
  const mk = (d: Date, addDay = 0) => {
    const x = new Date(d);
    x.setDate(x.getDate() + addDay);
    return x.toISOString();
  };
  return [
    {
      id: "tpa-a",
      name: "TPA A",
      room: "Aula 1",
      homeroom: "Ustadz Abdullah",
      assistants: ["Ustadzah Amina"],
      studentsCount: 22,
      todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 0),
        time: "07:30",
        title: "Tahsin — Tajwid & Makhraj",
        room: "Aula 1",
      },
      materialsCount: 12,
      assignmentsCount: 4,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-b",
      name: "TPA B",
      room: "R. Tahfiz",
      homeroom: "Ustadz Salman",
      assistants: ["Ustadzah Maryam"],
      studentsCount: 20,
      todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 1),
        time: "09:30",
        title: "Hafalan Juz 30",
        room: "R. Tahfiz",
      },
      materialsCount: 9,
      assignmentsCount: 3,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-c",
      name: "TPA C",
      room: "Aula 2",
      homeroom: "Ustadz Abu Bakar",
      assistants: [],
      studentsCount: 18,
      todayAttendance: { hadir: 14, online: 0, sakit: 2, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 2),
        time: "08:00",
        title: "Latihan Makhraj",
        room: "Aula 2",
      },
      materialsCount: 7,
      assignmentsCount: 2,
      academicTerm: "2024/2025 — Genap",
      cohortYear: 2024,
    },
  ];
}

/* ===== Query Keys ===== */
const QK = {
  CLASSES: ["teacher-classes-list"] as const,
  CLASS_STUDENTS: (id: string) => ["teacher-class-students", id] as const,
};

/* ===== Page ===== */
type LocationState = {
  academicTerm?: string;
  cohortYear?: number;
  clsOverride?: Partial<TeacherClassSummary>;
};

export default function TeacherCSSTDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };

  // 1) Kelas
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: QK.CLASSES,
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });

  // Ambil dari API dulu; kalau tidak ada, pakai state override dari list
  const cls = useMemo<TeacherClassSummary | undefined>(() => {
    const found = classes.find((c) => c.id === id);
    if (found) return found;

    const ov = location.state?.clsOverride;
    if (!ov) return undefined;

    return {
      id: ov.id ?? id,
      name: ov.name ?? "—",
      room: ov.room ?? "-",
      homeroom: "—",
      assistants: ov.assistants ?? [],
      studentsCount: ov.studentsCount ?? 0,
      todayAttendance: ov.todayAttendance ?? {
        hadir: 0,
        online: 0,
        sakit: 0,
        izin: 0,
        alpa: 0,
      },
      nextSession: ov.nextSession,
      materialsCount: ov.materialsCount ?? 0,
      assignmentsCount: ov.assignmentsCount ?? 0,
      academicTerm: ov.academicTerm ?? location.state?.academicTerm ?? "—",
      cohortYear:
        ov.cohortYear ?? location.state?.cohortYear ?? new Date().getFullYear(),
    };
  }, [classes, id, location.state]);

  // 2) Siswa per kelas
  const { data: studentsMap = {}, isLoading: isLoadingStudents } = useQuery({
    queryKey: QK.CLASS_STUDENTS(id),
    queryFn: () => fetchStudentsByClasses(id ? [id] : []),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const students: StudentSummary[] =
    (studentsMap as ClassStudentsMap)[id] ?? [];

  // 3) Angka untuk kartu
  const fallbackTotal = cls?.studentsCount ?? 0;
  const total = students.length || fallbackTotal;
  const hadir = cls?.todayAttendance?.hadir ?? 0;

  const loadingAny = isLoadingClasses || isLoadingStudents;

  // 4) Quick links (relative to /guru/kelas/:id)
  const quick = [
    {
      key: "murid",
      label: "Jumlah Murid",
      metric: total.toString(),
      icon: <Users className="h-4 w-4" />,
      to: "murid",
      aria: "Lihat daftar murid",
    },
    {
      key: "kehadiran",
      label: "Kehadiran Hari Ini",
      metric: `${hadir}/${total || 0}`,
      icon: <ClipboardList className="h-4 w-4" />,
      to: "absensi-hari-ini",
      aria: "Lihat kehadiran hari ini",
    },
    {
      key: "materi",
      label: "Materi",
      metric: `${cls?.materialsCount ?? 0}`,
      icon: <BookOpen className="h-4 w-4" />,
      to: "materi",
      aria: "Lihat materi",
    },
    {
      key: "tugas",
      label: "Tugas",
      metric: `${cls?.assignmentsCount ?? 0}`,
      icon: <ClipboardCheck className="h-4 w-4" />,
      to: "tugas",
      aria: "Lihat tugas",
    },
    {
      key: "ujian",
      label: "Ujian",
      metric: `${cls?.assignmentsCount ?? 0}`,
      icon: <GraduationCap className="h-4 w-4" />,
      to: "ujian",
      aria: "Lihat ujian",
    },
    {
      key: "buku",
      label: "Buku",
      metric: "-",
      icon: <BookOpen className="h-4 w-4" />,
      to: "buku",
      aria: "Lihat buku kelas",
    },
    {
      key: "profil",
      label: "Profil",
      metric: "-",
      icon: <UserSquare2 className="h-4 w-4" />,
      to: "profil",
      aria: "Lihat profil kelas",
    },
  ] as const;

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full md:py-8">
        <div className="mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Detail Kelas</h1>
          </div>

          {/* Header */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-semibold">
                  {loadingAny ? (
                    <Skeleton className="h-5 w-48" />
                  ) : (
                    cls?.name ?? "—"
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{cls?.room ?? "-"}</Badge>
                  <span>Wali Kelas: {cls?.homeroom ?? "—"}</span>
                  <span>• {cls?.academicTerm ?? "—"}</span>
                  <span>• Angkatan {cls?.cohortYear ?? "—"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link to="absensi-hari-ini">
                  <Button size="sm" variant="secondary">
                    Absensi Hari Ini <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="buku">
                  <Button size="sm">
                    Buku Kelas <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {quick.map((q) => (
              <Card
                key={q.key}
                className="cursor-pointer transition hover:shadow-md"
                onClick={() => navigate(q.to)}
                aria-label={q.aria}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {q.icon}
                      <span>{q.label}</span>
                    </div>
                    <div className="text-xl font-semibold">{q.metric}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Jadwal terdekat */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Jadwal Terdekat
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              {cls?.nextSession ? (
                <div className="rounded-xl border p-3 bg-card">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {dateShort(cls.nextSession.dateISO)} •{" "}
                      {cls.nextSession.time}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    {cls.nextSession.title}
                    {cls.nextSession.room ? ` • ${cls.nextSession.room}` : ""}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Belum ada jadwal.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Empty state bila benar-benar tak ketemu */}
          {!loadingAny && !cls && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Kelas tidak ditemukan.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
