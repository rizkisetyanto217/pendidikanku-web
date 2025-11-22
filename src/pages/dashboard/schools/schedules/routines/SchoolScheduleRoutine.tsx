// src/pages/sekolahislamku/admin/AdminSchedule.tsx
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  Filter,
  Download,
  Upload,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";

/* ✅ Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

import EditScheduleDialog from "@/pages/dashboard/components/calender/components/EditSchedule";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

/* =====================================================
   Tipe & Dummy Data Model (Admin pegang semua kelas)
===================================================== */
type RoutineDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type RoutineItem = {
  id: string;
  weekday: RoutineDay;
  time: string; // "HH:mm"
  durationMin?: number;
  title: string;
  classId?: string; // gunakan id untuk filter scalable
  className?: string;
  room?: string;
  teacherId?: string;
  teacher?: string;
  active?: boolean;
  note?: string;
  type?: "class" | "exam" | "event";
};

type ClassLite = { id: string; name: string; grade?: string };
type TeacherLite = { id: string; name: string };

const weekdayShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const routineStore: RoutineItem[] = [];
const onceStore: ScheduleRow[] = [];

const classesStore: ClassLite[] = [
  { id: "c-1a", name: "1A", grade: "1" },
  { id: "c-1b", name: "1B", grade: "1" },
  { id: "c-3c", name: "3C", grade: "3" },
  { id: "c-6b", name: "6B", grade: "6" },
];

const teachersStore: TeacherLite[] = [
  { id: "t-ahmad", name: "Ust. Ahmad" },
  { id: "t-budi", name: "Pak Budi" },
  { id: "t-citra", name: "Bu Citra" },
];

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* =====================================================
   Dummy API untuk Admin (semua kelas)
===================================================== */
const routineApi = {
  async list(): Promise<RoutineItem[]> {
    await delay();
    if (routineStore.length === 0) {
      routineStore.push(
        {
          id: uid(),
          weekday: 1,
          time: "07:00",
          durationMin: 90,
          title: "Tahsin Al-Qur'an",
          classId: "c-1a",
          className: "1A",
          room: "Aula 1",
          teacherId: "t-ahmad",
          teacher: "Ust. Ahmad",
          active: true,
          type: "class",
        },
        {
          id: uid(),
          weekday: 3,
          time: "09:30",
          durationMin: 60,
          title: "Matematika",
          classId: "c-3c",
          className: "3C",
          room: "Ruang 3B",
          teacherId: "t-budi",
          teacher: "Pak Budi",
          active: true,
          type: "class",
        },
        {
          id: uid(),
          weekday: 5,
          time: "10:00",
          durationMin: 120,
          title: "Tryout Ujian Akhir",
          classId: "c-6b",
          className: "6B",
          room: "Aula Utama",
          teacherId: "t-citra",
          teacher: "Bu Citra",
          active: true,
          type: "exam",
        }
      );
    }
    return structuredClone(routineStore);
  },
  async create(payload: Omit<RoutineItem, "id">) {
    await delay();
    const row: RoutineItem = { id: uid(), ...payload };
    routineStore.push(row);
    return structuredClone(row);
  },
  async update(payload: RoutineItem) {
    await delay();
    const idx = routineStore.findIndex((x) => x.id === payload.id);
    if (idx >= 0) routineStore[idx] = payload;
    return structuredClone(payload);
  },
  async removeMany(ids: string[]) {
    await delay();
    ids.forEach((id) => {
      const idx = routineStore.findIndex((x) => x.id === id);
      if (idx >= 0) routineStore.splice(idx, 1);
    });
  },
};

const onceApi = {
  async list(): Promise<ScheduleRow[]> {
    await delay();
    if (onceStore.length === 0) {
      const now = new Date();
      const mk = (plusDays: number, p: Partial<ScheduleRow>): ScheduleRow => ({
        id: uid(),
        title: "Acara Sekolah",
        date: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + plusDays,
          9,
          0
        ).toISOString(),
        time: "09:00",
        room: "Aula Utama",
        teacher: "Panitia",
        type: "event",
        description: "Kegiatan insidental sekolah",
        ...p,
      });
      onceStore.push(
        mk(2, { title: "Rapat Orang Tua (1A,1B)", type: "event" }),
        mk(6, { title: "Ujian Tengah Semester 3C", type: "exam" }),
        mk(12, { title: "Seminar Tamu Literasi", type: "event" }),
        mk(14, { title: "Tryout 6B", type: "exam" })
      );
    }
    return structuredClone(onceStore).sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );
  },
  async create(payload: Omit<ScheduleRow, "id">) {
    await delay();
    const row = { id: uid(), ...payload };
    onceStore.push(row);
    return structuredClone(row);
  },
  async update(payload: ScheduleRow) {
    await delay();
    const idx = onceStore.findIndex((x) => x.id === payload.id);
    if (idx >= 0) onceStore[idx] = payload;
    return structuredClone(payload);
  },
  async removeMany(ids: string[]) {
    await delay();
    ids.forEach((id) => {
      const idx = onceStore.findIndex((x) => x.id === id);
      if (idx >= 0) onceStore.splice(idx, 1);
    });
  },
};

/* =====================================================
   Dialog Rutin (Admin punya field Kelas & Guru)
===================================================== */
function EditRoutineDialog({
  value,
  onClose,
  onSubmit,
}: {
  value: RoutineItem;
  onClose: () => void;
  onSubmit: (v: RoutineItem) => void;
}) {
  const [draft, setDraft] = useState<RoutineItem>(value);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {value.id ? "Edit Jadwal Rutin" : "Tambah Jadwal Rutin"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Hari</div>
            <Select
              value={String(draft.weekday)}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, weekday: Number(v) as RoutineDay }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih hari" />
              </SelectTrigger>
              <SelectContent>
                {weekdayShort.map((w, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Jam Mulai</div>
            <Input
              type="time"
              value={draft.time}
              onChange={(e) =>
                setDraft((d) => ({ ...d, time: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Durasi (menit)</div>
            <Input
              type="number"
              min={0}
              value={draft.durationMin ?? 0}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  durationMin: Number(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Tipe</div>
            <Select
              value={draft.type ?? "class"}
              onValueChange={(v: "class" | "exam" | "event") =>
                setDraft((d) => ({ ...d, type: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">class</SelectItem>
                <SelectItem value="exam">exam</SelectItem>
                <SelectItem value="event">event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="text-xs text-muted-foreground">Judul</div>
            <Input
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              placeholder="Contoh: Tahsin Al-Qur'an"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Kelas</div>
            <Select
              value={draft.classId ?? ""}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  classId: v,
                  className: classesStore.find((c) => c.id === v)?.name,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classesStore.map((c) => (
                  <SelectItem value={c.id} key={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Guru</div>
            <Select
              value={draft.teacherId ?? ""}
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  teacherId: v,
                  teacher: teachersStore.find((t) => t.id === v)?.name,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih guru" />
              </SelectTrigger>
              <SelectContent>
                {teachersStore.map((t) => (
                  <SelectItem value={t.id} key={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Ruang</div>
            <Input
              value={draft.room ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, room: e.target.value }))
              }
              placeholder="Aula 1 / Ruang 3B"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Aktif?</div>
            <div className="h-10 px-3 inline-flex items-center gap-2 rounded-md border">
              <Checkbox
                checked={draft.active ?? true}
                onCheckedChange={(v) =>
                  setDraft((d) => ({ ...d, active: Boolean(v) }))
                }
                id="active"
              />
              <label htmlFor="active" className="text-sm">
                Ditampilkan di kalender
              </label>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <div className="text-xs text-muted-foreground">Catatan</div>
            <Input
              value={draft.note ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, note: e.target.value }))
              }
              placeholder="Opsional"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (!draft.title.trim()) return;
              onSubmit(draft);
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =====================================================
   Toolbar Filter (Admin)
===================================================== */
function FilterBar({
  classId,
  setClassId,
  teacherId,
  setTeacherId,
  type,
  setType,
  from,
  setFrom,
  to,
  setTo,
  view,
  setView,
  onReset,
}: {
  classId?: string;
  setClassId: (v?: string) => void;
  teacherId?: string;
  setTeacherId: (v?: string) => void;
  type?: "all" | "class" | "exam" | "event";
  setType: (v: "all" | "class" | "exam" | "event") => void;
  from?: string;
  setFrom: (v?: string) => void;
  to?: string;
  setTo: (v?: string) => void;
  view: "calendar" | "list";
  setView: (v: "calendar" | "list") => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border p-3 sm:p-4 bg-card text-card-foreground space-y-3">
      {/* Bar atas: title + (optional) toggle view di mobile */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm font-medium">
          <Filter size={16} />
          <span>Filter</span>
        </div>

        {/* Toggle view icon-only di mobile (opsional) */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            size="icon"
            variant={view === "calendar" ? "secondary" : "ghost"}
            onClick={() => setView("calendar")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={view === "list" ? "secondary" : "ghost"}
            onClick={() => setView("list")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid filter utama: full width di mobile, rapet di desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <Select
          value={classId ?? "all"}
          onValueChange={(v) => setClassId(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classesStore.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={teacherId ?? "all"}
          onValueChange={(v) => setTeacherId(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Guru" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Guru</SelectItem>
            {teachersStore.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type ?? "all"} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="class">class</SelectItem>
            <SelectItem value="exam">exam</SelectItem>
            <SelectItem value="event">event</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            type="date"
            value={from ?? ""}
            onChange={(e) => setFrom(e.target.value || undefined)}
            className="w-full"
          />
          <span className="hidden sm:inline text-sm text-muted-foreground">
            s/d
          </span>
          <Input
            type="date"
            value={to ?? ""}
            onChange={(e) => setTo(e.target.value || undefined)}
            className="w-full"
          />
        </div>
      </div>

      {/* Bar bawah: Reset + view toggle versi full button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button
          variant={view === "calendar" ? "secondary" : "ghost"}
          onClick={() => setView("calendar")}
          className="w-full sm:w-auto"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Kalender
        </Button>
        <Button
          variant={view === "list" ? "secondary" : "ghost"}
          onClick={() => setView("list")}
          className="w-full sm:w-auto"
        >
          <ListIcon className="mr-2 h-4 w-4" />
          List
        </Button>
      </div>
    </div>
  );
}

/* =====================================================
   Komponen Ringkas: Stats Bar
===================================================== */
function QuickStats({
  routines,
  onces,
}: {
  routines: RoutineItem[];
  onces: ScheduleRow[];
}) {
  const stats = useMemo(() => {
    const rActive = routines.filter((r) => r.active !== false).length;
    const rExam = routines.filter((r) => r.type === "exam").length;
    const oExam = onces.filter((o) => o.type === "exam").length;
    return [
      { label: "Rutin Aktif", value: rActive },
      { label: "Rutin (Exam)", value: rExam },
      { label: "Sekali (Exam)", value: oExam },
      { label: "Total One-Off", value: onces.length },
    ];
  }, [routines, onces]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border bg-card p-3 flex flex-col gap-1"
        >
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className="text-xl font-semibold">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   List & Board untuk Admin
===================================================== */
function RoutineBoardAdmin({
  data,
  checked,
  setChecked,
  onAdd,
  onEdit,
  onBulkDelete,
  deleting,
}: {
  data: RoutineItem[];
  checked: Record<string, boolean>;
  setChecked: (
    fn: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  onAdd: (preset?: Partial<RoutineItem>) => void;
  onEdit: (item: RoutineItem) => void;
  onBulkDelete: (ids: string[]) => void;
  deleting?: boolean;
}) {
  const grouped = useMemo(() => {
    const map: Record<RoutineDay, RoutineItem[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    data.forEach((d) => map[d.weekday].push(d));
    (Object.keys(map) as unknown as RoutineDay[]).forEach((k) =>
      map[k].sort((a, b) =>
        `${a.time}-${a.className}`.localeCompare(`${b.time}-${b.className}`)
      )
    );
    return map;
  }, [data]);

  const todayIdx = new Date().getDay() as RoutineDay;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button onClick={() => onAdd({})}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Rutin
        </Button>
        <Button
          variant="destructive"
          disabled={
            deleting ||
            Object.keys(checked).filter((k) => checked[k]).length === 0
          }
          onClick={() =>
            onBulkDelete(Object.keys(checked).filter((k) => checked[k]))
          }
        >
          <Trash2 className="mr-2 h-4 w-4" /> Hapus Terpilih
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.keys(grouped) as unknown as RoutineDay[]).map((d) => {
          const list = grouped[d];
          if (list.length === 0) return null;
          const isToday = d === todayIdx;
          return (
            <div
              key={d}
              className={[
                "rounded-xl border bg-card text-card-foreground",
                isToday ? "ring-2 ring-primary/40 bg-primary/5" : "",
              ].join(" ")}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="font-medium">{weekdayShort[d]}</div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onAdd({ weekday: d })}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <Separator />
              <div className="p-2 space-y-2">
                {list.map((it) => {
                  const isChecked = checked[it.id];
                  return (
                    <div
                      key={it.id}
                      className={[
                        "rounded-lg border p-2 bg-background",
                        it.active === false ? "opacity-60" : "",
                        isToday ? "border-primary/50" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={Boolean(isChecked)}
                          onCheckedChange={(v) =>
                            setChecked((prev) => ({
                              ...prev,
                              [it.id]: Boolean(v),
                            }))
                          }
                        />
                        <Badge variant="secondary" className="gap-1">
                          <Clock size={12} />
                          {it.time}
                          {it.durationMin ? ` • ${it.durationMin}m` : null}
                        </Badge>
                        {it.type ? (
                          <Badge variant="outline" className="capitalize">
                            {it.type}
                          </Badge>
                        ) : null}
                        <div className="ml-auto flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(it)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1 font-medium">{it.title}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                        {it.className ? (
                          <span className="inline-flex items-center gap-1">
                            <Users size={12} />
                            {it.className}
                          </span>
                        ) : null}
                        {it.room ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {it.room}
                          </span>
                        ) : null}
                        {it.teacher ? <span>• {it.teacher}</span> : null}
                        {it.note ? <span>• {it.note}</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OnceListAdmin({
  data,
  checked,
  setChecked,
  onAdd,
  onEdit,
  onBulkDelete,
  deleting,
}: {
  data: ScheduleRow[];
  checked: Record<string, boolean>;
  setChecked: (
    fn: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  onAdd: () => void;
  onEdit: (row: ScheduleRow) => void;
  onBulkDelete: (ids: string[]) => void;
  deleting?: boolean;
}) {
  return (
    <div className="rounded-xl border">
      <div className="p-3 flex items-center gap-2">
        <div className="font-semibold">Jadwal Sekali / Acara</div>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" /> Tambah
          </Button>
          <Button
            variant="destructive"
            disabled={
              deleting ||
              Object.keys(checked).filter((k) => checked[k]).length === 0
            }
            onClick={() =>
              onBulkDelete(Object.keys(checked).filter((k) => checked[k]))
            }
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus Terpilih
          </Button>
        </div>
      </div>
      <Separator />
      <div className="p-3 space-y-2">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada data</div>
        ) : (
          data.map((r) => (
            <div key={r.id} className="rounded-lg border p-3 bg-background">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={Boolean(checked[r.id])}
                  onCheckedChange={(v) =>
                    setChecked((prev) => ({ ...prev, [r.id]: Boolean(v) }))
                  }
                />
                <Badge variant="secondary" className="capitalize">
                  {r.type ?? "event"}
                </Badge>
                <div className="font-medium">{r.title}</div>
                <div className="ml-auto flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(r)}>
                    <Edit size={16} />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {new Date(r.date).toLocaleString("id-ID")}
                </span>
                {r.room ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} /> {r.room}
                  </span>
                ) : null}
              </div>
              {r.description ? (
                <div className="text-sm mt-2">{r.description}</div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =====================================================
   View Kalender Sederhana (grid mingguan)
   Catatan: placeholder; integrasikan dengan CalendarView kamu jika perlu.
===================================================== */
function SimpleWeekCalendar({
  routines,
  onces,
  onClickItem,
}: {
  routines: RoutineItem[];
  onces: ScheduleRow[];
  onClickItem: (payload: { kind: "routine" | "once"; id: string }) => void;
}) {
  const days: RoutineDay[] = [0, 1, 2, 3, 4, 5, 6];
  const groupedR = useMemo(() => {
    const map: Record<number, RoutineItem[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    routines.forEach((r) => map[r.weekday].push(r));
    (Object.keys(map) as unknown as RoutineDay[]).forEach((d) =>
      map[d].sort((a, b) => a.time.localeCompare(b.time))
    );
    return map;
  }, [routines]);

  const groupedO = useMemo(() => {
    const map: Record<number, ScheduleRow[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    onces.forEach((o) => {
      const d = new Date(o.date).getDay() as RoutineDay;
      map[d].push(o);
    });
    return map;
  }, [onces]);

  const today = new Date().getDay();

  return (
    <div className="rounded-xl border bg-card">
      {/* wrapper scroll horizontal */}
      <div className="overflow-x-auto">
        <div className="min-w-[980px] sm:min-w-[1120px]">
          {/* header hari */}
          <div className="grid grid-cols-7 text-center bg-muted/50 border-b">
            {days.map((d) => (
              <div key={d} className="px-2 py-2 text-xs font-medium">
                {weekdayShort[d]}
              </div>
            ))}
          </div>

          {/* body */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {days.map((d) => (
              <div
                key={d}
                className={[
                  "min-h-[180px] bg-background p-2",
                  d === today ? "ring-2 ring-primary/40" : "",
                ].join(" ")}
              >
                <div className="space-y-1">
                  {groupedR[d].map((r) => (
                    <div
                      key={r.id}
                      className="text-[11px] rounded border p-1 bg-card cursor-pointer hover:bg-accent"
                      onClick={() => onClickItem({ kind: "routine", id: r.id })}
                    >
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="capitalize">
                          {r.type ?? "class"}
                        </Badge>
                        <span className="font-medium truncate">{r.title}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex gap-2 flex-wrap">
                        <span>
                          <Clock className="inline h-3 w-3 mr-1" />
                          {r.time}
                        </span>
                        {r.className ? (
                          <span>
                            <Users className="inline h-3 w-3 mr-1" />
                            {r.className}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {groupedO[d].map((o) => (
                    <div
                      key={o.id}
                      className="text-[11px] rounded border p-1 bg-card cursor-pointer hover:bg-accent"
                      onClick={() => onClickItem({ kind: "once", id: o.id })}
                    >
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="capitalize">
                          {o.type ?? "event"}
                        </Badge>
                        <span className="font-medium truncate">{o.title}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {new Date(o.date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}

                  {groupedR[d].length + groupedO[d].length === 0 ? (
                    <div className="text-[10px] text-muted-foreground">—</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   HALAMAN UTAMA: AdminSchedule
===================================================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolScheduleRoutine({
  showBack = false,
  backTo,
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));
  const qc = useQueryClient();

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Rutin",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Jadwal" },
        { label: "Rutin" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const [tab, setTab] = useState<"calendar" | "routine" | "once">("calendar");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Filters
  const [classId, setClassId] = useState<string | undefined>();
  const [teacherId, setTeacherId] = useState<string | undefined>();
  const [type, setType] = useState<"all" | "class" | "exam" | "event">("all");
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  // Editing dialogs
  const [editingOnce, setEditingOnce] = useState<ScheduleRow | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(
    null
  );

  // Bulk selection
  const [checkedRoutine, setCheckedRoutine] = useState<Record<string, boolean>>(
    {}
  );
  const [checkedOnce, setCheckedOnce] = useState<Record<string, boolean>>({});

  // Queries
  const routineQ = useQuery({
    queryKey: ["admin-routines"],
    queryFn: () => routineApi.list(),
  });
  const onceQ = useQuery({
    queryKey: ["admin-once"],
    queryFn: () => onceApi.list(),
  });

  const routineCreate = useMutation({
    mutationFn: (payload: Omit<RoutineItem, "id">) =>
      routineApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-routines"] }),
  });
  const routineUpdate = useMutation({
    mutationFn: (payload: RoutineItem) => routineApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-routines"] }),
  });
  const routineBulkDelete = useMutation({
    mutationFn: (ids: string[]) => routineApi.removeMany(ids),
    onSuccess: () => {
      setCheckedRoutine({});
      qc.invalidateQueries({ queryKey: ["admin-routines"] });
    },
  });

  const onceCreate = useMutation({
    mutationFn: (payload: Omit<ScheduleRow, "id">) => onceApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-once"] }),
  });
  const onceUpdate = useMutation({
    mutationFn: (payload: ScheduleRow) => onceApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-once"] }),
  });
  const onceBulkDelete = useMutation({
    mutationFn: (ids: string[]) => onceApi.removeMany(ids),
    onSuccess: () => {
      setCheckedOnce({});
      qc.invalidateQueries({ queryKey: ["admin-once"] });
    },
  });

  // Filtering helpers
  const filterType = <T extends { type?: any }>(arr: T[]) =>
    type === "all" ? arr : arr.filter((x) => x.type === type);

  const filterDate = (arr: ScheduleRow[]) => {
    if (!from && !to) return arr;
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    return arr.filter((x) => {
      const d = new Date(x.date);
      if (f && d < new Date(f.getFullYear(), f.getMonth(), f.getDate()))
        return false;
      if (
        t &&
        d > new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59)
      )
        return false;
      return true;
    });
  };

  const filteredRoutines = useMemo(() => {
    const base = routineQ.data ?? [];
    let out = base;
    if (classId) out = out.filter((r) => r.classId === classId);
    if (teacherId) out = out.filter((r) => r.teacherId === teacherId);
    out = filterType(out);
    return out;
  }, [routineQ.data, classId, teacherId, type]);

  const filteredOnce = useMemo(() => {
    const base = onceQ.data ?? [];
    let out = base;
    out = filterType(out);
    out = filterDate(out);
    // Note: one-off tidak diikat ke classId/teacherId di dummy ini.
    return out;
  }, [onceQ.data, type, from, to]);

  const onAddRoutine = (preset?: Partial<RoutineItem>) =>
    setEditingRoutine({
      id: "",
      weekday: (preset?.weekday as RoutineDay) ?? 1,
      time: "07:00",
      durationMin: 90,
      title: "",
      classId: preset?.classId ?? classId,
      className: classesStore.find((c) => c.id === (preset?.classId ?? classId))
        ?.name,
      room: "",
      teacherId: preset?.teacherId ?? teacherId,
      teacher: teachersStore.find(
        (t) => t.id === (preset?.teacherId ?? teacherId)
      )?.name,
      active: true,
      note: "",
      type: "class",
    });

  const onAddOnce = () =>
    setEditingOnce({
      id: "",
      title: "",
      date: new Date().toISOString(),
      time: "09:00",
      type: "event",
    });

  const onCalendarClickItem = (payload: {
    kind: "routine" | "once";
    id: string;
  }) => {
    if (payload.kind === "routine") {
      const found = (routineQ.data ?? []).find((r) => r.id === payload.id);
      if (found) setEditingRoutine(found);
    } else {
      const found = (onceQ.data ?? []).find((o) => o.id === payload.id);
      if (found) setEditingOnce(found);
    }
  };

  const resetFilters = () => {
    setClassId(undefined);
    setTeacherId(undefined);
    setType("all");
    setFrom(undefined);
    setTo(undefined);
  };

  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-4 max-w-5xl px-3 sm:px-4 lg:px-0">
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
          <div>
            <div className="font-semibold text-lg md:text-xl">
              Jadwal Sekolah (Admin)
            </div>
            <p className="text-sm text-muted-foreground">
              Kelola semua jadwal rutin mingguan & kegiatan sekali lintas kelas.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Filter */}
        <FilterBar
          classId={classId}
          setClassId={setClassId}
          teacherId={teacherId}
          setTeacherId={setTeacherId}
          type={type}
          setType={setType}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          view={view}
          setView={setView}
          onReset={resetFilters}
        />

        {/* Stats */}
        <QuickStats routines={filteredRoutines} onces={filteredOnce} />

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="w-full"
        >
          <TabsList className="w-fit flex-wrap">
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
            <TabsTrigger value="routine">Rutin (Mingguan)</TabsTrigger>
            <TabsTrigger value="once">Sekali / Acara</TabsTrigger>
          </TabsList>

          {/* Kalender */}
          <TabsContent value="calendar" className="mt-4">
            {view === "calendar" ? (
              <SimpleWeekCalendar
                routines={filteredRoutines}
                onces={filteredOnce}
                onClickItem={onCalendarClickItem}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                <RoutineBoardAdmin
                  data={filteredRoutines}
                  checked={checkedRoutine}
                  setChecked={setCheckedRoutine}
                  onAdd={(preset) => onAddRoutine(preset)}
                  onEdit={(it) => setEditingRoutine(it)}
                  onBulkDelete={(ids) => routineBulkDelete.mutate(ids)}
                  deleting={routineBulkDelete.isPending}
                />
                <OnceListAdmin
                  data={filteredOnce}
                  checked={checkedOnce}
                  setChecked={setCheckedOnce}
                  onAdd={onAddOnce}
                  onEdit={(row) => setEditingOnce(row)}
                  onBulkDelete={(ids) => onceBulkDelete.mutate(ids)}
                  deleting={onceBulkDelete.isPending}
                />
              </div>
            )}
          </TabsContent>

          {/* Rutin */}
          <TabsContent value="routine" className="mt-4">
            <RoutineBoardAdmin
              data={filteredRoutines}
              checked={checkedRoutine}
              setChecked={setCheckedRoutine}
              onAdd={(preset) => onAddRoutine(preset)}
              onEdit={(it) => setEditingRoutine(it)}
              onBulkDelete={(ids) => routineBulkDelete.mutate(ids)}
              deleting={routineBulkDelete.isPending}
            />
          </TabsContent>

          {/* Once / Acara */}
          <TabsContent value="once" className="mt-4">
            <OnceListAdmin
              data={filteredOnce}
              checked={checkedOnce}
              setChecked={setCheckedOnce}
              onAdd={onAddOnce}
              onEdit={(row) => setEditingOnce(row)}
              onBulkDelete={(ids) => onceBulkDelete.mutate(ids)}
              deleting={onceBulkDelete.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Once */}
      {editingOnce && (
        <EditScheduleDialog
          value={editingOnce}
          onClose={() => setEditingOnce(null)}
          onSubmit={(v) => {
            if (!v.title?.trim()) return;
            if (v.id) {
              onceUpdate.mutate(v, { onSuccess: () => setEditingOnce(null) });
            } else {
              const { id, ...payload } = v;
              onceCreate.mutate(payload, {
                onSuccess: () => setEditingOnce(null),
              });
            }
          }}
        />
      )}

      {/* Dialog Rutin */}
      {editingRoutine && (
        <EditRoutineDialog
          value={editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onSubmit={(v) => {
            if (!v.title.trim()) return;
            if (v.id) {
              routineUpdate.mutate(v, {
                onSuccess: () => setEditingRoutine(null),
              });
            } else {
              const { id, ...payload } = v as RoutineItem & { id: string };
              routineCreate.mutate(payload, {
                onSuccess: () => setEditingRoutine(null),
              });
            }
          }}
        />
      )}
    </div>
  );
}