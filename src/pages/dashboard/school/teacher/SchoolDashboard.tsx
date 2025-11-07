// src/pages/sekolahislamku/dashboard-school/SchoolTeacher.tsx
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  useNavigate,
  NavLink,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import type { AxiosError } from "axios";

import {
  UserPlus,
  ChevronRight,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

/* ===== shadcn/ui ===== */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

/* ===== Modals (versi shadcn; tidak butuh palette) ===== */
import TambahGuru from "./components/CSchoolAddTeacher";
import UploadFileGuru from "./components/CSchoolUploadFileTeacher";

/* ================= Types (API) ================= */
export interface TeacherApiRow {
  school_teacher_id: string;
  school_teacher_school_id: string;
  school_teacher_user_teacher_id: string;

  school_teacher_code: string | null;
  school_teacher_slug: string | null;

  school_teacher_employment: "tetap" | "honor" | string;
  school_teacher_is_active: boolean;
  school_teacher_joined_at: string | null;
  school_teacher_left_at: string | null;
  school_teacher_is_verified: boolean;
  school_teacher_verified_at: string | null;
  school_teacher_is_public: boolean;
  school_teacher_notes: string | null;

  school_teacher_user_teacher_name_snapshot: string | null;
  school_teacher_user_teacher_avatar_url_snapshot: string | null;
  school_teacher_user_teacher_whatsapp_url_snapshot: string | null;
  school_teacher_user_teacher_title_prefix_snapshot: string | null;
  school_teacher_user_teacher_title_suffix_snapshot: string | null;

  school_teacher_school_name_snapshot: string | null;
  school_teacher_school_slug_snapshot: string | null;

  school_teacher_sections: any[] | string;
  school_teacher_csst: any[] | string;

  school_teacher_created_at: string;
  school_teacher_updated_at: string;
  school_teacher_deleted_at: string | null;
}

type PublicTeachersResponse = {
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  data: TeacherApiRow[];
};

/* ================= Types (UI) ================= */
export interface TeacherItem {
  id: string;
  code?: string | null;
  slug?: string | null;

  name: string;
  avatarUrl?: string | null;
  phone?: string;
  subject?: string;

  employment?: string;
  isActive: boolean;
  isPublic: boolean;
  isVerified: boolean;

  joinedAt?: string | null;
  leftAt?: string | null;

  nip?: string;
  gender?: "L" | "P";
  email?: string;
}

type SchoolTeacherProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

/* ================= Helpers ================= */
const genderLabel = (gender?: "L" | "P"): string =>
  gender === "L" ? "Laki-laki" : gender === "P" ? "Perempuan" : "-";

const buildTeacherName = (
  prefix?: string | null,
  name?: string | null,
  suffix?: string | null
) => {
  const parts = [prefix, name, suffix].filter(Boolean) as string[];
  const s = parts.join(" ").trim();
  return s.length ? s : "Tanpa Nama";
};

function safeParseArray(v: unknown): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parsePhoneFromWa(wa?: string | null) {
  if (!wa) return undefined;
  try {
    const u = new URL(wa);
    const raw = u.pathname.replace("/", "");
    return raw.startsWith("62") ? `0${raw.slice(2)}` : raw;
  } catch {
    return undefined;
  }
}

/* ================= Slug/school Hook ================= */
function useSchoolPath() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const base = schoolId ?? "";
  const makePath = (path: string) => `/${base}/sekolah/${path}`;
  return { base, makePath, schoolId: base };
}

/* ================= Hooks kecil: search (debounce + sync ?q=) ================= */
function useSearchQueryParam(key: string, initial = "") {
  const [sp, setSp] = useSearchParams();
  const urlValue = sp.get(key) ?? initial;
  const [value, setValue] = useState(urlValue);

  // sinkron ke URL (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp);
      if (value) next.set(key, value);
      else next.delete(key);
      setSp(next, { replace: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // bila URL berubah dari luar
  useEffect(() => {
    if (urlValue !== value) setValue(urlValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlValue]);

  return { value, setValue };
}

/* ================= Hooks kecil: pagination offset/limit ================= */
function useOffsetLimit(total: number, defaultLimit = 20) {
  const [limit, setLimit] = useState(defaultLimit);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // jaga offset tetap valid jika total/limit berubah
    const maxStart = Math.max(0, total - (total % limit || limit));
    if (offset > maxStart) setOffset(0);
  }, [total, limit, offset]);

  const canPrev = offset > 0;
  const canNext = offset + limit < total;
  const handlePrev = () => canPrev && setOffset(Math.max(0, offset - limit));
  const handleNext = () => canNext && setOffset(offset + limit);

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + limit, total);

  return {
    limit,
    setLimit,
    offset,
    setOffset,
    canPrev,
    canNext,
    handlePrev,
    handleNext,
    pageStart,
    pageEnd,
  };
}

/* ================= UI Bits ================= */
function PageHeader({
  onImportClick,
  onAddClick,
  onBackClick,
  rightExtras,
}: {
  onImportClick: () => void;
  onAddClick: () => void;
  onBackClick?: () => void;
  rightExtras?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <div className="hidden md:flex items-center gap-2 flex-1">
        {onBackClick && (
          <Button
            variant="ghost"
            onClick={onBackClick}
            className="items-center gap-1.5"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <h1 className="text-lg font-semibold">Guru</h1>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {rightExtras}
        <Button
          variant="outline"
          className="flex items-center gap-1.5 text-xs sm:text-sm"
          onClick={onImportClick}
        >
          <Upload size={14} />
          <span className="hidden sm:inline">Import CSV</span>
          <span className="sm:hidden">Import</span>
        </Button>
        <Button
          className="flex items-center gap-1.5 text-xs sm:text-sm"
          onClick={onAddClick}
        >
          <UserPlus size={14} />
          <span className="hidden sm:inline">Tambah Guru</span>
          <span className="sm:hidden">Tambah</span>
        </Button>
      </div>
    </div>
  );
}

/* ==== Kartu (mobile) ==== */
function TeacherCardMobile({ teacher }: { teacher: TeacherItem }) {
  const { makePath } = useSchoolPath();
  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium min-w-0 truncate">{teacher.name}</div>
        <Badge variant={teacher.isActive ? "default" : "secondary"}>
          {teacher.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground">
        {teacher.subject ?? "-"}
      </div>

      <div className="text-sm space-y-1">
        <div>
          <span className="text-muted-foreground">NIP: </span>
          {teacher.nip ?? "-"}
        </div>
        <div>
          <span className="text-muted-foreground">Gender: </span>
          {genderLabel(teacher.gender)}
        </div>
        <div className="flex gap-3 mt-1">
          {teacher.phone && (
            <a
              href={`tel:${teacher.phone}`}
              className="flex items-center gap-1 text-sm hover:underline text-primary"
            >
              <Phone size={14} /> {teacher.phone}
            </a>
          )}
          {teacher.email && (
            <a
              href={`mailto:${teacher.email}`}
              className="flex items-center gap-1 text-sm hover:underline text-primary"
            >
              <Mail size={14} /> Email
            </a>
          )}
        </div>
      </div>

      <div className="pt-1 flex justify-end">
        <NavLink to={makePath(`guru/${teacher.id}`)}>
          <Button size="sm" className="gap-1">
            Detail <ChevronRight size={14} />
          </Button>
        </NavLink>
      </div>
    </div>
  );
}

/* ================= Main Component ================= */
const SchoolTeacher: React.FC<SchoolTeacherProps> = ({ showBack = false }) => {
  const navigate = useNavigate();

  // ✅ Ambil :schoolId dari PATH: /:schoolId/sekolah/...
  const { schoolId } = useParams<{ schoolId: string }>();

  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  // 🔎 Search sinkron ke ?q=
  const search = useSearchQueryParam("q");
  const q = search.value;
  const setQ = search.setValue;

  if (!schoolId) {
    return (
      <div className="p-4">
        <p className="text-sm">
          <b>schoolId</b> tidak ditemukan di path. Pastikan URL seperti:
          <code className="ml-1">/SCHOOL_ID/sekolah/menu-utama/guru</code>
        </p>
      </div>
    );
  }

  /* ================= React Query: PUBLIC list ================= */
  const {
    data: resp,
    isLoading,
    isError,
    refetch,
    isFetching,
    error,
  } = useQuery<PublicTeachersResponse, AxiosError>({
    queryKey: ["public-school-teachers", schoolId],
    enabled: Boolean(schoolId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const res = await axios.get<PublicTeachersResponse>(
        `/public/${schoolId}/school-teachers/list`,
        { params: { page: 1, per_page: 999 } }
      );
      return res.data;
    },
  });

  const errorMessage =
    (error?.response?.data as any)?.message ||
    (typeof error?.response?.data === "string"
      ? (error?.response?.data as string)
      : error?.message);

  /* ================= Mapping API -> UI ================= */
  const allTeachers: TeacherItem[] = useMemo(() => {
    const rows = resp?.data ?? [];
    return rows.map((t) => {
      const csstArr = safeParseArray(t.school_teacher_csst);
      const subject =
        csstArr?.[0]?.class_subject_name_snapshot ??
        csstArr?.[0]?.subject_name_snapshot ??
        "Umum";

      return {
        id: t.school_teacher_id,
        code: t.school_teacher_code,
        slug: t.school_teacher_slug,
        name: buildTeacherName(
          t.school_teacher_user_teacher_title_prefix_snapshot,
          t.school_teacher_user_teacher_name_snapshot,
          t.school_teacher_user_teacher_title_suffix_snapshot
        ),
        avatarUrl: t.school_teacher_user_teacher_avatar_url_snapshot,
        phone: parsePhoneFromWa(
          t.school_teacher_user_teacher_whatsapp_url_snapshot
        ),
        subject,
        employment: t.school_teacher_employment,
        isActive: t.school_teacher_is_active,
        isPublic: t.school_teacher_is_public,
        isVerified: t.school_teacher_is_verified,
        joinedAt: t.school_teacher_joined_at,
        leftAt: t.school_teacher_left_at,
      } as TeacherItem;
    });
  }, [resp]);

  /* ==== Filter by q (client) ==== */
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return allTeachers;
    return allTeachers.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        (t.nip ?? "").toLowerCase().includes(needle) ||
        (t.email ?? "").toLowerCase().includes(needle)
    );
  }, [allTeachers, q]);

  /* ==== Pagination (client) ==== */
  const total = filtered.length;
  const {
    limit,
    setLimit,
    offset,
    canPrev,
    canNext,
    handlePrev,
    handleNext,
    pageStart,
    pageEnd,
  } = useOffsetLimit(total, 20);

  const pageItems = useMemo(
    () => filtered.slice(offset, Math.min(offset + limit, total)),
    [filtered, offset, limit, total]
  );

  /* ==== UI ==== */
  const handleOpenAdd = useCallback(() => setOpenAdd(true), []);
  const handleOpenImport = useCallback(() => setOpenImport(true), []);

  return (
    <div className="w-full">
      {/* Modals (shadcn, tanpa palette) */}
      <TambahGuru
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        subjects={[
          "Matematika",
          "Bahasa Indonesia",
          "Bahasa Inggris",
          "IPA",
          "IPS",
          "Agama",
        ]}
        schoolId={schoolId}
        onCreated={() => refetch()}
      />
      <UploadFileGuru open={openImport} onClose={() => setOpenImport(false)} />

      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 p-4 md:p-6">
          {/* ===== Header + Search ===== */}
          <PageHeader
            onImportClick={handleOpenImport}
            onAddClick={handleOpenAdd}
            onBackClick={showBack ? () => navigate(-1) : undefined}
            rightExtras={
              <div className="w-full md:w-80">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama, NIP, email…"
                />
              </div>
            }
          />

          {/* ===== Body ===== */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Daftar Guru</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {isFetching ? "memuat…" : `${total} total`}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-4 md:p-6">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  Memuat data…
                </div>
              ) : isError ? (
                <div className="rounded-xl border p-4 text-sm">
                  <div className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle size={16} />
                    Terjadi kesalahan.
                  </div>
                  {errorMessage && (
                    <pre className="text-xs text-muted-foreground mt-2 overflow-auto">
                      {errorMessage}
                    </pre>
                  )}
                  <Button size="sm" className="mt-3" onClick={() => refetch()}>
                    Coba lagi
                  </Button>
                </div>
              ) : total === 0 ? (
                <div className="py-6 text-sm text-muted-foreground">
                  Belum ada data guru.
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden grid gap-3">
                    {pageItems.map((t) => (
                      <TeacherCardMobile key={t.id} teacher={t} />
                    ))}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[140px]">NIP</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead className="w-[160px]">Mapel</TableHead>
                            <TableHead className="w-[120px]">Gender</TableHead>
                            <TableHead>Kontak</TableHead>
                            <TableHead className="w-[120px] text-right">
                              Aksi
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pageItems.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell>{t.nip ?? "-"}</TableCell>
                              <TableCell>
                                <div className="min-w-0">
                                  <div className="font-medium">{t.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {t.employment ?? "-"} •{" "}
                                    {t.isActive ? "Aktif" : "Nonaktif"}
                                    {t.isVerified ? " • Terverifikasi" : ""}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{t.subject ?? "-"}</TableCell>
                              <TableCell>{genderLabel(t.gender)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3 text-sm">
                                  {t.phone && (
                                    <a
                                      href={`tel:${t.phone}`}
                                      className="flex items-center gap-1 hover:underline text-primary"
                                    >
                                      <Phone size={14} /> {t.phone}
                                    </a>
                                  )}
                                  {t.email && (
                                    <a
                                      href={`mailto:${t.email}`}
                                      className="flex items-center gap-1 hover:underline text-primary"
                                    >
                                      <Mail size={14} /> Email
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <NavLink
                                  to={useSchoolPath().makePath(`guru/${t.id}`)}
                                >
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="gap-1"
                                  >
                                    Detail <ChevronRight size={14} />
                                  </Button>
                                </NavLink>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Footer Pagination */}
                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="text-sm text-muted-foreground">
                      {pageStart}–{pageEnd} dari {total}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(limit)}
                        onValueChange={(v) => {
                          const n = Number(v);
                          if (Number.isFinite(n)) setLimit(n);
                        }}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Per halaman" />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 20, 50, 100, 200].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}/hal
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={handlePrev}
                          disabled={!canPrev}
                          size="sm"
                        >
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleNext}
                          disabled={!canNext}
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolTeacher;
