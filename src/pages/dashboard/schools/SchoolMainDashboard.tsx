// src/pages/school/SchoolMainDashboard.tsx
import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

import {
  Users,
  UserCog,
  BookOpen,
  ArrowLeft,
  Wallet,
  GraduationCap,
  CalendarDays,
  Megaphone,
  Plus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ================= Types (API & UI) ================ */
export type AnnouncementUI = {
  id: string;
  title: string;
  date: string;
  body: string;
  themeId?: string | null;
  type?: "info" | "warning" | "success";
  slug?: string;
};

type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
};

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type SchoolHome = {
  schoolName: string;
  hijriDate: string;
  gregorianDate: string;
  finance: {
    unpaidCount: number;
    unpaidTotal: number;
    paidThisMonth: number;
    outstandingBills: BillItem[];
  };
  todaySchedule: TodayScheduleItem[];
  announcements: AnnouncementUI[];
  attendanceTodayByStatus: Record<AttendanceStatus, number>;
};

type SessionsItem = {
  class_attendance_sessions_id: string;
  class_attendance_sessions_date: string;
  class_attendance_sessions_title: string;
  class_attendance_sessions_general_info?: string;
  class_attendance_sessions_note?: string;
};
type SessionsResponse = {
  message: string;
  data: { limit: number; offset: number; count: number; items: SessionsItem[] };
};

type SchoolDashboardProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

export type TodayScheduleItem = {
  id: string;
  time: string; // "07:00 - 08:30" atau jam mulai
  title: string;
  location?: string;
  teacher?: string;
  note?: string;
};

/* ============ Query Keys ============ */
const QK = {
  HOME: ["school-home"] as const,
  TODAY_SESSIONS: (d: string) =>
    ["class-attendance-sessions", "today", d] as const,
};

/* ================= Utils ================ */
const yyyyMmDdLocal = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

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

/* ============ Dummy Home (sementara, nanti ganti ke API) ============ */
const mockTodaySchedule: TodayScheduleItem[] = [
  {
    id: "t1",
    time: "07:00 - 08:30",
    title: "Matematika - Kelas 5A",
    location: "R. 5A",
    teacher: "Bu Rani",
  },
  {
    id: "t2",
    time: "09:00 - 10:30",
    title: "Bahasa Indonesia - Kelas 6B",
    location: "R. 6B",
    teacher: "Pak Dedi",
  },
  {
    id: "t3",
    time: "11:00 - 12:00",
    title: "Pembinaan Tahfidz",
    location: "Aula",
    teacher: "Ust. Ahmad",
  },
];

async function fetchSchoolHome(): Promise<SchoolHome> {
  const now = new Date();
  const iso = now.toISOString();
  return {
    schoolName: "Sekolah Islamku",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: iso,
    finance: {
      unpaidCount: 18,
      unpaidTotal: 7_500_000,
      paidThisMonth: 42_250_000,
      outstandingBills: [],
    },
    todaySchedule: mockTodaySchedule,
    announcements: [],
    attendanceTodayByStatus: {
      hadir: 286,
      online: 8,
      sakit: 10,
      izin: 9,
      alpa: 7,
    },
  };
}

function mapSessionsToTodaySchedule(
  items: SessionsItem[]
): TodayScheduleItem[] {
  return items.map((it) => ({
    id: it.class_attendance_sessions_id,
    time: new Date(it.class_attendance_sessions_date).toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit" }
    ),
    title: it.class_attendance_sessions_title,
    note: it.class_attendance_sessions_note || undefined,
  }));
}

/* ============ Data hooks ============ */
function useTodaySessions() {
  const today = useMemo(() => yyyyMmDdLocal(), []);
  return useQuery<SessionsItem[]>({
    queryKey: QK.TODAY_SESSIONS(today),
    queryFn: async () => {
      const res = await axios.get<SessionsResponse>(
        "/api/u/class-attendance-sessions",
        {
          params: { date_from: today, date_to: today, limit: 50, offset: 0 },
          withCredentials: true,
        }
      );
      return res.data?.data?.items ?? [];
    },
    refetchOnWindowFocus: false,
  });
}

/* ============ Small shadcn UI blocks ============ */
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

function MiniStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "warning" | "normal";
}) {
  const isWarn = tone === "warning";
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div className="text-sm font-medium leading-tight md:flex-1 truncate">
            {label}
          </div>
          <Badge variant={isWarn ? "destructive" : "outline"} className="w-fit">
            {isWarn ? "Perlu perhatian" : "OK"}
          </Badge>
        </div>
        <div className="text-lg md:text-xl font-semibold leading-tight mb-1">
          {value}
        </div>
        {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

/* ============ Shadcn cards untuk header, jadwal, kehadiran, pengumuman ============ */

function DashboardHeader({ home }: { home?: SchoolHome }) {
  const schoolName = home?.schoolName ?? "Dashboard Sekolah";
  const gregDate = home?.gregorianDate
    ? dateFmt(home.gregorianDate)
    : dateFmt(new Date().toISOString());
  const hijriDate = home?.hijriDate ?? "-";

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Ringkasan Sekolah
            </div>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight">
              {schoolName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {gregDate} • {hijriDate}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TodayScheduleCard({
  items,
  title = "Jadwal Hari Ini",
  maxItems = 3,
  seeAllPath,
}: {
  items: TodayScheduleItem[];
  title?: string;
  maxItems?: number;
  seeAllPath?: string;
}) {
  const shown = items.slice(0, maxItems);
  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {shown.length === 0 ? (
          <div className="text-sm text-muted-foreground">Tidak ada jadwal.</div>
        ) : (
          <div className="space-y-3">
            {shown.map((s) => (
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
            ))}
          </div>
        )}
        {seeAllPath && (
          <>
            <Separator className="my-2" />
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

function AttendanceTodayCard({
  data,
  onSeeAll,
}: {
  data: SchoolHome["attendanceTodayByStatus"] | undefined;
  onSeeAll?: () => void;
}) {
  const items: { key: AttendanceStatus; label: string }[] = [
    { key: "hadir", label: "Hadir" },
    { key: "online", label: "Online" },
    { key: "sakit", label: "Sakit" },
    { key: "izin", label: "Izin" },
    { key: "alpa", label: "Alpa" },
  ];

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <Users className="h-4 w-4" />
          </span>
          Kehadiran Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex-1 flex flex-col">
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.key}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>{it.label}</span>
              <span className="font-semibold">
                {data ? data[it.key] ?? 0 : "-"}
              </span>
            </div>
          ))}
        </div>
        {onSeeAll && (
          <>
            <Separator className="my-3" />
            <Button variant="outline" className="w-full" onClick={onSeeAll}>
              Lihat selengkapnya
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AnnouncementsCard({
  items,
  onAdd,
}: {
  items: AnnouncementUI[];
  onAdd?: () => void;
}) {
  const shown = items.slice(0, 4);
  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <Megaphone className="h-4 w-4" />
          </span>
          Pengumuman Terbaru
        </CardTitle>
        {onAdd && (
          <Button size="sm" variant="outline" className="gap-1" onClick={onAdd}>
            <Plus className="h-3 w-3" />
            Tambah
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        {shown.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Belum ada pengumuman.
          </div>
        ) : (
          shown.map((a) => (
            <div key={a.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm line-clamp-1">
                  {a.title}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {dateFmt(a.date)}
                </span>
              </div>
              {a.body && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {a.body}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/* ================= Page ================= */
const SchoolMainDashboard: React.FC<SchoolDashboardProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const navigate = useNavigate();

  const homeQ = useQuery({ queryKey: QK.HOME, queryFn: fetchSchoolHome });
  const todaySessionsQ = useTodaySessions();

  const scheduleItems: TodayScheduleItem[] = useMemo(() => {
    const apiItems = todaySessionsQ.data ?? [];
    return apiItems.length > 0
      ? mapSessionsToTodaySchedule(apiItems)
      : homeQ.data?.todaySchedule ?? mockTodaySchedule;
  }, [todaySessionsQ.data, homeQ.data]);

  useEffect(() => {
    // kalau mau sync dengan dashboard layout header, bisa taruh di sini
  }, []);

  const home = homeQ.data;

  // ==== DUMMY KPI DATA ====
  const KPI_ITEMS = [
    {
      label: "Guru",
      value: 26,
      icon: <UserCog size={18} />,
    },
    {
      label: "Siswa",
      value: 342,
      icon: <Users size={18} />,
    },
    {
      label: "Program",
      value: 12,
      icon: <GraduationCap size={18} />,
    },
    {
      label: "Kelas",
      value: 18,
      icon: <BookOpen size={18} />,
    },
  ];

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* HEADER SEKOLAH */}
            <DashboardHeader home={home} />

            {/* KPI (dummy) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {KPI_ITEMS.map((k) => (
                <KpiTile
                  key={k.label}
                  label={k.label}
                  value={k.value}
                  icon={k.icon}
                />
              ))}
            </div>

            {/* Tombol kembali (kalau dipakai di nested) */}
            {showBack && (
              <div className="flex">
                <Button
                  variant="ghost"
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> {backLabel}
                </Button>
              </div>
            )}

            {/* Outlet (detail/child routes) */}
            <Outlet />

            {/* Jadwal • Keuangan */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
              {/* Jadwal */}
              <div className="col-span-1 md:col-span-6 lg:col-span-6">
                <TodayScheduleCard
                  items={scheduleItems}
                  title="Jadwal Hari Ini"
                  maxItems={3}
                  seeAllPath="/school/schedule" // sesuaikan kalau beda
                />
                {(todaySessionsQ.isLoading || todaySessionsQ.isFetching) && (
                  <div className="px-1 pt-2 text-xs text-muted-foreground">
                    Memuat jadwal hari ini…
                  </div>
                )}
              </div>

              {/* Snapshot Keuangan */}
              <div className="md:col-span-6 lg:col-span-6 space-y-4 min-w-0">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
                        <Wallet size={18} />
                      </span>
                      Snapshot Keuangan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <MiniStat
                      label="Tertagih Bulan Ini"
                      value={formatIDR(home?.finance.paidThisMonth ?? 0)}
                    />
                    <MiniStat
                      label="Tunggakan"
                      value={`${home?.finance.unpaidCount ?? 0} tagihan`}
                      sub={formatIDR(home?.finance.unpaidTotal ?? 0)}
                      tone="warning"
                    />
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Kehadiran & Pengumuman */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AttendanceTodayCard
                data={home?.attendanceTodayByStatus ?? undefined}
                onSeeAll={() => {
                  window.location.href = "/school/attendance";
                }}
              />
              <AnnouncementsCard
                items={home?.announcements ?? []}
                onAdd={() => {
                  window.location.href = "/school/announcements/new";
                }}
              />
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolMainDashboard;
