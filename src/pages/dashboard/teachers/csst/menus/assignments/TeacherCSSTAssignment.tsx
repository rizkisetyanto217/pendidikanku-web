// src/pages/sekolahislamku/teacher/TeacherCSSTAssignment.tsx

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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

/* segmented tabs custom */
import {
  CSegmentedTabs,
  type SegmentedTabItem,
} from "@/components/costum/common/CSegmentedTabs";

/* icons */
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ListChecks,
  FileText,
  Timer,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import CMenuSearch from "@/components/costum/common/CMenuSearch";
import { cardHover } from "@/components/costum/table/CDataTable";
import { cn } from "@/lib/utils";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =======================
   Types — sesuai JSON
======================= */

type AssessmentSubmissionMode = "date" | "session" | string;
type AssessmentKind =
  | "quiz"
  | "assignment_upload"
  | "offline"
  | "survey"
  | string;

type AssessmentTypeSnapshot = {
  id: string;
  key: string;
  name: string;
  is_graded: boolean;
  show_correct_after_submit?: boolean;
};

type AssessmentCSSTSnapshot = {
  name?: string;
  source?: string;
  section_id?: string;
  teacher_id?: string;
  captured_at?: string;
};

type AssessmentSessionSnapshot = {
  session_id?: string;
  title?: string;
  date?: string;
  starts_at?: string;
  captured_at?: string;
};

export type AssessmentItem = {
  assessment_id: string;
  assessment_school_id: string;
  assessment_class_section_subject_teacher_id: string;
  assessment_type_id: string | null;
  assessment_slug: string | null;
  assessment_title: string;
  assessment_description: string | null;
  assessment_start_at: string | null;
  assessment_due_at: string | null;
  assessment_kind: AssessmentKind;
  assessment_duration_minutes: number | null;
  assessment_total_attempts_allowed: number | null;
  assessment_max_score: number | null;
  assessment_quiz_total: number | null;
  assessment_is_published: boolean;
  assessment_allow_submission: boolean;
  assessment_submissions_total: number;
  assessment_submissions_graded_total: number;
  assessment_type_is_graded_snapshot: boolean;
  assessment_created_by_teacher_id: string;
  assessment_submission_mode: AssessmentSubmissionMode;
  assessment_csst_snapshot?: AssessmentCSSTSnapshot | null;
  assessment_announce_session_snapshot?: AssessmentSessionSnapshot | null;
  assessment_collect_session_snapshot?: AssessmentSessionSnapshot | null;
  assessment_type_snapshot?: AssessmentTypeSnapshot | null;
  assessment_created_at: string;
  assessment_updated_at: string;
};

type AssessmentListResponse = {
  success: boolean;
  message: string;
  data: AssessmentItem[];
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

/* =======================
   Filter tabs
======================= */

type ModeFilter = "all" | "class_announce" | "general";

const MODE_TABS: SegmentedTabItem[] = [
  {
    value: "all",
    label: "Semua",
  },
  {
    value: "class_announce",
    label: "Belum Dikerjakan",
  },
  {
    value: "general",
    label: "Selesai",
  },
];

/* =======================
   Page Component
======================= */

export default function TeacherCSSTAssignment() {
  const { csstId } = useParams<{ csstId: string }>();
  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Penilaian Mata Pelajaran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mata Pelajaran" },
        { label: "Detail Mata Pelajaran" },
        { label: "Penilaian Mata Pelajaran" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<AssessmentListResponse>({
      queryKey: ["teacher-assessments", csstId],
      enabled: !!csstId,
      queryFn: async () => {
        const res = await axios.get("/api/u/assessments/list", {
          params: {
            csst_id: csstId,
            is_graded: false,
          },
        });
        return res.data;
      },
    });

  const assessments = data?.data ?? [];

  const csstName =
    assessments[0]?.assessment_csst_snapshot?.name ?? "Kelas / Mapel";

  // 1) Filter berdasarkan mode (class announce vs tugas umum)
  const filteredByMode = useMemo(() => {
    if (modeFilter === "class_announce") {
      // Diambil yang pakai mode session (terkait announce/collect session)
      return assessments.filter(
        (a) => a.assessment_submission_mode === "session"
      );
    }
    if (modeFilter === "general") {
      // Tugas umum: non-session (mode date atau lainnya)
      return assessments.filter(
        (a) => a.assessment_submission_mode !== "session"
      );
    }
    return assessments;
  }, [assessments, modeFilter]);

  // 2) Filter search
  const filteredAssessments = useMemo(() => {
    if (!search.trim()) return filteredByMode;
    const q = search.toLowerCase();
    return filteredByMode.filter((a) => {
      return (
        a.assessment_title.toLowerCase().includes(q) ||
        (a.assessment_slug ?? "").toLowerCase().includes(q) ||
        (a.assessment_description ?? "").toLowerCase().includes(q)
      );
    });
  }, [filteredByMode, search]);

  const errorMessage = isError
    ? (error as any)?.response?.data?.message ||
    (error as Error).message ||
    "Gagal memuat data."
    : null;

  const totalClassAnnounce = assessments.filter(
    (a) => a.assessment_submission_mode === "session"
  ).length;
  const totalGeneral = assessments.filter(
    (a) => a.assessment_submission_mode !== "session"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="md:flex hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Penilaian untuk {csstName}
            </h1>
            <p className="text-xs text-muted-foreground">
              Daftar latihan, kuis, dan penilaian lain yang terhubung ke kelas
              ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Clock className="mr-2 h-3 w-3 animate-spin" />
                Memuat…
              </>
            ) : (
              <>
                <Clock className="mr-2 h-3 w-3" />
                Refresh
              </>
            )}
          </Button>

          <Button size="sm" asChild>
            <Link to={`new`}>
              <ListChecks className="mr-2 h-4 w-4" />
              Buat Penilaian
            </Link>
          </Button>
        </div>
      </div>

      {/* Search + Filter tabs */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-[260px]">
              <label className="text-xs font-medium text-muted-foreground">
                Cari penilaian
              </label>

              <CMenuSearch
                value={search}
                onChange={setSearch}
                placeholder="Cari berdasarkan judul atau deskripsi…"
                className="w-full mt-1"
              />
            </div>


            <div className="flex flex-col gap-2 text-xs text-muted-foreground md:items-end">
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                <span>Mode: date / session</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Jenis: quiz / latihan dll.</span>
              </div>
            </div>
          </div>

          {/* Filter segmented tabs */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge className="gap-1 text-[11px] py-1">
                <ListChecks size={12} />
                Semua: {assessments.length}
              </Badge>

              <Badge variant="secondary" className="gap-1 text-[11px] py-1">
                <Timer size={12} />
                Belum Dikerjakan: {totalClassAnnounce}
              </Badge>

              <Badge variant="secondary" className="gap-1 text-[11px] py-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Selesai: {totalGeneral}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <CSegmentedTabs
        value={modeFilter}
        onValueChange={(v) => setModeFilter(v as ModeFilter)}
        tabs={MODE_TABS}
      />

      {/* List */}
      {isLoading ? (
        <LoadingSkeletonList />
      ) : errorMessage ? (
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
      ) : filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {assessments.length === 0 ? (
              <>
                Belum ada penilaian untuk kelas ini.
                <br />
                <span className="text-xs">
                  Klik <span className="font-medium">“Buat Penilaian”</span>{" "}
                  untuk membuat yang pertama.
                </span>
              </>
            ) : (
              <>Penilaian tidak ditemukan. Coba ubah kata kunci atau filter.</>
            )}
          </CardContent>
        </Card>
      ) : modeFilter === "class_announce" ? (
        // 🔹 View khusus Class announce → pakai table supaya rapih
        <ClassAnnounceTable
          assessments={filteredAssessments}
          csstId={csstId ?? ""}
        />
      ) : (
        // 🔹 View default & tugas umum → tetap pakai card
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.assessment_id}
              csstId={csstId ?? ""}
              assessment={assessment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =======================
   Table view — Class announce
======================= */

function ClassAnnounceTable({
  assessments,
  csstId,
}: {
  assessments: AssessmentItem[];
  csstId: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Class announce (berbasis sesi pertemuan)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Ditampilkan dalam bentuk tabel agar jadwal announce & collect tiap
          pertemuan terlihat lebih rapih.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[720px] text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Penilaian</TableHead>
                <TableHead>Announce session</TableHead>
                <TableHead>Collect session</TableHead>
                <TableHead className="text-center">Durasi</TableHead>
                <TableHead className="text-center">Soal</TableHead>
                <TableHead className="text-center">Submit / Dinilai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((a) => {
                const announce = a.assessment_announce_session_snapshot;
                const collect = a.assessment_collect_session_snapshot;

                return (
                  <TableRow key={a.assessment_id}>
                    {/* Penilaian */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-medium">
                            {a.assessment_title}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {a.assessment_type_snapshot?.name ?? "Penilaian"}
                          </Badge>
                          {a.assessment_kind === "quiz" && (
                            <Badge variant="outline" className="text-[10px]">
                              Quiz
                            </Badge>
                          )}
                          {a.assessment_is_published ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300 text-[10px]"
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
                        </div>
                        {a.assessment_slug && (
                          <p className="text-[11px] font-mono text-muted-foreground">
                            slug: {a.assessment_slug}
                          </p>
                        )}
                        {a.assessment_description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {a.assessment_description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Announce */}
                    <TableCell>
                      {announce?.title ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] font-medium">
                              {announce.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDateOnly(announce.date)} ·{" "}
                            {formatDateTime(announce.starts_at)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Collect */}
                    <TableCell>
                      {collect?.title ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] font-medium">
                              {collect.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDateOnly(collect.date)} ·{" "}
                            {formatDateTime(collect.starts_at)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Durasi */}
                    <TableCell className="text-center align-top">
                      <span className="text-[11px] font-medium">
                        {a.assessment_duration_minutes
                          ? `${a.assessment_duration_minutes} menit`
                          : "-"}
                      </span>
                    </TableCell>

                    {/* Soal */}
                    <TableCell className="text-center align-top">
                      <span className="text-[11px] font-medium">
                        {a.assessment_quiz_total ?? "-"}
                      </span>
                    </TableCell>

                    {/* Submit / graded */}
                    <TableCell className="text-center align-top">
                      <div className="flex flex-col items-center gap-0.5 text-[11px]">
                        <span>
                          Submit:{" "}
                          <span className="font-semibold">
                            {a.assessment_submissions_total ?? 0}
                          </span>
                        </span>
                        <span>
                          Dinilai:{" "}
                          <span className="font-semibold">
                            {a.assessment_submissions_graded_total ?? 0}
                          </span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right align-top">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          asChild
                          className="h-7 px-2 text-[11px]"
                        >
                          <Link
                            to={`/sekolahislamku/teacher/csst/${csstId}/assessments/${a.assessment_id}`}
                          >
                            <FileText className="mr-1 h-3 w-3" />
                            Detail
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          asChild
                          className="h-7 px-2 text-[11px]"
                        >
                          <Link
                            to={`/sekolahislamku/teacher/csst/${csstId}/assessments/${a.assessment_id}/submissions`}
                          >
                            <ListChecks className="mr-1 h-3 w-3" />
                            Pengumpulan
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* =======================
   Card per assessment
======================= */

function AssessmentCard({
  assessment,
}: {
  assessment: AssessmentItem;
  csstId: string;
}) {
  const typeName =
    assessment.assessment_type_snapshot?.name ??
    (assessment.assessment_kind === "quiz" ? "Quiz" : "Penilaian");

  const isSessionMode = assessment.assessment_submission_mode === "session";

  const announce = assessment.assessment_announce_session_snapshot;
  const collect = assessment.assessment_collect_session_snapshot;

  const submissionsTotal = assessment.assessment_submissions_total ?? 0;
  const gradedTotal = assessment.assessment_submissions_graded_total ?? 0;

  return (
    <Card className={cn("border-border/70", cardHover)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
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
                  Mode: Batas Waktu
                </Badge>
              )}
            </div>

            {assessment.assessment_slug && (
              <p className="text-xs font-mono text-muted-foreground">
                slug: {assessment.assessment_slug}
              </p>
            )}

            {assessment.assessment_description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
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
                Diupdate: {formatDateTime(assessment.assessment_updated_at)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <Separator className="my-2" />

        {/* Jadwal / Mode info */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1 text-xs">
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
                  <span>{formatDateTime(assessment.assessment_start_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">
                    Batas
                  </span>
                  <span>{formatDateTime(assessment.assessment_due_at)}</span>
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

          {/* Detail angka */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
              <Timer className="h-3 w-3" />
              <span>Ringkasan</span>
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

            <Separator className="my-2" />

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                <span>
                  Submit:{" "}
                  <span className="font-semibold">{submissionsTotal}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  Sudah dinilai:{" "}
                  <span className="font-semibold">{gradedTotal}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground">
            Kelas:{" "}
            <span className="font-medium">
              {assessment.assessment_csst_snapshot?.name ?? "—"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`${assessment.assessment_id}`}>
                <FileText className="mr-1.5 h-3 w-3" />
                Lihat detail
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =======================
   Loading skeleton
======================= */

function LoadingSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}