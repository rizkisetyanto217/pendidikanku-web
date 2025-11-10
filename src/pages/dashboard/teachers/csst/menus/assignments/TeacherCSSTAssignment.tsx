// src/pages/sekolahislamku/teacher/TeacherGrading.tsx
import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  Filter,
  Search,
  CheckCircle2,
  Download,
  Plus,
  CalendarDays,
  Users,
  ClipboardList,
  BookOpen,
  Clock,
  TrendingUp,
  FileText,
  Eye,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import CTeacherModalExportResult from "./components/CTeacherModalExportResult";
import CTeacherModalGrading from "./components/CTeacherModalGrading";

/* ================= Types ================ */
type Assignment = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submitted: number;
  graded: number;
  total: number;
};

type Submission = {
  id: string;
  studentName: string;
  status: "submitted" | "graded" | "missing";
  score?: number;
  submittedAt?: string;
};

type GradingPayload = {
  gregorianDate: string;
  hijriDate: string;
  classes: string[];
  summary: {
    assignments: number;
    toGrade: number;
    graded: number;
    average: number;
  };
  assignments: Assignment[];
  submissionsByAssignment: Record<string, Submission[]>;
};

/* ============ Fake API (ganti ke axios bila siap) ============ */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "-";

async function fetchTeacherAssignment(): Promise<GradingPayload> {
  const now = new Date();
  const iso = toLocalNoonISO(now);
  const plusDays = (n: number) =>
    toLocalNoonISO(new Date(now.getTime() + n * 864e5));

  const assignments: Assignment[] = [
    {
      id: "a1",
      title: "Evaluasi Wudhu",
      className: "TPA A",
      dueDate: plusDays(1),
      submitted: 18,
      graded: 10,
      total: 22,
    },
    {
      id: "a2",
      title: "Setoran Hafalan An-Naba 1–10",
      className: "TPA B",
      dueDate: plusDays(2),
      submitted: 12,
      graded: 7,
      total: 20,
    },
    {
      id: "a3",
      title: "Latihan Makhraj (ba-ta-tha)",
      className: "TPA A",
      dueDate: plusDays(3),
      submitted: 5,
      graded: 0,
      total: 22,
    },
  ];

  const submissionsA1: Submission[] = [
    {
      id: "s1",
      studentName: "Ahmad",
      status: "graded",
      score: 88,
      submittedAt: iso,
    },
    {
      id: "s2",
      studentName: "Fatimah",
      status: "graded",
      score: 92,
      submittedAt: iso,
    },
    { id: "s3", studentName: "Hasan", status: "submitted", submittedAt: iso },
    { id: "s4", studentName: "Aisyah", status: "submitted", submittedAt: iso },
    { id: "s5", studentName: "Umar", status: "missing" },
  ];
  const submissionsA2: Submission[] = [
    {
      id: "b1",
      studentName: "Bilal",
      status: "graded",
      score: 80,
      submittedAt: iso,
    },
    { id: "b2", studentName: "Huda", status: "submitted", submittedAt: iso },
  ];

  return {
    gregorianDate: iso,
    hijriDate: hijriLong(iso),
    classes: ["TPA A", "TPA B"],
    summary: {
      assignments: assignments.length,
      toGrade: assignments.reduce(
        (n, a) => n + Math.max(0, a.submitted - a.graded),
        0
      ),
      graded: assignments.reduce((n, a) => n + a.graded, 0),
      average: 84,
    },
    assignments,
    submissionsByAssignment: { a1: submissionsA1, a2: submissionsA2, a3: [] },
  };
}

/* ================= Helpers ================ */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "-";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    })
    : "-";

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/* =============== kecil-kecil UI =============== */
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
}: {
  icon: any;
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-muted-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">
                {label}
              </div>
              <div className="text-xl font-bold">{value}</div>
              {subtitle && (
                <div className="text-xs text-muted-foreground">{subtitle}</div>
              )}
            </div>
          </div>
          <TrendingUp className={`h-4 w-4 ${trendColor}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant={active ? "default" : "outline"}
      className="h-9 gap-2"
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 ${active ? "bg-background" : "bg-muted"
            }`}
        >
          {count}
        </span>
      )}
    </Button>
  );
}

/* ================= Page ================= */
export default function TeacherCSSTAssignment() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-grading"],
    queryFn: fetchTeacherAssignment,
    staleTime: 60_000,
  });

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "all" | "waiting" | "inprogress" | "done"
  >("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submissionSearchQ, setSubmissionSearchQ] = useState("");
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  // modal grading
  const [gradingOpen, setGradingOpen] = useState(false);
  const [gradingStudent, setGradingStudent] = useState<{
    id: string;
    name: string;
    score?: number;
  } | null>(null);

  const filteredAssignments = useMemo(() => {
    let items = data?.assignments ?? [];
    if (classFilter !== "all")
      items = items.filter((a) => a.className === classFilter);
    if (status !== "all") {
      items = items.filter((a) => {
        const done = a.graded >= a.total;
        const waiting = a.submitted - a.graded > 0;
        if (status === "done") return done;
        if (status === "waiting") return waiting;
        if (status === "inprogress") return !done && a.graded > 0;
        return true;
      });
    }
    if (q.trim())
      items = items.filter((a) =>
        a.title.toLowerCase().includes(q.trim().toLowerCase())
      );
    return items;
  }, [data?.assignments, classFilter, status, q]);

  const selected =
    data?.assignments.find(
      (a) => a.id === (selectedId ?? data?.assignments[0]?.id)
    ) ?? filteredAssignments[0];

  const submissions = useMemo(() => {
    const all = selected
      ? data?.submissionsByAssignment[selected.id] ?? []
      : [];
    if (!submissionSearchQ.trim()) return all;
    return all.filter((s) =>
      s.studentName
        .toLowerCase()
        .includes(submissionSearchQ.trim().toLowerCase())
    );
  }, [data?.submissionsByAssignment, selected, submissionSearchQ]);

  const statusCounts = useMemo(() => {
    const assignments = data?.assignments ?? [];
    return {
      all: assignments.length,
      waiting: assignments.filter((a) => a.submitted - a.graded > 0).length,
      inprogress: assignments.filter((a) => a.graded > 0 && a.graded < a.total)
        .length,
      done: assignments.filter((a) => a.graded >= a.total).length,
    };
  }, [data?.assignments]);

  const emptyAssignments = filteredAssignments.length === 0;

  const openGradeModal = useCallback((s: Submission) => {
    setGradingStudent({ id: s.id, name: s.studentName, score: s.score });
    setGradingOpen(true);
  }, []);

  const { slug } = useParams<{ slug: string }>();

  // export modal
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Modals */}
      <CTeacherModalGrading
        open={gradingOpen}
        onClose={() => setGradingOpen(false)}
        student={gradingStudent ?? undefined}
        assignmentTitle={
          selected
            ? `${selected.title}${selected.className ? ` — (${selected.className})` : ""
            }`
            : undefined
        }
        onSubmit={(payload: { id: string; score: number }) => {
          alert(`Nilai disimpan: ${payload.id} = ${payload.score}`);
        }}
      />

      <CTeacherModalExportResult
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        defaultName={selected ? `rekap-${selected.title}` : "rekap-penilaian"}
        onExport={(fd: FormData) => {
          console.log("EXPORT PAYLOAD:", Array.from(fd.entries()));
          setExportOpen(false);
        }}
      />

      <main className="mx-auto">
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="flex-1 space-y-6">
            {/* ---- Stats Overview ---- */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={BookOpen}
                  label="Total Penilaian"
                  value={data?.summary.assignments ?? 0}
                  subtitle="tugas aktif"
                  trend="neutral"
                />
                <StatCard
                  icon={Clock}
                  label="Belum Dinilai"
                  value={data?.summary.toGrade ?? 0}
                  subtitle="menunggu penilaian"
                  trend="down"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Sudah Dinilai"
                  value={data?.summary.graded ?? 0}
                  subtitle="telah selesai"
                  trend="up"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Rata-rata Nilai"
                  value={`${data?.summary.average ?? 0}`}
                  subtitle="skor keseluruhan"
                  trend="up"
                />
              </div>
            </section>

            {/* ---- Filters & Actions ---- */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm md:text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filter & Kelola Penilaian
                  </h2>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5 md:px-4 md:py-3 w-full">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tugas…"
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>

                {/* Status chips */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="Semua"
                      active={status === "all"}
                      onClick={() => setStatus("all")}
                      count={statusCounts.all}
                    />
                    <FilterChip
                      label="Menunggu"
                      active={status === "waiting"}
                      onClick={() => setStatus("waiting")}
                      count={statusCounts.waiting}
                    />
                    <FilterChip
                      label="Progres"
                      active={status === "inprogress"}
                      onClick={() => setStatus("inprogress")}
                      count={statusCounts.inprogress}
                    />
                    <FilterChip
                      label="Selesai"
                      active={status === "done"}
                      onClick={() => setStatus("done")}
                      count={statusCounts.done}
                    />
                  </div>
                </div>

                {/* Kelas select (native supaya ringan) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Kelas
                  </span>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border text-sm bg-background flex-1"
                  >
                    <option value="all">Semua Kelas</option>
                    {(data?.classes ?? []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* ---- Mobile Tabs (daftar/detail) ---- */}
            <Card className="p-2 block lg:hidden">
              <div className="grid grid-cols-2 gap-1 rounded-xl p-1 border">
                {(["list", "detail"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={mobileTab === t ? "default" : "ghost"}
                    className="h-9 rounded-lg text-sm font-semibold"
                    onClick={() => setMobileTab(t)}
                  >
                    {t === "list" ? "Daftar Tugas" : "Detail Tugas"}
                  </Button>
                ))}
              </div>
            </Card>

            {/* ---- Assignment List & Detail ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ----- LIST ----- */}
              <Card
                className={`lg:col-span-5 ${mobileTab === "list" ? "block" : "hidden lg:block"
                  }`}
              >
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Daftar Tugas (
                    {filteredAssignments.length})
                  </h3>

                  {emptyAssignments ? (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed text-muted-foreground">
                      <ClipboardList className="mx-auto mb-2 opacity-60 h-9 w-9" />
                      <p className="text-sm">
                        Belum ada tugas untuk filter saat ini.
                      </p>
                      <div className="mt-3 flex gap-2 justify-center">
                        <Button
                          onClick={() => alert("Buat Penilaian")}
                          size="sm"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Buat Tugas
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => alert("Export Rekap")}
                          size="sm"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredAssignments.map((a) => {
                        const donePct = pct(a.graded, a.total);
                        const waiting = Math.max(0, a.submitted - a.graded);
                        const active = selected?.id === a.id;
                        const isOverdue = new Date(a.dueDate) < new Date();

                        return (
                          <button
                            key={a.id}
                            onClick={() => {
                              setSelectedId(a.id);
                              setMobileTab("detail");
                            }}
                            className={`w-full text-left rounded-xl border p-3 md:p-4 transition-all hover:shadow-sm ${active
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[13px] md:text-base truncate">
                                  {a.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-[11px] md:text-xs"
                                  >
                                    {a.className}
                                  </Badge>
                                  <span
                                    className={`text-[11px] md:text-xs flex items-center gap-1 ${isOverdue
                                        ? "text-red-500"
                                        : "text-muted-foreground"
                                      }`}
                                  >
                                    <CalendarDays className="h-3 w-3" />
                                    {dateShort(a.dueDate)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div
                                  className={`text-sm md:text-lg font-bold ${donePct === 100
                                      ? "text-green-600"
                                      : "text-primary"
                                    }`}
                                >
                                  {donePct}%
                                </div>
                                <div className="text-[11px] md:text-xs text-muted-foreground">
                                  selesai
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 md:mt-3">
                              <Progress value={donePct} className="h-2" />
                            </div>

                            <div className="mt-2 md:mt-3 flex items-center justify-between text-[11px] md:text-xs">
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {a.total} siswa
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {a.submitted} terkumpul
                                </span>
                              </div>
                              {waiting > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-[11px] md:text-xs"
                                >
                                  {waiting} menunggu
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ----- DETAIL ----- */}
              <Card
                className={`lg:col-span-7 ${mobileTab === "list" ? "hidden lg:block" : "block"
                  }`}
              >
                <CardContent className="p-4 md:p-6">
                  {!selected ? (
                    <div className="text-center py-12 rounded-xl border-2 border-dashed text-muted-foreground">
                      <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-60" />
                      <h3 className="text-base md:text-lg font-medium mb-1">
                        Pilih Tugas untuk Melihat Detail
                      </h3>
                      <p className="text-sm">
                        Pilih tugas dari daftar untuk melihat detail penilaian
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-bold truncate">
                            {selected.title}
                          </h3>
                          <div className="flex items-center gap-2 md:gap-3 mt-2">
                            <Badge variant="outline">
                              {selected.className}
                            </Badge>
                            <span className="text-xs md:text-sm truncate text-muted-foreground">
                              Batas waktu: {dateLong(selected.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl md:text-2xl font-bold text-primary">
                            {pct(selected.graded, selected.total)}%
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            selesai dinilai
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions (desktop) */}
                      <div className="hidden sm:flex flex-wrap gap-2 mb-5">
                        <Button
                          variant="secondary"
                          onClick={() => alert("Tandai selesai")}
                        >
                          Tandai Selesai
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setExportOpen(true)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export Hasil
                        </Button>

                        <Link
                          to={`/${slug}/guru/penilaian/${selected.id}`}
                          state={{
                            assignment: selected,
                            className: selected.className,
                            submissions,
                          }}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            Detail
                          </Button>
                        </Link>
                      </div>

                      {/* Submissions Search */}
                      <div className="mb-3 max-w-full sm:max-w-sm">
                        <div className="flex items-center gap-3 rounded-xl border px-3 py-2.5 md:px-4 md:py-3">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={submissionSearchQ}
                            onChange={(e) =>
                              setSubmissionSearchQ(e.target.value)
                            }
                            placeholder="Cari nama siswa..."
                            className="border-0 shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </div>

                      {/* Submissions - Desktop table */}
                      <div className="hidden md:block">
                        <div className="overflow-x-auto rounded-xl border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[45%]">Siswa</TableHead>
                                <TableHead className="text-center w-[15%]">
                                  Status
                                </TableHead>
                                <TableHead className="text-center w-[15%]">
                                  Nilai
                                </TableHead>
                                <TableHead className="text-right">
                                  Aksi
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {submissions.map((s) => (
                                <TableRow
                                  key={s.id}
                                  className="odd:bg-muted/30"
                                >
                                  <TableCell>
                                    <div className="font-medium">
                                      {s.studentName}
                                    </div>
                                    {s.submittedAt && (
                                      <div className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        Dikumpulkan {dateShort(s.submittedAt)}
                                      </div>
                                    )}
                                  </TableCell>

                                  <TableCell className="text-center">
                                    {s.status === "graded" ? (
                                      <Badge>Sudah Dinilai</Badge>
                                    ) : s.status === "submitted" ? (
                                      <Badge variant="secondary">
                                        Terkumpul
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive">Belum</Badge>
                                    )}
                                  </TableCell>

                                  <TableCell className="text-center">
                                    {typeof s.score === "number" ? (
                                      <span className="font-semibold text-lg">
                                        {s.score}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">
                                        -
                                      </span>
                                    )}
                                  </TableCell>

                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant={
                                          s.status === "submitted"
                                            ? "default"
                                            : "outline"
                                        }
                                        onClick={() => openGradeModal(s)}
                                      >
                                        {s.status === "graded"
                                          ? "Edit Nilai"
                                          : "Beri Nilai"}
                                      </Button>

                                      <Link
                                        to={`/${slug}/guru/penilaian/${s.id}`}
                                        state={{
                                          assignment: selected,
                                          className: selected.className,
                                          submissions,
                                        }}
                                      >
                                        <Button size="sm" variant="ghost">
                                          <Eye className="mr-1 h-4 w-4" />
                                          Detail
                                        </Button>
                                      </Link>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}

                              {submissions.length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="py-8 text-center text-muted-foreground"
                                  >
                                    <Users className="mx-auto mb-2 h-6 w-6 opacity-60" />
                                    Belum ada data pengumpulan.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Submissions - Mobile cards */}
                      <div className="md:hidden space-y-2">
                        {submissions.length === 0 && (
                          <div className="text-center py-8 rounded-xl border text-muted-foreground">
                            Belum ada data pengumpulan.
                          </div>
                        )}

                        {submissions.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-xl border p-3 bg-card"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {s.studentName}
                                </div>
                                <div className="text-xs mt-0.5 flex items-center gap-1 text-muted-foreground">
                                  {s.submittedAt ? (
                                    <>
                                      <Clock className="h-3 w-3" />
                                      Dikumpulkan {dateShort(s.submittedAt)}
                                    </>
                                  ) : (
                                    "Belum mengumpulkan"
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  s.status === "graded"
                                    ? "default"
                                    : s.status === "submitted"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {s.status === "graded"
                                  ? "Dinilai"
                                  : s.status === "submitted"
                                    ? "Terkumpul"
                                    : "Missing"}
                              </Badge>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-sm">
                                Nilai:{" "}
                                {typeof s.score === "number" ? (
                                  <span className="font-semibold">
                                    {s.score}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={
                                    s.status === "submitted"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => openGradeModal(s)}
                                >
                                  {s.status === "graded" ? "Edit" : "Nilai"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    alert(`Detail ${s.studentName}`)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sticky quick actions (mobile) */}
                      <div className="sm:hidden sticky bottom-3 z-20">
                        <div className="mt-3 rounded-xl shadow-md flex gap-2 p-2 bg-card/95 border backdrop-blur">
                          <Button
                            className="flex-1"
                            onClick={() => alert("Mulai menilai")}
                          >
                            Mulai
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => alert("Tandai selesai")}
                          >
                            Selesai
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setExportOpen(true)}
                          >
                            Export
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {isLoading && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <div className="animate-pulse">Memuat data penilaian...</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
