// src/pages/ParentChildDetail.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  MessageSquare,
  NotebookPen,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/* ===== Types ===== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

interface ChildDetail {
  id: string;
  name: string;
  className: string;
  iqraLevel?: string;
  memorizationJuz?: number;
  lastScore?: number;
}

interface TodaySummary {
  attendance: {
    status: AttendanceStatus; // Wajib
    mode?: "onsite" | "online";
    time?: string;
  };
  informasiUmum: string; // Wajib
  nilai?: number; // Opsional
  materiPersonal?: string; // Opsional
  penilaianPersonal?: string; // Opsional
  hafalan?: string; // Opsional
  pr?: string; // Opsional
}

interface AttendanceLog {
  date: string; // ISO
  status: AttendanceStatus;
  mode?: "onsite" | "online";
  time?: string;
}

interface NoteLog {
  date: string; // ISO
  informasiUmum: string; // Wajib
  materiPersonal?: string;
  penilaianPersonal?: string;
  nilai?: number;
  hafalan?: string;
  pr?: string;
}

interface FetchResult {
  parentName: string;
  child: ChildDetail;
  stats: {
    hadirCount: number;
    totalSessions: number;
    avgScore?: number;
    memorizationJuz?: number;
    iqraLevel?: string;
  };
  today: TodaySummary | null;
  attendanceHistory: AttendanceLog[];
  notesHistory: NoteLog[];
  contacts: { teacherName: string; phone?: string; email?: string };
}

/* ===== Date helpers (timezone-safe) ===== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const normalizeISOToLocalNoon = (iso?: string) =>
  iso ? toLocalNoonISO(new Date(iso)) : undefined;

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";


/* ===== Fake API (dibuat local-noon safe) ===== */
async function fetchChildDetail(): Promise<FetchResult> {
  const now = new Date();
  const todayIso = toLocalNoonISO(now);
  const minusDays = (n: number) =>
    toLocalNoonISO(new Date(now.getTime() - n * 864e5));

  return {
    parentName: "Bapak/Ibu",
    child: {
      id: "c1",
      name: "Ahmad",
      className: "TPA A",
      iqraLevel: "Iqra 2",
      memorizationJuz: 0.6,
      lastScore: 88,
    },
    stats: {
      hadirCount: 18,
      totalSessions: 20,
      avgScore: 86,
      memorizationJuz: 0.6,
      iqraLevel: "Iqra 2",
    },
    today: {
      attendance: { status: "hadir", mode: "onsite", time: "07:28" },
      informasiUmum:
        "Hari ini belajar ngaji & praktik sholat. Evaluasi wudhu dilakukan bergiliran.",
      nilai: 89,
      materiPersonal: "Membaca Al-Baqarah 255–257",
      penilaianPersonal:
        "Fokus meningkat, makhraj lebih baik; perhatikan mad thabi'i.",
      hafalan: "An-Naba 1–10",
      pr: "An-Naba 11–15 tambah hafalan",
    },
    attendanceHistory: [
      { date: todayIso, status: "hadir", mode: "onsite", time: "07:28" },
      { date: minusDays(1), status: "hadir", mode: "online", time: "07:35" },
      { date: minusDays(2), status: "izin" },
      { date: minusDays(3), status: "hadir", mode: "onsite", time: "07:31" },
      { date: minusDays(4), status: "sakit" },
      { date: minusDays(5), status: "hadir", mode: "onsite", time: "07:29" },
      { date: minusDays(6), status: "hadir", mode: "onsite", time: "07:33" },
    ],
    notesHistory: [
      {
        date: minusDays(1),
        informasiUmum: "Latihan tajwid: mad thabi'i.",
        materiPersonal: "Muroja'ah Iqra 2 halaman 10–12",
        nilai: 90,
        pr: "Latihan bacaan mad pada Iqra 2 halaman 13–14",
      },
      {
        date: minusDays(3),
        informasiUmum: "Praktik adab di kelas.",
        penilaianPersonal:
          "Perlu diingatkan tidak bercanda saat teman membaca.",
        hafalan: "Al-Fatihah 1–7",
      },
    ],
    contacts: {
      teacherName: "Ustadz Ali",
      phone: "+62 812-1111-2222",
      email: "ust.ali@sekolahislamku.id",
    },
  };
}

/* ===== Page ===== */
export default function StudentProgress() {
  const { data } = useQuery({
    queryKey: ["parent-child-detail"],
    queryFn: fetchChildDetail,
    staleTime: 60_000,
  });

  const child = data?.child;
  const gregorianISO = toLocalNoonISO(new Date());

  // helper badge variant untuk status
  const statusBadge = (s: AttendanceStatus) => {
    switch (s) {
      case "hadir":
        return { label: "Hadir", variant: "default" as const };
      case "online":
        return { label: "Online", variant: "secondary" as const };
      case "izin":
        return { label: "Izin", variant: "outline" as const };
      case "sakit":
        return { label: "Sakit", variant: "outline" as const };
      case "alpa":
        return { label: "Alpa", variant: "destructive" as const };
    }
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Konten utama */}
          <div className="flex-1 flex flex-col space-y-8 min-w-0 ">
            {/* Header + quick actions + stats */}
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
                      <BookOpen size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {child?.name ?? "—"}
                        <Badge variant="outline">
                          {child?.className ?? "Kelas"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dateLong(gregorianISO)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row">
                    <Link to="raport" className="w-full md:w-auto">
                      <Button
                        size="sm"
                        className="w-full md:w-auto inline-flex gap-2"
                      >
                        <FileSpreadsheet size={16} /> Lihat Rapor
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Kehadiran
                      </div>
                      <div className="mt-1 text-sm">
                        {data?.stats.hadirCount}/{data?.stats.totalSessions}{" "}
                        sesi
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Hafalan
                      </div>
                      <div className="mt-2">
                        <Progress
                          value={
                            (Math.min(2, data?.stats.memorizationJuz ?? 0) /
                              2) *
                            100
                          }
                        />
                        <div className="mt-1 text-sm text-muted-foreground">
                          ~ {data?.stats.memorizationJuz ?? 0} Juz
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Nilai Rata-rata
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {data?.stats.avgScore ?? "-"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Ringkasan Hari Ini */}
            {data?.today && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <CalendarDays size={18} className="text-primary" />
                    Ringkasan Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Absensi */}
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          Absensi
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {(() => {
                            const b = statusBadge(
                              data.today!.attendance.status
                            );
                            return (
                              <Badge
                                variant={b.variant}
                                className="inline-flex gap-1 items-center"
                              >
                                {data.today!.attendance.status === "hadir" && (
                                  <CheckCircle2 size={12} />
                                )}
                                {data.today!.attendance.status === "online" && (
                                  <Clock size={12} />
                                )}
                                {b.label}
                              </Badge>
                            );
                          })()}
                          {data.today.attendance.time && (
                            <span className="text-sm text-muted-foreground">
                              • {data.today.attendance.time}
                            </span>
                          )}
                        </div>
                        {data.today.attendance.mode && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {data.today.attendance.mode === "onsite"
                              ? "Tatap muka"
                              : "Online"}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Nilai */}
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          Nilai
                        </div>
                        <div className="mt-2 text-lg font-semibold">
                          {typeof data.today.nilai === "number"
                            ? data.today.nilai
                            : "-"}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Hafalan */}
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          Hafalan
                        </div>
                        <div className="mt-2 text-sm">
                          {data.today.hafalan ?? "-"}
                        </div>
                      </CardContent>
                    </Card>

                    {/* PR */}
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">PR</div>
                        <div className="mt-2 text-sm">
                          {data.today.pr ?? "-"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Info umum + catatan personal */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card className="bg-card/60">
                      <CardContent className="p-3">
                        <div className="text-sm text-muted-foreground">
                          Informasi Umum
                        </div>
                        <p className="mt-1 text-sm">
                          {data.today.informasiUmum}
                        </p>
                      </CardContent>
                    </Card>

                    {(data.today.materiPersonal ||
                      data.today.penilaianPersonal) && (
                      <Card className="bg-card/60">
                        <CardContent className="p-3">
                          <div className="text-sm text-muted-foreground">
                            Catatan Personal
                          </div>
                          {data.today.materiPersonal && (
                            <p className="mt-1 text-sm">
                              <span className="font-medium">Materi:</span>{" "}
                              {data.today.materiPersonal}
                            </p>
                          )}
                          {data.today.penilaianPersonal && (
                            <p className="mt-1 text-sm">
                              <span className="font-medium">Penilaian:</span>{" "}
                              {data.today.penilaianPersonal}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Riwayat Absensi */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" />
                  Riwayat Absensi (7 Hari)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {(data?.attendanceHistory ?? []).map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border px-3 py-2 bg-card/60"
                    >
                      <div className="text-sm">
                        <div className="font-medium">
                          {dateShort(normalizeISOToLocalNoon(a.date))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {a.mode
                            ? a.mode === "onsite"
                              ? "Tatap muka"
                              : "Online"
                            : ""}{" "}
                          {a.time ? `• ${a.time}` : ""}
                        </div>
                      </div>
                      <div>
                        <Badge variant={statusBadge(a.status).variant}>
                          {statusBadge(a.status).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <Link to="absensi" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center inline-flex gap-2"
                    >
                      Lihat selengkapnya{" "}
                      <ChevronRight className="ml-1" size={16} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Riwayat Catatan & Hafalan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <NotebookPen size={18} className="text-primary" />
                  Riwayat Catatan & Hafalan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 text-muted-foreground">
                  {(data?.notesHistory ?? []).map((n, i) => (
                    <div key={i} className="rounded-xl border p-3 bg-card/60">
                      <div className="text-sm mb-1">
                        {dateLong(normalizeISOToLocalNoon(n.date))}
                      </div>
                      <div className="space-y-1 text-sm text-foreground/90">
                        <div>
                          <span className="font-medium">Info Umum:</span>{" "}
                          {n.informasiUmum}
                        </div>
                        {n.materiPersonal && (
                          <div>
                            <span className="font-medium">Materi:</span>{" "}
                            {n.materiPersonal}
                          </div>
                        )}
                        {n.hafalan && (
                          <div>
                            <span className="font-medium">Hafalan:</span>{" "}
                            {n.hafalan}
                          </div>
                        )}
                        {n.penilaianPersonal && (
                          <div>
                            <span className="font-medium">Penilaian:</span>{" "}
                            {n.penilaianPersonal}
                          </div>
                        )}
                        {typeof n.nilai === "number" && (
                          <div>
                            <span className="font-medium">Nilai:</span>{" "}
                            {n.nilai}
                          </div>
                        )}
                        {n.pr && (
                          <div>
                            <span className="font-medium">PR:</span> {n.pr}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-3">
                    <Link to="catatan-hasil" className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center inline-flex gap-2"
                      >
                        Lihat selengkapnya{" "}
                        <ChevronRight className="ml-1" size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kontak Guru */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  Kontak Guru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {data?.contacts.teacherName}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
                      {data?.contacts.phone && (
                        <a
                          href={`tel:${data.contacts.phone.replace(
                            /\s+/g,
                            ""
                          )}`}
                          className="inline-flex items-center gap-1"
                          aria-label={`Telepon ${data.contacts.phone}`}
                        >
                          <Phone size={14} /> {data.contacts.phone}
                        </a>
                      )}
                      {data?.contacts.email && (
                        <a
                          href={`mailto:${data.contacts.email}`}
                          className="inline-flex items-center gap-1"
                          aria-label={`Email ${data.contacts.email}`}
                        >
                          <Mail size={14} /> {data.contacts.email}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row">
                    <Link to="/student/komunikasi" className="w-full md:w-auto">
                      <Button className="w-full md:w-auto inline-flex gap-2">
                        <MessageSquare size={16} /> Kirim Pesan
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
