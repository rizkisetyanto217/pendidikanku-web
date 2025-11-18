// src/pages/sekolahislamku/teacher/TeacherScheduleAgendaDetail.tsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
// 🧩 Ambil tipe tanpa `undefined`
type ScheduleType = NonNullable<ScheduleRow["type"]>;

const TYPE_LABEL: Record<ScheduleType, string> = {
    class: "Kelas",
    exam: "Ujian",
    event: "Acara",
};

export default function TeacherScheduleAgendaDetail() {
    const navigate = useNavigate();
    const params = useParams<{ scheduleId: string }>();
    const location = useLocation();
    const { setHeader } = useDashboardHeader();

    const schedule = location.state?.schedule as ScheduleRow | undefined;
    const month = location.state?.month as string | undefined;

    useEffect(() => {
        setHeader({
            title: "Detail Agenda Mengajar",
            breadcrumbs: [
                { label: "Dashboard", href: "dashboard" },
                { label: "Jadwal", href: "/sekolahislamku/teacher/schedule/agenda" },
                { label: "Detail" },
            ],
            showBack: true,
        });
    }, [setHeader]);

    const dateInfo = useMemo(() => {
        if (!schedule?.date) return null;
        const d = new Date(schedule.date);
        return {
            full: d.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
            time: d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    }, [schedule?.date]);

    if (!schedule) {
        // Fallback kalau user akses langsung by URL (tanpa state)
        return (
            <div className="w-full bg-background text-foreground">
                <div className="mx-auto flex flex-col gap-4">
                    <div className="flex items-center gap-3 mt-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <div className="font-semibold text-base">Detail Jadwal</div>
                            <p className="text-sm text-muted-foreground">
                                Data jadwal tidak ditemukan. Coba buka dari halaman agenda.
                            </p>
                        </div>
                    </div>

                    <Card className="mt-2">
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            <p className="mb-2">
                                ID di URL:
                                <code className="ml-1 px-1 py-0.5 rounded bg-muted text-xs">
                                    {params.scheduleId}
                                </code>
                            </p>
                            <p>
                                Nanti bagian ini bisa disambungkan ke backend, misalnya
                                <span className="font-mono text-xs">
                                    {" GET /api/teacher/schedules/:id "}
                                </span>
                                untuk ambil data berdasarkan ID.
                            </p>
                            <Button
                                className="mt-4"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Kembali
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const typeLabel = schedule.type ? TYPE_LABEL[schedule.type] : "Agenda";

    return (
        <div className="w-full bg-background text-foreground">
            <div className="mx-auto flex flex-col gap-4">
                {/* Header */}
                <div className="md:flex hidden items-center gap-3 mt-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="font-semibold text-lg md:text-xl">
                            Detail Agenda Mengajar
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {schedule.title || "Tanpa judul"}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">
                                    {schedule.title || "Tanpa judul"}
                                </CardTitle>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <Badge variant="secondary" className="capitalize">
                                        {typeLabel}
                                    </Badge>
                                    {dateInfo && (
                                        <Badge variant="outline" className="gap-1">
                                            <Clock size={14} />
                                            {dateInfo.full} • {schedule.time ?? dateInfo.time}
                                        </Badge>
                                    )}
                                    {schedule.teacher && (
                                        <Badge variant="outline" className="gap-1">
                                            <Users size={14} />
                                            {schedule.teacher}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Separator />

                        {/* Info utama */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">
                                    Waktu & Tanggal
                                </div>
                                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                                    {dateInfo ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Tanggal</span>
                                                <span className="font-medium">{dateInfo.full}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Clock size={14} />
                                                    Jam
                                                </span>
                                                <span className="font-medium">
                                                    {schedule.time ?? dateInfo.time}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            Tidak ada informasi tanggal.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">
                                    Lokasi & Pengajar
                                </div>
                                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                                    {schedule.room && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <MapPin size={14} />
                                                Ruang
                                            </span>
                                            <span className="font-medium">{schedule.room}</span>
                                        </div>
                                    )}
                                    {schedule.teacher && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Pengajar</span>
                                            <span className="font-medium">{schedule.teacher}</span>
                                        </div>
                                    )}
                                    {!schedule.room && !schedule.teacher && (
                                        <div className="text-xs text-muted-foreground">
                                            Belum ada info ruang atau pengajar.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">
                                Deskripsi
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                {schedule.description ? (
                                    <p>{schedule.description}</p>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Belum ada deskripsi tambahan untuk jadwal ini.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Aksi */}
                        <div className="flex flex-wrap gap-2 justify-between pt-2">
                            <Button variant="outline" onClick={() => navigate(-1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>

                            {month && (
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        navigate("/sekolahislamku/teacher/schedule/agenda", {
                                            state: { monthFromDetail: month, focusId: schedule.id },
                                        })
                                    }
                                >
                                    Lihat di agenda bulan {month}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}