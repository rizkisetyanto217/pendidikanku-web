// src/pages/sekolahislamku/pages/student/StudentAssignment.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Filter,
  CalendarDays,
  Clock,
  Eye,
  Send,
  Paperclip,
  CheckCircle,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ===== Helpers ===== */
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
  return Math.round((d - t) / 86400000); // + = nanti, - = lewat
};

const dueBadge = (iso: string, isBelum: boolean) => {
  const dd = diffDays(iso);
  if (!isBelum) {
    // kalau bukan status 'belum', styling netral
    return {
      text:
        dd === 0
          ? "Jatuh tempo: Hari ini"
          : dd === 1
            ? "Jatuh tempo: Besok"
            : dd > 1
              ? `Jatuh tempo: ${dd} hari lagi`
              : `Lewat ${Math.abs(dd)} hari`,
      className:
        dd < 0
          ? "border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/30"
          : "border-sky-200 text-sky-800 bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:bg-sky-900/30",
    };
  }
  // status 'belum' → highlight overdue/soon
  if (dd < 0)
    return {
      text: `Terlambat ${Math.abs(dd)} hari`,
      className:
        "border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/30",
    };
  if (dd === 0)
    return {
      text: "Hari ini",
      className:
        "border-red-200 text-red-800 bg-red-50 dark:border-red-700 dark:text-red-300 dark:bg-red-900/30",
    };
  if (dd === 1)
    return {
      text: "Besok",
      className:
        "border-orange-200 text-orange-800 bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:bg-orange-900/30",
    };
  if (dd <= 7)
    return {
      text: `${dd} hari lagi`,
      className:
        "border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/30",
    };
  return {
    text: `${dd} hari lagi`,
    className:
      "border-muted text-foreground/70 bg-muted dark:text-foreground/70",
  };
};

/* ===== Types ===== */
type AssignmentStatus = "belum" | "terkumpul" | "dinilai";
type Assignment = {
  id: string;
  subject: "tahsin" | "tahfidz" | "fiqih";
  title: string;
  description?: string;
  dueAt: string; // ISO
  points?: number;
  status: AssignmentStatus;
  submittedAt?: string;
  grade?: number;
  attachmentName?: string;
};

const SUBJECT_LABEL: Record<Assignment["subject"], string> = {
  tahsin: "Tahsin",
  tahfidz: "Tahfidz",
  fiqih: "Fiqih",
};

/* ===== Dummy data ===== */
const DUMMY_ALL: Assignment[] = [
  {
    id: "tahsin-1",
    subject: "tahsin",
    title: "Latihan Mad Thabi'i",
    description: "Kerjakan 10 soal pilihan ganda tentang mad thabi'i.",
    dueAt: new Date(Date.now() + 2 * 864e5).toISOString(),
    points: 100,
    status: "belum",
  },
  {
    id: "tahsin-2",
    subject: "tahsin",
    title: "Ringkasan Hukum Nun Sukun",
    description: "Tuliskan ringkasan 1 halaman.",
    dueAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    points: 100,
    status: "dinilai",
    submittedAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    grade: 88,
    attachmentName: "ringkasan-nun-sukun.pdf",
  },
  {
    id: "tahfidz-1",
    subject: "tahfidz",
    title: "Setoran An-Naba’ 1–10",
    description: "Setor hafalan ayat 1–10.",
    dueAt: new Date(Date.now() + 864e5).toISOString(),
    points: 100,
    status: "terkumpul",
    submittedAt: new Date().toISOString(),
    attachmentName: "setoran-1-10.mp3",
  },
  {
    id: "tahfidz-2",
    subject: "tahfidz",
    title: "Muraja’ah Audio 11–20",
    description: "Unggah audio muraja’ah.",
    dueAt: new Date(Date.now() - 864e5).toISOString(),
    points: 100,
    status: "belum",
  },
  {
    id: "fiqih-1",
    subject: "fiqih",
    title: "Rangkuman Thaharah",
    description: "Rangkum bab najis & cara menyucikannya.",
    dueAt: new Date(Date.now() + 3 * 864e5).toISOString(),
    points: 100,
    status: "belum",
  },
  {
    id: "fiqih-2",
    subject: "fiqih",
    title: "Latihan Soal Wudhu",
    description: "10 soal tentang rukun & sunnah wudhu.",
    dueAt: new Date(Date.now() + 2 * 864e5).toISOString(),
    points: 100,
    status: "dinilai",
    submittedAt: new Date(Date.now() - 864e5).toISOString(),
    grade: 92,
    attachmentName: "jawaban-wudhu.pdf",
  },
];

type DueRange = "today" | "7d" | "all";
type SortDir = "asc" | "desc";

const StudentAssignment: React.FC = () => {
  const { subject } = useParams<{ slug: string; subject?: string }>();

  const defaultSubject = (subject as Assignment["subject"]) || "all";
  const [subjectFilter, setSubjectFilter] = useState<
    "all" | Assignment["subject"]
  >(
    defaultSubject === "tahsin" ||
      defaultSubject === "tahfidz" ||
      defaultSubject === "fiqih"
      ? defaultSubject
      : "all"
  );

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Dasftar Tugas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Tugas" },
        { label: "Daftar Tugas" },
      ],
      actions: null,
    });
  }, [setHeader]);


  const [list, setList] = useState<Assignment[]>(DUMMY_ALL);

  // search & filter
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AssignmentStatus>("belum");
  const [dueRange, setDueRange] = useState<DueRange>("all");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const bySubject = useMemo(
    () =>
      list.filter((a) =>
        subjectFilter === "all" ? true : a.subject === subjectFilter
      ),
    [list, subjectFilter]
  );

  const countsPerSubject = useMemo(() => {
    const base = { total: 0, belum: 0, terkumpul: 0, dinilai: 0 };
    const map: Record<string, typeof base> = {};
    (["tahsin", "tahfidz", "fiqih"] as Assignment["subject"][]).forEach(
      (s) => (map[s] = { ...base })
    );
    bySubject.forEach((a) => {
      const m = map[a.subject];
      m.total++;
      m[a.status]++;
    });
    return map;
  }, [bySubject]);

  const filteredBase = useMemo(() => {
    const key = q.trim().toLowerCase();
    let arr = bySubject
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter(
        (a) =>
          !key ||
          a.title.toLowerCase().includes(key) ||
          (a.description ?? "").toLowerCase().includes(key)
      );

    // due range
    arr = arr.filter((a) => {
      if (dueRange === "all") return true;
      const d = diffDays(a.dueAt);
      if (dueRange === "today") return d <= 0; // yang udah lewat & hari ini (supaya fokus “butuh perhatian”)
      if (dueRange === "7d") return d <= 7;
      return true;
    });

    if (onlyOverdue)
      arr = arr.filter((a) => diffDays(a.dueAt) < 0 && a.status === "belum");

    // sort
    arr.sort((a, b) =>
      sortDir === "asc"
        ? +new Date(a.dueAt) - +new Date(b.dueAt)
        : +new Date(b.dueAt) - +new Date(a.dueAt)
    );

    return arr;
  }, [bySubject, q, status, dueRange, sortDir, onlyOverdue]);

  // group by status
  const grouped = useMemo(() => {
    return {
      belum: filteredBase.filter((a) => a.status === "belum"),
      terkumpul: filteredBase.filter((a) => a.status === "terkumpul"),
      dinilai: filteredBase.filter((a) => a.status === "dinilai"),
    };
  }, [filteredBase]);

  const counts = useMemo(() => {
    const total = bySubject.length;
    const belum = bySubject.filter((x) => x.status === "belum").length;
    const terkumpul = bySubject.filter((x) => x.status === "terkumpul").length;
    const dinilai = bySubject.filter((x) => x.status === "dinilai").length;
    return { total, belum, terkumpul, dinilai };
  }, [bySubject]);

  // Actions (dummy)
  const handleSubmit = (a: Assignment) => {
    const now = new Date().toISOString();
    setList((old) =>
      old.map((x) =>
        x.id === a.id
          ? {
            ...x,
            status: "terkumpul",
            submittedAt: now,
            attachmentName: x.attachmentName || "tugas-dikumpulkan.pdf",
          }
          : x
      )
    );
    alert(`Tugas "${a.title}" sudah dikumpulkan!`);
  };

  const handleView = (a: Assignment) => {
    const detail = [
      `Mapel: ${SUBJECT_LABEL[a.subject]}`,
      `Judul: ${a.title}`,
      a.description ? `Deskripsi: ${a.description}` : "",
      `Jatuh tempo: ${dateLong(a.dueAt)}`,
      `Status: ${a.status}`,
      a.submittedAt ? `Dikumpulkan: ${dateLong(a.submittedAt)}` : "",
      typeof a.grade === "number" ? `Nilai: ${a.grade}` : "",
      a.points ? `Poin: ${a.points}` : "",
      a.attachmentName ? `Lampiran: ${a.attachmentName}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    alert(detail);
  };

  const SubjectChip: React.FC<{
    s: Assignment["subject"];
    active: boolean;
    onClick: () => void;
  }> = ({ s, active, onClick }) => {
    const c = countsPerSubject[s];
    return (
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
          active ? "border-primary bg-primary/10" : "hover:bg-muted"
        )}
      >
        <BookOpen className="h-4 w-4" />
        <span className="font-medium">{SUBJECT_LABEL[s]}</span>
        <span className="text-xs text-muted-foreground">
          {c.belum}/{c.total}
        </span>
      </button>
    );
  };

  const AssignmentCard: React.FC<{ a: Assignment }> = ({ a }) => {
    const badge = dueBadge(a.dueAt, a.status === "belum");
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-base md:text-lg font-semibold">
                  {a.title}
                </div>

                {/* Mapel */}
                <Badge variant="outline" className="h-6">
                  {SUBJECT_LABEL[a.subject]}
                </Badge>

                {/* Status */}
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

                {/* Poin */}
                {typeof a.points === "number" && (
                  <Badge variant="outline" className="h-6">
                    Poin: {a.points}
                  </Badge>
                )}

                {/* Nilai */}
                {typeof a.grade === "number" && (
                  <Badge
                    variant="outline"
                    className="h-6 border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/30"
                  >
                    Nilai: {a.grade}
                  </Badge>
                )}

                {/* Deadline badge */}
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
                {a.attachmentName && (
                  <>
                    <span>•</span>
                    <Paperclip className="h-4 w-4" />
                    <span>{a.attachmentName}</span>
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
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => handleView(a)}>
              <Eye className="h-4 w-4 mr-1" />
              Lihat
            </Button>

            {a.status === "belum" && (
              <Button size="sm" onClick={() => handleSubmit(a)}>
                <Send className="h-4 w-4 mr-1" />
                Kumpulkan
              </Button>
            )}

            {a.status === "terkumpul" && (
              <Badge
                variant="secondary"
                className="h-6 inline-flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Menunggu penilaian
              </Badge>
            )}

            {a.status === "dinilai" && (
              <Badge className="h-6 inline-flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Selesai
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Title */}
          <div className="hidden md:flex items-center gap-3">
            <h1 className="text-lg font-semibold">Daftar Tugas</h1>
          </div>

          {/* Ringkasan cepat */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-wrap items-center gap-3">
              <div className="text-sm">
                Total: <b>{counts.total}</b>
              </div>
              <Badge variant="outline" className="h-6">
                Belum: {counts.belum}
              </Badge>
              <Badge variant="secondary" className="h-6">
                Terkumpul: {counts.terkumpul}
              </Badge>
              <Badge className="h-6">Dinilai: {counts.dinilai}</Badge>

              {/* Chips per mapel */}
              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  onClick={() => setSubjectFilter("all")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                    subjectFilter === "all"
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Semua
                </button>
                {(["tahsin", "tahfidz", "fiqih"] as const).map((s) => (
                  <SubjectChip
                    key={s}
                    s={s}
                    active={subjectFilter === s}
                    onClick={() => setSubjectFilter(s)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Cari */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari tugas…"
                  className="pl-9"
                />
              </div>

              {/* Filter status */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  value={status}
                  onValueChange={(v: "all" | AssignmentStatus) => setStatus(v)}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="belum">Belum dikumpulkan</SelectItem>
                    <SelectItem value="terkumpul">Terkumpul</SelectItem>
                    <SelectItem value="dinilai">Dinilai</SelectItem>
                    <SelectItem value="all">Semua status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter deadline & sort */}
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={dueRange}
                  onValueChange={(v: DueRange) => setDueRange(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Deadline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">
                      Perlu perhatian (lewat/hari ini)
                    </SelectItem>
                    <SelectItem value="7d">≤ 7 hari lagi</SelectItem>
                    <SelectItem value="all">Semua tanggal</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortDir}
                  onValueChange={(v: SortDir) => setSortDir(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" /> Terdekat → Terjauh
                      </div>
                    </SelectItem>
                    <SelectItem value="desc">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 rotate-180" /> Terjauh →
                        Terdekat
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggle overdue saja */}
              <div className="md:col-span-4">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-[hsl(var(--primary))]"
                    checked={onlyOverdue}
                    onChange={(e) => setOnlyOverdue(e.target.checked)}
                  />
                  Tampilkan hanya yang terlambat (status Belum)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* ====== Section: Belum ====== */}
          <Section title={`Harus dikerjakan (${grouped.belum.length})`}>
            {grouped.belum.length === 0 ? (
              <Empty text="Tidak ada tugas yang harus dikerjakan." />
            ) : (
              <div className="grid gap-3">
                {grouped.belum.map((a) => (
                  <AssignmentCard key={a.id} a={a} />
                ))}
              </div>
            )}
          </Section>

          {/* ====== Section: Terkumpul ====== */}
          <Section title={`Sudah dikumpulkan (${grouped.terkumpul.length})`}>
            {grouped.terkumpul.length === 0 ? (
              <Empty text="Belum ada yang terkumpul." />
            ) : (
              <div className="grid gap-3">
                {grouped.terkumpul.map((a) => (
                  <AssignmentCard key={a.id} a={a} />
                ))}
              </div>
            )}
          </Section>

          {/* ====== Section: Dinilai ====== */}
          <Section title={`Sudah dinilai (${grouped.dinilai.length})`}>
            {grouped.dinilai.length === 0 ? (
              <Empty text="Belum ada yang dinilai." />
            ) : (
              <div className="grid gap-3">
                {grouped.dinilai.map((a) => (
                  <AssignmentCard key={a.id} a={a} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h2 className="text-base md:text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <Card>
    <CardContent className="p-6 text-sm text-center text-muted-foreground">
      {text}
    </CardContent>
  </Card>
);

export default StudentAssignment;
