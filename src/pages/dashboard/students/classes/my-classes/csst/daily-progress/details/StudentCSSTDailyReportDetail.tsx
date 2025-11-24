import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import {
    ArrowLeft,
    CalendarDays,
    User,
    MapPin,
    Clock,
    FileText,
    CheckCircle2,
    XCircle,
    Trash2,
    Pencil,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* Jika kamu simpan dummy di file lain → import */
import { dummySchedules } from "@/pages/dashboard/teachers/csst/menus/daily-progress/TeacherCSSTDailyReport";

/* dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";
import type { ScheduleRow } from "@/pages/dashboard/components/calender/types/types";

export default function StudentCSSTDailyReportDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setHeader } = useDashboardHeader();

    const data = useMemo(
        () => dummySchedules.find((s: ScheduleRow) => s.id === id),
        [id]
    );

    // Set Header
    useMemo(() => {
        setHeader({
            title: "Detail Jadwal",
            breadcrumbs: [
                { label: "Dashboard", href: "/dashboard" },
                { label: "Guru Mapel" },
                { label: "Detail Jadwal" },
                { label: "Laporan Harian" },

            ],
            actions: null,
        });
    }, [setHeader]);

    if (!data) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Jadwal tidak ditemukan.
            </div>
        );
    }

    return (
        <div className="w-full mx-auto">
            <div className="md:flex hidden gap-3 items-center">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-lg font-semibold md:text-xl ">Detail Laporan Harian</h1>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">{data.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* tanggal */}
                    <div className="flex items-center gap-2 text-sm">
                        <CalendarDays size={16} className="text-muted-foreground" />
                        {data.date}
                    </div>

                    {/* waktu */}
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-muted-foreground" />
                        {data.time}
                    </div>

                    {/* guru */}
                    <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-muted-foreground" />
                        {data.teacher}
                    </div>

                    {/* ruangan */}
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-muted-foreground" />
                        {data.room}
                    </div>

                    {/* jenis */}
                    <div className="flex items-center gap-2 text-sm">
                        <FileText size={16} className="text-muted-foreground" />
                        Jenis:{" "}
                        <span className="font-medium capitalize">{data.type}</span>
                    </div>

                    {/* status */}
                    <div className="flex items-center gap-2 text-sm">
                        {data.status === "present" ? (
                            <>
                                <CheckCircle2 size={16} className="text-green-600" />
                                <span className="text-green-700">Guru Hadir</span>
                            </>
                        ) : (
                            <>
                                <XCircle size={16} className="text-red-600" />
                                <span className="text-red-700">Guru Tidak Hadir</span>
                            </>
                        )}
                    </div>

                    {/* deskripsi */}
                    <div className="text-sm text-muted-foreground mt-2">
                        {data.description}
                    </div>

                    {/* tombol */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="default"
                            onClick={() => alert("Edit jadwal")}
                            className="flex items-center gap-2"
                        >
                            <Pencil size={16} />
                            Edit
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => alert("Hapus jadwal")}
                            className="flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Hapus
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
