// src/pages/sekolahislamku/pages/academic/SchoolActiveClass.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  ArrowLeft,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ======== shadcn/ui imports ======== */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
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

/* ===================== Types & Dummy ===================== */
type ClassRow = {
  id: string;
  name: string;
  academic_year: string;
  homeroom_teacher: string;
  student_count: number;
  status: "active" | "inactive";
};

type ApiActiveClassResp = {
  list: ClassRow[];
};

/* ===================== Small UI Helpers (shadcn) ===================== */
function SearchBar({
  value,
  onChange,
  placeholder,
  rightExtra,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rightExtra?: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Search…"}
          className="w-full"
        />
      </div>
      {rightExtra}
    </div>
  );
}

function PerPageSelect({
  value,
  onChange,
  options = [8, 12, 24, 48, 100],
}: {
  value: number;
  onChange: (n: number) => void;
  options?: number[];
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="per-page" className="whitespace-nowrap text-sm">
        Per page
      </Label>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger id="per-page" className="w-[96px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PaginationBar({
  pageStart,
  pageEnd,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  pageStart: number;
  pageEnd: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <div className="text-sm text-muted-foreground">
        Menampilkan{" "}
        <span className="font-medium text-foreground">{pageStart}</span>–
        <span className="font-medium text-foreground">{pageEnd}</span> dari{" "}
        <span className="font-medium text-foreground">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ClassRow["status"] }) {
  const isActive = status === "active";
  return (
    <Badge variant={isActive ? "default" : "outline"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

/* ===================== Card UI (Mobile) ===================== */
function ActiveClassCard({ r }: { r: ClassRow }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{r.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {r.academic_year}
            </div>
          </div>
          <StatusBadge status={r.status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Wali Kelas:{" "}
            {r.homeroom_teacher}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {r.student_count} siswa
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ===================== Hook: offset/limit (simple) ===================== */
function useOffsetLimit(total: number, defaultLimit = 8) {
  const [limit, setLimit] = useState<number>(defaultLimit);
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    setOffset(0);
  }, [total, limit]);

  const pageStart = total === 0 ? 0 : Math.min(offset + 1, total);
  const pageEnd = Math.min(offset + limit, total);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const handlePrev = () => {
    if (!canPrev) return;
    setOffset(Math.max(0, offset - limit));
  };
  const handleNext = () => {
    if (!canNext) return;
    setOffset(offset + limit);
  };

  return {
    offset,
    limit,
    setLimit,
    pageStart,
    pageEnd,
    canPrev,
    canNext,
    handlePrev,
    handleNext,
  };
}

/* ===================== Page ===================== */
const SchoolActiveClass: React.FC = () => {
  const navigate = useNavigate();

  // === Dummy Query ===
  const classesQ = useQuery({
    queryKey: ["active-classes"],
    queryFn: async (): Promise<ApiActiveClassResp> => {
      const dummy: ApiActiveClassResp = {
        list: Array.from({ length: 18 }).map((_, i) => ({
          id: `cls-${i + 1}`,
          name: `Kelas ${i + 1}${["A", "B"][i % 2]}`,
          academic_year: "2025/2026",
          homeroom_teacher: `Ustadz/Ustadzah ${i + 1}`,
          student_count: 25 + (i % 6),
          status: i % 5 === 0 ? "inactive" : "active",
        })),
      };
      return dummy;
    },
    staleTime: 60_000,
  });

  const rows = useMemo(() => classesQ.data?.list ?? [], [classesQ.data]);

  /* ==== 🔎 Search ==== */
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.homeroom_teacher.toLowerCase().includes(s) ||
        r.academic_year.includes(s)
    );
  }, [q, rows]);

  /* ==== ⏭ Pagination ==== */
  const total = filtered.length;
  const {
    offset,
    limit,
    setLimit,
    pageStart,
    pageEnd,
    canPrev,
    canNext,
    handlePrev,
    handleNext,
  } = useOffsetLimit(total, 8);

  const pageRows = filtered.slice(offset, offset + limit);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Header Bar */}
      <div className="p-4 md:p-5 pb-3 border-b border-border flex flex-wrap items-center gap-2">
        <div className="md:flex hidden items-center gap-2 font-semibold order-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base md:text-lg">Daftar Kelas Aktif</h1>
        </div>

        <div className="order-3 sm:order-2 w-full sm:w-auto flex-1 min-w-0">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Cari kelas, wali, atau tahun ajaran…"
            rightExtra={<PerPageSelect value={limit} onChange={setLimit} />}
          />
        </div>
      </div>

      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4 md:p-5">
          {/* ===== Section: Daftar Kelas ===== */}
          <Card>
            <div className="p-4 md:p-5 pb-3 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <GraduationCap className="h-4 w-4 text-primary" /> Daftar Kelas
              </div>
              <div className="text-sm text-muted-foreground">{total} total</div>
            </div>

            <CardContent className="p-4 md:p-5">
              {classesQ.isLoading ? (
                <div className="py-8 text-center text-sm flex items-center justify-center gap-2 text-muted-foreground">
                  <Info className="h-4 w-4" /> Memuat data kelas…
                </div>
              ) : total === 0 ? (
                <div className="py-8 text-center text-sm flex items-center justify-center gap-2 text-muted-foreground">
                  <Info className="h-4 w-4" /> Tidak ada data kelas.
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {pageRows.map((r) => (
                      <ActiveClassCard key={r.id} r={r} />
                    ))}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <div className="rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Kelas</TableHead>
                            <TableHead>Tahun Ajaran</TableHead>
                            <TableHead>Wali Kelas</TableHead>
                            <TableHead className="text-right">
                              Jumlah Siswa
                            </TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pageRows.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">
                                {r.name}
                              </TableCell>
                              <TableCell>{r.academic_year}</TableCell>
                              <TableCell>{r.homeroom_teacher}</TableCell>
                              <TableCell className="text-right">
                                {r.student_count}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={r.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <PaginationBar
                    pageStart={pageStart}
                    pageEnd={pageEnd}
                    total={total}
                    canPrev={canPrev}
                    canNext={canNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolActiveClass;
