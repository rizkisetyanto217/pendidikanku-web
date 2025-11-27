import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    Users,
    MapPin,
    User,
    Info,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

export default function StudentCSSTDetail() {
    const navigate = useNavigate();

    /* STATE untuk dropdown ringkasan */
    const [expanded, setExpanded] = useState(false);

    /* =======================
          DUMMY DATA
    ======================== */
    const summaryParagraphs = [
        "Ilmu Balaghah adalah cabang ilmu bahasa Arab yang berfokus pada keindahan, ketepatan, dan kekuatan penyampaian makna. Ilmu ini membantu siswa memahami bagaimana suatu pesan disampaikan bukan hanya secara benar, tetapi juga indah, efektif, dan sesuai konteks. Balaghah menekankan keselarasan antara kata-kata dan tujuan pembicara dalam setiap situasi.",
        "Dalam ilmu ini, siswa akan mempelajari tiga cabang utama: Ilmu Ma’ani, Ilmu Bayan, dan Ilmu Badi’. Ketiganya bekerja sama membentuk struktur bahasa yang kuat dan penuh makna. Ma’ani membahas penataan kalimat agar sesuai tujuan, Bayan memperjelas makna melalui gaya bahasa, sedangkan Badi’ menambah keindahan melalui seni bahasa dan estetika sastra.",
        "Melalui Ilmu Ma’ani, siswa diarahkan memahami bagaimana variasi struktur kalimat dapat mengubah nuansa, tekanan, dan makna. Setiap susunan kata dalam kalimat memiliki nilai tertentu yang disesuaikan dengan situasi, kondisi pendengar, dan maksud pembicara. Dengan demikian, siswa terlatih menyusun kalimat yang tepat sasaran.",
        "Pada bagian Ilmu Bayan, siswa mendalami berbagai gaya bahasa seperti tasybih, isti'arah, dan majas lainnya. Tujuannya melatih kepekaan dalam menangkap makna tersirat dan makna kiasan, sehingga mampu memahami teks-teks klasik dan modern secara lebih mendalam. Gaya bahasa ini juga membangun kemampuan siswa untuk mengekspresikan ide secara lebih kreatif.",
        "Sementara itu, Ilmu Badi’ memperkaya estetika bahasa melalui teknik-teknik keindahan seperti jinas, sajak, dan bentuk ornamen bahasa lainnya. Dengan mempelajari Badi’, siswa diajak menghias bahasa tanpa menghilangkan ketelitian makna. Pada akhirnya, Ilmu Balaghah membantu siswa memahami bahasa Arab secara mendalam dan matang.",
    ];

    const data = {
        id: "pengantar-balaghah",
        name: "Pengantar Ilmu Balaghah",
        summary: summaryParagraphs,
        className: "Kelas Balaghoh Menengah A",
        code: "kelas-balaghoh-menengah-a-1f9f08f54131",
        teacher: "Ustadz Hendra",
        kkm: 75,
        day: "Kamis",
        time: "08:30 - 10:00",
        room: "Ruang Balaghah 1",
        students: 30,
        is_active: true,
    };

    return (
        <div className="w-full">
            <main className="w-full">
                <div className="mx-auto flex flex-col gap-6">

                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-lg font-semibold md:text-xl">Detail Mata Pelajaran</h1>
                    </div>

                    {/* MAIN CARD */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-2 flex flex-col gap-2">
                            <CardTitle className="flex flex-col gap-1">
                                <span className="text-xl font-semibold">{data.name}</span>

                                <Badge variant="secondary" className="w-fit">
                                    {data.className}
                                </Badge>

                                <span className="text-xs text-muted-foreground">
                                    Kode kelas: <span className="font-mono">{data.code}</span>
                                </span>

                                <span className="text-sm">
                                    Guru: <strong className="text-primary">{data.teacher}</strong>
                                </span>

                                <span className="text-xs text-muted-foreground">KKM: {data.kkm}</span>

                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-2 mt-1">
                                        <CBadgeStatus
                                            status={data.is_active ? "active" : "inactive"}
                                            className="text-[11px]"
                                        />
                                    </div>

                                </div>
                            </CardTitle>
                        </CardHeader>

                        {/* CONTENT */}
                        <CardContent className="p-4 md:p-6 space-y-6">

                            {/* SUMMARY DROPDOWN */}
                            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                                <div className="flex items-start gap-2">
                                    <Info size={18} className="mt-0.5" />

                                    <div className="space-y-2">
                                        {/* Jika tidak expanded → hanya 1 paragraf */}
                                        {!expanded ? (
                                            <p>{data.summary[0]}</p>
                                        ) : (
                                            data.summary.map((p, i) => <p key={i}>{p}</p>)
                                        )}
                                    </div>
                                </div>

                                {/* BUTTON EXPAND / COLLAPSE */}
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="text-primary text-xs font-medium flex items-center gap-1"
                                >
                                    {expanded ? (
                                        <>
                                            Tampilkan lebih sedikit <ChevronUp size={14} />
                                        </>
                                    ) : (
                                        <>
                                            Baca selengkapnya <ChevronDown size={14} />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* DETAIL INFO */}
                            <div className="border-t pt-4 space-y-4 text-sm">

                                <div className="flex items-center gap-3">
                                    <CalendarDays size={18} className="text-muted-foreground" />
                                    <span>
                                        Jadwal: <strong>{data.day}, {data.time}</strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-muted-foreground" />
                                    <span>
                                        Ruangan: <strong>{data.room}</strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-muted-foreground" />
                                    <span>
                                        Guru Pengampu: <strong>{data.teacher}</strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Users size={18} className="text-muted-foreground" />
                                    <span>
                                        Jumlah Peserta: <strong>{data.students} murid</strong>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
