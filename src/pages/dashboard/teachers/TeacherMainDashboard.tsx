import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, UserCog, Users } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import TodayScheduleCard, {
  type ScheduleItem,
} from "@/pages/dashboard/components/card/CTodayScheduleCard";

import {
  fetchTeacherHome,
  TEACHER_HOME_QK,
  type Announcement,
  type TodayClass,
  type UpcomingClass,
  type TeacherHomeResponse,
} from "./profiles/types/teacher";

import { useNavigate, useParams } from "react-router-dom";

/* ================= Utils ================= */
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/* ================= Small UI ================= */
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
    <Card className="flex items-center gap-3 p-4 md:p-5">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </Card>
  );
}

/* ================= Page ================= */
export default function TeacherMainDashboard() {
  const { data, isLoading } = useQuery<TeacherHomeResponse>({
    queryKey: TEACHER_HOME_QK,
    queryFn: fetchTeacherHome,
    staleTime: 60_000,
  });

  /* ============== Jadwal (3 Hari ke Depan) ============== */
  const scheduleItemsNext3Days = useMemo<ScheduleItem[]>(() => {
    const upcoming = data?.upcomingClasses ?? [];
    const start = startOfDay(new Date());
    const end = startOfDay(new Date());
    end.setDate(end.getDate() + 2);

    const within3Days = upcoming.filter((c) => {
      const d = startOfDay(new Date(c.dateISO));
      return d >= start && d <= end;
    });

    const src: (UpcomingClass | TodayClass)[] =
      within3Days.length > 0 ? within3Days : data?.todayClasses ?? [];

    return src.map((c) => ({
      id: c.id,
      title: `${c.className} — ${c.subject}`,
      subject: c.subject,
      teacher: "Anda",
      time: c.time,
    }));
  }, [data?.upcomingClasses, data?.todayClasses]);

  /* ============== Pengumuman ============== */
  const [, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    setAnnouncements(data?.announcements ?? []);
  }, [data?.announcements]);


  /* ============== Kelas Saya ============== */
  const managedClasses = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; students?: number; lastSubject?: string }
    >();
    (data?.todayClasses ?? []).forEach((c) => {
      const key = c.className;
      if (!map.has(key)) {
        map.set(key, {
          id: key.toLowerCase().replace(/\s+/g, "-"),
          name: key,
          students: c.studentCount,
          lastSubject: c.subject,
        });
      }
    });
    return Array.from(map.values());
  }, [data?.todayClasses]);

  /* ============== UI ============== */
  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Guru", value: 26, icon: <UserCog size={18} /> },
              { label: "Siswa", value: 342, icon: <Users size={18} /> },
              {
                label: "Program",
                value: 12,
                icon: <GraduationCap size={18} />,
              },
              { label: "Kelas", value: 18, icon: <BookOpen size={18} /> },
            ].map((k) => (
              <KpiTile key={k.label} {...k} />
            ))}
          </div>

          {/* Jadwal & Kelas */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-6">
              <TodayScheduleCard
                title="Jadwal 3 Hari Kedepan"
                items={scheduleItemsNext3Days}
                seeAllPath="#"
                maxItems={3}
              />
            </div>

            <div className="lg:col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Users size={18} /> Kelas yang Saya Kelola
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {managedClasses.length > 0 ? (
                    managedClasses.map((c) => <MyClassItem key={c.id} {...c} />)
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Belum ada kelas terdaftar.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Memuat data dashboard…
            </p>
          )}
        </div>
      </main>


    </div>
  );
}

/* ================= MyClassItem ================= */
function MyClassItem({
  name,
  students,
  lastSubject,
}: {
  name: string;
  students?: number;
  lastSubject?: string;
}) {
  const navigate = useNavigate();
  const { slug } = useParams();

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-sm text-muted-foreground truncate">
          {typeof students === "number" ? `${students} siswa` : "—"}{" "}
          {lastSubject ? `• ${lastSubject}` : ""}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          navigate(`/${slug}/guru/management-class/${name}`, {
            state: { className: name, students, lastSubject },
          })
        }
      >
        Kelola
      </Button>
    </div>
  );
}
