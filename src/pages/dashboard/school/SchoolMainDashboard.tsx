import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

// === Komponen shadcn/ui ===
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// === Komponen dashboard ===
import TodayScheduleCard from "@/pages/dashboard/components/card/CTodayScheduleCard";
import BillsSectionCard from "@/pages/dashboard/components/card/CBillsSectionCard";

// === Icon ===
import {
  Users,
  UserCog,
  BookOpen,
  ArrowLeft,
  Wallet,
  GraduationCap,
} from "lucide-react";

/* =================== Types =================== */
type SchoolDashboardProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

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

type TodayScheduleItem = {
  id: string;
  subject: string;
  teacher: string;
  time: string;
};

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
};

type LembagaStats = {
  lembaga_stats_active_classes: number;
  lembaga_stats_active_sections: number;
  lembaga_stats_active_students: number;
  lembaga_stats_active_teachers: number;
};

type LembagaStatsResponse = { data: LembagaStats; found: boolean };

type SessionsItem = {
  class_attendance_sessions_id: string;
  class_attendance_sessions_title: string;
  class_attendance_sessions_date: string;
};

type SessionsResponse = {
  data: { items: SessionsItem[] };
};

/* =================== Query Keys =================== */
const QK = {
  HOME: ["school-home"] as const,
  STATS: ["lembaga-stats"] as const,
  TODAY_SESSIONS: (d: string) =>
    ["class-attendance-sessions", "today", d] as const,
  ANNOUNCEMENTS: ["announcements", "u"] as const,
};

/* =================== Utils =================== */

const yyyyMmDdLocal = (d = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateFmt = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* =================== API Hooks =================== */

// 🔹 Pengumuman

// 🔹 Statistik lembaga
function useLembagaStats() {
  return useQuery<LembagaStats | null>({
    queryKey: QK.STATS,
    queryFn: async () => {
      const res = await axios.get<LembagaStatsResponse>(
        "/api/a/lembaga-stats",
        {
          withCredentials: true,
        }
      );
      return res.data?.found ? res.data.data : null;
    },
  });
}

// 🔹 Jadwal hari ini
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
  });
}

// 🔹 Dashboard home (dummy bisa diganti real API)
async function fetchSchoolHome(): Promise<SchoolHome> {
  const now = new Date();
  return {
    schoolName: "Sekolah Islamku",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: now.toISOString(),
    finance: {
      unpaidCount: 3,
      unpaidTotal: 850000,
      paidThisMonth: 4250000,
      outstandingBills: [
        {
          id: "b101",
          title: "SPP Oktober - Kelas 3A",
          amount: 150000,
          dueDate: new Date(now.getTime() + 3 * 864e5).toISOString(),
          status: "unpaid",
        },
        {
          id: "b102",
          title: "Seragam Putih Abu",
          amount: 250000,
          dueDate: new Date(now.getTime() + 6 * 864e5).toISOString(),
          status: "unpaid",
        },
      ],
    },
    todaySchedule: [
      {
        id: "s1",
        subject: "Matematika",
        teacher: "Ust. Fajar",
        time: "07.30 - 09.00",
      },
      {
        id: "s2",
        subject: "Bahasa Arab",
        teacher: "Ust. Rahma",
        time: "09.15 - 10.30",
      },
      { id: "s3", subject: "IPA", teacher: "Ust. Dwi", time: "10.45 - 12.00" },
    ],
    announcements: [],
  };
}

/* =================== Komponen UI =================== */
function Flash({
  flash,
}: {
  flash: { type: "success" | "error"; msg: string } | null;
}) {
  if (!flash) return null;
  const isOk = flash.type === "success";
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div
        className={`mb-3 rounded-lg px-3 py-2 text-sm ${
          isOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {flash.msg}
      </div>
    </div>
  );
}

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
    <Card className="w-full p-4 flex items-center gap-3 border border-border bg-card text-card-foreground">
      <span className="h-10 w-10 grid place-items-center rounded-xl bg-primary text-primary-foreground">
        {icon}
      </span>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </Card>
  );
}

/* =================== Halaman Dashboard =================== */
const SchoolMainDashboard: React.FC<SchoolDashboardProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const navigate = useNavigate();
  const [flash, setFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 3000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  const homeQ = useQuery({ queryKey: QK.HOME, queryFn: fetchSchoolHome });
  const lembagaStatsQ = useLembagaStats();
  const todaySessionsQ = useTodaySessions();

  const scheduleItems = useMemo(() => {
    const raw = homeQ.data?.todaySchedule ?? [];
    return raw.map((s) => ({
      ...s,
      title: s.subject, // untuk kompatibilitas dengan ScheduleItem di TodayScheduleCard
    }));
  }, [homeQ.data]);

  return (
    <div className="w-full bg-background text-foreground min-h-screen">
      <Flash flash={flash} />

      <main className="w-full">
        <div className="mx-auto w-full flex flex-col gap-6 px-4 xl:px-6 2xl:max-w-[1600px]">
          {/* === Statistik Utama === */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Guru",
                value: lembagaStatsQ.data?.lembaga_stats_active_teachers ?? 0,
                icon: <UserCog size={18} />,
              },
              {
                label: "Siswa",
                value: lembagaStatsQ.data?.lembaga_stats_active_students ?? 0,
                icon: <Users size={18} />,
              },
              {
                label: "Program",
                value: lembagaStatsQ.data?.lembaga_stats_active_sections ?? 0,
                icon: <GraduationCap size={18} />,
              },
              {
                label: "Kelas",
                value: lembagaStatsQ.data?.lembaga_stats_active_classes ?? 0,
                icon: <BookOpen size={18} />,
              },
            ].map((k) => (
              <KpiTile
                key={k.label}
                label={k.label}
                value={k.value}
                icon={k.icon}
              />
            ))}
          </div>

          {/* Tombol Back */}
          {showBack && (
            <div className="flex py-2">
              <Button
                variant="ghost"
                onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft size={20} /> {backLabel}
              </Button>
            </div>
          )}

          <Outlet />

          {/* === Jadwal dan Keuangan === */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
            {/* Jadwal Hari Ini */}
            <div className="col-span-1 md:col-span-6">
              <TodayScheduleCard
                items={scheduleItems}
                seeAllPath="all-schedule"
                title="Jadwal Hari Ini"
                maxItems={3}
              />
              {todaySessionsQ.isLoading && (
                <div className="px-4 pt-2 text-xs text-muted-foreground">
                  Memuat jadwal hari ini...
                </div>
              )}
            </div>

            {/* Snapshot Keuangan */}
            <div className="md:col-span-1 lg:col-span-6 space-y-6">
              <Card className="p-4 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground">
                    <Wallet size={18} />
                  </div>
                  <h1 className="text-base font-semibold">Snapshot Keuangan</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Tertagih Bulan Ini
                    </div>
                    <div className="font-semibold">
                      {formatIDR(homeQ.data?.finance.paidThisMonth ?? 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Tunggakan
                    </div>
                    <div className="font-semibold">
                      {homeQ.data?.finance.unpaidCount ?? 0} tagihan
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatIDR(homeQ.data?.finance.unpaidTotal ?? 0)}
                    </div>
                  </div>
                </div>
              </Card>

              <BillsSectionCard
                bills={homeQ.data?.finance.outstandingBills ?? []}
                dateFmt={dateFmt}
                formatIDR={formatIDR}
                seeAllPath="all-invoices"
                getPayHref={(b) => `/tagihan/${b.id}`}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolMainDashboard;
