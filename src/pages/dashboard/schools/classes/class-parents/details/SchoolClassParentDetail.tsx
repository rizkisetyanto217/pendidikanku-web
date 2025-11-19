// src/pages/dashboard/school/class/SchoolClassParentDetail.tsx
import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    CDataTable as DataTable,
    type ColumnDef,
} from "@/components/costum/table/CDataTable";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* ========== Types ========== */

type ApiClassAcademicTerm = {
    academic_terms_id: string;
    academic_terms_name: string;
    academic_terms_academic_year: string;
    academic_terms_start_date: string;
    academic_terms_end_date: string;
    academic_terms_is_active: boolean;
    academic_terms_angkatan: number;
};

type ApiClassParentInline = {
    class_parent_id: string;
    class_parent_name: string;
    class_parent_code: string;
    class_parent_level: number;
    class_parent_image_url: string;
    class_parent_is_active: boolean;
    class_parent_created_at: string;
};

type ApiClassSubjectBook = {
    class_subject_book_id: string;
    book_id: string;
    book_title: string;
    book_author: string;
    book_slug: string;
    book_image_url: string;
    is_active: boolean;
    class_subject_book_created_at: string;
};

type ApiClassSubjectInline = {
    class_subject_id: string;
    subject_id: string;
    subject_name: string;
    subject_code: string;
    subject_slug: string;
    is_core: boolean;
    order_index: number;
    min_passing_score: number;
    weight_on_report: number;
    class_subject_created_at: string;
    books: ApiClassSubjectBook[];
};

type ClassItem = {
    class_id: string;
    class_school_id: string;
    class_class_parent_id: string;
    class_academic_term_id: string;
    class_slug: string;
    class_name: string;
    class_start_date: string;
    class_end_date: string;
    class_registration_opens_at: string;
    class_registration_closes_at: string;
    class_quota_taken: number;
    class_delivery_mode: "online" | "offline" | "hybrid" | string;
    class_status: string;
    class_image_url: string | null;
    class_image_object_key: string | null;
    class_image_url_old?: string | null;
    class_image_object_key_old?: string | null;
    class_image_delete_pending_until?: string | null;

    class_class_parent_code_snapshot: string;
    class_class_parent_name_snapshot: string;
    class_class_parent_slug_snapshot: string;
    class_class_parent_level_snapshot: number;

    class_academic_term_academic_year_snapshot: string;
    class_academic_term_name_snapshot: string;
    class_academic_term_slug_snapshot: string;
    class_academic_term_angkatan_snapshot: string;

    class_created_at: string;
    class_updated_at: string;

    academic_terms?: ApiClassAcademicTerm | null;
    class_parents?: ApiClassParentInline | null;
    subjects: ApiClassSubjectInline[];
};

type ClassListAPIResp = {
    data: ClassItem[];
    pagination: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
};

/** Row flatten untuk tabel mapel */
type ClassSubjectRow = {
    id: string;
    class_id: string;
    class_name: string;
    class_slug: string;
    class_delivery_mode: string;
    class_status: string;

    subject_name: string;
    subject_code: string;
    is_core: boolean;
    order_index: number;
    min_passing_score: number;
    weight_on_report: number;

    books: ApiClassSubjectBook[];
};

/** View model header level (diambil dari snapshot kelas pertama) */
type ParentView = {
    class_parent_id: string;
    class_parent_name: string;
    class_parent_slug: string;
    class_parent_level?: number | null;
    class_parent_is_active: boolean;
    class_parent_total_classes: number;
};

/* ========== Utils kecil ========== */

const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const capitalize = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

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

const SchoolClassParentDetail: React.FC = () => {
    const navigate = useNavigate();
    const { schoolId, classParentId } = useParams<{
        schoolId: string;
        classParentId: string;
    }>();

    const { setHeader } = useDashboardHeader();

    /* ================= API: SATU ENDPOINT SAJA ================= */

    const classesQ = useQuery<ClassListAPIResp>({
        queryKey: ["classes-by-parent", classParentId],
        queryFn: async () => {
            console.log("[ClassParentDetail] Fetch classes list", {
                classParentId,
            });

            try {
                const res = await axios.get<ClassListAPIResp>("/u/classes/list", {
                    params: {
                        class_parent_id: classParentId,
                        include: "subject,subject_books",
                        page: 1,
                        per_page: 100,
                    },
                });

                console.log(
                    "[ClassParentDetail] Classes list response",
                    res.status,
                    res.data
                );

                return res.data;
            } catch (err) {
                console.error("[ClassParentDetail] Error classes list", err);
                throw err;
            }
        },
        enabled: !!classParentId,
    });

    const classes: ClassItem[] = classesQ.data?.data ?? [];

    const safeParentId = classParentId ?? "";

    const parent: ParentView = useMemo(() => {
        if (classes.length > 0) {
            const first = classes[0];
            return {
                class_parent_id: first.class_class_parent_id || safeParentId,
                class_parent_name: first.class_class_parent_name_snapshot,
                class_parent_slug: first.class_class_parent_slug_snapshot,
                class_parent_level: first.class_class_parent_level_snapshot,
                class_parent_is_active: first.class_parents?.class_parent_is_active ?? true,
                class_parent_total_classes: classesQ.data?.pagination?.total ?? classes.length,
            };
        }

        // Fallback jika level belum punya kelas sama sekali
        return {
            class_parent_id: safeParentId,
            class_parent_name: "Detail Level",
            class_parent_slug: safeParentId,
            class_parent_level: null,
            class_parent_is_active: true,
            class_parent_total_classes: 0,
        };
    }, [classes, classesQ.data?.pagination, safeParentId]);


    // Log error sekali lewat effect
    useEffect(() => {
        if (classesQ.isError) {
            console.error(
                "[ClassParentDetail] classesQ error object:",
                classesQ.error
            );
        }
    }, [classesQ.isError, classesQ.error]);

    // Set header top bar pakai snapshot
    useEffect(() => {
        if (!parent) return;
        setHeader({
            title: `Level: ${parent.class_parent_name}`,
            breadcrumbs: [
                { label: "Dashboard", href: "dashboard" },
                { label: "Kelas" },
                {
                    label: "Level",
                    href: `/${schoolId}/sekolah/kelas/level`,
                },
                { label: parent.class_parent_name },
            ],
        });
    }, [parent, schoolId, setHeader]);

    /* ========== Kolom tabel KELAS ========== */

    const classColumns: ColumnDef<ClassItem>[] = useMemo(
        () => [
            {
                id: "class",
                header: "Kelas",
                minW: "260px",
                cell: (r) => (
                    <div className="space-y-1">
                        <div className="font-medium">{r.class_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                            Slug: <span className="font-mono">{r.class_slug}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                            Level: {r.class_class_parent_name_snapshot} • Angkatan:{" "}
                            {r.class_academic_term_name_snapshot || "-"} (
                            {r.class_academic_term_academic_year_snapshot})
                        </div>
                    </div>
                ),
            },
            {
                id: "period",
                header: "Periode Kelas",
                minW: "170px",
                align: "center",
                cell: (r) => (
                    <div className="text-xs space-y-1">
                        <div>{formatDate(r.class_start_date)} →</div>
                        <div>{formatDate(r.class_end_date)}</div>
                    </div>
                ),
            },
            {
                id: "registration",
                header: "Pendaftaran",
                minW: "170px",
                align: "center",
                cell: (r) => (
                    <div className="text-xs space-y-1">
                        <div>Buka: {formatDate(r.class_registration_opens_at)}</div>
                        <div>Tutup: {formatDate(r.class_registration_closes_at)}</div>
                    </div>
                ),
            },
            {
                id: "mode",
                header: "Mode",
                minW: "100px",
                align: "center",
                cell: (r) => (
                    <Badge variant="outline" className="justify-center text-[11px]">
                        {capitalize(r.class_delivery_mode)}
                    </Badge>
                ),
            },
            {
                id: "subjects_summary",
                header: "Mapel & Buku",
                minW: "140px",
                align: "center",
                cell: (r) => {
                    const subjects = r.subjects || [];
                    const totalSubjects = subjects.length;
                    const totalBooks = subjects.reduce(
                        (sum, s) => sum + (s.books?.length || 0),
                        0
                    );

                    return (
                        <div className="text-xs space-y-1">
                            <div>{totalSubjects} mapel</div>
                            <div>{totalBooks} buku</div>
                        </div>
                    );
                },
            },
            {
                id: "status",
                header: "Status",
                minW: "110px",
                align: "center",
                cell: (r) => (
                    <Badge
                        className="justify-center"
                        variant={r.class_status === "active" ? "default" : "secondary"}
                    >
                        {capitalize(r.class_status)}
                    </Badge>
                ),
            },
        ],
        []
    );

    /* ========== Kolom & rows tabel MAPEL (flatten) ========== */

    const subjectRows: ClassSubjectRow[] = useMemo(() => {
        const rows: ClassSubjectRow[] = [];
        for (const cls of classes) {
            for (const subj of cls.subjects || []) {
                rows.push({
                    id: `${cls.class_id}-${subj.class_subject_id}`,
                    class_id: cls.class_id,
                    class_name: cls.class_name,
                    class_slug: cls.class_slug,
                    class_delivery_mode: cls.class_delivery_mode,
                    class_status: cls.class_status,
                    subject_name: subj.subject_name,
                    subject_code: subj.subject_code,
                    is_core: subj.is_core,
                    order_index: subj.order_index,
                    min_passing_score: subj.min_passing_score,
                    weight_on_report: subj.weight_on_report,
                    books: subj.books || [],
                });
            }
        }
        return rows;
    }, [classes]);

    const subjectColumns: ColumnDef<ClassSubjectRow>[] = useMemo(
        () => [
            {
                id: "cls",
                header: "Kelas",
                minW: "220px",
                cell: (r) => (
                    <div className="space-y-1">
                        <div className="font-medium text-sm">{r.class_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                            Slug: <span className="font-mono">{r.class_slug}</span>
                        </div>
                    </div>
                ),
            },
            {
                id: "subject",
                header: "Mapel",
                minW: "220px",
                cell: (r) => (
                    <div className="space-y-1">
                        <div className="font-medium text-sm">{r.subject_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                            Kode: {r.subject_code || "-"}
                        </div>
                    </div>
                ),
            },
            {
                id: "kkm_weight",
                header: "KKM & Bobot",
                minW: "130px",
                align: "center",
                cell: (r) => (
                    <div className="text-xs space-y-1">
                        <div>KKM: {r.min_passing_score ?? "-"}</div>
                        <div>Bobot: {r.weight_on_report ?? "-"}</div>
                    </div>
                ),
            },
            {
                id: "books",
                header: "Buku",
                minW: "220px",
                cell: (r) => {
                    if (!r.books.length) {
                        return (
                            <span className="text-xs text-muted-foreground">
                                Tidak ada buku terhubung
                            </span>
                        );
                    }

                    return (
                        <div className="space-y-1 text-xs">
                            {r.books.map((b) => (
                                <div key={b.class_subject_book_id}>
                                    <span className="font-medium">{b.book_title}</span>
                                    {b.book_author && (
                                        <span className="text-muted-foreground">
                                            {" "}
                                            — {b.book_author}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                },
            },
            {
                id: "core",
                header: "Core",
                minW: "80px",
                align: "center",
                cell: (r) =>
                    r.is_core ? (
                        <Badge className="justify-center h-5 px-2 text-[11px]">Core</Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                    ),
            },
        ],
        []
    );

    /* ========== State loading / error ========== */

    if (classesQ.isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="animate-spin" /> Memuat level…
            </div>
        );
    }

    if (classesQ.isError) {
        const msg = classesQ.isError
            ? extractErrorMessage(classesQ.error)
            : "Data level tidak ditemukan atau belum ada kelas.";

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-3 text-center">
                <div className="text-destructive text-sm">
                    Gagal memuat detail level.
                </div>
                <div className="text-xs text-muted-foreground break-all">{msg}</div>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/${schoolId}/sekolah/kelas/level`)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke daftar level
                </Button>
            </div>
        );
    }

    /* ========== Render utama ========== */
    return (
        <div className="space-y-4">
            {/* Header lokal halaman */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/${schoolId}/sekolah/kelas/level`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg">
                            {parent.class_parent_name}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Slug:{" "}
                            <span className="font-mono">{parent.class_parent_slug}</span> •
                            Level: {parent.class_parent_level ?? "-"}
                        </p>
                    </div>
                </div>
                <Badge
                    variant={parent.class_parent_is_active ? "default" : "secondary"}
                >
                    {parent.class_parent_is_active ? "Aktif" : "Nonaktif"}
                </Badge>
            </div>

            {/* Ringkasan kecil */}
            <div className="grid gap-3 md:grid-cols-3">
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-xs text-muted-foreground">
                            Total Kelas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xl font-semibold">
                            {parent.class_parent_total_classes}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Kelas di level {parent.class_parent_name}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="classes" className="w-full">
                <TabsList className="mb-3">
                    <TabsTrigger value="classes">Kelas & Mapel</TabsTrigger>
                    <TabsTrigger value="info">Ringkasan</TabsTrigger>
                </TabsList>

                <TabsContent value="classes">
                    <div className="space-y-4">
                        {/* Card: tabel kelas */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">
                                    Kelas di level {parent.class_parent_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <DataTable<ClassItem>
                                    rows={classes}
                                    columns={classColumns}
                                    loading={classesQ.isLoading}
                                    getRowId={(r) => r.class_id}
                                    searchByKeys={[
                                        "class_name",
                                        "class_slug",
                                        "class_academic_term_name_snapshot",
                                        "class_academic_term_academic_year_snapshot",
                                    ]}
                                    searchPlaceholder="Cari kelas…"
                                    pageSize={20}
                                    pageSizeOptions={[10, 20, 50]}
                                    stickyHeader
                                    zebra
                                    enableActions
                                    actions={{
                                        mode: "menu",
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Card: tabel mapel & buku */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">
                                    Mapel & Buku di level ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <DataTable<ClassSubjectRow>
                                    rows={subjectRows}
                                    columns={subjectColumns}
                                    loading={classesQ.isLoading}
                                    getRowId={(r) => r.id}
                                    searchByKeys={["class_name", "subject_name", "subject_code"]}
                                    searchPlaceholder="Cari mapel atau kelas…"
                                    pageSize={20}
                                    pageSizeOptions={[10, 20, 50]}
                                    stickyHeader
                                    zebra
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="info">
                    <Card>
                        <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
                            <div>
                                <span className="font-medium">Nama level:</span>{" "}
                                {parent.class_parent_name}
                            </div>
                            <div>
                                <span className="font-medium">Slug:</span>{" "}
                                <span className="font-mono">{parent.class_parent_slug}</span>
                            </div>
                            <div>
                                <span className="font-medium">Level:</span>{" "}
                                {parent.class_parent_level ?? "-"}
                            </div>
                            <div>
                                <span className="font-medium">Status:</span>{" "}
                                {parent.class_parent_is_active ? "Aktif" : "Nonaktif"}
                            </div>
                            <div>
                                Informasi tambahan tentang level ini bisa ditaruh di sini
                                (misalnya deskripsi kurikulum, catatan khusus, dsb).
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SchoolClassParentDetail;