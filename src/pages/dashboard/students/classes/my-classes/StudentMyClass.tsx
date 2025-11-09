// src/pages/sekolahislamku/pages/student/MyClass.tsx
import React, { useMemo, useState } from "react";
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
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

/* ===== Dummy data kelas ===== */
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
};

const ENROLLED: EnrolledClass[] = [
  {
    id: "tahsin",
    name: "Tahsin",
    room: "Aula 1",
    homeroom: "Ustadz Abdullah",
    nextSession: {
      dateISO: new Date().toISOString(),
      time: "07:30",
      title: "Tahsin — Tajwid & Makhraj",
    },
    progress: 68,
    pendingAssignments: 2,
    activeQuizzes: 1,
    lastScore: 88,
  },
  {
    id: "tahfidz",
    name: "Tahfidz",
    room: "R. Tahfiz",
    homeroom: "Ustadz Salman",
    nextSession: {
      dateISO: new Date(Date.now() + 864e5).toISOString(),
      time: "09:30",
      title: "Hafalan Juz 30",
    },
    progress: 42,
    pendingAssignments: 1,
    activeQuizzes: 0,
    lastScore: 92,
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

const StudentMyClass: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const base = `/${slug}/murid`;

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

  const go = (path: string) => navigate(`${base}${path}`);

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Content */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back + title */}
            <div className="md:flex hidden gap-3 items-center">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-lg font-semibold">Daftar Kelas</h1>
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

            {/* List kelas */}
            <div className="grid gap-3">
              {list.map((c) => {
                const z = ZOOM_INFO[c.id];
                return (
                  <Card key={c.id} className="p-0 overflow-hidden">
                    {/* Body */}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
                        <span className="truncate">{c.name}</span>
                        {c.room && (
                          <Badge variant="outline" className="h-6">
                            {c.room}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 md:px-5 pb-4">
                      {/* meta */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>Wali Kelas: {c.homeroom}</span>
                        <span>• Progres: {c.progress ?? 0}%</span>
                        <span>
                          • Tugas menunggu: {c.pendingAssignments ?? 0}
                        </span>
                        <span>• Quiz aktif: {c.activeQuizzes ?? 0}</span>
                        {typeof c.lastScore === "number" && (
                          <span>• Nilai terakhir: {c.lastScore}</span>
                        )}
                      </div>

                      {/* sesi berikutnya */}
                      {c.nextSession && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays size={14} />
                          <span>
                            {dateLong(c.nextSession.dateISO)} •{" "}
                            {c.nextSession.time}
                          </span>
                          <span>— {c.nextSession.title}</span>
                        </div>
                      )}

                      {/* Aksi cepat - Collapsible */}
                      <div className="mt-4 border-t pt-3">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between px-3"
                            >
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
                            {/* optional info zoom ringkas */}
                            {z && (
                              <div className="mt-3 rounded-lg border p-3 text-xs md:text-sm bg-card text-foreground/90">
                                <div className="flex items-center gap-2 font-medium">
                                  <Info size={14} />
                                  {z.topic} • {z.startAtLabel}
                                </div>
                                <div className="mt-1 text-muted-foreground">
                                  ID:{" "}
                                  <span className="font-semibold">
                                    {z.meetingId}
                                  </span>
                                  {" • "}Passcode:{" "}
                                  <span className="font-semibold">
                                    {z.passcode}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                              {/* Zoom button */}
                              {z && (
                                <a
                                  href={z.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0"
                                >
                                  <Button
                                    size="sm"
                                    className="inline-flex gap-2"
                                  >
                                    <Video size={16} />
                                    Masuk Kelas (Zoom)
                                  </Button>
                                </a>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  go(`/menu-utama/my-class/${c.id}/kehadiran`)
                                }
                                className="inline-flex gap-2"
                              >
                                <Activity size={16} />
                                Kehadiran
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  go(`/menu-utama/my-class/${c.id}/materi`)
                                }
                                className="inline-flex gap-2"
                              >
                                <BookOpen size={16} />
                                Materi
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  go(`/menu-utama/my-class/${c.id}/tugas`)
                                }
                                className="inline-flex gap-2"
                              >
                                <FileText size={16} />
                                Tugas
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  go(`/menu-utama/my-class/${c.id}/quiz`)
                                }
                                className="inline-flex gap-2"
                              >
                                <ClipboardList size={16} />
                                Quiz
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  go(`/menu-utama/my-class/${c.id}/ujian`)
                                }
                                className="inline-flex gap-2"
                              >
                                <ClipboardList size={16} />
                                Ujian
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => go(`/kelas/${c.id}/score`)}
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
              })}

              {list.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-sm text-center text-muted-foreground">
                    Belum ada kelas yang diikuti.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentMyClass;
