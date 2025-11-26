// src/components/schedule/CalendarView.tsx
import { useEffect, useMemo, useRef } from "react";
import { MapPin, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  pad2,
  toMonthStr,
  dateKeyFrom,
  fmtDayShort,
  fmtFullDate,
} from "./types/types";
import type { ScheduleRow } from "./types/types";

type Props = {
  month: string;
  data: ScheduleRow[];
  loading?: boolean;

  selectedDay: string | null;
  setSelectedDay: (d: string | null) => void;

  onAddNew?: (baseDate?: string) => void;
  onEdit?: (row: ScheduleRow) => void;
  onDelete?: (id: string) => void;

  updating?: boolean;
  deleting?: boolean;

  /** Student mode: tidak ada add/edit/delete, klik item tidak membuka editor */
  readOnly?: boolean;
  /** Kontrol visibilitas tombol Tambah pada header panel kanan (default true) */
  canAdd?: boolean;
};

export default function CalendarView({
  month,
  data,
  loading = false,
  selectedDay,
  setSelectedDay,
  onAddNew,
  onEdit,
  onDelete,
  updating = false,
  deleting = false,
  readOnly = false,
  canAdd = true,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedDay]);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>();
    data.forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
        d.getDate()
      )}`;
      const arr = map.get(key) || [];
      arr.push(s);
      arr.sort((a, b) => a.time.localeCompare(b.time));
      map.set(key, arr);
    });
    return map;
  }, [data]);

  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, (m || 1) - 1, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // Sen=0
  const total = new Date(y, m, 0).getDate();
  const days = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  const todayKey = dateKeyFrom(new Date());
  const isTodayMonth = toMonthStr(new Date()) === month;

  const panelList = useMemo(() => {
    if (selectedDay) {
      return [...(byDate.get(selectedDay) ?? [])].sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    }
    return [...data].sort(
      (a, b) =>
        +new Date(a.date) - +new Date(b.date) || a.time.localeCompare(b.time)
    );
  }, [selectedDay, byDate, data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Kalender kiri */}
      <Card className="lg:col-span-2">
        <CardContent className="p-4 lg:p-6">
          {loading ? (
            <div className="grid grid-cols-7 gap-2 lg:gap-3">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-16 lg:h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground mb-3">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                  <div key={d} className="text-center font-medium">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 lg:gap-3">
                {days.map((day, i) => {
                  const dateKey = day && `${y}-${pad2(m)}-${pad2(day)}`;
                  const schedules = dateKey ? byDate.get(dateKey) : [];
                  const selected = selectedDay === dateKey;
                  const isToday = isTodayMonth && dateKey === todayKey;

                  return (
                    <button
                      key={i}
                      disabled={!dateKey}
                      onClick={() => setSelectedDay(dateKey!)}
                      title={dateKey || ""}
                      className={[
                        "aspect-square min-h-[3rem] lg:min-h-[4rem] border rounded-xl text-left p-2 lg:p-3 relative transition",
                        "bg-background/60",
                        selected ? "bg-primary/10 border-primary" : "",
                        isToday ? "ring-1 ring-primary/70" : "",
                        !dateKey ? "disabled:opacity-30" : "",
                      ].join(" ")}
                    >
                      <div className="text-sm lg:text-base font-semibold">
                        {day ?? ""}
                      </div>
                      {!!schedules?.length && (
                        <div className="absolute right-1.5 top-1.5 flex gap-1">
                          {schedules.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className={`h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full ${
                                s.type === "exam"
                                  ? "bg-red-500"
                                  : s.type === "event"
                                  ? "bg-green-500"
                                  : "bg-primary"
                              }`}
                            />
                          ))}
                          {schedules.length > 3 && (
                            <span className="text-[10px] lg:text-xs leading-none ml-0.5">
                              +{schedules.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {isToday && (
                        <span className="absolute left-1.5 bottom-1.5 text-[11px] lg:text-xs text-primary/80">
                          hari ini
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Panel kanan */}
      <Card>
        <CardHeader className="pb-2 lg:pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base lg:text-lg">
            {selectedDay
              ? `Aktivitas ${fmtFullDate(selectedDay)}`
              : "Aktivitas Bulan Ini"}
          </CardTitle>

          {!readOnly && canAdd && onAddNew && (
            <Button
              size="sm"
              onClick={() => onAddNew(selectedDay ?? undefined)}
              disabled={updating}
              className="h-8 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm"
            >
              + <span className="ml-2 hidden sm:inline">Tambah</span>
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0" ref={panelRef}>
          {loading ? (
            <div className="p-3 space-y-2.5">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ) : panelList.length ? (
            <ul className="divide-y">
              {panelList.map((s) => (
                <li
                  key={s.id}
                  className={`pl-3 pr-4 lg:pl-4 lg:pr-5 py-2.5 lg:py-3 ${
                    readOnly ? "" : "hover:bg-muted/60 cursor-pointer"
                  }`}
                  onClick={() => (!readOnly && onEdit ? onEdit(s) : undefined)}
                >
                  <div className="flex items-start gap-3 lg:gap-4">
                    {/* kolom tanggal / jam */}
                    <div className="w-14 lg:w-16 shrink-0 text-left">
                      <div className="text-xs lg:text-sm text-muted-foreground leading-4">
                        {fmtDayShort(s.date)}
                      </div>
                      <div className="text-[11px] lg:text-xs mt-0.5">
                        {s.time}
                      </div>
                    </div>

                    {/* konten utama */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm lg:text-base font-semibold truncate">
                        {s.title}
                      </div>
                      <div className="text-[11px] lg:text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                        {s.room && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {s.room}
                          </span>
                        )}
                        {s.teacher && (
                          <span className="inline-flex items-center gap-1">
                            <User size={12} />
                            {s.teacher}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              s.type === "exam"
                                ? "bg-red-500"
                                : s.type === "event"
                                ? "bg-green-500"
                                : "bg-primary"
                            }`}
                          />
                          <span className="capitalize">
                            {s.type ?? "class"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* actions */}
                    {!readOnly && (
                      <div className="flex items-center gap-1.5">
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 lg:h-8 lg:w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(s);
                            }}
                            title="Edit"
                            disabled={updating}
                          >
                            ✎
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 lg:h-8 lg:w-8 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(s.id);
                            }}
                            title="Hapus"
                            disabled={deleting}
                          >
                            🗑
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm lg:text-base text-muted-foreground">
              {selectedDay
                ? "Tidak ada aktivitas pada tanggal ini."
                : "Belum ada aktivitas bulan ini."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}