import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    ArrowLeft,
    Clock,
    MapPin,
    User,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

/* ================= Types ================= */
type ScheduleRow = {
    id: string;
    title: string;
    date: string;
    time: string;
    room?: string;
    teacher?: string;
    type?: "class" | "exam" | "event";
    description?: string;
};

/* ================= Helpers ================= */
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

/* ================= Dummy API ================= */
const scheduleStore = new Map<string, ScheduleRow[]>();
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
function uid() {
    return `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}
const scheduleApi = {
    async list(month: string): Promise<ScheduleRow[]> {
        await delay();
        if (!scheduleStore.has(month)) {
            const [y, m] = month.split("-").map(Number);
            scheduleStore.set(month, [
                {
                    id: uid(),
                    title: "Tahsin Al-Quran",
                    date: new Date(y, m - 1, 8, 7, 30).toISOString(),
                    time: "07:30",
                    room: "Aula 1",
                    teacher: "Ust. Ahmad",
                    type: "class",
                    description: "Pembelajaran tahsin dengan fokus makhraj huruf",
                },
                {
                    id: uid(),
                    title: "Matematika Kelas 5",
                    date: new Date(y, m - 1, 12, 10, 0).toISOString(),
                    time: "10:00",
                    room: "Ruang 5A",
                    teacher: "Bu Sari",
                    type: "class",
                    description: "Materi pecahan dan desimal",
                },
            ]);
        }
        return structuredClone(scheduleStore.get(month)!);
    },
    async create(month: string, payload: Omit<ScheduleRow, "id">) {
        await delay();
        const curr = scheduleStore.get(month) || [];
        const row = { id: uid(), ...payload };
        scheduleStore.set(month, [...curr, row]);
        return structuredClone(row);
    },
    async update(month: string, payload: ScheduleRow) {
        await delay();
        const curr = scheduleStore.get(month) || [];
        const idx = curr.findIndex((x) => x.id === payload.id);
        if (idx >= 0) curr[idx] = payload;
        scheduleStore.set(month, curr);
        return structuredClone(payload);
    },
    async remove(month: string, id: string) {
        await delay();
        const curr = scheduleStore.get(month) || [];
        scheduleStore.set(
            month,
            curr.filter((x) => x.id !== id)
        );
    },
};

/* ================= MAIN COMPONENT ================= */
export default function TeacherSchedule() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const [month, setMonth] = useState(toMonthStr());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [editing, setEditing] = useState<ScheduleRow | null>(null);

    const schedulesQ = useQuery({
        queryKey: ["teacher-schedules", month],
        queryFn: () => scheduleApi.list(month),
    });

    const createMut = useMutation({
        mutationFn: (payload: Omit<ScheduleRow, "id">) =>
            scheduleApi.create(month, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-schedules", month] }),
    });
    const updateMut = useMutation({
        mutationFn: (payload: ScheduleRow) => scheduleApi.update(month, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-schedules", month] }),
    });
    const deleteMut = useMutation({
        mutationFn: (id: string) => scheduleApi.remove(month, id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-schedules", month] }),
    });

    const byDate = useMemo(() => {
        const map = new Map<string, ScheduleRow[]>();
        (schedulesQ.data ?? []).forEach((s) => {
            const d = new Date(s.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;
            const arr = map.get(key) || [];
            arr.push(s);
            arr.sort((a, b) => a.time.localeCompare(b.time));
            map.set(key, arr);
        });
        return map;
    }, [schedulesQ.data]);

    const [y, m] = month.split("-").map(Number);
    const first = new Date(y, (m || 1) - 1, 1);
    const firstWeekday = (first.getDay() + 6) % 7;
    const total = new Date(y, m, 0).getDate();
    const days = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: total }, (_, i) => i + 1),
    ];

    const gotoPrev = () => setMonth(toMonthStr(new Date(y, m - 2, 1)));
    const gotoNext = () => setMonth(toMonthStr(new Date(y, m, 1)));

    return (
        <div className="w-full p-4 md:p-6 bg-background text-foreground">
            <div className="max-w-screen-xl mx-auto flex flex-col gap-4">
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
                            Klik tanggal untuk melihat / menambah jadwal
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={gotoPrev}>
                            <ChevronLeft size={16} />
                        </Button>
                        <span className="font-medium text-sm">{monthLabel(month)}</span>
                        <Button variant="outline" size="icon" onClick={gotoNext}>
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>

                {/* Kalender */}
                <Card>
                    <CardContent className="p-4">
                        {schedulesQ.isLoading ? (
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground mb-2">
                                    {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                                        <div key={d} className="text-center font-medium">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {days.map((day, i) => {
                                        const dateKey =
                                            day &&
                                            `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(
                                                2,
                                                "0"
                                            )}`;
                                        const schedules = dateKey ? byDate.get(dateKey) : [];
                                        const selected = selectedDay === dateKey;
                                        return (
                                            <button
                                                key={i}
                                                disabled={!dateKey}
                                                onClick={() => setSelectedDay(dateKey!)}
                                                className={`aspect-square border rounded-lg text-left p-1 relative transition ${selected ? "bg-primary/10 border-primary" : ""
                                                    } disabled:opacity-30`}
                                            >
                                                <div className="text-xs font-medium">{day ?? ""}</div>
                                                {!!schedules?.length && (
                                                    <div className="absolute right-1 top-1 flex gap-0.5">
                                                        {schedules.slice(0, 3).map((s, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`h-1.5 w-1.5 rounded-full ${s.type === "exam"
                                                                        ? "bg-red-500"
                                                                        : s.type === "event"
                                                                            ? "bg-green-500"
                                                                            : "bg-primary"
                                                                    }`}
                                                            />
                                                        ))}
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

                {/* Panel Hari */}
                {selectedDay && (
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle className="text-base">
                                Jadwal {new Date(selectedDay).toLocaleDateString("id-ID")}
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        setEditing({
                                            id: "",
                                            title: "",
                                            date: new Date(selectedDay + "T07:00:00").toISOString(),
                                            time: "07:00",
                                        })
                                    }
                                >
                                    <Plus size={16} />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedDay(null)}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {schedulesQ.isLoading ? (
                                <>
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </>
                            ) : (byDate.get(selectedDay) ?? []).length > 0 ? (
                                (byDate.get(selectedDay) ?? []).map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex justify-between items-start border rounded-lg p-3"
                                    >
                                        <div>
                                            <div className="text-sm font-medium">{s.title}</div>
                                            <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {s.time}
                                                </span>
                                                {s.room && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} /> {s.room}
                                                    </span>
                                                )}
                                                {s.teacher && (
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} /> {s.teacher}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setEditing(s)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => deleteMut.mutate(s.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada jadwal.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Dialog */}
            {editing && (
                <EditDialog
                    value={editing}
                    onClose={() => setEditing(null)}
                    onSubmit={(v) => {
                        if (!v.title.trim()) return;
                        if (v.id)
                            updateMut.mutate(v, { onSuccess: () => setEditing(null) });
                        else {
                            const { id, ...payload } = v;
                            createMut.mutate(payload, { onSuccess: () => setEditing(null) });
                        }
                    }}
                />
            )}
        </div>
    );
}

/* ================= Dialog Form ================= */
function EditDialog({
    value,
    onClose,
    onSubmit,
}: {
    value: ScheduleRow;
    onClose: () => void;
    onSubmit: (v: ScheduleRow) => void;
}) {
    const [form, setForm] = useState(value);
    const set = (k: keyof ScheduleRow, v: any) =>
        setForm((s) => ({ ...s, [k]: v }));

    const rooms = ["Aula 1", "Aula Utama", "Ruang 5A"];
    const classes = ["1A", "2B", "3C", "4D", "5A", "6B"];

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{form.id ? "Ubah Jadwal" : "Tambah Jadwal"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div>
                        <label className="text-xs text-muted-foreground">Judul</label>
                        <Input
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="Contoh: Matematika Kelas 5A"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground">
                                Tanggal & Waktu
                            </label>
                            <Input
                                type="datetime-local"
                                value={toLocalInputValue(form.date)}
                                onChange={(e) => {
                                    const newDate = new Date(e.target.value).toISOString();
                                    const time = e.target.value.split("T")[1] || "07:00";
                                    set("date", newDate);
                                    set("time", time);
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Jenis</label>
                            <Select
                                value={form.type || "class"}
                                onValueChange={(v) => set("type", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="class">Kelas</SelectItem>
                                    <SelectItem value="exam">Ujian</SelectItem>
                                    <SelectItem value="event">Acara</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground">Ruangan</label>
                            <Select
                                value={form.room || ""}
                                onValueChange={(v) => set("room", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="- Pilih Ruangan -" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Kelas</label>
                            <Select
                                value={form.teacher || ""}
                                onValueChange={(v) => set("teacher", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="- Pilih Kelas -" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">
                            Deskripsi (opsional)
                        </label>
                        <Textarea
                            value={form.description || ""}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="Catatan tambahan..."
                        />
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="ghost" onClick={onClose}>
                        Batal
                    </Button>
                    <Button onClick={() => onSubmit(form)}>
                        {form.id ? <Pencil size={16} /> : <Plus size={16} />} Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
