// src/pages/ParentChildDetail.tsx
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  Hash,
  School,
  ArrowLeft,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ===================== Types (Diploma Ilmi) ===================== */

type Meeting = {
  day: "Sen" | "Sel" | "Rab" | "Kam" | "Jum" | "Sab" | "Min";
  start: string; // "07:30"
  end: string; // "09:10"
  room?: string;
  mode?: "onsite" | "online" | "hybrid";
};

type Lecturer = {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
  sks: number;
  semester: number;
  meetings: Meeting[];
  lecturer: Lecturer;
  attendanceStats: {
    hadir: number;
    total: number;
  };
  grade?: {
    // nilai akhir mata kuliah
    letter: "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "E" | "-";
    score?: number; // 0-100
  };
  assignments: {
    id: string;
    title: string;
    dueISO: string;
    status: "not_submitted" | "submitted" | "graded";
    score?: number;
  }[];
  exams: {
    type: "UTS" | "UAS" | "Quiz";
    dateISO: string;
    room?: string;
  }[];
};

type ProgramSummary = {
  programName: string; // "Diploma Ilmi"
  faculty: string; // "Fakultas Adab"
  studyPlan: {
    semester: number;
    sksTaken: number;
    sksCompleted: number;
    maxSks: number;
  };
  gpa: number; // IPK
  ips?: number; // Semester running IPS
  completionPct: number; // progress kurikulum
};


type ProgramDetail = {
  student: {
    id: string;
    name: string;
    nim: string;
    avatar_url?: string;
    cohort: string; // "2024"
  };
  summary: ProgramSummary;
  todayNote?: {
    info: string;
  };
  weeklySchedule: Course[]; // duplikasi array courses; fokus ke meetings
  courses: Course[];
};

/* ===================== Helpers ===================== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "-";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    })
    : "-";

const pct = (n: number) => Math.max(0, Math.min(100, n));

/* ===================== Fake API (dummy diploma) ===================== */
async function fetchProgramDetail(): Promise<ProgramDetail> {
  // buat data realistis diploma: 5 MK, total sks 18
  const mk = (partial: Partial<Course>): Course => ({
    id: crypto.randomUUID(),
    code: "UNK-000",
    name: "Mata Kuliah",
    sks: 3,
    semester: 1,
    meetings: [],
    lecturer: {
      id: crypto.randomUUID(),
      name: "Dosen",
      title: "M.Ag",
      email: "dosen@kampus.ac.id",
      phone: "+62 812-1234-5678",
    },
    attendanceStats: { hadir: 6, total: 8 },
    grade: { letter: "-", score: undefined },
    assignments: [],
    exams: [],
    ...partial,
  });

  const courses: Course[] = [
    mk({
      code: "BG101",
      name: "Balaghah Dasar",
      sks: 3,
      semester: 1,
      lecturer: {
        id: "t1",
        name: "Ust. Hendra",
        title: "Lc",
        email: "hendra@kampus.ac.id",
        phone: "+62 812-1111-2222",
      },
      meetings: [
        {
          day: "Sen",
          start: "07:30",
          end: "09:10",
          room: "A-201",
          mode: "onsite",
        },
        {
          day: "Rab",
          start: "07:30",
          end: "09:10",
          room: "A-201",
          mode: "onsite",
        },
      ],
      assignments: [
        {
          id: "bg-a1",
          title: "Analisis Majaz",
          dueISO: "2025-11-15T05:00:00Z",
          status: "submitted",
          score: 88,
        },
        {
          id: "bg-a2",
          title: "Ringkasan Bab 2",
          dueISO: "2025-11-22T05:00:00Z",
          status: "not_submitted",
        },
      ],
      exams: [{ type: "UTS", dateISO: "2025-12-10T01:00:00Z", room: "A-301" }],
    }),
    mk({
      code: "NA102",
      name: "Nahwu Lanjutan",
      sks: 4,
      semester: 1,
      lecturer: {
        id: "t2",
        name: "Ust. Ali",
        title: "M.A.",
        email: "ali@kampus.ac.id",
        phone: "+62 812-3333-4444",
      },
      meetings: [
        {
          day: "Sel",
          start: "09:20",
          end: "11:00",
          room: "B-105",
          mode: "onsite",
        },
      ],
      attendanceStats: { hadir: 7, total: 8 },
      assignments: [
        {
          id: "na-a1",
          title: "I'rab Teks",
          dueISO: "2025-11-18T05:00:00Z",
          status: "graded",
          score: 92,
        },
      ],
      exams: [{ type: "Quiz", dateISO: "2025-11-20T02:00:00Z", room: "B-105" }],
    }),
    mk({
      code: "SH103",
      name: "Sharf Terapan",
      sks: 3,
      semester: 1,
      lecturer: {
        id: "t3",
        name: "Ust. Faris",
        title: "M.Ag",
        email: "faris@kampus.ac.id",
      },
      meetings: [
        {
          day: "Kam",
          start: "07:30",
          end: "09:10",
          room: "C-002",
          mode: "hybrid",
        },
      ],
      assignments: [
        {
          id: "sh-a1",
          title: "Tabel Wazan",
          dueISO: "2025-11-25T05:00:00Z",
          status: "not_submitted",
        },
      ],
    }),
    mk({
      code: "UL104",
      name: "Ulum Al-Qur'an",
      sks: 4,
      semester: 1,
      lecturer: {
        id: "t4",
        name: "Ust. Salman",
        title: "M.Ag",
        email: "salman@kampus.ac.id",
      },
      meetings: [
        {
          day: "Jum",
          start: "13:00",
          end: "15:30",
          room: "Masjid Kampus",
          mode: "onsite",
        },
      ],
      attendanceStats: { hadir: 5, total: 8 },
      grade: { letter: "A-", score: 90 },
    }),
    mk({
      code: "KB105",
      name: "Keterampilan Bahasa",
      sks: 4,
      semester: 1,
      lecturer: {
        id: "t5",
        name: "Ust. Zaki",
        title: "M.Hum",
        email: "zaki@kampus.ac.id",
      },
      meetings: [
        {
          day: "Sab",
          start: "09:00",
          end: "11:30",
          room: "Lab Bahasa",
          mode: "onsite",
        },
      ],
      attendanceStats: { hadir: 8, total: 8 },
      grade: { letter: "A", score: 95 },
      exams: [
        { type: "UAS", dateISO: "2026-01-08T02:00:00Z", room: "Lab Bahasa" },
      ],
    }),
  ];

  const totalSks = courses.reduce((a, c) => a + c.sks, 0);

  return {
    student: {
      id: "s1",
      name: "Ahmad Fauzi",
      nim: "24.11.0001",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80",
      cohort: "2024",
    },
    summary: {
      programName: "Diploma Ilmi",
      faculty: "Fakultas Adab & Humaniora",
      studyPlan: {
        semester: 1,
        sksTaken: totalSks,
        sksCompleted: 12,
        maxSks: 24,
      },
      gpa: 3.82,
      ips: 3.76,
      completionPct: 35,
    },
    todayNote: {
      info: "Perkuliahan berjalan normal. Persiapan UTS pekan depan untuk beberapa MK.",
    },
    weeklySchedule: courses,
    courses,
  };
}

/* ===================== Page ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };


export default function StudentProgress({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const { data } = useQuery({
    queryKey: ["diploma-program-detail"],
    queryFn: fetchProgramDetail,
    staleTime: 60_000,
  });

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Progress",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Progress" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const s = data?.student;
  const sum = data?.summary;

  const totalHadir = (data?.courses ?? []).reduce(
    (acc, c) => acc + (c.attendanceStats?.hadir ?? 0),
    0
  );
  const totalSesi = (data?.courses ?? []).reduce(
    (acc, c) => acc + (c.attendanceStats?.total ?? 0),
    0
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
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
            <h1 className="font-semibold text-lg md:text-xl">Progress Akademik</h1>
          </div>
          {/* ==== Header: Identitas Mahasiswa & Ringkas Program ==== */}
          <Card>
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={s?.avatar_url} alt={s?.name} />
                    <AvatarFallback>
                      {s?.name
                        ?.split(" ")
                        .map((x) => x[0])
                        .join("") || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg flex items-center gap-2">
                      {s?.name ?? "—"}
                      <Badge variant="outline">{s?.nim}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <School size={14} /> {sum?.programName}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap size={14} /> Angkatan {s?.cohort}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="inline-flex items-center gap-1">
                        <BookOpen size={14} /> Semester{" "}
                        {sum?.studyPlan.semester}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                  <Link to="khs" className="w-full md:w-auto">
                    <Button
                      size="sm"
                      className="w-full md:w-auto inline-flex gap-2"
                    >
                      <FileSpreadsheet size={16} /> KHS (Nilai Semester)
                    </Button>
                  </Link>
                  <Link to="transkrip" className="w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto inline-flex gap-2"
                    >
                      <Hash size={16} /> Transkrip (IPK)
                    </Button>
                  </Link>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="bg-card/60">
                  <CardContent className="p-3">
                    <div className="text-sm text-muted-foreground">
                      SKS Diambil
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {sum?.studyPlan.sksTaken ?? "-"} /{" "}
                      {sum?.studyPlan.maxSks ?? "-"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/60">
                  <CardContent className="p-3">
                    <div className="text-sm text-muted-foreground">
                      SKS Lulus
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {sum?.studyPlan.sksCompleted ?? "-"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/60">
                  <CardContent className="p-3">
                    <div className="text-sm text-muted-foreground">IPK</div>
                    <div className="mt-1 text-lg font-semibold">
                      {sum?.gpa?.toFixed(2) ?? "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      IPS: {sum?.ips?.toFixed(2) ?? "-"}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/60">
                  <CardContent className="p-3">
                    <div className="text-sm text-muted-foreground">
                      Progress Kurikulum
                    </div>
                    <div className="mt-2">
                      <Progress value={pct(sum?.completionPct ?? 0)} />
                      <div className="mt-1 text-sm text-muted-foreground">
                        {pct(sum?.completionPct ?? 0)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* === Info Hari Ini (opsional) === */}
          {data?.todayNote && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  Ringkasan Hari Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/90">
                {data.todayNote.info}
              </CardContent>
            </Card>
          )}

          {/* ==== Tabs Akademik ==== */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="courses">Mata Kuliah</TabsTrigger>
              <TabsTrigger value="grades">Nilai & IPS</TabsTrigger>
              <TabsTrigger value="tasks">Tugas & Ujian</TabsTrigger>
            </TabsList>

            {/* === Mata Kuliah === */}
            <TabsContent value="courses" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    Daftar Mata Kuliah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-center">SKS</TableHead>
                        <TableHead>Dosen</TableHead>
                        <TableHead className="text-center">Kehadiran</TableHead>
                        <TableHead className="text-center">Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.courses ?? []).map((c) => {
                        const presentPct = Math.round(
                          ((c.attendanceStats?.hadir ?? 0) /
                            Math.max(1, c.attendanceStats?.total ?? 1)) *
                          100
                        );
                        return (
                          <TableRow key={c.id} className="align-top">
                            <TableCell className="font-medium">
                              {c.code}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Semester {c.semester} •{" "}
                                {c.meetings.map((m) => m.day).join(", ")}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {c.sks}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={c.lecturer.avatar_url} />
                                  <AvatarFallback>
                                    {c.lecturer.name
                                      .split(" ")
                                      .map((x) => x[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {c.lecturer.title
                                    ? `${c.lecturer.name}, ${c.lecturer.title}`
                                    : c.lecturer.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="text-sm tabular-nums">
                                {c.attendanceStats.hadir}/
                                {c.attendanceStats.total}
                              </div>
                              <Progress value={presentPct} className="mt-1" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  c.grade?.letter && c.grade.letter !== "-"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  c.grade?.letter && c.grade.letter !== "-"
                                    ? "bg-green-600"
                                    : ""
                                }
                              >
                                {c.grade?.letter ?? "-"}
                              </Badge>
                              {typeof c.grade?.score === "number" && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {c.grade.score}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Nilai & IPS === */}
            <TabsContent value="grades" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileSpreadsheet size={18} className="text-primary" />
                    Rekap Nilai Semester
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode</TableHead>
                        <TableHead>Mata Kuliah</TableHead>
                        <TableHead className="text-center">SKS</TableHead>
                        <TableHead className="text-center">
                          Nilai Angka
                        </TableHead>
                        <TableHead className="text-center">
                          Nilai Huruf
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.courses ?? []).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.code}
                          </TableCell>
                          <TableCell>{c.name}</TableCell>
                          <TableCell className="text-center">{c.sks}</TableCell>
                          <TableCell className="text-center">
                            {typeof c.grade?.score === "number"
                              ? c.grade?.score
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                c.grade?.letter && c.grade.letter !== "-"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                c.grade?.letter && c.grade.letter !== "-"
                                  ? "bg-green-600"
                                  : ""
                              }
                            >
                              {c.grade?.letter ?? "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          IPS (Semester ini)
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                          {sum?.ips?.toFixed(2) ?? "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          IPK (Kumulatif)
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                          {sum?.gpa?.toFixed(2) ?? "-"}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          Kehadiran Total
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                          {totalHadir}/{totalSesi}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Tugas & Ujian === */}
            <TabsContent value="tasks" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tugas */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <ClipboardList size={18} className="text-primary" />
                      Tugas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mata Kuliah</TableHead>
                          <TableHead>Judul</TableHead>
                          <TableHead className="text-center">Batas</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.courses ?? []).flatMap((c) =>
                          c.assignments.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">
                                {c.name}
                              </TableCell>
                              <TableCell>{a.title}</TableCell>
                              <TableCell className="text-center">
                                {dateShort(a.dueISO)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    a.status === "graded"
                                      ? "default"
                                      : a.status === "submitted"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className={
                                    a.status === "graded" ? "bg-green-600" : ""
                                  }
                                >
                                  {a.status === "graded"
                                    ? "Dinilai"
                                    : a.status === "submitted"
                                      ? "Terkumpul"
                                      : "Belum"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {typeof a.score === "number" ? a.score : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Ujian */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <ClipboardList size={18} className="text-primary" />
                      Ujian (UTS/UAS/Quiz)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Mata Kuliah</TableHead>
                          <TableHead className="text-center">Tanggal</TableHead>
                          <TableHead className="text-center">Ruang</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.courses ?? []).flatMap((c) =>
                          c.exams.map((e, idx) => (
                            <TableRow key={c.id + idx}>
                              <TableCell className="font-medium">
                                {e.type}
                              </TableCell>
                              <TableCell>{c.name}</TableCell>
                              <TableCell className="text-center">
                                {dateLong(e.dateISO)}
                              </TableCell>
                              <TableCell className="text-center">
                                {e.room ?? "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer ringkas total */}
          <div className="text-xs text-muted-foreground text-center">
            Total kehadiran: {totalHadir}/{totalSesi} • &nbsp;Mata kuliah aktif:{" "}
            {(data?.courses ?? []).length}
          </div>
        </div>
      </main>
    </div>
  );
}
