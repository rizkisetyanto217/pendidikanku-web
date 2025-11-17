// src/pages/sekolahislamku/pages/student/MyClass.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
  ChevronDown,
  Search,
  Activity,
  Video,
  Info,
  Clock,
} from "lucide-react";

/* Breadcrumb (opsional) */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

const isSameDay = (iso?: string) => {
  if (!iso) return false;
  const a = new Date(iso);
  const b = new Date();
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/* ===== Dummy data kelas (ditambah status) ===== */
type EnrolledClass = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  nextSession?: { dateISO: string; time: string; title: string };
  progress?: number;
  pendingAssignments?: number;
  activeQuizzes?: number;
  lastScore?: number;
  status: "active" | "legacy";
};

const ENROLLED: EnrolledClass[] = [
  {
    id: "tahsin",
    name: "Tahsin",
    room: "Aula 1",
    homeroom: "Ustadz Abdullah",
    nextSession: {
      dateISO: new Date().toISOString(), // hari ini
      time: "07:30",
      title: "Tahsin — Tajwid & Makhraj",
    },
    progress: 68,
    pendingAssignments: 2,
    activeQuizzes: 1,
    lastScore: 88,
    status: "active",
  },
  {
    id: "tahfidz",
    name: "Tahfidz",
    room: "R. Tahfiz",
    homeroom: "Ustadz Salman",
    nextSession: {
      dateISO: new Date(Date.now() + 864e5).toISOString(), // besok
      time: "09:30",
      title: "Hafalan Juz 30",
    },
    progress: 42,
    pendingAssignments: 1,
    activeQuizzes: 0,
    lastScore: 92,
    status: "active",
  },
  {
    id: "fiqih-2024",
    name: "Fiqih (Tahun Lalu)",
    room: "R. Syariah",
    homeroom: "Ustadz Ma'mun",
    progress: 100,
    pendingAssignments: 0,
    activeQuizzes: 0,
    lastScore: 90,
    status: "legacy",
  },
];

/* ===== Zoom per-kelas (dummy) ===== */
const ZOOM_INFO: Record<
  string,
  | {
    url: string;
    topic: string;
    meetingId: string;
    passcode: string;
    startAtLabel: string;
  }
  | undefined
> = {
  tahsin: {
    url: "https://us04web.zoom.us/j/74836152611?pwd=28Lxo5tjoNgArUWEEFZenOsxaDBuSk.1",
    topic: "Sumini's Zoom Meeting",
    meetingId: "748 3615 2611",
    passcode: "4pj4qt",
    startAtLabel: "Kamis, 9 Okt 2025 • 13:00 WIB",
  },
  tahfidz: {
    url: "https://us04web.zoom.us/j/74836152611?pwd=28Lxo5tjoNgArUWEEFZenOsxaDBuSk.1",
    topic: "Sumini's Zoom Meeting",
    meetingId: "748 3615 2611",
    passcode: "4pj4qt",
    startAtLabel: "Kamis, 9 Okt 2025 • 13:00 WIB",
  },
};


/* ===================== Page ===================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function StudentMyClass({
  showBack = false,
  backTo,
}: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const base = `/${slug}/murid`;

  /* Breadcrumb/title */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader?.({
      title: "Kelas Saya",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return ENROLLED;
    return ENROLLED.filter(
      (c) =>
        c.name.toLowerCase().includes(key) ||
        c.homeroom.toLowerCase().includes(key) ||
        (c.room ?? "").toLowerCase().includes(key)
    );
  }, [q]);

  const active = list.filter((c) => c.status === "active");
  const legacy = list.filter((c) => c.status === "legacy");

  const todayActive = active.filter((c) => isSameDay(c.nextSession?.dateISO));
  const upcomingActive = active.filter(
    (c) => !isSameDay(c.nextSession?.dateISO)
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Back + title */}
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
            <h1 className="text-lg font-semibold md:text-xl">Kelas Yang Saya Ajar</h1>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4 md:p-5">
              <div className="relative w-full md:w-96">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari kelas / wali kelas / ruangan…"
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* ===== Highlight: kelas yang aktif hari ini ===== */}
          {todayActive.length > 0 && (
            <Card className="border-secondary/50 bg-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Badge className="h-6">
                    Sedang Berlangsung / Mulai Hari Ini
                  </Badge>
                  <span className="text-secondary-foreground/80 text-sm">
                    {todayActive.length} kelas
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 grid gap-3">
                {todayActive.map((c) => (
                  <ActiveClassRow key={c.id} c={c} base={base} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* ===== Kelas Aktif Lainnya ===== */}
          <Section
            title="Kelas Aktif"
            hint={`${upcomingActive.length} kelas`}
            emptyText="Belum ada kelas aktif."
          >
            {upcomingActive.map((c) => (
              <ClassCard key={c.id} c={c} base={base} />
            ))}
          </Section>

          {/* ===== Legacy ===== */}
          <Section
            title="Kelas Legacy (Arsip)"
            hint={`${legacy.length} kelas`}
            emptyText="Tidak ada arsip kelas."
          >
            {legacy.map((c) => (
              <LegacyCard key={c.id} c={c} base={base} />
            ))}
          </Section>
        </div>
      </main>
    </div>
  );
}

/* ================= Components ================= */

function Section({
  title,
  hint,
  emptyText,
  children,
}: {
  title: string;
  hint?: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const isEmpty =
    React.Children.count(children) === 0 ||
    (Array.isArray(children) && children.length === 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        {hint && (
          <Badge variant="outline" className="h-6">
            {hint}
          </Badge>
        )}
      </div>
      {isEmpty ? (
        <Card>
          <CardContent className="p-6 text-sm text-center text-muted-foreground">
            {emptyText}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">{children}</div>
      )}
    </div>
  );
}

function ActiveClassRow({ c, base }: { c: EnrolledClass; base: string }) {
  const z = ZOOM_INFO[c.id];
  return (
    <div
      className={cn(
        "rounded-xl border p-3 bg-background/60 backdrop-blur",
        "ring-1 ring-secondary/40"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="h-6">
          AKTIF HARI INI
        </Badge>
        <span className="font-semibold">{c.name}</span>
        {c.room && (
          <Badge variant="outline" className="h-6">
            {c.room}
          </Badge>
        )}
        <span className="text-sm text-muted-foreground">
          • Wali: {c.homeroom}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {z && (
            <a
              href={z.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button size="sm" className="inline-flex gap-2">
                <Video size={16} />
                Masuk Zoom
              </Button>
            </a>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              (window.location.href = `${base}/menu-utama/my-class/${c.id}/materi`)
            }
            className="inline-flex gap-2"
          >
            <BookOpen size={16} />
            Materi
          </Button>
        </div>
      </div>
      {c.nextSession && (
        <div className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <CalendarDays size={14} />
          <span>
            {dateLong(c.nextSession.dateISO)} • {c.nextSession.time}
          </span>
          <span>— {c.nextSession.title}</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value = 0 }: { value?: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-secondary/20 overflow-hidden">
      <div
        className="h-full bg-secondary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function ClassCard({ c, base }: { c: EnrolledClass; base: string }) {
  const z = ZOOM_INFO[c.id];
  const go = (path: string) => (window.location.href = `${base}${path}`);

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{c.name}</span>
          <Badge variant="secondary" className="h-6">
            AKTIF
          </Badge>
          {c.room && (
            <Badge variant="outline" className="h-6">
              {c.room}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-5 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Wali Kelas: {c.homeroom}</span>
          <span>• Tugas menunggu: {c.pendingAssignments ?? 0}</span>
          <span>• Quiz aktif: {c.activeQuizzes ?? 0}</span>
          {typeof c.lastScore === "number" && (
            <span>• Nilai terakhir: {c.lastScore}</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <div className="flex-1">
            <ProgressBar value={c.progress ?? 0} />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">
            {c.progress ?? 0}%
          </span>
        </div>

        {c.nextSession && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays size={14} />
            <span>
              {dateLong(c.nextSession.dateISO)} • {c.nextSession.time}
            </span>
            <span>— {c.nextSession.title}</span>
          </div>
        )}

        <div className="mt-4 border-t pt-3">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3">
                <span className="text-sm text-muted-foreground">
                  Aksi cepat
                </span>
                <ChevronDown
                  size={18}
                  className="transition-transform data-[state=open]:rotate-180"
                />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              {z && (
                <div className="mt-3 rounded-lg border p-3 text-xs md:text-sm bg-card text-foreground/90">
                  <div className="flex items-center gap-2 font-medium">
                    <Info size={14} />
                    {z.topic} • {z.startAtLabel}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    ID: <span className="font-semibold">{z.meetingId}</span>
                    {" • "}Passcode:{" "}
                    <span className="font-semibold">{z.passcode}</span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {z && (
                  <a
                    href={z.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button size="sm" className="inline-flex gap-2">
                      <Video size={16} />
                      Masuk Kelas (Zoom)
                    </Button>
                  </a>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => go(`/menu-utama/my-class/${c.id}/kehadiran`)}
                  className="inline-flex gap-2"
                >
                  <Activity size={16} />
                  Kehadiran
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => go(`/menu-utama/my-class/${c.id}/materi`)}
                  className="inline-flex gap-2"
                >
                  <BookOpen size={16} />
                  Materi
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => go(`/menu-utama/my-class/${c.id}/tugas`)}
                  className="inline-flex gap-2"
                >
                  <FileText size={16} />
                  Tugas
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => go(`/menu-utama/my-class/${c.id}/quiz`)}
                  className="inline-flex gap-2"
                >
                  <ClipboardList size={16} />
                  Quiz
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => go(`/menu-utama/my-class/${c.id}/ujian`)}
                  className="inline-flex gap-2"
                >
                  <ClipboardList size={16} />
                  Ujian
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `${base}/kelas/${c.id}/score`)
                  }
                  className="inline-flex gap-2"
                >
                  <GraduationCap size={16} />
                  Nilai
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}

function LegacyCard({ c, base }: { c: EnrolledClass; base: string }) {
  const go = (path: string) => (window.location.href = `${base}${path}`);

  return (
    <Card className="p-0 overflow-hidden border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
          <span className="truncate">{c.name}</span>
          <Badge variant="outline" className="h-6">
            LEGACY
          </Badge>
          {c.room && (
            <Badge variant="outline" className="h-6">
              {c.room}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 md:px-5 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Wali Kelas: {c.homeroom}</span>
          <span>• Progres: {c.progress ?? 0}%</span>
          {typeof c.lastScore === "number" && (
            <span>• Nilai akhir: {c.lastScore}</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Clock size={14} className="text-muted-foreground" />
          <div className="flex-1">
            <ProgressBar value={c.progress ?? 0} />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">
            {c.progress ?? 0}%
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => go(`/menu-utama/my-class/${c.id}/materi`)}
            className="inline-flex gap-2"
          >
            <BookOpen size={16} />
            Materi (Arsip)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              (window.location.href = `${base}/kelas/${c.id}/score`)
            }
            className="inline-flex gap-2"
          >
            <GraduationCap size={16} />
            Nilai
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
