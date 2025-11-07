// src/pages/sekolahislamku/teacher/TeacherExamList.tsx

import { useMemo, useState, useDeferredValue } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/* ===== shadcn/ui ===== */
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

/* ===== Icons ===== */
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Search,
  Filter,
  BookOpen,
  ClipboardList,
  Plus,
  Settings2,
} from "lucide-react";

/* ===== Stats Grid (custom kamu) ===== */
import {
  StatsGrid,
  type StatItem,
} from "@/components/costum/card/StatsCardGrid";

/* ===================== Types & Helpers ===================== */
type ExamStatus = "draft" | "published" | "ongoing" | "finished" | "closed";
type ExamMode = "online" | "onsite";

type ExamItem = {
  id: string;
  classId: string;
  className: string;
  title: string;
  status: ExamStatus;
  mode: ExamMode;
  questionCount: number;
  durationMin: number;
  startAt: string; // ISO
  endAt: string; // ISO
  attempts?: number;
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

/* ===================== Dummy Fetch ===================== */
async function fetchTeacherExamsByClass(classId: string): Promise<ExamItem[]> {
  const now = new Date();
  const mk = (h: number) => {
    const s = new Date(now);
    s.setHours(s.getHours() + h);
    return s.toISOString();
  };

  const sample: ExamItem[] = [
    {
      id: "ex-tajwid-1",
      classId,
      className: "TPA A",
      title: "Ujian Tajwid Bab 1",
      status: "published",
      mode: "online",
      questionCount: 25,
      durationMin: 30,
      startAt: mk(2),
      endAt: mk(4),
      attempts: 0,
    },
    {
      id: "ex-makhraj-1",
      classId,
      className: "TPA A",
      title: "Ujian Makhraj Dasar",
      status: "ongoing",
      mode: "onsite",
      questionCount: 20,
      durationMin: 25,
      startAt: mk(-1),
      endAt: mk(1),
      attempts: 12,
    },
    {
      id: "ex-hafalan-j30",
      classId,
      className: "TPA A",
      title: "Hafalan Juz 30 (PG)",
      status: "finished",
      mode: "online",
      questionCount: 30,
      durationMin: 40,
      startAt: mk(-30),
      endAt: mk(-28),
      attempts: 21,
    },
    {
      id: "ex-tajwid-2",
      classId,
      className: "TPA A",
      title: "Ujian Tajwid Bab 2",
      status: "draft",
      mode: "online",
      questionCount: 10,
      durationMin: 20,
      startAt: mk(48),
      endAt: mk(50),
      attempts: 0,
    },
    {
      id: "ex-akhlaq-1",
      classId,
      className: "TPA A",
      title: "Akhlaq & Adab Kelas",
      status: "published",
      mode: "onsite",
      questionCount: 15,
      durationMin: 20,
      startAt: mk(8),
      endAt: mk(10),
      attempts: 0,
    },
    {
      id: "ex-btq-1",
      classId,
      className: "TPA A",
      title: "BTQ: Panjang-Pendek",
      status: "closed",
      mode: "online",
      questionCount: 18,
      durationMin: 25,
      startAt: mk(-72),
      endAt: mk(-70),
      attempts: 18,
    },
  ];

  const nowD = new Date();
  return sample.map((ex) => {
    if (["draft", "closed", "finished"].includes(ex.status)) return ex;
    if (withinRange(nowD, ex.startAt, ex.endAt))
      return { ...ex, status: "ongoing" };
    if (future(nowD, ex.startAt)) return { ...ex, status: "published" };
    if (past(nowD, ex.endAt)) return { ...ex, status: "finished" };
    return ex;
  });
}

/* ===================== Query Keys ===================== */
const QK = {
  CLASS_EXAMS: (classId: string) => ["teacher-class-exams", classId] as const,
};

/* ===================== Page ===================== */
export default function TeacherExamList() {
  const { id: classId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const qDeferred = useDeferredValue(q);
  const [statusFilter, setStatusFilter] = useState<ExamStatus | "all">("all");
  const [modeFilter, setModeFilter] = useState<ExamMode | "all">("all");

  const {
    data: exams = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: QK.CLASS_EXAMS(classId),
    queryFn: () => fetchTeacherExamsByClass(classId),
    enabled: !!classId,
    staleTime: 5 * 60_000,
  });

  const filtered = useMemo(() => {
    const qLower = qDeferred.trim().toLowerCase();
    return exams.filter((ex) => {
      const byQ =
        qLower.length === 0 ||
        ex.title.toLowerCase().includes(qLower) ||
        ex.className.toLowerCase().includes(qLower);
      const byStatus = statusFilter === "all" || ex.status === statusFilter;
      const byMode = modeFilter === "all" || ex.mode === modeFilter;
      return byQ && byStatus && byMode;
    });
  }, [exams, qDeferred, statusFilter, modeFilter]);

  // Stats
  const now = new Date();
  const sTotal = exams.length;
  const sUpcoming = exams.filter(
    (e) =>
      (e.status === "published" || e.status === "draft") &&
      future(now, e.startAt)
  ).length;
  const sOngoing = exams.filter((e) =>
    withinRange(now, e.startAt, e.endAt)
  ).length;
  const sFinished = exams.filter((e) => past(now, e.endAt)).length;

  const statItems: StatItem[] = useMemo(
    () => [
      {
        label: "Total Ujian",
        metric: sTotal,
        icon: <ClipboardList className="h-4 w-4" />,
      },
      {
        label: "Akan Datang",
        metric: sUpcoming,
        icon: <CalendarDays className="h-4 w-4" />,
      },
      {
        label: "Berlangsung",
        metric: sOngoing,
        icon: <Clock className="h-4 w-4" />,
      },
      {
        label: "Selesai",
        metric: sFinished,
        icon: <BookOpen className="h-4 w-4" />,
      },
    ],
    [sTotal, sUpcoming, sOngoing, sFinished]
  );

  const badgeByStatus: Record<
    ExamStatus,
    "secondary" | "default" | "outline" | "destructive"
  > = {
    draft: "outline",
    published: "secondary",
    ongoing: "default",
    finished: "outline",
    closed: "destructive",
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Ujian Kelas</h1>
          </div>

          {/* Header Actions */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-base md:text-lg font-semibold">
                  Daftar Ujian
                </div>
                <p className="text-sm text-muted-foreground">
                  Kelola jadwal dan materi ujian. Buat latihan dari ujian yang
                  ada.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link to="buat-latihan/new">
                  <Button size="sm" variant="secondary">
                    Buat Soal Latihan <Plus className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="buat-ujian/new">
                  <Button size="sm">
                    Buat Ujian <Plus className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <StatsGrid
            items={statItems}
            loading={isFetching}
            minCardWidth="16rem"
            mobileCols={2} // <<— 2 kolom di mobile
            formatMetric={(n) =>
              new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n)
            }
          />

          {/* Filters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Pencarian & Filter
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Cari judul ujian…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter((v as ExamStatus | "all") ?? "all")
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="ongoing">Berlangsung</SelectItem>
                    <SelectItem value="finished">Selesai</SelectItem>
                    <SelectItem value="closed">Ditutup</SelectItem>
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
          </Card>

          {/* ===== Desktop: TABLE ===== */}
          <Card className="hidden md:block">
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
                    <TableHead className="w-[28%]">Judul</TableHead>
                    <TableHead className="w-[12%]">Kelas</TableHead>
                    <TableHead className="w-[18%]">Waktu</TableHead>
                    <TableHead className="w-[10%]">Durasi</TableHead>
                    <TableHead className="w-[10%]">Soal</TableHead>
                    <TableHead className="w-[10%]">Mode</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className="w-[10%] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8}>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : filtered.map((ex) => (
                        <TableRow key={ex.id}>
                          <TableCell className="font-medium">
                            {ex.title}
                          </TableCell>
                          <TableCell>{ex.className}</TableCell>
                          <TableCell>
                            {fmtDate(ex.startAt)} – {fmtDate(ex.endAt)}
                          </TableCell>
                          <TableCell>{ex.durationMin} m</TableCell>
                          <TableCell>{ex.questionCount}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {ex.mode === "online" ? "Online" : "Onsite"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badgeByStatus[ex.status]}>
                              {ex.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`kelola/${ex.id}`}>
                                <Button size="sm" variant="secondary">
                                  <Settings2 className="mr-1 h-4 w-4" />
                                  Kelola
                                </Button>
                              </Link>
                              <Link to={`buat-latihan/${ex.id}`}>
                                <Button size="sm">
                                  <BookOpen className="mr-1 h-4 w-4" />
                                  Latihan
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ===== Mobile: CARD LIST ===== */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : filtered.map((ex) => (
                  <Card key={ex.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base font-semibold truncate">
                          {ex.title}
                        </CardTitle>
                        <Badge variant={badgeByStatus[ex.status]}>
                          {ex.status.toUpperCase()}
                        </Badge>
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
                        <Badge variant="outline">{ex.questionCount} Soal</Badge>
                        {typeof ex.attempts === "number" && (
                          <Badge variant="outline">{ex.attempts} Attempt</Badge>
                        )}
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <Link to={`kelola/${ex.id}`}>
                          <Button size="sm" variant="secondary">
                            <Settings2 className="mr-1 h-4 w-4" />
                            Kelola
                          </Button>
                        </Link>
                        <Link to={`buat-latihan/${ex.id}`}>
                          <Button size="sm">
                            <BookOpen className="mr-1 h-4 w-4" />
                            Latihan
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Empty state (non-loading) */}
          {!isLoading && filtered.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Tidak ada ujian yang cocok dengan filter.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
