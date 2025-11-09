// src/pages/sekolahislamku/pages/student/StudentAssignment.tsx
import React, { useMemo, useState } from "react";
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
} from "lucide-react";

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

  const [list, setList] = useState<Assignment[]>(DUMMY_ALL);

  // search & filter
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AssignmentStatus>("belum"); // default seperti sebelumnya

  const isOverdue = (a: Assignment) =>
    new Date(a.dueAt).getTime() < Date.now() && a.status === "belum";

  const bySubject = useMemo(
    () =>
      list.filter((a) =>
        subjectFilter === "all" ? true : a.subject === subjectFilter
      ),
    [list, subjectFilter]
  );

  const counts = useMemo(() => {
    const total = bySubject.length;
    const belum = bySubject.filter((x) => x.status === "belum").length;
    const terkumpul = bySubject.filter((x) => x.status === "terkumpul").length;
    const dinilai = bySubject.filter((x) => x.status === "dinilai").length;
    return { total, belum, terkumpul, dinilai };
  }, [bySubject]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return bySubject
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter(
        (a) =>
          !key ||
          a.title.toLowerCase().includes(key) ||
          (a.description ?? "").toLowerCase().includes(key)
      )
      .sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));
  }, [bySubject, q, status]);

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
      a.attachmentName ? `Lampiran: ${a.attachmentName}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    alert(detail);
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col gap-6">
          {/* Title */}
          <div className="hidden md:flex items-center gap-3">
            <h1 className="text-lg font-semibold">Daftar Tugas</h1>
          </div>

          {/* Ringkasan */}
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
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardContent className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Cari */}
              <div className="relative">
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

              {/* Filter mapel */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select
                  value={subjectFilter}
                  onValueChange={(v: "all" | Assignment["subject"]) =>
                    setSubjectFilter(v)
                  }
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua mapel</SelectItem>
                    <SelectItem value="tahsin">Tahsin</SelectItem>
                    <SelectItem value="tahfidz">Tahfidz</SelectItem>
                    <SelectItem value="fiqih">Fiqih</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* List tugas */}
          <div className="grid gap-3">
            {filtered.map((a) => (
              <Card key={a.id} className="overflow-hidden">
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
                        ) : isOverdue(a) ? (
                          <Badge
                            variant="outline"
                            className="h-6 border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/30"
                          >
                            Terlambat
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="h-6">
                            Belum
                          </Badge>
                        )}

                        {/* Nilai */}
                        {typeof a.grade === "number" && (
                          <Badge
                            variant="outline"
                            className="h-6 border-sky-200 text-sky-800 bg-sky-50 dark:border-sky-800 dark:text-sky-300 dark:bg-sky-900/30"
                          >
                            Nilai: {a.grade}
                          </Badge>
                        )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(a)}
                    >
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
            ))}

            {filtered.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-center text-muted-foreground">
                  Tidak ada tugas yang cocok.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAssignment;
