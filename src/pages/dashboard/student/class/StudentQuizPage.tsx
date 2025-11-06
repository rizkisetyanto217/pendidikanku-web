// src/pages/sekolahislamku/pages/student/StudentQuizPage.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ===== Utils ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ===== Meta kelas (untuk judul) ===== */
const CLASS_META: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  "tpa-a": { name: "TPA A", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  "tpa-b": { name: "TPA B", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

/* ===== Bank kuis per kelas ===== */
type Q = { id: string; text: string; options: string[]; answer: number };
type QuizDef = {
  id: string;
  title: string;
  description?: string;
  durationMin: number;
  questions: Q[];
  dueAt?: string;
};
const mkDue = (d: number) => new Date(Date.now() + d * 864e5).toISOString();

const QUIZ_BANK: Record<string, QuizDef[]> = {
  "tpa-a": [
    {
      id: "q-001",
      title: "Kuis Tajwid Dasar",
      description: "Mad thabi'i, panjang bacaan, dan contoh.",
      durationMin: 10,
      dueAt: mkDue(1),
      questions: [
        {
          id: "q1",
          text: "Apa itu mad thabi'i?",
          options: [
            "Panjaran suara karena sukun asli",
            "Mad asli yang terjadi karena huruf mad tanpa hamzah/sukun setelahnya",
            "Mad karena bertemu hamzah pada kata yang sama",
            "Mad karena waqaf pada akhir kalimat",
          ],
          answer: 1,
        },
        {
          id: "q2",
          text: "Berapa harakat umum bacaan mad thabi'i?",
          options: ["1–2 harakat", "2 harakat", "4–5 harakat", "6 harakat"],
          answer: 1,
        },
        {
          id: "q3",
          text: "Contoh mad thabi'i yang benar adalah…",
          options: ["قِيلَ", "قَالَ", "جَاءَ", "ضَالِّينَ"],
          answer: 1,
        },
      ],
    },
    {
      id: "q-002",
      title: "Makharijul Huruf",
      description: "Tempat keluarnya beberapa huruf hijaiyah.",
      durationMin: 12,
      dueAt: mkDue(3),
      questions: [
        {
          id: "q1",
          text: "Makharij huruf ق (qaf) berasal dari…",
          options: ["Ujung lidah", "Tengah lidah", "Pangkal lidah", "Bibir"],
          answer: 2,
        },
        {
          id: "q2",
          text: "Huruf ب (ba) keluar dari…",
          options: [
            "Hidung",
            "Pertemuan dua bibir",
            "Ujung lidah dan gusi atas",
            "Tenggorokan bagian atas",
          ],
          answer: 1,
        },
        {
          id: "q3",
          text: "Huruf ض (dhad) keluar dari…",
          options: [
            "Sisi lidah dan gigi geraham atas",
            "Ujung lidah dan gusi atas",
            "Pangkal lidah",
            "Pertemuan dua bibir",
          ],
          answer: 0,
        },
      ],
    },
  ],
  "tpa-b": [
    {
      id: "q-101",
      title: "Hafalan Juz 30 — Pekan Ini",
      description: "Surah An-Naba' (ayat 1–10).",
      durationMin: 8,
      dueAt: mkDue(2),
      questions: [
        {
          id: "q1",
          text: "Kata pertama Surah An-Naba' adalah…",
          options: ["عَن", "مَا", "يَتَسَاءَلُونَ", "النَّبَإِ"],
          answer: 0,
        },
        {
          id: "q2",
          text: "Arti umum dari 'النَّبَإِ الْعَظِيمِ' adalah…",
          options: [
            "Berita yang agung",
            "Azab yang pedih",
            "Nikmat yang besar",
            "Hari yang berat",
          ],
          answer: 0,
        },
        {
          id: "q3",
          text: "Ayat 9 menyebutkan tidur sebagai…",
          options: ["Perhiasan", "Penutup", "Istirahat", "Peringatan"],
          answer: 2,
        },
      ],
    },
  ],
};

/* ===== Halaman ===== */
const StudentQuizPage: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  const classMeta = CLASS_META[id ?? ""] ?? { name: id ?? "-" };
  const quizzes = QUIZ_BANK[id ?? ""] ?? [];

  // state pengerjaan
  const [activeQid, setActiveQid] = useState<string | null>(null);
  const activeQuiz = useMemo(
    () => quizzes.find((q) => q.id === activeQid) || null,
    [activeQid, quizzes]
  );
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<
    Record<
      string,
      { score: number; correct: number; total: number; submittedAt: string }
    >
  >({});

  // dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [pendingResult, setPendingResult] = useState<{
    score: number;
    correct: number;
    total: number;
  } | null>(null);
  const [retryQid, setRetryQid] = useState<string | null>(null);
  const [retryOpen, setRetryOpen] = useState(false);

  const startQuiz = (qid: string) => {
    const q = quizzes.find((x) => x.id === qid);
    if (!q) return;
    setActiveQid(qid);
    setIdx(0);
    setAnswers(Array(q.questions.length).fill(-1));
  };

  const pick = (i: number) => {
    if (!activeQuiz) return;
    const copy = [...answers];
    copy[idx] = i;
    setAnswers(copy);
  };

  const prev = () => setIdx((v) => Math.max(0, v - 1));
  const next = () =>
    setIdx((v) => Math.min((activeQuiz?.questions.length ?? 1) - 1, v + 1));

  const requestSubmit = () => {
    if (!activeQuiz) return;
    const empty = answers.findIndex((a) => a < 0);
    if (empty !== -1) {
      // ada yang kosong → minta konfirmasi
      setConfirmOpen(true);
      return;
    }
    doSubmit();
  };

  const doSubmit = () => {
    if (!activeQuiz) return;
    const total = activeQuiz.questions.length;
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const score = Math.round((correct / total) * 100);

    setResults((prev) => ({
      ...prev,
      [activeQuiz.id]: {
        score,
        correct,
        total,
        submittedAt: new Date().toISOString(),
      },
    }));
    setActiveQid(null);
    setPendingResult({ score, correct, total });
    setResultOpen(true);
  };

  const openRetry = (qid: string) => {
    setRetryQid(qid);
    setRetryOpen(true);
  };

  const confirmRetry = () => {
    if (!retryQid) return;
    setResults((prev) => {
      const cp = { ...prev };
      delete cp[retryQid];
      return cp;
    });
    startQuiz(retryQid);
    setRetryOpen(false);
    setRetryQid(null);
  };

  const goBackToMyClass = () =>
    navigate(`/${slug}/murid/menu-utama/my-class`, { replace: false });

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6">
          {/* Back + title */}
          <div className="md:flex hidden gap-3 items-center">
            <Button variant="ghost" onClick={goBackToMyClass}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold">
              Daftar Kuis — {classMeta.name}
            </h1>
          </div>

          {/* List kuis */}
          <div className="grid gap-3">
            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-center text-muted-foreground">
                  Belum ada kuis untuk kelas ini.
                </CardContent>
              </Card>
            ) : (
              quizzes.map((qz) => {
                const res = results[qz.id];
                return (
                  <Card key={qz.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
                        <span className="truncate">{qz.title}</span>
                        <Badge
                          variant={res ? "default" : "outline"}
                          className="h-6"
                        >
                          {res ? "Selesai" : "Belum dikerjakan"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 md:px-5 pb-4">
                      {qz.description && (
                        <p className="text-sm text-muted-foreground">
                          {qz.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <ClipboardList size={14} />
                        <span>{qz.questions.length} soal</span>
                        <span>•</span>
                        <Clock size={14} />
                        <span>{qz.durationMin} menit</span>
                        {qz.dueAt && (
                          <>
                            <span>•</span>
                            <span>Deadline: {dateLong(qz.dueAt)}</span>
                          </>
                        )}
                        {res && (
                          <>
                            <span>•</span>
                            <CheckCircle2 size={14} />
                            <span>
                              Skor: <b>{res.score}</b> ({res.correct}/
                              {res.total})
                            </span>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-3">
                        <div className="text-sm text-muted-foreground">
                          Aksi
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {!res ? (
                            <Button
                              size="sm"
                              onClick={() => startQuiz(qz.id)}
                              className="inline-flex gap-2"
                            >
                              <Play size={16} />
                              Mulai
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openRetry(qz.id)}
                              className="inline-flex gap-2"
                            >
                              <RotateCcw size={16} />
                              Ulangi
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Runner kuis */}
          {activeQuiz && (
            <Card>
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{activeQuiz.title}</div>
                  <div className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Clock size={14} />
                    <span>Estimasi {activeQuiz.durationMin} menit</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Soal {idx + 1} / {activeQuiz.questions.length}
                </div>

                <div className="p-4 rounded-lg border bg-card">
                  <div className="font-medium mb-3">
                    {activeQuiz.questions[idx].text}
                  </div>

                  <div className="grid gap-2">
                    {activeQuiz.questions[idx].options.map((opt, i) => {
                      const selected = answers[idx] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => pick(i)}
                          className={`text-left px-3 py-2 rounded-lg border transition
                            ${selected ? "ring-1" : "hover:bg-accent/50"}`}
                        >
                          <span className="mr-2 font-mono">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {answers[idx] >= 0
                      ? "Jawaban dipilih."
                      : "Belum memilih jawaban."}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={prev}
                      disabled={idx === 0}
                      className="inline-flex gap-2"
                    >
                      <ChevronLeft size={16} />
                      Sebelumnya
                    </Button>
                    {idx < activeQuiz.questions.length - 1 ? (
                      <Button onClick={next} className="inline-flex gap-2">
                        Selanjutnya
                        <ChevronRight size={16} />
                      </Button>
                    ) : (
                      <Button
                        onClick={requestSubmit}
                        className="inline-flex gap-2"
                      >
                        <Pause size={16} />
                        Kirim Jawaban
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Dialog: konfirmasi submit (ada jawaban kosong) */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masih ada yang kosong</DialogTitle>
            <DialogDescription>
              Yakin ingin mengirim sekarang?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cek lagi
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                doSubmit();
              }}
            >
              Ya, kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: hasil submit */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terkirim!</DialogTitle>
            {pendingResult && (
              <DialogDescription>
                Skor: <b>{pendingResult.score}</b> ({pendingResult.correct}/
                {pendingResult.total} benar)
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setResultOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: konfirmasi ulangi */}
      <Dialog open={retryOpen} onOpenChange={setRetryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ulangi kuis ini?</DialogTitle>
            <DialogDescription>
              Jawaban sebelumnya akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetryOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmRetry}>Ulangi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentQuizPage;
