// src/pages/sekolahislamku/student/StudentExamList.tsx
import { useMemo, useState, useEffect, useDeferredValue } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* Icons */
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Search,
  ClipboardList,
  CheckCircle2,
  Play,
  RotateCcw,
  Award,
  AlertCircle,
} from "lucide-react";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Stats Grid (custom) */
import {
  StatsGrid,
  type StatItem,
} from "@/components/costum/common/CStatsCardGrid";

/* NEW: Segmented Tabs */
import { CSegmentedTabs } from "@/components/costum/common/CSegmentedTabs";

/* ================= Types & Helpers ================= */
type ExamMode = "online" | "onsite";
type StudentExamStatus = "ready" | "ongoing" | "finished" | "missed" | "graded";
type ExamType = "UH" | "UTS" | "UAS";
type ExamTypeTab = "ALL" | ExamType;

type StudentExamItem = {
  id: string;
  classId: string;
  className: string;
  title: string;
  mode: ExamMode;

  questionCount: number;
  durationMin: number;
  startAt: string; // ISO
  endAt: string; // ISO

  attemptsUsed: number;
  attemptsAllowed: number; // 1..n
  lastAttemptAt?: string; // ISO
  score?: number | null; // 0..100, jika graded

  type: ExamType;
  roomName?: string; // untuk onsite
};

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

const withinRange = (now: Date, startISO: string, endISO: string) =>
  now >= new Date(startISO) && now <= new Date(endISO);
const future = (now: Date, startISO: string) => now < new Date(startISO);
const past = (now: Date, endISO: string) => now > new Date(endISO);

/* Status untuk student */
function resolveStudentStatus(
  now: Date,
  ex: StudentExamItem
): StudentExamStatus {
  const windowReady = future(now, ex.startAt);
  const windowOngoing = withinRange(now, ex.startAt, ex.endAt);
  const windowFinished = past(now, ex.endAt);

  // punya nilai final
  if (typeof ex.score === "number") return "graded";
  // waktu habis, cek pernah attempt
  if (windowFinished) return ex.attemptsUsed > 0 ? "finished" : "missed";
  // sedang berjalan
  if (windowOngoing) return "ongoing";
  // belum mulai
  if (windowReady) return "ready";
  return "ready";
}

/* CTA: label + link tujuan (dummy) */
function ctaFor(ex: StudentExamItem, status: StudentExamStatus) {
  switch (status) {
    case "ready":
      return { label: "Mulai", to: `ambil/${ex.id}` };
    case "ongoing":
      return { label: "Lanjutkan", to: `ambil/${ex.id}` };
    case "finished":
      return { label: "Lihat Ringkasan", to: `hasil/${ex.id}` };
    case "graded":
      return { label: "Lihat Nilai", to: `hasil/${ex.id}` };
    case "missed":
      return { label: "Lewat Waktu", to: "" };
  }
}

/* ================= Dummy Fetch ================= */
async function fetchStudentExamsByClass(
  classId: string
): Promise<StudentExamItem[]> {
  const now = new Date();
  const mk = (h: number) => {
    const s = new Date(now);
    s.setHours(s.getHours() + h);
    return s.toISOString();
  };

  // Lebih beragam: per jenis UH/UTS/UAS, ada online & onsite, ada graded, missed, dll.
  const sample: StudentExamItem[] = [
    // ===== UH (Ulangan Harian) =====
    {
      id: "uh-tajwid-bab1",
      classId,
      className: "TPA A",
      title: "UH Tajwid Bab 1",
      type: "UH",
      mode: "online",
      questionCount: 20,
      durationMin: 25,
      startAt: mk(2), // future -> ready
      endAt: mk(4),
      attemptsUsed: 0,
      attemptsAllowed: 1,
      score: null,
    },
    {
      id: "uh-makhraj-dasar",
      classId,
      className: "TPA A",
      title: "UH Makhraj Dasar",
      type: "UH",
      mode: "onsite",
      roomName: "R.Kelas 2B",
      questionCount: 15,
      durationMin: 20,
      startAt: mk(-1), // ongoing
      endAt: mk(1),
      attemptsUsed: 1,
      attemptsAllowed: 2,
      lastAttemptAt: mk(-0.5),
      score: null,
    },
    {
      id: "uh-garis-khod-1",
      classId,
      className: "Kaligrafi B",
      title: "UH Garis & Khath Dasar",
      type: "UH",
      mode: "online",
      questionCount: 10,
      durationMin: 15,
      startAt: mk(-72), // missed (lewat, 0 attempt)
      endAt: mk(-70),
      attemptsUsed: 0,
      attemptsAllowed: 1,
      score: null,
    },

    // ===== UTS =====
    {
      id: "uts-hafalan-juz30",
      classId,
      className: "TPA A",
      title: "UTS Hafalan Juz 30 (PG)",
      type: "UTS",
      mode: "online",
      questionCount: 30,
      durationMin: 40,
      startAt: mk(-30),
      endAt: mk(-28),
      attemptsUsed: 1,
      attemptsAllowed: 1,
      score: 86, // graded
    },
    {
      id: "uts-tajwid-bab2",
      classId,
      className: "TPA A",
      title: "UTS Tajwid Bab 2",
      type: "UTS",
      mode: "online",
      questionCount: 25,
      durationMin: 30,
      startAt: mk(48), // ready (future)
      endAt: mk(50),
      attemptsUsed: 0,
      attemptsAllowed: 1,
      score: null,
    },
    {
      id: "uts-btq-tingkat1",
      classId,
      className: "BTQ 1",
      title: "UTS BTQ Tingkat 1",
      type: "UTS",
      mode: "onsite",
      roomName: "Aula 1",
      questionCount: 20,
      durationMin: 30,
      startAt: mk(-4), // finished (pernah attempt)
      endAt: mk(-2),
      attemptsUsed: 1,
      attemptsAllowed: 1,
      score: null,
    },

    // ===== UAS =====
    {
      id: "uas-akhlaq-umum",
      classId,
      className: "Akhlak 7A",
      title: "UAS Akhlaq & Adab",
      type: "UAS",
      mode: "onsite",
      roomName: "R. Ujian 3",
      questionCount: 25,
      durationMin: 35,
      startAt: mk(8), // ready future
      endAt: mk(10),
      attemptsUsed: 0,
      attemptsAllowed: 1,
      score: null,
    },
    {
      id: "uas-btq-panjang-pendek",
      classId,
      className: "BTQ 2",
      title: "UAS BTQ: Panjang-Pendek",
      type: "UAS",
      mode: "online",
      questionCount: 18,
      durationMin: 25,
      startAt: mk(-72), // missed (0 attempt)
      endAt: mk(-70),
      attemptsUsed: 0,
      attemptsAllowed: 1,
      score: null,
    },
    {
      id: "uas-bahasa-arab",
      classId,
      className: "Bahasa Arab 9C",
      title: "UAS Bahasa Arab (Kosa Kata)",
      type: "UAS",
      mode: "online",
      questionCount: 40,
      durationMin: 60,
      startAt: mk(-1), // ongoing
      endAt: mk(3),
      attemptsUsed: 1,
      attemptsAllowed: 2,
      lastAttemptAt: mk(-0.25),
      score: null,
    },
  ];

  // urutkan by startAt desc (yang terbaru/terdekat tampil dulu)
  return sample.sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
}

/* ================= Query Keys ================= */
const QK = {
  STUDENT_CLASS_EXAMS: (classId: string) =>
    ["student-class-exams", classId] as const,
};

/* ================= Page ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentExam({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  // Fallback supaya dummy tetap jalan meski route tanpa :id
  const { id: classIdParam } = useParams<{ id?: string }>();
  const classId = (classIdParam ?? "demo-class").trim() || "demo-class";

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Ujian Saya",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Ujian" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const [q, setQ] = useState("");
  const qDeferred = useDeferredValue(q);
  const [statusFilter, setStatusFilter] = useState<StudentExamStatus | "all">(
    "all"
  );
  const [modeFilter, setModeFilter] = useState<ExamMode | "all">("all");
  const [tabType, setTabType] = useState<ExamTypeTab>("ALL"); // Tabs: ALL | UH | UTS | UAS

  const {
    data: exams = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: QK.STUDENT_CLASS_EXAMS(classId),
    queryFn: () => fetchStudentExamsByClass(classId),
    // enabled dihapus karena sudah ada fallback classId
    staleTime: 5 * 60_000,
  });

  const now = new Date();

  const view = useMemo(() => {
    return (
      exams
        .map((ex) => ({
          ...ex,
          _status: resolveStudentStatus(now, ex) as StudentExamStatus,
        }))
        // prioritaskan ongoing > ready future > lainnya
        .sort((a, b) => {
          const rank = (s: StudentExamStatus) =>
            s === "ongoing" ? 3 : s === "ready" ? 2 : s === "graded" ? 1 : 0;
          const r = rank(b._status) - rank(a._status);
          if (r !== 0) return r;
          return +new Date(b.startAt) - +new Date(a.startAt);
        })
    );
  }, [exams]);

  // Hitung count per jenis buat badge di tab
  const countsByType = useMemo(() => {
    const base = { UH: 0, UTS: 0, UAS: 0 } as Record<ExamType, number>;
    for (const v of view) base[v.type] += 1;
    return base;
  }, [view]);

  const filtered = useMemo(() => {
    const qLower = qDeferred.trim().toLowerCase();
    return view.filter((ex) => {
      const byQ =
        qLower.length === 0 ||
        ex.title.toLowerCase().includes(qLower) ||
        ex.className.toLowerCase().includes(qLower);

      const byStatus = statusFilter === "all" || ex._status === statusFilter;
      const byMode = modeFilter === "all" || ex.mode === modeFilter;
      const byType = tabType === "ALL" || ex.type === tabType;

      return byQ && byStatus && byMode && byType;
    });
  }, [view, qDeferred, statusFilter, modeFilter, tabType]);

  // Stats (mengacu ke dataset yang terfilter)
  const sTotal = filtered.length;
  const sReady = filtered.filter((e) => e._status === "ready").length;
  const sOngoing = filtered.filter((e) => e._status === "ongoing").length;
  const sFinished = filtered.filter(
    (e) => e._status === "finished" || e._status === "graded"
  ).length;
  const sMissed = filtered.filter((e) => e._status === "missed").length;

  const statItems: StatItem[] = useMemo(
    () => [
      {
        label: "Total Ujian",
        metric: sTotal,
        icon: <ClipboardList className="h-4 w-4"
          style={{ color: "hsl(var(--muted-foreground))" }} />,
      },
      {
        label: "Siap Dikerjakan",
        metric: sReady,
        icon: <Play className="h-4 w-4"
          style={{ color: "hsl(var(--chart-3))" }} />,
      },
      {
        label: "Berlangsung",
        metric: sOngoing,
        icon: <RotateCcw className="h-4 w-4" />,
      },
      {
        label: "Selesai",
        metric: sFinished,
        icon: <CheckCircle2 className="h-4 w-4"
          style={{ color: "hsl(var(--chart-1))" }} />,
      },
      {
        label: "Lewat",
        metric: sMissed,
        icon: <AlertCircle className="h-4 w-4"
          style={{ color: "hsl(var(--chart-2))" }} />,

      },
    ],
    [sTotal, sReady, sOngoing, sFinished, sMissed]
  );

  const badgeByStatus: Record<
    StudentExamStatus,
    "secondary" | "default" | "outline" | "destructive"
  > = {
    ready: "secondary",
    ongoing: "default",
    finished: "outline",
    graded: "secondary",
    missed: "destructive",
  };

  const typeBadgeVariant: Record<
    ExamType,
    "default" | "secondary" | "outline"
  > = {
    UH: "secondary",
    UTS: "default",
    UAS: "outline",
  };

  /* ================= RENDER ================= */
  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-lg font-semibold">Ujian Saya</h1>
          </div>

          {/* Header */}
          <Card>
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-base md:text-lg font-semibold">
                    Daftar Ujian
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kerjakan ujian sesuai jadwal. Perhatikan durasi, batas
                    percobaan, dan jenis ujian.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Segmented Tabs jenis ujian */}
          <CSegmentedTabs
            value={tabType}
            onValueChange={(v) => setTabType(v as ExamTypeTab)}
            className="mt-1"
            tabs={[
              {
                value: "ALL",
                label: `Semua (${view.length})`,
              },
              {
                value: "UH",
                label: `UH (${countsByType.UH})`,
              },
              {
                value: "UTS",
                label: `UTS (${countsByType.UTS})`,
              },
              {
                value: "UAS",
                label: `UAS (${countsByType.UAS})`,
              },
            ]}
          />

          {/* Stats (tergantung tab/filter) */}
          <StatsGrid
            items={statItems}
            loading={isFetching}
            minCardWidth="16rem"
            mobileCols={2}
            formatMetric={(n) =>
              new Intl.NumberFormat("id-ID", {
                notation: "compact",
              }).format(n)
            }
          />

          {/* Filters */}
          <Separator />
          <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Cari judul atau kelas…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(
                    (v as StudentExamStatus | "all") ?? "all"
                  )
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="ready">Siap</SelectItem>
                  <SelectItem value="ongoing">Berlangsung</SelectItem>
                  <SelectItem value="finished">Selesai</SelectItem>
                  <SelectItem value="graded">Dinilai</SelectItem>
                  <SelectItem value="missed">Lewat Waktu</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={modeFilter}
                onValueChange={(v) =>
                  setModeFilter((v as ExamMode | "all") ?? "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mode</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          {/* ===== Desktop Table ===== */}
          <Card className="hidden md:block mt-4">
            <CardContent className="p-0">
              <Table>
                <TableCaption className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Memuat data ujian…"
                    : filtered.length === 0
                      ? "Tidak ada ujian yang cocok dengan filter."
                      : undefined}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[24%]">Judul</TableHead>
                    <TableHead className="w-[10%]">Jenis</TableHead>
                    <TableHead className="w-[12%]">Kelas</TableHead>
                    <TableHead className="w-[18%]">Waktu</TableHead>
                    <TableHead className="w-[10%]">Durasi</TableHead>
                    <TableHead className="w-[12%]">Attempt</TableHead>
                    <TableHead className="w-[8%]">Mode</TableHead>
                    <TableHead className="w-[10%]">Status</TableHead>
                    <TableHead className="w-[10%] text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    : filtered.map((ex) => {
                      const status = ex._status as StudentExamStatus;
                      const cta = ctaFor(ex, status);
                      return (
                        <TableRow
                          key={ex.id}
                          className={
                            status === "ongoing" ? "bg-primary/5" : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {ex.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant={typeBadgeVariant[ex.type]}>
                              {ex.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{ex.className}</TableCell>
                          <TableCell>
                            {fmtDate(ex.startAt)} – {fmtDate(ex.endAt)}
                            {ex.mode === "onsite" && ex.roomName ? (
                              <span className="block text-xs text-muted-foreground">
                                Ruangan: {ex.roomName}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell>{ex.durationMin} m</TableCell>
                          <TableCell>
                            {ex.attemptsUsed}/{ex.attemptsAllowed}
                            {ex.lastAttemptAt && (
                              <span className="text-xs text-muted-foreground block">
                                Terakhir: {fmtDate(ex.lastAttemptAt)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {ex.mode === "online" ? "Online" : "Onsite"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badgeByStatus[status]}>
                              {status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {status === "missed" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                              >
                                Lewat
                              </Button>
                            ) : cta.to ? (
                              <Link to={cta.to}>
                                <Button size="sm">
                                  {status === "graded" ? (
                                    <Award className="mr-1 h-4 w-4" />
                                  ) : status === "ongoing" ? (
                                    <RotateCcw className="mr-1 h-4 w-4" />
                                  ) : (
                                    <Play className="mr-1 h-4 w-4" />
                                  )}
                                  {cta.label}
                                </Button>
                              </Link>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ===== Mobile Card List ===== */}
          <div className="grid grid-cols-1 gap-4 md:hidden mt-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
              : filtered.map((ex) => {
                const status = ex._status as StudentExamStatus;
                const cta = ctaFor(ex, status);
                return (
                  <Card key={ex.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-semibold truncate">
                          {ex.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={typeBadgeVariant[ex.type]}>
                            {ex.type}
                          </Badge>
                          <Badge variant={badgeByStatus[status]}>
                            {status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="p-4 space-y-3">
                      <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {fmtDate(ex.startAt)} – {fmtDate(ex.endAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {ex.durationMin} menit
                        </span>
                      </div>

                      <div className="text-sm flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{ex.className}</Badge>
                        <Badge variant="secondary">
                          {ex.mode === "online" ? "Online" : "Onsite"}
                        </Badge>
                        {ex.mode === "onsite" && ex.roomName ? (
                          <Badge variant="outline">
                            Ruangan {ex.roomName}
                          </Badge>
                        ) : null}
                        <Badge variant="outline">
                          {ex.questionCount} Soal
                        </Badge>
                        <Badge variant="outline">
                          {ex.attemptsUsed}/{ex.attemptsAllowed} Attempt
                        </Badge>
                        {typeof ex.score === "number" && (
                          <Badge>
                            <Award className="mr-1 h-3.5 w-3.5" />
                            {ex.score}
                          </Badge>
                        )}
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        {status === "missed" ? (
                          <Button size="sm" variant="outline" disabled>
                            Lewat Waktu
                          </Button>
                        ) : cta.to ? (
                          <Link to={cta.to}>
                            <Button size="sm">
                              {status === "graded" ? (
                                <Award className="mr-1 h-4 w-4" />
                              ) : status === "ongoing" ? (
                                <RotateCcw className="mr-1 h-4 w-4" />
                              ) : (
                                <Play className="mr-1 h-4 w-4" />
                              )}
                              {cta.label}
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <Card className="mt-4">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Tidak ada ujian yang cocok dengan filter.
              </CardContent>
            </Card>
          )}
        </div>
      </main >
    </div >
  );
}
