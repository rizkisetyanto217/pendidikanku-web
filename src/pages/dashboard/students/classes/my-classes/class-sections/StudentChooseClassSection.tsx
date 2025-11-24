// src/pages/sekolahislamku/pages/student/StudentSelectSectionFromEnrollment.tsx
import { useMemo, useState, useDeferredValue, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarDays,
  MapPin,
  UserSquare2,
  ArrowLeft,
  ChevronRight,
  Search,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import api from "@/lib/axios";

import type {
  StudentClassEnrollmentRow,
  ClassSectionRow,
} from "../StudentMyClass";

/* ==========================================================
   View Model (re-use dari TeacherClassFromSections)
========================================================== */
export type SectionRow = {
  id: string;
  schoolId: string;
  name: string;
  slug?: string;
  code?: string;
  roomName?: string;
  roomLocation?: string;
  homeroomName?: string;
  assistantName?: string;
  termName?: string;
  termYearLabel?: string;
  scheduleText?: string;
  totalStudents: number;
  isActive: boolean;
  createdAt?: string;
};

/* ==========================================================
   Filter logic (re-use)
========================================================== */
function useFilters(rows: SectionRow[]) {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [term, setTerm] = useState<string>("all");
  const [room, setRoom] = useState<string>("all");
  const [active, setActive] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "students" | "created">("name");

  const terms = useMemo<string[]>(
    () => [
      "all",
      ...Array.from(
        new Set(
          rows
            .map((r) => r.termName)
            .filter((x): x is string => typeof x === "string" && x.length > 0)
        )
      ),
    ],
    [rows]
  );

  const rooms = useMemo<string[]>(
    () => [
      "all",
      ...Array.from(
        new Set(
          rows
            .map((r) => r.roomName)
            .filter((x): x is string => typeof x === "string" && x.length > 0)
        )
      ),
    ],
    [rows]
  );

  const filtered = useMemo(() => {
    let list = rows;

    if (dq) {
      const qLower = dq.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(qLower) ||
          (r.homeroomName ?? "").toLowerCase().includes(qLower) ||
          (r.roomName ?? "").toLowerCase().includes(qLower)
      );
    }

    if (term !== "all") list = list.filter((r) => r.termName === term);
    if (room !== "all") list = list.filter((r) => r.roomName === room);
    if (active === "active") list = list.filter((r) => r.isActive);
    if (active === "inactive") list = list.filter((r) => !r.isActive);

    if (sortBy === "name")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "students")
      list = [...list].sort((a, b) => b.totalStudents - a.totalStudents);
    if (sortBy === "created")
      list = [...list].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
      );

    return list;
  }, [rows, dq, term, room, active, sortBy]);

  return {
    q,
    setQ,
    term,
    setTerm,
    terms,
    room,
    setRoom,
    rooms,
    active,
    setActive,
    sortBy,
    setSortBy,
    filtered,
  };
}

/* ==========================================================
   Section Card (sedikit diubah teksnya untuk murid)
========================================================== */
function SectionCard({
  s,
  onSelect,
  joining,
}: {
  s: SectionRow;
  onSelect: (sectionId: string) => void;
  joining?: boolean;
}) {
  return (
    <Card className="p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{s.name}</h3>
            <Badge
              variant={s.isActive ? "default" : "outline"}
              className="text-xs"
            >
              {s.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <UserSquare2 className="inline mr-1 h-4 w-4" />
            {s.homeroomName ?? "-"}
          </div>
        </div>

        <Badge variant="outline" className="shrink-0">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {s.roomName ?? "—"}
        </Badge>
      </div>

      {s.scheduleText && (
        <div className="mt-3 text-sm text-muted-foreground">
          <CalendarDays className="inline h-4 w-4 mr-1" />
          {s.scheduleText}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          <Users className="inline h-4 w-4 mr-1" />
          {s.totalStudents} siswa
        </div>
        <div className="text-muted-foreground truncate max-w-[60%] text-right">
          {s.termName ?? "-"}
        </div>
      </div>

      <div className="pt-4 text-right">
        <Button
          size="sm"
          className="inline-flex items-center"
          onClick={() => onSelect(s.id)}
          disabled={joining}
        >
          {joining ? "Menggabung..." : "Pilih Rombel Ini"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

/* ==========================================================
   Main Page — Student Class Sections (pakai data dari state)
========================================================== */

type LocationState = {
  enrollment: StudentClassEnrollmentRow;
  sections: ClassSectionRow[];
};

type Props = { showBack?: boolean; backTo?: string };

export default function StudentChooseClassSection({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setHeader } = useDashboardHeader();

  const { enrollment, sections } = (state ?? {}) as LocationState;

  const [joiningSectionId, setJoiningSectionId] = useState<string | null>(null);
  const [successSectionName, setSuccessSectionName] = useState<string | null>(
    null
  );

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  useEffect(() => {
    if (!enrollment) return;

    const className =
      enrollment.student_class_enrollments_class_name ||
      enrollment.student_class_enrollments_class_name_snapshot;

    setHeader?.({
      title: "Pilih Rombel",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya", href: "../" },
        { label: className || "Pilih Rombel" },
      ],
      showBack,
    });
  }, [enrollment, setHeader, showBack]);

  if (!enrollment || !sections) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="mx-auto max-w-5xl px-3 py-10 md:px-4 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Data rombel tidak tersedia.</span>
          </div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </main>
      </div>
    );
  }

  // mapping ClassSectionRow → SectionRow (tanpa API call)
  const rows: SectionRow[] = useMemo(
    () =>
      sections.map((it) => {
        const termName =
          it.class_section_academic_term_name_snapshot || undefined;
        const termYearLabel =
          it.class_section_academic_term_academic_year_snapshot || undefined;

        return {
          id: it.class_section_id,
          schoolId: "", // tidak tersedia di ClassSectionRow, ga dipakai di UI
          name: it.class_section_name,
          slug: it.class_section_slug,
          code: it.class_section_code ?? undefined,
          roomName: undefined, // kalau nanti ada snapshot ruangan bisa diisi
          roomLocation: undefined,
          homeroomName: undefined, // kalau nanti ada snapshot wali bisa diisi
          assistantName: undefined,
          termName,
          termYearLabel,
          scheduleText: undefined,
          totalStudents: it.class_section_total_students ?? 0,
          isActive: it.class_section_is_active ?? true,
          createdAt: undefined,
        };
      }),
    [sections]
  );

  const f = useFilters(rows);

  const className =
    enrollment.student_class_enrollments_class_name ||
    enrollment.student_class_enrollments_class_name_snapshot;
  const term = enrollment.student_class_enrollments_term_name_snapshot;
  const year = enrollment.student_class_enrollments_term_academic_year_snapshot;

  const handleSelectSection = async (sectionId: string) => {
    try {
      setJoiningSectionId(sectionId);

      const section = sections.find((s) => s.class_section_id === sectionId);
      const sectionName = section?.class_section_name ?? "Rombel";

      // 🔥 POST ke API join-section
      await api.post(
        `/u/class-enrollments/${enrollment.student_class_enrollments_id}/join-section`,
        {
          class_section_id: sectionId,
        }
      );

      setJoiningSectionId(null);
      setSuccessSectionName(sectionName);
    } catch (err: any) {
      console.error("Gagal join section:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal bergabung ke rombel.";
      alert(msg);
      setJoiningSectionId(null);
    }
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-3 md:px-4 py-6 md:py-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
            <div>
              <h1 className="text-lg font-semibold md:text-xl">
                Pilih Rombel untuk {className}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Angkatan {term} • {year}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={f.q}
              onChange={(e) => f.setQ(e.target.value)}
              placeholder="Cari nama rombel / wali / ruang…"
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={f.term} onValueChange={f.setTerm}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                {f.terms.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "Semua Tahun Ajaran" : t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={f.room} onValueChange={f.setRoom}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ruangan" />
              </SelectTrigger>
              <SelectContent>
                {f.rooms.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "all" ? "Semua Ruangan" : r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={f.active} onValueChange={f.setActive}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={f.sortBy}
              onValueChange={(v) => f.setSortBy(v as any)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama Kelas</SelectItem>
                <SelectItem value="students">Jumlah Siswa</SelectItem>
                <SelectItem value="created">Terbaru Dibuat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {f.filtered.length ? (
            f.filtered.map((s) => (
              <SectionCard
                key={s.id}
                s={s}
                onSelect={handleSelectSection}
                joining={joiningSectionId === s.id}
              />
            ))
          ) : (
            <Card className="col-span-2 p-10 text-center">
              Tidak ada rombel ditemukan.
            </Card>
          )}
        </div>
      </main>

      {/* Modal sukses join rombel */}
      <Dialog
        open={!!successSectionName}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessSectionName(null);
            handleBack();
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Berhasil bergabung ke rombel
            </DialogTitle>
            <DialogDescription>
              Kamu sekarang terdaftar di rombel{" "}
              <span className="font-semibold">{successSectionName}</span>.
              Silakan kembali ke halaman kelas untuk melihat detail rombel dan
              mata pelajaran.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessSectionName(null);
                handleBack();
              }}
            >
              Kembali ke Kelas Saya
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
