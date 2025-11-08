// src/pages/sekolahislamku/teacher/DetailGrading.tsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Users, FileText, Clock } from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import ModalGrading from "./components/CTeacherModalGrading";

type Submission = {
  id: string;
  studentName: string;
  status: "submitted" | "graded" | "missing";
  score?: number;
  submittedAt?: string;
};

type NavState = {
  assignment?: {
    id: string;
    title: string;
    className: string;
    dueDate?: string;
    total?: number;
  };
  className?: string;
  submissions?: Submission[];
};

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

export default function TeacherDetailAssignementCSST() {
  const { id: classId, assignmentId } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const { state } = useLocation() as { state?: NavState };
  const navigate = useNavigate();

  const assignment = state?.assignment;
  const className = assignment?.className ?? state?.className ?? "";
  const submissions = useMemo<Submission[]>(
    () => state?.submissions ?? [],
    [state?.submissions]
  );

  // modal grading
  const [gradingOpen, setGradingOpen] = useState(false);
  const [gradingStudent, setGradingStudent] = useState<{
    id: string;
    name: string;
    score?: number;
  } | null>(null);

  const handleOpenGrading = (s: Submission) => {
    setGradingStudent({ id: s.id, name: s.studentName, score: s.score });
    setGradingOpen(true);
  };

  const emptyState = !assignment && submissions.length === 0;

  return (
    <div className="w-full bg-background text-foreground">
      {/* Modal Grading (shadcn) */}
      <ModalGrading
        open={gradingOpen}
        onClose={() => setGradingOpen(false)}
        student={gradingStudent ?? undefined}
        assignmentTitle={
          assignment?.title
            ? `${assignment.title}${className ? ` — (${className})` : ""}`
            : className || undefined
        }
        onSubmit={(payload) => {
          // TODO: panggil API update nilai & revalidate query
          console.log("Simpan nilai:", payload);
          setGradingOpen(false);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="flex-1 space-y-6">
            {/* Back */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-fit gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            {/* Info Tugas */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl font-bold truncate">
                      {assignment?.title ?? "Tugas"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {className && (
                        <Badge variant="secondary">{className}</Badge>
                      )}
                      {assignment?.dueDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {dateLong(assignment.dueDate)}
                        </span>
                      )}
                      {typeof assignment?.total === "number" && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> {assignment.total} siswa
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Class ID: {classId ?? "-"} • Assignment ID:{" "}
                    {assignmentId ?? assignment?.id ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empty state */}
            {emptyState && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Data tidak tersedia. Buka halaman ini melalui daftar tugas
                  agar data ikut terkirim.
                </CardContent>
              </Card>
            )}

            {/* Tabel submissions */}
            {!emptyState && (
              <Card>
                <CardContent className="p-4 md:p-6">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Daftar Pengumpulan
                  </h2>

                  <div className="overflow-x-auto rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[45%]">Nama Siswa</TableHead>
                          <TableHead className="text-center w-[15%]">
                            Status
                          </TableHead>
                          <TableHead className="text-center w-[15%]">
                            Nilai
                          </TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((s) => (
                          <TableRow key={s.id} className="odd:bg-muted/30">
                            <TableCell>
                              <div className="font-medium">{s.studentName}</div>
                              {s.submittedAt && (
                                <div className="text-xs mt-0.5 flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  Dikumpulkan {dateLong(s.submittedAt)}
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {s.status === "graded" ? (
                                <Badge>Sudah Dinilai</Badge>
                              ) : s.status === "submitted" ? (
                                <Badge variant="secondary">Terkumpul</Badge>
                              ) : (
                                <Badge variant="destructive">Belum</Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {typeof s.score === "number" ? (
                                <span className="font-semibold text-base">
                                  {s.score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={
                                  s.status === "submitted"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => handleOpenGrading(s)}
                              >
                                {s.status === "graded"
                                  ? "Edit Nilai"
                                  : "Beri Nilai"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {submissions.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-8 text-center text-muted-foreground"
                            >
                              Belum ada data pengumpulan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
