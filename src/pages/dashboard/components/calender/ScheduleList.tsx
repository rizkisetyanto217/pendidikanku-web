// src/components/schedule/ScheduleList.tsx
import { useMemo, useState } from "react";
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

type Props = {
  data: ScheduleRow[];
  loading?: boolean;
  onAddNew?: () => void;
  onEdit?: (row: ScheduleRow) => void;
  onDelete?: (id: string) => void;
  updating?: boolean;
  deleting?: boolean;
  readOnly?: boolean; // <-- baru
};

export default function ScheduleList({
  data,
  loading = false,
  onAddNew,
  onEdit,
  onDelete,
  updating = false,
  deleting = false,
  readOnly = false,
}: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "class" | "exam" | "event"
  >("all");

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
      const hay = `${s.title} ${s.room ?? ""} ${s.teacher ?? ""} ${
        s.description ?? ""
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

            {/* tombol tambah disembunyikan jika readOnly */}
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
          <div>
            {listByDay.keys.map((key) => (
              <div key={key} className="border-t first:border-t-0">
                <div className="px-4 py-2 bg-muted/50 text-xs font-medium">
                  {fmtFullDate(key)}
                </div>
                <ul className="divide-y">
                  {listByDay.group.get(key)!.map((s) => (
                    <li
                      key={s.id}
                      className={`p-3 ${
                        readOnly ? "" : "hover:bg-muted/50 cursor-pointer"
                      }`}
                      onClick={() =>
                        !readOnly && onEdit ? onEdit(s) : undefined
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
                                className={`h-2 w-2 rounded-full ${
                                  s.type === "exam"
                                    ? "bg-red-500"
                                    : s.type === "event"
                                    ? "bg-green-500"
                                    : "bg-primary"
                                }`}
                              />
                              {s.type ?? "class"}
                            </span>
                          </div>
                          {s.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {s.description}
                            </p>
                          )}
                        </div>

                        {/* actions disembunyikan saat readOnly */}
                        {!readOnly && (
                          <>
                            {onEdit && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
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
                                className="h-7 w-7 text-destructive"
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
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
