import { useMemo, useState, useDeferredValue, useEffect } from "react";
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
  MapPin,
  UserSquare2,
  ArrowLeft,
  ChevronRight,
  Search,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ==========================================================
   Types
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
   Dummy Data
========================================================== */
const DUMMY_SECTIONS: SectionRow[] = [
  {
    id: crypto.randomUUID(),
    schoolId: "00000000-0000-0000-0000-000000000001",
    name: "TPA A",
    slug: "tpa-a",
    code: "A-01",
    roomName: "Aula 1",
    roomLocation: "Gedung Utama Lt.1",
    homeroomName: "Ustadz Abdullah",
    assistantName: "Ustadzah Amina",
    termName: "2025/2026 — Ganjil",
    termYearLabel: "2025/2026",
    scheduleText: "Senin & Rabu 07:30–09:00",
    totalStudents: 22,
    isActive: true,
  },
  {
    id: crypto.randomUUID(),
    schoolId: "00000000-0000-0000-0000-000000000001",
    name: "TPA B",
    slug: "tpa-b",
    code: "B-01",
    roomName: "R. Tahfiz",
    roomLocation: "Gedung Timur",
    homeroomName: "Ustadz Salman",
    assistantName: "Ustadzah Maryam",
    termName: "2025/2026 — Ganjil",
    termYearLabel: "2025/2026",
    scheduleText: "Selasa & Kamis 09:30–11:00",
    totalStudents: 20,
    isActive: true,
  },
  {
    id: crypto.randomUUID(),
    schoolId: "00000000-0000-0000-0000-000000000001",
    name: "TPA C",
    slug: "tpa-c",
    code: "C-01",
    roomName: "Aula 2",
    homeroomName: "Ustadz Abu Bakar",
    assistantName: "",
    termName: "2024/2025 — Genap",
    termYearLabel: "2024/2025",
    scheduleText: "Jumat 08:00–09:30",
    totalStudents: 18,
    isActive: false,
  },
];

/* ==========================================================
   Fetch (Dummy)
========================================================== */
async function fetchSections(): Promise<SectionRow[]> {
  await new Promise((r) => setTimeout(r, 250));
  return DUMMY_SECTIONS.map((x) => ({ ...x }));
}

function useSections() {
  return useQuery({
    queryKey: ["teacher-class-sections"],
    queryFn: fetchSections,
    staleTime: 2 * 60_000,
  });
}

/* ==========================================================
   Filter logic
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

    if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "students") list = [...list].sort((a, b) => b.totalStudents - a.totalStudents);
    if (sortBy === "created") list = [...list].reverse();

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
   Section Card
========================================================== */
function SectionCard({ s }: { s: SectionRow }) {
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
        <Link to={`${s.id}`}>
          <Button size="sm" className="inline-flex items-center">
            Buka Kelas
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

/* ==========================================================
   Main Page
========================================================== */
export default function TeacherClassFromSections() {
  const navigate = useNavigate();
  const { data: sections = [], isLoading } = useSections();
  const f = useFilters(sections);

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Wali Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Wali Kelas" },
      ],
      actions: null,
    });
  }, [setHeader]);

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Kelas yang Saya Ajar</h1>
        </div>

        {/* Filters */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={f.q}
              onChange={(e) => f.setQ(e.target.value)}
              placeholder="Cari nama kelas / wali / ruang…"
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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 h-[160px] animate-pulse" />
            ))
          ) : f.filtered.length ? (
            f.filtered.map((s) => <SectionCard key={s.id} s={s} />)
          ) : (
            <Card className="col-span-2 md:col-span-3 lg:col-span-4 p-10 text-center">
              Tidak ada kelas ditemukan.
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
