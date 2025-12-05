import { useMemo, useState, useEffect, useRef } from "react";
import { MapPin, User, Search, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { pad2, fmtFullDate } from "./types/types";
import type { ScheduleRow } from "./types/types";

import { CRowActions } from "@/components/costum/table/CRowAction";
import { cardHover } from "@/components/costum/table/CDataTable";

type Props = {
  data: ScheduleRow[];
  loading?: boolean;
  onAddNew?: () => void;
  onEdit?: (row: ScheduleRow) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
  updating?: boolean;
  deleting?: boolean;
  scrollSignal?: number;

  /** === BARU DITAMBAH ===
   *   Jika true → sembunyikan icon edit/delete di list
   */
  hideRowActions?: boolean;
};

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${y}-${m}-${dd}`;
}

export default function ScheduleList({
  data,
  loading = false,
  onAddNew,
  onEdit,
  onDelete,
  readOnly = false,
  updating = false,
  deleting = false,
  scrollSignal,
  hideRowActions = false, // default: false
}: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "class" | "exam" | "event"
  >("all");

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollSignalRef = useRef<number | undefined>(undefined);
  const lastMonthRef = useRef<string | undefined>(undefined);
  const today = todayKey();
  const isBusy = updating || deleting;

  const flatList = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          +new Date(a.date) - +new Date(b.date) || a.time.localeCompare(b.time)
      ),
    [data]
  );

  const listFiltered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return flatList.filter((s) => {
      const okType =
        typeFilter === "all" ? true : (s.type ?? "class") === typeFilter;
      const hay = `${s.title} ${s.room ?? ""} ${s.teacher ?? ""} ${s.description ?? ""
        }`.toLowerCase();
      const okQ = qn ? hay.includes(qn) : true;
      return okType && okQ;
    });
  }, [flatList, q, typeFilter]);

  const listByDay = useMemo(() => {
    const group = new Map<string, ScheduleRow[]>();
    listFiltered.forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
        d.getDate()
      )}`;
      const arr = group.get(key) || [];
      arr.push(s);
      arr.sort((a, b) => a.time.localeCompare(b.time));
      group.set(key, arr);
    });
    const keys = Array.from(group.keys()).sort(
      (a, b) => +new Date(a) - +new Date(b)
    );
    return { keys, group };
  }, [listFiltered]);

  useEffect(() => {
    if (loading) return;
    if (!listByDay.keys.length) return;

    const currentMonth = listByDay.keys[0]?.slice(0, 7);
    const prevMonth = lastMonthRef.current;
    const monthChanged = currentMonth !== prevMonth;
    const todayMonth = today.slice(0, 7);
    const isCurrentMonth = currentMonth === todayMonth;

    const prevSignal = lastScrollSignalRef.current;
    const triggerBySignal =
      scrollSignal !== undefined && scrollSignal !== prevSignal;

    lastMonthRef.current = currentMonth;
    lastScrollSignalRef.current = scrollSignal;

    const scrollToTarget = () => {
      const keys = listByDay.keys;
      if (!keys.length) return;

      let target = keys.find((k) => k === today);
      if (!target) {
        target = keys.find((k) => +new Date(k) >= +new Date(today));
      }
      if (!target) {
        target = keys[keys.length - 1];
      }

      const el = scrollContainerRef.current?.querySelector<HTMLDivElement>(
        `#day-${target}`
      );
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ block: "start", behavior: "smooth" });
        });
      }
    };

    if (triggerBySignal) {
      scrollToTarget();
      return;
    }

    if (monthChanged && isCurrentMonth) {
      scrollToTarget();
      return;
    }

    if (monthChanged && !isCurrentMonth) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      return;
    }
  }, [loading, listByDay.keys, today, scrollSignal]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Daftar Jadwal</CardTitle>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul/ruangan/guru..."
                className="pl-8 w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={typeFilter}
                onValueChange={(v: "all" | "class" | "exam" | "event") =>
                  setTypeFilter(v)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua jenis</SelectItem>
                  <SelectItem value="class">Kelas</SelectItem>
                  <SelectItem value="exam">Ujian</SelectItem>
                  <SelectItem value="event">Acara</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!readOnly && onAddNew && (
              <Button size="sm" onClick={onAddNew}>
                + <span className="ml-2 hidden sm:inline">Tambah</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : listByDay.keys.length ? (
          <div ref={scrollContainerRef} className="max-h-[70vh] overflow-auto">
            {listByDay.keys.map((key) => {
              const isToday = key === today;
              return (
                <div key={key} className="border-t first:border-t-0">
                  <div
                    id={`day-${key}`}
                    className={[
                      "px-4 py-2 text-xs font-medium flex items-center gap-2",
                      isToday
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-muted/50",
                    ].join(" ")}
                  >
                    {fmtFullDate(key)}
                    {isToday && (
                      <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] bg-primary/15">
                        Hari ini
                      </span>
                    )}
                  </div>

                  <ul className="divide-y">
                    {listByDay.group.get(key)!.map((s) => (
                      <li
                        key={s.id}
                        className={[
                          "p-3 relative",
                          isToday
                            ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary/70"
                            : "",
                          !readOnly ? cardHover : "",
                        ].join(" ")}
                        onClick={() =>
                          !readOnly && !isBusy && onEdit ? onEdit(s) : undefined
                        }
                      >

                        <div className="flex items-start gap-3">
                          <div className="w-16 shrink-0 text-left">
                            <div className="text-[11px]">{s.time}</div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {s.title}
                            </div>

                            <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-0.5">
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
                                  className={[
                                    "h-2 w-2 rounded-full",
                                    s.type === "exam"
                                      ? "bg-red-500"
                                      : s.type === "event"
                                        ? "bg-green-500"
                                        : "bg-primary",
                                  ].join(" ")}
                                />
                                {s.type ?? "class"}
                              </span>
                            </div>

                            {s.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {s.description}
                              </p>
                            )}

                            {s.status && (
                              <div className="mt-2">
                                <span
                                  className={
                                    s.status === "present"
                                      ? "text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-medium"
                                      : "text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-medium"
                                  }
                                >
                                  {s.status === "present"
                                    ? "Hadir"
                                    : "Tidak Hadir"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* RowActions TIDAK muncul jika hideRowActions = true */}
                          {!readOnly &&
                            !hideRowActions && // ← BARU DITAMBAH
                            (onEdit || onDelete) && (
                              <CRowActions<ScheduleRow>
                                mode="inline"
                                size="sm"
                                row={s}
                                suppressView
                                onEdit={
                                  onEdit
                                    ? (row) => {
                                      if (isBusy) return;
                                      onEdit(row);
                                    }
                                    : undefined
                                }
                                onDelete={
                                  onDelete
                                    ? (row) => {
                                      if (isBusy) return;
                                      onDelete(row.id);
                                    }
                                    : undefined
                                }
                                labels={{
                                  edit: "Edit",
                                  delete: "Hapus",
                                }}
                              />
                            )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            Tidak ada jadwal yang cocok dengan filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
