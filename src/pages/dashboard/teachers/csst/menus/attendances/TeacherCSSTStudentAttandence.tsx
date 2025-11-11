// src/pages/sekolahislamku/teacher/TeacherAttendance.shadcn.tsx
import { useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckSquare,
  Filter as FilterIcon,
  Users,
  Download,
  Check,
  ArrowRight,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/* ================= Types ================= */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceStatusFilter = AttendanceStatus | "all";
type AttendanceMode = "onsite" | "online";
type AttendanceModeFilter = AttendanceMode | "all";

type ClassItem = { id: string; name: string; time: string; room?: string };

type StudentAttendance = {
  id: string;
  name: string;
  status: AttendanceStatus;
  mode?: AttendanceMode;
  time?: string;
};

type AttendanceStats = {
  total: number;
} & Record<AttendanceStatus, number>;

type AttendancePayload = {
  dateISO: string;
  classes: ClassItem[];
  currentClass?: ClassItem;
  stats: AttendanceStats;
  students: StudentAttendance[];
};

/* ================= Date/Time Utils ================= */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
const normalizeISOToLocalNoon = (iso: string) => toLocalNoonISO(new Date(iso));
const parseDateInputToISO = (value: string) =>
  new Date(`${value}T12:00:00`).toISOString();
const toDateInputValue = (iso: string) => {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const dateShort = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
const dateForFilename = (iso: string) => toDateInputValue(iso);

/* ================= Helpers/Constants ================= */
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  online: "Online",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
};
const percent = (a: number, b: number) =>
  b > 0 ? Math.round((a / b) * 100) : 0;

const toStatusFilter = (v: string | null): AttendanceStatusFilter =>
  v === "all" ||
    v === "hadir" ||
    v === "online" ||
    v === "izin" ||
    v === "sakit" ||
    v === "alpa"
    ? v
    : "all";
const toModeFilter = (v: string | null): AttendanceModeFilter =>
  v === "all" || v === "onsite" || v === "online" ? v : "all";

/* ================= Dummy Data & API ================= */
const CLASSES: ClassItem[] = [
  { id: "tpa-a", name: "TPA A", time: "07:30", room: "Aula 1" },
  { id: "tpa-b", name: "TPA B", time: "09:30", room: "R. Tahfiz" },
];

const NAMA_DUMMY = [
  "Ahmad",
  "Fatimah",
  "Hasan",
  "Aisyah",
  "Umar",
  "Zainab",
  "Bilal",
  "Abdullah",
  "Amina",
  "Khalid",
  "Maryam",
  "Hafsa",
  "Yusuf",
  "Ali",
  "Hassan",
  "Husein",
  "Salim",
  "Rahma",
  "Saad",
  "Imran",
  "Farah",
  "Sofia",
  "Nadia",
  "Omar",
  "Layla",
  "Khadijah",
  "Usman",
  "Sumayyah",
  "Amir",
  "Lubna",
  "Ridwan",
  "Siti",
  "Abdurrahman",
  "Juwairiyah",
  "Talha",
  "Ammar",
  "Musa",
  "Ismail",
  "Hamzah",
  "Sahl",
];

function statusFor(i: number): AttendanceStatus {
  const m = i % 10;
  if (m === 0) return "izin";
  if (m === 1) return "sakit";
  if (m === 2) return "alpa";
  if (m === 3) return "online";
  return "hadir";
}
function timeFor(s: AttendanceStatus) {
  if (s === "hadir" || s === "online") {
    const hh = 7 + Math.floor(Math.random() * 2); // 07–08
    const mm = 10 + Math.floor(Math.random() * 40);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return undefined;
}
function modeFor(s: AttendanceStatus): AttendanceMode | undefined {
  if (s === "hadir") return "onsite";
  if (s === "online") return "online";
  return undefined;
}

async function fetchTeacherAttendance({
  dateISO,
  classId,
}: {
  dateISO: string;
  classId?: string;
}): Promise<AttendancePayload> {
  const currentClass = classId
    ? CLASSES.find((c) => c.id === classId)
    : undefined;

  let size = 0;
  if (currentClass?.id === "tpa-a") size = 25;
  if (currentClass?.id === "tpa-b") size = 20;

  const students: StudentAttendance[] = Array.from({ length: size }).map(
    (_, i) => {
      const st = statusFor(i);
      return {
        id: `${currentClass?.id}-${i + 1}`,
        name: NAMA_DUMMY[i % NAMA_DUMMY.length],
        status: st,
        mode: modeFor(st),
        time: timeFor(st),
      };
    }
  );

  const stats = students.reduce<AttendanceStats>(
    (acc, s) => {
      acc.total += 1;
      acc[s.status] += 1;
      return acc;
    },
    { total: 0, hadir: 0, online: 0, izin: 0, sakit: 0, alpa: 0 }
  );

  return { dateISO, classes: CLASSES, currentClass, stats, students };
}

/* ================= Small inline UI helpers ================= */
function BadgeStatus({ s }: { s: AttendanceStatus }) {
  const cls =
    s === "hadir"
      ? "bg-green-600 text-white dark:bg-green-500"
      : s === "online"
        ? "bg-blue-600 text-white dark:bg-blue-500"
        : s === "sakit"
          ? "bg-amber-500 text-white"
          : s === "alpa"
            ? "bg-destructive text-destructive-foreground"
            : "bg-secondary text-secondary-foreground";
  return <Badge className={cls}>{STATUS_LABEL[s]}</Badge>;
}

function MiniBarInline({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-lg border p-3 bg-card">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 w-full rounded bg-muted">
        <div
          className="h-2 rounded bg-primary"
          style={{ width: `${pct}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          role="progressbar"
        />
      </div>
    </div>
  );
}

function StatPillInline({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border p-3 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function AttendanceRow({ st }: { st: StudentAttendance }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2 bg-card">
      <div className="text-sm">
        <div className="font-medium">{st.name}</div>
        <div className="text-xs text-muted-foreground">
          {st.mode ? (st.mode === "onsite" ? "Tatap muka" : "Online") : ""}{" "}
          {st.time ? `• ${st.time}` : ""}
        </div>
      </div>
      <BadgeStatus s={st.status} />
    </div>
  );
}

/* ================= CSV Export helper ================= */
function toCSV(rows: StudentAttendance[]) {
  const header = ["id", "nama", "status", "mode", "jam"];
  const body = rows.map((r) =>
    [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.status,
      r.mode ?? "",
      r.time ?? "",
    ].join(",")
  );
  return [header.join(","), ...body].join("\n");
}
function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ================= Page ================= */
export default function TeacherClassAttendanceCSST() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const { slug } = useParams();

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Daftar Kehadiran",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kehadiran" },
        { label: "Daftar Kehadiran" },
      ],
      actions: null,
    });
  }, [setHeader]);

  // Normalisasi qDate agar konsisten di siang lokal
  const rawSpDate = sp.get("date");
  const qDate = rawSpDate
    ? normalizeISOToLocalNoon(rawSpDate)
    : toLocalNoonISO(new Date());
  const classId = sp.get("class") ?? undefined;
  const status: AttendanceStatusFilter = toStatusFilter(sp.get("status"));
  const mode: AttendanceModeFilter = toModeFilter(sp.get("mode"));

  const { data: s } = useQuery({
    queryKey: ["teacher-attendance", qDate, classId],
    queryFn: () => fetchTeacherAttendance({ dateISO: qDate, classId }),
    staleTime: 60_000,
  });

  // Ringkasan dihitung dari students (single source of truth)
  const attendanceFromStudents = useMemo(() => {
    const list = s?.students ?? [];
    const byStatus: Record<AttendanceStatus, number> = {
      hadir: 0,
      online: 0,
      sakit: 0,
      izin: 0,
      alpa: 0,
    };
    for (const st of list) byStatus[st.status] += 1;
    const total = list.length;
    const present = byStatus.hadir + byStatus.online;
    const presentPct = percent(present, total);
    return { total, present, presentPct, byStatus };
  }, [s?.students]);

  const filtered = useMemo(() => {
    if (!s) return [];
    return s.students.filter((st) => {
      const mStatus = status === "all" ? true : st.status === status;
      const mMode = mode === "all" ? true : st.mode === mode;
      return mStatus && mMode;
    });
  }, [s, status, mode]);

  const handleChange = useCallback(
    (key: "date" | "class" | "status" | "mode", value: string) => {
      const next = new URLSearchParams(sp);
      next.set(key, value);
      setSp(next, { replace: true });
    },
    [sp, setSp]
  );

  const handleGoDetail = useCallback(
    (c: ClassItem) => {
      navigate(`/${slug}/guru/kehadiran/${c.id}`, {
        state: { classInfo: c, dateISO: qDate },
      });
    },
    [navigate, slug, qDate]
  );

  const markAllPresent = useCallback(() => {
    if (!s?.currentClass || filtered.length === 0) return;
    const newRows = filtered.map((r) => ({
      ...r,
      status: "hadir" as AttendanceStatus,
      mode: "onsite" as AttendanceMode,
      time: r.time ?? "07:30",
    }));
    const filename = `rekap-${s.currentClass.id}-${dateForFilename(
      qDate
    )}-all-hadir.csv`;
    download(filename, toCSV(newRows));
    alert("Contoh aksi: semua ditandai hadir dan file CSV diunduh.");
  }, [s?.currentClass, filtered, qDate]);

  const exportCSV = useCallback(() => {
    if (!s?.currentClass) return;
    const name = `rekap-${s.currentClass.id}-${dateForFilename(qDate)}.csv`;
    download(name, toCSV(filtered));
  }, [filtered, s?.currentClass, qDate]);

  return (
    <main className="md:py-8">
      <div className="mx-auto space-y-6">
        {/* Row 1: Kelas Hari Ini + Ringkasan */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Kelas Hari Ini */}
          <Card className="lg:col-span-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="size-4" />
                Kelas Hari Ini
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                <Badge variant="outline">{dateShort(qDate)}</Badge>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {CLASSES.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 bg-card"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.room ?? "-"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.time}</Badge>
                    <Button
                      size="sm"
                      onClick={() => handleGoDetail(c)}
                      className="gap-1"
                    >
                      Kelola <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ringkasan Kehadiran */}
          <Card className="lg:col-span-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="size-4" />
                Ringkasan Kehadiran Hari Ini
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <StatPillInline
                  label="Total Siswa"
                  value={attendanceFromStudents.total}
                />
                <StatPillInline
                  label="Hadir"
                  value={attendanceFromStudents.byStatus.hadir}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(
                  [
                    "hadir",
                    "online",
                    "sakit",
                    "izin",
                    "alpa",
                  ] as AttendanceStatus[]
                ).map((k) => (
                  <MiniBarInline
                    key={k}
                    label={k.toUpperCase()}
                    value={attendanceFromStudents.byStatus[k]}
                    total={attendanceFromStudents.total}
                  />
                ))}
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/${slug}/guru/attendance-management`, {
                      state: {
                        className: s?.currentClass?.name,
                        students: (s?.students ?? []).map((row) => ({
                          id: row.id,
                          name: row.name,
                          status: row.status as
                            | "hadir"
                            | "online"
                            | "sakit"
                            | "izin"
                            | "alpa",
                        })),
                      },
                    })
                  }
                  disabled={!s?.currentClass}
                >
                  Kelola Absen
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FilterIcon className="size-4" />
              Filter
            </CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="grid gap-1.5">
              <Label
                htmlFor="flt-date"
                className="text-xs text-muted-foreground"
              >
                Tanggal
              </Label>
              <Input
                id="flt-date"
                type="date"
                value={toDateInputValue(qDate)}
                onChange={(e) => {
                  const iso = parseDateInputToISO(e.target.value);
                  handleChange("date", iso);
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="flt-class"
                className="text-xs text-muted-foreground"
              >
                Kelas
              </Label>
              <select
                id="flt-class"
                value={classId ?? ""}
                onChange={(e) => handleChange("class", e.target.value)}
                className="h-10 rounded-md border bg-background px-3"
              >
                <option value="">— Pilih kelas —</option>
                {CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="flt-status"
                className="text-xs text-muted-foreground"
              >
                Status
              </Label>
              <select
                id="flt-status"
                value={status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="h-10 rounded-md border bg-background px-3"
              >
                <option value="all">Semua</option>
                <option value="hadir">Hadir</option>
                <option value="online">Online</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpa">Alpa</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="flt-mode"
                className="text-xs text-muted-foreground"
              >
                Mode
              </Label>
              <select
                id="flt-mode"
                value={mode}
                onChange={(e) => handleChange("mode", e.target.value)}
                className="h-10 rounded-md border bg-background px-3"
              >
                <option value="all">Semua</option>
                <option value="onsite">Tatap muka</option>
                <option value="online">Online</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ===== Daftar Kehadiran — TABEL (desktop) ===== */}
        <Card className="p-0 hidden md:block">
          <div className="px-4 md:px-5 pt-4 pb-3 font-medium flex items-center gap-2">
            <Users className="size-4" /> Daftar Kehadiran
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-4 w-[45%]">Nama Siswa</th>
                  <th className="py-3 px-4 w-[20%]">Mode</th>
                  <th className="py-3 px-4 w-[20%]">Jam</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {!s?.currentClass && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 px-4 text-center text-muted-foreground"
                    >
                      Pilih kelas untuk melihat daftar siswa.
                    </td>
                  </tr>
                )}

                {s?.currentClass && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 px-4 text-center text-muted-foreground"
                    >
                      Tidak ada data untuk filter saat ini.
                    </td>
                  </tr>
                )}

                {s?.currentClass &&
                  filtered.map((st) => (
                    <tr key={st.id} className="border-b">
                      <td className="py-3 px-4">{st.name}</td>
                      <td className="py-3 px-4">
                        {st.mode
                          ? st.mode === "onsite"
                            ? "Tatap muka"
                            : "Online"
                          : "-"}
                      </td>
                      <td className="py-3 px-4">{st.time ?? "-"}</td>
                      <td className="py-3 px-4">
                        <BadgeStatus s={st.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {s?.currentClass && (
            <div className="px-4 md:px-5 py-3 flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={markAllPresent}
                className="gap-1"
              >
                <Check className="size-4" />
                Tandai semua hadir
              </Button>
              <Button onClick={exportCSV} className="gap-1">
                <Download className="size-4" />
                Unduh rekap
              </Button>
            </div>
          )}
        </Card>

        {/* ===== Daftar Kehadiran — KARTU (mobile) ===== */}
        <Card className="p-3 space-y-2 md:hidden">
          <div className="font-medium flex items-center gap-2 mb-1">
            <Users className="size-4" /> Daftar Kehadiran
          </div>

          {!s?.currentClass && (
            <div className="rounded-xl border px-3 py-3 text-sm text-muted-foreground bg-card">
              Pilih kelas terlebih dahulu untuk melihat daftar siswa.
            </div>
          )}

          {s?.currentClass && filtered.length === 0 && (
            <div className="rounded-xl border px-3 py-3 text-sm text-muted-foreground bg-card">
              Tidak ada data untuk filter saat ini.
            </div>
          )}

          {s?.currentClass &&
            filtered.map((st) => <AttendanceRow key={st.id} st={st} />)}

          {s?.currentClass && (
            <div className="pt-2 flex gap-2">
              <Button
                variant="secondary"
                onClick={markAllPresent}
                className="w-1/2"
              >
                Tandai semua
              </Button>
              <Button onClick={exportCSV} className="w-1/2">
                Unduh
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
