// src/components/schedule/types.ts
export type ScheduleType = "class" | "exam" | "event";

export type ScheduleRow = {
  id: string;
  title: string;
  date: string; // ISO
  time: string; // "HH:mm"
  room?: string;
  teacher?: string;
  type?: ScheduleType;
  description?: string;
  status?: "present" | "absent";
};

/* ======= Helpers tanggal / format ======= */
export const pad2 = (n: number) => String(n).padStart(2, "0");

export const toMonthStr = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;

export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export const dateKeyFrom = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate()
  )}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const fmtDayShort = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });

export const fmtFullDate = (isoOrKey: string) =>
  new Date(isoOrKey).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
