// src/pages/sekolahislamku/pages/student/StudentCSSTAssignmentList.tsx

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* icons */
import {
  ArrowLeft,
  ClipboardList,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* =========================
   TYPES (sesuai API /u/assessments/list)
========================= */

type StudentProgressState =
  | "not_started"
  | "ongoing"
  | "submitted"
  | "submitted_late"
  | "completed"
  | "unknown"
  | string;

type StudentAssessmentStudentProgress = {
  state: StudentProgressState;
  overdue: boolean;
  start_at: string;
  due_at: string;
  submitted_at?: string;
  score?: number | null;
  status?: string;
};

type StudentAssessmentParticipant = {
  participant_id: string;
  participant_state: string;
};

type StudentAssessmentQuizItem = {
  quiz_id: string;
  quiz_school_id: string;
  quiz_assessment_id: string;
  quiz_slug: string;
  quiz_title: string;
  quiz_description?: string | null;
  quiz_is_published: boolean;
  quiz_time_limit_sec?: number | null;
  quiz_created_at: string;
  quiz_updated_at: string;
};

type StudentAssessmentItem = {
  assessment_id: string;
  assessment_school_id: string;
  assessment_class_section_subject_teacher_id: string;
  assessment_type_id: string;
  assessment_slug: string;
  assessment_title: string;
  assessment_description?: string | null;

  assessment_start_at: string;
  assessment_due_at: string;

  assessment_kind: string;
  assessment_duration_minutes?: number | null;
  assessment_total_attempts_allowed?: number | null;
  assessment_max_score?: number | null;
  assessment_quiz_total?: number | null;

  assessment_is_published: boolean;
  assessment_allow_submission: boolean;

  assessment_type_is_graded_snapshot: boolean;

  assessment_created_at: string;
  assessment_updated_at: string;

  quizzes?: StudentAssessmentQuizItem[];

  student_progress?: StudentAssessmentStudentProgress;
  participant?: StudentAssessmentParticipant;
};

type StudentAssessmentListResponse = {
  success: boolean;
  message: string;
  data: StudentAssessmentItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
};

/* =========================
   Helpers kecil
========================= */

const extractErrorMessage = (err: unknown): string => {
  const ax = err as AxiosError<any>;
  const msgFromResp =
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    ax?.response?.statusText;
  if (msgFromResp) return String(msgFromResp);
  if (ax?.message) return ax.message;
  return "Terjadi kesalahan saat memuat data.";
};

const formatDateTime = (iso: string | undefined | null): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateRange = (startISO?: string, endISO?: string): string => {
  if (!startISO && !endISO) return "-";

  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return end ? `Sampai ${formatDateTime(endISO!)}` : "-";
  }
  if (!end || Number.isNaN(end.getTime())) {
    return `Mulai ${formatDateTime(startISO!)}`;
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${start.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })} • ${start.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })} — ${end.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return `${formatDateTime(startISO!)} — ${formatDateTime(endISO!)}`;
};

const getMeetingKey = (iso: string | undefined | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatMeetingLabel = (key: string): string => {
  const d = new Date(key);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getProgressLabelAndVariant = (
  progress?: StudentAssessmentStudentProgress
): {
  label: string;
  variant: "default" | "outline" | "destructive";
  icon: ReactNode;
} => {
  if (!progress) {
    return {
      label: "Belum dimulai",
      variant: "outline",
      icon: <Clock className="h-3 w-3" />,
    };
  }

  switch (progress.state) {
    case "ongoing":
      return {
        label: "Sedang berlangsung",
        variant: "default",
        icon: <Timer className="h-3 w-3" />,
      };
    case "submitted":
      return {
        label: "Sudah dikumpulkan",
        variant: "outline",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case "submitted_late":
      return {
        label: "Terlambat dikumpulkan",
        variant: "destructive",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    case "completed":
      return {
        label: "Selesai dinilai",
        variant: "default",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    default:
      return {
        label: "Belum dimulai",
        variant: "outline",
        icon: <Clock className="h-3 w-3" />,
      };
  }
};

const getKindLabel = (kind: string): string => {
  switch (kind) {
    case "quiz":
      return "Kuis / Ujian Online";
    case "assignment_upload":
      return "Tugas Upload";
    case "offline":
      return "Ujian Offline";
    case "survey":
      return "Kuesioner";
    default:
      return kind.replace(/_/g, " ");
  }
};

const formatQuizDuration = (sec?: number | null): string => {
  if (!sec) return "-";
  const minutes = Math.round(sec / 60);
  return `${minutes} menit`;
};

/**
 * Ringkas isi quiz:
 * "Bagian A - Pilihan Ganda (60 menit) • Bagian B - Isian Singkat (30 menit)"
 * Kalau lebih banyak, tambah "+N bagian lain".
 */
const getQuizSummary = (
  quizzes?: StudentAssessmentQuizItem[]
): string | null => {
  if (!quizzes || quizzes.length === 0) return null;

  const parts = quizzes.slice(0, 2).map((q) => {
    const dur = q.quiz_time_limit_sec
      ? ` (${formatQuizDuration(q.quiz_time_limit_sec)})`
      : "";
    return `${q.quiz_title}${dur}`;
  });

  if (quizzes.length > 2) {
    parts.push(`+${quizzes.length - 2} bagian lain`);
  }

  return parts.join(" • ");
};

type StudentClassesAssignmentProps = {
  showBack?: boolean;
};

/* =========================
   PAGE COMPONENT
========================= */

const StudentCSSTAssignment: React.FC<StudentClassesAssignmentProps> = ({
  showBack,
}) => {
  const { csstId } = useParams<{ csstId: string }>();
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();
  const [searchParams, setSearchParams] = useSearchParams();

  // state untuk dialog pilih quiz
  const [startAssessment, setStartAssessment] =
    useState<StudentAssessmentItem | null>(null);

  // tabs status: all / not_started / done
  const [statusTab, setStatusTab] = useState<"all" | "not_started" | "done">(
    "all"
  );

  // filter pertemuan: "all" atau yyyy-mm-dd
  const [meetingFilter, setMeetingFilter] = useState<string>("all");

  const pageFromUrl = Number(searchParams.get("page") || "1") || 1;
  const perPageFromUrl = Number(searchParams.get("per_page") || "20") || 20;

  const assignmentsQ = useQuery<StudentAssessmentListResponse, AxiosError>({
    queryKey: ["student-csst-assignments", csstId, pageFromUrl, perPageFromUrl],
    enabled: !!csstId,
    queryFn: async () => {
      const res = await axios.get<StudentAssessmentListResponse>(
        "/u/assessments/list",
        {
          params: {
            csst_id: csstId,
            is_graded: false, // 👈 bedanya di sini
            student_timeline: 1,
            page: pageFromUrl,
            per_page: perPageFromUrl,
          },
        }
      );
      return res.data;
    },
    staleTime: 30_000,
  });

  const assignmentsError: string | null = assignmentsQ.isError
    ? extractErrorMessage(assignmentsQ.error)
    : null;

  const items: StudentAssessmentItem[] = useMemo(
    () => assignmentsQ.data?.data ?? [],
    [assignmentsQ.data]
  );

  const pagination = assignmentsQ.data?.pagination;

  // opsi pertemuan (dari tanggal start)
  const meetingOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((a) => {
      const key = getMeetingKey(a.assessment_start_at);
      if (key) set.add(key);
    });
    return Array.from(set).sort();
  }, [items]);

  // filter berdasarkan tab + pertemuan
  const filteredItems = useMemo(() => {
    return items.filter((assessment) => {
      const progress = assessment.student_progress;

      // filter status
      let okStatus = true;
      const state = progress?.state;

      if (statusTab === "not_started") {
        okStatus = !progress
          ? true
          : !["ongoing", "submitted", "submitted_late", "completed"].includes(
            String(state)
          );
      } else if (statusTab === "done") {
        okStatus =
          state === "submitted" ||
          state === "submitted_late" ||
          state === "completed";
      }

      if (!okStatus) return false;

      // filter pertemuan
      if (meetingFilter !== "all") {
        const key = getMeetingKey(assessment.assessment_start_at);
        if (key !== meetingFilter) return false;
      }

      return true;
    });
  }, [items, statusTab, meetingFilter]);

  const hasItems = filteredItems.length > 0;
  const startQuizzes = startAssessment?.quizzes ?? [];

  useEffect(() => {
    setHeader({
      title: "Tugas & Penilaian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Mata Pelajaran Saya", href: "../mapel-saya" },
        { label: "Detail Mapel", href: "../" },
        { label: "Tugas" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return;
    const p = Math.min(Math.max(1, nextPage), pagination.total_pages || 1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(p));
    newParams.set("per_page", String(pagination.per_page));
    setSearchParams(newParams);
  };

  // 🔧 klik tombol di card
  const handleOpenAssignment = (assessment: StudentAssessmentItem) => {
    if (!assessment.assessment_slug) return;

    // Kalau assessment-nya tipe quiz dan punya daftar quiz
    if (
      assessment.assessment_kind === "quiz" &&
      assessment.quizzes &&
      assessment.quizzes.length > 0
    ) {
      // Kalau cuma ada 1 quiz -> langsung ke halaman quiz
      if (assessment.quizzes.length === 1) {
        const onlyQuiz = assessment.quizzes[0];
        navigate(
          `quiz/${onlyQuiz.quiz_id}?assessment_id=${assessment.assessment_id}`
        );
        return;
      }

      // Kalau lebih dari 1 quiz -> buka modal pilih quiz
      setStartAssessment(assessment);
      return;
    }

    // Default (bukan quiz) -> ke halaman detail assessment
    navigate(
      `/student/assessments/${assessment.assessment_slug}?csst_id=${csstId}`
    );
  };

  // setelah user pilih quiz tertentu
  const handleStartQuiz = (
    assessment: StudentAssessmentItem,
    quiz: StudentAssessmentQuizItem
  ) => {
    setStartAssessment(null);

    // route nested: /student/mapel/:csstId/tugas/quiz/:quizId
    navigate(`quiz/${quiz.quiz_id}?assessment_id=${assessment.assessment_id}`);
  };

  if (assignmentsQ.isLoading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="md:inline-flex"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="mt-1 h-3 w-56 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="h-4 w-56 bg-muted rounded animate-pulse" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assignmentsError) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-xl">
              Tugas & Penilaian
            </h1>
            <p className="text-xs text-muted-foreground">
              Gagal memuat daftar tugas untuk mata pelajaran ini.
            </p>
          </div>
        </div>

        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-[2px]" />
              <div>
                <div className="font-medium">Terjadi kesalahan</div>
                <div className="text-xs break-all">{assignmentsError}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => assignmentsQ.refetch()}
            >
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            {showBack && (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="space-y-0.5">
              <h1 className="text-lg font-semibold md:text-xl flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span>Tugas & Penilaian</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Daftar semua tugas yang terkait dengan mata pelajaran ini,
                lengkap dengan status pengerjaan kamu.
              </p>
            </div>
          </div>

          <Separator className="my-1" />

          {/* Tabs status + filter pertemuan */}
          <Tabs
            value={statusTab}
            onValueChange={(v) =>
              setStatusTab(v as "all" | "not_started" | "done")
            }
            className="w-full"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all" className="flex-1 md:flex-none">
                  Semua
                </TabsTrigger>
                <TabsTrigger
                  value="not_started"
                  className="flex-1 md:flex-none"
                >
                  Belum dikerjakan
                </TabsTrigger>
                <TabsTrigger value="done" className="flex-1 md:flex-none">
                  Sudah dikerjakan
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Pertemuan</span>
                <Select
                  value={meetingFilter}
                  onValueChange={(v) => setMeetingFilter(v)}
                >
                  <SelectTrigger className="h-8 w-[190px] text-xs">
                    <SelectValue placeholder="Semua pertemuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua pertemuan</SelectItem>
                    {meetingOptions.map((key) => (
                      <SelectItem key={key} value={key}>
                        {formatMeetingLabel(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* List tugas */}
            {!hasItems && (
              <Card className="border-dashed mt-3">
                <CardContent className="p-6 text-center text-sm text-muted-foreground space-y-2">
                  <ClipboardList className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                  <p>Tidak ada tugas yang cocok dengan filter yang dipilih.</p>
                  <p className="text-xs">
                    Coba ganti tab status atau pertemuan yang dipilih.
                  </p>
                </CardContent>
              </Card>
            )}

            {hasItems && (
              <div className="space-y-3 mt-3">
                {filteredItems.map((assessment) => {
                  const progress = assessment.student_progress;
                  const { label, variant, icon } =
                    getProgressLabelAndVariant(progress);

                  const canStartOrView =
                    assessment.assessment_allow_submission &&
                    assessment.assessment_is_published;

                  const isOngoing = progress?.state === "ongoing";

                  const scoreText =
                    progress?.score != null
                      ? `${progress.score}/${assessment.assessment_max_score ?? 100
                      }`
                      : "-";

                  const dateRangeText = formatDateRange(
                    assessment.assessment_start_at,
                    assessment.assessment_due_at
                  );

                  const submittedText = progress?.submitted_at
                    ? formatDateTime(progress.submitted_at)
                    : null;

                  const isLate = progress?.state === "submitted_late";

                  const quizSummary = getQuizSummary(assessment.quizzes);

                  return (
                    <Card
                      key={assessment.assessment_id}
                      className="transition hover:shadow-md"
                    >
                      <CardHeader className="pb-2 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base md:text-lg flex flex-wrap items-center gap-2">
                            {assessment.assessment_title}
                            <Badge variant="outline" className="text-[10px]">
                              {getKindLabel(assessment.assessment_kind)}
                            </Badge>
                          </CardTitle>
                          {assessment.assessment_description && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {assessment.assessment_description}
                            </p>
                          )}
                        </div>

                        <Badge
                          variant={variant}
                          className="mt-1 md:mt-0 flex items-center gap-1 text-[10px]"
                        >
                          {icon}
                          <span>{label}</span>
                        </Badge>
                      </CardHeader>

                      <CardContent className="pb-3 pt-0 text-xs md:text-sm space-y-2">
                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>{dateRangeText}</span>
                          </div>

                          {assessment.assessment_duration_minutes != null && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                Durasi:{" "}
                                <span className="font-mono">
                                  {assessment.assessment_duration_minutes} menit
                                </span>
                              </span>
                            </div>
                          )}

                          {assessment.assessment_quiz_total != null && (
                            <div className="flex items-center gap-1">
                              <ClipboardList className="h-3 w-3" />
                              <span>
                                Bagian kuis:{" "}
                                <span className="font-mono">
                                  {assessment.assessment_quiz_total}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Ringkasan quiz singkat */}
                        {quizSummary && (
                          <div className="flex items-start gap-1 text-xs md:text-[13px] text-muted-foreground">
                            <ClipboardList className="h-3 w-3 mt-[2px]" />
                            <span>{quizSummary}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Nilai kamu:{" "}
                            </span>
                            <span className="font-mono font-semibold">
                              {scoreText}
                            </span>
                          </div>

                          {submittedText && (
                            <div className="text-muted-foreground flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>
                                Dikumpulkan:{" "}
                                <span
                                  className={
                                    isLate ? "text-destructive font-medium" : ""
                                  }
                                >
                                  {submittedText}
                                  {isLate && " (terlambat)"}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 flex items-center justify-between gap-3">
                        <div className="text-[11px] text-muted-foreground">
                          ID Penilaian:{" "}
                          <span className="font-mono">
                            {assessment.assessment_slug}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          disabled={!canStartOrView}
                          onClick={() => handleOpenAssignment(assessment)}
                        >
                          {isOngoing
                            ? "Kerjakan sekarang"
                            : progress?.state === "submitted" ||
                              progress?.state === "submitted_late" ||
                              progress?.state === "completed"
                              ? "Lihat hasil"
                              : "Lihat detail"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </Tabs>

          {/* Pagination sederhana */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs md:text-sm">
              <div className="text-muted-foreground">
                Halaman {pagination.page} dari {pagination.total_pages} • Total{" "}
                {pagination.total} tugas
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_prev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dialog pilih quiz saat tugas punya >1 quiz */}
        <Dialog
          open={!!startAssessment}
          onOpenChange={(open) => {
            if (!open) setStartAssessment(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Pilih bagian tugas</DialogTitle>
              <DialogDescription>
                Penilaian ini terdiri dari beberapa bagian. Silakan pilih bagian
                yang ingin kamu kerjakan terlebih dahulu.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-2">
              {startQuizzes.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  Bagian tugas tidak ditemukan.
                </div>
              )}

              {startQuizzes.map((q) => (
                <Card
                  key={q.quiz_id}
                  className="border border-border/60 bg-muted/10"
                >
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">
                        {q.quiz_title}
                      </div>
                      {q.quiz_description && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {q.quiz_description}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground">
                        Durasi: {formatQuizDuration(q.quiz_time_limit_sec)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        startAssessment && handleStartQuiz(startAssessment, q)
                      }
                    >
                      Mulai
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default StudentCSSTAssignment;