// src/pages/sekolahislamku/teacher/AssignmentClass.shadcn.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronRight,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  QK,
  fetchAssignmentsByClass,
  type Assignment,
  type AssignmentStatus,
} from "@/pages/dashboard/teacher/class/types/assignments";

import ModalEditAssignmentClass, {
  type EditAssignmentPayload,
} from "@/pages/dashboard/teacher/class/asssigment/components/CTeacherModalEditAssignmentClass";
import ModalAddAssignmentClass, {
  type AddAssignmentClassPayload,
} from "@/pages/dashboard/teacher/class/asssigment/components/CTeacherModalAddAssignmentClass";

/* ========= Dummy teacher classes ========= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};
type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
  const now = new Date();
  const mk = (d: Date, addDay = 0) => {
    const x = new Date(d);
    x.setDate(x.getDate() + addDay);
    return x.toISOString();
  };
  return Promise.resolve([
    {
      id: "tpa-a",
      name: "TPA A",
      room: "Aula 1",
      homeroom: "Ustadz Abdullah",
      assistants: ["Ustadzah Amina"],
      studentsCount: 22,
      todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 0),
        time: "07:30",
        title: "Tahsin — Tajwid & Makhraj",
        room: "Aula 1",
      },
      materialsCount: 12,
      assignmentsCount: 4,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
    {
      id: "tpa-b",
      name: "TPA B",
      room: "R. Tahfiz",
      homeroom: "Ustadz Salman",
      assistants: ["Ustadzah Maryam"],
      studentsCount: 20,
      todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
      nextSession: {
        dateISO: mk(now, 1),
        time: "09:30",
        title: "Hafalan Juz 30",
        room: "R. Tahfiz",
      },
      materialsCount: 9,
      assignmentsCount: 3,
      academicTerm: "2025/2026 — Ganjil",
      cohortYear: 2025,
    },
  ]);
}

/* ========= Helpers ========= */
const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};
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

/* ========= Page ========= */
export default function AssignmentClassShadcn() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // kelas
  const { data: classes = [] } = useQuery({
    queryKey: QK.CLASSES,
    queryFn: fetchTeacherClasses,
    staleTime: 5 * 60_000,
  });
  const cls = useMemo(() => classes.find((c) => c.id === id), [classes, id]);

  // assignments
  const { data: assignments = [], isFetching } = useQuery({
    queryKey: QK.ASSIGNMENTS(id),
    queryFn: () => fetchAssignmentsByClass(id),
    enabled: !!id,
    staleTime: 2 * 60_000,
  });

  // filter & search
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AssignmentStatus>("all");

  const filtered = useMemo(() => {
    let list = assignments;
    if (status !== "all") list = list.filter((a) => a.status === status);
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(qq) ||
          (a.description ?? "").toLowerCase().includes(qq)
      );
    }
    return [...list].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
  }, [assignments, q, status]);

  const todayISO = toLocalNoonISO(new Date());

  /* ========= Modal state ========= */
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  // state untuk AlertDialog hapus
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  const onEdit = (a: Assignment) => {
    setEditing(a);
    setOpenEdit(true);
  };

  const editDefaults = useMemo(() => {
    if (!editing) return undefined;
    return {
      title: editing.title,
      dueDate: editing.dueDate,
      total: editing.totalSubmissions ?? 0,
      submitted: editing.totalSubmissions,
    };
  }, [editing]);

  const handleEditSubmit = (payload: EditAssignmentPayload) => {
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) =>
      old.map((a) =>
        a.id !== editing?.id
          ? a
          : {
              ...a,
              title: payload.title.trim(),
              dueDate: payload.dueDate || a.dueDate,
              totalSubmissions:
                payload.submitted ?? payload.total ?? a.totalSubmissions,
            }
      )
    );
    setOpenEdit(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) =>
      old.filter((x) => x.id !== targetId)
    );
    setDeleteTarget(null);
  };

  const handleAddSubmit = (payload: AddAssignmentClassPayload) => {
    const nowISO = new Date().toISOString();
    const newItem: Assignment = {
      id: `a-${Date.now()}`,
      title: payload.title,
      description: "",
      createdAt: nowISO,
      dueDate: payload.dueDate,
      status: "draft",
      totalSubmissions: payload.total ?? 0,
      graded: 0,
      attachments: [],
      author: cls?.homeroom ?? "Guru",
    };
    qc.setQueryData<Assignment[]>(QK.ASSIGNMENTS(id), (old = []) => [
      newItem,
      ...old,
    ]);
    setOpenAdd(false);
  };

  return (
    <div className="w-full">
      {/* Top actions */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <div className="w-full flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">
            {cls ? `Tugas: ${cls.name}` : "Tugas Kelas"}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenAdd(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tugas
            </Button>
            <div className="text-sm text-muted-foreground">
              {new Date(todayISO).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalEditAssignmentClass
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        defaultValues={editDefaults}
        onSubmit={handleEditSubmit}
      />
      <ModalAddAssignmentClass
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
      />

      {/* AlertDialog Hapus */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus tugas?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” akan dihapus dan tidak dapat dikembalikan.`
                : "Tugas akan dihapus."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full-width content */}
      <main className="w-full px-4 md:px-6 pb-8 md:py-8">
        <div className="w-full space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="sr-only">
                  Cari tugas
                </Label>
                <div className="flex items-center gap-3 h-10 rounded-md border px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tugas…"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="sr-only">Filter status</Label>
                <div className="flex items-center gap-3 h-10">
                  <div className="h-10 aspect-square grid place-items-center rounded-md border">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as any)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="terbit">Terbit</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List tugas */}
          <div className="grid gap-4">
            {isFetching && filtered.length === 0 && (
              <Card>
                <CardContent className="p-8">
                  <div className="text-sm text-muted-foreground text-center">
                    Memuat tugas…
                  </div>
                </CardContent>
              </Card>
            )}

            {filtered.map((a) => {
              const dueBadge = a.dueDate
                ? new Date(a.dueDate).toDateString() ===
                  new Date().toDateString()
                  ? "Hari ini"
                  : dateShort(a.dueDate)
                : null;

              const statusVariant =
                a.status === "terbit"
                  ? "default"
                  : a.status === "draft"
                  ? "secondary"
                  : "outline";

              return (
                <Card key={a.id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          {a.title}
                        </CardTitle>
                        {a.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {a.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant as any} className="h-6">
                          {a.status.toUpperCase()}
                        </Badge>
                        {dueBadge && (
                          <Badge variant="outline" className="h-6">
                            tempo: {dueBadge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Dibuat: {dateLong(a.createdAt)}</span>
                      </div>
                      {a.author && <span>• Oleh {a.author}</span>}
                      {(a.totalSubmissions ?? 0) > 0 && (
                        <span>• {a.totalSubmissions} pengumpulan</span>
                      )}
                      {a.attachments?.length ? (
                        <span>• {a.attachments.length} lampiran</span>
                      ) : null}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Aksi cepat untuk tugas ini
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          window.alert("Unduh belum diimplementasikan")
                        }
                      >
                        <Download className="h-4 w-4" />
                        Unduh
                      </Button>

                      <Link to={`../assignment/${a.id}`} relative="path">
                        <Button size="sm" className="gap-2">
                          Buka
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button size="sm" onClick={() => onEdit(a)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(a)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}

            {filtered.length === 0 && !isFetching && (
              <Alert>
                <AlertDescription>
                  Belum ada tugas untuk kelas ini.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
