// src/pages/sekolahislamku/attendance/AttendanceDetail.shadcn.tsx
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ===== Types ===== */
type ClassInfo = {
  id: string;
  name: string;
  time?: string;
  room?: string;
};

type NavState =
  | { classInfo?: ClassInfo; dateISO?: string }
  | { classRow?: ClassInfo; dateISO?: string }
  | undefined;

/* ===== Utils ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

export default function TeacherClassAttendanceDetail() {
  const { id } = useParams();
  const { state } = useLocation() as { state: NavState };
  const navigate = useNavigate();

  // dukung state lama (classRow) & baru (classInfo)
  const classInfo: ClassInfo | undefined = useMemo(() => {
    // @ts-expect-error kompat untuk dua bentuk state
    return state?.classInfo ?? state?.classRow ?? undefined;
  }, [state]);

  const effectiveDateISO = (state as any)?.dateISO ?? new Date().toISOString();

  return (
    <main className="px-4 md:px-6 md:py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Aksi kembali */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>
        </div>

        {/* Info Ringkas Kelas */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <GraduationCap className="size-4" />
                {classInfo?.name ?? "Kelas"}
              </CardTitle>
              <Badge variant="outline" className="gap-1">
                <CalendarDays className="size-4" />
                {dateLong(effectiveDateISO)}
              </Badge>
            </div>
            <Separator />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ID Kelas */}
              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground">ID Kelas</div>
                <div className="font-semibold break-all">
                  {classInfo?.id ?? id ?? "-"}
                </div>
              </div>

              {/* Ruangan */}
              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-4" />
                  Ruangan
                </div>
                <div className="font-semibold">{classInfo?.room ?? "-"}</div>
              </div>

              {/* Jam */}
              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-4" />
                  Jam
                </div>
                <div className="font-semibold">{classInfo?.time ?? "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder konten detail (absensi/aksi) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Kehadiran</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="p-3 rounded-lg border bg-card text-sm text-muted-foreground">
              Konten detail kehadiran (daftar siswa, editor, dan aksi) bisa
              diletakkan di sini.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
