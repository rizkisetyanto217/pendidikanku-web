// src/pages/dashboard/teachers/TeacherMainDashboard.tsx
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* current user */
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
   TYPES
========================================================= */
export type TeacherScheduleItem = {
  id: string;
  startISO: string;
  endISO: string;
  timeText?: string;
  subject: string;
  sectionName: string;
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
  title: string;
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

export type HomeroomSectionItem = {
  id: string;
  name: string;
  slug: string;
  code?: string;
  studentCount: number;
  studentCountActive?: number;
  imageUrl?: string;
  parentName?: string;
  termName?: string;
  academicYear?: string;
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

    class_attendance_session_title?: string | null;
    class_attendance_session_display_title?: string | null;

    class_attendance_session_subject_name_snapshot?: string | null;
    class_attendance_session_section_name_snapshot?: string | null;
    class_attendance_session_csst_snapshot?: any;
  };
  participant?: {
    participant_id: string;
    participant_state: string;
  };
};

type AttendanceSessionsResponse = {
  success: boolean;
  message: string;
  data: AttendanceSessionAPIItem[];
};

/* =========================================================
   API CLASS SECTIONS (WALI KELAS)
========================================================= */

type ClassSectionAPICompact = {
  class_section_id: string;
  class_section_name: string;
  class_section_slug: string;
  class_section_code?: string | null;
  class_section_total_students: number;
  class_section_total_students_active?: number;
  class_section_image_url?: string | null;

  class_section_class_parent_name_snapshot?: string | null;
  class_section_class_parent_slug_snapshot?: string | null;
  class_section_academic_term_name_snapshot?: string | null;
  class_section_academic_term_slug_snapshot?: string | null;
  class_section_academic_year_snapshot?: string | null;
};

type ClassSectionsListResponse = {
  success: boolean;
  message: string;
  data: ClassSectionAPICompact[];
};

/* =========================================================
   API CSST (MAPEL DIAJAR GURU)
========================================================= */

type CSSTApiItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_slug: string;

  class_section_subject_teacher_enrolled_count: number;

  class_section_subject_teacher_class_section_name_snapshot: string;
  class_section_subject_teacher_class_section_slug_snapshot: string;

  class_section_subject_teacher_class_room_name_snapshot?: string | null;

  class_section_subject_teacher_subject_name_snapshot: string;
};

type CSSTListResponse = {
  success: boolean;
  message: string;
  data: CSSTApiItem[];
};

/* =========================================================
   UTILS
========================================================= */
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

/* helper: ambil active membership dari berbagai kemungkinan path */
const resolveActiveMembership = (userCtx: any): any | undefined => {
  if (!userCtx) return undefined;

  const direct =
    userCtx.activeSchoolMembership ??
    userCtx.active_school_membership ??
    userCtx.membership;

  if (direct) return direct;

  if (Array.isArray(userCtx.memberships) && userCtx.memberships.length > 0) {
    const flagged = userCtx.memberships.find(
      (m: any) => m.is_active || m.is_default || m.is_primary
    );
    return flagged ?? userCtx.memberships[0];
  }

  return undefined;
};

/* =========================================================
   QUERY KEYS
========================================================= */
const QK = {
  TEACHER_ATTENDANCE_WEEK: ["teacher-attendance-week"] as const,
  TEACHER_HOMEROOM: ["teacher-homeroom"] as const,
  TEACHER_SUBJECT_CLASSES: ["teacher-subject-classes"] as const,
};

/* =========================================================
   API HELPERS + DEBUG LOG
========================================================= */

async function fetchTeacherAttendanceThisWeek(): Promise<
  DashboardScheduleItem[]
> {
  console.log("[TeacherDashboard] fetchTeacherAttendanceThisWeek CALLED");

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

  console.log("[TeacherDashboard] attendance-sessions/list response", res.data);

  if (!res.data?.success || !Array.isArray(res.data.data)) {
    console.warn(
      "[TeacherDashboard] attendance-sessions/list invalid payload",
      res.data
    );
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

    const teacherBase =
      formatSchoolTeacherName(csst.school_teacher) ||
      csst.teacher_name ||
      undefined;

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

    const title =
      sessionTitle ||
      (sectionName && sectionName !== subjectName
        ? `${subjectName} — ${sectionName}`
        : subjectName);

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
    const canAttendNow = false;

    return {
      id: s.class_attendance_session_id,
      date: s.class_attendance_session_date,
      time,
      location: undefined,
      teacher: teacherDisplay,
      title,
      note: stateLabel,
      isToday,
      canAttendNow,
      participantState: state,
    };
  });
}

async function fetchTeacherHomeroomSections(
  schoolTeacherId: string
): Promise<HomeroomSectionItem[]> {
  console.log(
    "[TeacherDashboard] fetchTeacherHomeroomSections teacherId =",
    schoolTeacherId
  );

  if (!schoolTeacherId) {
    console.warn(
      "[TeacherDashboard] fetchTeacherHomeroomSections called with empty teacherId"
    );
    return [];
  }

  const res = await axios.get<ClassSectionsListResponse>(
    "/api/u/class-sections/list",
    {
      params: {
        teacher_id: schoolTeacherId,
        is_active: true,
        all: 1,
      },
      withCredentials: true,
    }
  );

  console.log("[TeacherDashboard] class-sections/list response", res.data);

  if (!res.data?.success || !Array.isArray(res.data.data)) {
    console.warn(
      "[TeacherDashboard] class-sections/list invalid payload",
      res.data
    );
    return [];
  }

  return res.data.data.map<HomeroomSectionItem>((row) => ({
    id: row.class_section_id,
    name: row.class_section_name,
    slug: row.class_section_slug,
    code: row.class_section_code ?? undefined,
    studentCount: row.class_section_total_students,
    studentCountActive: row.class_section_total_students_active,
    imageUrl: row.class_section_image_url ?? undefined,
    parentName: row.class_section_class_parent_name_snapshot ?? undefined,
    termName: row.class_section_academic_term_name_snapshot ?? undefined,
    academicYear: row.class_section_academic_year_snapshot ?? undefined,
  }));
}

async function fetchTeacherSubjectClasses(
  schoolTeacherId: string
): Promise<MyClassItem[]> {
  console.log(
    "[TeacherDashboard] fetchTeacherSubjectClasses teacherId =",
    schoolTeacherId
  );

  if (!schoolTeacherId) {
    console.warn(
      "[TeacherDashboard] fetchTeacherSubjectClasses called with empty teacherId"
    );
    return [];
  }

  try {
    const res = await axios.get<CSSTListResponse>(
      "/api/u/class-section-subject-teachers/list",
      {
        params: {
          teacher_id: schoolTeacherId,
          is_active: true,
          all: 1,
        },
        withCredentials: true,
      }
    );

    console.log(
      "[TeacherDashboard] class-section-subject-teachers/list response",
      res.data
    );

    if (!res.data?.success || !Array.isArray(res.data.data)) {
      console.warn("[TeacherDashboard] CSST list invalid payload", res.data);
      return [];
    }

    const mapped = res.data.data.map<MyClassItem>((row) => ({
      csstId: row.class_section_subject_teacher_id,
      subject: row.class_section_subject_teacher_subject_name_snapshot,
      sectionName:
        row.class_section_subject_teacher_class_section_name_snapshot,
      studentCount: row.class_section_subject_teacher_enrolled_count,
      room:
        row.class_section_subject_teacher_class_room_name_snapshot ?? undefined,
      slug: row.class_section_subject_teacher_slug,
    }));

    console.log("[TeacherDashboard] mapped CSST items", mapped);

    return mapped;
  } catch (err) {
    console.error("[TeacherDashboard] CSST list ERROR", err);
    return [];
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

function HomeroomClassesCard({
  items,
  loading,
}: {
  items: HomeroomSectionItem[];
  loading?: boolean;
}) {
  const isEmpty = !loading && items.length === 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <Users className="h-4 w-4" />
          </span>
          Wali Kelas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && items.length === 0 ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isEmpty ? (
          <div className="text-sm text-muted-foreground">
            Saat ini belum menjadi wali kelas di rombel manapun.
          </div>
        ) : (
          items.slice(0, 4).map((r) => {
            const metaParts: string[] = [];
            if (r.parentName) metaParts.push(r.parentName);
            if (r.termName) metaParts.push(r.termName);
            if (!r.termName && r.academicYear) metaParts.push(r.academicYear);
            const meta = metaParts.join(" • ");

            const total =
              r.studentCountActive && r.studentCountActive > 0
                ? `${r.studentCountActive}/${r.studentCount} siswa aktif`
                : `${r.studentCount} siswa`;

            return (
              <div
                key={r.id}
                className="rounded-xl border p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-medium leading-tight truncate">
                    {r.name}
                  </div>
                  {meta && (
                    <div className="text-xs text-muted-foreground truncate">
                      {meta}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {total}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = r.slug
                      ? `/teacher/class-sections/${r.slug}`
                      : `/teacher/class-sections/${r.id}`)
                  }
                >
                  Detail <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            );
          })
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
  const userQuery = useCurrentUser() as any;
  const userLoading = userQuery?.isLoading ?? false;
  const userCtx = userQuery?.data ?? null;

  console.log("[TeacherDashboard] userQuery", userQuery);
  console.log("[TeacherDashboard] userCtx (data)", userCtx);

  const activeMembership = resolveActiveMembership(userCtx);
  console.log("[TeacherDashboard] activeMembership", activeMembership);

  const teacherId: string =
    activeMembership?.school_teacher_id ??
    activeMembership?.school_teacher?.school_teacher_id ??
    userCtx?.school_teacher?.school_teacher_id ??
    userCtx?.school_teacher_id ??
    "";

  const teacherName: string =
    activeMembership?.school_teacher?.name ??
    userCtx?.user?.name ??
    userCtx?.profile?.name ??
    userCtx?.name ??
    "Guru";

  const schoolName: string =
    activeMembership?.school?.name ??
    activeMembership?.school_name ??
    userCtx?.activeSchool?.name ??
    userCtx?.active_school?.name ??
    userCtx?.school?.name ??
    "";

  console.log("[TeacherDashboard] teacherId =", teacherId);
  console.log("[TeacherDashboard] teacherName =", teacherName);
  console.log("[TeacherDashboard] schoolName =", schoolName);

  // 1) Query jadwal (timeline)
  const {
    data: attendanceThisWeek = [],
    isLoading: isLoadingAttendance,
    isFetching: isFetchingAttendance,
  } = useQuery({
    queryKey: QK.TEACHER_ATTENDANCE_WEEK,
    queryFn: fetchTeacherAttendanceThisWeek,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // 2) Query rombel WALI KELAS
  const { data: homeroomSections = [], isLoading: isLoadingHomeroom } =
    useQuery({
      queryKey: [...QK.TEACHER_HOMEROOM, teacherId],
      queryFn: () => fetchTeacherHomeroomSections(teacherId),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      enabled: !!teacherId,
    });

  // 3) Query mapel yang diajar (CSST)
  const { data: subjectClasses = [] } = useQuery({
    queryKey: [...QK.TEACHER_SUBJECT_CLASSES, teacherId],
    queryFn: () => fetchTeacherSubjectClasses(teacherId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: !!teacherId,
  });

  useEffect(() => {
    console.log(
      "[TeacherDashboard] attendanceThisWeek (mapped)",
      attendanceThisWeek
    );
  }, [attendanceThisWeek]);

  useEffect(() => {
    console.log(
      "[TeacherDashboard] homeroomSections from query",
      homeroomSections
    );
  }, [homeroomSections]);

  useEffect(() => {
    console.log("[TeacherDashboard] subjectClasses from query", subjectClasses);
  }, [subjectClasses]);

  const [flash, setFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  const globalLoading =
    userLoading || (isLoadingAttendance && !attendanceThisWeek.length);

  if (globalLoading) {
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

  // Build "Perlu Absen Hari Ini" dari jadwal minggu ini
  const attendanceTodos: AttendanceTodoItem[] = attendanceThisWeek
    .filter(
      (s) =>
        s.date &&
        isSameLocalDay(s.date) &&
        (!s.participantState || s.participantState === "unknown")
    )
    .map((s) => ({
      sessionId: s.id,
      dateISO: s.date ?? "",
      subject: s.title ?? "Pertemuan",
      sectionName: s.teacher ?? "",
      status: "pending",
    }));

  const classesTaught = subjectClasses.length;
  const sessionsToday = attendanceThisWeek.filter((s) =>
    s.date ? isSameLocalDay(s.date) : false
  ).length;
  const attendancePending = attendanceTodos.length;
  const gradingPending = 0;

  const kpis = {
    classesTaught,
    sessionsToday,
    attendancePending,
    gradingPending,
  };

  console.log("[TeacherDashboard] KPIs", kpis);

  const myClassesItems: MyClassItem[] = subjectClasses;
  const scheduleItems: DashboardScheduleItem[] = attendanceThisWeek;

  const nameFull = teacherName;

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
                  {schoolName}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <Users className="h-3.5 w-3.5 mr-1" />
                Kelas diajar: {kpis.classesTaught}
              </Badge>
              <Badge variant="outline">
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                Sesi hari ini: {kpis.sessionsToday}
              </Badge>
              <Badge variant="destructive">
                <ClipboardList className="h-3.5 w-3.5 mr-1" />
                Absen pending: {kpis.attendancePending}
              </Badge>
              <Badge variant="outline">
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Perlu dinilai: {kpis.gradingPending}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile
            label="Kelas Diajar"
            value={kpis.classesTaught}
            icon={<BookOpen size={18} />}
          />
          <KpiTile
            label="Sesi Hari Ini"
            value={kpis.sessionsToday}
            icon={<CalendarDays size={18} />}
          />
          <KpiTile
            label="Absen Pending"
            value={kpis.attendancePending}
            icon={<ClipboardList size={18} />}
          />
          <KpiTile
            label="Butuh Penilaian"
            value={kpis.gradingPending}
            icon={<CheckCheck size={18} />}
          />
        </div>

        {/* Grid utama */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          {/* Kiri */}
          <div className="col-span-1 md:col-span-6 space-y-6">
            <HomeroomClassesCard
              items={homeroomSections}
              loading={isLoadingHomeroom}
            />

            <MyClassesCard items={myClassesItems} seeAllPath={`guru-mapel`} />

            <AttendanceTodoCard
              items={attendanceTodos}
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
          {isFetchingAttendance ? "Menyegarkan data…" : ""}
        </div>
      </main>
    </div>
  );
};

export default TeacherMainDashboard;
