// src/pages/StudentNotesDetail.tsx
import { useSearchParams, useNavigate, } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Filter,
  Search,
  NotebookPen,
  Star,
} from "lucide-react";
import { useMemo, useEffect } from "react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ===== Types ===== */
interface NoteLog {
  date: string;
  informasiUmum: string;
  materiPersonal?: string;
  penilaianPersonal?: string;
  nilai?: number;
  hafalan?: string;
  pr?: string;
}

interface NotesFetch {
  student: { id: string; name: string; className: string };
  stats: {
    total: number;
    withHafalan: number;
    withPR: number;
    withScore: number;
    avgScore?: number;
  };
  notes: NoteLog[];
}

/* ===== Dummy API ===== */
const iso = (d: Date) => d.toISOString();
const dminus = (n: number) => new Date(Date.now() - n * 864e5);

function makeNotes(days = 30): NoteLog[] {
  const res: NoteLog[] = [];
  for (let i = 0; i < days; i++) {
    const base: NoteLog = {
      date: iso(dminus(i)),
      informasiUmum:
        i % 3 === 0
          ? "Latihan tajwid: mad thabi'i."
          : i % 3 === 1
            ? "Praktik adab di kelas."
            : "Praktik wudhu dan tartil surat pendek.",
    };
    if (i % 2 === 0) base.materiPersonal = "Muroja'ah Iqra 2 halaman 10–12";
    if (i % 4 === 0)
      base.penilaianPersonal = "Fokus meningkat, makhraj membaik.";
    if (i % 5 === 0) base.nilai = 85 + (i % 3) * 3;
    if (i % 3 === 0)
      base.hafalan = i % 6 === 0 ? "An-Naba 1–10" : "Al-Fatihah 1–7";
    if (i % 4 === 2) base.pr = "Latihan bacaan mad pada Iqra 2 halaman 13–14";
    res.push(base);
  }
  return res;
}

async function fetchNotes(childId?: string, days = 30): Promise<NotesFetch> {
  const notes = makeNotes(days);
  const withScore = notes.filter((n) => typeof n.nilai === "number");
  const avg =
    withScore.length > 0
      ? Math.round(
        (withScore.reduce((a, b) => a + (b.nilai ?? 0), 0) /
          withScore.length) *
        10
      ) / 10
      : undefined;

  return {
    student: { id: childId ?? "c1", name: "Ahmad", className: "TPA A" },
    stats: {
      total: notes.length,
      withHafalan: notes.filter((n) => !!n.hafalan).length,
      withPR: notes.filter((n) => !!n.pr).length,
      withScore: withScore.length,
      avgScore: avg,
    },
    notes,
  };
}

/* ===== Helpers ===== */
const dateLong = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const dateShort = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

/* ===== Page ===== */
export default function StudentNotesSummary() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Catatan Hasil",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Catatan Hasil" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const childId = sp.get("child") ?? undefined;
  const period = (sp.get("period") ?? "30") as "7" | "30" | "all";
  const category = (sp.get("cat") ?? "all") as
    | "all"
    | "hafalan"
    | "pr"
    | "nilai"
    | "materi"
    | "penilaian";
  const q = sp.get("q") ?? "";

  const { data: s, isLoading } = useQuery({
    queryKey: ["student-notes", childId, period],
    queryFn: () => fetchNotes(childId, period === "all" ? 60 : Number(period)),
    staleTime: 60_000,
  });

  const filtered = useMemo(
    () =>
      (s?.notes ?? []).filter((n) => {
        const matchCat =
          category === "all"
            ? true
            : category === "hafalan"
              ? !!n.hafalan
              : category === "pr"
                ? !!n.pr
                : category === "nilai"
                  ? typeof n.nilai === "number"
                  : category === "materi"
                    ? !!n.materiPersonal
                    : category === "penilaian"
                      ? !!n.penilaianPersonal
                      : true;

        const text = [
          n.informasiUmum,
          n.materiPersonal,
          n.penilaianPersonal,
          n.hafalan,
          n.pr,
          n.nilai?.toString(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchQ = q ? text.includes(q.toLowerCase()) : true;
        return matchCat && matchQ;
      }),
    [s, category, q]
  );

  const change = (key: "period" | "cat" | "q", value: string) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    setSp(next, { replace: true });
  };

  const gradeBadge = (score: number) => {
    if (score >= 90) return { label: "A", variant: "default" as const };
    if (score >= 80) return { label: "B", variant: "secondary" as const };
    return { label: "C", variant: "outline" as const };
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Top */}
          <div className="md:flex hidden items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="inline-flex gap-2"
            >
              <ArrowLeft size={18} />
              Kembali
            </Button>
            <h1 className="text-lg font-semibold">Catatan</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Total Catatan
                      </div>
                      <div className="mt-1 font-semibold">{s.stats.total}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Ada Hafalan
                      </div>
                      <Badge className="mt-1" variant="secondary">
                        {s.stats.withHafalan}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Ada PR
                      </div>
                      <Badge className="mt-1" variant="outline">
                        {s.stats.withPR}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Ada Nilai
                      </div>
                      <Badge className="mt-1" variant="outline">
                        {s.stats.withScore}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/60">
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">
                        Rata-rata Nilai
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xl font-semibold">
                          {s.stats.avgScore ?? "-"}
                        </span>
                        {typeof s.stats.avgScore === "number" && (
                          <Badge
                            variant="default"
                            className="inline-flex items-center gap-1"
                          >
                            <Star size={14} />
                            Baik
                          </Badge>
                        )}
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
                    onValueChange={(v) => change("period", v)}
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

                {/* Kategori */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">
                    Kategori
                  </label>
                  <Select
                    value={category}
                    onValueChange={(v) => change("cat", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="hafalan">Hafalan</SelectItem>
                      <SelectItem value="pr">PR</SelectItem>
                      <SelectItem value="nilai">Nilai</SelectItem>
                      <SelectItem value="materi">Materi</SelectItem>
                      <SelectItem value="penilaian">Penilaian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cari */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Cari</label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                    />
                    <Input
                      value={q}
                      onChange={(e) => change("q", e.target.value)}
                      placeholder="kata kunci…"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daftar Catatan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <NotebookPen size={18} className="text-primary" />
                Daftar Catatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {filtered.length === 0 && (
                  <div className="rounded-xl border px-3 py-3 text-sm text-muted-foreground bg-card/60">
                    Tidak ada catatan untuk filter saat ini.
                  </div>
                )}

                {filtered.map((n, i) => (
                  <div
                    key={`${n.date}-${i}`}
                    className="rounded-xl border p-3 bg-card/60"
                  >
                    <div className="text-sm mb-2 text-muted-foreground">
                      {dateShort(n.date)} • {dateLong(n.date)}
                    </div>

                    <div className="space-y-1 text-sm">
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Nilai:</span> {n.nilai}
                          {(() => {
                            const g = gradeBadge(n.nilai);
                            return <Badge variant={g.variant}>{g.label}</Badge>;
                          })()}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
