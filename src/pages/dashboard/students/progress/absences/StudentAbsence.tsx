// src/pages/StudentAbsenceDetail.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Filter, Percent } from "lucide-react";
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

interface AttendanceLog {
  date: string; // ISO
  status: AttendanceStatus;
  mode?: AttendanceMode;
  time?: string;
}

type Stats = { total: number } & Record<AttendanceStatus, number>;

interface AbsenceFetch {
  student: { id: string; name: string; className: string };
  stats: Stats;
  logs: AttendanceLog[];
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
  const logs: AttendanceLog[] = Array.from({ length: days }).map((_, idx) => {
    const st = statusFor(idx);
    return {
      date: toIso(makeDay(idx)),
      status: st,
      mode: modeFor(st),
      time: timeFor(st),
    };
  });

  const stats = logs.reduce<Stats>(
    (acc, l) => {
      acc.total += 1;
      acc[l.status] += 1;
      return acc;
    },
    { total: 0, hadir: 0, online: 0, izin: 0, sakit: 0, alpa: 0 }
  );

  return {
    student: { id: childId ?? "c1", name: "Ahmad", className: "TPA A" },
    stats,
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

  const { data: s, isLoading } = useQuery({
    queryKey: ["student-absence", childId, period],
    queryFn: () =>
      fetchAbsence(childId, period === "all" ? 60 : Number(period)),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!s) return [];
    return s.logs.filter((l) => {
      const matchStatus = status === "all" ? true : l.status === status;
      const matchMode = mode === "all" ? true : l.mode === mode;
      return matchStatus && matchMode;
    });
  }, [s, status, mode]);

  const handleChange = (key: "period" | "status" | "mode", value: string) => {
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
                  Ringkasan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="text-sm text-muted-foreground">Memuat…</div>
                )}
                {s && (
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
                      const value = s.stats[key];
                      const pct =
                        s.stats.total === 0
                          ? 0
                          : Math.round((value / s.stats.total) * 100);
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
                          <Badge variant="outline">{s.stats.total}</Badge>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* Daftar Absensi */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  Daftar Absensi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {filtered.length === 0 && (
                    <div className="rounded-xl border px-3 py-3 text-sm text-muted-foreground bg-card/60">
                      Tidak ada data untuk filter saat ini.
                    </div>
                  )}

                  {filtered.map((a) => (
                    <div
                      key={a.date}
                      className="flex items-center justify-between rounded-xl border px-3 py-2 bg-card/60"
                    >
                      <div className="text-sm">
                        <div className="font-medium">{dateShort(a.date)}</div>
                        <div className="text-sm text-muted-foreground">
                          {a.mode
                            ? a.mode === "onsite"
                              ? "Tatap muka"
                              : "Online"
                            : ""}{" "}
                          {a.time ? `• ${a.time}` : ""}
                        </div>
                        <div className="text-sm mt-1 text-muted-foreground">
                          {dateLong(a.date)}
                        </div>
                      </div>
                      <Badge variant={STATUS_BADGE[a.status]}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
