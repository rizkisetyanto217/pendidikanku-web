// src/pages/sekolahislamku/student/StudentSchedule.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowLeft, Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* =========================
   Types
========================= */
type RoutineDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun .. 6=Sat
type RoutineItem = {
  id: string;
  weekday: RoutineDay;
  time: string; // "HH:mm"
  durationMin?: number;
  title: string;
  className?: string;
  room?: string;
  mode?: "online" | "onsite";
  note?: string;
  active?: boolean;
};

type OnceType = "class" | "exam" | "event";
type OnceRow = {
  id: string;
  title: string;
  date: string; // ISO
  time?: string; // "HH:mm"
  room?: string;
  type?: OnceType;
  description?: string;
  className?: string;
  mode?: "online" | "onsite";
};

/* =========================
   Dummy stores & helpers
========================= */
const weekdayName = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jum'at",
  "Sabtu",
];

const studentRoutineStore: RoutineItem[] = [];
const studentOnceStore: OnceRow[] = [];

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* =========================
   Dummy API (read-only)
========================= */
const studentRoutineApi = {
  async list(): Promise<RoutineItem[]> {
    await delay();
    if (studentRoutineStore.length === 0) {
      studentRoutineStore.push(
        {
          id: uid(),
          weekday: 1, // Senin
          time: "07:00",
          durationMin: 90,
          title: "Tahsin Al-Qur'an",
          className: "TPA A",
          room: "Aula 1",
          mode: "onsite",
          active: true,
        },
        {
          id: uid(),
          weekday: 3, // Rabu
          time: "09:30",
          durationMin: 60,
          title: "Matematika",
          className: "7C",
          room: "R. 3B",
          mode: "onsite",
          active: true,
        },
        {
          id: uid(),
          weekday: 5, // Jumat
          time: "19:30",
          durationMin: 75,
          title: "Bahasa Arab (Online)",
          className: "BA 9C",
          room: "Zoom",
          mode: "online",
          note: "Link dibagikan di grup",
          active: true,
        }
      );
    }
    // sort by weekday + time
    const ret = structuredClone(studentRoutineStore).sort((a, b) =>
      a.weekday !== b.weekday
        ? a.weekday - b.weekday
        : a.time.localeCompare(b.time)
    );
    return ret;
  },
};

const studentOnceApi = {
  async list(): Promise<OnceRow[]> {
    await delay();
    if (studentOnceStore.length === 0) {
      const now = new Date();
      const mk = (plusDays: number, hour = 9) =>
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + plusDays,
          hour,
          0
        ).toISOString();

      studentOnceStore.push(
        // EXAM (upcoming)
        {
          id: uid(),
          title: "UH Tajwid Bab 1",
          className: "TPA A",
          type: "exam",
          date: mk(2, 8),
          time: "08:00",
          room: "R. Ujian 2",
          mode: "onsite",
          description: "Siapkan pensil 2B & penghapus",
        },
        // EVENT (today)
        {
          id: uid(),
          title: "Rapat Orang Tua",
          type: "event",
          date: mk(0, 13),
          time: "13:00",
          room: "Aula Utama",
          description: "Orangtua/wali hadir tepat waktu",
        },
        // CLASS (one-off replacement)
        {
          id: uid(),
          title: "Pengganti BTQ Pekan Lalu",
          className: "BTQ 2",
          type: "class",
          date: mk(1, 16),
          time: "16:00",
          room: "R. 1A",
          description: "Materi: Panjang-Pendek",
        },
        // EXAM (past)
        {
          id: uid(),
          title: "UTS Hafalan Juz 30",
          className: "TPA A",
          type: "exam",
          date: mk(-7, 9),
          time: "09:00",
          room: "Online",
          mode: "online",
          description: "Nilai akan diumumkan pekan ini",
        },
        // EVENT (upcoming)
        {
          id: uid(),
          title: "Seminar Tamu: Adab Penuntut Ilmu",
          type: "event",
          date: mk(10, 9),
          time: "09:00",
          room: "Masjid Sekolah",
          description: "Terbuka untuk umum",
        }
      );
    }
    return structuredClone(
      studentOnceStore.sort((a, b) => +new Date(a.date) - +new Date(b.date))
    );
  },
};

/* =========================
   Read-only Board Rutin
========================= */
function RoutineBoardStudent({ data }: { data: RoutineItem[] }) {
  const byDay = useMemo(() => {
    const map: Record<number, RoutineItem[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    data.forEach((it) => map[it.weekday].push(it));
    (Object.keys(map) as unknown as RoutineDay[]).forEach((d) =>
      map[d].sort((a, b) => a.time.localeCompare(b.time))
    );
    return map;
  }, [data]);

  const daysWithData = useMemo(() => {
    const ordered: RoutineDay[] = [1, 2, 3, 4, 5, 6, 0]; // mulai Senin
    return ordered.filter((d) => byDay[d] && byDay[d].length > 0);
  }, [byDay]);

  const todayIdx = new Date().getDay() as RoutineDay;

  if (daysWithData.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground p-6 text-center">
        <div className="font-medium mb-2">Belum ada jadwal rutin</div>
        <p className="text-sm text-muted-foreground">
          Jadwal mingguan akan tampil di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {daysWithData.map((d) => {
        const isToday = d === todayIdx;
        return (
          <div
            key={d}
            className={[
              "rounded-xl border bg-card text-card-foreground transition-shadow",
              isToday ? "ring-2 ring-primary/40 bg-primary/5" : "",
            ].join(" ")}
          >
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-medium">{weekdayName[d]}</div>
                {isToday && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    Hari ini
                  </span>
                )}
              </div>
            </div>
            <Separator />
            <div className="p-2 space-y-2">
              {byDay[d].map((it) => (
                <div
                  key={it.id}
                  className={[
                    "rounded-lg border p-2 bg-background",
                    it.active === false ? "opacity-60" : "",
                    isToday ? "border-primary/50" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Clock size={12} />
                      {it.time}
                      {it.durationMin ? ` • ${it.durationMin}m` : null}
                    </Badge>
                    {it.className ? (
                      <Badge variant="outline" className="gap-1">
                        <Users size={12} />
                        {it.className}
                      </Badge>
                    ) : null}
                    {it.mode ? (
                      <Badge variant="outline" className="ml-auto">
                        {it.mode === "online" ? "Online" : "Onsite"}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {it.room ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {it.room}
                      </span>
                    ) : null}
                    {it.note ? <span>• {it.note}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   Read-only Once List + filter
========================= */
function OnceListStudent({
  data,
  loading,
}: {
  data: OnceRow[];
  loading?: boolean;
}) {
  const [filter, setFilter] = useState<OnceType | "all">("all");

  const filtered = useMemo(
    () =>
      data.filter((r) => filter === "all" || (r.type ?? "event") === filter),
    [data, filter]
  );

  const isSameDay = (iso?: string) => {
    if (!iso) return false;
    const a = new Date(iso);
    const b = new Date();
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  return (
    <div className="rounded-xl border">
      <div className="p-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Jadwal Sekali / Acara</div>
          <div className="text-sm text-muted-foreground">
            Ujian, pengganti kelas, dan acara insidental
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => setFilter((v as any) ?? "all")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="exam">Ujian</SelectItem>
              <SelectItem value="class">Kelas</SelectItem>
              <SelectItem value="event">Acara</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator />
      <div className="p-3 space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">Tidak ada data</div>
        ) : (
          filtered.map((r) => {
            const today = isSameDay(r.date);
            return (
              <div
                key={r.id}
                className={[
                  "rounded-lg border p-3 bg-background",
                  today ? "border-primary/60 bg-primary/5" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {r.type ?? "event"}
                  </Badge>
                  {r.className ? (
                    <Badge variant="outline">{r.className}</Badge>
                  ) : null}
                  {r.mode ? (
                    <Badge variant="outline">
                      {r.mode === "online" ? "Online" : "Onsite"}
                    </Badge>
                  ) : null}
                  <div className="font-medium">{r.title}</div>
                  {today && (
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      Hari ini
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />{" "}
                    {new Date(r.date).toLocaleString("id-ID")}
                  </span>
                  {r.room ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {r.room}
                    </span>
                  ) : null}
                </div>
                {r.description ? (
                  <div className="text-sm mt-2">{r.description}</div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* =========================
   Page: Student Schedule (read-only)
========================= */
export default function StudentScheduleRoutine() {
  const navigate = useNavigate();
  const LOCAL_KEY = "studentScheduleTab";
  const [tab, setTab] = useState<"routine" | "once">("routine");

  useEffect(() => {
    const saved = (localStorage.getItem(LOCAL_KEY) || "") as "routine" | "once";
    if (["routine", "once"].includes(saved)) setTab(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, tab);
  }, [tab]);

  const routineQ = useQuery({
    queryKey: ["student-routines"],
    queryFn: () => studentRoutineApi.list(),
    staleTime: 60_000,
  });

  const onceQ = useQuery({
    queryKey: ["student-once"],
    queryFn: () => studentOnceApi.list(),
    staleTime: 60_000,
  });

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
              Lihat jadwal rutin mingguan dan kegiatan sekali
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="w-full"
        >
          <TabsList className="w-fit flex-wrap">
            <TabsTrigger value="routine">Rutin (Mingguan)</TabsTrigger>
            <TabsTrigger value="once">Sekali / Acara</TabsTrigger>
          </TabsList>

          {/* Rutin */}
          <TabsContent value="routine" className="mt-4">
            <RoutineBoardStudent data={routineQ.data ?? []} />
            {/* Keterangan kecil */}
            <div className="text-xs text-muted-foreground mt-3">
              Jadwal disediakan oleh guru. Hubungi wali kelas jika ada
              perbedaan.
            </div>
          </TabsContent>

          {/* Sekali / Acara */}
          <TabsContent value="once" className="mt-4">
            <OnceListStudent
              data={onceQ.data ?? []}
              loading={onceQ.isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
