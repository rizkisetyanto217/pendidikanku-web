// src/pages/dasboard/student/StudentQuizReview.tsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

/* icons */
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Award,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { htmlToPlainText } from "@/components/costum/CRichTextEditor";

/* =========================
   Types
========================= */
type QuestionType =
  | "short_text"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes";

type ReviewOption = {
  id: string;
  label?: string; // "A", "B", ...
  text: string;
  is_correct: boolean;
  is_selected: boolean;
};

type ReviewQuestion = {
  id: string;
  type: QuestionType;
  title_html: string; // pertanyaan (HTML dari RichText)
  description?: string;
  points: number;
  earned_points: number;
  is_correct: boolean;
  options?: ReviewOption[];
  student_answer_text?: string; // untuk short_text/paragraph
  correct_answer_text?: string; // optional kalau mau ditampilkan
  explanation?: string; // pembahasan
};

type QuizReviewPayload = {
  quiz_id: string;
  quiz_title: string;
  quiz_description?: string;

  settings?: {
    show_correct_after_submit?: boolean;
    time_limit_min?: number | null;
    attempts_allowed?: number;
  };

  attempt_id: string;
  attempt_started_at: string;
  attempt_finished_at: string;

  total_points: number;
  earned_points: number;
  score_percent: number;

  question_count: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;

  questions: ReviewQuestion[];
};

/* =========================
   Utils
========================= */
function formatDuration(startIso: string, endIso: string) {
  if (!startIso || !endIso) return "-";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return "-";
  const diffMs = Math.max(0, end - start);
  const totalMinutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}d`;
  }
  return `${seconds}d`;
}

/* =========================
   Page Component
========================= */
export default function StudentQuizReview() {
  // misal route: /dashboard/student/quizzes/:attemptId/review
  const { attemptId = "" } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  // ==== DATA DUMMY (nanti bisa diganti hasil API) ====
  const payload: QuizReviewPayload = useMemo(
    () => ({
      quiz_id: "quiz-1",
      quiz_title: "Kuis Fiqih Bab Thaharah",
      quiz_description:
        "Review hasil kuis bab thaharah. Perhatikan pembahasan untuk memperbaiki kesalahan.",
      settings: {
        show_correct_after_submit: true,
        time_limit_min: 30,
        attempts_allowed: 1,
      },
      attempt_id: attemptId || "attempt-dummy-1",
      attempt_started_at: "2025-11-23T12:00:00Z",
      attempt_finished_at: "2025-11-23T12:22:30Z",
      total_points: 100,
      earned_points: 78,
      score_percent: 78,
      question_count: 5,
      correct_count: 3,
      incorrect_count: 1,
      unanswered_count: 1,
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          title_html:
            "<p>Berikut ini yang <strong>bukan</strong> termasuk rukun wudhu adalah…</p>",
          description: "Pilih satu jawaban yang paling tepat.",
          points: 20,
          earned_points: 20,
          is_correct: true,
          options: [
            {
              id: "q1-a",
              label: "A",
              text: "Membasuh wajah",
              is_correct: false,
              is_selected: false,
            },
            {
              id: "q1-b",
              label: "B",
              text: "Membasuh tangan sampai siku",
              is_correct: false,
              is_selected: false,
            },
            {
              id: "q1-c",
              label: "C",
              text: "Membaca doa setelah wudhu",
              is_correct: true,
              is_selected: true,
            },
            {
              id: "q1-d",
              label: "D",
              text: "Mengusap sebagian kepala",
              is_correct: false,
              is_selected: false,
            },
          ],
          explanation:
            "Membaca doa setelah wudhu adalah amalan yang dianjurkan (sunnah), bukan rukun wudhu.",
        },
        {
          id: "q2",
          type: "multiple_choice",
          title_html:
            "<p>Air yang suci dan menyucikan, namun <em>makruh</em> digunakan jika ada air lain adalah…</p>",
          description: "",
          points: 20,
          earned_points: 0,
          is_correct: false,
          options: [
            {
              id: "q2-a",
              label: "A",
              text: "Air musta'mal (bekas dipakai wudhu)",
              is_correct: false,
              is_selected: true,
            },
            {
              id: "q2-b",
              label: "B",
              text: "Air yang terlalu panas atau terlalu dingin",
              is_correct: true,
              is_selected: false,
            },
            {
              id: "q2-c",
              label: "C",
              text: "Air laut",
              is_correct: false,
              is_selected: false,
            },
            {
              id: "q2-d",
              label: "D",
              text: "Air hujan",
              is_correct: false,
              is_selected: false,
            },
          ],
          explanation:
            "Sebagian ulama memakruhkan menggunakan air yang terlalu panas atau terlalu dingin jika menyulitkan, kecuali bila tidak ada air lain.",
        },
        {
          id: "q3",
          type: "short_text",
          title_html:
            "<p>Sebutkan <strong>niat</strong> wudhu secara singkat (boleh dengan bahasa Indonesia)!</p>",
          description: "",
          points: 20,
          earned_points: 18,
          is_correct: true,
          student_answer_text:
            "Saya niat berwudhu untuk menghilangkan hadas kecil karena Allah.",
          correct_answer_text:
            "Saya niat berwudhu untuk menghilangkan hadas kecil/beribadah karena Allah.",
          explanation:
            "Inti niat adalah kesadaran dalam hati bahwa ia berwudhu untuk ibadah karena Allah dan menghilangkan hadas.",
        },
        {
          id: "q4",
          type: "paragraph",
          title_html:
            "<p>Jelaskan secara singkat <em>hikmah</em> dari diwajibkannya wudhu sebelum shalat!</p>",
          description: "",
          points: 20,
          earned_points: 0,
          is_correct: false,
          student_answer_text: "",
          correct_answer_text:
            "Di antaranya: mensucikan lahir dan batin, mempersiapkan diri dengan tenang untuk shalat, dan membedakan antara ibadah dan aktivitas biasa.",
          explanation:
            "Wudhu bukan hanya bersih secara fisik, tapi juga menjadi momen persiapan mental dan ruhani sebelum menghadap Allah.",
        },
        {
          id: "q5",
          type: "multiple_choice",
          title_html:
            "<p>Jika seseorang lupa membasuh sebagian kecil dari anggota wudhu, maka yang harus dilakukan adalah…</p>",
          description: "",
          points: 20,
          earned_points: 20,
          is_correct: true,
          options: [
            {
              id: "q5-a",
              label: "A",
              text: "Mengulang wudhu dari awal",
              is_correct: false,
              is_selected: false,
            },
            {
              id: "q5-b",
              label: "B",
              text: "Membasuh bagian yang tertinggal saja, jika belum lama berlalu",
              is_correct: true,
              is_selected: true,
            },
            {
              id: "q5-c",
              label: "C",
              text: "Mengabaikannya jika sudah shalat",
              is_correct: false,
              is_selected: false,
            },
            {
              id: "q5-d",
              label: "D",
              text: "Cukup membaca istighfar",
              is_correct: false,
              is_selected: false,
            },
          ],
          explanation:
            "Jika jedanya belum lama, cukup membasuh bagian yang lupa kemudian melanjutkan anggota setelahnya.",
        },
      ],
    }),
    [attemptId]
  );

  const canShowCorrect = payload.settings?.show_correct_after_submit ?? true;

  const scorePercent = payload.score_percent ?? 0;

  const scoreColor = useMemo(() => {
    if (scorePercent >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (scorePercent >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  }, [scorePercent]);

  const apiErrorMessage = null; // dummy: ga ada error

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-6 bg-gradient-to-b from-secondary/10 via-background to-background">
        <div className="mx-auto max-w-screen-lg flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-base md:text-lg truncate">
                Review Kuis
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {payload.quiz_title}
              </p>
            </div>

            <Badge variant="outline" className="h-6">
              <Award className="h-3 w-3 mr-1" />
              Skor {Math.round(scorePercent)}%
            </Badge>
          </div>

          {/* Error (dummy: ga dipakai) */}
          {apiErrorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{apiErrorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Ringkasan */}
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">
                {payload.quiz_title || "Kuis Tanpa Judul"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {payload.quiz_description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {payload.quiz_description}
                </p>
              )}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Skor */}
                <div className="space-y-1">
                  <div className={cn("text-3xl font-bold", scoreColor)}>
                    {Math.round(scorePercent)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payload.earned_points} dari {payload.total_points} poin
                  </div>
                  <Progress value={scorePercent} className="h-2 w-40" />
                </div>

                {/* Statistik soal */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge className="h-5 bg-emerald-600 hover:bg-emerald-700">
                    Benar: {payload.correct_count}
                  </Badge>
                  <Badge className="h-5 bg-red-600 hover:bg-red-700">
                    Salah: {payload.incorrect_count}
                  </Badge>
                  <Badge variant="outline" className="h-5">
                    Tidak dijawab: {payload.unanswered_count}
                  </Badge>
                  <Badge variant="outline" className="h-5">
                    Total: {payload.question_count} soal
                  </Badge>
                </div>

                {/* Waktu */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Dikerjakan:{" "}
                      {new Date(payload.attempt_started_at).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                  <div>
                    Selesai:{" "}
                    {new Date(payload.attempt_finished_at).toLocaleString(
                      "id-ID"
                    )}
                  </div>
                  <div>
                    Durasi:{" "}
                    {formatDuration(
                      payload.attempt_started_at,
                      payload.attempt_finished_at
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info kalau kunci tidak ditampilkan (dummy: di-enable) */}
          {!canShowCorrect && (
            <Alert className="border-amber-500/50 bg-amber-500/5">
              <AlertDescription className="text-xs">
                Guru tidak mengizinkan menampilkan kunci jawaban setelah submit.
                Kamu hanya bisa melihat mana soal yang benar / salah tanpa
                detail kunci.
              </AlertDescription>
            </Alert>
          )}

          {/* Daftar pertanyaan */}
          <div className="space-y-3">
            {payload.questions.map((q, idx) => (
              <QuestionReviewCard
                key={q.id}
                q={q}
                index={idx}
                canShowCorrect={canShowCorrect}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================
   QuestionReviewCard
========================= */
function QuestionReviewCard({
  q,
  index,
  canShowCorrect,
}: {
  q: ReviewQuestion;
  index: number;
  canShowCorrect: boolean;
}) {
  const isAnswered =
    q.type === "multiple_choice" || q.type === "checkboxes"
      ? (q.options || []).some((o) => o.is_selected)
      : !!(q.student_answer_text && q.student_answer_text.trim().length > 0);

  const badgeLabel = !isAnswered
    ? "Tidak dijawab"
    : q.is_correct
    ? "Benar"
    : "Salah";

  const badgeVariant = !isAnswered
    ? "outline"
    : q.is_correct
    ? "default"
    : "destructive";

  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 transition-shadow hover:shadow-md",
        q.is_correct
          ? "border-l-emerald-500/80"
          : isAnswered
          ? "border-l-red-500/80"
          : "border-l-muted"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base flex flex-col gap-1">
          {/* Baris 1: nomor + judul */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-muted-foreground">#{index + 1}</span>
            <span className="font-medium break-words whitespace-pre-wrap">
              {htmlToPlainText(q.title_html) ? (
                <span dangerouslySetInnerHTML={{ __html: q.title_html }} />
              ) : (
                <em className="opacity-70">Pertanyaan tanpa judul</em>
              )}
            </span>
          </div>

          {/* Baris 2: badge status & poin */}
          <div className="flex flex-wrap gap-1 items-center">
            <Badge variant={badgeVariant as any} className="h-5">
              {q.is_correct && isAnswered && (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              )}
              {!q.is_correct && isAnswered && (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {!isAnswered && <HelpCircle className="h-3 w-3 mr-1" />}
              {badgeLabel}
            </Badge>
            <Badge variant="outline" className="h-5">
              {q.earned_points}/{q.points} poin
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {q.description && (
          <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap">
            {q.description}
          </p>
        )}

        {/* Jawaban siswa */}
        <div className="space-y-1">
          <div className="text-xs font-medium">Jawaban kamu</div>
          {q.type === "short_text" || q.type === "paragraph" ? (
            <p className="text-sm whitespace-pre-wrap rounded-md border bg-muted/40 px-3 py-2">
              {q.student_answer_text?.trim()
                ? q.student_answer_text
                : "— Tidak menjawab"}
            </p>
          ) : (
            <div className="grid gap-1">
              {(q.options || []).map((o) => {
                const isStudent = o.is_selected;
                const isCorrect = o.is_correct;

                return (
                  <div
                    key={o.id}
                    className={cn(
                      "text-sm flex items-center gap-2 rounded-md border px-3 py-1.5",
                      isStudent && isCorrect
                        ? "border-emerald-500/70 bg-emerald-500/5"
                        : isStudent && !isCorrect
                        ? "border-red-500/70 bg-red-500/5"
                        : isCorrect && canShowCorrect
                        ? "border-emerald-500/50 bg-emerald-500/3"
                        : "border-muted"
                    )}
                  >
                    <span className="text-xs font-mono">{o.label ?? "•"}</span>
                    <span>{o.text}</span>
                  </div>
                );
              })}
              {!isAnswered && (
                <p className="text-xs text-muted-foreground">
                  Kamu tidak memilih jawaban untuk soal ini.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Kunci jawaban (opsional) */}
        {canShowCorrect &&
          (q.correct_answer_text ||
            (q.options ?? []).some((o) => o.is_correct)) && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="text-xs font-medium">Kunci jawaban</div>
                {q.type === "short_text" || q.type === "paragraph" ? (
                  <p className="text-sm whitespace-pre-wrap rounded-md border bg-emerald-500/5 px-3 py-2">
                    {q.correct_answer_text?.trim() || "Tidak diset oleh guru."}
                  </p>
                ) : (
                  <ul className="text-sm list-disc list-inside space-y-0.5">
                    {(q.options || [])
                      .filter((o) => o.is_correct)
                      .map((o) => (
                        <li key={o.id}>
                          {o.label && <strong>{o.label}.</strong>} {o.text}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </>
          )}

        {/* Pembahasan / explanation */}
        {q.explanation && (
          <>
            <Separator />
            <div className="space-y-1">
              <div className="text-xs font-medium">Pembahasan</div>
              <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap">
                {q.explanation}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
