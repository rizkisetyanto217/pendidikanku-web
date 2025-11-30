// src/pages/sekolahislamku/pages/student/StudentQuiz.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* icons */
import { ArrowLeft, Timer, Send, AlertTriangle } from "lucide-react";

/* breadcrumb */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* optional, kalau ada di project-mu */
import { htmlToPlainText } from "@/components/costum/CRichTextEditor";
import type { AxiosError } from "axios";

/* =========================
   Types
========================= */

type StudentQuestionType = "single" | "short_text" | "paragraph";

type StudentOption = {
  key: string; // "A", "B", ...
  text: string;
};

type StudentQuestion = {
  id: string;
  text: string; // boleh HTML
  type: StudentQuestionType;
  points: number;
  options?: StudentOption[]; // untuk pilihan ganda
};

type QuizMetaFromState = {
  title?: string;
  description?: string;
  timeLimitMin?: number | null;
  attemptsAllowed?: number;
};

type SubmitPayload = {
  quiz_id: string;
  answers: {
    question_id: string;
    answer: string | string[];
  }[];
};

/* =========================
   API DTO TYPES
========================= */

type ApiQuizQuestionItem = {
  quiz_question_id: string;
  quiz_question_quiz_id: string;
  quiz_question_school_id: string;
  quiz_question_type: "single" | "short_text" | "paragraph" | string;
  quiz_question_text: string;
  quiz_question_points: number;
  quiz_question_answers?: Record<string, string> | null;
  quiz_question_correct?: string | null;
  quiz_question_explanation?: string | null;
  quiz_question_created_at: string;
  quiz_question_updated_at: string;
};

type ApiQuizQuestionListResponse = {
  success: boolean;
  message: string;
  data: ApiQuizQuestionItem[];
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
  return "Terjadi kesalahan saat memuat soal kuis.";
};

/* mapping dari API -> model frontend */
const mapApiQuestionToStudentQuestion = (
  api: ApiQuizQuestionItem
): StudentQuestion => {
  const typeApi = (api.quiz_question_type || "").toLowerCase();
  let type: StudentQuestionType = "single";
  if (typeApi === "short_text") type = "short_text";
  else if (typeApi === "paragraph") type = "paragraph";
  else type = "single"; // default

  let options: StudentOption[] | undefined;
  if (type === "single" && api.quiz_question_answers) {
    // convert { "A": "Text", "B": "Text" } -> [{ key, text }]
    options = Object.entries(api.quiz_question_answers)
      .map(([key, text]) => ({
        key,
        text,
      }))
      // sort biar urut A,B,C,D,...
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  return {
    id: api.quiz_question_id,
    text: api.quiz_question_text,
    type,
    points: api.quiz_question_points ?? 1,
    options,
  };
};

/* util kecil buat format mm:ss */
function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* =========================
   Page Component
========================= */

export default function StudentQuiz() {
  const { quizId = "" } = useParams<{ quizId: string }>();

  const navigate = useNavigate();
  const { state } = useLocation();
  const { setHeader } = useDashboardHeader();

  const quizMeta = useMemo(() => (state ?? {}) as QuizMetaFromState, [state]);
  const timeLimit = quizMeta.timeLimitMin != null ? quizMeta.timeLimitMin : 45; // default 45 menit
  const attemptsAllowed = quizMeta.attemptsAllowed ?? 1;

  /* ====== Load questions dari API ====== */

  const quizQuestionsQ = useQuery<ApiQuizQuestionListResponse, AxiosError>({
    queryKey: ["student-quiz-questions", quizId],
    enabled: !!quizId,
    queryFn: async () => {
      const res = await axios.get<ApiQuizQuestionListResponse>(
        "/u/quiz-questions/list",
        {
          params: {
            quiz_id: quizId,
            page: 1,
            per_page: 200, // asumsi max 200 soal per quiz
          },
        }
      );
      return res.data;
    },
    staleTime: 30_000,
  });

  const quizError: string | null = quizQuestionsQ.isError
    ? extractErrorMessage(quizQuestionsQ.error)
    : null;

  const questions: StudentQuestion[] = useMemo(
    () => quizQuestionsQ.data?.data?.map(mapApiQuestionToStudentQuestion) ?? [],
    [quizQuestionsQ.data]
  );

  /* ====== State Jawaban & UI ====== */

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [doubts, setDoubts] = useState<Record<string, boolean>>({});

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // mode tampilan soal: scroll semua / satu-satu
  const [mode, setMode] = useState<"scroll" | "paged">("scroll");
  const [currentIndex, setCurrentIndex] = useState(0);

  // dialog pengaturan lanjutan
  const [settingsOpen, setSettingsOpen] = useState(false);

  // timer (detik)
  const [remainingSec, setRemainingSec] = useState(timeLimit * 60);

  /* ====== Header / breadcrumb ====== */

  useEffect(() => {
    const title = quizMeta.title || "Kerjakan Kuis";
    setHeader?.({
      title,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        // kita lagi di /student/mapel/:csstId/ujian/quiz/:quizId
        // jadi cukup "../" buat balik ke /student/mapel/:csstId/ujian
        { label: "Ujian", href: "../" },
        { label: title },
      ],
      showBack: true,
    });
  }, [setHeader, quizMeta]);

  const handleBack = () => navigate(-1);

  /* ====== Timer effect ====== */

  useEffect(() => {
    setRemainingSec(timeLimit * 60);
  }, [timeLimit]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  /* ====== Clamp index kalau jumlah soal berubah ====== */
  useEffect(() => {
    if (!questions.length) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((idx) => Math.min(Math.max(0, idx), questions.length - 1));
  }, [questions.length]);

  /* ====== Jawaban handler ====== */

  const handleChangeSingle = (qid: string, key: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: key }));
  };

  const handleChangeShortText = (qid: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: text }));
  };

  const handleChangeNote = (qid: string, text: string) => {
    setNotes((prev) => ({ ...prev, [qid]: text }));
  };

  const toggleDoubt = (qid: string) => {
    setDoubts((prev) => ({ ...prev, [qid]: !prev[qid] }));
  };

  /* ====== Hitung jumlah terjawab ====== */

  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () =>
      questions.filter((q) => {
        const val = answers[q.id];
        if (typeof val === "string") return val.trim() !== "";
        if (Array.isArray(val)) return val.length > 0;
        return false;
      }).length,
    [questions, answers]
  );

  /* ====== Submit (DUMMY, tapi pakai data API) ====== */
  const doSubmit = () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    // 1) Cek dulu: masih ada soal ragu-ragu?
    const hasDoubt = Object.values(doubts).some((v) => v);
    if (hasDoubt) {
      setSubmitError(
        "Masih ada soal yang ditandai ragu-ragu. Silakan cek ulang dan hapus tanda ragu-ragu di semua soal sebelum mengirim jawaban."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2) Cek soal yang belum dijawab
    const unanswered = questions.filter((q) => {
      const val = answers[q.id];
      if (typeof val === "string") return val.trim() === "";
      if (Array.isArray(val)) return val.length === 0;
      return true;
    });

    if (unanswered.length > 0) {
      setSubmitError(
        `Masih ada ${unanswered.length} pertanyaan yang belum dijawab.`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 3) Semua aman -> submit (dummy)
    const payload: SubmitPayload = {
      quiz_id: quizId,
      answers: questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id],
      })),
    };

    console.log("[QUIZ SUBMIT (DUMMY)] payload:", payload);

    setSubmitSuccess(
      "Jawaban kamu berhasil disimpan (dummy). Cek console browser untuk melihat payload yang akan dikirim ke backend."
    );
  };

  /* soal yang ditampilkan sesuai mode */
  const visibleQuestions: StudentQuestion[] = useMemo(() => {
    if (!questions.length) return [];
    if (mode === "scroll") return questions;
    const idx = Math.min(currentIndex, questions.length - 1);
    return [questions[idx]];
  }, [questions, mode, currentIndex]);

  /* ====== Question Map (untuk mode satu per satu) ====== */

  type QuestionStatus = "empty" | "answered" | "doubt";

  const questionStatuses: QuestionStatus[] = useMemo(
    () =>
      questions.map((q) => {
        const val = answers[q.id];
        const hasAnswer =
          typeof val === "string"
            ? val.trim() !== ""
            : Array.isArray(val)
            ? val.length > 0
            : false;
        const isDoubt = !!doubts[q.id];

        if (isDoubt) return "doubt";
        if (hasAnswer) return "answered";
        return "empty";
      }),
    [questions, answers, doubts]
  );

  /* ====== Loading & Error state ====== */

  if (quizQuestionsQ.isLoading) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="w-full px-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
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
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="w-full px-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Kerjakan Kuis</h1>
                <p className="text-xs text-muted-foreground">
                  Gagal memuat soal kuis.
                </p>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2 text-xs break-all">
                {quizError}
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => quizQuestionsQ.refetch()}
            >
              Coba lagi
            </Button>
          </div>
        </main>
      </div>
    );
  }

  /* Kalau tidak ada soal sama sekali */
  if (!questions.length) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="w-full px-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-3xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Kerjakan Kuis</h1>
                <p className="text-xs text-muted-foreground">
                  Belum ada soal yang tersedia untuk kuis ini.
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Guru belum menambahkan soal untuk kuis ini, atau soal belum
                dipublikasikan.
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     RENDER UTAMA
  ========================== */

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-6">
        <div
          className={cn(
            "mx-auto max-w-3xl flex flex-col gap-4",
            mode === "paged" && "min-h-[calc(100vh-6rem)]"
          )}
        >
          {/* Top bar (mobile) */}
          <div className="flex items-center gap-3 md:hidden">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {quizMeta.title || "Kerjakan Kuis"}
            </h1>
          </div>

          {/* Info quiz – DISABLED saat mode satu per satu */}
          {mode === "scroll" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg">
                  {quizMeta.title || "Kuis Online"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm text-muted-foreground">
                <p className="whitespace-pre-wrap">
                  {quizMeta.description ||
                    "Jawab semua pertanyaan berikut sesuai kemampuanmu."}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="h-5">
                    <Timer className="h-3 w-3 mr-1" />
                    {timeLimit} menit
                  </Badge>
                  <Badge variant="outline" className="h-5">
                    Percobaan: {attemptsAllowed}x
                  </Badge>
                  <Badge variant="outline" className="h-5">
                    {questions.length} pertanyaan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar: waktu & progress & pengaturan */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span>
                Sisa waktu:{" "}
                <span className="font-semibold text-foreground">
                  {formatTime(remainingSec)}
                </span>
              </span>
              <span>
                • Terjawab{" "}
                <span className="font-semibold">
                  {answeredCount}/{totalQuestions}
                </span>{" "}
                soal
              </span>
              {mode === "scroll" && (
                <span className="hidden md:inline">
                  • Mode:{" "}
                  <span className="font-semibold">Scroll (semua soal)</span>
                </span>
              )}
              {mode === "paged" && (
                <span className="hidden md:inline">
                  • Mode: <span className="font-semibold">Satu per satu</span>
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              Pengaturan lanjutan
            </Button>
          </div>

          {/* Question map (hanya saat mode satu per satu) */}
          {mode === "paged" && (
            <Card className="border-dashed bg-card/40">
              <CardContent className="py-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">
                    Peta soal ({totalQuestions} pertanyaan)
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                      Belum dijawab
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Terjawab
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Ragu-ragu
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                  {questionStatuses.map((status, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          "h-7 text-[11px] rounded-md border flex items-center justify-center transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",

                          status === "empty" &&
                            "border-border bg-muted/40 text-muted-foreground",
                          status === "answered" &&
                            "border-primary/70 bg-primary/10 dark:bg-primary/20 text-primary",
                          status === "doubt" &&
                            "border-amber-500 bg-amber-500/10 text-amber-300",

                          // ⬇️ ganti bagian ini
                          isActive &&
                            "ring-1 ring-primary bg-primary text-foreground font-semibold"
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error / success submit */}
          {submitError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {submitError}
              </AlertDescription>
            </Alert>
          )}
          {submitSuccess && (
            <Alert>
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          )}

          {/* List pertanyaan */}
          <div
            className={cn(
              "grid gap-4",
              mode === "paged" && "grid-cols-1 auto-rows-fr"
            )}
          >
            {visibleQuestions.map((q) => {
              const idx = questions.findIndex((it) => it.id === q.id);
              const qId = q.id;
              return (
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={idx}
                  value={answers[qId]}
                  note={notes[qId] ?? ""}
                  isDoubtful={!!doubts[qId]}
                  fullHeight={mode === "paged"}
                  onChangeSingle={(key) => handleChangeSingle(qId, key)}
                  onChangeShortText={(text) => handleChangeShortText(qId, text)}
                  onChangeNote={(text) => handleChangeNote(qId, text)}
                  onToggleDoubt={() => toggleDoubt(qId)}
                />
              );
            })}
          </div>

          {/* Navigasi untuk mode satu per satu */}
          {mode === "paged" && totalQuestions > 0 && (
            <div className="flex items-center justify-between mt-1 text-xs md:text-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              >
                Soal sebelumnya
              </Button>
              <span className="text-muted-foreground">
                Soal {currentIndex + 1} dari {totalQuestions}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() =>
                  setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                }
              >
                Soal berikutnya
              </Button>
            </div>
          )}

          {/* Footer submit – HANYA muncul kalau SEMUA soal terjawab */}
          {totalQuestions > 0 && answeredCount === totalQuestions && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-end">
                <Button onClick={doSubmit} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Kirim Jawaban
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Dialog Pengaturan Lanjutan */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pengaturan kuis di perangkatmu</DialogTitle>
            <DialogDescription>
              Pengaturan ini hanya mengubah cara tampilan soal di layar kamu,
              tidak mempengaruhi penilaian.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Mode scroll */}
            <Card
              className={cn(
                "border cursor-pointer transition",
                mode === "scroll"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/40"
              )}
              onClick={() => {
                setMode("scroll");
                setSettingsOpen(false); // ⬅ langsung tutup dialog
              }}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    Mode scroll — semua soal sekaligus
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Semua soal tampil dalam satu halaman. Kamu bisa gulir ke
                    atas/bawah untuk berpindah soal dengan cepat.
                  </p>
                </div>
                <div className="ml-auto">
                  {mode === "scroll" && (
                    <Badge variant="default" className="h-5 text-[11px]">
                      Dipakai
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mode satu per satu */}
            <Card
              className={cn(
                "border cursor-pointer transition",
                mode === "paged"
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/40"
              )}
              onClick={() => {
                setMode("paged");
                setSettingsOpen(false); // ⬅ langsung tutup dialog
              }}
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="space-y-1 text-sm">
                  <div className="font-medium">
                    Mode satu per satu — fokus per soal
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hanya satu soal yang tampil sekaligus. Gunakan tombol
                    &ldquo;Soal sebelumnya/berikutnya&rdquo; atau peta soal
                    untuk berpindah.
                  </p>
                </div>
                <div className="ml-auto">
                  {mode === "paged" && (
                    <Badge variant="default" className="h-5 text-[11px]">
                      Dipakai
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================
   Question Card
========================= */

function QuestionCard({
  q,
  index,
  value,
  note,
  isDoubtful,
  fullHeight,
  onChangeSingle,
  onChangeShortText,
  onChangeNote,
  onToggleDoubt,
}: {
  q: StudentQuestion;
  index: number;
  value: string | string[] | undefined;
  note: string;
  isDoubtful: boolean;
  fullHeight: boolean;
  onChangeSingle: (key: string) => void;
  onChangeShortText: (text: string) => void;
  onChangeNote: (text: string) => void;
  onToggleDoubt: () => void;
}) {
  const plainTitle = htmlToPlainText
    ? htmlToPlainText(q.text)
    : q.text.replace(/<[^>]+>/g, "");

  const isAnswered =
    typeof value === "string"
      ? value.trim() !== ""
      : Array.isArray(value)
      ? value.length > 0
      : false;

  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  return (
    <Card
      className={cn(
        "overflow-hidden flex flex-col",
        fullHeight && "h-full",
        isDoubtful &&
          "border-amber-400 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-500"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-muted-foreground">#{index + 1}</span>
            <span className="font-medium break-words whitespace-pre-wrap">
              {plainTitle ? (
                <span dangerouslySetInnerHTML={{ __html: q.text }} />
              ) : (
                <em className="opacity-70">Pertanyaan tanpa judul</em>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground items-center">
            <Badge variant="secondary" className="h-5">
              {q.points} poin
            </Badge>
            {isAnswered && (
              <Badge variant="outline" className="h-5">
                Terjawab
              </Badge>
            )}
            {isDoubtful && (
              <Badge
                variant="outline"
                className="h-5 border-amber-500 text-amber-700 dark:text-amber-300"
              >
                Ragu-ragu
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3 flex-1 flex flex-col">
        {/* Pilihan ganda */}
        {q.type === "single" && q.options && (
          <div className="grid gap-2 mt-1">
            {q.options.map((opt) => {
              const selected = value === opt.key;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeSingle(opt.key)}
                  className={cn(
                    "w-full text-left rounded-lg border px-3 py-2.5 flex items-start gap-3",
                    "transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 h-6 w-6 rounded-full border flex items-center justify-center text-[11px] font-semibold",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 text-muted-foreground bg-muted/40"
                    )}
                  >
                    {opt.key}
                  </div>
                  <div className="text-sm leading-snug">{opt.text}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Jawaban singkat / panjang */}
        {q.type === "short_text" && (
          <Input
            placeholder="Jawaban kamu…"
            value={(value as string) ?? ""}
            onChange={(e) => onChangeShortText(e.target.value)}
          />
        )}
        {q.type === "paragraph" && (
          <Textarea
            placeholder="Jawaban kamu…"
            className="min-h-[80px]"
            value={(value as string) ?? ""}
            onChange={(e) => onChangeShortText(e.target.value)}
          />
        )}

        {/* Spacer biar tombol nempel bawah saat fullHeight */}
        <div className="flex-1" />

        {/* Tombol ragu & catatan */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={isDoubtful ? "default" : "outline"}
              onClick={onToggleDoubt}
              className="inline-flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {isDoubtful ? "Hapus tanda ragu-ragu" : "Tandai ragu-ragu"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant={noteOpen || !!note ? "default" : "outline"}
              onClick={() => setNoteOpen((o) => !o)}
              className="inline-flex items-center gap-2"
            >
              {noteOpen
                ? "Sembunyikan catatan"
                : note
                ? "Lihat / ubah catatan"
                : "Tambah catatan"}
            </Button>
          </div>

          {noteOpen && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Catatan pribadi (opsional, tidak mempengaruhi nilai)
              </p>
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => onChangeNote(e.target.value)}
                placeholder="Tulis poin penting atau hal yang masih kamu pikirkan di soal ini."
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
