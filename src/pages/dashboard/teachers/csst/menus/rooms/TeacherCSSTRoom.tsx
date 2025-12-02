// src/pages/dashboard/teacher/csst/menus/rooms/TeacherCSSTRoom.tsx

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* Icons */
import { ArrowLeft, MapPin, Building2, Link as LinkIcon } from "lucide-react";

/* Dashboard header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Dummy sementara (bisa diganti API) */
const DUMMY_ROOM = {
    name: "Aula 1",
    slug: "aula-1",
    platform: "Offline",
    join_url: null,
    description:
        "Ruangan utama untuk kegiatan belajar mengajar. Dilengkapi Ac & proyektor.",
};

export default function TeacherCSSTRoom() {
    const navigate = useNavigate();
    const { classId } = useParams();
    const { setHeader } = useDashboardHeader();

    useEffect(() => {
        setHeader({
            title: "Detail Ruangan",
            breadcrumbs: [
                { label: "Dashboard", href: "/dashboard" },
                { label: "Wali Kelas" },
                { label: "Detail Kelas", href: `/wali-kelas/${classId}` },
                { label: "Ruangan" },
            ],
            showBack: true,
        });
    }, [setHeader, classId]);

    return (
        <div className="w-full bg-background text-foreground">
            <main className="w-full">
                <div className="mx-auto flex flex-col gap-6">

                    {/* Top Bar */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-lg font-semibold">Detail Ruangan</h1>
                    </div>

                    {/* Card Informasi Utama */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Informasi Ruangan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground">Nama</span>
                                <div className="text-base font-semibold">{DUMMY_ROOM.name}</div>
                            </div>

                            <div>
                                <span className="text-xs text-muted-foreground">Jenis</span>
                                <div>
                                    <Badge variant="outline">{DUMMY_ROOM.platform}</Badge>
                                </div>
                            </div>

                            {DUMMY_ROOM.join_url && (
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Link Pertemuan
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={14} />
                                        <a
                                            href={DUMMY_ROOM.join_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary underline"
                                        >
                                            Buka Link
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="text-xs text-muted-foreground">Deskripsi</span>
                                <p className="mt-1 leading-relaxed">
                                    {DUMMY_ROOM.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Info Tambahan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 size={18} /> Detail Tambahan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Tambahan</span>
                                <Badge variant="outline">{DUMMY_ROOM.slug}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
