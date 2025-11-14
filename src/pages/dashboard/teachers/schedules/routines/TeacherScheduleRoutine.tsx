// src/pages/sekolahislamku/teacher/TeacherSchedule.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

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
import EditScheduleDialog from "@/pages/dashboard/components/calender/components/EditSchedule";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

/* =========================
   Types untuk Jadwal Rutin
========================= */
export type RoutineDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun .. 6=Sat
export type RoutineItem = {
  id: string;
  weekday: RoutineDay;
  time: string; // "HH:mm"
  durationMin?: number;
  title: string;
  className?: string;
  room?: string;
  teacher?: string;
  active?: boolean;
  note?: string;
};

/* =========================
   Dummy utils & stores
========================= */
const weekdayShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const routineStore: RoutineItem[] = [];
const onceStore: ScheduleRow[] = []; // tanggal spesifik (one-off)

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* =========================
   Dummy APIs (Rutin & Sekali)
========================= */
const routineApi = {
  async list(): Promise<RoutineItem[]> {
    await delay();
    if (routineStore.length === 0) {
      routineStore.push(
        {
          id: uid(),
          weekday: 2,
          time: "07:00",
          durationMin: 90,
          title: "Tahsin Al-Qur'an",
          className: "1A",
          room: "Aula 1",
          teacher: "Ust. Ahmad",
          active: true,
        },
        {
          id: uid(),
          weekday: 3,
          time: "09:30",
          durationMin: 60,
          title: "Matematika",
          className: "3C",
          room: "Ruang 3B",
          teacher: "Pak Budi",
          active: true,
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
  async remove(id: string) {
    await delay();
    const idx = routineStore.findIndex((x) => x.id === id);
    if (idx >= 0) routineStore.splice(idx, 1);
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
        mk(2, { title: "Rapat Orang Tua", type: "event" }),
        mk(10, { title: "Tryout Ujian", type: "exam" }),
        mk(20, { title: "Seminar Tamu", type: "event" })
      );
    }
    return structuredClone(
      onceStore.sort((a, b) => +new Date(a.date) - +new Date(b.date))
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
  async remove(id: string) {
    await delay();
    const idx = onceStore.findIndex((x) => x.id === id);
    if (idx >= 0) onceStore.splice(idx, 1);
  },
};

/* =========================
   Dialog Edit Rutin
========================= */
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
      <DialogContent className="max-w-lg">
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
            <Input
              value={draft.className ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, className: e.target.value }))
              }
              placeholder="1A / 3C / dst"
            />
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

/* =========================
   Board Rutin (3 kolom, hide empty days)
========================= */
function RoutineBoard({
  data,
  onAdd,
  onEdit,
  onDelete,
  onView,
  deleting,
}: {
  data: RoutineItem[];
  onAdd: (weekday?: RoutineDay) => void;
  onEdit: (item: RoutineItem) => void;
  onDelete: (id: string) => void;
  onView: (item: RoutineItem) => void;
  deleting?: boolean;
}) {
  const byDay = useMemo(() => {
    const map: Record<number, RoutineItem[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    data.forEach((it) => map[it.weekday].push(it));
    (Object.keys(map) as unknown as RoutineDay[]).forEach((d) =>
      map[d].sort((a, b) => a.time.localeCompare(b.time))
    );
    return map;
  }, [data]);

  const daysWithData = useMemo(() => {
    const ordered: RoutineDay[] = [0, 1, 2, 3, 4, 5, 6];
    return ordered.filter((d) => byDay[d] && byDay[d].length > 0);
  }, [byDay]);

  const weekdayFull = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jum'at",
    "Sabtu",
  ];
  const todayIdx = new Date().getDay() as RoutineDay;

  if (daysWithData.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground p-6 text-center">
        <div className="font-medium mb-2">Belum ada jadwal rutin</div>
        <p className="text-sm text-muted-foreground mb-4">
          Tambahkan jadwal rutin mingguan sesuai kebutuhanmu.
        </p>
        <Button onClick={() => onAdd(1)}>+ Tambah Jadwal Rutin</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {daysWithData.map((d) => {
        const isToday = d === todayIdx;
        return (
          <div
            key={d}
            className={[
              "rounded-xl border bg-card text-card-foreground transition-shadow",
              isToday ? "ring-2 ring-primary/40 bg-primary/5" : "",
            ].join(" ")}
          >
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="font-medium">{weekdayFull[d]}</div>
                {isToday && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    Hari ini
                  </span>
                )}
              </div>
              <Button size="icon" variant="ghost" onClick={() => onAdd(d)}>
                <Plus size={16} />
              </Button>
            </div>
            <Separator />
            <div className="p-2 space-y-2">
              {byDay[d].map((it) => (
                <div
                  key={it.id}
                  onClick={() => onView(it)}
                  className={[
                    "rounded-lg border p-2 bg-background cursor-pointer",
                    it.active === false ? "opacity-60" : "",
                    isToday ? "border-primary/50" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Clock size={12} />
                      {it.time}
                      {it.durationMin ? ` • ${it.durationMin}m` : null}
                    </Badge>
                    {it.className ? (
                      <Badge variant="outline" className="gap-1">
                        <Users size={12} />
                        {it.className}
                      </Badge>
                    ) : null}
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(it);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(it.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   List One-Off (Sekali)
========================= */
function OnceList({
  data,
  loading,
  onAddNew,
  onEdit,
  onDelete,
  deleting,
}: {
  data: ScheduleRow[];
  loading?: boolean;
  onAddNew: () => void;
  onEdit: (row: ScheduleRow) => void;
  onDelete: (id: string) => void;
  deleting?: boolean;
}) {
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

  return (
    <div className="rounded-xl border">
      <div className="p-3 flex items-center justify-between">
        <div>
          <div className="font-semibold">Jadwal Sekali / Acara</div>
          <div className="text-sm text-muted-foreground">
            Kegiatan insidental lintas tanggal (di luar rutin mingguan)
          </div>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>
      <Separator />
      <div className="p-3 space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Memuat…</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada data</div>
        ) : (
          data.map((r) => {
            const today = isSameDay(r.date);
            return (
              <div
                key={r.id}
                className={[
                  "rounded-lg border p-3 bg-background",
                  today ? "border-primary/60 bg-primary/5" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {r.type ?? "event"}
                  </Badge>
                  <div className="font-medium">{r.title}</div>
                  {today && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      Hari ini
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(r)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={deleting}
                      onClick={() => onDelete(r.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />{" "}
                    {new Date(r.date).toLocaleString("id-ID")}
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
            );
          })
        )}
      </div>
    </div>
  );
}

/* =========================
   Halaman Utama (Rutin & Sekali saja)
========================= */
export default function TeacherScheduleRoutine() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const LOCAL_KEY = "teacherRoutineTab";
  const [tab, setTab] = useState<"routine" | "once">("routine");
  const [editing, setEditing] = useState<ScheduleRow | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(
    null
  );

  useEffect(() => {
    const saved = (localStorage.getItem(LOCAL_KEY) || "") as "routine" | "once";
    if (["routine", "once"].includes(saved)) setTab(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, tab);
  }, [tab]);

  // Rutin
  const routineQ = useQuery({
    queryKey: ["teacher-routines"],
    queryFn: () => routineApi.list(),
  });
  const routineCreate = useMutation({
    mutationFn: (payload: Omit<RoutineItem, "id">) =>
      routineApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-routines"] }),
  });
  const routineUpdate = useMutation({
    mutationFn: (payload: RoutineItem) => routineApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-routines"] }),
  });
  const routineDelete = useMutation({
    mutationFn: (id: string) => routineApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-routines"] }),
  });

  // Sekali / Acara
  const onceQ = useQuery({
    queryKey: ["teacher-once"],
    queryFn: () => onceApi.list(),
  });
  const onceCreate = useMutation({
    mutationFn: (payload: Omit<ScheduleRow, "id">) => onceApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-once"] }),
  });
  const onceUpdate = useMutation({
    mutationFn: (payload: ScheduleRow) => onceApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-once"] }),
  });
  const onceDelete = useMutation({
    mutationFn: (id: string) => onceApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-once"] }),
  });

  const onAddRoutine = (weekday?: RoutineDay) =>
    setEditingRoutine({
      id: "",
      weekday: weekday ?? 1,
      time: "07:00",
      durationMin: 90,
      title: "",
      className: "",
      room: "",
      teacher: "",
      active: true,
      note: "",
    });

  const onAddOnce = () =>
    setEditing({
      id: "",
      title: "",
      date: new Date().toISOString(),
      time: "09:00",
      type: "event",
    });

  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays size={18} />
          </div>
          <div>
            <div className="font-semibold text-base">Jadwal Mengajar</div>
            <p className="text-sm text-muted-foreground">
              Kelola jadwal rutin mingguan dan kegiatan sekali
            </p>
          </div>
        </div>

        {/* Tabs (2 saja) */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="w-full"
        >
          <TabsList className="w-fit flex-wrap">
            <TabsTrigger value="routine">Rutin (Mingguan)</TabsTrigger>
            <TabsTrigger value="once">Sekali / Acara</TabsTrigger>
          </TabsList>

          {/* Rutin */}
          <TabsContent value="routine" className="mt-4">
            <RoutineBoard
              data={routineQ.data ?? []}
              onAdd={onAddRoutine}
              onEdit={(it) => setEditingRoutine(it)}
              onDelete={(id) => routineDelete.mutate(id)}
              deleting={routineDelete.isPending}
              onView={(it) =>
                navigate(`${it.id}`, {
                  state: { routine: it },
                })
              }
            />
            <div className="mt-3">
              <Button onClick={() => onAddRoutine()}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal Rutin
              </Button>
            </div>
          </TabsContent>

          {/* Sekali / Acara */}
          <TabsContent value="once" className="mt-4">
            <OnceList
              data={onceQ.data ?? []}
              loading={onceQ.isLoading}
              onAddNew={onAddOnce}
              onEdit={(row) => setEditing(row)}
              onDelete={(id) => onceDelete.mutate(id)}
              deleting={onceDelete.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Sekali / Acara */}
      {editing && (
        <EditScheduleDialog
          value={editing}
          onClose={() => setEditing(null)}
          onSubmit={(v) => {
            if (!v.title?.trim()) return;
            if (v.id) {
              onceUpdate.mutate(v, { onSuccess: () => setEditing(null) });
            } else {
              const { id, ...payload } = v;
              onceCreate.mutate(payload, {
                onSuccess: () => setEditing(null),
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
