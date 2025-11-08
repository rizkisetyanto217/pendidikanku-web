// src/pages/teacher/classes/TeacherClassStudentsList.tsx
import React, { useMemo, useState, useDeferredValue } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/* ---------- shadcn/ui ---------- */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- Icons ---------- */
import { Phone, Users, AlertTriangle, NotebookPen } from "lucide-react";

/* ---------- DataTable ---------- */
import {
  CDataTable,
  type ColumnDef,
  type Align,
} from "@/components/costum/table/CDataTable";

/* =========================================================
   KONFIG + TIPE
========================================================= */
const USE_DUMMY = true;

type AnyRec = Record<string, any>;

export type StudentSummary = {
  id: string;
  name: string;
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
   UTIL
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
   DUMMY QUERY HOOK
========================================================= */
function buildDummyMapFor(key?: string): ClassStudentsMap {
  const k = key || "dummy-class";
  return { [k]: DUMMY_STUDENTS_15 as StudentSummary[] };
}

function useClassStudentsSingle(key?: string) {
  return useQuery({
    queryKey: ["class-students", key, USE_DUMMY ? "dummy" : "live"],
    queryFn: async (): Promise<ClassStudentsMap> => {
      if (USE_DUMMY) return buildDummyMapFor(key);
      return buildDummyMapFor(key);
    },
    enabled: true,
    staleTime: Infinity,
  });
}

/* =========================================================
   PAGE
========================================================= */
const TeacherClassStudentsList: React.FC = () => {
  const navigate = useNavigate();

  // ambil berbagai param biar slug apapun aman
  const { classId, classSlug, kelasId, id } = useParams<{
    classId?: string;
    classSlug?: string;
    kelasId?: string;
    id?: string;
  }>();
  const classKey = classId || classSlug || kelasId || id || "dummy-class";

  const {
    data: map = {},
    isLoading,
    isError,
  } = useClassStudentsSingle(classKey);

  const rawStudents: StudentSummary[] = USE_DUMMY
    ? (DUMMY_STUDENTS_15 as StudentSummary[])
    : (map as ClassStudentsMap)[classKey] ?? [];

  const [q] = useState("");
  const deferredQ = useDeferredValue(q);
  const [onlyImportant, setOnlyImportant] = useState<"all" | "important">(
    "all"
  );

  const normalized = useMemo(() => {
    const k = deferredQ.trim().toLowerCase();
    let list = rawStudents.map((s) => {
      const anyS = s as AnyRec;
      const nis = anyS.nis || "-";
      const gender = anyS.gender || "";
      const phone = anyS.phone || "";
      const guardian = anyS.parentName || "";
      const notesArr = extractImportantNotes(s);
      const __notes = notesArr.join(" ");
      return {
        ...s,
        nis,
        gender,
        phone,
        guardian,
        __notes,
        __hasImportant: notesArr.length > 0,
      };
    });

    if (k) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(k) ||
          s.nis.toLowerCase().includes(k) ||
          s.guardian.toLowerCase().includes(k) ||
          s.__notes.toLowerCase().includes(k)
      );
    }

    if (onlyImportant === "important") {
      list = list.filter((s) => s.__hasImportant);
    }

    list = [...list].sort(
      (a, b) => Number(b.__hasImportant) - Number(a.__hasImportant)
    );
    return list;
  }, [rawStudents, deferredQ, onlyImportant]);

  /* =========================================================
     Builder path detail
  ========================================================= */
  // menjadi ini:
  const toStudentDetailPath = (studentId: string) =>
    `${encodeURIComponent(studentId)}`;

  /* =========================================================
     Kolom
  ========================================================= */
  const columns: ColumnDef<
    StudentSummary & {
      nis: string;
      gender: string;
      phone: string;
      guardian: string;
      __notes: string;
      __hasImportant: boolean;
    }
  >[] = [
    {
      id: "name",
      header: "Nama",
      minW: "220px",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{s.name}</span>
          {s.__hasImportant && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle size={12} />
              Penting
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "nis",
      header: "NIS",
      align: "center" as Align,
      cell: (s) => s.nis,
    },
    {
      id: "gender",
      header: "JK",
      align: "center" as Align,
      cell: (s) =>
        s.gender ? (
          <Badge variant="outline" className="uppercase">
            {s.gender}
          </Badge>
        ) : (
          "-"
        ),
    },
    {
      id: "guardian",
      header: "Wali",
      minW: "180px",
      cell: (s) =>
        s.guardian ? (
          <span className="inline-flex items-center gap-1">
            <Users size={12} />
            {s.guardian}
          </span>
        ) : (
          "-"
        ),
    },
    {
      id: "notes",
      header: "Catatan",
      minW: "320px",
      cell: (s) => {
        const items = extractImportantNotes(s);
        if (!items.length)
          return <span className="text-muted-foreground">—</span>;
        const [first, ...rest] = items;
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2 font-medium mb-0.5">
              <NotebookPen size={14} />
              <span>Keterangan penting</span>
            </div>
            <div className="text-muted-foreground">
              {first}
              {rest.length ? ` (+${rest.length} lagi)` : ""}
            </div>
          </div>
        );
      },
    },
    {
      id: "phone",
      header: "Kontak",
      align: "center" as Align,
      cell: (s) =>
        s.phone ? (
          <a href={`tel:${s.phone}`}>
            <Button variant="secondary" size="sm" className="gap-1">
              <Phone size={14} />
              Telp
            </Button>
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  /* =========================================================
     Stats di atas tabel
  ========================================================= */
  const statsSlot = (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div>
        Total siswa: <span className="font-medium">{rawStudents.length}</span>
      </div>
      <div>
        Dengan catatan penting:{" "}
        <span className="font-medium">
          {rawStudents.filter(hasImportant).length}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-muted-foreground">Filter:</span>
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
    </div>
  );

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 lg:gap-6">
          <CDataTable
            title="Daftar Siswa"
            onBack={() => navigate(-1)}
            controlsPlacement="above"
            searchPlaceholder="Cari nama/NIS/wali/keterangan…"
            statsSlot={statsSlot}
            loading={isLoading}
            error={isError ? "Gagal memuat data siswa." : null}
            columns={columns}
            rows={normalized}
            getRowId={(s: AnyRec) => s.id ?? s.nis ?? s.name}
            pageSize={20}
            onRowClick={(row) => navigate(toStudentDetailPath(row.id))}
          />
        </div>
      </main>
    </div>
  );
};

export default TeacherClassStudentsList;
