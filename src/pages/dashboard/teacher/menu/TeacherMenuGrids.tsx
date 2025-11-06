// src/pages/dashboard/teacher/menu/TeacherMenuGrids.tsx

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Icons
import {
    Users,
    Layers,
    IdCard,
    CalendarDays,
    Settings,
    NotebookPen,
} from "lucide-react";

/* ================= Types ================= */
type MenuItem = {
    key: string;
    label: string;
    to?: string;
    icon: React.ReactNode;
};

/* ================= Component ================= */
export default function TeacherMenuGrids() {
    const items: MenuItem[] = useMemo(
        () => [
            {
                key: "kelas-saya",
                label: "Kelas Saya",
                to: "kelas",
                icon: <Users className="w-5 h-5" />,
            },
            {
                key: "guru-mapel",
                label: "Guru Mapel",
                to: "guru-mapel",
                icon: <Layers className="w-5 h-5" />,
            },
            {
                key: "profil-guru",
                label: "Profil Guru",
                to: "profil-guru",
                icon: <IdCard className="w-5 h-5" />,
            },
            {
                key: "jadwal",
                label: "Jadwal",
                to: "jadwal",
                icon: <CalendarDays className="w-5 h-5" />,
            },
            {
                key: "pengaturan",
                label: "Pengaturan",
                to: "pengaturan",
                icon: <Settings className="w-5 h-5" />,
            },
            {
                key: "tugas",
                label: "Tugas",
                to: "tugas",
                icon: <NotebookPen className="w-5 h-5" />,
            },
        ],
        []
    );

    return (
        <div className="w-full bg-background text-foreground">
            <main className="w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
                <section className="flex-1 flex flex-col space-y-6 min-w-0">
                    <Card className="p-4 md:p-5 border border-border bg-card text-card-foreground shadow-sm">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-lg font-semibold">
                                Akses Cepat Guru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                {items.map((it) => (
                                    <MenuTile key={it.key} item={it} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    );
}

/* ================= Tile Component ================= */
function MenuTile({ item }: { item: MenuItem }) {
    return (
        <Link
            to={item.to || "#"}
            className="group block transition-transform transform hover:scale-[1.02] active:scale-[0.99] focus:outline-none"
        >
            <div className="h-full w-full rounded-2xl border border-border bg-card hover:bg-accent hover:text-accent-foreground p-3 md:p-4 flex flex-col items-center justify-center text-center gap-2 shadow-sm transition-colors">
                <span className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {item.icon}
                </span>
                <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2">
                    {item.label}
                </div>
            </div>
        </Link>
    );
}
