// src/pages/sekolahislamku/student/StudentSchedule.tsx
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import CalendarView from "@/pages/dashboard/components/calender/CalenderView";
import ScheduleList from "@/pages/dashboard/components/calender/ScheduleList";
import {
  toMonthStr,
  monthLabel,
  dateKeyFrom,
} from "@/pages/dashboard/components/calender/types/types";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

// === dummy store sama seperti di teacher (sementara)
const scheduleStore = new Map<string, ScheduleRow[]>();
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function seedMonth(y: number, m: number): ScheduleRow[] {
  const rooms = ["Aula 1", "Aula Utama", "Ruang 3B", "Ruang 4C", "Ruang 5A"];
  const teachers = [
    "Ust. Ahmad",
    "Bu Sari",
    "Pak Budi",
    "Ust. Dina",
    "Pak Rudi",
  ];
  const classes = ["1A", "2B", "3C", "4D", "5A", "6B"];
  const topics = [
    ["Tahsin Al-Qur'an", "Fokus makhraj huruf & tajwid"],
    ["Matematika", "Pecahan, desimal, perbandingan"],
    ["Bahasa Indonesia", "Teks nonfiksi & ringkasan"],
    ["IPA", "Siklus air & ekosistem"],
    ["IPS", "Keragaman sosial budaya"],
    ["Bahasa Inggris", "Daily conversation & vocab"],
  ] as const;

  const rows: ScheduleRow[] = [];
  const push = (
    d: number,
    time: string,
    type: "class" | "exam" | "event",
    idx: number
  ) => {
    const [title, desc] = topics[idx % topics.length];
    const teacher = teachers[idx % teachers.length];
    const room = rooms[idx % rooms.length];
    const cls = classes[idx % classes.length];
    rows.push({
      id: uid(),
      title: type === "class" ? `${title} Kelas ${cls}` : `${title} ${type}`,
      date: new Date(
        y,
        m - 1,
        d,
        Number(time.slice(0, 2)),
        Number(time.slice(3))
      ).toISOString(),
      time,
      room,
      teacher: type === "class" ? cls : teacher,
      type,
      description:
        type === "exam"
          ? `Ujian materi ${title.toLowerCase()} — persiapkan alat tulis.`
          : type === "event"
          ? `Acara sekolah: ${title} — ${desc}`
          : desc,
    });
  };

  const plan: Array<[number, string, "class" | "exam" | "event"]> = [
    [1, "07:30", "class"],
    [1, "10:15", "class"],
    [2, "09:00", "event"],
    [3, "08:00", "class"],
    [3, "13:00", "class"],
    [5, "10:00", "exam"],
    [7, "07:30", "class"],
    [8, "11:00", "class"],
    [9, "09:30", "class"],
    [10, "13:15", "class"],
    [12, "10:00", "class"],
    [12, "14:00", "event"],
    [14, "08:00", "class"],
    [15, "07:30", "class"],
    [15, "10:30", "exam"],
    [18, "09:45", "class"],
    [20, "07:30", "class"],
    [20, "12:30", "class"],
    [22, "10:00", "class"],
    [22, "15:00", "event"],
    [24, "08:00", "class"],
    [25, "07:30", "class"],
    [25, "10:00", "class"],
    [26, "09:00", "exam"],
    [28, "07:30", "class"],
    [28, "11:30", "class"],
  ];
  plan.forEach((p, i) => push(p[0], p[1], p[2], i));
  return rows;
}
const scheduleApi = {
  async list(month: string): Promise<ScheduleRow[]> {
    await delay();
    if (!scheduleStore.has(month)) {
      const [y, m] = month.split("-").map(Number);
      scheduleStore.set(month, seedMonth(y, m));
    }
    return structuredClone(scheduleStore.get(month)!);
  },
};

export default function StudentScheduleAgenda() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(toMonthStr());
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    dateKeyFrom(new Date())
  );
  const [tab, setTab] = useState<"calendar" | "list">("calendar");

  const schedulesQ = useQuery({
    queryKey: ["student-schedules", month],
    queryFn: () => scheduleApi.list(month),
  });

  const [y, m] = month.split("-").map(Number);
  const gotoPrev = () => setMonth(toMonthStr(new Date(y, m - 2, 1)));
  const gotoNext = () => setMonth(toMonthStr(new Date(y, m, 1)));

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Jadwal",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Jadwal" },
      ],
      actions: null,
    });
  }, [setHeader]);

  useEffect(() => {
    const today = new Date();
    if (toMonthStr(today) === month) setSelectedDay(dateKeyFrom(today));
    else setSelectedDay(null);
  }, [month]);

  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays size={18} />
          </div>
          <div>
            <div className="font-semibold text-base">Jadwal Saya</div>
            <p className="text-sm text-muted-foreground">
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
