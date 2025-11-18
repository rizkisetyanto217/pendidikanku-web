import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type {
  RoutineItem,
  RoutineDay,
} from "@/pages/dashboard/teachers/schedules/routines/TeacherScheduleRoutine";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

const weekdayLong = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jum'at",
  "Sabtu",
];

function parseTimeToDate(base: Date, time: string): Date {
  const [h, m] = time.split(":").map((x) => Number(x) || 0);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function getNextOccurrences(r: RoutineItem, count = 4): Date[] {
  const results: Date[] = [];
  const now = new Date();

  // mulai dari hari ini pada jam rutin
  let current = parseTimeToDate(now, r.time);
  const todayIdx = now.getDay() as RoutineDay;

  let diff = (r.weekday - todayIdx + 7) % 7;
  if (diff === 0 && current < now) {
    diff = 7;
  }
  current.setDate(current.getDate() + diff);

  for (let i = 0; i < count; i++) {
    results.push(new Date(current));
    current = new Date(current);
    current.setDate(current.getDate() + 7);
  }
  return results;
}


export default function TeacherScheduleRoutineDetail() {
  const navigate = useNavigate();
  const params = useParams<{ routineId: string }>();
  const location = useLocation();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Jadwal Rutin",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Jadwal" },
        { label: "Rutin", href: "jadwal/rutin" },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const routine = location.state?.routine as RoutineItem | undefined;

  const nextOccurrences = useMemo(
    () => (routine ? getNextOccurrences(routine, 4) : []),
    [routine]
  );

  if (!routine) {
    // fallback kalau user akses langsung tanpa state
    return (
      <div className="w-full bg-background text-foreground">
        <div className="mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="font-semibold text-base">Jadwal Rutin</div>
              <p className="text-sm text-muted-foreground">
                Data jadwal tidak ditemukan. Coba kembali dari halaman daftar.
              </p>
            </div>
          </div>

          <Card className="mt-2">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Kemungkinan kamu mengakses URL ini langsung:{" "}
                <code className="px-1 py-0.5 rounded bg-muted text-xs">
                  {params.routineId}
                </code>
                . Nanti bagian ini bisa dihubungkan ke API backend untuk ambil
                detail berdasarkan ID.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const dayLabel = weekdayLong[routine.weekday];
  const isActive = routine.active !== false;

  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="md:flex hidden items-center gap-3 mt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="font-semibold text-lg md:text-xl">Detail Jadwal Rutin</div>
            <p className="text-sm text-muted-foreground">
              {routine.title || "Tanpa judul"} • {dayLabel} {routine.time}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">
                  {routine.title || "Tanpa judul"}
                </CardTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <CalendarDays size={14} />
                    {dayLabel}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock size={14} />
                    {routine.time}
                    {routine.durationMin
                      ? ` • ${routine.durationMin} menit`
                      : null}
                  </Badge>
                  {routine.className ? (
                    <Badge variant="outline" className="gap-1">
                      <Users size={14} />
                      {routine.className}
                    </Badge>
                  ) : null}
                  {isActive ? (
                    <Badge
                      className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                      variant="outline"
                    >
                      Aktif
                    </Badge>
                  ) : (
                    <Badge
                      className="gap-1 bg-muted text-muted-foreground"
                      variant="outline"
                    >
                      Nonaktif
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />

            {/* Info utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  Informasi Kelas
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  {routine.className && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Kelas</span>
                      <span className="font-medium">{routine.className}</span>
                    </div>
                  )}
                  {routine.teacher && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pengajar</span>
                      <span className="font-medium">{routine.teacher}</span>
                    </div>
                  )}
                  {routine.className || routine.teacher || (
                    <div className="text-xs text-muted-foreground">
                      Belum ada info kelas / pengajar.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  Lokasi & Catatan
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  {routine.room && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin size={14} />
                        Ruang
                      </span>
                      <span className="font-medium">{routine.room}</span>
                    </div>
                  )}
                  {routine.note && (
                    <div className="mt-2 text-xs">
                      <div className="text-muted-foreground mb-0.5">
                        Catatan:
                      </div>
                      <div>{routine.note}</div>
                    </div>
                  )}
                  {!routine.room && !routine.note && (
                    <div className="text-xs text-muted-foreground">
                      Belum ada lokasi atau catatan tambahan.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Next occurrences */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">
                  Jadwal Mendatang
                </div>
              </div>
              {nextOccurrences.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  Tidak dapat menghitung jadwal mendatang.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {nextOccurrences.map((dt, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border bg-background p-2 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium">
                          {dt.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          {dt.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
