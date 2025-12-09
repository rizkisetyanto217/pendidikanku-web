// src/pages/dasboard/teacher/TeacherQuizBuilder.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* react-query + axios */
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* icons */
import {
  ArrowLeft,
  Plus,
  Save,
  Settings2,
  Trash2,
  Copy,
  Upload,
  Download,
  Timer,
  Shuffle,
  Lock,
  GraduationCap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { htmlToPlainText, RichTextInput } from "@/components/costum/CRichTextEditor";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =========================
   Types & Helpers
========================= */
type QuestionType =
  | "short_text"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes";

type Option = { id: string; text: string; correct?: boolean };

type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  points: number;
  // for choices
  options?: Option[];
  // for answer key (short/paragraph free text)
  answerKeyText?: string;

  // collapsed UI state
  collapsed?: boolean;

  // menandai sudah ada perubahan tapi belum di-"Selesai perubahan"
  dirty?: boolean;
};

type QuizSettings = {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAfterSubmit: boolean;
  oneQuestionPerPage: boolean;
  timeLimitMin?: number | null; // null = no limit
  attemptsAllowed: number; // 1..n
  startAt?: string | null; // ISO
  endAt?: string | null; // ISO
  requireLogin: boolean;
  preventBackNavigation: boolean;
};

type QuizDoc = {
  id: string;
  classId?: string;
  title: string;
  description?: string;
  settings: QuizSettings;
  questions: Question[];
  status: "draft" | "published";
  updatedAt: string; // ISO
};

/* ====== Types dari API quiz-questions ====== */
type QuizQuestionFromApi = {
  quiz_question_id: string;
  quiz_question_quiz_id: string;
  quiz_question_school_id: string;
  quiz_question_type: string; // "single" dll, sekarang pakai single choice
  quiz_question_text: string;
  quiz_question_points: number;
  quiz_question_answers: Record<string, string>; // { A,B,C,D,... }
  quiz_question_correct: string; // "A" | "B" | ...
  quiz_question_explanation: string;
  quiz_question_created_at: string;
  quiz_question_updated_at: string;
};

type QuizQuestionListResponse = {
  success: boolean;
  message: string;
  data: QuizQuestionFromApi[];
};

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const LOCAL_KEY = (id: string) => `quiz-builder:${id}`;

const TYPE_LABEL: Record<QuestionType, string> = {
  short_text: "Jawaban Singkat",
  paragraph: "Paragraf",
  multiple_choice: "Pilihan Ganda",
  checkboxes: "Checkbox (Multi Jawaban)",
};

const TYPE_ACCENT: Record<QuestionType, string> = {
  short_text: "border-l-emerald-500/70",
  paragraph: "border-l-emerald-500/70",
  multiple_choice: "border-l-violet-500/70",
  checkboxes: "border-l-indigo-500/70",
};

const defaultQuestion = (t: QuestionType = "short_text"): Question => {
  const base: Question = {
    id: uid(),
    title: "",
    description: "",
    type: t,
    required: false,
    points: 10,
    collapsed: false, // soal baru langsung kebuka
    dirty: true, // soal baru = belum ditandai selesai
  };
  if (t === "multiple_choice" || t === "checkboxes") {
    base.options = [
      { id: uid(), text: "Opsi 1", correct: true },
      { id: uid(), text: "Opsi 2", correct: false },
    ];
  }

  return base;
};

/* Auto-resize textarea helper */
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/* mapping dari API → Question builder */
function mapApiQuestionToQuestion(q: QuizQuestionFromApi): Question {
  // sort key A,B,C,D,...
  const keys = Object.keys(q.quiz_question_answers).sort();
  const options: Option[] = keys.map((k) => ({
    id: `${q.quiz_question_id}-${k}`,
    text: q.quiz_question_answers[k],
    correct: k.toUpperCase() === q.quiz_question_correct.toUpperCase(),
  }));

  return {
    id: q.quiz_question_id,
    title: q.quiz_question_text,
    description: q.quiz_question_explanation,
    type: "multiple_choice",
    required: true, // API belum punya flag required, anggap wajib
    points: q.quiz_question_points ?? 1,
    options,
    collapsed: true, // dari API: awalnya tertutup
    dirty: false, // belum ada perubahan di FE
  };
}

/* =========================
   Page Component
========================= */
export default function TeacherQuizBuilder() {
  // Di sini param :id kita pakai sebagai quiz_id
  const { quizId = "" } = useParams<{
    csstId: string;
    assessmentId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Buat Quiz",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mata Pelajaran" },
        { label: "Detail Mata Pelajaran" },
        { label: "Penilaian Mata Pelajaran" },
        { label: "Detail Penilaian" },
        { label: "Buat Quiz" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const endRef = useRef<HTMLDivElement | null>(null);

  // Build new or load from storage (per quiz)
  const initialDoc: QuizDoc = useMemo(() => {
    const stored = localStorage.getItem(LOCAL_KEY(quizId || "global"));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as QuizDoc;
        return parsed;
      } catch {
        // ignore
      }
    }
    return {
      id: quizId || uid(),
      classId: undefined,
      title: "Kuis Baru",
      description: "",
      settings: {
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAfterSubmit: true,
        oneQuestionPerPage: false,
        timeLimitMin: null,
        attemptsAllowed: 1,
        startAt: null,
        endAt: null,
        requireLogin: true,
        preventBackNavigation: false,
      },
      questions: [], // akan diisi dari API quiz-questions
      status: "draft",
      updatedAt: new Date().toISOString(),
    };
  }, [quizId]);

  const [doc, setDoc] = useState<QuizDoc>(initialDoc);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<"design" | "preview">("design");

  /* ====== Fetch quiz questions dari API ====== */
  const { data, isLoading, isError, error } =
    useQuery<QuizQuestionListResponse>({
      queryKey: ["quiz-questions", quizId],
      enabled: !!quizId,
      queryFn: async () => {
        const res = await axios.get("/api/u/quiz-questions/list", {
          params: { quiz_id: quizId },
        });
        return res.data;
      },
    });

  // ketika data API datang → sync ke doc.questions
  useEffect(() => {
    if (!data) return;
    const mapped = data.data.map(mapApiQuestionToQuestion);

    setDoc((d) => ({
      ...d,
      questions: mapped,
      updatedAt: new Date().toISOString(),
    }));
  }, [data]);

  // autosave
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY(quizId || "global"), JSON.stringify(doc));
  }, [doc, quizId]);

  // scroll ke bawah tiap kali jumlah pertanyaan berubah
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [doc.questions.length]);

  const totalPoints = useMemo(
    () => doc.questions.reduce((s, q) => s + (q.points || 0), 0),
    [doc.questions]
  );

  const apiErrorMessage = isError
    ? (error as any)?.response?.data?.message ||
    (error as Error).message ||
    "Gagal memuat soal kuis."
    : null;

  /* ========== Question operations ========== */
  const addQuestion = (t: QuestionType) =>
    setDoc((d) => ({
      ...d,
      questions: [...d.questions, defaultQuestion(t)],
      updatedAt: new Date().toISOString(),
    }));

  const updateQuestion = (qid: string, patch: Partial<Question>) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.map((q) => {
        if (q.id !== qid) return q;

        const next: Question = { ...q, ...patch };

        const contentFields: (keyof Question)[] = [
          "title",
          "description",
          "type",
          "required",
          "points",
          "options",
          "answerKeyText",
        ];

        const contentChanged = contentFields.some(
          (f) => f in patch // kalau ada salah satu field isi ikut di-patch
        );

        if (contentChanged) {
          next.dirty = true;
        }

        return next;
      }),
      updatedAt: new Date().toISOString(),
    }));

  const removeQuestion = (qid: string) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.filter((q) => q.id !== qid),
      updatedAt: new Date().toISOString(),
    }));

  const duplicateQuestion = (qid: string) =>
    setDoc((d) => {
      const i = d.questions.findIndex((q) => q.id === qid);
      if (i < 0) return d;
      const clone = JSON.parse(JSON.stringify(d.questions[i])) as Question;
      clone.id = uid();
      // also re-id options
      if (clone.options)
        clone.options = clone.options.map((o) => ({ ...o, id: uid() }));
      const arr = [...d.questions];
      arr.splice(i + 1, 0, clone);
      return { ...d, questions: arr, updatedAt: new Date().toISOString() };
    });

  /* ========== Options operations ========== */
  const addOption = (qid: string) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id === qid
          ? {
            ...q,
            options: [
              ...(q.options || []),
              {
                id: uid(),
                text: `Opsi ${((q.options || []).length ?? 0) + 1}`,
              },
            ],
            dirty: true, // ⬅️ ada perubahan konten
          }
          : q
      ),
      updatedAt: new Date().toISOString(),
    }));

  const updateOption = (qid: string, oid: string, patch: Partial<Option>) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id === qid
          ? {
            ...q,
            options: (q.options || []).map((o) =>
              o.id === oid ? { ...o, ...patch } : o
            ),
            dirty: true, // ⬅️ ada perubahan konten
          }
          : q
      ),
      updatedAt: new Date().toISOString(),
    }));

  const removeOption = (qid: string, oid: string) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id === qid
          ? {
            ...q,
            options: (q.options || []).filter((o) => o.id !== oid),
            dirty: true, // ⬅️ ada perubahan konten
          }
          : q
      ),
      updatedAt: new Date().toISOString(),
    }));

  const setSingleCorrect = (qid: string, oid: string) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id === qid
          ? {
            ...q,
            options: (q.options || []).map((o) => ({
              ...o,
              correct: o.id === oid,
            })),
            dirty: true, // ⬅️ ganti jawaban benar
          }
          : q
      ),
      updatedAt: new Date().toISOString(),
    }));

  const finishEditingQuestion = (qid: string) =>
    setDoc((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id === qid
          ? {
            ...q,
            collapsed: true, // tutup lagi
            dirty: false, // tandai sudah "beres"
          }
          : q
      ),
      updatedAt: new Date().toISOString(),
    }));

  /* ========== Settings ========== */
  const updateSettings = (patch: Partial<QuizSettings>) =>
    setDoc((d) => ({
      ...d,
      settings: { ...d.settings, ...patch },
      updatedAt: new Date().toISOString(),
    }));

  /* ========== Import / Export / Publish ========== */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safe = (doc.title || "quiz")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-");
    a.download = `${safe}.quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as QuizDoc;
      if (!parsed.questions || !Array.isArray(parsed.questions))
        throw new Error("Format tidak valid");
      setDoc({ ...parsed, updatedAt: new Date().toISOString() });
    } catch (e: any) {
      alert(`Gagal import: ${e?.message || e}`);
    }
  };

  const publish = () => {
    // Payload disesuaikan dengan struktur quiz-questions API
    const questionsPayload = doc.questions
      // sekarang backend masih pakai tipe pilihan ganda single-correct
      .filter((q) => q.type === "multiple_choice")
      .map((q) => {
        const answers: Record<string, string> = {};
        (q.options || []).forEach((opt, idx) => {
          const key = String.fromCharCode(65 + idx); // A,B,C,D,...
          answers[key] = opt.text;
        });

        const correctIndex =
          (q.options || []).findIndex((o) => o.correct) >= 0
            ? (q.options || []).findIndex((o) => o.correct)
            : 0;
        const correctLetter = String.fromCharCode(65 + correctIndex);

        return {
          // kalau mau bedain baru vs existing, bisa pakai id lokal (local-xxx)
          quiz_question_id: q.id.startsWith("local-") ? undefined : q.id,
          quiz_question_quiz_id: quizId || doc.id,
          quiz_question_type: "single",
          quiz_question_text: q.title,
          quiz_question_points: q.points || 1,
          quiz_question_answers: answers,
          quiz_question_correct: correctLetter,
          quiz_question_explanation: q.description ?? "",
        };
      });

    const payload = {
      quiz_id: quizId || doc.id,
      questions: questionsPayload,
    };

    console.log("[PUBLISH] payload ke backend quiz-questions:", payload);
    setDoc((d) => ({
      ...d,
      status: "published",
      updatedAt: new Date().toISOString(),
    }));
    alert(
      "Quiz dipublish (dummy). Cek console untuk payload ke API quiz-questions."
    );
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-4 bg-gradient-to-b from-secondary/10 via-background to-background">
        <div className="mx-auto flex flex-col gap-4">
          {/* Header Bar */}
          <div className="rounded-xl bg-gradient-to-r from-secondary/20 via-background to-background p-3">

            {/* Baris 1: Back + Title (selalu di atas dan full width) */}
            <div className="md:flex hidden items-center gap-2 mb-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-lg md:text-xl font-semibold">Buat Quiz</h1>
            </div>

            {/* Baris 2: Judul Kuis (full width di semua device) */}
            <Input
              value={doc.title}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  title: e.target.value,
                  updatedAt: new Date().toISOString(),
                }))
              }
              className="font-semibold text-base md:text-lg h-10 md:h-11 w-full mb-3"
              placeholder="Judul kuis…"
            />

            {/* Baris 3: Tombol-tombol (stack di mobile, inline di desktop) */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">

              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="h-4 w-4 mr-1" />
                Pengaturan
              </Button>

              <Button variant="outline" size="sm" onClick={exportJSON}>
                <Download className="h-4 w-4 mr-1" />
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importJSON(f);
                  }}
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                </Button>
              </label>

              <Button size="sm" onClick={publish} disabled={!quizId}>
                <GraduationCap className="h-4 w-4 mr-1" />
                Publish
              </Button>
            </div>
          </div>


          {/* Error dari API */}
          {apiErrorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{apiErrorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Description */}
          <Card>
            <CardContent className="p-4 md:p-5">
              <Textarea
                value={doc.description}
                onChange={(e) =>
                  setDoc((d) => ({
                    ...d,
                    description: e.target.value,
                    updatedAt: new Date().toISOString(),
                  }))
                }
                onInput={(e) => autoGrow(e.currentTarget)}
                placeholder="Deskripsi / instruksi untuk peserta…"
                className="min-h-[70px] resize-none"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Status:{" "}
                <Badge
                  variant={doc.status === "draft" ? "secondary" : "default"}
                  className="h-5"
                >
                  {doc.status.toUpperCase()}
                </Badge>{" "}
                • Terakhir diubah:{" "}
                {new Date(doc.updatedAt).toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as any)}
            className="w-full"
          >
            <TabsList className="w-fit">
              <TabsTrigger value="design">Desain</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* =============== DESIGN =============== */}
            <TabsContent value="design" className="mt-3">
              {/* Loading skeleton first time */}
              {isLoading && doc.questions.length === 0 && (
                <div className="grid gap-3 mb-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-3 w-2/3 bg-muted rounded" />
                          </div>
                          <div className="h-8 w-24 bg-muted rounded" />
                        </div>
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-5/6 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Question list */}
              <div className="grid gap-3">
                {doc.questions.map((q, idx) => (
                  <QuestionEditor
                    key={q.id}
                    q={q}
                    idx={idx}
                    onChange={(patch) => updateQuestion(q.id, patch)}
                    onRemove={() => removeQuestion(q.id)}
                    onDuplicate={() => duplicateQuestion(q.id)}
                    onAddOption={() => addOption(q.id)}
                    onOptionChange={(oid, patch) =>
                      updateOption(q.id, oid, patch)
                    }
                    onOptionRemove={(oid) => removeOption(q.id, oid)}
                    onSetSingleCorrect={(oid) => setSingleCorrect(q.id, oid)}
                    onFinish={() => finishEditingQuestion(q.id)}
                  />
                ))}

                {/* anchor untuk scroll ke bawah */}
                <div ref={endRef} />

                {/* Sticky Add Bar di bawah */}
                <StickyAddBar
                  total={doc.questions.length}
                  points={totalPoints}
                  onAdd={addQuestion}
                />
              </div>
            </TabsContent>

            {/* =============== PREVIEW =============== */}
            <TabsContent value="preview" className="mt-3">
              <PreviewPanel doc={doc} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ===== Settings Dialog ===== */}
      {settingsOpen && (
        <Dialog open onOpenChange={(o) => setSettingsOpen(o)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Pengaturan Kuis</DialogTitle>
              <DialogDescription>
                Atur perilaku dan batasan pengerjaan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium flex items-center gap-2">
                      <Shuffle className="h-4 w-4" /> Acak urutan pertanyaan
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tampilkan pertanyaan dalam urutan acak untuk setiap murid.
                    </div>
                  </div>
                  <Switch
                    checked={doc.settings.shuffleQuestions}
                    onCheckedChange={(v) =>
                      updateSettings({ shuffleQuestions: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Acak urutan opsi</div>
                    <div className="text-xs text-muted-foreground">
                      Berlaku untuk pilihan ganda, checkbox, dan dropdown.
                    </div>
                  </div>
                  <Switch
                    checked={doc.settings.shuffleOptions}
                    onCheckedChange={(v) =>
                      updateSettings({ shuffleOptions: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Batas waktu (menit)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Kosongkan untuk tanpa batas waktu.
                    </div>
                  </div>
                  <Input
                    type="number"
                    className="w-28"
                    min={0}
                    placeholder="mis. 45"
                    value={doc.settings.timeLimitMin ?? ""}
                    onChange={(e) =>
                      updateSettings({
                        timeLimitMin:
                          e.target.value === ""
                            ? null
                            : Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Maks. percobaan</div>
                    <div className="text-xs text-muted-foreground">
                      Jumlah maksimum pengambilan kuis.
                    </div>
                  </div>
                  <Input
                    type="number"
                    className="w-28"
                    min={1}
                    value={doc.settings.attemptsAllowed}
                    onChange={(e) =>
                      updateSettings({
                        attemptsAllowed: Math.max(
                          1,
                          Number(e.target.value) || 1
                        ),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">
                      Tampilkan jawaban benar setelah submit
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Murid bisa review dan melihat kunci jika diaktifkan.
                    </div>
                  </div>
                  <Switch
                    checked={doc.settings.showCorrectAfterSubmit}
                    onCheckedChange={(v) =>
                      updateSettings({ showCorrectAfterSubmit: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">
                      Satu pertanyaan per halaman
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Navigasi berikutnya/sebelumnya saat mengerjakan.
                    </div>
                  </div>
                  <Switch
                    checked={doc.settings.oneQuestionPerPage}
                    onCheckedChange={(v) =>
                      updateSettings({ oneQuestionPerPage: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Wajib login
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Hanya akun terotentikasi.
                    </div>
                  </div>
                  <Switch
                    checked={doc.settings.requireLogin}
                    onCheckedChange={(v) => updateSettings({ requireLogin: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Blok tombol kembali</div>
                    <div className="text-xs text-muted-foreground">
                      Kurangi kecurangan saat kuis.
                    </div>
                  </div>
                  <Switch
                    checked={doc.settings.preventBackNavigation}
                    onCheckedChange={(v) =>
                      updateSettings({ preventBackNavigation: v })
                    }
                  />
                </div>
              </div>

              <Separator className="md:col-span-2" />

              {/* schedule */}
              <div className="grid md:grid-cols-2 gap-3 md:col-span-2">
                <div className="space-y-1">
                  <Label>Mulai aktif</Label>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(doc.settings.startAt)}
                    onChange={(e) =>
                      updateSettings({
                        startAt: fromLocalInput(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Selesai</Label>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(doc.settings.endAt)}
                    onChange={(e) =>
                      updateSettings({ endAt: fromLocalInput(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-3">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Tutup
              </Button>
              <Button onClick={() => setSettingsOpen(false)}>
                <Save className="h-4 w-4 mr-1" />
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* =========================
   Subcomponents
========================= */
function StickyAddBar({
  total,
  points,
  onAdd,
}: {
  total: number;
  points: number;
  onAdd: (t: QuestionType) => void;
}) {
  return (
    <>
      {/* Desktop / tablet: sticky bar di paling bawah */}
      <div className="sticky bottom-0 z-20 hidden md:block">
        <Card className="mx-auto max-w-4xl bg-secondary/40 backdrop-blur border-secondary/40 shadow-lg">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <div className="text-sm text-foreground/80 mr-2">
              <span className="font-medium">{total}</span> pertanyaan •{" "}
              <span className="font-medium">{points}</span> poin total
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              <Button size="sm" onClick={() => onAdd("multiple_choice")}>
                <Plus className="h-4 w-4 mr-1" />
                Buat soal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile: FAB lebih dekat ke bawah */}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg md:hidden"
        onClick={() => onAdd("multiple_choice")}
        aria-label="Buat soal"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}

function QuestionEditor(props: {
  q: Question;
  idx: number;
  onChange: (patch: Partial<Question>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onAddOption: () => void;
  onOptionChange: (oid: string, patch: Partial<Option>) => void;
  onOptionRemove: (oid: string) => void;
  onSetSingleCorrect: (oid: string) => void;
  onFinish: () => void;
}) {
  const {
    q,
    idx,
    onChange,
    onRemove,
    onDuplicate,
    onAddOption,
    onOptionChange,
    onOptionRemove,
    onSetSingleCorrect,
    onFinish,
  } = props;

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    autoGrow(titleRef.current);
    autoGrow(descRef.current);
  }, [q.title, q.description]);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md border-l-4",
        TYPE_ACCENT[q.type] ?? "border-l-primary/60"
      )}
    >
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => onChange({ collapsed: !q.collapsed })}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          {/* Kiri: nomor, judul, badges */}
          <CardTitle className="text-sm md:text-base flex flex-col gap-1 w-full">
            {/* Baris 1: # + judul */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-muted-foreground mr-1">#{idx + 1}</span>
              <span className="font-medium break-words whitespace-pre-wrap">
                {q.title?.trim() ? (
                  q.title
                ) : (
                  <span className="font-medium break-words whitespace-pre-wrap">
                    {htmlToPlainText(q.title) ? (
                      <span dangerouslySetInnerHTML={{ __html: q.title }} />
                    ) : (
                      <span className="opacity-60 italic">
                        Pertanyaan tanpa judul
                      </span>
                    )}
                  </span>
                )}
              </span>
            </div>

            {/* Baris 2: badges (tipe, poin, wajib, status) */}
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="h-5">
                {TYPE_LABEL[q.type]}
              </Badge>
              <Badge variant="outline" className="h-5">
                {q.points} poin
              </Badge>
              {q.required && <Badge className="h-5">WAJIB</Badge>}

              {q.dirty && (
                <Badge variant="destructive" className="h-5">
                  Belum selesai
                </Badge>
              )}
            </div>
          </CardTitle>

          {/* Kanan: action buttons */}
          <div className="flex items-center gap-1 self-end md:self-center">
            <Button
              size="icon"
              variant="ghost"
              title="Duplikat"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Hapus"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!q.collapsed && (
        <CardContent className="p-4 md:p-5 grid gap-4">
          {/* Row 1: Title, type, points */}
          <div className="grid md:grid-cols-7 gap-3">
            <div className="md:col-span-4 space-y-1">
              <Label>Judul pertanyaan</Label>
              <RichTextInput
                value={q.title}
                onChange={(html) => onChange({ title: html })}
                placeholder="Tulis pertanyaan…"
              />
            </div>

            <div className="space-y-1">
              <Label>Tipe</Label>
              <Select
                value={q.type}
                onValueChange={(v: QuestionType) => {
                  const next: Partial<Question> = { type: v };
                  // ensure fields exist for certain types
                  if (v === "multiple_choice" || v === "checkboxes") {
                    next.options = q.options?.length
                      ? q.options
                      : [
                        { id: uid(), text: "Opsi 1", correct: true },
                        { id: uid(), text: "Opsi 2", correct: false },
                      ];
                  } else {
                    next.options = undefined;
                  }
                  onChange(next);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Poin</Label>
              <Input
                type="number"
                min={0}
                value={q.points}
                onChange={(e) =>
                  onChange({ points: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </div>
          </div>

          {/* Type-specific configs */}
          {(q.type === "multiple_choice" || q.type === "checkboxes") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opsi jawaban</Label>
                <Button size="sm" variant="outline" onClick={onAddOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah opsi
                </Button>
              </div>
              <div className="grid gap-2">
                {(q.options || []).map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    {/* correct marker */}
                    {q.type === "multiple_choice" ? (
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={!!o.correct}
                        onChange={() => onSetSingleCorrect(o.id)}
                        className="accent-[hsl(var(--primary))]"
                        title="Tandai benar"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={!!o.correct}
                        onChange={(e) =>
                          onOptionChange(o.id, { correct: e.target.checked })
                        }
                        className="accent-[hsl(var(--primary))]"
                        title="Boleh multi jawaban benar"
                      />
                    )}

                    <Input
                      value={o.text}
                      onChange={(e) =>
                        onOptionChange(o.id, { text: e.target.value })
                      }
                      placeholder="Teks opsi…"
                    />

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onOptionRemove(o.id)}
                      title="Hapus opsi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Tandai jawaban benar (radio untuk satu jawaban, checkbox untuk
                multi-jawaban).
              </div>
            </div>
          )}

          {(q.type === "short_text" || q.type === "paragraph") && (
            <div className="space-y-1">
              <Label>Kunci jawaban (opsional)</Label>
              {q.type === "short_text" ? (
                <Input
                  value={q.answerKeyText ?? ""}
                  onChange={(e) => onChange({ answerKeyText: e.target.value })}
                  placeholder="Teks kunci (untuk auto-grading sederhana)"
                />
              ) : (
                <Textarea
                  value={q.answerKeyText ?? ""}
                  onChange={(e) => onChange({ answerKeyText: e.target.value })}
                  placeholder="Kata kunci atau poin-poin penting…"
                  className="min-h-[60px]"
                />
              )}
              <div className="text-xs text-muted-foreground">
                Catatan: penilaian manual/semimanual biasanya dibutuhkan untuk
                jawaban panjang.
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <Label>Penjelasan Soal</Label>
            <Textarea
              ref={descRef}
              value={q.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
              onInput={(e) => autoGrow(e.currentTarget)}
              placeholder="Penjelasan Soal…"
              className="resize-none min-h-[60px] text-sm"
            />
          </div>

          {/* Footer actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
            <div className="text-xs text-muted-foreground">
              {q.dirty ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  • Ada perubahan yang belum ditandai selesai
                </span>
              ) : (
                <span>Perubahan terakhir sudah ditandai selesai.</span>
              )}
            </div>
            <Button
              size="sm"
              variant={q.dirty ? "default" : "outline"}
              onClick={onFinish}
            >
              <Save className="h-4 w-4 mr-1" />
              Selesai perubahan
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function PreviewPanel({ doc }: { doc: QuizDoc }) {
  // NOTE: ini hanya tampilan (non-submittable) untuk gambaran siswa
  return (
    <div className="grid gap-3">
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg break-words whitespace-pre-wrap">
            {doc.title || "Kuis Tanpa Judul"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {doc.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {doc.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {doc.settings.timeLimitMin ? (
              <Badge variant="outline" className="h-5">
                ⏱ {doc.settings.timeLimitMin} menit
              </Badge>
            ) : (
              <Badge variant="outline" className="h-5">
                Tanpa batas waktu
              </Badge>
            )}
            <Badge variant="outline" className="h-5">
              Percobaan: {doc.settings.attemptsAllowed}x
            </Badge>
            {doc.settings.startAt && (
              <Badge variant="outline" className="h-5">
                Mulai: {new Date(doc.settings.startAt).toLocaleString("id-ID")}
              </Badge>
            )}
            {doc.settings.endAt && (
              <Badge variant="outline" className="h-5">
                Selesai: {new Date(doc.settings.endAt).toLocaleString("id-ID")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {doc.questions.map((q, i) => (
        <Card key={q.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base flex flex-col gap-1">
              {/* Baris 1: # + judul */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-muted-foreground">#{i + 1}</span>
                <span className="font-medium break-words whitespace-pre-wrap">
                  {htmlToPlainText(q.title) ? (
                    <span dangerouslySetInnerHTML={{ __html: q.title }} />
                  ) : (
                    <em className="opacity-70">Pertanyaan tanpa judul</em>
                  )}
                </span>
              </div>

              {/* Baris 2: badges */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="h-5">
                  {q.points} poin
                </Badge>
                {q.required && <Badge className="h-5">WAJIB</Badge>}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0">
            {q.description && (
              <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                {q.description}
              </p>
            )}

            {/* render pseudo-inputs */}
            {q.type === "short_text" && (
              <Input placeholder="Jawaban singkat…" disabled />
            )}
            {q.type === "paragraph" && (
              <Textarea placeholder="Jawaban panjang…" disabled />
            )}
            {(q.type === "multiple_choice" || q.type === "checkboxes") && (
              <div className="grid gap-2">
                {(q.options || []).map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type={q.type === "multiple_choice" ? "radio" : "checkbox"}
                      disabled
                      className="accent-[hsl(var(--primary))]"
                      name={`prev-${q.id}`}
                    />
                    {o.text}
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* =========================
   Utils (datetime-local)
========================= */
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function fromLocalInput(v: string) {
  if (!v) return null;
  // treat value as local time
  const d = new Date(v);
  return d.toISOString();
}
