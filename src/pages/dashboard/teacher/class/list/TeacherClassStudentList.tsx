import React, { useMemo, useState, useDeferredValue } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowLeft,
  Phone,
  User2,
  AlertTriangle,
  NotebookPen,
  Users,
} from "lucide-react";

/* =========================================================
   KONFIG + TIPE
========================================================= */
const USE_DUMMY = true;

type AnyRec = Record<string, any>;

export type StudentSummary = {
  id: string;
  name: string;
  // Properti lain opsional — tipe dibuat longgar agar kompatibel
  [key: string]: any;
};

type ClassStudentsMap = Record<string, StudentSummary[]>;

/* =========================================================
   DUMMY 15 SISWA
========================================================= */
const DUMMY_STUDENTS_15: AnyRec[] = [
  {
    id: "s-01",
    nis: "2025001",
    name: "Ahmad Fathir",
    gender: "L",
    phone: "081200000001",
    parentName: "Bpk. Fajar",
    importantNotes: ["Alergi kacang", "Asthma ringan (bawa inhaler)"],
  },
  {
    id: "s-02",
    nis: "2025002",
    name: "Aisyah Zahra",
    gender: "P",
    phone: "081200000002",
    parentName: "Ibu Rani",
    notes: ["Sedang proses mutasi kelas"],
  },
  {
    id: "s-03",
    nis: "2025003",
    name: "Muhammad Iqbal",
    gender: "L",
    phone: "081200000003",
    parentName: "Bpk. Dodi",
    flags: {
      finance: "Tunggakan SPP 1 bulan",
      behavior: "Perlu pendampingan fokus",
    },
  },
  {
    id: "s-04",
    nis: "2025004",
    name: "Siti Nurhaliza",
    gender: "P",
    phone: "081200000004",
    parentName: "Ibu Dewi",
    importantNotes: ["Punya kacamata minus tinggi"],
  },
  {
    id: "s-05",
    nis: "2025005",
    name: "Rafi Pratama",
    gender: "L",
    phone: "081200000005",
    parentName: "Bpk. Bayu",
    flags: ["Riwayat demam kejang 2019 (observasi bila demam)"],
  },
  {
    id: "s-06",
    nis: "2025006",
    name: "Nabila Kirana",
    gender: "P",
    phone: "081200000006",
    parentName: "Ibu Mira",
    notes: ["Sedang mengikuti lomba tahfiz (porsi hafalan bertahap)"],
  },
  {
    id: "s-07",
    nis: "2025007",
    name: "Fauzan Alfarizi",
    gender: "L",
    phone: "081200000007",
    parentName: "Bpk. Rudi",
    importantNotes: ["Alergi susu sapi"],
  },
  {
    id: "s-08",
    nis: "2025008",
    name: "Kayla Putri",
    gender: "P",
    phone: "081200000008",
    parentName: "Ibu Nadia",
    healthNote: "Pemulihan pasca flu (hindari aktivitas berat)",
  },
  {
    id: "s-09",
    nis: "2025009",
    name: "Zidan Maulana",
    gender: "L",
    phone: "081200000009",
    parentName: "Bpk. Salman",
    flags: { medical: "Alergi udang", finance: "Beasiswa 50%" },
  },
  {
    id: "s-10",
    nis: "2025010",
    name: "Alya Safira",
    gender: "P",
    phone: "081200000010",
    parentName: "Ibu Fitri",
    importantNotes: ["Anak pemalu, lebih nyaman kerja berpasangan"],
  },
  {
    id: "s-11",
    nis: "2025011",
    name: "Raka Dwi Saputra",
    gender: "L",
    phone: "081200000011",
    parentName: "Bpk. Andri",
    warning: "Sering terlambat (koordinasi dengan wali)",
  },
  {
    id: "s-12",
    nis: "2025012",
    name: "Nayla Khairunnisa",
    gender: "P",
    phone: "081200000012",
    parentName: "Ibu Sari",
    financeNote: "Pembayaran via transfer setiap tgl 5",
  },
  {
    id: "s-13",
    nis: "2025013",
    name: "Ilham Saputra",
    gender: "L",
    phone: "081200000013",
    parentName: "Bpk. Hendra",
    importantNotes: ["Butuh duduk di depan (minus -3)"],
  },
  {
    id: "s-14",
    nis: "2025014",
    name: "Aurel Maharani",
    gender: "P",
    phone: "081200000014",
    parentName: "Ibu Lilis",
    notes: ["Perlu ijin bila pulang lebih awal (terapi jam 15:30)"],
  },
  {
    id: "s-15",
    nis: "2025015",
    name: "Daffa Alvaro",
    gender: "L",
    phone: "081200000015",
    parentName: "Bpk. Raka",
    flags: ["Alergi debu (masker cadangan)"],
  },
];

/* =========================================================
   UTIL: Ambil catatan penting dari berbagai variasi field
========================================================= */
function extractImportantNotes(s: StudentSummary): string[] {
  const x = s as AnyRec;
  const notes: string[] = [];

  if (Array.isArray(x.importantNotes))
    notes.push(...x.importantNotes.filter(Boolean));
  if (typeof x.notes === "string" && x.notes.trim()) notes.push(x.notes.trim());
  if (Array.isArray(x.notes)) notes.push(...x.notes.filter(Boolean));

  if (Array.isArray(x.flags)) notes.push(...x.flags.filter(Boolean));
  else if (x.flags && typeof x.flags === "object") {
    Object.values(x.flags).forEach((v) => {
      if (typeof v === "string" && v.trim()) notes.push(v.trim());
    });
  }

  if (typeof x.warning === "string" && x.warning.trim())
    notes.push(x.warning.trim());
  if (x.healthNote?.trim) notes.push(x.healthNote.trim());
  if (x.financeNote?.trim) notes.push(x.financeNote.trim());

  return Array.from(
    new Set(notes.map((n) => String(n).trim()).filter(Boolean))
  );
}
function hasImportant(s: StudentSummary) {
  return extractImportantNotes(s).length > 0;
}

/* =========================================================
   DATA HOOK — Dummy map per classId
========================================================= */
function buildDummyMapFor(classId?: string): ClassStudentsMap {
  if (!classId) return {};
  return { [classId]: DUMMY_STUDENTS_15 as StudentSummary[] };
}

function useClassStudentsSingle(classId?: string) {
  return useQuery({
    queryKey: ["class-students", classId, USE_DUMMY ? "dummy" : "live"],
    queryFn: async (): Promise<ClassStudentsMap> => {
      if (!classId) return {};
      // Mode dummy (default)
      if (USE_DUMMY) return buildDummyMapFor(classId);

      // ==== (Opsional) Mode LIVE ====
      // Ganti dengan import real saat BE siap:
      // const { fetchStudentsByClasses } = await import("../types/teacherClass");
      // return fetchStudentsByClasses([classId]);
      return buildDummyMapFor(classId);
    },
    enabled: !!classId,
    staleTime: Infinity,
  });
}

/* =========================================================
   ROW KOMPONEN
========================================================= */
function StudentRow({ s }: { s: StudentSummary }) {
  const anyS = s as AnyRec;
  const notes = extractImportantNotes(s);

  const nis = anyS.nis || anyS.studentId || anyS.code || "-";
  const gender = anyS.gender || anyS.sex || "";
  const phone = anyS.phone || anyS.parentPhone || anyS.guardianPhone;
  const guardian = anyS.parentName || anyS.guardianName || anyS.wali || "";

  return (
    <Card className="p-4 hover:shadow-sm transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Left: identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <User2 size={18} className="shrink-0" />
            <h3 className="font-medium truncate">{s.name}</h3>
            {hasImportant(s) && (
              <Badge variant="destructive" className="ml-1 gap-1">
                <AlertTriangle size={12} />
                Penting
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>NIS: {nis}</span>
            {gender ? <span>• {gender}</span> : null}
            {guardian ? (
              <span className="flex items-center gap-1">
                • <Users size={12} />
                Wali: {guardian}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {phone ? (
            <a href={`tel:${phone}`}>
              <Button variant="secondary" size="sm" className="gap-1">
                <Phone size={14} />
                Telepon
              </Button>
            </a>
          ) : null}
        </div>
      </div>

      {/* Notes */}
      {notes.length > 0 ? (
        <div className="mt-3 text-sm">
          <div className="flex items-center gap-2 font-medium mb-1">
            <NotebookPen size={14} />
            Keterangan penting
          </div>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground italic">
          Tidak ada keterangan penting.
        </p>
      )}
    </Card>
  );
}

/* =========================================================
   HALAMAN UTAMA
   Route disarankan: /teacher/classes/:classId/students
========================================================= */
const TeacherClassStudentsList: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const { data: map = {}, isLoading } = useClassStudentsSingle(classId);
  const students: StudentSummary[] = useMemo(() => {
    if (!classId) return [];
    return (map as ClassStudentsMap)[classId] ?? [];
  }, [map, classId]);

  // Pencarian & filter ringan
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);

  const [onlyImportant, setOnlyImportant] = useState<"all" | "important">(
    "all"
  );

  const filtered = useMemo(() => {
    let list = students;
    if (deferredQ.trim()) {
      const k = deferredQ.toLowerCase();
      list = list.filter((s) => {
        const anyS = s as AnyRec;
        const joinedNotes = extractImportantNotes(s).join(" ").toLowerCase();
        return (
          s.name.toLowerCase().includes(k) ||
          String(anyS.nis || anyS.studentId || "")
            .toLowerCase()
            .includes(k) ||
          joinedNotes.includes(k)
        );
      });
    }
    if (onlyImportant === "important") list = list.filter(hasImportant);
    // Urutkan: yang punya catatan penting di atas
    list = [...list].sort(
      (a, b) => Number(hasImportant(b)) - Number(hasImportant(a))
    );
    return list;
  }, [students, deferredQ, onlyImportant]);

  return (
    <div className="w-full bg-background text-foreground py-6">
      <main className="max-w-5xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-1"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl font-semibold">Daftar Siswa</h1>
          </div>
        </div>

        {/* Filter bar */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-muted-foreground" />
            <Input
              placeholder="Cari nama/NIS/keterangan penting…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              value={onlyImportant}
              onValueChange={(v: "all" | "important") => setOnlyImportant(v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter catatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua siswa</SelectItem>
                <SelectItem value="important">Hanya yang penting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Content */}
        {isLoading ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Memuat daftar siswa…
          </Card>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((s) => (
              <StudentRow key={(s as AnyRec).id ?? s.name} s={s} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center space-y-2">
            <Search className="mx-auto text-muted-foreground" size={28} />
            <p className="font-medium">Tidak ada siswa ditemukan</p>
            <p className="text-sm text-muted-foreground">
              Coba ubah kata kunci atau reset filter.
            </p>
            <div className="pt-2">
              <Button variant="outline" onClick={() => setQ("")}>
                Reset Pencarian
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TeacherClassStudentsList;
