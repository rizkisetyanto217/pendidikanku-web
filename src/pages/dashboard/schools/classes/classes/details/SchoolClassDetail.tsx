// src/pages/dashboard/school/classes/details/SchoolClassDetail.tsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Loader2, Users, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CDataTable as DataTable,
    type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* ========== Types dari API /u/class-sections/list ========== */

type RoomSnapshot = {
    code?: string;
    name?: string;
    slug?: string;
    join_url?: string;
    platform?: string;
    capacity?: number;
    location?: string;
    is_virtual?: boolean;
};

type ApiClassSection = {
    class_section_id: string;
    class_section_school_id: string;
    class_section_class_id: string;
    class_section_slug: string;
    class_section_name: string;
    class_section_code: string;
    class_section_schedule: any | null;
    class_section_capacity: number | null;
    class_section_total_students: number;
    class_section_group_url: string | null;
    class_section_image_url: string | null;
    class_section_image_object_key: string | null;
    class_section_image_url_old: string | null;
    class_section_image_object_key_old: string | null;
    class_section_image_delete_pending_until: string | null;
    class_section_is_active: boolean;
    class_section_created_at: string;
    class_section_updated_at: string;

    class_section_class_name_snapshot: string;
    class_section_class_slug_snapshot: string;
    class_section_class_parent_id: string;
    class_section_class_parent_name_snapshot: string;
    class_section_class_parent_slug_snapshot: string;
    class_section_class_parent_level_snapshot: number;

    class_section_academic_term_id: string | null;
    class_section_snapshot_updated_at: string;

    class_section_subject_teachers_enrollment_mode: string;
    class_section_subject_teachers_self_select_requires_approval: boolean;

    class_section_class_room_id?: string | null;
    class_section_class_room_slug_snapshot?: string | null;
    class_section_class_room_name_snapshot?: string | null;
    class_section_class_room_location_snapshot?: string | null;
    class_section_class_room_snapshot?: RoomSnapshot | null;
};

type ClassSectionListResp = {
    data: ApiClassSection[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
        count: number;
        per_page_options: number[];
    };
};

/* Row untuk DataTable */
type SectionRow = {
    id: string;
    name: string;
    slug: string;
    code: string;
    roomName?: string | null;
    roomLocation?: string | null;
    isVirtual?: boolean;
    capacity?: number | null;
    totalStudents: number;
    enrollmentMode: string;
    requiresApproval: boolean;
    isActive: boolean;
};

/* View model kelas (diambil dari snapshot baris pertama) */
type ClassView = {
    classId: string;
    className: string;
    classSlug: string;
    parentName: string;
    parentSlug: string;
    parentLevel: number;
};

/* ========== Utils kecil ========== */

const extractErrorMessage = (err: unknown): string => {
    const ax = err as AxiosError<any>;
    const msgFromResp =
        ax?.response?.data?.message ||
        ax?.response?.data?.error ||
        ax?.response?.statusText;
    if (msgFromResp) return String(msgFromResp);
    if (ax?.message) return ax.message;
    return "Terjadi kesalahan saat memuat data.";
};

/* ========== Page ========== */

const SchoolClassDetail: React.FC = () => {
    const navigate = useNavigate();
    const { schoolId, classId } = useParams<{
        schoolId: string;
        classId: string;
    }>();

    const { setHeader } = useDashboardHeader();

    /* ===== Fetch class sections untuk 1 class_id ===== */
    const sectionsQ = useQuery<ClassSectionListResp, AxiosError>({
        queryKey: ["class-sections", classId],
        enabled: !!classId,
        queryFn: async () => {
            const res = await axios.get<ClassSectionListResp>(
                "/u/class-sections/list",
                {
                    params: {
                        class_id: classId,
                        page: 1,
                        per_page: 100,
                    },
                }
            );
            return res.data;
        },
        staleTime: 60_000,
    });

    const sections: ApiClassSection[] = sectionsQ.data?.data ?? [];

    /* ===== Ambil info kelas dari snapshot baris pertama ===== */
    const safeClassId = classId ?? "";

    const classView: ClassView = useMemo(() => {
        if (sections.length > 0) {
            const first = sections[0];
            return {
                classId: safeClassId,
                className: first.class_section_class_name_snapshot || "Tanpa Nama",
                classSlug: first.class_section_class_slug_snapshot || "-",
                parentName: first.class_section_class_parent_name_snapshot || "-",
                parentSlug: first.class_section_class_parent_slug_snapshot || "-",
                parentLevel: first.class_section_class_parent_level_snapshot ?? 0,
            };
        }

        // Fallback jika tidak ada section sama sekali
        return {
            classId: safeClassId,
            className: "Detail Kelas",
            classSlug: safeClassId || "-",
            parentName: "-",
            parentSlug: "-",
            parentLevel: 0,
        };
    }, [sections, safeClassId]);



    /* ===== Set header top bar ===== */
    useEffect(() => {
        if (!classView) return;
        setHeader({
            title: `Kelas: ${classView.className}`,
            breadcrumbs: [
                { label: "Dashboard", href: "dashboard" },
                { label: "Kelas" },
                {
                    label: "Data Kelas",
                    href: `/${schoolId}/sekolah/kelas/daftar-kelas `,
                },
                { label: classView.className },
            ],
        });
    }, [classView, schoolId, setHeader]);

    /* ===== Map ke row DataTable ===== */
    const rows: SectionRow[] = useMemo(() => {
        return sections.map((s) => {
            const roomSnap = s.class_section_class_room_snapshot ?? null;

            const roomName =
                s.class_section_class_room_name_snapshot || roomSnap?.name || null;
            const roomLocation =
                s.class_section_class_room_location_snapshot ||
                roomSnap?.location ||
                null;
            const isVirtual =
                roomSnap?.is_virtual ?? (roomSnap?.platform ? true : undefined);

            const capacity = s.class_section_capacity ?? roomSnap?.capacity ?? null;

            return {
                id: s.class_section_id,
                name: s.class_section_name,
                slug: s.class_section_slug,
                code: s.class_section_code,
                roomName,
                roomLocation,
                isVirtual,
                capacity,
                totalStudents: s.class_section_total_students,
                enrollmentMode: s.class_section_subject_teachers_enrollment_mode,
                requiresApproval:
                    s.class_section_subject_teachers_self_select_requires_approval,
                isActive: s.class_section_is_active,
            };
        });
    }, [sections]);

    /* ===== Stats kecil di atas tabel ===== */
    const totalSections = rows.length;
    const totalStudents = rows.reduce(
        (acc, r) => acc + (r.totalStudents || 0),
        0
    );
    const virtualCount = rows.filter((r) => r.isVirtual).length;

    /* ===== Columns DataTable ===== */
    const columns: ColumnDef<SectionRow>[] = useMemo(
        () => [
            {
                id: "name",
                header: "Nama Rombel",
                minW: "260px",
                cell: (r) => (
                    <div className="space-y-1">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                            Slug: <span className="font-mono">{r.slug}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            Kode: <span className="font-mono">{r.code}</span>
                        </div>
                    </div>
                ),
            },
            {
                id: "room",
                header: "Ruang / Platform",
                minW: "220px",
                cell: (r) => {
                    if (!r.roomName && !r.isVirtual) {
                        return (
                            <span className="text-xs text-muted-foreground">
                                Belum diatur
                            </span>
                        );
                    }

                    return (
                        <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {r.isVirtual ? <span>Virtual</span> : <span>Ruang fisik</span>}
                            </div>
                            {r.roomName && <div className="font-medium">{r.roomName}</div>}
                            {r.roomLocation && (
                                <div className="text-[11px] text-muted-foreground">
                                    {r.roomLocation}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "capacity",
                header: "Kapasitas",
                align: "center",
                minW: "110px",
                cell: (r) =>
                    r.capacity != null ? (
                        <span className="tabular-nums">{r.capacity}</span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Tidak dibatasi
                        </span>
                    ),
            },
            {
                id: "students",
                header: "Jumlah Siswa",
                align: "center",
                minW: "120px",
                cell: (r) => (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                        <Users className="h-3 w-3" />
                        {r.totalStudents}
                    </span>
                ),
            },
            {
                id: "enrollment",
                header: "Mode Pendaftaran",
                align: "center",
                minW: "160px",
                cell: (r) => (
                    <div className="text-xs space-y-1">
                        <div className="capitalize">
                            {r.enrollmentMode.replace(/_/g, " ")}
                        </div>
                        {r.enrollmentMode === "self_select" && (
                            <div className="text-[11px] text-muted-foreground">
                                {r.requiresApproval
                                    ? "Perlu persetujuan admin"
                                    : "Otomatis masuk"}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                id: "status",
                header: "Status",
                align: "center",
                minW: "100px",
                cell: (r) => (
                    <Badge
                        className="justify-center"
                        variant={r.isActive ? "default" : "secondary"}
                    >
                        {r.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                ),
            },
        ],
        []
    );

    /* ===== Precompute error string biar TS nggak rewel ===== */
    const sectionsError: string | null = sectionsQ.isError
        ? extractErrorMessage(sectionsQ.error)
        : null;

    /* ===== State: loading / error ===== */

    if (sectionsQ.isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="animate-spin" /> Memuat detail kelas…
            </div>
        );
    }

    if (sectionsError) {
        const msg = sectionsError ?? "Data kelas tidak ditemukan.";

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-3 text-center">
                <div className="text-destructive text-sm">
                    Gagal memuat detail kelas.
                </div>
                <div className="text-xs text-muted-foreground break-all">{msg}</div>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/${schoolId}/sekolah/kelas/daftar-kelas `)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke daftar kelas
                </Button>
            </div>
        );
    }

    /* ===== Render utama ===== */

    return (
        <div className="space-y-4">
            {/* Header lokal halaman */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/${schoolId}/sekolah/kelas/daftar-kelas `)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg">{classView.className}</h1>
                        <p className="text-xs text-muted-foreground">
                            Slug: <span className="font-mono">{classView.classSlug}</span> •
                            Tingkat: {classView.parentName}{" "}
                            {classView.parentLevel != null &&
                                `(Level ${classView.parentLevel})`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ringkasan kecil */}
            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs text-muted-foreground">
                            Total Rombel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xl font-semibold">{totalSections}</div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Rombel di kelas {classView.className}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs text-muted-foreground">
                            Total Siswa (semua rombel)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xl font-semibold tabular-nums">
                            {totalStudents}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Akumulasi dari seluruh rombel
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs text-muted-foreground">
                            Rombel Virtual
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xl font-semibold tabular-nums">
                            {virtualCount}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Menggunakan ruang/platform online
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabel rombel */}
            <Card>
                <CardHeader className="py-3">
                    <CardTitle className="text-base">
                        Daftar Rombel / Kelas Paralel
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                    {sectionsError && (
                        <div className="mb-2 text-xs text-destructive">{sectionsError}</div>
                    )}

                    <DataTable<SectionRow>
                        rows={rows}
                        columns={columns}
                        loading={sectionsQ.isLoading}
                        getRowId={(r) => r.id}
                        searchByKeys={["name", "slug", "code", "roomName"]}
                        searchPlaceholder="Cari rombel, kode, atau ruang…"
                        pageSize={20}
                        pageSizeOptions={[10, 20, 50]}
                        stickyHeader
                        zebra
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default SchoolClassDetail;