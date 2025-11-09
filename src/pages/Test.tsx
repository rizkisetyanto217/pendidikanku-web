// src/pages/kelas/DataKelasPage.tsx
"use client";

import * as React from "react";
import {
  ArrowLeft,
  Book,
  BookOpen,
  CalendarDays,
  Copy,
  FilePlus2,
  Layers,
  MoreHorizontal,
  Plus,
  Settings,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ======================================================
   Dummy Types & Data
   ====================================================== */

export type Parent = {
  id: string;
  name: string;
  code: string;
  level: number;
  active: boolean;
  stats?: {
    classes: number;
    sections: number;
    subjects: number;
    subjectBooks: number;
  };
};

export type ClassYear = {
  id: string;
  parentId: string;
  name: string;
  term: string;
  cohort?: string;
  quota?: number;
  filled?: number;
  sectionsCount?: number;
  active: boolean;
  createdAt: string;
};

export type ClassSubject = {
  id: string;
  parentId: string;
  subjectName: string;
  subjectCode?: string;
  hoursPerWeek?: number;
  minPassingScore?: number;
  weightOnReport?: number;
  isCore: boolean;
  weights?: {
    assignment?: number;
    quiz?: number;
    mid?: number;
    final?: number;
  };
  minAttendancePercent?: number;
  order?: number;
  active: boolean;
  booksCount?: number;
};

export type ClassSubjectBook = {
  id: string;
  classSubjectId: string;
  title: string;
  author?: string;
  year?: number;
  slug?: string;
  active: boolean;
};

// === Dummies ===
const DUMMY_PARENTS: Parent[] = [
  {
    id: "p1",
    name: "Tamhidi",
    code: "TMH",
    level: 1,
    active: true,
    stats: { classes: 3, sections: 8, subjects: 9, subjectBooks: 22 },
  },
  {
    id: "p2",
    name: "Ibtidaiyah",
    code: "IBT",
    level: 2,
    active: true,
    stats: { classes: 6, sections: 24, subjects: 11, subjectBooks: 30 },
  },
  {
    id: "p3",
    name: "Tsanawiyah",
    code: "TSN",
    level: 3,
    active: true,
    stats: { classes: 3, sections: 9, subjects: 12, subjectBooks: 28 },
  },
];

const DUMMY_CLASSES: ClassYear[] = [
  {
    id: "c1",
    parentId: "p1",
    name: "Tamhidi Tahun 2025 (Angkatan 1)",
    term: "2025/2026",
    cohort: "Angkatan 1",
    quota: 60,
    filled: 54,
    sectionsCount: 3,
    active: true,
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "c2",
    parentId: "p1",
    name: "Tamhidi Tahun 2026 (Angkatan 2)",
    term: "2026/2027",
    cohort: "Angkatan 2",
    quota: 60,
    filled: 0,
    sectionsCount: 0,
    active: true,
    createdAt: "2025-11-01T08:00:00Z",
  },
  {
    id: "c3",
    parentId: "p1",
    name: "Tamhidi Tahun 2024 (Angkatan 0)",
    term: "2024/2025",
    quota: 60,
    filled: 60,
    sectionsCount: 2,
    active: false,
    createdAt: "2024-01-10T08:00:00Z",
  },
];

const DUMMY_CLASS_SUBJECTS: ClassSubject[] = [
  {
    id: "cs1",
    parentId: "p1",
    subjectName: "Bahasa Indonesia",
    subjectCode: "BIN",
    hoursPerWeek: 4,
    minPassingScore: 70,
    weightOnReport: 25,
    isCore: true,
    weights: { assignment: 20, quiz: 20, mid: 30, final: 30 },
    minAttendancePercent: 80,
    order: 1,
    active: true,
    booksCount: 3,
  },
  {
    id: "cs2",
    parentId: "p1",
    subjectName: "Matematika",
    subjectCode: "MAT",
    hoursPerWeek: 5,
    minPassingScore: 75,
    weightOnReport: 30,
    isCore: true,
    weights: { assignment: 20, quiz: 20, mid: 25, final: 35 },
    minAttendancePercent: 80,
    order: 2,
    active: true,
    booksCount: 4,
  },
  {
    id: "cs3",
    parentId: "p1",
    subjectName: "Seni Budaya",
    subjectCode: "SEN",
    hoursPerWeek: 2,
    minPassingScore: 65,
    weightOnReport: 15,
    isCore: false,
    weights: { assignment: 30, quiz: 20, mid: 20, final: 30 },
    minAttendancePercent: 70,
    order: 3,
    active: true,
    booksCount: 1,
  },
];

const DUMMY_CLASS_SUBJECT_BOOKS: ClassSubjectBook[] = [
  {
    id: "b1",
    classSubjectId: "cs2",
    title: "Matematika Cerdas 1",
    author: "A. Prawira",
    year: 2023,
    slug: "mat-cerdas-1",
    active: true,
  },
  {
    id: "b2",
    classSubjectId: "cs2",
    title: "Matematika Kontekstual",
    author: "D. Wulandari",
    year: 2022,
    slug: "mat-kontekstual",
    active: true,
  },
  {
    id: "b3",
    classSubjectId: "cs1",
    title: "Bahasa Indonesia Aktif",
    author: "N. Sari",
    year: 2021,
    slug: "bin-aktif",
    active: true,
  },
];

/* ======================================================
   Helper Components
   ====================================================== */

function StatBadge({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
      <span className="font-semibold">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function ParentList({
  items,
  selectedId,
  onSelect,
}: {
  items: Parent[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((p) =>
      [p.name, p.code].some((s) => s.toLowerCase().includes(qq))
    );
  }, [q, items]);

  return (
    <Card className="h-full">
      <CardHeader className="flex gap-2">
        <CardTitle className="text-base">Tingkat Kelas</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tingkat…"
            className="h-9"
          />
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="max-h-[70vh] overflow-auto pr-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition hover:bg-muted",
                selectedId === p.id ? "ring-2 ring-primary" : ""
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Kode: {p.code} • Level {p.level}
                  </div>
                </div>
                <Badge variant={p.active ? "default" : "secondary"}>
                  {p.active ? "Aktif" : "Arsip"}
                </Badge>
              </div>
              {p.stats && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <StatBadge value={p.stats.classes} label="Kelas/Tahun" />
                  <StatBadge value={p.stats.sections} label="Kelas (A/B/C)" />
                  <StatBadge value={p.stats.subjects} label="Mapel" />
                  <StatBadge value={p.stats.subjectBooks} label="Buku Mapel" />
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-4 text-sm text-muted-foreground">
              Tidak ada tingkat ditemukan.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------ Tab: Kelas per Tahun ------------------ */
function TabKelasPerTahun({ parentId }: { parentId?: string }) {
  const [term, setTerm] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const data = React.useMemo(
    () =>
      DUMMY_CLASSES.filter((c) => (parentId ? c.parentId === parentId : true)),
    [parentId]
  );
  const filtered = React.useMemo(() => {
    let arr = data;
    if (term !== "all") arr = arr.filter((x) => x.term === term);
    if (q.trim())
      arr = arr.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    return [...arr].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [data, term, q]);

  const uniqueTerms = React.useMemo(
    () => Array.from(new Set(data.map((d) => d.term))),
    [data]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Kelas per Tahun</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-48"
            placeholder="Cari kelas…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {uniqueTerms.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Duplikasi ke Tahun Baru
          </Button>
          <Button size="sm">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Tambah Kelas Tahun
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Angkatan</TableHead>
              <TableHead>Kapasitas</TableHead>
              <TableHead>Terisi</TableHead>
              <TableHead>Jumlah Kelas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.term}</TableCell>
                <TableCell>{c.cohort ?? "-"}</TableCell>
                <TableCell>{c.quota ?? "-"}</TableCell>
                <TableCell>{c.filled ?? 0}</TableCell>
                <TableCell>{c.sectionsCount ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={c.active ? "default" : "secondary"}>
                    {c.active ? "Aktif" : "Arsip"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      Kelola Kelas
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-6 text-center text-muted-foreground"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ------------------ Tab: Mapel per Tingkat ------------------ */
function TabMapelPerTingkat({ parentId }: { parentId?: string }) {
  const [q, setQ] = React.useState("");
  const data = React.useMemo(
    () =>
      DUMMY_CLASS_SUBJECTS.filter((s) =>
        parentId ? s.parentId === parentId : true
      ),
    [parentId]
  );
  const filtered = React.useMemo(() => {
    let arr = data;
    if (q.trim())
      arr = arr.filter((x) =>
        x.subjectName.toLowerCase().includes(q.toLowerCase())
      );
    return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [data, q]);

  const [openSheetFor, setOpenSheetFor] = React.useState<string | null>(null);
  const openBooks = (classSubjectId: string) => setOpenSheetFor(classSubjectId);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Mapel per Tingkat</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            className="h-9 w-56"
            placeholder="Cari mapel…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Mapel
          </Button>
          <Button size="sm" variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Salin dari Tingkat…
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mapel</TableHead>
              <TableHead>Jam/Minggu</TableHead>
              <TableHead>KKM</TableHead>
              <TableHead>Bobot Rapor</TableHead>
              <TableHead>Core</TableHead>
              <TableHead>Kehadiran Min.</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Buku</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.subjectName}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.subjectCode}
                  </div>
                </TableCell>
                <TableCell>{s.hoursPerWeek ?? "-"}</TableCell>
                <TableCell>{s.minPassingScore ?? "-"}</TableCell>
                <TableCell>{s.weightOnReport ?? "-"}</TableCell>
                <TableCell>
                  {s.isCore ? (
                    <Badge>Wajib</Badge>
                  ) : (
                    <Badge variant="secondary">Pilihan</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {s.minAttendancePercent ? `${s.minAttendancePercent}%` : "-"}
                </TableCell>
                <TableCell>{s.order ?? "-"}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openBooks(s.id)}
                  >
                    <Book className="mr-2 h-4 w-4" /> {s.booksCount ?? 0} Buku
                  </Button>
                </TableCell>
                <TableCell>
                  <Badge variant={s.active ? "default" : "secondary"}>
                    {s.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-6 text-center text-muted-foreground"
                >
                  Belum ada mapel untuk tingkat ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Drawer Buku Mapel */}
      <BooksSheet
        openId={openSheetFor}
        onOpenChange={(id) => setOpenSheetFor(id)}
      />
    </Card>
  );
}

/* ------------------ Drawer: Buku Mapel (class_subject_books) ------------------ */
function BooksSheet({
  openId,
  onOpenChange,
}: {
  openId: string | null;
  onOpenChange: (id: string | null) => void;
}) {
  const books = React.useMemo(
    () => DUMMY_CLASS_SUBJECT_BOOKS.filter((b) => b.classSubjectId === openId),
    [openId]
  );
  const subject = React.useMemo(
    () => DUMMY_CLASS_SUBJECTS.find((s) => s.id === openId),
    [openId]
  );
  const open = Boolean(openId);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onOpenChange(null)}>
      <SheetContent
        side="right"
        className="w-[90vw] sm:w-[600px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Buku Mapel</SheetTitle>
          <SheetDescription>
            {subject ? (
              <div className="text-sm">
                Untuk mapel:{" "}
                <span className="font-medium">{subject.subjectName}</span>
              </div>
            ) : (
              <span className="text-sm">Pilih mapel untuk melihat buku.</span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Input placeholder="Cari buku…" className="h-9" />
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Buku
          </Button>
        </div>

        <Separator className="my-4" />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{b.author ?? "-"}</TableCell>
                <TableCell>{b.year ?? "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {b.slug ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={b.active ? "default" : "secondary"}>
                    {b.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {books.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-muted-foreground"
                >
                  Belum ada buku untuk mapel ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </SheetContent>
    </Sheet>
  );
}

/* ======================================================
   Main Page Component
   ====================================================== */
export default function DataKelasPage() {
  const [selectedParentId, setSelectedParentId] = React.useState<string>(
    DUMMY_PARENTS[0]?.id
  );
  const [activeTab, setActiveTab] = React.useState<string>("kelas-tahun");

  const selectedParent = React.useMemo(
    () => DUMMY_PARENTS.find((p) => p.id === selectedParentId),
    [selectedParentId]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Kembali">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Data Kelas</h1>
            <p className="text-sm text-muted-foreground">
              Kelola tingkat, kelas per tahun, dan mapel per tingkat.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-48">
              <SelectValue placeholder="Sekolah aktif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sekolah Utama</SelectItem>
              <SelectItem value="s2">Sekolah Cabang 2</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan
          </Button>
        </div>
      </div>

      {/* Grid 2-panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        {/* Left: Parent list */}
        <ParentList
          items={DUMMY_PARENTS}
          selectedId={selectedParentId}
          onSelect={setSelectedParentId}
        />

        {/* Right: Tabs */}
        <div className="space-y-4">
          {/* Context bar */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 py-3 text-sm">
              <div>
                <span className="text-muted-foreground">Tingkat terpilih:</span>{" "}
                <span className="font-medium">{selectedParent?.name}</span>{" "}
                <Badge variant="secondary" className="ml-2">
                  Kode {selectedParent?.code}
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="text-muted-foreground">
                  Total Kelas/Tahun:
                </span>
                <span className="font-medium">
                  {selectedParent?.stats?.classes ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="text-muted-foreground">Kelas (A/B/C):</span>
                <span className="font-medium">
                  {selectedParent?.stats?.sections ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-muted-foreground">Mapel:</span>
                <span className="font-medium">
                  {selectedParent?.stats?.subjects ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="kelas-tahun">Kelas per Tahun</TabsTrigger>
              <TabsTrigger value="mapel-tingkat">Mapel per Tingkat</TabsTrigger>
            </TabsList>

            <TabsContent value="kelas-tahun" className="space-y-4">
              <TabKelasPerTahun parentId={selectedParentId} />
            </TabsContent>

            <TabsContent value="mapel-tingkat" className="space-y-4">
              <TabMapelPerTingkat parentId={selectedParentId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
