import { useMemo, useState, useDeferredValue } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
    Users,
    CalendarDays,
    Clock,
    MapPin,
    ArrowLeft,
    ChevronRight,
  
    LayoutList,
    LayoutGrid,
    Search,
} from "lucide-react";

import {
    fetchStudentsByClasses,
    type ClassStudentsMap,
    type StudentSummary,
} from "../types/teacherClass";

/* ==========================================================
   Types
========================================================== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type NextSession = {
    dateISO: string;
    time: string;
    title: string;
    room?: string;
};

export type TeacherClassSummary = {
    id: string;
    name: string;
    room?: string;
    homeroom: string;
    assistants?: string[];
    studentsCount: number;
    todayAttendance: Record<AttendanceStatus, number>;
    nextSession?: NextSession;
    academicTerm: string;
    cohortYear: number;
};

type ViewMode = "detailed" | "simple";

const TODAY_FIXED = new Date("2025-09-02");

/* ==========================================================
   Dummy Data & Hooks
========================================================== */
const TEACHER_CLASSES_FIXED: TeacherClassSummary[] = [
    {
        id: "tpa-a",
        name: "TPA A",
        room: "Aula 1",
        homeroom: "Ustadz Abdullah",
        studentsCount: 22,
        todayAttendance: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
        nextSession: {
            dateISO: TODAY_FIXED.toISOString(),
            time: "07:30",
            title: "Tahsin — Tajwid & Makhraj",
            room: "Aula 1",
        },
        academicTerm: "2025/2026 — Ganjil",
        cohortYear: 2025,
    },
    {
        id: "tpa-b",
        name: "TPA B",
        room: "R. Tahfiz",
        homeroom: "Ustadz Salman",
        studentsCount: 20,
        todayAttendance: { hadir: 15, online: 2, sakit: 1, izin: 1, alpa: 1 },
        nextSession: {
            dateISO: TODAY_FIXED.toISOString(),
            time: "09:30",
            title: "Hafalan Juz 30",
            room: "R. Tahfiz",
        },
        academicTerm: "2025/2026 — Ganjil",
        cohortYear: 2025,
    },
];

async function fetchTeacherClasses(): Promise<TeacherClassSummary[]> {
    return Promise.resolve(TEACHER_CLASSES_FIXED);
}

function useTeacherClasses() {
    return useQuery({
        queryKey: ["teacher-classes"],
        queryFn: fetchTeacherClasses,
        staleTime: Infinity,
    });
}

function useClassStudents(classIds: string[]) {
    return useQuery({
        queryKey: ["class-students", classIds],
        queryFn: () => fetchStudentsByClasses(classIds),
        enabled: classIds.length > 0,
        staleTime: Infinity,
    });
}

/* ==========================================================
   Filter Hook
========================================================== */
function useClassFilters(classes: TeacherClassSummary[]) {
    const [q, setQ] = useState("");
    const deferredQ = useDeferredValue(q);
    const [room, setRoom] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "students" | "time">("name");

    const filtered = useMemo(() => {
        let list = classes;
        if (room !== "all") list = list.filter((c) => c.room === room);
        if (deferredQ.trim()) {
            list = list.filter((c) =>
                c.name.toLowerCase().includes(deferredQ.toLowerCase())
            );
        }
        list = [...list].sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "students") return b.studentsCount - a.studentsCount;
            return 0;
        });
        return list;
    }, [classes, deferredQ, room, sortBy]);

    return { q, setQ, room, setRoom, sortBy, setSortBy, filtered };
}

/* ==========================================================
   Components
========================================================== */
function ViewModeToggle({
    value,
    onChange,
}: {
    value: ViewMode;
    onChange: (v: ViewMode) => void;
}) {
    return (
        <div className="flex gap-2 border rounded-lg p-1">
            <Button
                variant={value === "detailed" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("detailed")}
            >
                <LayoutGrid size={16} className="mr-1" /> Detail
            </Button>
            <Button
                variant={value === "simple" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange("simple")}
            >
                <LayoutList size={16} className="mr-1" /> Simple
            </Button>
        </div>
    );
}

function ClassCard({
    c,
    students,
 
}: {
    c: TeacherClassSummary;
    students: StudentSummary[];
    viewMode: ViewMode;
}) {
    const total = students.length || c.studentsCount;
    const hadir = c.todayAttendance.hadir ?? 0;
    const pct = total ? Math.round((hadir / total) * 100) : 0;

    return (
        <Card className="p-5 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.homeroom}</p>
                </div>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <MapPin size={12} /> {c.room ?? "Belum ditentukan"}
                </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>
                    <Users size={14} className="inline mr-1" /> {total} siswa —{" "}
                    {pct}% hadir
                </p>
                <p>
                    <CalendarDays size={14} className="inline mr-1" />{" "}
                    {c.academicTerm} — Angkatan {c.cohortYear}
                </p>
            </div>

            {c.nextSession && (
                <div className="p-3 border rounded-md bg-muted/30 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <Clock size={14} /> {c.nextSession.title}
                    </div>
                    <div className="text-muted-foreground mt-1">
                        {c.nextSession.time} — {c.nextSession.room}
                    </div>
                </div>
            )}

            <div className="pt-4 text-right">
                <Link to={c.id}>
                    <Button variant="secondary" size="sm" className="flex items-center">
                        Buka Kelas
                        <ChevronRight size={14} className="ml-1" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
}

/* ==========================================================
   Main Page
========================================================== */
const TeacherClassesList: React.FC = () => {
    const navigate = useNavigate();
    const { data: classes = [] } = useTeacherClasses();
    const [viewMode, setViewMode] = useState<ViewMode>("detailed");
    const { q, setQ, room, setRoom, sortBy, setSortBy, filtered } =
        useClassFilters(classes);
    const classIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
    const { data: studentsMap = {} } = useClassStudents(classIds);

    return (
        <div className="w-full bg-background text-foreground py-6">
            <main className="max-w-6xl mx-auto px-4 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="mr-1"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <h1 className="text-xl font-semibold">Kelas yang Saya Ajar</h1>
                    </div>
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </div>

                {/* Filters */}
                <Card className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <Search size={18} className="text-muted-foreground" />
                        <Input
                            placeholder="Cari kelas..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Select value={room} onValueChange={setRoom}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Ruangan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Ruangan</SelectItem>
                                {Array.from(new Set(classes.map((c) => c.room))).map(
                                    (r) =>
                                        r && (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        )
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={sortBy}
                            onValueChange={(v: any) => setSortBy(v as typeof sortBy)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Nama Kelas</SelectItem>
                                <SelectItem value="students">Jumlah Siswa</SelectItem>
                                <SelectItem value="time">Jadwal Terdekat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                {/* Class Cards */}
                <div
                    className={`grid gap-6 ${viewMode === "simple"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2"
                        }`}
                >
                    {filtered.map((c) => (
                        <ClassCard
                            key={c.id}
                            c={c}
                            students={(studentsMap as ClassStudentsMap)[c.id] ?? []}
                            viewMode={viewMode}
                        />
                    ))}
                </div>

                {filtered.length === 0 && (
                    <Card className="p-10 text-center space-y-3">
                        <Search className="mx-auto text-muted-foreground" size={28} />
                        <p className="font-medium">Tidak ada kelas ditemukan</p>
                        <Button variant="outline" onClick={() => setQ("")}>
                            Reset Filter
                        </Button>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default TeacherClassesList;
