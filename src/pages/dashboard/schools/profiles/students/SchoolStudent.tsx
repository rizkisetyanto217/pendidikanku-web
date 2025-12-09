// src/pages/sekolahislamku/dashboard-school/SchoolStudent.tsx
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

/* Breadcrumb dashboard */
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

// /* Modals: sesuaikan dengan nama komponenmu kalau beda */
// import TambahSiswa from "./components/CSchoolAddStudent";
// import UploadFileSiswa from "./components/CSchoolUploadFileStudent";

/* DataTable */
import {
    CDataTable as DataTable,
    type ColumnDef,
    type ViewMode,
} from "@/components/costum/table/CDataTable";

/* =============== Types (API) =============== */

export type StudentStatus =
    | "active"
    | "inactive"
    | "alumni"
    | "blocked"
    | string;

export interface StudentApiRow {
    school_student_id: string;
    school_student_school_id?: string;

    school_student_code: string | null;
    school_student_slug?: string | null;

    school_student_status: StudentStatus;
    school_student_joined_at: string | null;
    school_student_left_at?: string | null;

    // cache user_profile
    school_student_user_profile_name_cache: string | null;
    school_student_user_profile_avatar_url_cache: string | null;
    school_student_user_profile_whatsapp_url_cache: string | null;
    school_student_user_profile_gender_cache?: "male" | "female" | string | null;

    // kalau nanti API tambah field lain, tinggal extend:
    school_student_class_name_cache?: string | null;
    school_student_parent_name_cache?: string | null;
    school_student_parent_whatsapp_url_cache?: string | null;

    school_student_created_at?: string;
    school_student_updated_at?: string;
    school_student_deleted_at?: string | null;
}

type SchoolStudentsResponse = {
    pagination?: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
        count?: number;
        per_page_options?: number[];
    };
    data: StudentApiRow[];
};

/* =============== Types (UI) =============== */

export interface StudentItem {
    id: string;
    code?: string | null;
    slug?: string | null;

    name: string;
    avatarUrl?: string | null;

    phone?: string;
    parentPhone?: string;

    status: StudentStatus;
    joinedAt?: string | null;
    leftAt?: string | null;

    gender?: "L" | "P";

    className?: string | null;
    parentName?: string | null;

    email?: string;
}

/* =============== Helpers =============== */

const genderLabel = (gender?: "L" | "P"): string =>
    gender === "L" ? "Laki-laki" : gender === "P" ? "Perempuan" : "-";

const statusLabel = (s?: StudentStatus): string => {
    if (!s) return "-";
    switch (s) {
        case "active":
            return "Aktif";
        case "inactive":
            return "Tidak aktif";
        case "alumni":
            return "Alumni";
        case "blocked":
            return "Diblokir";
        default:
            return s;
    }
};

const formatShortDate = (d?: string | null) =>
    d
        ? new Date(d).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "-";

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

/* 🔎 Hooks kecil: search (debounce + sync ?q=) */
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

/* Actions dropdown (sama konsep dengan Guru) */
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

/* =============== Main Component =============== */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolStudent: React.FC<Props> = ({ showBack = false, backTo }) => {
    const navigate = useNavigate();
    //   const [openAdd, setOpenAdd] = useState(false);
    //   const [openImport, setOpenImport] = useState(false);

    /* 🔐 Ambil school_id dari membership / cookie */
    const { data: currentUser, isLoading: userLoading } = useCurrentUser();
    const activeMembership = currentUser?.membership ?? null;
    const schoolIdFromMembership = activeMembership?.school_id ?? null;
    const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

    const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

    /* Breadcrumb + header */
    const { setHeader } = useDashboardHeader();
    useEffect(() => {
        setHeader({
            title: "Siswa",
            breadcrumbs: [
                { label: "Dashboard", href: "dashboard" },
                { label: "Profil" },
                { label: "Siswa" },
            ],
            actions: null,
        });
    }, [setHeader]);

    // 🔎 Search sinkron ke ?q=
    const search = useSearchQueryParam("q");
    const q = search.value;
    const setQ = search.setValue;

    /* Guard kalau belum ada schoolId */
    if (!schoolId && !userLoading) {
        return (
            <div className="p-4 text-sm">
                Tidak ditemukan sekolah aktif pada akun ini. Pastikan Anda sudah
                memiliki membership sekolah.
            </div>
        );
    }

    /* ===== Query list siswa (user-scope) ===== */
    const {
        data,
        isLoading: studentsLoading,
        isError,
        refetch,
        error,
    } = useQuery<SchoolStudentsResponse, AxiosError>({
        queryKey: ["u-school-students", schoolId],
        enabled: Boolean(schoolId),
        staleTime: 120_000,
        retry: 1,
        queryFn: async () => {
            const res = await axios.get<SchoolStudentsResponse>(
                "/api/u/school-students/list",
                {
                    params: {
                        page: 1,
                        per_page: 999,
                        mode: "compact", // ✅ pakai mode=compact seperti Guru
                        // kalau nanti mau server-side search:
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
    const rows: StudentItem[] = useMemo(() => {
        const rows = data?.data ?? [];

        return rows.map((s) => {
            // Map gender cache → "L" / "P"
            let gender: "L" | "P" | undefined;
            if (s.school_student_user_profile_gender_cache === "male") {
                gender = "L";
            } else if (s.school_student_user_profile_gender_cache === "female") {
                gender = "P";
            }

            return {
                id: s.school_student_id,
                code: s.school_student_code,
                slug: s.school_student_slug,
                name: s.school_student_user_profile_name_cache || "Tanpa Nama",
                avatarUrl: s.school_student_user_profile_avatar_url_cache,
                phone: parsePhoneFromWa(
                    s.school_student_user_profile_whatsapp_url_cache
                ),
                parentPhone: parsePhoneFromWa(
                    s.school_student_parent_whatsapp_url_cache
                ),
                status: s.school_student_status,
                joinedAt: s.school_student_joined_at,
                leftAt: s.school_student_left_at,
                gender,
                className: s.school_student_class_name_cache,
                parentName: s.school_student_parent_name_cache,
                // email belum disnapshot di API → biarkan undefined
            } as StudentItem;
        });
    }, [data]);

    /* ===== Columns (konsisten dengan Guru/Room) ===== */
    const columns = useMemo<ColumnDef<StudentItem>[]>(() => {
        return [
            {
                id: "name",
                header: "Nama siswa",
                minW: "260px",
                align: "left",
                className: "text-left",
                cell: (r) => (
                    <div className="flex items-center gap-3">
                        {r.avatarUrl ? (
                            <div className="h-8 w-8 rounded-full overflow-hidden border bg-muted shrink-0">
                                <img
                                    src={r.avatarUrl}
                                    alt={r.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">
                                {r.name?.charAt(0) ?? "?"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="font-medium truncate">{r.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground truncate">
                                {r.className ? `Kelas: ${r.className}` : "Kelas belum diatur"}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "code",
                header: "Nomor siswa",
                minW: "140px",
                align: "left",
                className: "text-left",
                cell: (r) => r.code ?? "-",
            },
            {
                id: "gender",
                header: "JK",
                minW: "80px",
                align: "left",
                className: "text-left",
                cell: (r) => r.gender ?? "-",
            },
            {
                id: "joined_at",
                header: "Bergabung",
                minW: "140px",
                align: "left",
                className: "text-left whitespace-nowrap",
                cell: (r) => formatShortDate(r.joinedAt),
            },

            {
                id: "contact",
                header: "Kontak siswa",
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
                        {!r.phone && r.code && (
                            <span className="text-xs text-muted-foreground">
                                Nomor WA tersimpan
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: "status",
                header: "Status",
                minW: "140px",
                cell: (r) => {
                    const isActive = r.status === "active";
                    return (
                        <span
                            className={[
                                "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1",
                                isActive
                                    ? "bg-sky-500/15 text-sky-400 ring-sky-500/25"
                                    : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
                            ].join(" ")}
                        >
                            {statusLabel(r.status)}
                        </span>
                    );
                },
            },
        ];
    }, []);

    /* ===== StatsSlot (kaya Guru) ===== */
    const isLoading = userLoading || studentsLoading;

    const statsSlot = isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={16} /> Memuat siswa…
        </div>
    ) : isError ? (
        <div className="rounded-xl border p-4 text-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={16} /> Gagal memuat data siswa.
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
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="gap-1"
                //   onClick={() => setOpenImport(true)}
                >
                    <Upload size={14} /> Import CSV
                </Button>
            </div>
        </div>
    );

    /* ===== Card view (mobile) ===== */
    const renderCard = (s: StudentItem) => (
        <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    {s.avatarUrl ? (
                        <div className="h-9 w-9 rounded-full overflow-hidden border bg-muted shrink-0">
                            <img
                                src={s.avatarUrl}
                                alt={s.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">
                            {s.name?.charAt(0) ?? "?"}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {s.className ? `Kelas: ${s.className}` : "Kelas belum diatur"}
                        </div>
                    </div>
                </div>
                <Badge
                    variant={s.status === "active" ? "default" : "secondary"}
                    className="shrink-0"
                >
                    {statusLabel(s.status)}
                </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
                Nomor siswa: {s.code ?? "-"}
            </div>

            <div className="text-xs text-muted-foreground">
                JK: {genderLabel(s.gender)} • Bergabung: {formatShortDate(s.joinedAt)}
            </div>

            <div className="text-sm space-y-1 mt-1">
                <div className="flex flex-col gap-1">
                    {s.phone && (
                        <a
                            href={`tel:${s.phone}`}
                            className="flex items-center gap-1 text-sm hover:underline text-primary"
                            onClick={(e) => e.stopPropagation()}
                            data-interactive
                        >
                            <Phone size={14} /> {s.phone}
                        </a>
                    )}
                    {s.email && (
                        <a
                            href={`mailto:${s.email}`}
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
                        navigate(`${s.id}`);
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
            {/* {schoolId && (
        <TambahSiswa
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          schoolId={schoolId}
          onCreated={() => refetch()}
        />
      )}
      <UploadFileSiswa open={openImport} onClose={() => setOpenImport(false)} /> */}

            <main className="w-full">
                <div className="mx-auto flex flex-col gap-4 lg:gap-6">
                    {/* Header (optional, karena header utama sudah dari DashboardLayout) */}
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
                        <h1 className="font-semibold text-lg md:text-xl">Siswa</h1>
                    </div>

                    <DataTable<StudentItem>
                        /* Toolbar */
                        addLabel="Tambah"
                        // onAdd={() => setOpenAdd(true)}
                        controlsPlacement="above"
                        /* Search */
                        defaultQuery={q}
                        onQueryChange={setQ}
                        searchPlaceholder="Cari nama, kode, kelas, orang tua…"
                        searchByKeys={["name", "code", "className", "parentName", "email"]}
                        /* Info / stats */
                        statsSlot={statsSlot}
                        /* Data */
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
                        storageKey={`students:${schoolId || "unknown"}`}
                        renderCard={renderCard}
                        /* Klik baris → detail */
                        onRowClick={(r) => navigate(`${r.id}`)}
                        /* Actions dropdown */
                        renderActions={(r) => (
                            <ActionsMenu onView={() => navigate(`${r.id}`)} />
                        )}
                        /* Pagination client-side */
                        pageSize={20}
                        pageSizeOptions={[10, 20, 50, 100, 200]}
                    />
                </div>
            </main>
        </div>
    );
};

export default SchoolStudent;