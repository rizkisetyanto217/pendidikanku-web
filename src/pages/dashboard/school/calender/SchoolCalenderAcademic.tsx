// src/pages/sekolahislamku/pages/academic/CalenderAcademic.shadcn.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Icons
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

/* ================= Helpers ================= */
type EventRow = {
  id: string;
  title: string;
  date: string; // ISO
  level?: string;
  category?: string;
};

const toMonthStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};
const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

/* ================= Dummy API (in-memory) ================= */
// Storage per-bulan: key "YYYY-MM" -> EventRow[]
const store = new Map<string, EventRow[]>();

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

const fakeApi = {
  async list(month: string): Promise<EventRow[]> {
    await delay();
    // seed contoh kalau kosong
    if (!store.has(month)) {
      const [y, m] = month.split("-").map(Number);
      store.set(month, [
        {
          id: uid(),
          title: "Contoh: Ujian",
          date: new Date(y, m - 1, 10, 7).toISOString(),
          category: "Ujian",
        },
        {
          id: uid(),
          title: "Contoh: Rapat",
          date: new Date(y, m - 1, 15, 13).toISOString(),
          category: "Kegiatan",
        },
      ]);
    }
    return JSON.parse(JSON.stringify(store.get(month)!));
  },
  async create(
    month: string,
    payload: Omit<EventRow, "id">
  ): Promise<EventRow> {
    await delay();
    const curr = store.get(month) || [];
    const row: EventRow = { id: uid(), ...payload };
    store.set(month, [...curr, row]);
    return JSON.parse(JSON.stringify(row));
  },
  async update(month: string, payload: EventRow): Promise<EventRow> {
    await delay();
    const curr = store.get(month) || [];
    const idx = curr.findIndex((x) => x.id === payload.id);
    if (idx >= 0) curr[idx] = { ...payload };
    store.set(month, curr);
    return JSON.parse(JSON.stringify(payload));
  },
  async remove(month: string, id: string): Promise<void> {
    await delay();
    const curr = store.get(month) || [];
    store.set(
      month,
      curr.filter((x) => x.id !== id)
    );
  },
};
/* ========================================================= */

const SchoolCalenderAcademic: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();


  const [month, setMonth] = useState<string>(toMonthStr());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);

  // List events (dummy)
  const eventsQ = useQuery({
    queryKey: ["acad-events", month],
    queryFn: () => fakeApi.list(month),
    staleTime: 30_000,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    (eventsQ.data ?? []).forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      map.set(key, [...(map.get(key) || []), e]);
    });
    return map;
  }, [eventsQ.data]);

  // CRUD (dummy)
  const createMut = useMutation({
    mutationFn: (payload: Omit<EventRow, "id">) =>
      fakeApi.create(month, payload),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["acad-events", month] });
      setSelectedDay(row.date.slice(0, 10));
    },
  });
  const updateMut = useMutation({
    mutationFn: (payload: EventRow) => fakeApi.update(month, payload),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["acad-events", month] });
      setSelectedDay(row.date.slice(0, 10));
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => fakeApi.remove(month, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["acad-events", month] }),
  });

  // Calendar grid
  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(y, (m || 1) - 1, 1);
    const firstWeekday = (first.getDay() + 6) % 7; // Mon=0
    const total = new Date(y, m, 0).getDate();
    const cells: { label: number | null; dateKey: string | null }[] = [];
    for (let i = 0; i < firstWeekday; i++)
      cells.push({ label: null, dateKey: null });
    for (let d = 1; d <= total; d++) {
      const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`;
      cells.push({ label: d, dateKey: key });
    }
    while (cells.length % 7 !== 0) cells.push({ label: null, dateKey: null });
    return cells;
  }, [month]);

  const gotoPrev = () => {
    const [y, m] = month.split("-").map(Number);
    setMonth(toMonthStr(new Date(y, m - 2, 1)));
  };
  const gotoNext = () => {
    const [y, m] = month.split("-").map(Number);
    setMonth(toMonthStr(new Date(y, m, 1)));
  };

  return (
    <main className="px-4 md:px-6 md:py-8">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="px-2"
              title="Kembali"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-base font-semibold sm:text-lg">
              Kalender Akademik
            </h1>
          </div>

          {/* Navigasi Bulan */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={gotoPrev}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="px-2 text-sm font-medium">{monthLabel(month)}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={gotoNext}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </section>

        {/* Kalender */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="size-4" />
              Kalender Bulanan
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="pt-0">
            {eventsQ.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Header hari */}
                <div className="grid grid-cols-7 text-[10px] sm:text-xs mb-2 text-muted-foreground">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                    (d) => (
                      <div key={d} className="text-center font-medium">
                        {d}
                      </div>
                    )
                  )}
                </div>

                {/* Grid tanggal */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {days.map((c, i) => {
                    const events = c.dateKey
                      ? byDate.get(c.dateKey)
                      : undefined;
                    const selected = selectedDay === c.dateKey;
                    return (
                      <button
                        key={i}
                        disabled={!c.dateKey}
                        onClick={() => setSelectedDay(c.dateKey!)}
                        className={[
                          "aspect-square rounded-lg border text-left relative p-1 sm:p-2 transition",
                          "disabled:opacity-50",
                          selected
                            ? "bg-primary/10 border-primary/30"
                            : "bg-card",
                        ].join(" ")}
                      >
                        {/* Nomor tanggal */}
                        <div className="text-[10px] sm:text-xs font-medium">
                          {c.label ?? ""}
                        </div>

                        {/* Titik indikator */}
                        {!!events && events.length > 0 && (
                          <div className="absolute right-1 top-1 flex gap-0.5">
                            {events.slice(0, 3).map((_, idx) => (
                              <span
                                key={idx}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                            ))}
                          </div>
                        )}

                        {/* Ringkasan judul event pertama */}
                        {events && events[0] && (
                          <div className="mt-1 text-[10px] sm:text-[11px] line-clamp-2 leading-snug text-muted-foreground">
                            {events[0].title}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Panel agenda */}
        {selectedDay && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Agenda {new Date(selectedDay).toLocaleDateString("id-ID")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      setEditing({
                        id: "",
                        title: "",
                        date: new Date(selectedDay + "T07:00:00").toISOString(),
                      })
                    }
                    className="gap-1"
                  >
                    <Plus className="size-4" />
                    Tambah
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDay(null)}
                    aria-label="Tutup panel agenda"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mt-3 space-y-2">
                {(byDate.get(selectedDay) ?? []).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border px-3 py-2 gap-2 bg-card"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {ev.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ev.date).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {ev.category ? ` • ${ev.category}` : ""}
                        {ev.level ? ` • Kelas ${ev.level}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => setEditing(ev)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => deleteMut.mutate(ev.id)}
                        disabled={deleteMut.isPending}
                      >
                        <Trash2 className="size-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
                {(byDate.get(selectedDay) ?? []).length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Belum ada agenda pada tanggal ini.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal (Dialog) */}
      <EditDialog
        open={!!editing}
        value={editing ?? { id: "", title: "", date: new Date().toISOString() }}
        onOpenChange={(o) => !o && setEditing(null)}
        onSubmit={(val) => {
          if (!val.title.trim()) return;
          if (val.id) {
            updateMut.mutate(val, { onSuccess: () => setEditing(null) });
          } else {
            const { id, ...payload } = val;
            createMut.mutate(payload, { onSuccess: () => setEditing(null) });
          }
        }}
      />
    </main>
  );
};

export default SchoolCalenderAcademic;

/* =============== Dialog Komponen =============== */
function EditDialog({
  open,
  value,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  value: EventRow;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: EventRow) => void;
}) {
  const [form, setForm] = useState<EventRow>(value);
  useEffect(() => setForm(value), [value]);
  const set = (k: keyof EventRow, v: any) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {form.id ? "Ubah Agenda" : "Tambah Agenda"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Contoh: Ujian Tengah Semester"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal & Waktu</Label>
              <Input
                id="date"
                type="datetime-local"
                value={toLocalInputValue(form.date)}
                onChange={(e) =>
                  set("date", new Date(e.target.value).toISOString())
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori (opsional)</Label>
              <Input
                id="category"
                value={form.category || ""}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Akademik/Libur/Ujian…"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="level">Level/Kelas (opsional)</Label>
            <Input
              id="level"
              value={form.level || ""}
              onChange={(e) => set("level", e.target.value)}
              placeholder="Semua / 1 / 2 / …"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => onSubmit(form)} className="gap-1">
            {form.id ? (
              <Pencil className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}{" "}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
