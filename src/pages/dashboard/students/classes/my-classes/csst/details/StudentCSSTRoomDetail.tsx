// src/pages/sekolahislamku/pages/student/room/StudentCSSTRoomDetail.tsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* UI */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* Icons */
import { ArrowLeft } from "lucide-react";

/* Dashboard Header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ============= FETCH API (pakai csstId dari siswa) ============= */
const fetchRoomDetail = async (csstId?: string) => {
    if (!csstId) return null;

    const res = await axios.get("/u/student-class-section-subject-teachers/list", {
        params: { include: "csst", csst_id: csstId },
    });

    const item = res.data?.data?.[0];
    return item?.class_section_subject_teacher || null;
};

/* ====================== COMPONENT ====================== */
export default function StudentCSSTRoomDetail() {
    const { csstId } = useParams<{ csstId: string }>();
    const navigate = useNavigate();
    const { setHeader } = useDashboardHeader();

    /* Set Header */
    useEffect(() => {
        setHeader({
            title: "Detail Ruangan",
            breadcrumbs: [
                { label: "Dashboard", href: "../dashboard" },
                { label: "Mata Pelajaran Saya", href: "../mapel-saya" },
                { label: "Detail Ruangan" },
            ],
            showBack: true,
        });
    }, [setHeader]);

    /* Fetch data ruangan snapshot dari CSST */
    const roomQ = useQuery({
        queryKey: ["student-csst-room-detail", csstId],
        queryFn: () => fetchRoomDetail(csstId),
        enabled: !!csstId,
    });

    const room = roomQ.data;

    const isOnline = room?.class_section_subject_teacher_delivery_mode === "online";
    const roomName = room?.class_section_subject_teacher_room_name_snapshot ?? "Belum diatur";

    return (
        <main className="w-full bg-background text-foreground">
            <div className="mx-auto space-y-6">

                {/* Back button (mobile) */}
                <div className="hidden md:flex items-center gap-2 mb-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="font-semibold text-lg">Detail Ruangan</h1>
                </div>

                {/* Grid Utama */}
                <div
                    className={
                        isOnline
                            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                            : "grid grid-cols-1 gap-4"
                    }
                >

                    {/* ===================== INFORMASI DASAR ===================== */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Informasi Dasar</CardTitle>
                            <Separator />
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                <div>
                                    <p className="text-xs text-muted-foreground">Nama Ruangan</p>
                                    <p className="font-medium">{roomName}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">Tipe</p>
                                    <p className="font-medium">
                                        {isOnline ? "Virtual / Online" : "Fisik / Offline"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <Badge variant={room?.class_section_subject_teacher_is_active ? "default" : "outline"}>
                                        {room?.class_section_subject_teacher_is_active ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">Mode Pembelajaran</p>
                                    <p className="font-medium capitalize">
                                        {room?.class_section_subject_teacher_delivery_mode}
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    {/* ===================== INFORMASI VIRTUAL ROOM ===================== */}
                    {isOnline && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Informasi Virtual Room</CardTitle>
                                <Separator />
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                    <div>
                                        <p className="text-xs text-muted-foreground">Platform</p>
                                        <p className="font-medium">Zoom</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">Meeting ID</p>
                                        <p className="font-mono">
                                            {room?.class_section_subject_teacher_meeting_id ?? "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">Passcode</p>
                                        <p className="font-mono">
                                            {room?.class_section_subject_teacher_passcode ?? "-"}
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-muted-foreground">Join URL</p>

                                        {room?.class_section_subject_teacher_join_url ? (
                                            <a
                                                href={room.class_section_subject_teacher_join_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary underline break-all"
                                            >
                                                {room.class_section_subject_teacher_join_url}
                                            </a>
                                        ) : (
                                            <p className="text-muted-foreground">Tidak tersedia</p>
                                        )}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>
        </main>
    );
}
