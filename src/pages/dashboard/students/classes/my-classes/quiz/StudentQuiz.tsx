// src/pages/sekolahislamku/pages/student/StudentQuiz.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
   DUMMY QUESTIONS
========================= */

const DUMMY_QUESTIONS: StudentQuestion[] = [
  {
    id: "q1",
    text: "<p>Siapakah <strong>khalifah pertama</strong> setelah wafatnya Rasulullah ﷺ?</p>",
    type: "single",
    points: 10,
    options: [
      { key: "A", text: "Utsman bin Affan" },
      { key: "B", text: "Ali bin Abi Thalib" },
      { key: "C", text: "Abu Bakar Ash-Shiddiq" },
      { key: "D", text: "Umar bin Khattab" },
    ],
  },
  {
    id: "q2",
    text: "Apa arti kata <em>“taqwa”</em> secara sederhana?",
    type: "short_text",
    points: 5,
  },
  {
    id: "q3",
    text: "Sebutkan minimal dua contoh adab ketika menuntut ilmu.",
    type: "paragraph",
    points: 10,
  },
  {
    id: "q4",
    text: "Rukun Islam yang keempat adalah…",
    type: "single",
    points: 5,
    options: [
      { key: "A", text: "Syahadat" },
      { key: "B", text: "Zakat" },
      { key: "C", text: "Puasa Ramadhan" },
      { key: "D", text: "Haji ke Baitullah" },
    ],
  },
  {
    id: "q5",
    text: "Tuliskan secara singkat pengertian <strong>ikhlas</strong> dalam beramal.",
    type: "short_text",
    points: 5,
  },
  {
    id: "q6",
    text: "<p>Berikut ini yang <strong>bukan</strong> termasuk nama Al-Qur’an adalah…</p>",
    type: "single",
    points: 10,
    options: [
      { key: "A", text: "Al-Furqan" },
      { key: "B", text: "Az-Zikr" },
      { key: "C", text: "Al-Masih" },
      { key: "D", text: "Al-Kitab" },
    ],
  },
  {
    id: "q7",
    text: "Sebutkan adab saat memasuki masjid.",
    type: "paragraph",
    points: 10,
  },
  {
    id: "q8",
    text: "<p>Amalan hati yang paling utama adalah…</p>",
    type: "single",
    points: 5,
    options: [
      { key: "A", text: "Tawakal" },
      { key: "B", text: "Zuhud" },
      { key: "C", text: "Cinta kepada Allah" },
      { key: "D", text: "Sabar" },
    ],
  },
  {
    id: "q9",
    text: "Apa perbedaan singkat antara <em>iman</em> dan <em>Islam</em>?",
    type: "paragraph",
    points: 10,
  },
  {
    id: "q10",
    text: "<p>Berikut ini yang termasuk <strong>rukun iman</strong> adalah…</p>",
    type: "single",
    points: 10,
    options: [
      { key: "A", text: "Beriman kepada kitab-kitab Allah" },
      { key: "B", text: "Bersyahadat dan shalat" },
      { key: "C", text: "Berpuasa dan berzakat" },
      { key: "D", text: "Berjihad di jalan Allah" },
    ],
  },
  {
    id: "q11",
    text: "Tuliskan dua contoh akhlak terpuji kepada orang tua.",
    type: "paragraph",
    points: 10,
  },
  {
    id: "q12",
    text: "<p>Nabi yang menerima wahyu pertama kali di gua Hira adalah…</p>",
    type: "single",
    points: 5,
    options: [
      { key: "A", text: "Nabi Musa a.s." },
      { key: "B", text: "Nabi Nuh a.s." },
      { key: "C", text: "Nabi Muhammad ﷺ" },
      { key: "D", text: "Nabi Ibrahim a.s." },
    ],
  },
];

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
  const { quizId = "dummy-quiz-1" } = useParams<{ quizId: string }>();

  const navigate = useNavigate();
  const { state } = useLocation();
  const { setHeader } = useDashboardHeader();

  const quizMeta = useMemo(() => (state ?? {}) as QuizMetaFromState, [state]);
  const timeLimit = quizMeta.timeLimitMin != null ? quizMeta.timeLimitMin : 45; // default 45 menit
  const attemptsAllowed = quizMeta.attemptsAllowed ?? 1;

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

  // dialog auto-submit saat semua soal terjawab
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoSubmitPromptShown, setAutoSubmitPromptShown] = useState(false);

  // timer (detik)
  const [remainingSec, setRemainingSec] = useState(timeLimit * 60);

  /* ====== Header / breadcrumb ====== */

  useEffect(() => {
    const title = quizMeta.title || "Kerjakan Kuis (Dummy)";
    setHeader?.({
      title,
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Ujian", href: "../ujian" },
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

  const totalQuestions = DUMMY_QUESTIONS.length;
  const answeredCount = DUMMY_QUESTIONS.filter((q) => {
    const val = answers[q.id];
    if (typeof val === "string") return val.trim() !== "";
    if (Array.isArray(val)) return val.length > 0;
    return false;
  }).length;

  /* ====== Auto-open modal submit kalau semua terjawab ====== */

  useEffect(() => {
    if (
      totalQuestions > 0 &&
      answeredCount === totalQuestions &&
      !autoSubmitPromptShown
    ) {
      setConfirmOpen(true);
      setAutoSubmitPromptShown(true);
    }
  }, [answeredCount, totalQuestions, autoSubmitPromptShown]);

  /* ====== Submit (DUMMY) ====== */

  const doSubmit = () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const unanswered = DUMMY_QUESTIONS.filter((q) => {
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

    const payload: SubmitPayload = {
      quiz_id: quizId,
      answers: DUMMY_QUESTIONS.map((q) => ({
        question_id: q.id,
        answer: answers[q.id],
      })),
    };

    console.log("[QUIZ SUBMIT (DUMMY)] payload:", payload);

    setSubmitSuccess(
      "Jawaban kamu berhasil disimpan (dummy). Cek console browser untuk melihat payload yang akan dikirim ke backend."
    );
  };

  const handleSubmit = () => {
    setConfirmOpen(false);
    doSubmit();
  };

  /* soal yang ditampilkan sesuai mode */
  const visibleQuestions =
    mode === "scroll"
      ? DUMMY_QUESTIONS
      : [DUMMY_QUESTIONS[Math.min(currentIndex, DUMMY_QUESTIONS.length - 1)]];

  /* ====== Question Map (untuk mode satu per satu) ====== */

  type QuestionStatus = "empty" | "answered" | "doubt";

  const questionStatuses: QuestionStatus[] = DUMMY_QUESTIONS.map((q) => {
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
  });

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
              {quizMeta.title || "Kerjakan Kuis (Dummy)"}
            </h1>
          </div>

          {/* Info quiz – DISABLED saat mode satu per satu */}
          {mode === "scroll" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg">
                  {quizMeta.title || "Kuis Dummy: Materi Umum"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm text-muted-foreground">
                <p className="whitespace-pre-wrap">
                  {quizMeta.description ||
                    "Ini adalah tampilan kuis untuk murid (dummy). Jawab semua pertanyaan, lalu kirim. Payload akan muncul di console browser."}
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
                    {DUMMY_QUESTIONS.length} pertanyaan
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

                          // ⬇️ DI SINI TAMBahkan override untuk state aktif
                          isActive &&
                          "ring-1 ring-primary bg-primary text-primary-foreground"
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
              const idx = DUMMY_QUESTIONS.findIndex((it) => it.id === q.id);
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
          {DUMMY_QUESTIONS.length > 0 && answeredCount === totalQuestions && (
            <>
              <Separator className="my-2" />
              <div className="flex justify-end">
                <Button
                  onClick={() => setConfirmOpen(true)}
                  className="flex items-center gap-2"
                >
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
              onClick={() => setMode("scroll")}
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
              onClick={() => setMode("paged")}
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

      {/* Dialog konfirmasi submit */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kirim jawaban sekarang?</DialogTitle>
            <DialogDescription>
              {answeredCount === totalQuestions
                ? "Semua soal sudah kamu jawab. Kamu bisa mengirim jawaban sekarang, atau meninjau ulang dulu (misalnya soal yang ditandai ragu-ragu)."
                : `Saat ini baru ${answeredCount} dari ${totalQuestions} soal yang terjawab.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Soal yang ditandai{" "}
            <span className="inline-flex items-center gap-1 align-middle">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>ragu-ragu</span>
            </span>{" "}
            bisa kamu cek ulang sebelum kirim.
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              type="button"
            >
              Tinjau dulu
            </Button>
            <Button
              onClick={handleSubmit}
              type="button"
              disabled={answeredCount !== totalQuestions}
            >
              Kirim Jawaban
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
