// src/pages/sekolahislamku/dashboard-school/SchoolTeacher.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";
import type { AxiosError } from "axios";

/* Icons */
import {
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  Eye,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* 🔐 Current user */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/* Modals */
import TambahGuru from "./components/CSchoolAddTeacher";
import UploadFileGuru from "./components/CSchoolUploadFileTeacher";

/* ✅ DataTable ala Academic/Room */
import {
  CDataTable as DataTable,
  type ColumnDef,
  type ViewMode,
} from "@/components/costum/table/CDataTable";

/* ================= Types (API) ================= */
export interface TeacherApiRow {
  school_teacher_id: string;
  school_teacher_school_id: string;
  school_teacher_user_teacher_id: string;

  school_teacher_code: string | null;
  school_teacher_slug: string | null;

  school_teacher_employment?: "tetap" | "honor" | string;
  school_teacher_is_active: boolean;
  school_teacher_joined_at: string | null;
  school_teacher_left_at?: string | null;
  school_teacher_is_verified: boolean;
  school_teacher_verified_at?: string | null;
  school_teacher_is_public: boolean;
  school_teacher_notes?: string | null;

  school_teacher_user_teacher_name_snapshot: string | null;
  school_teacher_user_teacher_avatar_url_snapshot: string | null;
  school_teacher_user_teacher_whatsapp_url_snapshot: string | null;
  school_teacher_user_teacher_title_prefix_snapshot: string | null;
  school_teacher_user_teacher_title_suffix_snapshot: string | null;

  // gender snapshot dari user_teacher
  school_teacher_user_teacher_gender_snapshot?:
  | "male"
  | "female"
  | string
  | null;

  school_teacher_school_name_snapshot?: string | null;
  school_teacher_school_slug_snapshot?: string | null;

  school_teacher_sections: any[] | string;
  school_teacher_csst: any[] | string;

  // agregat (kalau ada di API)
  school_teacher_total_class_sections?: number;
  school_teacher_total_class_section_subject_teachers?: number;
  school_teacher_total_class_sections_active?: number;
  school_teacher_total_class_section_subject_teachers_active?: number;

  school_teacher_created_at: string;
  school_teacher_updated_at: string;
  school_teacher_deleted_at?: string | null;
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

/* ===================== Hooks kecil: search (debounce + sync ?q=) ===================== */
function useSearchQueryParam(key: string, initial = "") {
  const [sp, setSp] = useSearchParams();
  const urlValue = sp.get(key) ?? initial;
  const [value, setValue] = useState(urlValue);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp);
      if (value) next.set(key, value);
      else next.delete(key);
      setSp(next, { replace: true });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (urlValue !== value) setValue(urlValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlValue]);

  return { value, setValue };
}

/* ===================== Actions Menu (dropdown) ===================== */
function ActionsMenu({ onView }: { onView: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView} className="gap-2">
          <Eye size={14} /> Lihat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ================= Main Component ================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolTeacher: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  /* 🔐 Ambil school_id dari JWT/simple-context, fallback cookie UI */
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const activeMembership = currentUser?.membership ?? null;
  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* Atur breadcrumb dan title seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Guru",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Profil" },
        { label: "Guru" },
      ],
      actions: null,
    });
  }, [setHeader]);

  // 🔎 Search sinkron ke ?q=
  const search = useSearchQueryParam("q");
  const q = search.value;
  const setQ = search.setValue;

  /* Guard kalau belum ada schoolId setelah user ke-load */
  if (!schoolId && !userLoading) {
    return (
      <div className="p-4 text-sm">
        Tidak ditemukan sekolah aktif pada akun ini. Pastikan Anda sudah
        memiliki membership sekolah.
      </div>
    );
  }

  /* ===== Query list (user scope) ===== */
  const {
    data,
    isLoading: teachersLoading,
    isError,
    refetch,
    error,
  } = useQuery<PublicTeachersResponse, AxiosError>({
    queryKey: ["u-school-teachers", schoolId],
    enabled: Boolean(schoolId),
    staleTime: 120_000,
    retry: 1,
    queryFn: async () => {
      const res = await axios.get<PublicTeachersResponse>(
        "/api/u/school-teachers/list",
        {
          params: {
            page: 1,
            per_page: 999,
            // kalau nanti mau server-side search, tinggal aktifin:
            // q: q || undefined,
          },
        }
      );
      return res.data;
    },
  });

  const errorMessage =
    (error?.response?.data as any)?.message ||
    (typeof error?.response?.data === "string"
      ? (error?.response?.data as string)
      : error?.message);

  /* ===== Map API → UI ===== */
  const rows: TeacherItem[] = useMemo(() => {
    const rows = data?.data ?? [];
    return rows.map((t) => {
      const csstArr = safeParseArray(t.school_teacher_csst);
      const subject =
        csstArr?.[0]?.class_subject_name_snapshot ??
        csstArr?.[0]?.subject_name_snapshot ??
        undefined;

      // map gender snapshot → "L" / "P"
      let gender: "L" | "P" | undefined;
      if (t.school_teacher_user_teacher_gender_snapshot === "male") {
        gender = "L";
      } else if (t.school_teacher_user_teacher_gender_snapshot === "female") {
        gender = "P";
      }

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
        gender,
        // email belum ada di snapshot → biarkan undefined
      } as TeacherItem;
    });
  }, [data]);

  /* ===== Columns (konsisten dengan Room: rata kiri, badges minimalis) ===== */
  const columns = useMemo<ColumnDef<TeacherItem>[]>(() => {
    return [
      {
        id: "name",
        header: "Nama",
        minW: "240px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {(r.employment ?? "-") +
                " • " +
                (r.isActive ? "Aktif" : "Nonaktif") +
                (r.isVerified ? " • Terverifikasi" : "")}
            </div>
          </div>
        ),
      },
      {
        id: "subject",
        header: "Mapel",
        minW: "160px",
        align: "left",
        className: "text-left",
        cell: (r) => r.subject ?? "-",
      },
      {
        id: "gender",
        header: "Gender",
        minW: "120px",
        align: "left",
        className: "text-left",
        cell: (r) => genderLabel(r.gender),
      },
      {
        id: "contact",
        header: "Kontak",
        minW: "220px",
        align: "left",
        className: "text-left",
        cell: (r) => (
          <div className="flex items-center gap-3 text-sm">
            {r.phone && (
              <a
                href={`tel:${r.phone}`}
                className="flex items-center gap-1 hover:underline text-primary"
                onClick={(e) => e.stopPropagation()}
                data-interactive
              >
                <Phone size={14} /> {r.phone}
              </a>
            )}
            {r.email && (
              <a
                href={`mailto:${r.email}`}
                className="flex items-center gap-1 hover:underline text-primary"
                onClick={(e) => e.stopPropagation()}
                data-interactive
              >
                <Mail size={14} /> Email
              </a>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        minW: "120px",
        cell: (r) => (
          <span
            className={[
              "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1",
              r.isActive
                ? "bg-sky-500/15 text-sky-400 ring-sky-500/25"
                : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
            ].join(" ")}
          >
            {r.isActive ? "Aktif" : "Nonaktif"}
          </span>
        ),
      },
    ];
  }, []);

  /* ===== StatsSlot (konsisten) ===== */
  const isLoading = userLoading || teachersLoading;

  const statsSlot = isLoading ? (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="animate-spin" size={16} /> Memuat guru…
    </div>
  ) : isError ? (
    <div className="rounded-xl border p-4 text-sm space-y-2">
      <div className="flex items-center gap-2 text-amber-600">
        <AlertTriangle size={16} /> Gagal memuat data guru.
      </div>
      {errorMessage && (
        <pre className="text-xs opacity-70 overflow-auto">{errorMessage}</pre>
      )}
      <Button size="sm" onClick={() => refetch()}>
        Coba lagi
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-2">
      <div className="text-sm text-muted-foreground" />
      {/* Tombol Import CSV tetap ada, dijaga konsisten di area ringkasan */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="gap-1"
          onClick={() => setOpenImport(true)}
        >
          <Upload size={14} /> Import CSV
        </Button>
      </div>
    </div>
  );

  /* ===== Render Card (mode grid di mobile) ===== */
  const renderCard = (t: TeacherItem) => (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium min-w-0 truncate">{t.name}</div>
        <Badge variant={t.isActive ? "default" : "secondary"}>
          {t.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground">{t.subject ?? "-"}</div>
      <div className="text-sm space-y-1">
        <div>
          <span className="text-muted-foreground">Status: </span>
          {(t.employment ?? "-") + (t.isVerified ? " • Terverifikasi" : "")}
        </div>
        <div className="flex gap-3 mt-1">
          {t.phone && (
            <a
              href={`tel:${t.phone}`}
              className="flex items-center gap-1 text-sm hover:underline text-primary"
              onClick={(e) => e.stopPropagation()}
              data-interactive
            >
              <Phone size={14} /> {t.phone}
            </a>
          )}
          {t.email && (
            <a
              href={`mailto:${t.email}`}
              className="flex items-center gap-1 text-sm hover:underline text-primary"
              onClick={(e) => e.stopPropagation()}
              data-interactive
            >
              <Mail size={14} /> Email
            </a>
          )}
        </div>
      </div>
      <div className="pt-1 flex justify-end">
        <Button
          size="sm"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sekolah/profil/guru/${t.id}`);
          }}
        >
          Lihat <Eye size={14} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Modals */}
      {schoolId && (
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
      )}
      <UploadFileGuru open={openImport} onClose={() => setOpenImport(false)} />

      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* ✅ Header bagian atas */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>
            )}
            <h1 className="font-semibold text-lg md:text-xl">Guru</h1>
          </div>

          <DataTable<TeacherItem>
            /* ===== Toolbar konsisten ===== */
            addLabel="Tambah"
            onAdd={() => setOpenAdd(true)}
            controlsPlacement="above"
            /* Search (sinkron URL) */
            defaultQuery={q}
            onQueryChange={setQ}
            searchPlaceholder="Cari nama, mapel, kode, slug…"
            searchByKeys={["name", "subject", "code", "slug", "email", "nip"]}
            /* Ringkasan / info area */
            statsSlot={statsSlot}
            /* ===== Data ===== */
            loading={isLoading}
            error={isError ? errorMessage || "Error memuat data" : null}
            columns={columns}
            rows={rows}
            getRowId={(r) => r.id}
            /* Visual */
            defaultAlign="center"
            stickyHeader
            zebra={false}
            viewModes={["table", "card"] as ViewMode[]}
            defaultView="table"
            storageKey={`teachers:${schoolId || "unknown"}`}
            renderCard={renderCard}
            /* Klik baris → detail */
            onRowClick={(r) => navigate(`/sekolah/profil/guru/${r.id}`)}
            /* Actions dropdown ala Room */
            renderActions={(r) => (
              <ActionsMenu
                onView={() => navigate(`/sekolah/profil/guru/${r.id}`)}
              />
            )}
            /* Pagination client-side (pakai bawaan DataTable) */
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100, 200]}
          />
        </div>
      </main>
    </div>
  );
};

export default SchoolTeacher;
