// src/pages/dashboard/teacher/TeacherCSSTStudentsList.tsx
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
import {
  ArrowLeft,
  Search,
  Users,
  User,
  MessageCircle,
  UserCircle2,
  NotebookPen,

} from "lucide-react";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import api from "@/lib/axios";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

import CRowActions from "@/components/costum/table/CRowAction";

/* =========================================================
   KONFIG + TIPE
========================================================= */
const USE_DUMMY = false;

type Gender = "L" | "P";

type TeacherStudentRow = {
  id: string;
  name: string;
  nis?: string;
  gender?: Gender;
  avatarUrl?: string;
  whatsappUrl?: string;
  parentName?: string;
  parentWhatsappUrl?: string;
  isActive: boolean;
};

type CSSTStudentsQueryParams = {
  csstId: string;
};

/* =========================================================
   TIPE API
========================================================= */

type ApiStudentCSSTItem = {
  student_class_section_subject_teacher_id: string;
  student_class_section_subject_teacher_school_id: string;
  student_class_section_subject_teacher_student_id: string;
  student_class_section_subject_teacher_csst_id: string;
  student_class_section_subject_teacher_is_active: boolean;

  student_class_section_subject_teacher_user_profile_name_snapshot?:
  | string
  | null;
  student_class_section_subject_teacher_user_profile_avatar_url_snapshot?:
  | string
  | null;
  student_class_section_subject_teacher_user_profile_whatsapp_url?:
  | string
  | null;
  student_class_section_subject_teacher_user_profile_parent_name_snapshot?:
  | string
  | null;
  student_class_section_subject_teacher_user_profile_parent_whatsapp_url?:
  | string
  | null;
  student_class_section_subject_teacher_user_profile_gender_snapshot?:
  | string
  | null;

  student_class_section_subject_teacher_student_code_snapshot?: string | null;
};

type ApiStudentCSSTListResponse = {
  success: boolean;
  message: string;
  data: ApiStudentCSSTItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    count: number;
    per_page_options: number[];
  };
};

function mapGender(raw?: string | null): Gender | undefined {
  if (!raw) return undefined;
  if (raw === "L" || raw === "P") return raw;
  return undefined;
}

function mapApiToTeacherRows(items: ApiStudentCSSTItem[]): TeacherStudentRow[] {
  return items.map((it) => ({
    id: it.student_class_section_subject_teacher_student_id,
    name:
      it.student_class_section_subject_teacher_user_profile_name_snapshot ??
      "Tanpa nama",
    nis:
      it.student_class_section_subject_teacher_student_code_snapshot ??
      undefined,
    gender: mapGender(
      it.student_class_section_subject_teacher_user_profile_gender_snapshot
    ),
    avatarUrl:
      it.student_class_section_subject_teacher_user_profile_avatar_url_snapshot ??
      undefined,
    whatsappUrl:
      it.student_class_section_subject_teacher_user_profile_whatsapp_url ??
      undefined,
    parentName:
      it.student_class_section_subject_teacher_user_profile_parent_name_snapshot ??
      undefined,
    parentWhatsappUrl:
      it.student_class_section_subject_teacher_user_profile_parent_whatsapp_url ??
      undefined,
    isActive: it.student_class_section_subject_teacher_is_active,
  }));
}

/* =========================================================
   FETCH HOOK
========================================================= */
async function fetchCSSTStudentsLive(
  params: CSSTStudentsQueryParams
): Promise<TeacherStudentRow[]> {
  const res = await api.get<ApiStudentCSSTListResponse>(
    "/api/u/student-class-section-subject-teachers/list",
    {
      params: {
        csst_id: params.csstId,
      },
    }
  );

  const items = res.data?.data ?? [];
  return mapApiToTeacherRows(items);
}

function useCSSTTeacherStudents(params: CSSTStudentsQueryParams) {
  return useQuery<TeacherStudentRow[]>({
    queryKey: ["csst-students-teacher", params.csstId],
    queryFn: async () => {
      if (!params.csstId) return [];
      if (USE_DUMMY) return []; // placeholder kalau mau dummy
      return fetchCSSTStudentsLive(params);
    },
    enabled: !!params.csstId,
    staleTime: 5 * 60 * 1000,
  });
}

/* =========================================================
   UI HELPERS
========================================================= */

function buildWhatsAppLink(urlFromApi?: string) {
  if (!urlFromApi) return undefined;
  return urlFromApi; // BE sudah kasih https://wa.me/...
}

// =========================================================
// UTIL: Ambil catatan penting (mirip TeacherCSSTStudentList)
// =========================================================
type AnyRec = Record<string, any>;

function extractImportantNotes(s: AnyRec): string[] {
  const notes: string[] = [];

  if (Array.isArray(s.importantNotes)) notes.push(...s.importantNotes);
  if (typeof s.notes === "string") notes.push(s.notes);
  if (Array.isArray(s.notes)) notes.push(...s.notes);

  if (Array.isArray(s.flags)) notes.push(...s.flags);
  else if (s.flags && typeof s.flags === "object") {
    Object.values(s.flags).forEach((v) => {
      if (typeof v === "string" && v.trim()) notes.push(v.trim());
    });
  }

  if (typeof s.warning === "string") notes.push(s.warning);
  if (typeof s.healthNote === "string") notes.push(s.healthNote);
  if (typeof s.financeNote === "string") notes.push(s.financeNote);

  return Array.from(new Set(notes.map((n) => n.trim()).filter(Boolean)));
}

/* =========================================================
   KOMPONEN UTAMA
========================================================= */
const TeacherCSSTStudentsList: React.FC = () => {
  const navigate = useNavigate();
  const { csstId = "" } = useParams<{ csstId: string }>();
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Daftar Murid",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru Mapel" },
        { label: "Detail Mapel" },
        { label: "Daftar Murid" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  // Guard kalau route nggak punya :csstId
  if (!csstId) {
    return (
      <div className="w-full bg-background text-foreground">
        <main className="mx-auto space-y-4">
          <div className="md:flex hidden items-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="font-semibold text-lg md:text-xl">Daftar Murid</h1>
          </div>
          <Card className="p-4 space-y-2">
            <div className="text-destructive text-sm font-medium">
              Gagal memuat data.
            </div>
            <div className="text-xs text-muted-foreground">
              CSST ID tidak ditemukan di URL.
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useCSSTTeacherStudents({ csstId });

  const filtered = useMemo(() => {
    let list = rows;
    if (dq.trim()) {
      const k = dq.toLowerCase();
      list = list.filter((r) => {
        const parentName = r.parentName || "";
        return (
          r.name.toLowerCase().includes(k) ||
          (r.nis || "").toLowerCase().includes(k) ||
          parentName.toLowerCase().includes(k) ||
          r.id.toLowerCase().includes(k)
        );
      });
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, dq]);

  const total = rows.length;
  const totalL = rows.filter((r) => r.gender === "L").length;
  const totalP = rows.filter((r) => r.gender === "P").length;

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Header local (backup mobile) */}
        <div className="flex items-center justify-between">
          <div className="md:flex hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Daftar Murid</h1>
              <p className="text-xs text-muted-foreground">
                Mapel / kelas: {csstId}
              </p>
            </div>
          </div>
        </div>

        {/* Summary & Search */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <UserCircle2 size={18} />
                Daftar Murid Mapel
              </h2>
              <p className="text-sm text-muted-foreground">
                Data murid lengkap dengan kontak dan orang tua.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1">
                <Users size={12} /> Total: {total}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <User size={12} /> L: {totalL}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <User size={12} /> P: {totalP}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <Search size={18} className="text-muted-foreground" />
            <Input
              placeholder="Cari nama murid / NIS / orang tua…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </Card>

        {/* TABLE */}
        <Card className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[56px]">No</TableHead>
                  <TableHead>Murid</TableHead>
                  <TableHead className="hidden sm:table-cell">NIS</TableHead>
                  <TableHead className="hidden sm:table-cell">L/P</TableHead>
                  <TableHead className="hidden md:table-cell">Kontak Murid </TableHead>
                  <TableHead className="hidden md:table-cell">Catatan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Memuat daftar murid…
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-destructive text-sm"
                    >
                      Gagal memuat daftar murid. Coba refresh atau hubungi
                      admin.
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((r, idx) => {
                    const waStudent = buildWhatsAppLink(r.whatsappUrl);

                    return (
                      <TableRow
                        key={r.id}
                        className="
                          group/row 
                          border-b border-border 
                          transition-all duration-150 
                          cursor-pointer
                          hover:bg-primary/5 
                          hover:border-primary 
                          hover:shadow-sm
                        "
                      >

                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{r.name}</span>
                              <span className="text-[11px] text-muted-foreground">
                                ID: {r.id.slice(0, 8)}…
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          <span className="font-mono text-xs">
                            {r.nis || "-"}
                          </span>
                        </TableCell>

                        <TableCell className="hidden sm:table-cell">
                          {r.gender ? (
                            <Badge variant="outline" className="uppercase">
                              {r.gender}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>


                        {/* Kontak murid */}
                        <TableCell className="hidden md:table-cell text-xs">
                          {waStudent ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                <a
                                  href={waStudent}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-primary"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Catatan */}
                        <TableCell className="hidden md:table-cell text-xs">
                          {(() => {
                            const items = extractImportantNotes(r);
                            if (!items.length)
                              return <span className="text-muted-foreground">-</span>;

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
                          })()}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <CBadgeStatus
                            status={r.isActive ? "active" : "inactive"}
                            className="text-[10px]"
                          />
                        </TableCell>

                        {/* Aksi */}
                        <TableCell>
                          <CRowActions
                            mode="inline"
                            size="sm"
                            row={r}
                            onView={() => navigate(`/guru/murid/${r.id}`)}
                            onEdit={() => navigate(`/guru/murid/edit/${r.id}`, { state: { student: r } })}
                            onDelete={async () => {
                              console.log("DELETE:", r.id);
                              // TODO: panggil API delete jika sudah ada endpoint
                            }}
                          />
                        </TableCell>


                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search size={20} />
                        <p className="font-medium text-foreground">
                          Tidak ada murid
                        </p>
                        <p className="text-sm">
                          Coba cek kembali kelas/mapel atau hubungi admin
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

export default TeacherCSSTStudentsList;
