// =============================================
// File: src/pages/dasboard/teacher/teacher.ts
// =============================================

// 🔹 React Query key
export const TEACHER_HOME_QK = ["teacher-home"] as const;

/* ================= Types ================= */
export type Announcement = {
    id: string;
    title: string;
    date: string; // ISO date
    body: string;
    type?: "info" | "warning" | "success";
};

export type TodayClass = {
    id: string;
    time: string; // "07:30"
    className: string; // "TPA A"
    subject: string; // "Tahsin"
    room?: string; // "Aula 1"
    studentCount?: number;
    status?: "upcoming" | "ongoing" | "done";
};

// 🔹 Jadwal mendatang (punya tanggal)
export type UpcomingClass = TodayClass & {
    dateISO: string; // contoh: "2025-08-22T00:00:00.000Z"
};

// 🔹 Response utama dashboard guru
export type TeacherHomeResponse = {
    hijriDate: string;
    gregorianDate: string;
    todayClasses: TodayClass[];
    announcements: Announcement[];
    upcomingClasses: UpcomingClass[];
};

/* ================= Helpers ================= */
const startOfDay = (d = new Date()) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};
const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

/* ================= Mock API =================
   Ganti ke axios.get('/api/teacher/home') saat backend aktif.
   CSS & styling mengikuti shadcn (tidak perlu palette atau CPrimitives)
================================================ */
export async function fetchTeacherHome(): Promise<TeacherHomeResponse> {
    const now = new Date();
    const iso = now.toISOString();

    const todayClasses: TodayClass[] = [
        {
            id: "tc1",
            time: "07:30",
            className: "TPA A",
            subject: "Tahsin",
            room: "Aula 1",
            studentCount: 22,
            status: "ongoing",
        },
        {
            id: "tc2",
            time: "09:30",
            className: "TPA B",
            subject: "Hafalan Juz 30",
            room: "R. Tahfiz",
            studentCount: 20,
            status: "upcoming",
        },
    ];

    // 🔹 Generate jadwal 7 hari ke depan (hari ini s/d +6)
    const baseDate = startOfDay(now);
    const upcomingClasses: UpcomingClass[] = Array.from({ length: 7 }).flatMap(
        (_, i) => {
            const dIso = startOfDay(addDays(baseDate, i)).toISOString();
            return todayClasses.map((c) => ({
                ...c,
                id: `${c.id}-${dIso.slice(0, 10)}`, // id unik per tanggal
                dateISO: dIso,
                status: i === 0 ? c.status : "upcoming",
            }));
        }
    );

    return {
        hijriDate: "16 Muharram 1447 H",
        gregorianDate: iso,
        todayClasses,
        announcements: [
            {
                id: "a1",
                title: "Tryout Ujian Tahfiz",
                date: iso,
                body: "Tryout internal hari Kamis. Mohon siapkan rubrik penilaian makhraj & tajwid.",
                type: "info",
            },
            {
                id: "a2",
                title: "Rapat Kurikulum",
                date: iso,
                body: "Rapat kurikulum pekan depan. Draft silabus sudah di folder bersama.",
                type: "success",
            },
        ],
        upcomingClasses,
    };
}
