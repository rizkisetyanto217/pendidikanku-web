// src/pages/dashboard/student/StudentCSSTStudentsList.tsx
import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ArrowLeft, Search, Users, User, UserCircle2 } from "lucide-react";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
// import api from "@/lib/axios";

/* =========================================================
   KONFIG + TIPE
========================================================= */
const USE_DUMMY = true;

type Gender = "L" | "P";

type StudentRow = {
  id: string;
  name: string;
  nis?: string;
  gender?: Gender;
  isSelf?: boolean;
};

type CSSTStudentsQueryParams = {
  csstId: string;
};

/* =========================================================
   DUMMY DATA — daftar murid satu CSST
========================================================= */
/* =========================================================
   DUMMY DATA — daftar murid satu CSST
========================================================= */
const BASE_DUMMY_STUDENTS: Omit<StudentRow, "isSelf">[] = [
  { id: "s-01", name: "Ahmad Fathir", nis: "2025-001", gender: "L" },
  { id: "s-02", name: "Aisyah Zahra", nis: "2025-002", gender: "P" },
  { id: "s-03", name: "Muhammad Iqbal", nis: "2025-003", gender: "L" },
  { id: "s-04", name: "Siti Nurhaliza", nis: "2025-004", gender: "P" },
  { id: "s-05", name: "Rafi Pratama", nis: "2025-005", gender: "L" },
  { id: "s-06", name: "Nabila Kirana", nis: "2025-006", gender: "P" },
  { id: "s-07", name: "Fauzan Alfarizi", nis: "2025-007", gender: "L" },
  { id: "s-08", name: "Kayla Putri", nis: "2025-008", gender: "P" },
  { id: "s-09", name: "Zidan Maulana", nis: "2025-009", gender: "L" },
  { id: "s-10", name: "Alya Safira", nis: "2025-010", gender: "P" },
  { id: "s-11", name: "Raka Dwi Saputra", nis: "2025-011", gender: "L" },
  { id: "s-12", name: "Nayla Khairunnisa", nis: "2025-012", gender: "P" },
  { id: "s-13", name: "Ilham Saputra", nis: "2025-013", gender: "L" },
  { id: "s-14", name: "Aurel Maharani", nis: "2025-014", gender: "P" },
  { id: "s-15", name: "Daffa Alvaro", nis: "2025-015", gender: "L" },
];

const DUMMY_STUDENTS: StudentRow[] = BASE_DUMMY_STUDENTS.map((s, idx) =>
  idx === 0
    ? {
        ...s,
        isSelf: true,
      }
    : s
);


/* =========================================================
   FETCH HOOK (dummy / nanti bisa diganti ke BE)
========================================================= */
async function fetchCSSTStudentsDummy(
  _params: CSSTStudentsQueryParams
): Promise<StudentRow[]> {
  // di real implementation bisa filter by csstId,
  // tapi untuk dummy kita return static
  return DUMMY_STUDENTS;
}

function useCSSTStudents(params: CSSTStudentsQueryParams) {
  return useQuery({
    queryKey: ["csst-students", params, USE_DUMMY ? "dummy" : "live"],
    queryFn: async () => {
      if (USE_DUMMY) return fetchCSSTStudentsDummy(params);

      // === LIVE (ganti sesuai BE) ===
      // const res = await api.get(
      //   `/api/u/class-section-subject-teachers/${params.csstId}/students`
      // );
      // return res.data.data as StudentRow[];
      return fetchCSSTStudentsDummy(params);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* =========================================================
   UI HELPERS
========================================================= */
function GenderBadge({ gender }: { gender?: Gender }) {
  if (!gender) return null;
  const isL = gender === "L";
  return (
    <Badge variant={isL ? "secondary" : "outline"} className="gap-1 text-xs">
      <User size={12} />
      {isL ? "Laki-laki" : "Perempuan"}
    </Badge>
  );
}

/* =========================================================
   KOMPONEN UTAMA — daftar murid untuk role student
   contoh route: /student/csst/:csstId/students
========================================================= */
const StudentCSSTStudentsList: React.FC = () => {
  const navigate = useNavigate();
  const { csstId = "" } = useParams<{ csstId: string }>();
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Teman Sekelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas Saya" },
        { label: "Detail Mapel" },
        { label: "Teman Sekelas" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);

  const { data: rows = [], isLoading } = useCSSTStudents({ csstId });

  const filtered = useMemo(() => {
    let list = rows;
    if (dq.trim()) {
      const k = dq.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(k) ||
          (r.nis || "").toLowerCase().includes(k) ||
          r.id.toLowerCase().includes(k)
      );
    }

    // sort: diri sendiri di atas, lalu nama ASC
    list = [...list].sort((a, b) => {
      if (a.isSelf && !b.isSelf) return -1;
      if (!a.isSelf && b.isSelf) return 1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [rows, dq]);

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Header local (backup kalau header global nggak muncul di mobile) */}
        <div className="flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Teman Sekelas</h1>
              <p className="text-xs text-muted-foreground">
                Mapel / kelas: {csstId || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <UserCircle2 size={18} />
                Daftar Murid
              </h2>
              <p className="text-sm text-muted-foreground">
                Ini adalah daftar murid yang terdaftar di kelas/mapel ini.
              </p>
            </div>
            <Badge className="gap-1">
              <Users size={12} /> Total murid: {rows.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search size={18} className="text-muted-foreground" />
            <Input
              placeholder="Cari nama / NIS / ID murid…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </Card>

        {/* TABEL */}
        <Card className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden sm:table-cell">NIS</TableHead>
                  <TableHead className="hidden sm:table-cell">Gender</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Memuat daftar murid…
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((r, idx) => (
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/60"
                      // kalau nanti mau detail per murid:
                      // onClick={() =>
                      //   navigate(`/student/csst/${csstId}/students/${r.id}`)
                      // }
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{r.name}</span>
                          {r.isSelf && (
                            <span className="text-xs text-primary mt-0.5">
                              (Ini kamu)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {r.nis || "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <GenderBadge gender={r.gender} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.isSelf
                          ? "Akun kamu di kelas ini"
                          : "Teman sekelas di mapel ini"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search size={20} />
                        <p className="font-medium text-foreground">
                          Tidak ada murid
                        </p>
                        <p className="text-sm">
                          Coba cek lagi kelas/mapelnya atau hubungi admin
                          sekolah.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
};

export default StudentCSSTStudentsList;
