// src/pages/sekolahislamku/types/TodaySchedule.ts

/** Bentuk item jadwal sederhana (dipakai banyak halaman) */
export type TodayScheduleItem = {
  time: string; // "07:15" atau "Hari ini"
  title: string; // "Upacara & Doa Pagi"
  room?: string; // "Lapangan"
  date?: string; // ISO date string (opsional)
  slug?: string; // untuk routing (opsional)
};

/** Bentuk minimal sesi API yang relevan untuk mapping */
export type SessionLike = {
  class_attendance_sessions_title?: string;
  class_attendance_sessions_date?: string; // optional
  class_attendance_sessions_general_info?: string; // bisa dipakai sbg room
};

/** Helper: konversi array sesi (API) -> TodayScheduleItem[] */
export function mapSessionsToTodaySchedule(
  items: SessionLike[]
): TodayScheduleItem[] {
  return (items ?? []).map((it) => ({
    // NOTE: jika backend nanti kirim jam, ubah logika "time" di sini
    time: "Hari ini",
    title: it.class_attendance_sessions_title || "Sesi Kehadiran",
    room: it.class_attendance_sessions_general_info || undefined,
    date: it.class_attendance_sessions_date || new Date().toISOString(),
  }));
}

/** Mock data fallback untuk UI demo / offline */
export const mockTodaySchedule: TodayScheduleItem[] = [
  { time: "07:15", title: "Upacara & Doa Pagi", room: "Lapangan" },
  { time: "08:00", title: "Observasi Tahsin Kelas 3", room: "Aula 1" },
  { time: "10:00", title: "Kunjungan Orang Tua", room: "Lobby" },
  { time: "13:00", title: "Rapat Kurikulum", room: "R. Meeting" },
];

/** Generate jadwal untuk 3 hari ke depan (termasuk hari ini) */
export function generateScheduleNext3Days(): TodayScheduleItem[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const scheduleTemplate = [
    { time: "07:15", title: "Upacara & Doa Pagi", room: "Lapangan" },
    { time: "08:00", title: "Observasi Tahsin", room: "Aula 1" },
    { time: "10:00", title: "Kunjungan Orang Tua", room: "Lobby" },
    { time: "13:00", title: "Rapat Kurikulum", room: "R. Meeting" },
  ];

  const days = [
    { date: today, label: "Hari ini" },
    { date: tomorrow, label: "Besok" },
    { date: dayAfter, label: "Lusa" },
  ];

  const schedule: TodayScheduleItem[] = [];

  days.forEach((day, dayIndex) => {
    scheduleTemplate.forEach((item, itemIndex) => {
      schedule.push({
        ...item,
        title: `${item.title} - ${day.label}`,
        date: day.date.toISOString(),
        slug: `${item.title.toLowerCase().replace(/\s+/g, "-")}-${dayIndex}-${itemIndex}`,
      });
    });
  });

  return schedule;
}

/** Helper untuk format tanggal Indonesia */
export function formatTanggalLabel(iso?: string): string {
  if (!iso)
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Helper untuk cek apakah string adalah format waktu HH:MM */
export function isTimeFormat(time?: string): boolean {
  return !!time && /^\d{2}:\d{2}$/.test(time);
}
