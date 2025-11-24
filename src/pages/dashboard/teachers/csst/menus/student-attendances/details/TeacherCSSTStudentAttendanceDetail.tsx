// src/pages/dasboard/teacher/TeacherCSSTStudentAttendanceDetail.tsx
import React, { useMemo, useState } from "react";
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
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Hand,
  MonitorSmartphone,
} from "lucide-react";

/* =========================================================
   KONFIG + TIPE
   (kalau mau, helper2 ini bisa dipindah ke file util biar
   bisa dipakai bareng list & detail)
========================================================= */
const USE_DUMMY = true;

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type StudentHistoryRow = {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  note?: string;
};

const DUMMY_STUDENTS = [
  { id: "s-01", name: "Ahmad Fathir" },
  { id: "s-02", name: "Aisyah Zahra" },
  { id: "s-03", name: "Muhammad Iqbal" },
  { id: "s-04", name: "Siti Nurhaliza" },
  { id: "s-05", name: "Rafi Pratama" },
  { id: "s-06", name: "Nabila Kirana" },
  { id: "s-07", name: "Fauzan Alfarizi" },
  { id: "s-08", name: "Kayla Putri" },
  { id: "s-09", name: "Zidan Maulana" },
  { id: "s-10", name: "Alya Safira" },
  { id: "s-11", name: "Raka Dwi Saputra" },
  { id: "s-12", name: "Nayla Khairunnisa" },
  { id: "s-13", name: "Ilham Saputra" },
  { id: "s-14", name: "Aurel Maharani" },
  { id: "s-15", name: "Daffa Alvaro" },
] as const;

/* ================== Helper generator (sama logika dengan list) ================== */
function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickStatus(seed: number, idx: number): AttendanceStatus {
  const r = (seed + idx * 37) % 100;
  if (r < 68) return "hadir";
  if (r < 75) return "online";
  if (r < 85) return "izin";
  if (r < 93) return "sakit";
  return "alpa";
}

function timeWithOffset(base = "07:30", offsetMin = 0) {
  const [h, m] = base.split(":").map(Number);
  const date = new Date(2025, 0, 1, h, m + offsetMin);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

type AttendanceRowInternal = {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  checkInTime?: string;
  note?: string;
};

function generateAttendanceForDate(dateStr: string): AttendanceRowInternal[] {
  const seed = hashCode(dateStr);
  return DUMMY_STUDENTS.map((s, i) => {
    const status = pickStatus(seed, i);
    let time: string | undefined = undefined;
    let note: string | undefined = undefined;

    if (status === "hadir") {
      const late = (seed + i * 11) % 20; // 0..19 menit
      time = timeWithOffset("07:30", late);
      if (late >= 10) note = "Datang agak terlambat";
    } else if (status === "online") {
      time = timeWithOffset("07:35", (seed + i * 9) % 15);
      note = "Kelas online (Zoom)";
    } else if (status === "sakit") {
      note = "Izin sakit (surat orang tua)";
    } else if (status === "izin") {
      note = "Izin keluarga";
    } else {
      note = "Tidak hadir tanpa keterangan";
    }

    return { studentId: s.id, name: s.name, status, checkInTime: time, note };
  });
}

function generateStudentHistory(
  studentId: string,
  fromDate: string,
  toDate: string
): StudentHistoryRow[] {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const days: string[] = [];

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }

  const result: StudentHistoryRow[] = [];
  for (const ds of days) {
    const rows = generateAttendanceForDate(ds);
    const found = rows.find((r) => r.studentId === studentId);
    if (found) {
      result.push({
        date: ds,
        status: found.status,
        checkInTime: found.checkInTime,
        note: found.note,
      });
    }
  }

  // urutkan terbaru di atas
  return result.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function summarize(rows: StudentHistoryRow[]) {
  const base: Record<AttendanceStatus, number> = {
    hadir: 0,
    online: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
  };
  for (const r of rows) base[r.status]++;
  return base;
}

/* ================== UI kecil: status badge ================== */
function StatusBadge({ s }: { s: AttendanceStatus }) {
  const tone: Record<
    AttendanceStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      icon: React.ReactNode;
    }
  > = {
    hadir: {
      variant: "default",
      label: "Hadir",
      icon: <CheckCircle2 size={12} />,
    },
    online: {
      variant: "secondary",
      label: "Online",
      icon: <MonitorSmartphone size={12} />,
    },
    izin: {
      variant: "outline",
      label: "Izin",
      icon: <Hand size={12} />,
    },
    sakit: {
      variant: "outline",
      label: "Sakit",
      icon: <Stethoscope size={12} />,
    },
    alpa: {
      variant: "destructive",
      label: "Alpa",
      icon: <XCircle size={12} />,
    },
  };
  const t = tone[s];
  return (
    <Badge variant={t.variant} className="gap-1">
      {t.icon}
      {t.label}
    </Badge>
  );
}

/* ================== HOOK FETCH ================== */
function useStudentAttendanceHistory(
  studentId: string,
  fromDate: string,
  toDate: string
) {
  return useQuery({
    queryKey: [
      "attendance-detail",
      studentId,
      fromDate,
      toDate,
      USE_DUMMY ? "dummy" : "live",
    ],
    queryFn: async () => {
      if (USE_DUMMY) {
        return generateStudentHistory(studentId, fromDate, toDate);
      }
      // === LIVE (nanti diganti sesuai backend) ===
      // const res = await axios.get(`/api/teacher/classes/${classId}/students/${studentId}/attendance`, {
      //   params: { from_date: fromDate, to_date: toDate },
      // });
      // return res.data as StudentHistoryRow[];
      return generateStudentHistory(studentId, fromDate, toDate);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* =========================================================
   PAGE DETAIL
   Route: /teacher/classes/:classId/attendance/:studentId
========================================================= */
const TeacherCSSTStudentAttendanceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { classId = "", studentId = "" } = useParams<{
    classId: string;
    studentId: string;
  }>();

  // default: 30 hari ke belakang
  const today = new Date();
  const toStr = today.toISOString().slice(0, 10);
  const fromDefault = new Date(today);
  fromDefault.setDate(fromDefault.getDate() - 29);
  const fromStr = fromDefault.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState<string>(fromStr);
  const [toDate, setToDate] = useState<string>(toStr);

  const { data: rows = [], isLoading } = useStudentAttendanceHistory(
    studentId,
    fromDate,
    toDate
  );

  const studentName =
    DUMMY_STUDENTS.find((s) => s.id === studentId)?.name ||
    rows[0]?.note?.split(" - ")[0] || // fallback kalau nanti BE kirim note dengan nama (bisa dibuang)
    studentId;

  const summary = useMemo(() => summarize(rows), [rows]);

  return (
    <div className="w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
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
              <h1 className="text-xl font-semibold">Detail Kehadiran Siswa</h1>
              <p className="text-sm text-muted-foreground">
                {studentName} —{" "}
                <span className="font-mono text-xs text-foreground/80">
                  {studentId}
                </span>
                <br />
                <span className="text-xs">
                  Kelas:{" "}
                  <span className="font-medium text-foreground">
                    {classId || "-"}
                  </span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="gap-1">
              <Users size={12} /> Total catatan: {rows.length}
            </Badge>
          </div>
        </div>

        {/* Filter tanggal */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <CalendarDays size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Pilih rentang tanggal:
            </span>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[170px]"
            />
            <span>—</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[170px]"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Menampilkan riwayat dari{" "}
            <span className="font-medium text-foreground">{fromDate}</span> s/d{" "}
            <span className="font-medium text-foreground">{toDate}</span>.
          </p>
        </Card>

        {/* Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span>
                Rekap status kehadiran untuk{" "}
                <span className="font-medium text-foreground">
                  {studentName}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1" variant="default">
                <CheckCircle2 size={12} /> Hadir: {summary.hadir}
              </Badge>
              <Badge className="gap-1" variant="secondary">
                <MonitorSmartphone size={12} /> Online: {summary.online}
              </Badge>
              <Badge className="gap-1" variant="outline">
                <Hand size={12} /> Izin: {summary.izin}
              </Badge>
              <Badge className="gap-1" variant="outline">
                <Stethoscope size={12} /> Sakit: {summary.sakit}
              </Badge>
              <Badge className="gap-1" variant="destructive">
                <XCircle size={12} /> Alpa: {summary.alpa}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Tabel riwayat */}
        <Card className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Memuat riwayat kehadiran…
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users size={20} />
                        <p className="font-medium text-foreground">
                          Belum ada catatan kehadiran
                        </p>
                        <p className="text-sm">
                          Coba ubah rentang tanggal di atas.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, idx) => (
                    <TableRow key={`${r.date}-${idx}`}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.date}
                      </TableCell>
                      <TableCell>
                        <StatusBadge s={r.status} />
                      </TableCell>
                      <TableCell>{r.checkInTime || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.note || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </main>
    </div>
  );
};

export default TeacherCSSTStudentAttendanceDetail;
