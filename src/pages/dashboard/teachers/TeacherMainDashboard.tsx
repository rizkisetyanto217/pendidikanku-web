// src/pages/dashboard/teachers/TeacherMainDashboard.tsx
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
  Users,
  CalendarDays,
  BookOpen,
  CheckCheck,
  ClipboardList,
  ArrowRight,
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
   TYPES
========================================================= */
export type TeacherScheduleItem = {
  id: string;
  startISO: string;
  endISO: string;
  timeText?: string; // computed
  subject: string;
  sectionName: string; // e.g., "X IPA 1"
  room?: string;
  mode?: "offline" | "online" | "hybrid";
  note?: string;
  day?: string;
};

export type AttendanceTodoItem = {
  sessionId: string;
  dateISO: string;
  subject: string;
  sectionName: string;
  status: "pending" | "submitted";
};

export type GradingQueueItem = {
  id: string;
  title: string; // e.g., "Ulangan Harian 1"
  subject: string;
  sectionName: string;
  dueISO?: string;
  toGradeCount: number;
};

export type MyClassItem = {
  csstId: string;
  subject: string;
  sectionName: string;
  studentCount: number;
  room?: string;
  slug?: string;
};

export type AnnouncementUI = {
  id: string;
  title: string;
  date: string;
  body: string;
  type?: "info" | "warning" | "success";
  slug?: string;
};

export type TeacherHome = {
  teacher: {
    id: string;
    name: string;
    titlePrefix?: string;
    titleSuffix?: string;
    avatarUrl?: string;
    schoolName: string;
  };
  kpis: {
    classesTaught: number;
    sessionsToday: number;
    attendancePending: number;
    gradingPending: number;
  };
  todaySchedule: TeacherScheduleItem[];
  attendanceTodos: AttendanceTodoItem[];
  gradingQueue: GradingQueueItem[];
  myClasses: MyClassItem[];
  announcements: AnnouncementUI[];
  inboxUnread: number;
};

/* =========================================================
   RAW ATTENDANCE API TYPES (timeline guru)
========================================================= */
type AttendanceSessionAPIItem = {
  session: {
    class_attendance_session_id: string;
    class_attendance_session_date: string;
    class_attendance_session_starts_at: string | null;
    class_attendance_session_ends_at: string | null;

    // ⬇️ tambahin ini (sama seperti di student)
    class_attendance_session_title?: string | null;
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
   UTILS
========================================================= */
const pad2 = (n: number) => String(n).padStart(2, "0");
const yyyyMmDdLocal = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const timeRangeText = (startISO: string, endISO: string): string => {
  try {
    const s = new Date(startISO).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const e = new Date(endISO).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${s} - ${e}`;
  } catch {
    return "";
  }
};

const dateFmt = (iso?: string): string => {
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

const dayName = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { weekday: "long" });
  } catch {
    return "";
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
    parts.push(st.title_prefix);
  }

  if (st.name) {
    parts.push(st.name);
  }

  let base = parts.join(" ");

  if (!base && st.name) {
    base = st.name;
  }

  if (base && st.title_suffix) {
    return `${base}, ${st.title_suffix}`;
  }

  return base || undefined;
};

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
function makeDemoTeacherHome(): TeacherHome {
  const now = new Date();
  const today = yyyyMmDdLocal(now);
  const mkISO = (h: number, m: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  // ↓ contoh jadwal demo (bukan dari API timeline)
  const rawSchedule = [
    {
      id: "s1",
      startISO: mkISO(7, 0),
      endISO: mkISO(8, 30),
      subject: "Matematika",
      sectionName: "X IPA 1",
      room: "Ruang 201",
      mode: "offline",
      note: "Bab 2: Persamaan Kuadrat",
    },
    {
      id: "s2",
      startISO: mkISO(9, 0),
      endISO: mkISO(10, 30),
      subject: "Bahasa Indonesia",
      sectionName: "X IPA 1",
      room: "Ruang 201",
      mode: "hybrid",
      note: "Analisis teks editorial",
    },
    {
      id: "s3",
      startISO: mkISO(11, 0),
      endISO: mkISO(12, 0),
      subject: "Pembinaan Tahfidz",
      sectionName: "Ekskul Tahfidz",
      room: "Aula",
      mode: "offline",
    },
  ] satisfies Array<Omit<TeacherScheduleItem, "timeText">>;

  const todaySchedule: TeacherScheduleItem[] = rawSchedule.map((it) => ({
    ...it,
    timeText: timeRangeText(it.startISO, it.endISO),
    day: dayName(it.startISO),
  }));

  const attendanceTodos: AttendanceTodoItem[] = [
    {
      sessionId: "att-1001",
      dateISO: today,
      subject: "Matematika",
      sectionName: "X IPA 1",
      status: "pending",
    },
    {
      sessionId: "att-1002",
      dateISO: today,
      subject: "Bahasa Indonesia",
      sectionName: "X IPA 1",
      status: "pending",
    },
  ];

  const gradingQueue: GradingQueueItem[] = [
    {
      id: "gq-01",
      title: "UH 1 - Aljabar",
      subject: "Matematika",
      sectionName: "X IPA 1",
      dueISO: new Date(now.getTime() + 2 * 864e5).toISOString(),
      toGradeCount: 28,
    },
    {
      id: "gq-02",
      title: "Tugas 2 - Teks Editorial",
      subject: "Bahasa Indonesia",
      sectionName: "X IPA 1",
      dueISO: new Date(now.getTime() + 4 * 864e5).toISOString(),
      toGradeCount: 27,
    },
  ];

  const myClasses: MyClassItem[] = [
    {
      csstId: "csst-1",
      subject: "Matematika",
      sectionName: "X IPA 1",
      studentCount: 28,
      room: "Ruang 201",
      slug: "x-ipa-1-matematika",
    },
    {
      csstId: "csst-2",
      subject: "Bahasa Indonesia",
      sectionName: "X IPA 1",
      studentCount: 28,
      room: "Ruang 201",
      slug: "x-ipa-1-bahasa-indonesia",
    },
    {
      csstId: "csst-3",
      subject: "Ekskul Tahfidz",
      sectionName: "Ekskul Tahfidz",
      studentCount: 20,
      room: "Aula",
      slug: "ekskul-tahfidz",
    },
  ];

  const announcements: AnnouncementUI[] = [
    {
      id: "ann-01",
      title: "Rapat Kurikulum Jumat, 15 Nov 2025",
      date: now.toISOString(),
      body: "Dimulai pukul 13:30 di Ruang Rapat Lt.2. Harap hadir tepat waktu.",
      type: "info",
    },
    {
      id: "ann-02",
      title: "Deadline Nilai Tengah Semester",
      date: new Date(now.getTime() + 5 * 864e5).toISOString(),
      body: "Mohon input nilai minimal 70% sebelum Senin depan.",
      type: "warning",
    },
  ];

  return {
    teacher: {
      id: "u-teacher-1",
      name: "Ahmad Fauzi",
      titlePrefix: "Drs.",
      titleSuffix: "M.Pd.",
      schoolName: "",
    },
    kpis: {
      classesTaught: myClasses.length,
      sessionsToday: todaySchedule.length,
      attendancePending: attendanceTodos.filter((t) => t.status === "pending")
        .length,
      gradingPending: gradingQueue.reduce((a, b) => a + b.toGradeCount, 0),
    },
    todaySchedule,
    attendanceTodos,
    gradingQueue,
    myClasses,
    announcements,
    inboxUnread: 3,
  };
}

/* =========================================================
   API (dengan fallback demo)
========================================================= */
const QK = {
  TEACHER_HOME: ["teacher-home"] as const,
  TEACHER_ATTENDANCE_WEEK: ["teacher-attendance-week"] as const,
};

async function fetchTeacherHome(): Promise<TeacherHome> {
  if (__USE_DEMO__) return makeDemoTeacherHome();
  try {
    const res = await axios.get<TeacherHome>("/api/t/home", {
      withCredentials: true,
    });
    if (!res.data) return makeDemoTeacherHome();
    const withComputed: TeacherHome = {
      ...res.data,
      todaySchedule: (res.data.todaySchedule ?? []).map((it) => ({
        ...it,
        timeText: it.timeText ?? timeRangeText(it.startISO, it.endISO),
      })),
    };
    return withComputed;
  } catch (e) {
    console.warn("[teacher-home] API error, fallback demo", e);
    return makeDemoTeacherHome();
  }
}

/**
 * Fetch attendance sessions (week range) untuk GURU,
 * mapping ke DashboardScheduleItem, sort berdasarkan waktu,
 * dan nanti di kartu di-limit max 5 (di DashboardScheduleCard).
 */
async function fetchTeacherAttendanceThisWeek(): Promise<
  DashboardScheduleItem[]
> {
  const res = await axios.get<AttendanceSessionsResponse>(
    "/api/u/attendance-sessions/list",
    {
      params: {
        teacher_timeline: 1,
        mode: "compact",
        range: "week",
      },
      withCredentials: true,
    }
  );

  if (!res.data?.success || !Array.isArray(res.data.data)) {
    return [];
  }

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

  return sorted.map<DashboardScheduleItem>((row) => {
    const s = row.session;
    const csst = s.class_attendance_session_csst_snapshot || {};

    // (kalau nanti mau dipakai, tetap disiapkan)
    const teacherBase =
      formatSchoolTeacherName(csst.school_teacher) ||
      csst.teacher_name ||
      undefined;

    // ⬇️ sama seperti student: prioritaskan session_title
    const sessionTitle =
      s.class_attendance_session_title ||
      s.class_attendance_session_display_title ||
      null;

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

    // judul besar card: "Ilmu Balaghoh Dasar pertemuan ke-8"
    const title =
      sessionTitle ||
      (sectionName && sectionName !== subjectName
        ? `${subjectName} — ${sectionName}`
        : subjectName);

    // ⬇️ sub-text di bawah judul:
    // untuk guru: "Kelas Balaghoh Menengah A • Ilmu Balaghoh Dasar"
    const teacherDisplay =
      sectionName && subjectName
        ? `${sectionName} • ${subjectName}`
        : sectionName || subjectName || teacherBase || undefined;

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
      case "absent":
        stateLabel = "Sudah absen: Tidak hadir";
        break;
      case "late":
        stateLabel = "Sudah absen: Terlambat";
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
    const canAttendNow = false; // di dashboard guru tetap non-klik untuk absen

    return {
      id: s.class_attendance_session_id,
      date: s.class_attendance_session_date,
      time,
      location: undefined,
      teacher: teacherDisplay, // ⬅️ ini yang nongol di bawah judul
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

function AttendanceTodoCard({
  items,
  onOpen,
}: {
  items: AttendanceTodoItem[];
  onOpen?: (sessionId: string) => void;
}) {
  const pending = items.filter((t) => t.status === "pending");
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <ClipboardList className="h-4 w-4" />
          </span>
          Perlu Absen Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Tidak ada sesi yang perlu diabsen.
          </div>
        ) : (
          pending.map((t) => (
            <div
              key={t.sessionId}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {t.subject} — {t.sectionName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dateFmt(t.dateISO)}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() =>
                  onOpen
                    ? onOpen(t.sessionId)
                    : (window.location.href = `/teacher/sessions/${t.sessionId}/attendance`)
                }
              >
                Buka Absen
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function MyClassesCard({
  items,
  seeAllPath,
}: {
  items: MyClassItem[];
  seeAllPath?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          Kelas yang Diajar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada kelas.</div>
        ) : (
          items.slice(0, 6).map((c) => (
            <div
              key={c.csstId}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium leading-tight truncate">
                  {c.subject} — {c.sectionName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.studentCount} siswa
                  {c.room ? ` • ${c.room}` : ""}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = c.slug
                    ? `/guru/guru-mapel/${c.slug}`
                    : `/guru/guru-mapel/${c.csstId}`)
                }
              >
                Detail <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
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
              Lihat semua kelas
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */
const TeacherMainDashboard: React.FC = () => {
  const {
    data,
    isLoading,
    isFetching: isFetchingHome,
  } = useQuery({
    queryKey: QK.TEACHER_HOME,
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: attendanceThisWeek,
    isLoading: isLoadingAttendance,
    isFetching: isFetchingAttendance,
  } = useQuery({
    queryKey: QK.TEACHER_ATTENDANCE_WEEK,
    queryFn: fetchTeacherAttendanceThisWeek,
    staleTime: 30_000,
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

  const t = data.teacher;
  const nameFull = `${t.titlePrefix ? t.titlePrefix + " " : ""}${t.name}${
    t.titleSuffix ? ", " + t.titleSuffix : ""
  }`;

  // Jadwal di kartu: dari attendance timeline guru; kalau kosong, fallback ke todaySchedule backend
  const scheduleFromTimeline: DashboardScheduleItem[] =
    attendanceThisWeek && attendanceThisWeek.length > 0
      ? attendanceThisWeek
      : [];

  let scheduleItems: DashboardScheduleItem[] = scheduleFromTimeline;

  if (scheduleItems.length === 0 && data.todaySchedule?.length) {
    scheduleItems = data.todaySchedule.map<DashboardScheduleItem>((s) => {
      const time = s.timeText ?? timeRangeText(s.startISO, s.endISO);
      const date = s.startISO;
      const isToday = isSameLocalDay(s.startISO);
      return {
        id: s.id,
        date,
        time,
        title: `${s.subject} — ${s.sectionName}`,
        location: s.room,
        teacher: undefined,
        isToday,
      };
    });
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto py-6 space-y-6">
        {/* Header */}
        <Card className="shadow-sm">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-full grid place-items-center bg-primary/10 text-primary">
                <User className="w-6 h-6" />
              </span>
              <div>
                <div className="text-sm text-muted-foreground">Guru</div>
                <div className="text-lg font-semibold leading-tight">
                  {nameFull}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.schoolName}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <Users className="h-3.5 w-3.5 mr-1" />
                Kelas diajar: {data.kpis.classesTaught}
              </Badge>
              <Badge variant="outline">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                Sesi hari ini: {data.kpis.sessionsToday}
              </Badge>
              <Badge variant="destructive">
                <ClipboardList className="h-3.5 w-3.5 mr-1" />
                Absen pending: {data.kpis.attendancePending}
              </Badge>
              <Badge variant="outline">
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Perlu dinilai: {data.kpis.gradingPending}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile
            label="Kelas Diajar"
            value={data.kpis.classesTaught}
            icon={<BookOpen size={18} />}
          />
          <KpiTile
            label="Sesi Hari Ini"
            value={data.kpis.sessionsToday}
            icon={<CalendarDays size={18} />}
          />
          <KpiTile
            label="Absen Pending"
            value={data.kpis.attendancePending}
            icon={<ClipboardList size={18} />}
          />
          <KpiTile
            label="Butuh Penilaian"
            value={data.kpis.gradingPending}
            icon={<CheckCheck size={18} />}
          />
        </div>

        {/* Grid utama */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          {/* Kiri */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            <MyClassesCard items={data.myClasses} seeAllPath={`guru-mapel`} />

            <AttendanceTodoCard
              items={data.attendanceTodos}
              onOpen={(sid) =>
                (window.location.href = `/teacher/sessions/${sid}/attendance`)
              }
            />
          </div>

          {/* Kanan */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            <DashboardScheduleCard
              items={scheduleItems}
              title="Jadwal Mengajar Pekan Ini"
              seeAllPath="jadwal/agenda"
              loading={isLoadingAttendance}
              primaryActionLabel="Buka"
              onPrimaryAction={(item) => {
                window.location.href = `/teacher/sessions/${item.id}`;
              }}
            />
          </div>
        </section>

        {/* Footer mini */}
        <div className="text-xs text-muted-foreground text-right">
          {isFetchingHome || isFetchingAttendance ? "Menyegarkan data…" : ""}
        </div>
      </main>
    </div>
  );
};

export default TeacherMainDashboard;
