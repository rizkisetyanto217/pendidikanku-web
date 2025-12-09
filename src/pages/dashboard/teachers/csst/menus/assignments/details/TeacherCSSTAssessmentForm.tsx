// src/pages/sekolahislamku/teacher/TeacherCSSTAssessmentForm.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  Timer,
  FileText,
  CalendarDays,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =========================
   Types minimal payload
========================= */

type AssessmentKind = "quiz" | "assignment_upload" | "offline" | "survey";
type AssessmentSubmissionMode = "date" | "session" | string;

type QuizInlinePayload = {
  quiz_title: string;
  quiz_description?: string;
};

type CreateAssessmentPayload = {
  assessment: {
    assessment_class_section_subject_teacher_id?: string | null;
    assessment_type_id?: string | null;

    assessment_slug?: string | null;
    assessment_title: string;
    assessment_description?: string | null;

    assessment_start_at?: string | null;
    assessment_due_at?: string | null;
    assessment_published_at?: string | null;
    assessment_closed_at?: string | null;

    assessment_kind: AssessmentKind;
    assessment_duration_minutes?: number | null;
    assessment_total_attempts_allowed?: number;
    assessment_max_score?: number;
    assessment_quiz_total?: number | null;

    assessment_is_published?: boolean;
    assessment_allow_submission?: boolean;

    assessment_created_by_teacher_id?: string | null;

    assessment_announce_session_id?: string | null;
    assessment_collect_session_id?: string | null;
  };

  quiz?: QuizInlinePayload;
  quizzes?: QuizInlinePayload[];
};

type CreateAssessmentResponse = {
  success: boolean;
  message: string;
  data: {
    assessment: {
      assessment_id: string;
    };
    quizzes: any[];
  };
};

/* Detail untuk edit */
type AssessmentDetail = {
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
  assessment_submission_mode: AssessmentSubmissionMode;

  assessment_announce_session_snapshot?: {
    session_id?: string;
  } | null;
  assessment_collect_session_snapshot?: {
    session_id?: string;
  } | null;
};

type AssessmentDetailResponse = {
  success: boolean;
  message: string;
  data: AssessmentDetail;
};

/* =========================
   Helpers
========================= */

function toIsoOrNull(v: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function isoToLocalInput(v: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

type LocalMode = "date" | "session";

type QuizForm = {
  id: string;
  title: string;
  desc: string;
};

function makeQuizId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* =========================
   Detail hook (edit)
========================= */

function useAssessmentDetail(assessmentId?: string) {
  return useQuery<AssessmentDetail>({
    queryKey: ["teacher-assessment-detail", assessmentId],
    enabled: !!assessmentId,
    queryFn: async () => {
      const res = await axios.get<AssessmentDetailResponse>(
        `/api/u/assessments/${assessmentId}`
      );
      return res.data.data;
    },
  });
}

/* =========================
   Component
========================= */

export default function TeacherCSSTAssessmentForm() {
  const { csstId, assessmentId } = useParams<{
    csstId: string;
    assessmentId?: string;
  }>();
  const isEdit = !!assessmentId;

  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Buat Penilaian Baru",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mata Pelajaran" },
        { label: "Detail Mata Pelajaran" },
        { label: "Penilaian Mata Pelajaran" },
        { label: "Buat Penilaian Baru" },
      ],
      showBack: true,
    });
  }, [setHeader]);
  const qc = useQueryClient();

  /* state utama */
  const [mode, setMode] = useState<LocalMode>("date");
  const [kind, setKind] = useState<AssessmentKind>("quiz");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [typeId, setTypeId] = useState("");

  const [startAt, setStartAt] = useState<string | null>(null); // datetime-local
  const [dueAt, setDueAt] = useState<string | null>(null);

  const [announceSessionId, setAnnounceSessionId] = useState("");
  const [collectSessionId, setCollectSessionId] = useState("");

  const [durationMinutes, setDurationMinutes] = useState<string>("120");
  const [attempts, setAttempts] = useState<string>("1");
  const [maxScore, setMaxScore] = useState<string>("100");
  const [quizTotal, setQuizTotal] = useState<string>("");

  const [isPublished, setIsPublished] = useState(true);
  const [allowSubmission, setAllowSubmission] = useState(true);

  // Multi quiz state – dipakai HANYA untuk create
  const [quizzes, setQuizzes] = useState<QuizForm[]>([
    { id: makeQuizId(), title: "", desc: "" },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* load detail kalau edit */
  const {
    data: detail,
    isLoading: loadingDetail,
    isError: detailError,
  } = useAssessmentDetail(assessmentId);

  // Prefill state saat edit
  useEffect(() => {
    if (!detail || !isEdit) return;

    setTitle(detail.assessment_title ?? "");
    setSlug(detail.assessment_slug ?? "");
    setDesc(detail.assessment_description ?? "");
    setTypeId(detail.assessment_type_id ?? "");

    setKind(detail.assessment_kind ?? "quiz");

    setMode(
      detail.assessment_submission_mode === "session" ? "session" : "date"
    );

    setStartAt(isoToLocalInput(detail.assessment_start_at));
    setDueAt(isoToLocalInput(detail.assessment_due_at));

    setAnnounceSessionId(
      detail.assessment_announce_session_snapshot?.session_id ?? ""
    );
    setCollectSessionId(
      detail.assessment_collect_session_snapshot?.session_id ?? ""
    );

    setDurationMinutes(
      detail.assessment_duration_minutes != null
        ? String(detail.assessment_duration_minutes)
        : ""
    );
    setAttempts(
      detail.assessment_total_attempts_allowed != null
        ? String(detail.assessment_total_attempts_allowed)
        : "1"
    );
    setMaxScore(
      detail.assessment_max_score != null
        ? String(detail.assessment_max_score)
        : "100"
    );
    setQuizTotal(
      detail.assessment_quiz_total != null
        ? String(detail.assessment_quiz_total)
        : ""
    );

    setIsPublished(detail.assessment_is_published);
    setAllowSubmission(detail.assessment_allow_submission);
  }, [detail, isEdit]);

  /* quiz helpers (create only) */
  const addQuiz = () => {
    setQuizzes((prev) => [...prev, { id: makeQuizId(), title: "", desc: "" }]);
  };

  const removeQuiz = (id: string) => {
    setQuizzes((prev) => {
      if (prev.length <= 1) return prev; // minimal 1 quiz
      return prev.filter((q) => q.id !== id);
    });
  };

  const updateQuiz = (id: string, patch: Partial<QuizForm>) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  };

  /* mutation create + edit */
  const createMut = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);

      if (!title.trim()) {
        throw new Error("Judul penilaian wajib diisi");
      }

      const payload: CreateAssessmentPayload = {
        assessment: {
          assessment_class_section_subject_teacher_id: csstId ?? undefined,
          assessment_type_id: typeId.trim() ? typeId.trim() : undefined,

          assessment_slug: slug.trim() ? slug.trim() : undefined,
          assessment_title: title.trim(),
          assessment_description: desc.trim() ? desc.trim() : undefined,

          assessment_start_at: toIsoOrNull(startAt),
          assessment_due_at: toIsoOrNull(dueAt),

          assessment_kind: kind,
          assessment_duration_minutes: durationMinutes
            ? Number(durationMinutes)
            : undefined,
          assessment_total_attempts_allowed: attempts
            ? Number(attempts)
            : undefined,
          assessment_max_score: maxScore ? Number(maxScore) : undefined,
          assessment_quiz_total: quizTotal ? Number(quizTotal) : undefined,

          assessment_is_published: isPublished,
          assessment_allow_submission: allowSubmission,

          assessment_announce_session_id:
            mode === "session" && announceSessionId.trim()
              ? announceSessionId.trim()
              : undefined,
          assessment_collect_session_id:
            mode === "session" && collectSessionId.trim()
              ? collectSessionId.trim()
              : undefined,
        },
      };

      // 🔹 VALIDASI QUIZ hanya saat CREATE
      if (!isEdit) {
        if (quizzes.length === 0) {
          throw new Error("Minimal harus ada 1 quiz");
        }

        const normalizedQuizzes: QuizInlinePayload[] = quizzes
          .map((q) => ({
            quiz_title: q.title.trim(),
            quiz_description: q.desc.trim() || undefined,
          }))
          .filter((q) => q.quiz_title !== "");

        if (normalizedQuizzes.length === 0) {
          throw new Error("Minimal 1 quiz dengan judul wajib diisi");
        }

        if (normalizedQuizzes.length === 1) {
          payload.quiz = normalizedQuizzes[0];
        } else {
          payload.quizzes = normalizedQuizzes;
        }
      }

      if (isEdit && assessmentId) {
        const res = await axios.patch<CreateAssessmentResponse>(
          `/api/u/assessments/${assessmentId}`,
          payload
        );
        return res.data;
      }

      const res = await axios.post<CreateAssessmentResponse>(
        "/api/u/assessments",
        payload
      );
      return res.data;
    },
    onSuccess: (data) => {
      const createdId = data?.data?.assessment?.assessment_id;

      if (csstId) {
        qc.invalidateQueries({
          queryKey: ["teacher-assessments", csstId],
        });
      }

      if (isEdit && assessmentId && csstId) {
        // setelah edit → balik ke detail
        navigate(
          `/sekolahislamku/teacher/csst/${csstId}/assessments/${assessmentId}`
        );
      } else if (!isEdit && createdId && csstId) {
        // setelah create → ke detail assessment baru
        navigate(
          `/sekolahislamku/teacher/csst/${csstId}/assessments/${createdId}`
        );
      } else if (csstId) {
        navigate(`/sekolahislamku/teacher/csst/${csstId}/assessments`);
      } else {
        navigate(-1);
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal menyimpan assessment";
      setErrorMsg(msg);
    },
  });

  const submitting = createMut.isPending || (isEdit && loadingDetail);

  const pageTitle = isEdit ? "Edit Penilaian" : "Buat Penilaian Baru";
  const saveLabel = isEdit ? "Simpan perubahan" : "Simpan penilaian";

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="md:flex hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-semibold leading-tight">
              {pageTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Perbarui pengaturan penilaian untuk kelas-mapel ini."
                : "Tambahkan penilaian untuk kelas-mapel ini beserta satu atau lebih quiz."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {/* <Button variant="outline" size="sm" asChild disabled={submitting}>
            <Link
              to={
                csstId
                  ? `/sekolahislamku/teacher/csst/${csstId}/assessments`
                  : "#"
              }
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Kembali ke daftar
            </Link>
          </Button> */}

          <Button
            size="sm"
            onClick={() => createMut.mutate()}
            disabled={submitting || (isEdit && detailError)}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {saveLabel}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error detail */}
      {isEdit && detailError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-3 text-xs text-destructive">
            Tidak bisa memuat data penilaian. Coba kembali ke daftar.
          </CardContent>
        </Card>
      )}

      {/* Error submit */}
      {errorMsg && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-3 text-xs text-destructive">
            {errorMsg}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* =========================
            Card: Pengaturan Assessment
        ========================== */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Pengaturan penilaian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Judul & slug */}
            <div className="space-y-2">
              <Label className="text-xs">Judul penilaian</Label>
              <Input
                placeholder="Misal: Latihan Soal sekarang"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Kalau dikosongkan, backend akan mencoba autofill dari CSST /
                sesi.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">
                Slug (opsional, unik per sekolah)
              </Label>
              <Input
                placeholder="latihan-soal-sekarang"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Deskripsi (opsional)</Label>
              <Textarea
                placeholder="Jelaskan cakupan bab, bagian, dan instruksi singkat untuk siswa…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                disabled={submitting}
                rows={3}
              />
            </div>

            <Separator />

            {/* Kind + Type */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  Jenis penilaian
                  <span className="text-[10px] text-muted-foreground">
                    (assessment_kind)
                  </span>
                </Label>
                <Select
                  value={kind}
                  onValueChange={(v) => setKind(v as AssessmentKind)}
                  disabled={submitting}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz / Latihan</SelectItem>
                    <SelectItem value="assignment_upload">
                      Tugas upload
                    </SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  Assessment Type ID (opsional)
                  <span className="text-[10px] text-muted-foreground">
                    (assessment_type_id)
                  </span>
                </Label>
                <Input
                  placeholder="UUID tipe penilaian (Latihan, UTS, UAS, dll)"
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  disabled={submitting}
                />
                <p className="text-[10px] text-muted-foreground">
                  Isi dengan ID dari /assessment-types kalau mau snapshot tipe.
                </p>
              </div>
            </div>

            <Separator />

            {/* Mode: date vs session */}
            <div className="space-y-2">
              <Label className="text-xs">Mode pengumpulan</Label>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Button
                  type="button"
                  variant={mode === "date" ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-[11px]"
                  onClick={() => setMode("date")}
                  disabled={submitting}
                >
                  <CalendarDays className="mr-1.5 h-3 w-3" />
                  Mode tanggal
                </Button>
                <Button
                  type="button"
                  variant={mode === "session" ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-[11px]"
                  onClick={() => setMode("session")}
                  disabled={submitting}
                >
                  <Timer className="mr-1.5 h-3 w-3" />
                  Mode session (pertemuan)
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Backend akan menentukan{" "}
                <code className="rounded bg-muted px-1">
                  assessment_submission_mode
                </code>{" "}
                berdasarkan presence{" "}
                <code className="rounded bg-muted px-1">
                  assessment_announce_session_id
                </code>{" "}
                /{" "}
                <code className="rounded bg-muted px-1">
                  assessment_collect_session_id
                </code>
                .
              </p>
            </div>

            {mode === "date" ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Mulai (assessment_start_at)</Label>
                  <Input
                    type="datetime-local"
                    value={startAt ?? ""}
                    onChange={(e) => setStartAt(e.target.value || null)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    Batas akhir (assessment_due_at)
                  </Label>
                  <Input
                    type="datetime-local"
                    value={dueAt ?? ""}
                    onChange={(e) => setDueAt(e.target.value || null)}
                    disabled={submitting}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">
                    Announce session ID (assessment_announce_session_id)
                  </Label>
                  <Input
                    placeholder="UUID sesi pertemuan untuk mengumumkan"
                    value={announceSessionId}
                    onChange={(e) => setAnnounceSessionId(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">
                    Collect session ID (assessment_collect_session_id)
                  </Label>
                  <Input
                    placeholder="UUID sesi pertemuan untuk pengumpulan"
                    value={collectSessionId}
                    onChange={(e) => setCollectSessionId(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Pengaturan angka */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">
                  Durasi pengerjaan (menit) — optional
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={1440}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Maksimal percobaan per siswa</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={attempts}
                  onChange={(e) => setAttempts(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Nilai maksimum</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">
                  Total komponen quiz (opsional)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={quizTotal}
                  onChange={(e) => setQuizTotal(e.target.value)}
                  disabled={submitting}
                />
                <p className="text-[10px] text-muted-foreground">
                  Kalau kosong, backend akan isi dari jumlah quiz inline.
                </p>
              </div>
            </div>

            <Separator />

            {/* Flags */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Dipublikasikan</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Mengatur <code>assessment_is_published</code>.
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs">Pengumpulan dibuka</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Mengatur <code>assessment_allow_submission</code>.
                  </p>
                </div>
                <Switch
                  checked={allowSubmission}
                  onCheckedChange={setAllowSubmission}
                  disabled={submitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =========================
            Card: Multi Quiz
            (HANYA CREATE)
        ========================== */}
        {!isEdit ? (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <CardTitle className="text-sm font-semibold">
                  Quiz untuk assessment ini
                </CardTitle>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px]"
                onClick={addQuiz}
                disabled={submitting}
              >
                <Plus className="mr-1 h-3 w-3" />
                Tambah quiz
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground">
                Endpoint ini memakai payload <code>quiz</code> /{" "}
                <code>quizzes</code>. Kalau hanya satu, akan dikirim sebagai{" "}
                <code>quiz</code>. Kalau lebih dari satu, akan dikirim sebagai{" "}
                <code>quizzes</code> agar sesuai dengan{" "}
                <code>FlattenQuizzes()</code> di backend.
              </p>

              <div className="space-y-3">
                {quizzes.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-md border p-3 space-y-2 bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold text-muted-foreground">
                        Quiz {idx + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeQuiz(q.id)}
                        disabled={submitting || quizzes.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Judul quiz (quiz_title)</Label>
                      <Input
                        placeholder="Misal: Latihan Soal sekarang"
                        value={q.title}
                        onChange={(e) =>
                          updateQuiz(q.id, { title: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">
                        Deskripsi (quiz_description, opsional)
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="Deskripsi singkat quiz, petunjuk, atau cakupan bab…"
                        value={q.desc}
                        onChange={(e) =>
                          updateQuiz(q.id, { desc: e.target.value })
                        }
                        disabled={submitting}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-[11px] text-muted-foreground">
                <p className="font-medium">Catatan backend:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Minimal harus ada 1 quiz dengan judul terisi — sisanya
                    opsional.
                  </li>
                  <li>
                    Slug quiz akan otomatis digenerate di backend (mirip
                    assessment).
                  </li>
                  <li>
                    Semua quiz akan di-attach ke <code>assessment_id</code> yang
                    baru dibuat.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Quiz untuk assessment ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-[11px] text-muted-foreground">
              <p>
                Pengaturan quiz untuk assessment ini sebaiknya dikelola di
                halaman detail / builder quiz khusus.
              </p>
              <p>
                Form ini hanya mengubah meta penilaian (judul, tipe, jadwal,
                durasi, dan flag publikasi), tanpa mengubah konfigurasi quiz
                yang sudah ada di backend.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
