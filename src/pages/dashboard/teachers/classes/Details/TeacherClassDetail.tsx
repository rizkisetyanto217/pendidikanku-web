// src/pages/sekolahislamku/teacher/DetailClass.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* icons */
import {
  Users,
  CalendarDays,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

/* ========== Types ========== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type NextSession = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};
type TeacherClassSummary = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  todayAttendance: Record<AttendanceStatus, number>;
  nextSession?: NextSession;
  materialsCount: number;
  assignmentsCount: number;
  academicTerm: string;
  cohortYear: number;
};

type CsstItem = {
  id: string;
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room?: string;
  isActive: boolean;
  enrolled: number;
  nextTopic?: string;
};


/* ========== DUMMY DATA (penuh) ========== */
const NOW = new Date();
const mkISO = (addDays = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + addDays);
  return d.toISOString();
};

const whatsappClassGroupLink = "https://chat.whatsapp.com/xxxxInviteCodexxxx";

const DUMMY_CLASS: TeacherClassSummary = {
  id: "kelas-uuid-dummy",
  name: "TPA A",
  room: "Aula 1",
  homeroom: "Ustadz Abdullah",
  assistants: ["Ustadzah Amina"],
  studentsCount: 24,
  todayAttendance: { hadir: 20, online: 1, sakit: 1, izin: 1, alpa: 1 },
  nextSession: {
    dateISO: mkISO(0),
    time: "07:30",
    title: "Tahsin — Tajwid & Makhraj",
    room: "Aula 1",
  },
  materialsCount: 12,
  assignmentsCount: 4,
  academicTerm: "2025/2026 — Ganjil",
  cohortYear: 2025,
};

const DUMMY_CSST: CsstItem[] = [
  {
    id: "csst-1",
    subject: "Fiqih Dasar",
    teacher: "Ustadz Abdullah",
    day: "Senin",
    time: "07:30",
    room: "Aula 1",
    isActive: true,
    enrolled: 24,
    nextTopic: "Thaharah (Bersuci)",
  },
  {
    id: "csst-2",
    subject: "Tahfiz Juz 30",
    teacher: "Ustadzah Maryam",
    day: "Selasa",
    time: "09:30",
    room: "R. Tahfiz",
    isActive: true,
    enrolled: 22,
    nextTopic: "An-Naba 1–10",
  },
  {
    id: "csst-3",
    subject: "Bahasa Arab",
    teacher: "Ustadz Salman",
    day: "Rabu",
    time: "10:15",
    room: "Lab Bahasa",
    isActive: true,
    enrolled: 18,
    nextTopic: "Fi'il Madhi",
  },
  {
    id: "csst-4",
    subject: "Aqidah Akhlak",
    teacher: "Ustadz Abu Bakar",
    day: "Kamis",
    time: "13:00",
    room: "R. 101",
    isActive: false,
    enrolled: 0,
    nextTopic: "Sifat Wajib bagi Allah",
  },
  {
    id: "csst-5",
    subject: "Sirah Nabawiyah",
    teacher: "Ustadzah Amina",
    day: "Jumat",
    time: "14:00",
    room: "Aula 2",
    isActive: false,
    enrolled: 0,
    nextTopic: "Perjalanan Nabi ke Thaif",
  },
];

/* ========== Component ========== */
export default function TeacherClassDetail() {
  const navigate = useNavigate();



  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Detail Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Wali Kelas" },
        { label: "Detail Kelas" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Top bar */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold">Detail Kelas</h1>
          </div>

          {/* Header */}
          <Card>
            <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg md:text-xl font-semibold">
                  {DUMMY_CLASS.name || <Skeleton className="h-5 w-48" />}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{DUMMY_CLASS.room ?? "-"}</Badge>
                  <span>Wali Kelas: {DUMMY_CLASS.homeroom ?? "—"}</span>
                  <span>• {DUMMY_CLASS.academicTerm ?? "—"}</span>
                  <span>• Angkatan {DUMMY_CLASS.cohortYear ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== CSST Overview ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Ringkasan CSST (Section × Subject × Teacher)
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

                <Card className="p-4 cursor-pointer transition hover:shadow-md"
                  onClick={() => navigate("murid")}

                >
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>Jumlah Murid</span>
                  </div>

                  <div className="text-xl font-semibold mt-1">
                    {DUMMY_CLASS.studentsCount}
                  </div>
                </Card>

                <Card
                  className="p-4 cursor-pointer transition hover:shadow-md"
                  onClick={() => window.open(whatsappClassGroupLink, "_blank")}
                >
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>Grup WhatsApp Kelas</span>
                  </div>

                  <div className="text-md font-semibold mt-1 underline">
                    Link Group
                  </div>
                </Card>

              </div>
            </CardContent>
          </Card>

          {/* ===== Daftar Mapel (CSST) — menonjol ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Daftar Mapel (CSST)
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
                {DUMMY_CSST.map((m) => (
                  <Card
                    key={m.id}
                    className={`p-4 transition ${m.isActive ? "ring-1 ring-primary/30" : ""
                      } hover:shadow-md cursor-pointer`}
                    // contoh rute detail csst; aman walau belum ada
                    onClick={() => navigate(`csst/${m.id}`)}
                    aria-label={`Buka mapel ${m.subject}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {m.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          Guru: {m.teacher}
                        </div>
                      </div>
                      <CBadgeStatus
                        status={m.isActive ? "active" : "inactive"}
                        className="text-[10px]"
                      />

                    </div>

                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                      <CalendarDays className="h-3 w-3" />
                      <span>
                        {m.day} • {m.time}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>{m.nextTopic}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="text-[10px] flex items-center gap-1"
                      >
                        {m.room ?? "-"}
                      </Badge>
                      <div className="text-sm">
                        <Users className="h-3 w-3 inline mr-1" />
                        {m.enrolled}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
