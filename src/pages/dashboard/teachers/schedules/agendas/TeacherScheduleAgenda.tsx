// src/pages/dashboard/teachers/schedules/agendas/TeacherScheduleAgenda.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

// ✅ default import untuk default export
import CalendarView from "@/pages/dashboard/components/calender/CalenderView";
import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";
import {
  toMonthStr,
  monthLabel,
  dateKeyFrom,
} from "@/pages/dashboard/components/calender/types/types";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

// 🔹 segmented tabs custom
import {
  CSegmentedTabs,
  type SegmentedTabItem,
} from "@/components/costum/common/CSegmentedTabs";

import api from "@/lib/axios";

/* =========================================================
   Types API teacher timeline (struktur mirip student_timeline)
========================================================= */

type ApiTimelineSession = {
  class_attendance_session_id: string;
  class_attendance_session_school_id: string;

  class_attendance_session_date: string; // "2025-11-20T00:00:00Z"
  class_attendance_session_starts_at: string | null;
  class_attendance_session_ends_at: string | null;

  class_attendance_session_title: string | null;
  class_attendance_session_display_title: string | null;
  class_attendance_session_general_info: string | null;

  class_attendance_session_status: string;
  class_attendance_session_attendance_status: string;

  class_attendance_session_subject_name_snapshot?: string | null;
  class_attendance_session_subject_code_snapshot?: string | null;
  class_attendance_session_section_name_snapshot?: string | null;
  class_attendance_session_room_name_snapshot?: string | null;
  class_attendance_session_teacher_name_snapshot?: string | null;

  class_attendance_session_csst_snapshot?: any;
  class_attendance_session_type_snapshot?: any;
};

type ApiTeacherTimelineItem = {
  session: ApiTimelineSession;
  // kemungkinan ada field lain (mis. kehadiran guru), tapi tidak dipakai di UI ini
  [key: string]: any;
};

type ApiTeacherTimelineResponse = {
  success: boolean;
  message: string;
  data: ApiTeacherTimelineItem[];
};

/* =========================================================
   Helper mapping API → ScheduleRow
========================================================= */

function toTimeStr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function mapItemToScheduleRow(item: ApiTeacherTimelineItem): ScheduleRow {
  const s = item.session;
  const csst = (s.class_attendance_session_csst_snapshot ?? {}) as any;

  const startsAt =
    s.class_attendance_session_starts_at || s.class_attendance_session_date;
  const dateIso = startsAt || s.class_attendance_session_date;

  const subjectName =
    s.class_attendance_session_subject_name_snapshot ??
    csst.subject_name ??
    csst.subject?.name;

  const sectionName =
    s.class_attendance_session_section_name_snapshot ??
    csst.section_name ??
    csst.class_section?.name;

  const teacherName =
    s.class_attendance_session_teacher_name_snapshot ??
    csst.teacher_name ??
    csst.school_teacher?.name;

  const roomName =
    s.class_attendance_session_room_name_snapshot ??
    csst.room_name ??
    undefined;

  const baseTitle =
    s.class_attendance_session_display_title ||
    s.class_attendance_session_title ||
    (subjectName
      ? sectionName
        ? `${subjectName} — ${sectionName}`
        : subjectName
      : "Pertemuan Kelas");

  const baseDesc =
    (s.class_attendance_session_general_info || "").trim() ||
    (subjectName
      ? sectionName
        ? `Pertemuan ${subjectName} — ${sectionName}`
        : `Pertemuan ${subjectName}`
      : "");

  return {
    id: s.class_attendance_session_id,
    title: baseTitle,
    date: dateIso,
    time: toTimeStr(startsAt),
    room: roomName,
    teacher: teacherName,
    // nanti kalau mau beda warna: bisa mapping dari class_attendance_session_type_snapshot.slug
    type: "class",
    description: baseDesc,
  };
}

// 🔹 Items untuk segmented tabs
const TAB_ITEMS: SegmentedTabItem[] = [
  {
    value: "calendar",
    label: "Kalender",
  },
  {
    value: "list",
    label: "List",
  },
];

/* ===================== PAGE ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function TeacherScheduleAgenda({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Agenda Mengajar",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Jadwal" },
        { label: "Agenda" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const [month, setMonth] = useState(toMonthStr());
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    dateKeyFrom(new Date())
  );

  const LOCAL_KEY = "teacherScheduleTab";
  const [tab, setTab] = useState<"calendar" | "list">("calendar");

  // 🔔 signal untuk memicu re-scroll di List
  const [scrollToTodaySig, setScrollToTodaySig] = useState(0);

  // Restore tab dari localStorage
  useEffect(() => {
    const saved = (localStorage.getItem(LOCAL_KEY) || "") as
      | "calendar"
      | "list";
    if (saved === "calendar" || saved === "list") {
      setTab(saved);
    }
  }, []);

  // Simpan tab ke localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, tab);
  }, [tab]);

  // Query jadwal per bulan dari API teacher timeline
  const schedulesQ = useQuery({
    queryKey: ["teacher-schedules", month],
    queryFn: async (): Promise<ScheduleRow[]> => {
      const res = await api.get<ApiTeacherTimelineResponse>(
        "/u/attendance-sessions/list",
        {
          params: {
            teacher_timeline: 1,
            mode: "compact",
            month, // "2025-11"
            range: "month", // sama seperti student
            page: 1,
            per_page: 200,
          },
        }
      );

      const items = res.data?.data ?? [];
      return items.map(mapItemToScheduleRow);
    },
  });

  // Navigasi bulan
  const [y, m] = month.split("-").map(Number);
  const gotoPrev = () => setMonth(toMonthStr(new Date(y, m - 2, 1)));
  const gotoNext = () => setMonth(toMonthStr(new Date(y, m, 1)));

  // Set selectedDay kalau bulan sama dengan hari ini
  useEffect(() => {
    const today = new Date();
    if (toMonthStr(today) === month) {
      setSelectedDay(dateKeyFrom(today));
    } else {
      setSelectedDay(null);
    }
  }, [month]);

  // 🔹 handler ke halaman detail (klik agenda)
  const goToDetail = (row: ScheduleRow) => {
    navigate(`${row.id}`, {
      state: {
        schedule: row,
        month,
      },
    });
  };

  // Helper untuk tombol "Hari ini"
  const goToToday = () => {
    const now = new Date();
    setMonth(toMonthStr(now));
    setSelectedDay(dateKeyFrom(now));
    setScrollToTodaySig(Date.now());
  };

  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-4">
        {/* Header: Desktop (>= md) - lengkap */}
        <div className="hidden md:flex gap-3 items-center">
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
            <div className="font-semibold text-lg md:text-xl">
              Agenda Mengajar
            </div>
            <p className="text-sm text-muted-foreground">
              Kelola aktivitas mengajar per bulan atau dalam bentuk daftar
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={gotoPrev}>
              <ChevronLeft size={16} />
            </Button>
            <span className="font-medium text-sm">{monthLabel(month)}</span>
            <Button variant="outline" size="icon" onClick={gotoNext}>
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToToday}
              className="ml-1"
            >
              Hari ini
            </Button>
          </div>
        </div>

        {/* Header: Mobile (< md) - hanya navigasi bulan (tanpa title/desc) */}
        <div className="flex md:hidden items-center gap-2">
          {showBack && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft size={18} />
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={gotoPrev}>
              <ChevronLeft size={16} />
            </Button>
            <span className="font-medium text-xs">{monthLabel(month)}</span>
            <Button variant="outline" size="icon" onClick={gotoNext}>
              <ChevronRight size={16} />
            </Button>
            <Button variant="secondary" size="sm" onClick={goToToday}>
              Hari ini
            </Button>
          </div>
        </div>

        {/* Segmented Tabs */}
        <CSegmentedTabs
          value={tab}
          onValueChange={(v) => setTab(v as "calendar" | "list")}
          tabs={TAB_ITEMS}
          className="mt-1"
        />

        {/* Content */}
        <div className="mt-4">
          {tab === "calendar" ? (
            <CalendarView
              month={month}
              data={schedulesQ.data ?? []}
              loading={schedulesQ.isLoading}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              // klik agenda di kalender → detail
              onEdit={(row) => goToDetail(row)}
            // tidak ada onAddNew/onDelete di sini, karena jadwal dari sistem akademik / attendance
            />
          ) : (
            <ScheduleList
              data={schedulesQ.data ?? []}
              loading={schedulesQ.isLoading}
              // klik agenda di list → detail
              onEdit={(row) => goToDetail(row)}
              scrollSignal={scrollToTodaySig}
            />
          )}
        </div>
      </div>
    </div>
  );
}
