// src/pages/teacher/classes/TeacherCSSTStudentList.tsx
import React, { useMemo, useState, useDeferredValue, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
import {
  Phone,
  Users,
  AlertTriangle,
  NotebookPen,
  ArrowLeft,
} from "lucide-react";

/* ---------- DataTable ---------- */
import {
  CDataTable,
  type ColumnDef,
  type Align,
} from "@/components/costum/table/CDataTable";

import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* =========================================================
   TIPE
========================================================= */
type AnyRec = Record<string, any>;

export type StudentSummary = {
  id: string; // school_student_id
  name: string; // nama siswa
  [key: string]: any;
};

/* =========================================================
   UTIL CATATAN
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
   API: AMBIL SISWA BERDASARKAN CSST_ID
   GET /u/student-class-section-subject-teachers/list?csst_id=...
========================================================= */





/* ======================================================
   DUMMY STUDENTS (untuk Wali Kelas)
====================================================== */
const DUMMY_STUDENTS: StudentSummary[] = [
  {
    id: "stu-1",
    name: "Ahmad Fauzi",
    gender: "L",
    phone: "081234567890",
    guardian: "Bpk. Fauzan",
    importantNotes: ["Sering lupa buku", "Perlu perhatian tambahan"],
  },
  {
    id: "stu-2",
    name: "Aisyah Rahma",
    gender: "P",
    phone: "081312345678",
    guardian: "Ibu Rani",
    importantNotes: ["Alergi makanan tertentu"],
  },
  {
    id: "stu-3",
    name: "Muhammad Iqbal",
    gender: "L",
    phone: "08199887766",
    guardian: "Bpk. Ilyas",
  },
  {
    id: "stu-4",
    name: "Siti Zulaikha",
    gender: "P",
    phone: "081567891234",
    guardian: "Ibu Sarah",
    notes: ["Perlu bimbingan membaca"],
  },
  {
    id: "stu-5",
    name: "Rizki Maulana",
    gender: "L",
    phone: "",
    guardian: "Bpk. Hilmi",
  },
];


/* =========================================================
   PAGE
========================================================= */
const TeacherCSSTStudentList: React.FC = () => {
  const navigate = useNavigate();
  const { classSectionId: csstId } = useParams();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Daftar Murid",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Wali kelas" },
        { label: "Detail Kelas", href: `wali-kelas/${csstId}` },
        { label: "Daftar Murid" },
      ],
      showBack: true,
    });
  }, [setHeader, csstId]);

  const sectionKey = csstId;

  console.log("[TeacherCSSTStudentList] route params =", {
    csstId,
    sectionKey,
  });

  const students = DUMMY_STUDENTS;
  const isLoading = false;
  const isError = false;


  const rawStudents: StudentSummary[] = students;

  const [q] = useState("");
  const deferredQ = useDeferredValue(q);
  const [onlyImportant, setOnlyImportant] = useState<"all" | "important">(
    "all"
  );

  const normalized = useMemo(() => {
    const k = deferredQ.trim().toLowerCase();
    let list = rawStudents.map((s) => {
      const anyS = s as AnyRec;
      const gender = anyS.gender || "";
      const phone = anyS.phone || "";
      const guardian = anyS.parentName || "";
      const notesArr = extractImportantNotes(s);
      const __notes = notesArr.join(" ");
      return {
        ...s,
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
          s.guardian.toLowerCase().includes(k) ||
          s.__notes.toLowerCase().includes(k) ||
          String(s.id).toLowerCase().includes(k)
      );
    }

    if (onlyImportant === "important") {
      list = list.filter((s) => s.__hasImportant);
    }

    list = [...list].sort(
      (a, b) => Number(b.__hasImportant) - Number(a.__hasImportant)
    );

    console.log(
      "[TeacherCSSTStudentList] normalized rows =",
      list.length,
      "items"
    );

    return list;
  }, [rawStudents, deferredQ, onlyImportant]);

  /* =========================================================
     Builder path detail (relative)
     /guru-mapel/:csstId/murid  → + /:id
  ========================================================= */
  const toStudentDetailPath = (studentId: string) =>
    `${encodeURIComponent(studentId)}`;

  /* =========================================================
     Kolom
  ========================================================= */
  const columns: ColumnDef<
    StudentSummary & {
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
        cell: (s) => {
          const anyS = s as AnyRec;
          const waUrl = (anyS._waUrl || anyS._parentWaUrl) as string | undefined;

          if (waUrl) {
            return (
              <a href={waUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm" className="gap-1">
                  <Phone size={14} />
                  WhatsApp
                </Button>
              </a>
            );
          }

          return s.phone ? (
            <a href={`tel:${s.phone}`}>
              <Button variant="secondary" size="sm" className="gap-1">
                <Phone size={14} />
                Telp
              </Button>
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
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
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Top bar */}
          <div className="md:flex hidden items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold md:flex-xl">Daftar Murid</h1>
          </div>

          <CDataTable
            controlsPlacement="above"
            searchPlaceholder="Cari nama/wali/keterangan…"
            statsSlot={statsSlot}
            loading={isLoading && !!sectionKey}
            error={
              isError
                ? "Gagal memuat data murid."
                : !sectionKey
                  ? "CSST ID tidak ditemukan di URL."
                  : null
            }
            columns={columns}
            rows={normalized}
            getRowId={(s: AnyRec) => s.id ?? s.name}
            pageSize={20}
            onRowClick={(row) => navigate(toStudentDetailPath(row.id))}
          />
        </div>
      </main>
    </div>
  );
};

export default TeacherCSSTStudentList;
