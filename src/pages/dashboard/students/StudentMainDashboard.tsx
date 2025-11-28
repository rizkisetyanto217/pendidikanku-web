// src/pages/dashboard/students/StudentMainDashboard.tsx

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* modal + form */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

/* Dashboard schedule generic component */
import {
  DashboardScheduleCard,
  type DashboardScheduleItem,
  type DashboardScheduleParticipantState,
} from "@/pages/dashboard/components/card/schedule/CCardScheduleDashboard";

/* =========================================================
   DEMO TOGGLE
========================================================= */
const __USE_DEMO__ = true;

/* =========================================================
   TYPES — UI LEVEL
========================================================= */
export type AnnouncementUI = {
  id: string;
  title: string;
  date: string;
  body: string;
  type?: "info" | "warning" | "success";
  slug?: string;
};

// alias, biar kebaca ini schedule khusus student
type StudentScheduleItem = DashboardScheduleItem;

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
   RAW ATTENDANCE API TYPES (khusus di file ini saja)
========================================================= */

type AttendanceSessionAPIItem = {
  session: {
    class_attendance_session_id: string;
    class_attendance_session_date: string;
    class_attendance_session_starts_at: string | null;
    class_attendance_session_ends_at: string | null;
    class_attendance_session_display_title?: string | null;
    class_attendance_session_subject_name_snapshot?: string | null;
    class_attendance_session_section_name_snapshot?: string | null;
    class_attendance_session_csst_snapshot?: any;
  };
  participant?: {
    participant_id: string;
    participant_state: string; // "unknown" | "present" | ...
  };
};

type AttendanceSessionsResponse = {
  success: boolean;
  message: string;
  data: AttendanceSessionAPIItem[];
};

/* =========================================================
   ATTENDANCE STATUS TYPE (sesuai enum Go)
========================================================= */

type AttendancePostStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "sick"
  | "leave"
  | "unmarked";

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

const formatSchoolTeacherName = (st?: {
  name?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
}): string | undefined => {
  if (!st) return undefined;

  const parts: string[] = [];

  if (st.title_prefix) {
    parts.push(st.title_prefix); // "Ustadz"
  }

  if (st.name) {
    parts.push(st.name); // "Hendra"
  }

  let base = parts.join(" ");

  if (!base && st.name) {
    base = st.name;
  }

  if (base && st.title_suffix) {
    // "Ustadz Hendra, Lc"
    return `${base}, ${st.title_suffix}`;
  }

  return base || undefined;
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const timeFmt = (iso: string | null): string => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "-";
  }
};

const isSameLocalDay = (iso: string, base: Date = new Date()): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    d.getFullYear() === base.getFullYear() &&
    d.getMonth() === base.getMonth() &&
    d.getDate() === base.getDate()
  );
};

/* =========================================================
   DEMO DATA
========================================================= */
function makeDemoStudentHome(): StudentHome {
  const now = new Date();

  const addDaysISO = (days: number) =>
    new Date(now.getTime() + days * 864e5).toISOString();

  // scheduleToday dikosongkan — jadwal utama dari attendance API
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
      schoolName: "Madinah Salam",
    },
    kpis: {
      todaySessions: 0, // demo aja, KPI asli dari backend
      unpaidBills: bills.filter((b) => b.status === "unpaid").length,
      assignmentsDue: assignments.filter((a) => a.status === "pending").length,
      avgScore: Math.round(avgScore),
    },
    scheduleToday: [],
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
  STUDENT_ATTENDANCE_TODAY: ["student-attendance-today"] as const,
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

/**
 * Fetch attendance sessions (week range),
 * mapping ke DashboardScheduleItem, sort berdasarkan waktu,
 * dan nanti di kartu di-limit max 5 (items.slice(0,5)).
 */
async function fetchStudentAttendanceThisWeek(): Promise<
  DashboardScheduleItem[]
> {
  const res = await axios.get<AttendanceSessionsResponse>(
    "/api/u/attendance-sessions/list",
    {
      params: {
        student_timeline: 1,
        mode: "compact",
        range: "week",
      },
      withCredentials: true,
    }
  );

  if (!res.data?.success || !Array.isArray(res.data.data)) {
    return [];
  }

  // Sort jadwal pekan ini berdasarkan waktu mulai (terdekat dulu)
  const sorted = [...res.data.data].sort((a, b) => {
    const sa =
      a.session.class_attendance_session_starts_at ??
      a.session.class_attendance_session_date;
    const sb =
      b.session.class_attendance_session_starts_at ??
      b.session.class_attendance_session_date;

    return new Date(sa).getTime() - new Date(sb).getTime();
  });

  const today = new Date();

  // Map ke DashboardScheduleItem
  return sorted.map<DashboardScheduleItem>((row) => {
    const s = row.session;
    const csst = s.class_attendance_session_csst_snapshot || {};
    const teacherName =
      formatSchoolTeacherName(csst.school_teacher) ||
      csst.teacher_name ||
      undefined;

    const subjectName =
      s.class_attendance_session_subject_name_snapshot ||
      csst.subject_name ||
      csst.subject?.name ||
      "Pertemuan";

    const sectionName =
      s.class_attendance_session_section_name_snapshot ||
      csst.section_name ||
      csst.class_section?.name ||
      "";

    const title =
      sectionName && sectionName !== subjectName
        ? `${subjectName} — ${sectionName}`
        : subjectName;

    const startLabel = timeFmt(s.class_attendance_session_starts_at);
    const endLabel = timeFmt(s.class_attendance_session_ends_at);
    const time =
      startLabel !== "-" && endLabel !== "-"
        ? `${startLabel} - ${endLabel}`
        : startLabel !== "-"
        ? startLabel
        : "-";

    const state = (row.participant?.participant_state ||
      "unknown") as DashboardScheduleParticipantState;

    let stateLabel: string | undefined;
    switch (state) {
      case "present":
        stateLabel = "Sudah absen: Hadir";
        break;
      case "late":
        stateLabel = "Sudah absen: Terlambat";
        break;
      case "absent":
        stateLabel = "Sudah absen: Tidak hadir";
        break;
      case "sick":
        stateLabel = "Sakit";
        break;
      case "excused":
        stateLabel = "Izin / dimaafkan";
        break;
      case "leave":
        stateLabel = "Cuti / keperluan lain";
        break;
      case "unknown":
      default:
        stateLabel = "Belum ada data absensi";
        break;
    }

    const isToday = isSameLocalDay(s.class_attendance_session_date, today);
    const canAttendNow = isToday && state === "unknown";

    return {
      id: s.class_attendance_session_id,
      date: s.class_attendance_session_date,
      time,
      location: undefined,
      teacher: teacherName,
      title,
      note: stateLabel,
      isToday,
      canAttendNow,
      participantState: state,
    };
  });
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
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: isLoadingHome,
    isFetching: isFetchingHome,
  } = useQuery({
    queryKey: QK.STUDENT_HOME,
    queryFn: fetchStudentHome,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: attendanceThisWeek,
    isLoading: isLoadingAttendance,
    isFetching: isFetchingAttendance,
  } = useQuery({
    queryKey: QK.STUDENT_ATTENDANCE_TODAY,
    queryFn: fetchStudentAttendanceThisWeek,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const [flash, setFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ===== Modal absensi state =====
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceSession, setAttendanceSession] =
    useState<DashboardScheduleItem | null>(null);
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendancePostStatus>("present");
  const [attendanceReason, setAttendanceReason] = useState("");
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  if (isLoadingHome) {
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

  // Jadwal di kartu: jadwal terdekat pekan ini, limit 5 (dibatasi di DashboardScheduleCard)
  const scheduleTodayEffective: DashboardScheduleItem[] =
    attendanceThisWeek && attendanceThisWeek.length > 0
      ? attendanceThisWeek
      : data.scheduleToday;

  // KPI "Sesi Hari Ini": ikut hasil attendance API kalau ada, fallback ke backend
  const todaySessionsFromAttendance =
    attendanceThisWeek?.filter((item) => item.isToday).length ?? 0;
  const todaySessionsCount =
    attendanceThisWeek && attendanceThisWeek.length > 0
      ? todaySessionsFromAttendance
      : data.kpis.todaySessions;

  const openAttendanceModal = (item: DashboardScheduleItem) => {
    setAttendanceSession(item);
    setAttendanceStatus("present");
    setAttendanceReason("");
    setAttendanceModalOpen(true);
  };

  const statusOptions: { value: AttendancePostStatus; label: string }[] = [
    { value: "present", label: "Hadir" },
    { value: "late", label: "Terlambat" },
    { value: "absent", label: "Tidak hadir" },
    { value: "excused", label: "Izin / dimaafkan" },
    { value: "sick", label: "Sakit" },
    { value: "leave", label: "Cuti / keperluan lain" },
  ];

  const handleSubmitAttendance = async () => {
    if (!attendanceSession) return;

    // reason wajib kalau bukan "present"
    if (
      attendanceStatus !== "present" &&
      attendanceStatus !== "unmarked" &&
      !attendanceReason.trim()
    ) {
      setFlash({
        type: "error",
        msg: "Mohon isi alasan pada kolom penjelasan.",
      });
      return;
    }

    setIsSubmittingAttendance(true);
    try {
      await axios.post(
        "/api/u/attendance-participants",
        {
          attendance: {
            class_attendance_session_participant_session_id:
              attendanceSession.id,
            class_attendance_session_participant_kind: "student",

            // 🔥 PENTING: pakai *_state, bukan *_status
            class_attendance_session_participant_state: attendanceStatus,

            // 🔥 PENTING: pakai *_user_note, bukan *_reason
            class_attendance_session_participant_user_note:
              attendanceReason.trim() || null,
          },
          urls: [],
        },
        { withCredentials: true }
      );

      setFlash({
        type: "success",
        msg: "Absensi berhasil disimpan.",
      });
      setAttendanceModalOpen(false);
      setAttendanceSession(null);

      // refresh jadwal + KPI
      queryClient.invalidateQueries({ queryKey: QK.STUDENT_ATTENDANCE_TODAY });
      queryClient.invalidateQueries({ queryKey: QK.STUDENT_HOME });
    } catch (err) {
      console.error(err);
      setFlash({
        type: "error",
        msg: "Gagal menyimpan absensi. Silakan coba lagi.",
      });
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const modalDateLabel =
    attendanceSession?.date && attendanceSession.date !== ""
      ? dateFmt(attendanceSession.date)
      : "";

  return (
    <div className="w-full bg-background text-foreground">
      <main className="max-w-screen-2xl mx-auto py-6 px-4 space-y-6">
        {/* Flash message */}
        {flash && (
          <div
            className={`text-sm rounded-md border px-3 py-2 ${
              flash.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {flash.msg}
          </div>
        )}

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
                Sesi hari ini: {todaySessionsCount}
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
            value={todaySessionsCount}
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
            <DashboardScheduleCard
              items={scheduleTodayEffective}
              title="Jadwal Terdekat Pekan Ini"
              seeAllPath="/siswa/jadwal"
              loading={isLoadingAttendance}
              primaryActionLabel="Absensi sekarang"
              onPrimaryAction={openAttendanceModal}
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
          {isFetchingHome || isFetchingAttendance ? "Menyegarkan data…" : ""}
        </div>
      </main>

      {/* Modal Absensi */}
      <Dialog
        open={attendanceModalOpen}
        onOpenChange={(open) => {
          setAttendanceModalOpen(open);
          if (!open) {
            setAttendanceSession(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Absensi</DialogTitle>
            <DialogDescription>
              Pilih status kehadiran dan jelaskan jika kamu tidak hadir atau
              terlambat.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {attendanceSession && (
              <div className="rounded-md bg-muted/60 p-3 text-sm space-y-1">
                <div className="font-medium">{attendanceSession.title}</div>
                <div className="text-xs text-muted-foreground">
                  {modalDateLabel && `${modalDateLabel} • `}
                  {attendanceSession.time}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Status kehadiran</Label>
              <RadioGroup
                value={attendanceStatus}
                onValueChange={(val) =>
                  setAttendanceStatus(val as AttendancePostStatus)
                }
                className="grid grid-cols-2 gap-2"
              >
                {statusOptions.map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={`att-${opt.value}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer hover:bg-muted"
                  >
                    <RadioGroupItem id={`att-${opt.value}`} value={opt.value} />
                    <span>{opt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {attendanceStatus !== "present" && (
              <div className="space-y-2">
                <Label>
                  Penjelasan{" "}
                  <span className="text-[11px] text-muted-foreground">
                    (wajib diisi jika tidak hadir / terlambat)
                  </span>
                </Label>
                <Textarea
                  rows={3}
                  value={attendanceReason}
                  onChange={(e) => setAttendanceReason(e.target.value)}
                  placeholder="Tuliskan alasanmu di sini..."
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setAttendanceModalOpen(false)}
              disabled={isSubmittingAttendance}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitAttendance}
              disabled={isSubmittingAttendance}
            >
              {isSubmittingAttendance ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentMainDashboard;
