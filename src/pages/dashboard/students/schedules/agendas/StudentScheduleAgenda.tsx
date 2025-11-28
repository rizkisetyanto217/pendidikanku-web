// src/pages/dashboard/students/schedules/agendas/StudentScheduleAgenda.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import CalendarView from "@/pages/dashboard/components/calender/CalenderView";
import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";
import {
  toMonthStr,
  monthLabel,
  dateKeyFrom,
} from "@/pages/dashboard/components/calender/types/types";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

import api from "@/lib/axios";

/* =============================
   Types API student timeline (API terbaru)
============================= */

type ApiStudentTimelineSession = {
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

type ApiStudentTimelineParticipant = {
  participant_id: string;
  participant_state: string;
  [key: string]: any;
};

type ApiStudentTimelineItem = {
  session: ApiStudentTimelineSession;
  participant?: ApiStudentTimelineParticipant;
  [key: string]: any;
};

type ApiPagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  count: number;
  per_page_options: number[];
};

type ApiStudentTimelineResponse = {
  success: boolean;
  message: string;
  data: ApiStudentTimelineItem[];
  pagination?: ApiPagination;
};

/* =============================
   Helper mapping API → ScheduleRow
============================= */

function toTimeStr(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function mapItemToScheduleRow(item: ApiStudentTimelineItem): ScheduleRow {
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

  const participantState = item.participant?.participant_state ?? "unknown";

  const baseDesc =
    (s.class_attendance_session_general_info || "").trim() ||
    (subjectName
      ? sectionName
        ? `Pertemuan ${subjectName} — ${sectionName}`
        : `Pertemuan ${subjectName}`
      : "");

  const description =
    participantState === "present"
      ? `${baseDesc}${baseDesc ? " — " : ""}Status kehadiran: hadir`
      : participantState === "sick"
      ? `${baseDesc}${baseDesc ? " — " : ""}Status kehadiran: izin sakit`
      : baseDesc;

  return {
    id: s.class_attendance_session_id,
    title: baseTitle,
    date: dateIso,
    time: toTimeStr(startsAt),
    room: roomName,
    teacher: teacherName,
    type: "class", // nanti kalau ada ujian/event bisa dipetakan dari type_snapshot.slug
    description,
  };
}

/* =========================================================
   Page — sama layout & interaksi dengan Academic
========================================================= */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentScheduleAgenda({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Agenda",
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
  const [tab, setTab] = useState<"calendar" | "list">("calendar");

  // navigasi bulan (pakai format "YYYY-MM" yang sama dikirim ke API)
  const [y, m] = month.split("-").map(Number);
  const gotoPrev = () => setMonth(toMonthStr(new Date(y, m - 2, 1)));
  const gotoNext = () => setMonth(toMonthStr(new Date(y, m, 1)));

  // 🔗 Ambil data dari API student timeline (API attendance-sessions/list terbaru)
  const schedulesQ = useQuery({
    queryKey: ["student-schedules", month],
    queryFn: async (): Promise<ScheduleRow[]> => {
      const res = await api.get<ApiStudentTimelineResponse>(
        "/u/attendance-sessions/list",
        {
          params: {
            student_timeline: 1,
            mode: "compact",
            range: "month",
            month, // "2025-11"
            // kalau nanti mau pagination, tinggal tambah page/per_page di sini
          },
        }
      );

      const items = res.data?.data ?? [];
      return items.map(mapItemToScheduleRow);
    },
  });

  // kalau ganti bulan, auto highlight hari ini kalau masih di bulan tsb
  useEffect(() => {
    const today = new Date();
    if (toMonthStr(today) === month) setSelectedDay(dateKeyFrom(today));
    else setSelectedDay(null);
  }, [month]);

  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-4">
        {/* Header */}
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
          <div>
            <div className="font-semibold text-base md:text-xl">Jadwal</div>
            <p className="md:flex text-sm text-muted-foreground">
              Lihat aktivitas belajar per bulan atau daftar
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
              onClick={() => {
                const now = new Date();
                setMonth(toMonthStr(now));
                setSelectedDay(dateKeyFrom(now));
                setTab("calendar");
              }}
              className="ml-1"
            >
              Hari ini
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "calendar" | "list")}
          className="w-full"
        >
          <TabsList className="w-fit">
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <CalendarView
              month={month}
              data={schedulesQ.data ?? []}
              loading={schedulesQ.isLoading}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              readOnly
              canAdd={false}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <ScheduleList
              data={schedulesQ.data ?? []}
              loading={schedulesQ.isLoading}
              readOnly
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
