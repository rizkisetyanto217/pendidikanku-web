// src/pages/sekolahislamku/pages/student/StudentAssignment.tsx

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Eye,
  Send,
  RefreshCw,
  CheckCircle,
  Play,
  Paperclip,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

/* NEW: Segmented Tabs */
import { CSegmentedTabs } from "@/components/costum/common/CSegmentedTabs";

/* ===== Helpers ringkas ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "-";

const diffDays = (iso: string) => {
  const d = new Date(iso).setHours(0, 0, 0, 0);
  const t = new Date().setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
};

const dueBadge = (iso: string) => {
  const dd = diffDays(iso);
  if (dd < 0)
    return {
      text: `Terlambat ${Math.abs(dd)} hari`,
      className:
        "border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/30",
    };
  if (dd === 0)
    return {
      text: "Jatuh tempo: Hari ini",
      className:
        "border-red-200 text-red-800 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/30",
    };
  if (dd === 1)
    return {
      text: "Jatuh tempo: Besok",
      className:
        "border-orange-200 text-orange-800 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-900/30",
    };
  if (dd <= 7)
    return {
      text: `Jatuh tempo: ${dd} hari lagi`,
      className:
        "border-sky-200 text-sky-800 bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:bg-sky-900/30",
    };
  return {
    text: `Jatuh tempo: ${dd} hari lagi`,
    className: "border-muted text-foreground/70 bg-muted",
  };
};

/* ===== Types ===== */
type Subject = "tahsin" | "tahfidz" | "fiqih";
type AssignmentType = "file" | "quiz";
type AssignmentStatus = "belum" | "terkumpul" | "dinilai";

type Assignment = {
  id: string;
  subject: Subject;
  title: string;
  description?: string;
  dueAt: string;
  points?: number;
  type: AssignmentType;
  status: AssignmentStatus;
  submittedAt?: string;
  submittedLink?: string;
  quizDurationMin?: number;
  quizAttempt?: number;
  quizMaxAttempt?: number;
  grade?: number | null;
  reviewUrl?: string;
};

const SUBJECT_LABEL: Record<Subject, string> = {
  tahsin: "Tahsin",
  tahfidz: "Tahfidz",
  fiqih: "Fiqih",
};

/* ===== Dummy data ===== */
const now = Date.now();
const plus = (d: number, h = 9) =>
  new Date(new Date(now + d * 86400000).setHours(h, 0, 0, 0)).toISOString();

const DUMMY: Assignment[] = [
  {
    id: "tahsin-file-1",
    subject: "tahsin",
    title: "Ringkasan Hukum Nun Sakinah",
    description: "Tulis 1 halaman, unggah link Google Drive.",
    dueAt: plus(2, 20),
    points: 100,
    type: "file",
    status: "belum",
  },
  {
    id: "tahsin-quiz-1",
    subject: "tahsin",
    title: "Quiz: Mad Thobi'i",
    description: "20 soal pilihan ganda.",
    dueAt: plus(1, 21),
    points: 100,
    type: "quiz",
    status: "belum",
    quizDurationMin: 20,
    quizAttempt: 0,
    quizMaxAttempt: 2,
  },
  {
    id: "tahfidz-file-1",
    subject: "tahfidz",
    title: "Setoran An-Naba' 1–10",
    dueAt: plus(0, 23),
    points: 100,
    type: "file",
    status: "terkumpul",
    submittedAt: plus(0, 8),
    submittedLink: "https://drive.google.com/file/d/XXXX/view",
  },
  {
    id: "tahfidz-quiz-1",
    subject: "tahfidz",
    title: "Quiz Muraja'ah Juz 30",
    dueAt: plus(-2, 20),
    points: 100,
    type: "quiz",
    status: "dinilai",
    quizDurationMin: 25,
    quizAttempt: 1,
    quizMaxAttempt: 1,
    grade: 86,
    reviewUrl: "/murid/quiz/review/tahfidz-quiz-1",
  },
  {
    id: "fiqih-file-1",
    subject: "fiqih",
    title: "Rangkuman Thaharah",
    dueAt: plus(5, 18),
    points: 100,
    type: "file",
    status: "belum",
  },
  {
    id: "fiqih-quiz-1",
    subject: "fiqih",
    title: "Quiz: Rukun & Sunnah Wudhu",
    dueAt: plus(-1, 19),
    points: 100,
    type: "quiz",
    status: "dinilai",
    quizDurationMin: 15,
    quizAttempt: 1,
    quizMaxAttempt: 1,
    grade: 92,
    reviewUrl: "/murid/quiz/review/fiqih-quiz-1",
  },
];

/* ================== Component ================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const StudentClassesAssignment: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const { subject } = useParams<{ subject?: Subject }>();
  const [data, setData] = useState<Assignment[]>(DUMMY);
  const [search, setSearch] = useState("");

  const tabDefault: "semua" | Subject =
    subject && ["tahsin", "tahfidz", "fiqih"].includes(subject)
      ? (subject as Subject)
      : "semua";
  const [tab, setTab] = useState<"semua" | Subject>(tabDefault);

  /* Header */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader?.({
      title: "Daftar Tugas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Tugas" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  /* Filter search + subject */
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return data.filter((a) => {
      const byTab = tab === "semua" ? true : a.subject === tab;
      const bySearch =
        !s ||
        a.title.toLowerCase().includes(s) ||
        (a.description ?? "").toLowerCase().includes(s);
      return byTab && bySearch;
    });
  }, [data, tab, search]);

  const pending = useMemo(
    () =>
      filtered
        .filter((a) => a.status === "belum")
        .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt)),
    [filtered]
  );

  const done = useMemo(
    () =>
      filtered
        .filter((a) => a.status !== "belum")
        .sort((a, b) => {
          const ta = +new Date(a.submittedAt ?? a.dueAt);
          const tb = +new Date(b.submittedAt ?? b.dueAt);
          return tb - ta;
        }),
    [filtered]
  );

  const counts = useMemo(() => {
    const base = { tahsin: 0, tahfidz: 0, fiqih: 0, semua: filtered.length };
    filtered.forEach((a) => (base[a.subject] += 1));
    return base;
  }, [filtered]);

  /* Handlers */
  const submitLink = (id: string, link: string) => {
    setData((list) =>
      list.map((a) =>
        a.id === id
          ? {
            ...a,
            status: "terkumpul",
            submittedAt: new Date().toISOString(),
            submittedLink:
              link || a.submittedLink || "https://drive.google.com/...",
          }
          : a
      )
    );
    alert("Tautan terkirim. Menunggu penilaian.");
  };

  const startQuiz = (id: string) => {
    setData((list) =>
      list.map((a) =>
        a.id === id
          ? {
            ...a,
            status: "dinilai",
            quizAttempt: Math.min(
              (a.quizAttempt ?? 0) + 1,
              a.quizMaxAttempt ?? 1
            ),
            grade: Math.max(70, Math.round(70 + Math.random() * 30)),
            reviewUrl: `/murid/quiz/review/${id}`,
            submittedAt: new Date().toISOString(),
          }
          : a
      )
    );
    alert("Quiz selesai & nilai otomatis tersimpan.");
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto w-full flex flex-col gap-6">
          {/* Header */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-lg font-semibold md:text-xl">Daftar Tugas</h1>
          </div>

          {/* Search + Segmented Tabs */}

          <div className="flex flex-col gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tugas atau deskripsi…"
            />

            {/* ============== NEW: Segmented Tabs ============== */}
            <CSegmentedTabs
              value={tab}
              onValueChange={(v) => setTab(v as any)}
              tabs={[
                { value: "semua", label: `Semua (${counts.semua})` },
                { value: "tahsin", label: `Tahsin (${counts.tahsin})` },
                { value: "tahfidz", label: `Tahfidz (${counts.tahfidz})` },
                { value: "fiqih", label: `Fiqih (${counts.fiqih})` },
              ]}
              className="mt-1"
            />

            {/* ============== CONTENT ============== */}
            <div className="mt-4 space-y-6">
              {/* Pending */}
              <Card className="overflow-hidden">
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <h2 className="text-base md:text-lg font-semibold">
                      Belum dikerjakan
                    </h2>
                    <Badge variant="outline">{pending.length}</Badge>
                  </div>

                  {pending.length === 0 ? (
                    <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                      Semua tugas sudah dikerjakan. Mantap! 🎉
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {pending.map((a) => (
                        <AssignmentCard
                          key={a.id}
                          a={a}
                          onSubmitLink={submitLink}
                          onStartQuiz={startQuiz}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Done */}
              <Card className="overflow-hidden">
                <CardContent className=" space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <h2 className="text-base md:text-lg font-semibold">
                      Riwayat (sudah dikerjakan)
                    </h2>
                    <Badge variant="outline">{done.length}</Badge>
                  </div>

                  {done.length === 0 ? (
                    <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                      Belum ada riwayat pengumpulan/penilaian.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {done.map((a) => (
                        <AssignmentCard
                          key={a.id}
                          a={a}
                          onSubmitLink={submitLink}
                          onStartQuiz={startQuiz}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

/* ========= Card tiap tugas ========= */
function AssignmentCard({
  a,
  onSubmitLink,
  onStartQuiz,
}: {
  a: Assignment;
  onSubmitLink: (id: string, link: string) => void;
  onStartQuiz: (id: string) => void;
}) {
  const badge = dueBadge(a.dueAt);
  const [linkVal, setLinkVal] = useState(a.submittedLink ?? "");

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-base md:text-lg font-semibold">
                {a.title}
              </div>

              <Badge variant="outline" className="h-6">
                {SUBJECT_LABEL[a.subject]}
              </Badge>

              <Badge
                variant={a.type === "quiz" ? "default" : "secondary"}
                className="h-6"
              >
                {a.type === "quiz" ? "Quiz" : "File Link"}
              </Badge>

              {a.status === "dinilai" ? (
                <Badge className="h-6">Dinilai</Badge>
              ) : a.status === "terkumpul" ? (
                <Badge variant="secondary" className="h-6">
                  Terkumpul
                </Badge>
              ) : (
                <Badge variant="outline" className="h-6">
                  Belum
                </Badge>
              )}

              {typeof a.points === "number" && (
                <Badge variant="outline" className="h-6">
                  Poin: {a.points}
                </Badge>
              )}

              {typeof a.grade === "number" && (
                <Badge
                  variant="outline"
                  className="h-6 border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/30"
                >
                  Nilai: {a.grade}
                </Badge>
              )}

              <Badge variant="outline" className={cn("h-6", badge.className)}>
                {badge.text}
              </Badge>
            </div>

            {a.description && (
              <p className="text-sm mt-1 text-muted-foreground">
                {a.description}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Jatuh tempo: {dateLong(a.dueAt)}</span>

              {a.submittedAt && (
                <>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>Dikumpulkan: {dateLong(a.submittedAt)}</span>
                </>
              )}

              {a.submittedLink && (
                <>
                  <span>•</span>
                  <Paperclip className="h-4 w-4" />
                  <a
                    href={a.submittedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Lampiran
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      {/* Footer actions */}
      <div className="px-4 md:px-5 pb-4 md:pb-5 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-muted-foreground">Aksi</div>

        {/* FILE LINK */}
        {a.type === "file" && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tempel link Google Drive…"
              value={linkVal}
              onChange={(e) => setLinkVal(e.target.value)}
              disabled={a.status !== "belum"}
              className="sm:w-[360px]"
            />

            {a.status === "belum" ? (
              <Button size="sm" onClick={() => onSubmitLink(a.id, linkVal)}>
                <Send className="h-4 w-4 mr-1" />
                Kirim Link
              </Button>
            ) : a.status === "terkumpul" ? (
              <Badge
                variant="secondary"
                className="h-6 inline-flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4 animate-spin" />
                Menunggu nilai
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="h-6 inline-flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Selesai
                </Badge>

                {a.submittedLink && (
                  <a
                    className="text-sm underline"
                    href={a.submittedLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat Lampiran
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* QUIZ */}
        {a.type === "quiz" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="h-6">
              Durasi: {a.quizDurationMin ?? 0} m
            </Badge>

            <Badge variant="outline" className="h-6">
              Attempt: {a.quizAttempt ?? 0}/{a.quizMaxAttempt ?? 1}
            </Badge>

            {a.status === "belum" ? (
              <Button size="sm" onClick={() => onStartQuiz(a.id)}>
                <Play className="h-4 w-4 mr-1" />
                Mulai Quiz
              </Button>
            ) : a.status === "terkumpul" ? (
              <Badge
                variant="secondary"
                className="h-6 inline-flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4 animate-spin" />
                Menunggu nilai
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                {typeof a.grade === "number" && (
                  <Badge className="h-6">Nilai: {a.grade}</Badge>
                )}
                {a.reviewUrl && (
                  <Link to={a.reviewUrl}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Review Quiz
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StudentClassesAssignment;
