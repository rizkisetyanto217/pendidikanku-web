// src/pages/teacher/classes/TeacherCSSTStudentList.tsx
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

import api from "@/lib/axios";

/* =========================================================
   TIPE
========================================================= */
type AnyRec = Record<string, any>;

export type StudentSummary = {
  id: string; // school_student_id
  name: string; // nama siswa
  [key: string]: any;
};

/* ====== API TYPES (sesuai contoh respons) ====== */

type ApiStudentClassSection = {
  student_class_section_id: string;
  student_class_section_school_student_id: string;
  student_class_section_section_id: string;
  student_class_section_school_id: string;
  student_class_section_section_slug_snapshot: string;
  student_class_section_status: string;
  student_class_section_user_profile_name_snapshot?: string | null;
  student_class_section_user_profile_avatar_url_snapshot?: string | null;
  student_class_section_user_profile_whatsapp_url_snapshot?: string | null;
  student_class_section_assigned_at?: string | null;
  student_class_section_created_at?: string | null;
  student_class_section_updated_at?: string | null;
};

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_total_students: number;
  class_sections_student_class_sections_active_count: number;
  class_sections_student_class_sections_count: number;
  class_sections_student_class_sections: ApiStudentClassSection[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: ApiClassSection[];
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
   API: AMBIL SISWA BERDASARKAN CLASS_SECTION_ID
========================================================= */

async function fetchStudentsByClassSection(
  sectionId?: string
): Promise<StudentSummary[]> {
  if (!sectionId) {
    console.warn(
      "[TeacherCSSTStudentList] fetchStudentsByClassSection dipanggil tanpa sectionId"
    );
    return [];
  }

  console.log(
    "[TeacherCSSTStudentList] Fetch students for class_section_id =",
    sectionId
  );

  // NOTE: baseURL api kemungkinan sudah /api
  const res = await api.get<ApiResponse>("/u/class-sections/list", {
    params: {
      id: sectionId,
      with_student_class_sections: true,
    },
  });

  console.log(
    "[TeacherCSSTStudentList] API /u/class-sections/list response:",
    res.data
  );

  const sections = res.data?.data ?? [];
  const result: StudentSummary[] = [];
  const seen = new Set<string>();

  for (const sec of sections) {
    const students = sec.class_sections_student_class_sections || [];
    for (const sc of students) {
      const sid = sc.student_class_section_school_student_id;
      if (!sid || seen.has(sid)) continue;
      seen.add(sid);

      const name =
        sc.student_class_section_user_profile_name_snapshot ||
        "Siswa tanpa nama";

      const waUrl =
        sc.student_class_section_user_profile_whatsapp_url_snapshot || "";

      let phoneFromWa = "";
      if (typeof waUrl === "string" && waUrl.includes("wa.me")) {
        // https://wa.me/6285xxxx → ambil angka belakang
        const parts = waUrl.split("wa.me/");
        phoneFromWa = parts[1] ?? "";
      }

      result.push({
        id: sid,
        name,
        // nis dihapus, belum ada di payload
        gender: "", // belum ada di payload
        phone: phoneFromWa,
        parentName: "",
        _waUrl: waUrl,
        _sectionId: sc.student_class_section_section_id,
      });
    }
  }

  console.log(
    "[TeacherCSSTStudentList] mapped StudentSummary count =",
    result.length,
    "items:",
    result
  );

  return result;
}

function useClassStudentsSingle(sectionId?: string) {
  return useQuery<StudentSummary[]>({
    queryKey: ["class-students", sectionId],
    queryFn: () => fetchStudentsByClassSection(sectionId),
    enabled: !!sectionId, // ⬅️ jangan fetch kalau belum ada id
    staleTime: 60_000,
  });
}

/* =========================================================
   PAGE
========================================================= */
const TeacherCSSTStudentList: React.FC = () => {
  const navigate = useNavigate();

  // ambil berbagai param; yang penting: segment yang berisi class_section_id
  const { id, classSectionId, sectionId, classId, classSlug, kelasId } =
    useParams<{
      id?: string;
      classSectionId?: string;
      sectionId?: string;
      classId?: string;
      classSlug?: string;
      kelasId?: string;
    }>();

  // prioritas: param yang memang untuk class_section_id
  const sectionKey =
    classSectionId || sectionId || id || classId || classSlug || kelasId;

  console.log("[TeacherCSSTStudentList] route params =", {
    id,
    classSectionId,
    sectionId,
    classId,
    classSlug,
    kelasId,
    sectionKey,
  });

  const {
    data: students = [],
    isLoading,
    isError,
  } = useClassStudentsSingle(sectionKey);

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
     Builder path detail
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
        const waUrl = anyS._waUrl as string | undefined;

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
          <CDataTable
            title="Daftar Murid"
            onBack={() => navigate(-1)}
            controlsPlacement="above"
            searchPlaceholder="Cari nama/wali/keterangan…"
            statsSlot={statsSlot}
            loading={isLoading && !!sectionKey}
            error={
              isError
                ? "Gagal memuat data murid."
                : !sectionKey
                ? "Class section ID tidak ditemukan di URL."
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
