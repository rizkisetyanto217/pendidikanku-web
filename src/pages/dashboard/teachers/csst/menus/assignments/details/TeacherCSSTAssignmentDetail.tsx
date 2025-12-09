// src/pages/sekolahislamku/teacher/TeacherAssessmentDetail.tsx

import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

/* icons */
import {
  ArrowLeft,
  CalendarDays,
  Timer,
  ListChecks,
  AlertCircle,
  Users,
  BarChart3,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

/* Reuse type dari list (supaya konsisten) */
import type { AssessmentItem } from "../TeacherCSSTAssignment";
import CBadgeAssignment from "@/components/costum/common/badges/CBadgeAssignment";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";


/* =======================
   Types
======================= */

type QuizItem = {
  quiz_id: string;
  quiz_school_id: string;
  quiz_assessment_id: string;
  quiz_slug: string | null;
  quiz_title: string;
  quiz_description: string | null;
  quiz_is_published: boolean;
  quiz_time_limit_sec: number | null;
  quiz_created_at: string;
  quiz_updated_at: string;
};

type AssessmentWithQuizzes = AssessmentItem & {
  quizzes?: QuizItem[];
  // kalau mau, type dari includes juga bisa ditambah di sini
  // type?: { id: string; key: string; name: string; weight_percent: number; is_active: boolean };
};

type AssessmentListByIdResponse = {
  success: boolean;
  message: string;
  data: AssessmentWithQuizzes[];
};

type DummyStudentProgressStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";

type DummyStudentProgress = {
  id: string;
  name: string;
  nis: string;
  status: DummyStudentProgressStatus;
  submitted_at?: string | null;
  score?: number | null;
  max_score?: number | null;
};

/* =======================
   Utils kecil
======================= */

function formatDateTime(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDurationSec(sec?: number | null) {
  if (!sec || sec <= 0) return "-";
  const minutes = Math.round(sec / 60);
  return `${minutes} menit`;
}

/* =======================
   Dummy progress data
======================= */

// TODO: ganti dengan data dari endpoint submissions nanti
const DUMMY_PROGRESS: DummyStudentProgress[] = [
  {
    id: "s1",
    name: "Ahmad Fauzan",
    nis: "2025001",
    status: "graded",
    submitted_at: "2025-03-10T02:10:00Z",
    score: 92,
    max_score: 100,
  },
  {
    id: "s2",
    name: "Siti Aisyah",
    nis: "2025002",
    status: "graded",
    submitted_at: "2025-03-10T02:20:00Z",
    score: 84,
    max_score: 100,
  },
  {
    id: "s3",
    name: "Budi Santoso",
    nis: "2025003",
    status: "graded",
    submitted_at: "2025-03-10T02:40:00Z",
    score: null,
    max_score: 100,
  },
  {
    id: "s4",
    name: "Nurul Hidayah",
    nis: "2025004",
    status: "not_started",
    submitted_at: null,
    score: null,
    max_score: 100,
  },
  {
    id: "s5",
    name: "Rizky Firmansyah",
    nis: "2025005",
    status: "not_started",
    submitted_at: null,
    score: null,
    max_score: 100,
  },
];

/* =======================
   Page Component
======================= */

export default function TeacherCSSTAssessmentDetail() {
  const { assessmentId } = useParams<{
    csstId: string;
    assessmentId: string;
  }>();

  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Penilaian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mata Pelajaran" },
        { label: "Detail Mata Pelajaran" },
        { label: "Penilaian Mata Pelajaran" },
        { label: "Detail Penilaian" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<AssessmentListByIdResponse>({
      queryKey: ["teacher-assessment-detail", assessmentId],
      enabled: !!assessmentId,
      queryFn: async () => {
        const res = await axios.get("/api/u/assessments/list", {
          params: {
            id: assessmentId,
            include: "quizzes",
          },
        });
        return res.data;
      },
    });

  const assessment: AssessmentWithQuizzes | null = data?.data?.[0] ?? null;
  const quizzes: QuizItem[] = assessment?.quizzes ?? [];

  const errorMessage = isError
    ? (error as any)?.response?.data?.message ||
    (error as Error).message ||
    "Gagal memuat detail penilaian."
    : null;

  // ================== Dummy progress aggregate ==================

  const progressStats = useMemo(() => {
    const total = DUMMY_PROGRESS.length;
    const totalNotStarted = DUMMY_PROGRESS.filter(
      (s) => s.status === "not_started"
    ).length;
    const totalInProgress = DUMMY_PROGRESS.filter(
      (s) => s.status === "in_progress"
    ).length;
    const totalSubmitted = DUMMY_PROGRESS.filter(
      (s) => s.status === "submitted" || s.status === "graded"
    ).length;
    const totalGraded = DUMMY_PROGRESS.filter(
      (s) => s.status === "graded"
    ).length;

    const withScore = DUMMY_PROGRESS.filter((s) => typeof s.score === "number");
    const avgScore =
      withScore.length > 0
        ? Math.round(
          (withScore.reduce((acc, s) => acc + (s.score || 0), 0) /
            withScore.length) *
          10
        ) / 10
        : null;

    return {
      total,
      totalNotStarted,
      totalInProgress,
      totalSubmitted,
      totalGraded,
      avgScore,
    };
  }, []);

  const csstName =
    assessment?.assessment_csst_snapshot?.name ?? "Kelas / Mapel";

  const typeName =
    assessment?.assessment_type_snapshot?.name ??
    (assessment?.assessment_kind === "quiz" ? "Quiz" : "Penilaian");

  const isSessionMode = assessment?.assessment_submission_mode === "session";

  const announce = assessment?.assessment_announce_session_snapshot;
  const collect = assessment?.assessment_collect_session_snapshot;

  const submissionsTotal = assessment?.assessment_submissions_total ?? 0;
  const gradedTotal = assessment?.assessment_submissions_graded_total ?? 0;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="md:flex hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-xl leading-tight">
              Detail Penilaian
            </h1>
            <p className="text-xs text-muted-foreground">
              Penilaian untuk {csstName}. Lihat pengaturan, jadwal, dan progress
              siswa.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                Memuat ulang…
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                Refresh
              </>
            )}
          </Button>

          {assessment && (
            <Button variant="default" size="sm" asChild>
              {/* dari /.../tugas/:assessmentId → /.../tugas/:assessmentId/submissions */}
              <Link to="submissions">
                <ListChecks className="mr-1.5 h-3 w-3" />
                Lihat pengumpulan
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Loading & error */}
      {isLoading && <DetailLoadingSkeleton />}

      {!isLoading && errorMessage && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Gagal memuat penilaian
              </p>
              <p className="text-xs text-destructive/80">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !errorMessage && !assessment && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Detail penilaian tidak ditemukan.
          </CardContent>
        </Card>
      )}

      {!isLoading && !errorMessage && assessment && (
        <>
          {/* =========================
              Ringkasan utama
          ========================== */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {assessment.assessment_title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px]">
                      {typeName}
                    </Badge>
                    {assessment.assessment_kind === "quiz" && (
                      <Badge variant="outline" className="text-[11px]">
                        Quiz
                      </Badge>
                    )}
                    {isSessionMode ? (
                      <Badge className="text-[11px]">Mode: Sesi</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px]">
                        Mode: Batas waktu
                      </Badge>
                    )}
                  </div>

                  {assessment.assessment_slug && (
                    <p className="text-xs font-mono text-muted-foreground">
                      slug: {assessment.assessment_slug}
                    </p>
                  )}

                  {assessment.assessment_description && (
                    <p className="text-xs text-muted-foreground">
                      {assessment.assessment_description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 text-xs md:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    {assessment.assessment_is_published ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Dipublikasikan
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-muted-foreground/40 text-muted-foreground"
                      >
                        Draft
                      </Badge>
                    )}

                    {assessment.assessment_allow_submission ? (
                      <Badge variant="outline" className="text-[11px]">
                        Pengumpulan dibuka
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-400/60 bg-red-500/5 text-red-500"
                      >
                        Pengumpulan ditutup
                      </Badge>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-muted-foreground">
                    <div>
                      Dibuat: {formatDateTime(assessment.assessment_created_at)}
                    </div>
                    <div>
                      Diupdate:{" "}
                      {formatDateTime(assessment.assessment_updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <Separator className="my-2" />

              <div className="grid gap-3 md:grid-cols-3">
                {/* Jadwal */}
                <div className="space-y-1 text-xs md:col-span-1">
                  <div className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>Jadwal</span>
                  </div>

                  {!isSessionMode ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-muted-foreground">
                          Mulai
                        </span>
                        <span>
                          {formatDateTime(assessment.assessment_start_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-muted-foreground">
                          Batas
                        </span>
                        <span>
                          {formatDateTime(assessment.assessment_due_at)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-muted-foreground">
                          Umumkan
                        </span>
                        <span className="flex-1">
                          {announce?.title ? (
                            <>
                              {announce.title}
                              <span className="ml-1 text-[11px] text-muted-foreground">
                                ({formatDateOnly(announce.date)} ·{" "}
                                {formatDateTime(announce.starts_at)})
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-muted-foreground">
                          Kumpulkan
                        </span>
                        <span className="flex-1">
                          {collect?.title ? (
                            <>
                              {collect.title}
                              <span className="ml-1 text-[11px] text-muted-foreground">
                                ({formatDateOnly(collect.date)} ·{" "}
                                {formatDateTime(collect.starts_at)})
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Ringkasan angka */}
                <div className="space-y-1 text-xs md:col-span-1">
                  <div className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span>Ringkasan konfigurasi</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground">
                        Jumlah soal
                      </span>
                      <span className="font-medium">
                        {assessment.assessment_quiz_total ?? "-"} soal
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground">
                        Durasi
                      </span>
                      <span className="font-medium">
                        {assessment.assessment_duration_minutes
                          ? `${assessment.assessment_duration_minutes} menit`
                          : "-"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground">
                        Percobaan
                      </span>
                      <span className="font-medium">
                        {assessment.assessment_total_attempts_allowed ?? 1}x
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground">
                        Nilai maks
                      </span>
                      <span className="font-medium">
                        {assessment.assessment_max_score ?? 100}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submissions */}
                <div className="space-y-1 text-xs md:col-span-1">
                  <div className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
                    <ListChecks className="h-3 w-3" />
                    <span>Ringkasan pengumpulan</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Submit
                      </span>
                      <span className="font-semibold text-xs">
                        {submissionsTotal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Sudah dinilai
                      </span>
                      <span className="font-semibold text-xs">
                        {gradedTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* =========================
              Quizzes pada assessment ini
          ========================== */}
          <Card>
            <CardHeader className="pb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Quiz pada penilaian ini
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    Data dari{" "}
                    <code>/api/u/assessments/list?include=quizzes</code>.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Total quiz:{" "}
                <span className="font-semibold">{quizzes.length}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              {quizzes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Belum ada quiz yang terhubung ke penilaian ini.
                </p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[720px] text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px] text-center">
                          #
                        </TableHead>
                        <TableHead>Judul quiz</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead className="w-[220px]">Deskripsi</TableHead>
                        <TableHead className="text-center">Waktu</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Dibuat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((q, idx) => (
                        <TableRow
                          key={q.quiz_id}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => {
                            navigate(`${q.quiz_id}`);
                          }}
                        >
                          <TableCell className="text-center">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className="underline-offset-2 hover:underline">
                              {q.quiz_title}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-[11px]">
                            {q.quiz_slug ?? "-"}
                          </TableCell>
                          <TableCell>
                            <p className="line-clamp-2">
                              {q.quiz_description || "-"}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDurationSec(q.quiz_time_limit_sec)}
                          </TableCell>
                          <TableCell className="text-center">
                            {q.quiz_is_published ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/60 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300 text-[10px]"
                              >
                                Dipublikasikan
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-muted-foreground/40 text-muted-foreground text-[10px]"
                              >
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDateTime(q.quiz_created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* =========================
              Progress siswa (dummy)
          ========================== */}
          <Card>
            <CardHeader className="pb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Progress siswa (dummy)
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    Data ini masih dummy. Nanti akan diganti dari endpoint
                    submissions &amp; grades.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>
                    Total siswa:{" "}
                    <span className="font-semibold">{progressStats.total}</span>
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  Sudah submit:{" "}
                  <span className="font-semibold">
                    {progressStats.totalSubmitted}
                  </span>
                </span>
                <span>
                  Sudah dinilai:{" "}
                  <span className="font-semibold">
                    {progressStats.totalGraded}
                  </span>
                </span>
                <span>
                  Rata-rata nilai:{" "}
                  <span className="font-semibold">
                    {progressStats.avgScore ?? "-"}
                  </span>
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[720px] text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px] text-center">No</TableHead>
                      <TableHead>Nama siswa</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Waktu submit</TableHead>
                      <TableHead className="text-center">Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DUMMY_PROGRESS.map((s, idx) => (
                      <TableRow
                        key={s.id}
                        className="table-row-hover cursor-pointer"
                      >
                        <TableCell className="text-center">{idx + 1}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.nis}</TableCell>
                        <TableCell className="text-center">
                          <CBadgeAssignment status={s.status} />
                        </TableCell>
                        <TableCell className="text-center">
                          {s.submitted_at ? formatDateTime(s.submitted_at) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {typeof s.score === "number"
                            ? `${s.score}/${s.max_score ?? 100}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-[11px] text-muted-foreground">
                * Nanti tabel ini bisa dihubungkan ke endpoint: submissions,
                attempts, dan grading per siswa. Sekarang hanya dummy untuk
                memberi gambaran UI.
              </p>
            </CardContent>

          </Card>
        </>
      )}
    </div>
  );
}

/* =======================
   Loading skeleton
======================= */

function DetailLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-80" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}