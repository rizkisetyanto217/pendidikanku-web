// src/pages/dashboard/components/card/schedule/CCardScheduleDashboard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

/* =========================================================
   TYPES — GENERIC UNTUK SEMUA ROLE
========================================================= */
export type DashboardScheduleParticipantState =
  | "unknown"
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "sick"
  | "leave";

export type DashboardScheduleItem = {
  id: string;
  date?: string; // ISO tanggal sesi
  time: string; // "07:00 - 08:30"
  title: string; // "Matematika - X IPA 1"
  location?: string;
  teacher?: string;
  note?: string;

  // untuk kebutuhan UI absensi / aksi cepat
  isToday?: boolean;
  canAttendNow?: boolean;

  // status mentah dari API (untuk badge)
  participantState?: DashboardScheduleParticipantState;
};

export type DashboardScheduleCardProps = {
  items: DashboardScheduleItem[];
  title?: string;
  seeAllPath?: string;
  loading?: boolean;

  // untuk tombol aksi utama per item (optional)
  primaryActionLabel?: string; // default: "Buka"
  onPrimaryAction?: (item: DashboardScheduleItem) => void;
};

/* =========================================================
   UTILS KHUSUS KOMPONEN INI
========================================================= */

const dateDayShortFmt = (iso?: string): string => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }); // contoh: "Jum, 20/11"
  } catch {
    return "";
  }
};

/* =========================================================
   COMPONENT
========================================================= */
export function DashboardScheduleCard({
  items,
  title = "Jadwal Terdekat Pekan Ini",
  seeAllPath,
  loading,
  primaryActionLabel = "Buka",
  onPrimaryAction,
}: DashboardScheduleCardProps) {
  const shown = items.slice(0, 5); // limit max 5

  // helper kecil buat badge status
  const renderStatusBadge = (item: DashboardScheduleItem) => {
    const state = item.participantState;
    if (!state) return null;

    let variant: React.ComponentProps<typeof Badge>["variant"] = "outline";
    let label = item.note || "";
    let extraClass = "";

    switch (state) {
      case "present":
        variant = "default";
        if (!label) label = "Sudah absen: Hadir";
        break;

      case "late":
      case "absent":
        variant = "destructive";
        if (!label) label = "Tidak hadir / terlambat";
        break;

      case "sick":
      case "excused":
      case "leave":
        // ⚠️ warning style (kuning)
        variant = "outline";
        if (!label) {
          if (state === "sick") label = "Sakit";
          else if (state === "leave") label = "Cuti / keperluan lain";
          else label = "Izin / dimaafkan";
        }
        extraClass =
          "border-amber-200 bg-amber-50 text-amber-800 " +
          "dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-300";
        break;

      case "unknown":
      default:
        variant = "outline";
        if (!label) label = "Belum ada data absensi";
        break;
    }

    if (!label) return null;

    return (
      <div className="mt-1">
        <Badge variant={variant} className={`text-[11px] ${extraClass}`}>
          {label}
        </Badge>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-sm text-muted-foreground">Tidak ada jadwal.</div>
        ) : (
          shown.map((s) => {
            const dayDateLabel = s.date ? dateDayShortFmt(s.date) : "";

            return (
              <div
                key={s.id}
                className={`rounded-xl border p-3 flex items-start gap-3 transition-colors ${
                  s.isToday ? "border-primary/70 bg-primary/5" : ""
                }`}
              >
                <Badge variant="outline" className="shrink-0 px-3 py-2">
                  <div className="flex flex-col items-start leading-tight">
                    {dayDateLabel && (
                      <span className="text-[11px] font-medium">
                        {dayDateLabel}
                      </span>
                    )}
                    <span className="text-xs">{s.time}</span>
                  </div>
                </Badge>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium leading-tight truncate">
                      {s.title}
                    </div>
                    {s.isToday && (
                      <Badge
                        variant="default"
                        className="text-[10px] px-2 py-0.5 uppercase"
                      >
                        Hari ini
                      </Badge>
                    )}
                  </div>

                  {(s.location || s.teacher) && (
                    <div className="text-xs text-muted-foreground">
                      {[s.location, s.teacher].filter(Boolean).join(" • ")}
                    </div>
                  )}

                  {/* Badge status hadir */}
                  {renderStatusBadge(s)}

                  {s.canAttendNow && onPrimaryAction && (
                    <Button className="mt-2" onClick={() => onPrimaryAction(s)}>
                      {primaryActionLabel}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {seeAllPath && (
          <>
            <Separator className="my-1" />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = seeAllPath)}
            >
              Lihat semua jadwal
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
