// src/pages/sekolahislamku/student/StudentMainDashboard.tsx
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* icons */
import {
  User,
  CalendarDays,
  Wallet,
  GraduationCap,
  ClipboardList,
  ListChecks,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   DEMO TOGGLE
========================================================= */
const __USE_DEMO__ = true;

/* =========================================================
   TYPES
========================================================= */
export type AnnouncementUI = {
  id: string;
  title: string;
  date: string;
  body: string;
  type?: "info" | "warning" | "success";
  slug?: string;
};

type StudentScheduleItem = {
  id: string;
  time: string; // "07:00 - 08:30"
  title: string; // "Matematika - X IPA 1"
  location?: string;
  teacher?: string;
  note?: string;
};

type StudentBillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};

type StudentAssignmentItem = {
  id: string;
  title: string;
  subject: string;
  classLabel?: string;
  dueDate: string;
  status: "pending" | "submitted" | "late";
};

type StudentGradeItem = {
  id: string;
  subject: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  date: string;
};

export type StudentHome = {
  student: {
    id: string;
    name: string;
    nis?: string;
    className: string;
    schoolName: string;
    avatarUrl?: string;
  };
  kpis: {
    todaySessions: number;
    unpaidBills: number;
    assignmentsDue: number;
    avgScore: number;
  };
  scheduleToday: StudentScheduleItem[];
  bills: StudentBillItem[];
  assignments: StudentAssignmentItem[];
  grades: StudentGradeItem[];
  announcements: AnnouncementUI[];
};

/* =========================================================
   UTILS
========================================================= */

const dateFmt = (iso: string): string => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* =========================================================
   DEMO DATA
========================================================= */
function makeDemoStudentHome(): StudentHome {
  const now = new Date();

  const addDaysISO = (days: number) =>
    new Date(now.getTime() + days * 864e5).toISOString();

  const scheduleToday: StudentScheduleItem[] = [
    {
      id: "sc1",
      time: "07:00 - 08:30",
      title: "Matematika - X IPA 1",
      location: "Ruang 201",
      teacher: "Drs. Ahmad Fauzi, M.Pd.",
      note: "Bab 2: Persamaan Kuadrat",
    },
    {
      id: "sc2",
      time: "09:00 - 10:30",
      title: "Bahasa Indonesia - X IPA 1",
      location: "Ruang 201",
      teacher: "Siti Nurhaliza, S.Pd.",
      note: "Analisis teks editorial",
    },
    {
      id: "sc3",
      time: "11:00 - 12:00",
      title: "Pembinaan Tahfidz",
      location: "Aula",
      teacher: "Ust. Ahmad",
    },
  ];

  const bills: StudentBillItem[] = [
    {
      id: "sb101",
      title: "SPP Agustus 2025",
      amount: 250_000,
      dueDate: addDaysISO(5),
      status: "unpaid",
    },
    {
      id: "sb102",
      title: "Buku Paket Semester Ganjil",
      amount: 400_000,
      dueDate: addDaysISO(10),
      status: "unpaid",
    },
  ];

  const assignments: StudentAssignmentItem[] = [
    {
      id: "as1",
      title: "PR Aljabar 1",
      subject: "Matematika",
      classLabel: "X IPA 1",
      dueDate: addDaysISO(1),
      status: "pending",
    },
    {
      id: "as2",
      title: "Tugas Teks Editorial",
      subject: "Bahasa Indonesia",
      classLabel: "X IPA 1",
      dueDate: addDaysISO(2),
      status: "pending",
    },
    {
      id: "as3",
      title: "Setoran Hafalan Juz 30",
      subject: "Tahfidz",
      classLabel: "Ekskul Tahfidz",
      dueDate: addDaysISO(3),
      status: "submitted",
    },
  ];

  const grades: StudentGradeItem[] = [
    {
      id: "gr1",
      subject: "Matematika",
      assessmentName: "UH 1 - Aljabar",
      score: 88,
      maxScore: 100,
      date: addDaysISO(-3),
    },
    {
      id: "gr2",
      subject: "Bahasa Indonesia",
      assessmentName: "Tugas 1 - Cerpen",
      score: 92,
      maxScore: 100,
      date: addDaysISO(-5),
    },
    {
      id: "gr3",
      subject: "Tahfidz",
      assessmentName: "Setoran Juz 30",
      score: 95,
      maxScore: 100,
      date: addDaysISO(-7),
    },
  ];

  const announcements: AnnouncementUI[] = [
    {
      id: "ann-st-01",
      title: "Pengambilan Raport Tengah Semester",
      date: addDaysISO(7),
      body: "Orang tua/wali diundang hadir pada hari Sabtu pukul 08:00 di kelas masing-masing.",
      type: "info",
    },
    {
      id: "ann-st-02",
      title: "Lomba Tahfidz Tingkat Sekolah",
      date: addDaysISO(12),
      body: "Peserta wajib menghafal minimal 3 surat pilihan. Pendaftaran melalui wali kelas.",
      type: "success",
    },
  ];

  const avgScore =
    grades.reduce((acc, g) => acc + g.score, 0) /
    (grades.length > 0 ? grades.length : 1);

  return {
    student: {
      id: "student-1",
      name: "Muhammad Rizki",
      nis: "2025-001",
      className: "X IPA 1",
      schoolName: "Sekolah Islamku",
    },
    kpis: {
      todaySessions: scheduleToday.length,
      unpaidBills: bills.filter((b) => b.status === "unpaid").length,
      assignmentsDue: assignments.filter((a) => a.status === "pending").length,
      avgScore: Math.round(avgScore),
    },
    scheduleToday,
    bills,
    assignments,
    grades,
    announcements,
  };
}

/* =========================================================
   API (with demo fallback)
========================================================= */
const QK = {
  STUDENT_HOME: ["student-home"] as const,
};

async function fetchStudentHome(): Promise<StudentHome> {
  if (__USE_DEMO__) return makeDemoStudentHome();
  try {
    const res = await axios.get<StudentHome>("/api/s/home", {
      withCredentials: true,
    });
    if (!res.data) return makeDemoStudentHome();
    return res.data;
  } catch (e) {
    console.warn("[student-home] API error, fallback demo", e);
    return makeDemoStudentHome();
  }
}

/* =========================================================
   SMALL UI PRIMITIVES
========================================================= */
function KpiTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 md:p-5 flex items-center gap-3">
        <span className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleCard({
  items,
  title = "Jadwal Hari Ini",
  seeAllPath,
}: {
  items: StudentScheduleItem[];
  title?: string;
  seeAllPath?: string;
}) {
  const shown = items.slice(0, 5);
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {shown.length === 0 ? (
          <div className="text-sm text-muted-foreground">Tidak ada jadwal.</div>
        ) : (
          shown.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border p-3 flex items-start gap-3"
            >
              <Badge variant="outline" className="shrink-0">
                {s.time}
              </Badge>
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {s.title}
                </div>
                {(s.location || s.teacher || s.note) && (
                  <div className="text-xs text-muted-foreground">
                    {[s.location, s.teacher, s.note]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {seeAllPath && (
          <>
            <Separator className="my-1" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = seeAllPath)}
            >
              Lihat semua jadwal
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BillsCard({
  bills,
  seeAllPath,
}: {
  bills: StudentBillItem[];
  seeAllPath?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <Wallet className="h-4 w-4" />
          </span>
          Tagihan Saya
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bills.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Tidak ada tagihan.
          </div>
        ) : (
          bills.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {b.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Jatuh tempo: {dateFmt(b.dueDate)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">{formatIDR(b.amount)}</div>
                <Button
                  size="sm"
                  className="mt-1"
                  onClick={() =>
                    (window.location.href = `/siswa/tagihan/${b.id}`)
                  }
                >
                  Bayar
                </Button>
              </div>
            </div>
          ))
        )}
        {seeAllPath && bills.length > 0 && (
          <>
            <Separator className="my-1" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = seeAllPath)}
            >
              Lihat semua tagihan
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AssignmentsCard({
  items,
  seeAllPath,
}: {
  items: StudentAssignmentItem[];
  seeAllPath?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <ClipboardList className="h-4 w-4" />
          </span>
          Tugas & Ulangan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada tugas.</div>
        ) : (
          items.slice(0, 5).map((a) => (
            <div
              key={a.id}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {a.title} — {a.subject}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.classLabel ? `${a.classLabel} • ` : ""}
                  Batas: {dateFmt(a.dueDate)}
                </div>
              </div>
              <Badge
                variant={
                  a.status === "late"
                    ? "destructive"
                    : a.status === "pending"
                    ? "outline"
                    : "default"
                }
                className="shrink-0"
              >
                {a.status === "pending"
                  ? "Belum dikumpulkan"
                  : a.status === "submitted"
                  ? "Sudah dikumpulkan"
                  : "Terlambat"}
              </Badge>
            </div>
          ))
        )}
        {seeAllPath && items.length > 0 && (
          <>
            <Separator className="my-1" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = seeAllPath)}
            >
              Lihat semua tugas
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function GradesCard({ items }: { items: StudentGradeItem[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <GraduationCap className="h-4 w-4" />
          </span>
          Nilai Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada nilai.</div>
        ) : (
          items.slice(0, 5).map((g) => (
            <div
              key={g.id}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {g.subject} — {g.assessmentName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dateFmt(g.date)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">
                  {g.score}/{g.maxScore}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function AnnouncementsCard({ items }: { items: AnnouncementUI[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <MessageSquare className="h-4 w-4" />
          </span>
          Pengumuman
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Tidak ada pengumuman.
          </div>
        ) : (
          items.slice(0, 4).map((a) => (
            <div key={a.id} className="rounded-xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium leading-tight">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {dateFmt(a.date)}
                    {a.type ? ` • ${a.type}` : ""}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    (window.location.href = a.slug
                      ? `/siswa/pengumuman/${a.slug}`
                      : `/siswa/pengumuman/${a.id}`)
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {a.body && (
                <div className="text-sm mt-2 text-foreground/90">{a.body}</div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <ListChecks className="h-4 w-4" />
          </span>
          Aksi Cepat
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/siswa/jadwal")}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Lihat Jadwal Lengkap
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = "/siswa/tagihan")}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Lihat Semua Tagihan
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = "/siswa/tugas")}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Lihat Semua Tugas
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = "/siswa/nilai")}
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Lihat Semua Nilai
        </Button>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
const StudentMainDashboard: React.FC = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: QK.STUDENT_HOME,
    queryFn: fetchStudentHome,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const [flash, setFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  if (isLoading) {
    return (
      <div className="p-6 grid gap-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-5">
          <Skeleton className="h-64 w-full md:col-span-6" />
          <Skeleton className="h-64 w-full md:col-span-6" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Tidak bisa memuat dashboard.
      </div>
    );
  }

  const s = data.student;
  const nameLine = s.nis ? `${s.name} • ${s.nis}` : s.name;

  return (
    <div className="w-full bg-background text-foreground">
      <main className="max-w-screen-2xl mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <Card className="shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full grid place-items-center bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">Siswa</div>
                <div className="text-lg font-semibold leading-tight">
                  {nameLine}
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.className} • {s.schoolName}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                Sesi hari ini: {data.kpis.todaySessions}
              </Badge>
              <Badge
                variant={data.kpis.unpaidBills > 0 ? "destructive" : "outline"}
              >
                <Wallet className="h-3.5 w-3.5 mr-1" />
                Tagihan belum lunas: {data.kpis.unpaidBills}
              </Badge>
              <Badge variant="outline">
                <ClipboardList className="h-3.5 w-3.5 mr-1" />
                Tugas pending: {data.kpis.assignmentsDue}
              </Badge>
              <Badge variant="outline">
                <GraduationCap className="h-3.5 w-3.5 mr-1" />
                Rata-rata nilai: {data.kpis.avgScore}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile
            label="Sesi Hari Ini"
            value={data.kpis.todaySessions}
            icon={<CalendarDays size={18} />}
          />
          <KpiTile
            label="Tagihan Belum Lunas"
            value={data.kpis.unpaidBills}
            icon={<Wallet size={18} />}
          />
          <KpiTile
            label="Tugas Pending"
            value={data.kpis.assignmentsDue}
            icon={<ClipboardList size={18} />}
          />
          <KpiTile
            label="Rata-rata Nilai"
            value={data.kpis.avgScore}
            icon={<GraduationCap size={18} />}
          />
        </div>

        {/* Grid utama */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          {/* Kiri */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            <ScheduleCard
              items={data.scheduleToday}
              title="Jadwal Hari Ini"
              seeAllPath="/siswa/jadwal"
            />
            <AssignmentsCard
              items={data.assignments}
              seeAllPath="/siswa/tugas"
            />
          </div>

          {/* Kanan */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            <BillsCard bills={data.bills} seeAllPath="/siswa/tagihan" />
            <GradesCard items={data.grades} />
          </div>
        </section>

        {/* Pengumuman + Aksi cepat */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnnouncementsCard items={data.announcements} />
          <QuickActions />
        </section>

        {/* Footer mini */}
        <div className="text-xs text-muted-foreground text-right">
          {isFetching ? "Menyegarkan data…" : ""}
        </div>
      </main>
    </div>
  );
};

export default StudentMainDashboard;
