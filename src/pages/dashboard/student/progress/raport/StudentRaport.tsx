// src/pages/StudentReport.tsx
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LineChart,
  Percent,
  User2,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/* ================= Types ================ */

interface ReportFetch {
  student: { id: string; name: string; className: string };
  period: { label: string; start: string; end: string };
  attendance: {
    totalSessions: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    online: number;
  };
  scores: {
    tajwid: number;
    tilawah: number;
    hafalan: number;
    fikih: number;
    akhlak: number;
    average: number;
    min: number;
    max: number;
  };
  memorization: {
    juzProgress: number; // mis. 0.6 = ~0.6 juz
    iqraLevel?: string;
    latest: Array<{
      date: string;
      item: string;
      type: "setoran" | "murajaah";
      score?: number;
      note?: string;
    }>;
  };
  remarks: { homeroom: string; recommendations?: string[] };
}

/* ============== Fake API (dummy rapor) ============= */
async function fetchReport(): Promise<ReportFetch> {
  const today = new Date();
  const iso = (d: Date) => d.toISOString();
  const start = new Date(today.getFullYear(), 6, 15);
  const end = new Date(today.getFullYear(), 11, 15);

  const scores = {
    tajwid: 88,
    tilawah: 91,
    hafalan: 86,
    fikih: 84,
    akhlak: 92,
  };
  const vals = Object.values(scores);
  const average =
    Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;

  return {
    student: { id: "c1", name: "Ahmad", className: "TPA A" },
    period: {
      label: "Semester Ganjil 2025/2026",
      start: iso(start),
      end: iso(end),
    },
    attendance: {
      totalSessions: 20,
      hadir: 18,
      sakit: 1,
      izin: 1,
      alpa: 0,
      online: 2,
    },
    scores: {
      ...scores,
      average,
      min: Math.min(...vals),
      max: Math.max(...vals),
    },
    memorization: {
      juzProgress: 0.6,
      iqraLevel: "Iqra 2",
      latest: [
        {
          date: new Date().toISOString(),
          item: "An-Naba 1–10",
          type: "setoran",
          score: 90,
          note: "Makhraj bagus, perhatikan mad thabi'i.",
        },
        {
          date: new Date(Date.now() - 864e5 * 2).toISOString(),
          item: "Al-Baqarah 255–257",
          type: "murajaah",
          score: 88,
        },
      ],
    },
    remarks: {
      homeroom:
        "Alhamdulillah, progress sangat baik. Fokus meningkat, bacaan lebih tartil. Pertahankan adab ketika teman mendapat giliran.",
      recommendations: [
        "Latihan mad thabi'i 5 menit/hari.",
        "PR: An-Naba 11–15 (lanjutan).",
      ],
    },
  };
}

/* ============== Helpers ============= */
const toID = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function grade(num: number) {
  if (num >= 90) return { label: "A", variant: "default" as const };
  if (num >= 80) return { label: "B", variant: "secondary" as const };
  if (num >= 70) return { label: "C", variant: "outline" as const };
  if (num >= 60) return { label: "D", variant: "outline" as const };
  return { label: "E", variant: "destructive" as const };
}

/* ============== Page ============= */
export default function StudentRaport() {
  const navigate = useNavigate();
  const { data: s, isLoading } = useQuery({
    queryKey: ["student-report"],
    queryFn: fetchReport,
    staleTime: 60_000,
  });

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header */}
          <div className="md:flex hidden items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Kembali
            </Button>
            <h1 className="text-lg font-semibold">Raport Siswa</h1>
          </div>

          {/* Ringkasan Siswa & Periode */}
          <Card>
            <CardContent className="p-4 md:p-5">
              {isLoading && (
                <div className="text-sm text-muted-foreground">Memuat…</div>
              )}
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">Siswa</div>
                      <div className="mt-1 flex items-center gap-2">
                        <User2 size={16} />
                        <div className="font-medium">{s.student.name}</div>
                      </div>
                      <div className="text-sm mt-1 text-muted-foreground">
                        Kelas: {s.student.className}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Periode
                      </div>
                      <div className="mt-1 font-medium">{s.period.label}</div>
                      <div className="text-sm mt-1 text-muted-foreground">
                        {toID(s.period.start)} — {toID(s.period.end)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Rata-rata Nilai
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-2xl font-semibold">
                          {s.scores.average}
                        </span>
                        <Badge variant={grade(s.scores.average).variant}>
                          <Award size={14} className="mr-1" />
                          {grade(s.scores.average).label}
                        </Badge>
                      </div>
                      <div className="text-sm mt-1 text-muted-foreground">
                        Min {s.scores.min} • Max {s.scores.max}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rekap Absensi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CalendarDays size={18} className="text-primary" />
                Rekap Absensi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    {
                      label: "Hadir",
                      value: s.attendance.hadir,
                      variant: "default" as const,
                    },
                    {
                      label: "Online",
                      value: s.attendance.online,
                      variant: "secondary" as const,
                    },
                    {
                      label: "Izin",
                      value: s.attendance.izin,
                      variant: "outline" as const,
                    },
                    {
                      label: "Sakit",
                      value: s.attendance.sakit,
                      variant: "outline" as const,
                    },
                    {
                      label: "Alpa",
                      value: s.attendance.alpa,
                      variant: "destructive" as const,
                    },
                  ].map((it) => {
                    const pct =
                      s.attendance.totalSessions > 0
                        ? Math.round(
                            (it.value / s.attendance.totalSessions) * 100
                          )
                        : 0;
                    return (
                      <Card key={it.label} className="bg-card/60">
                        <CardContent className="p-3">
                          <div className="text-sm text-muted-foreground">
                            {it.label}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={it.variant}>{it.value}</Badge>
                            <span className="text-sm text-muted-foreground">
                              / {s.attendance.totalSessions} sesi
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Percent size={12} /> {pct}%
                          </div>
                          <div className="mt-2">
                            <Progress value={pct} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nilai per Aspek */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                Nilai Per Aspek
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { k: "tajwid", label: "Tajwid", val: s.scores.tajwid },
                    { k: "tilawah", label: "Tilawah", val: s.scores.tilawah },
                    { k: "hafalan", label: "Hafalan", val: s.scores.hafalan },
                    { k: "fikih", label: "Fikih/Praktik", val: s.scores.fikih },
                    { k: "akhlak", label: "Akhlak/Adab", val: s.scores.akhlak },
                  ].map((a) => {
                    const g = grade(a.val);
                    return (
                      <Card key={a.k} className="bg-card/60">
                        <CardContent className="p-3">
                          <div className="text-sm text-muted-foreground">
                            {a.label}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xl font-semibold">
                              {a.val}
                            </span>
                            <Badge variant={g.variant}>{g.label}</Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={a.val} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progres Hafalan & Iqra */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <LineChart size={18} className="text-primary" />
                Progres Hafalan & Iqra
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Progres Juz (≈)
                      </div>
                      <div className="mt-2">
                        {/* contoh: asumsi target 2 juz untuk visual bar */}
                        <Progress
                          value={
                            (Math.min(2, s.memorization.juzProgress) / 2) * 100
                          }
                        />
                        <div className="mt-1 text-sm text-muted-foreground">
                          ~ {s.memorization.juzProgress} Juz
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Level Iqra
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <ClipboardList size={16} />
                        <span className="font-medium">
                          {s.memorization.iqraLevel ?? "-"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Setoran Terakhir
                      </div>
                      <div className="mt-1 text-sm space-y-2">
                        {s.memorization.latest.map((m, i) => (
                          <div
                            key={i}
                            className="rounded-lg border p-2 bg-card"
                          >
                            <div className="text-sm text-muted-foreground">
                              {toID(m.date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{m.type}</Badge>
                              <span className="font-medium">{m.item}</span>
                              {typeof m.score === "number" && (
                                <Badge variant="secondary">{m.score}</Badge>
                              )}
                            </div>
                            {m.note && (
                              <div className="text-sm mt-1 text-muted-foreground">
                                {m.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Catatan Wali Kelas & Rekomendasi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Catatan Wali Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Catatan
                      </div>
                      <p className="mt-1 text-sm">{s.remarks.homeroom}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Rekomendasi / PR
                      </div>
                      <ul className="mt-1 list-disc pl-5 text-sm">
                        {(s.remarks.recommendations ?? []).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Aksi */}
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              className="inline-flex items-center gap-2"
            >
              <FileText size={16} />
              Cetak / Unduh
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
