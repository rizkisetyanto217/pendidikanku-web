// src/pages/dashboard/schools/schedules/agendas/SchoolScheduleAgenda.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

// ✅ default import untuk default export
import CalendarView from "@/pages/dashboard/components/calender/CalenderView";
import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";
import EditScheduleDialog from "@/pages/dashboard/components/calender/components/EditSchedule";
// ✅ value vs type dipisah
import {
  toMonthStr,
  monthLabel,
  dateKeyFrom,
} from "@/pages/dashboard/components/calender/types/types";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

import api from "@/lib/axios";

/* =========================================================
   Tipe respons API /u/attendance-sessions/list (mode=compact)
   (kita ambil field yang dipakai saja)
========================================================= */
type ApiSessionCompact = {
  class_attendance_session_id: string;
  class_attendance_session_date: string; // ISO
  class_attendance_session_starts_at: string | null;
  class_attendance_session_display_title?: string | null;
  class_attendance_session_title?: string | null;

  class_attendance_session_subject_name_snapshot?: string | null;
  class_attendance_session_section_name_snapshot?: string | null;
  class_attendance_session_teacher_name_snapshot?: string | null;
  class_attendance_session_room_name_snapshot?: string | null;

  class_attendance_session_csst_snapshot?: {
    subject_name?: string;
    section_name?: string;
    teacher_name?: string;
  } | null;
};

type ApiPaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: any;
};

/* =========================================================
   Helper: map session → ScheduleRow (dipakai Calendar & List)
========================================================= */
function mapSessionsToScheduleRows(
  sessions: ApiSessionCompact[]
): ScheduleRow[] {
  return sessions.map((s) => {
    const startsAt =
      s.class_attendance_session_starts_at || s.class_attendance_session_date;

    // format time: "HH:MM" dari ISO "YYYY-MM-DDTHH:MM:SSZ"
    const time =
      typeof startsAt === "string" && startsAt.length >= 16
        ? startsAt.substring(11, 16)
        : "00:00";

    const title =
      s.class_attendance_session_display_title ||
      s.class_attendance_session_title ||
      s.class_attendance_session_subject_name_snapshot ||
      "Sesi Kelas";

    const subjectName =
      s.class_attendance_session_subject_name_snapshot ||
      s.class_attendance_session_csst_snapshot?.subject_name;

    const sectionName =
      s.class_attendance_session_section_name_snapshot ||
      s.class_attendance_session_csst_snapshot?.section_name;

    const teacherName =
      s.class_attendance_session_teacher_name_snapshot ||
      s.class_attendance_session_csst_snapshot?.teacher_name;

    const roomName = s.class_attendance_session_room_name_snapshot || undefined;

    const descriptionParts = [
      subjectName,
      sectionName,
      teacherName ? `Pengajar: ${teacherName}` : null,
    ].filter(Boolean);

    return {
      id: s.class_attendance_session_id,
      title,
      date: startsAt, // ISO string
      time,
      room: roomName,
      teacher: teacherName ?? undefined,
      type: "class",
      description: descriptionParts.join(" — "),
    };
  });
}

/* =========================================================
   Local store untuk agenda tambahan (event manual admin)
   → tidak dipersist ke backend
========================================================= */
const localAgendaStore = new Map<string, ScheduleRow[]>();
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* =========================================================
   scheduleApi: list dari backend, create/update/remove lokal
========================================================= */
const scheduleApi = {
  async list(month: string): Promise<ScheduleRow[]> {
    // kecilin sedikit supaya UX sama dengan sebelumnya
    await delay();

    const res = await api.get<ApiPaginatedResponse<ApiSessionCompact>>(
      "/api/u/attendance-sessions/list",
      {
        params: {
          mode: "compact",
          range: "month",
          month, // ← "2025-11" dsb, langsung dari state
          participant_kind: "teacher",
          include: "participants",
        },
      }
    );

    const backendRows = mapSessionsToScheduleRows(res.data.data ?? []);
    const extras = localAgendaStore.get(month) ?? [];
    return [...backendRows, ...extras];
  },

  async create(month: string, payload: Omit<ScheduleRow, "id">) {
    await delay();
    const curr = localAgendaStore.get(month) || [];
    const row: ScheduleRow = { id: uid(), ...payload };
    localAgendaStore.set(month, [...curr, row]);
    return structuredClone(row);
  },

  async update(month: string, payload: ScheduleRow) {
    await delay();
    const curr = localAgendaStore.get(month) || [];
    const idx = curr.findIndex((x) => x.id === payload.id);
    if (idx >= 0) {
      curr[idx] = payload;
      localAgendaStore.set(month, curr);
    }
    return structuredClone(payload);
  },

  async remove(month: string, id: string) {
    await delay();
    const curr = localAgendaStore.get(month) || [];
    localAgendaStore.set(
      month,
      curr.filter((x) => x.id !== id)
    );
  },
};

/* ===== Page (UX sama dengan TeacherSchedule) ===== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolScheduleAgenda({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const qc = useQueryClient();

  /* ✅ Tambah breadcrumb seperti SchoolAcademic */
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
  const LOCAL_KEY = "schoolScheduleTab"; // disamain semantik "school"
  const [tab, setTab] = useState<"calendar" | "list">("calendar");
  const [editing, setEditing] = useState<ScheduleRow | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(LOCAL_KEY) || "") as
      | "calendar"
      | "list";
    if (saved === "calendar" || saved === "list") setTab(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, tab);
  }, [tab]);

  const schedulesQ = useQuery({
    queryKey: ["school-schedules", month], // ← key per bulan
    queryFn: () => scheduleApi.list(month),
  });

  const createMut = useMutation({
    mutationFn: (payload: Omit<ScheduleRow, "id">) =>
      scheduleApi.create(month, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["school-schedules", month] }),
  });
  const updateMut = useMutation({
    mutationFn: (payload: ScheduleRow) => scheduleApi.update(month, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["school-schedules", month] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => scheduleApi.remove(month, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["school-schedules", month] }),
  });

  const [y, m] = month.split("-").map(Number);
  const gotoPrev = () => setMonth(toMonthStr(new Date(y, m - 2, 1)));
  const gotoNext = () => setMonth(toMonthStr(new Date(y, m, 1)));

  useEffect(() => {
    const today = new Date();
    if (toMonthStr(today) === month) setSelectedDay(dateKeyFrom(today));
    else setSelectedDay(null);
  }, [month]);

  const onAddNew = (baseDate?: string) =>
    setEditing({
      id: "",
      title: "",
      date: new Date(
        (baseDate ?? toMonthStr()) + (baseDate ? "T07:00:00" : "-01T07:00:00")
      ).toISOString(),
      time: "07:00",
    });

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
            <div className="font-semibold text-lg md:text-xl">Agenda</div>
            <p className="text-sm text-muted-foreground">
              Kelola aktivitas sekolah per bulan atau dalam bentuk daftar
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
              onAddNew={onAddNew}
              onEdit={(row) => setEditing(row)}
              onDelete={(id) => deleteMut.mutate(id)}
              updating={updateMut.isPending || createMut.isPending}
              deleting={deleteMut.isPending}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <ScheduleList
              data={schedulesQ.data ?? []}
              loading={schedulesQ.isLoading}
              onAddNew={() => onAddNew()}
              onEdit={(row) => setEditing(row)}
              onDelete={(id) => deleteMut.mutate(id)}
              updating={updateMut.isPending || createMut.isPending}
              deleting={deleteMut.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog */}
      {editing && (
        <EditScheduleDialog
          value={editing}
          onClose={() => setEditing(null)}
          onSubmit={(v) => {
            if (!v.title.trim()) return;
            if (v.id) {
              updateMut.mutate(v, { onSuccess: () => setEditing(null) });
            } else {
              const { id, ...payload } = v;
              createMut.mutate(payload, { onSuccess: () => setEditing(null) });
            }
          }}
        />
      )}
    </div>
  );
}
