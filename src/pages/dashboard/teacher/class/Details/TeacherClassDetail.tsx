// src/pages/sekolahislamku/teacher/DetailClass.tsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  CheckCircle2,
} from "lucide-react";

/* ========== Types ========== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
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

type CsstItem = {
  id: string;
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room?: string;
  isActive: boolean;
  enrolled: number;
  nextTopic?: string;
};

/* ========== Helpers ========== */
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

/* ========== DUMMY DATA (penuh) ========== */
const NOW = new Date();
const mkISO = (addDays = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + addDays);
  return d.toISOString();
};

const DUMMY_CLASS: TeacherClassSummary = {
  id: "kelas-uuid-dummy",
  name: "TPA A",
  room: "Aula 1",
  homeroom: "Ustadz Abdullah",
  assistants: ["Ustadzah Amina"],
  studentsCount: 24,
  todayAttendance: { hadir: 20, online: 1, sakit: 1, izin: 1, alpa: 1 },
  nextSession: {
    dateISO: mkISO(0),
    time: "07:30",
    title: "Tahsin — Tajwid & Makhraj",
    room: "Aula 1",
  },
  materialsCount: 12,
  assignmentsCount: 4,
  academicTerm: "2025/2026 — Ganjil",
  cohortYear: 2025,
};

const DUMMY_CSST: CsstItem[] = [
  {
    id: "csst-1",
    subject: "Fiqih Dasar",
    teacher: "Ustadz Abdullah",
    day: "Senin",
    time: "07:30",
    room: "Aula 1",
    isActive: true,
    enrolled: 24,
    nextTopic: "Thaharah (Bersuci)",
  },
  {
    id: "csst-2",
    subject: "Tahfiz Juz 30",
    teacher: "Ustadzah Maryam",
    day: "Selasa",
    time: "09:30",
    room: "R. Tahfiz",
    isActive: true,
    enrolled: 22,
    nextTopic: "An-Naba 1–10",
  },
  {
    id: "csst-3",
    subject: "Bahasa Arab",
    teacher: "Ustadz Salman",
    day: "Rabu",
    time: "10:15",
    room: "Lab Bahasa",
    isActive: true,
    enrolled: 18,
    nextTopic: "Fi'il Madhi",
  },
  {
    id: "csst-4",
    subject: "Aqidah Akhlak",
    teacher: "Ustadz Abu Bakar",
    day: "Kamis",
    time: "13:00",
    room: "R. 101",
    isActive: false,
    enrolled: 0,
    nextTopic: "Sifat Wajib bagi Allah",
  },
  {
    id: "csst-5",
    subject: "Sirah Nabawiyah",
    teacher: "Ustadzah Amina",
    day: "Jumat",
    time: "14:00",
    room: "Aula 2",
    isActive: false,
    enrolled: 0,
    nextTopic: "Perjalanan Nabi ke Thaif",
  },
];

/* Mode enrolment dummy */
type CsstMode = "self_select" | "assigned" | "hybrid";
const csstModeLabel: Record<CsstMode, string> = {
  self_select: "Self-select",
  assigned: "Assigned",
  hybrid: "Hybrid",
};
const CSST_MODE: CsstMode = "self_select";
const CSST_NEED_APPROVAL = false;
const CSST_MAX_SUBJECTS = 3;
const CSST_SWITCH_DEADLINE = new Date(
  NOW.getFullYear(),
  NOW.getMonth() + 1,
  15,
  17,
  0
).toISOString();

/* ========== Component ========== */
export default function TeacherCSSTDetail() {
  const navigate = useNavigate();

  // hitung ringkasan dari dummy
  const activeCount = useMemo(
    () => DUMMY_CSST.filter((x) => x.isActive).length,
    []
  );
  const totalStudents = DUMMY_CLASS.studentsCount;
  const hadir = DUMMY_CLASS.todayAttendance.hadir ?? 0;

  const quick = [
    {
      key: "murid",
      label: "Jumlah Murid",
      metric: totalStudents.toString(),
      icon: <Users className="h-4 w-4" />,
      to: "murid",
      aria: "Lihat daftar murid",
    },
    {
      key: "kehadiran",
      label: "Kehadiran Hari Ini",
      metric: `${hadir}/${totalStudents}`,
      icon: <ClipboardList className="h-4 w-4" />,
      to: "absensi-hari-ini",
      aria: "Lihat kehadiran hari ini",
    },
    {
      key: "materi",
      label: "Materi",
      metric: `${DUMMY_CLASS.materialsCount}`,
      icon: <BookOpen className="h-4 w-4" />,
      to: "materi",
      aria: "Lihat materi",
    },
    {
      key: "tugas",
      label: "Tugas",
      metric: `${DUMMY_CLASS.assignmentsCount}`,
      icon: <ClipboardCheck className="h-4 w-4" />,
      to: "tugas",
      aria: "Lihat tugas",
    },
    {
      key: "ujian",
      label: "Ujian",
      metric: `${DUMMY_CLASS.assignmentsCount}`,
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
      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
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
                  {DUMMY_CLASS.name || <Skeleton className="h-5 w-48" />}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{DUMMY_CLASS.room ?? "-"}</Badge>
                  <span>Wali Kelas: {DUMMY_CLASS.homeroom ?? "—"}</span>
                  <span>• {DUMMY_CLASS.academicTerm ?? "—"}</span>
                  <span>• Angkatan {DUMMY_CLASS.cohortYear ?? "—"}</span>
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

          {/* ===== CSST Overview ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ringkasan CSST (Section × Subject × Teacher)
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    CSST Aktif
                  </div>
                  <div className="text-xl font-semibold">
                    {activeCount}/{DUMMY_CSST.length}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    Mode Enrolment
                  </div>
                  <div className="text-sm">
                    <Badge variant="outline">{csstModeLabel[CSST_MODE]}</Badge>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    Self-select butuh approval
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{CSST_NEED_APPROVAL ? "Ya" : "Tidak"}</span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">
                    Maks. Mapel per Siswa
                  </div>
                  <div className="text-xl font-semibold">
                    {CSST_MAX_SUBJECTS}
                  </div>
                </Card>
              </div>

              <div className="mt-3 rounded-xl border p-3 bg-card text-sm">
                Tenggat ganti pilihan:{" "}
                <b>
                  {new Date(CSST_SWITCH_DEADLINE).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </b>
              </div>
            </CardContent>
          </Card>

          {/* ===== Daftar Mapel (CSST) — menonjol ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Daftar Mapel (CSST)
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
                {DUMMY_CSST.map((m) => (
                  <Card
                    key={m.id}
                    className={`p-4 transition ${
                      m.isActive ? "ring-1 ring-primary/30" : ""
                    } hover:shadow-md cursor-pointer`}
                    // contoh rute detail csst; aman walau belum ada
                    onClick={() => navigate(`csst/${m.id}`)}
                    aria-label={`Buka mapel ${m.subject}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {m.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Guru: {m.teacher}
                        </div>
                      </div>
                      <Badge
                        variant={m.isActive ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {m.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="h-3 w-3" />
                      <span>
                        {m.day} • {m.time}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>{m.nextTopic}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-[10px] flex items-center gap-1"
                      >
                        {m.room ?? "-"}
                      </Badge>
                      <div className="text-sm">
                        <Users className="h-3 w-3 inline mr-1" />
                        {m.enrolled}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
              {DUMMY_CLASS.nextSession ? (
                <div className="rounded-xl border p-3 bg-card">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>
                      {dateShort(DUMMY_CLASS.nextSession.dateISO)} •{" "}
                      {DUMMY_CLASS.nextSession.time}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    {DUMMY_CLASS.nextSession.title}
                    {DUMMY_CLASS.nextSession.room
                      ? ` • ${DUMMY_CLASS.nextSession.room}`
                      : ""}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Belum ada jadwal.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
