// src/pages/StudentAbsenceDetail.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Filter,
  Percent,
  BookOpen,
} from "lucide-react";
import { useMemo } from "react";

// ⬇️ shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ================= Types ================= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceStatusFilter = AttendanceStatus | "all";
type AttendanceMode = "onsite" | "online";
type AttendanceModeFilter = AttendanceMode | "all";

type CourseLite = { id: string; name: string };

interface AttendanceLog {
  date: string; // ISO
  status: AttendanceStatus;
  mode?: AttendanceMode;
  time?: string;
  courseId: string;
  courseName: string;
}

type Stats = { total: number } & Record<AttendanceStatus, number>;

interface AbsenceFetch {
  student: { id: string; name: string; className: string };
  courses: CourseLite[];
  logs: AttendanceLog[]; // gabungan semua mapel
}

/* =============== Labels =============== */
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  online: "Online",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};

// map sederhana ke variant Badge bawaan shadcn
const STATUS_BADGE: Record<
  AttendanceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  hadir: "default",
  online: "secondary",
  izin: "outline",
  sakit: "outline",
  alpa: "destructive",
};

const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

/* ======= Helpers untuk grouping per tanggal (gaya ScheduleList) ======= */
const pad2 = (n: number) => n.toString().padStart(2, "0");
const ymd = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const fmtFullDate = (key: string) =>
  new Date(key).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* ================= Dummy API ================= */
const toIso = (d: Date) => d.toISOString();
const makeDay = (dOffset: number) => new Date(Date.now() - dOffset * 864e5);

function statusFor(i: number): AttendanceStatus {
  if (i % 9 === 2) return "izin";
  if (i % 9 === 4) return "sakit";
  if (i % 11 === 6) return "alpa";
  if (i % 5 === 1) return "online";
  return "hadir";
}
function timeFor(status: AttendanceStatus): string | undefined {
  if (status === "hadir" || status === "online") {
    const hh = 7;
    const mm = 25 + Math.floor(Math.random() * 10);
    return `${hh.toString().padStart(2, "0")}:${mm}`;
  }
  return undefined;
}
function modeFor(status: AttendanceStatus): AttendanceMode | undefined {
  if (status === "hadir") return "onsite";
  if (status === "online") return "online";
  return undefined;
}

async function fetchAbsence(
  childId?: string,
  days = 30
): Promise<AbsenceFetch> {
  // Anggap 5 mapel aktif
  const courses: CourseLite[] = [
    { id: "c-bg", name: "Balaghah Dasar" },
    { id: "c-na", name: "Nahwu Lanjutan" },
    { id: "c-sh", name: "Sharf Terapan" },
    { id: "c-ul", name: "Ulum Al-Qur'an" },
    { id: "c-kb", name: "Keterampilan Bahasa" },
  ];

  // Buat log random; setiap hari pilih 1–2 mapel yang punya sesi
  const logs: AttendanceLog[] = Array.from({ length: days }).flatMap(
    (_, idx) => {
      const countToday = idx % 3 === 0 ? 2 : 1; // kadang 2 sesi per hari
      return Array.from({ length: countToday }).map((__, j) => {
        const course = courses[(idx + j) % courses.length];
        const st = statusFor(idx + j);
        return {
          date: toIso(makeDay(idx)),
          status: st,
          mode: modeFor(st),
          time: timeFor(st),
          courseId: course.id,
          courseName: course.name,
        };
      });
    }
  );

  return {
    student: { id: childId ?? "c1", name: "Ahmad", className: "TPA A" },
    courses,
    logs,
  };
}

/* ================= Page ================= */
export default function StudentAbsence() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const childId = sp.get("child") ?? undefined;

  // Parse query params safely
  const rawPeriod = sp.get("period");
  const period: "7" | "30" | "all" =
    rawPeriod === "7" || rawPeriod === "all" ? rawPeriod : "30";

  const asStatusFilter = (v: string | null): AttendanceStatusFilter =>
    v === "all" ||
    v === "hadir" ||
    v === "online" ||
    v === "izin" ||
    v === "sakit" ||
    v === "alpa"
      ? v
      : "all";
  const asModeFilter = (v: string | null): AttendanceModeFilter =>
    v === "all" || v === "onsite" || v === "online" ? v : "all";

  const status: AttendanceStatusFilter = asStatusFilter(sp.get("status"));
  const mode: AttendanceModeFilter = asModeFilter(sp.get("mode"));
  const course = sp.get("course") ?? "all"; // "all" | courseId

  const { data: s, isLoading } = useQuery({
    queryKey: ["student-absence", childId, period],
    queryFn: () =>
      fetchAbsence(childId, period === "all" ? 60 : Number(period)),
    staleTime: 60_000,
  });

  // 1) Filter berdasarkan course + status + mode
  const filtered = useMemo(() => {
    if (!s) return [];
    return s.logs.filter((l) => {
      const matchCourse = course === "all" ? true : l.courseId === course;
      const matchStatus = status === "all" ? true : l.status === status;
      const matchMode = mode === "all" ? true : l.mode === mode;
      return matchCourse && matchStatus && matchMode;
    });
  }, [s, course, status, mode]);

  // 2) Hitung ulang STAT dari hasil filter (kompromi gabungan/per-mapel)
  const derivedStats: Stats = useMemo(() => {
    const base: Stats = {
      total: 0,
      hadir: 0,
      online: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
    };
    for (const l of filtered) {
      base.total += 1;
      base[l.status] += 1;
    }
    return base;
  }, [filtered]);

  // 3) Kelompokkan daftar per tanggal (descending), gaya ScheduleList
  const groupedByDay = useMemo(() => {
    const g = new Map<string, AttendanceLog[]>();
    const sorted = [...filtered].sort(
      (a, b) =>
        +new Date(b.date) - +new Date(a.date) ||
        (b.time ?? "").localeCompare(a.time ?? "")
    );
    for (const row of sorted) {
      const key = ymd(row.date);
      const arr = g.get(key) ?? [];
      arr.push(row);
      g.set(key, arr);
    }
    const keys = Array.from(g.keys()).sort(
      (a, b) => +new Date(b) - +new Date(a)
    );
    return { keys, g };
  }, [filtered]);

  const handleChange = (
    key: "period" | "status" | "mode" | "course",
    value: string
  ) => {
    const next = new URLSearchParams(sp);
    next.set(key, value);
    setSp(next, { replace: true });
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Konten utama */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="md:flex hidden items-center gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="cursor-pointer inline-flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Kembali
              </Button>

              <h1 className="text-lg font-semibold">Absensi Kehadiran</h1>
            </div>

            {/* Ringkasan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  Ringkasan{" "}
                  {course !== "all" && (
                    <span className="text-muted-foreground">
                      • {s?.courses.find((c) => c.id === course)?.name}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">Memuat…</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    {(
                      [
                        { key: "hadir" as const, label: "Hadir" },
                        { key: "online" as const, label: "Online" },
                        { key: "izin" as const, label: "Izin" },
                        { key: "sakit" as const, label: "Sakit" },
                        { key: "alpa" as const, label: "Alpa" },
                      ] as const
                    ).map(({ key, label }) => {
                      const value = derivedStats[key];
                      const pct =
                        derivedStats.total === 0
                          ? 0
                          : Math.round((value / derivedStats.total) * 100);
                      return (
                        <Card key={key} className="bg-card/60">
                          <CardContent className="p-3">
                            <div className="text-sm text-muted-foreground">
                              {label}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant={STATUS_BADGE[key]}>{value}</Badge>
                              <span className="text-sm inline-flex items-center gap-1 text-muted-foreground">
                                <Percent size={12} /> {pct}%
                              </span>
                            </div>
                            <div className="mt-2">
                              <Progress value={pct} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          Total Sesi
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline">{derivedStats.total}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Periode */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      Periode
                    </label>
                    <Select
                      value={period}
                      onValueChange={(v) => handleChange("period", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 hari terakhir</SelectItem>
                        <SelectItem value="30">30 hari terakhir</SelectItem>
                        <SelectItem value="all">Semua (60 hari)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mapel */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      Mata Pelajaran
                    </label>
                    <Select
                      value={course}
                      onValueChange={(v) => handleChange("course", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua mapel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {(s?.courses ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={(v) => handleChange("status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="hadir">Hadir</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="izin">Izin</SelectItem>
                        <SelectItem value="sakit">Sakit</SelectItem>
                        <SelectItem value="alpa">Alpa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mode */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">
                      Mode
                    </label>
                    <Select
                      value={mode}
                      onValueChange={(v) => handleChange("mode", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="onsite">Tatap muka</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daftar Absensi — gaya ScheduleList (group by tanggal) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  Daftar Absensi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {groupedByDay.keys.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    Tidak ada data untuk filter saat ini.
                  </div>
                ) : (
                  <div>
                    {groupedByDay.keys.map((key) => (
                      <div key={key} className="border-t first:border-t-0">
                        {/* Header tanggal */}
                        <div className="px-4 py-2 bg-muted/50 text-xs font-medium">
                          {fmtFullDate(key)}
                        </div>

                        <ul className="divide-y">
                          {groupedByDay.g.get(key)!.map((a, idx) => (
                            <li
                              key={`${key}-${a.courseId}-${idx}`}
                              className="p-3"
                            >
                              <div className="flex items-start gap-3">
                                {/* Jam kiri */}
                                <div className="w-16 shrink-0 text-left">
                                  <div className="text-[11px]">
                                    {a.time ?? "—"}
                                  </div>
                                </div>

                                {/* Info utama */}
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium flex items-center gap-2 truncate">
                                    <span className="truncate">
                                      {dateShort(a.date)}
                                    </span>
                                    {/* Mapel (hanya saat filter = Semua) */}
                                    {course === "all" && (
                                      <Badge
                                        variant="outline"
                                        className="inline-flex items-center gap-1"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        {a.courseName}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-0.5">
                                    {a.mode && (
                                      <span className="inline-flex items-center gap-1">
                                        <span
                                          className={`h-2 w-2 rounded-full ${
                                            a.mode === "online"
                                              ? "bg-yellow-500"
                                              : "bg-primary"
                                          }`}
                                        />
                                        {a.mode === "onsite"
                                          ? "Tatap muka"
                                          : "Online"}
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1">
                                      {dateLong(a.date)}
                                    </span>
                                  </div>
                                </div>

                                {/* Status kanan */}
                                <Badge variant={STATUS_BADGE[a.status]}>
                                  {STATUS_LABEL[a.status]}
                                </Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
