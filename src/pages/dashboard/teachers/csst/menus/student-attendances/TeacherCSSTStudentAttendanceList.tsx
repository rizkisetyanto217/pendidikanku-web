// src/pages/dasboard/teacher/TeacherCSSTStudentAttendanceList.tsx
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
  Download,
  Filter,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Hand,
  MonitorSmartphone,
} from "lucide-react";

/* =========================================================
   KONFIG + TIPE
========================================================= */
const USE_DUMMY = true;

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type AttendanceRow = {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  checkInTime?: string; // "07:35"
  note?: string;
};

type AttendanceQueryParams = {
  classId: string;
  mode: "today" | "range";
  date?: string; // YYYY-MM-DD (untuk today)
  fromDate?: string; // YYYY-MM-DD (untuk range)
  toDate?: string; // YYYY-MM-DD (untuk range)
  fromTime?: string; // HH:mm (opsional, filter jam)
  toTime?: string; // HH:mm
};

/* =========================================================
   DUMMY: 15 SISWA (sinkron dengan halaman daftar siswa)
========================================================= */
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

const ALL_STATUSES: AttendanceStatus[] = [
  "hadir",
  "sakit",
  "izin",
  "alpa",
  "online",
];

/* =========================================================
   UTIL: Pembuatan dummy kehadiran yg deterministik per tanggal
========================================================= */
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

function generateAttendanceForDate(dateStr: string): AttendanceRow[] {
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

function generateAttendanceRange(
  fromDate: string,
  toDate: string
): AttendanceRow[] {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const days: string[] = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  const map = new Map<string, AttendanceRow>();
  for (const ds of days) {
    const rows = generateAttendanceForDate(ds);
    for (const r of rows) map.set(r.studentId, { ...r });
  }
  return Array.from(map.values());
}

/* =========================================================
   FETCH HOOK (dummy / nanti bisa diganti ke BE)
========================================================= */
async function fetchAttendanceDummy(
  params: AttendanceQueryParams
): Promise<AttendanceRow[]> {
  if (params.mode === "today") {
    const date = params.date || new Date().toISOString().slice(0, 10);
    let rows = generateAttendanceForDate(date);
    if (params.fromTime || params.toTime) {
      const fromT = params.fromTime || "00:00";
      const toT = params.toTime || "23:59";
      rows = rows.filter((r) => {
        if (!r.checkInTime) return true;
        return r.checkInTime >= fromT && r.checkInTime <= toT;
      });
    }
    return rows;
  } else {
    const from = params.fromDate || new Date().toISOString().slice(0, 10);
    const to = params.toDate || from;
    let rows = generateAttendanceRange(from, to);
    if (params.fromTime || params.toTime) {
      const fromT = params.fromTime || "00:00";
      const toT = params.toTime || "23:59";
      rows = rows.filter((r) => {
        if (!r.checkInTime) return true;
        return r.checkInTime >= fromT && r.checkInTime <= toT;
      });
    }
    return rows;
  }
}

function useAttendance(params: AttendanceQueryParams) {
  return useQuery({
    queryKey: ["attendance", params, USE_DUMMY ? "dummy" : "live"],
    queryFn: async () => {
      if (USE_DUMMY) return fetchAttendanceDummy(params);
      // === LIVE (ganti sesuai BE) ===
      // const res = await axios.get(`/api/classes/${params.classId}/attendance`, { params })
      // return res.data as AttendanceRow[]
      return fetchAttendanceDummy(params);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* =========================================================
   UI HELPERS
========================================================= */
function StatusBadge({ s }: { s: AttendanceStatus }) {
  const tone: Record<
    AttendanceStatus,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: React.ReactNode;
      label: string;
    }
  > = {
    hadir: {
      variant: "default",
      icon: <CheckCircle2 size={12} />,
      label: "Hadir",
    },
    online: {
      variant: "secondary",
      icon: <MonitorSmartphone size={12} />,
      label: "Online",
    },
    izin: { variant: "outline", icon: <Hand size={12} />, label: "Izin" },
    sakit: {
      variant: "outline",
      icon: <Stethoscope size={12} />,
      label: "Sakit",
    },
    alpa: {
      variant: "destructive",
      icon: <XCircle size={12} />,
      label: "Alpa",
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

function summarize(rows: AttendanceRow[]) {
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

function toCSV(rows: AttendanceRow[]) {
  const header = ["Student ID", "Nama", "Status", "Check-in", "Catatan"];
  const lines = rows.map((r) => [
    r.studentId,
    r.name.replace(/"/g, '""'),
    r.status,
    r.checkInTime || "",
    (r.note || "").replace(/"/g, '""'),
  ]);
  const csv = [header, ...lines]
    .map((cols) => cols.map((c) => `"${String(c)}"`).join(","))
    .join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}

/* =========================================================
   KOMPONEN UTAMA — pakai shadcn/ui Table
   Route: /teacher/classes/:classId/attendance
========================================================= */
const TeacherCSSTStudentAttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const { classId = "" } = useParams<{ classId: string }>();

  // Mode & kontrol tanggal
  const todayStr = new Date().toISOString().slice(0, 10);
  const [mode, setMode] = useState<"today" | "range">("today");
  const [date, setDate] = useState<string>(todayStr);
  const [fromDate, setFromDate] = useState<string>(todayStr);
  const [toDate, setToDate] = useState<string>(todayStr);
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  // Search & filter
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [statusFilter, setStatusFilter] = useState<"all" | AttendanceStatus>(
    "all"
  );

  const { data: rows = [], isLoading } = useAttendance({
    classId,
    mode,
    date,
    fromDate,
    toDate,
    fromTime: fromTime || undefined,
    toTime: toTime || undefined,
  });

  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter !== "all")
      list = list.filter((r) => r.status === statusFilter);
    if (dq.trim()) {
      const k = dq.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(k) ||
          r.studentId.toLowerCase().includes(k) ||
          (r.note || "").toLowerCase().includes(k)
      );
    }
    const order: AttendanceStatus[] = [
      "hadir",
      "online",
      "izin",
      "sakit",
      "alpa",
    ];
    list = [...list].sort(
      (a, b) =>
        order.indexOf(a.status) - order.indexOf(b.status) ||
        a.name.localeCompare(b.name)
    );
    return list;
  }, [rows, statusFilter, dq]);

  const summary = useMemo(() => summarize(rows), [rows]);

  const labelTanggal = useMemo(
    () => (mode === "today" ? date : `${fromDate} s/d ${toDate}`),
    [mode, date, fromDate, toDate]
  );

  function handleExport() {
    const blob = toCSV(filtered);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fname =
      mode === "today"
        ? `attendance_${classId}_${date}.csv`
        : `attendance_${classId}_${fromDate}_to_${toDate}.csv`;
    a.download = fname;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full bg-background text-foreground py-6">
      <main className="mx-auto space-y-6">
        {/* Header */}
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
              <h1 className="text-xl font-semibold">Kehadiran Siswa</h1>
              <p className="text-sm text-muted-foreground">
                Kelas: {classId || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download size={16} /> Export CSV
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={mode}
              onValueChange={(v) => setMode(v as "today" | "range")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="range">Rentang Tanggal</SelectItem>
              </SelectContent>
            </Select>

            {mode === "today" ? (
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-[170px]"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-muted-foreground" />
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
            )}

            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <Input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                placeholder="Mulai"
                className="w-[130px]"
              />
              <span>—</span>
              <Input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                placeholder="Selesai"
                className="w-[130px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search size={18} className="text-muted-foreground" />
              <Input
                placeholder="Cari nama / ID / catatan…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as AttendanceStatus | "all")
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-muted-foreground">
              Rentang:{" "}
              <span className="font-medium text-foreground">
                {labelTanggal}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1">
                <Users size={12} /> Total: {rows.length}
              </Badge>
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

        {/* Table (shadcn/ui) */}
        <Card className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
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
                      Memuat data kehadiran…
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((r, idx) => (
                    <TableRow
                      key={r.studentId}
                      className="cursor-pointer hover:bg-muted/60"
                      onClick={
                        () => navigate(`${r.studentId}`)
                        // jika base route berbeda, sesuaikan:
                        // navigate(`/teacher/classes/${classId}/attendance/${r.studentId}`)
                      }
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <StatusBadge s={r.status} />
                      </TableCell>
                      <TableCell>{r.checkInTime || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.note || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search size={20} />
                        <p className="font-medium text-foreground">
                          Tidak ada data
                        </p>
                        <p className="text-sm">
                          Coba ubah filter tanggal, jam, atau kata kunci.
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

export default TeacherCSSTStudentAttendanceList;
