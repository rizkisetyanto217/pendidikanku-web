// src/pages/dashboard/school/classes/class-list/section/SchoolSectionCSSTDetail.tsx
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* icons */
import {
    Users,
    CalendarDays,
    BookOpen,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    UserSquare2,
} from "lucide-react";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { AxiosError } from "axios";

/* ========= Types dari API /u/class-section-subject-teachers/list ========= */

type DeliveryMode = "offline" | "online" | "hybrid" | string;

type ApiTeacherSnapshot = {
    id?: string | null;
    name?: string | null;
    avatar_url?: string | null;
    title_prefix?: string | null;
    title_suffix?: string | null;
    whatsapp_url?: string | null;
};

type ApiBookSnapshot = {
    id?: string | null;
    slug?: string | null;
    title?: string | null;
    author?: string | null;
    image_url?: string | null;
};

type ApiSubjectSnapshot = {
    id?: string | null;
    url?: string | null;
    code?: string | null;
    name?: string | null;
    slug?: string | null;
};

type ApiClassSubjectBookSnapshot = {
    book?: ApiBookSnapshot | null;
    subject?: ApiSubjectSnapshot | null;
};

type ApiCSSTItem = {
    class_section_subject_teacher_id: string;
    class_section_subject_teacher_school_id: string;
    class_section_subject_teacher_slug: string;
    class_section_subject_teacher_total_attendance: number;
    class_section_subject_teacher_enrolled_count: number;
    class_section_subject_teacher_delivery_mode: DeliveryMode;
    class_section_subject_teacher_class_section_id: string;
    class_section_subject_teacher_class_section_slug_snapshot: string;
    class_section_subject_teacher_class_section_name_snapshot: string;
    class_section_subject_teacher_class_section_code_snapshot: string;
    class_section_subject_teacher_school_teacher_id: string;
    class_section_subject_teacher_school_teacher_snapshot?: ApiTeacherSnapshot | null;
    class_section_subject_teacher_school_teacher_name_snapshot?: string | null;
    class_section_subject_teacher_class_subject_book_id: string | null;
    class_section_subject_teacher_class_subject_book_snapshot?: ApiClassSubjectBookSnapshot | null;
    class_section_subject_teacher_book_title_snapshot?: string | null;
    class_section_subject_teacher_book_author_snapshot?: string | null;
    class_section_subject_teacher_book_slug_snapshot?: string | null;
    class_section_subject_teacher_book_image_url_snapshot?: string | null;
    class_section_subject_teacher_subject_name_snapshot?: string | null;
    class_section_subject_teacher_subject_code_snapshot?: string | null;
    class_section_subject_teacher_subject_slug_snapshot?: string | null;
    class_section_subject_teacher_is_active: boolean;
    class_section_subject_teacher_created_at: string;
    class_section_subject_teacher_updated_at: string;
    class_section_subject_teacher_deleted_at?: string | null;
};

type ApiCSSTDetailResponse = {
    success: boolean;
    message: string;
    data: ApiCSSTItem[];
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

/* View model kecil untuk header */
type SectionView = {
    sectionId: string;
    sectionName: string;
    sectionSlug: string;
    sectionCode: string;
};

type CsstView = {
    id: string;
    slug: string;
    subjectName: string;
    subjectCode?: string | null;
    subjectSlug?: string | null;
    teacherName: string;
    teacherTitle?: string;
    deliveryMode: DeliveryMode;
    enrolledCount: number;
    totalAttendance: number;
    isActive: boolean;
    bookTitle?: string | null;
    bookAuthor?: string | null;
    bookImageUrl?: string | null;
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

const formatDeliveryMode = (m: DeliveryMode | undefined) => {
    if (!m) return "-";
    switch (m) {
        case "offline":
            return "Offline";
        case "online":
            return "Online";
        case "hybrid":
            return "Hybrid";
        default:
            return String(m).replace(/_/g, " ");
    }
};

/* ========== Page ========== */

const SchoolCSSTDetail: React.FC = () => {
    const { schoolId, csstId } = useParams<{
        schoolId: string;
        csstId: string;
    }>();
    const navigate = useNavigate();
    const { setHeader } = useDashboardHeader();

    /* ===== Query detail CSST ===== */
    const csstQ = useQuery<ApiCSSTItem | undefined, AxiosError>({
        queryKey: ["csst-detail", csstId],
        enabled: !!csstId,
        queryFn: async () => {
            const res = await axios.get<ApiCSSTDetailResponse>(
                "/u/class-section-subject-teachers/list",
                {
                    params: {
                        id: csstId,
                    },
                }
            );
            const items = res.data?.data ?? [];
            return items[0];
        },
        staleTime: 60_000,
    });

    const csstError: string | null = csstQ.isError
        ? extractErrorMessage(csstQ.error)
        : null;

    /* ===== Derive view models ===== */
    const sectionView: SectionView | null = useMemo(() => {
        const it = csstQ.data;
        if (!it) return null;
        return {
            sectionId: it.class_section_subject_teacher_class_section_id,
            sectionName: it.class_section_subject_teacher_class_section_name_snapshot,
            sectionSlug: it.class_section_subject_teacher_class_section_slug_snapshot,
            sectionCode: it.class_section_subject_teacher_class_section_code_snapshot,
        };
    }, [csstQ.data]);

    const csstView: CsstView | null = useMemo(() => {
        const it = csstQ.data;
        if (!it) return null;

        const teacher = it.class_section_subject_teacher_school_teacher_snapshot;
        const teacherName =
            it.class_section_subject_teacher_school_teacher_name_snapshot ||
            teacher?.name ||
            "-";

        const teacherTitleParts = [
            teacher?.title_prefix ?? "",
            teacher?.title_suffix ?? "",
        ]
            .map((x) => x?.trim())
            .filter(Boolean);
        const teacherTitle =
            teacherTitleParts.length > 0 ? teacherTitleParts.join(" ") : undefined;

        const csBook = it.class_section_subject_teacher_class_subject_book_snapshot;
        const subj = csBook?.subject;
        const book = csBook?.book;

        const subjectName =
            it.class_section_subject_teacher_subject_name_snapshot ||
            subj?.name ||
            "Mata pelajaran tanpa nama";

        const subjectCode =
            it.class_section_subject_teacher_subject_code_snapshot ||
            subj?.code ||
            null;

        const subjectSlug =
            it.class_section_subject_teacher_subject_slug_snapshot ||
            subj?.slug ||
            null;

        const bookTitle =
            it.class_section_subject_teacher_book_title_snapshot ||
            book?.title ||
            null;

        const bookAuthor =
            it.class_section_subject_teacher_book_author_snapshot ||
            book?.author ||
            null;

        const bookImageUrl =
            it.class_section_subject_teacher_book_image_url_snapshot ||
            book?.image_url ||
            null;

        return {
            id: it.class_section_subject_teacher_id,
            slug: it.class_section_subject_teacher_slug,
            subjectName,
            subjectCode,
            subjectSlug,
            teacherName,
            teacherTitle,
            deliveryMode: it.class_section_subject_teacher_delivery_mode,
            enrolledCount: it.class_section_subject_teacher_enrolled_count,
            totalAttendance: it.class_section_subject_teacher_total_attendance,
            isActive: it.class_section_subject_teacher_is_active,
            bookTitle,
            bookAuthor,
            bookImageUrl,
        };
    }, [csstQ.data]);

    /* ===== Set header dashboard ===== */
    useEffect(() => {
        if (!csstView) return;
        setHeader({
            title: `Mapel: ${csstView.subjectName}`,
            breadcrumbs: [
                { label: "Dashboard", href: "dashboard" },
                { label: "Kelas" },
                { label: "Pelajaran", href: `/${schoolId}/sekolah/kelas/pelajaran` },
                { label: csstView.subjectName },
            ],
            actions: null,
        });
    }, [csstView, schoolId, setHeader]);

    /* ===== Loading & error ===== */
    if (csstQ.isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="animate-spin" /> Memuat detail mapel…
            </div>
        );
    }

    if (csstError || !csstView || !sectionView) {
        const msg = csstError ?? "Data mapel / CSST tidak ditemukan.";
        return (
            <div className="p-6 space-y-3">
                <div className="text-destructive text-sm">
                    Gagal memuat detail mapel.
                </div>
                <div className="text-xs text-muted-foreground break-all">{msg}</div>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/${schoolId}/sekolah/kelas/pelajaran`)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke daftar pelajaran
                </Button>
            </div>
        );
    }

    /* ===== Render utama ===== */

    const totalStudents = csstView.enrolledCount ?? 0;
    const totalMeetings = csstView.totalAttendance ?? 0;

    // Quick links seperti di TeacherCSSTDetail
    const quick = [
        {
            key: "peserta",
            label: "Peserta",
            metric: totalStudents.toString(),
            icon: <Users className="h-4 w-4" />,
            to: `/${schoolId}/sekolah/kelas/pelajaran/${csstView.id}/peserta`,
            aria: "Lihat daftar peserta mapel ini",
        },
        {
            key: "kehadiran",
            label: "Rekap Kehadiran",
            metric: totalMeetings.toString(),
            icon: <CalendarDays className="h-4 w-4" />,
            to: `/${schoolId}/sekolah/kelas/pelajaran/${csstView.id}/kehadiran`,
            aria: "Lihat rekap kehadiran mapel ini",
        },
        {
            key: "buku",
            label: "Buku & Materi",
            metric: csstView.bookTitle ? "1 buku" : "-",
            icon: <BookOpen className="h-4 w-4" />,
            to: `/${schoolId}/sekolah/kelas/pelajaran/${csstView.id}/buku`,
            aria: "Lihat buku & materi mapel ini",
        },
        {
            key: "profil",
            label: "Profil Mapel",
            metric: "-",
            icon: <UserSquare2 className="h-4 w-4" />,
            to: `/${schoolId}/sekolah/kelas/pelajaran/${csstView.id}/profil`,
            aria: "Lihat profil mapel ini",
        },
    ] as const;

    return (
        <div className="w-full bg-background text-foreground">
            <main className="w-full">
                <div className="mx-auto flex flex-col gap-6 px-3 pb-10 pt-2 md:px-4">
                    {/* Top bar */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Detail Mapel (CSST)</h1>
                    </div>

                    {/* Header mapel – mirip TeacherCSSTDetail */}
                    <Card>
                        <CardContent className="p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                                <div className="text-lg md:text-xl font-semibold">
                                    {csstView.subjectName}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline">{sectionView.sectionName}</Badge>
                                    <span>
                                        Kode rombel:{" "}
                                        <span className="font-mono">{sectionView.sectionCode}</span>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Guru:{" "}
                                        <span className="font-medium">
                                            {csstView.teacherTitle
                                                ? `${csstView.teacherTitle} ${csstView.teacherName}`
                                                : csstView.teacherName}
                                        </span>
                                    </span>
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-3">
                                    {csstView.subjectCode && (
                                        <span>
                                            Kode mapel:{" "}
                                            <span className="font-mono">{csstView.subjectCode}</span>
                                        </span>
                                    )}
                                    <span>
                                        Slug CSST:{" "}
                                        <span className="font-mono">{csstView.slug}</span>
                                    </span>
                                    {csstView.subjectSlug && (
                                        <span>
                                            Slug mapel:{" "}
                                            <span className="font-mono">{csstView.subjectSlug}</span>
                                        </span>
                                    )}
                                    <span>
                                        Slug rombel:{" "}
                                        <span className="font-mono">{sectionView.sectionSlug}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <Badge
                                    variant={csstView.isActive ? "default" : "outline"}
                                    className="text-[11px]"
                                >
                                    {csstView.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <Badge variant="outline" className="text-[11px]">
                                    {formatDeliveryMode(csstView.deliveryMode)}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Links – mirip layout TeacherCSSTDetail */}
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {quick.map((q) => (
                            <Card
                                key={q.key}
                                className="cursor-pointer transition hover:shadow-md"
                                onClick={() => navigate(q.to)}
                                aria-label={q.aria}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            {q.icon}
                                            <span>{q.label}</span>
                                        </div>
                                        <div className="text-xl font-semibold">{q.metric}</div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Ringkasan angka – analog "Ringkasan" di teacher */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Ringkasan Mapel di Rombel Ini
                            </CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-xl border bg-muted/40 px-4 py-3">
                                <p className="text-xs text-muted-foreground">Siswa Terdaftar</p>
                                <p className="mt-1 text-xl font-semibold tabular-nums">
                                    {totalStudents}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    jumlah siswa yang memilih mapel ini
                                </p>
                            </div>

                            <div className="rounded-xl border bg-muted/40 px-4 py-3">
                                <p className="text-xs text-muted-foreground">Total Pertemuan</p>
                                <p className="mt-1 text-xl font-semibold tabular-nums">
                                    {totalMeetings}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    akumulasi sesi kehadiran yang tercatat
                                </p>
                            </div>

                            <div className="rounded-xl border bg-muted/40 px-4 py-3">
                                <p className="text-xs text-muted-foreground">Mode & Status</p>
                                <div className="mt-1 flex flex-col gap-1 text-sm">
                                    <span>{formatDeliveryMode(csstView.deliveryMode)}</span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {csstView.isActive
                                            ? "Mapel sedang berjalan"
                                            : "Mapel nonaktif / arsip"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Buku yang digunakan – tetap, tapi selaras dengan gaya teacher */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Buku & Materi
                            </CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-4">
                            {csstView.bookTitle ? (
                                <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3 text-sm">
                                    {csstView.bookImageUrl && (
                                        <img
                                            src={csstView.bookImageUrl}
                                            alt={csstView.bookTitle}
                                            className="h-16 w-12 rounded-md border object-cover"
                                        />
                                    )}
                                    <div className="space-y-1">
                                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                            Buku utama
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {csstView.bookTitle}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Penulis: {csstView.bookAuthor ?? "-"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Belum ada buku yang terhubung dengan mapel ini.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default SchoolCSSTDetail;