// Satu Sumber Data & Tipe untuk Assignment (List & Detail)

export type AssignmentStatus = "draft" | "terbit" | "selesai";
export type Attachment = { name: string; url?: string };

export type Assignment = {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO
  dueDate?: string; // ISO
  status: AssignmentStatus;
  totalSubmissions?: number;
  graded?: number;
  attachments?: Attachment[];
  author?: string;
};

// Query Keys
export const QK = {
  CLASSES: ["teacher-classes-list"] as const,
  ASSIGNMENTS: (classId: string) =>
    ["teacher-class-assignments", classId] as const,
};

// ========================
// Dummy “DB” (module-scope)
// ========================
const now = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const yst = new Date(now.getTime() - 864e5);

type DB = Record<string, Assignment[]>;
const DB_ASSIGNMENTS: DB = {
  "tpa-a": [
    {
      id: "a-001",
      title: "Latihan Tajwid: Idgham",
      description: "Kerjakan 10 soal tentang idgham bighunnah & bilaghunnah.",
      createdAt: iso(yst),
      dueDate: addDays(3),
      status: "terbit",
      totalSubmissions: 18,
      graded: 12,
      attachments: [{ name: "soal-idgham.pdf" }],
      author: "Ustadz Abdullah",
    },
    {
      id: "a-002",
      title: "Rekaman Bacaan QS. An-Naba 1–10",
      description: "Upload rekaman suara bacaan masing-masing.",
      createdAt: iso(now),
      dueDate: addDays(1),
      status: "draft",
      totalSubmissions: 0,
      graded: 0,
      attachments: [],
      author: "Ustadzah Amina",
    },
  ],
  "tpa-b": [
    {
      id: "a-101",
      title: "Setoran Hafalan Juz 30 (Pekan Ini)",
      createdAt: iso(yst),
      dueDate: addDays(4),
      status: "terbit",
      totalSubmissions: 14,
      graded: 9,
      attachments: [{ name: "format-penilaian.xlsx" }],
      author: "Ustadz Salman",
    },
  ],
};

// ========================
// Fetchers (bisa ganti API)
// ========================
export async function fetchAssignmentsByClass(
  classId: string
): Promise<Assignment[]> {
  return Promise.resolve([...(DB_ASSIGNMENTS[classId] ?? [])]);
}

export async function fetchAssignmentById(
  classId: string,
  assignmentId: string
): Promise<Assignment | undefined> {
  const list = DB_ASSIGNMENTS[classId] ?? [];
  return Promise.resolve(list.find((a) => a.id === assignmentId));
}

// ========================
// Helpers update (optimistic)
// ========================
export function addAssignment(
  classId: string,
  payload: Omit<Assignment, "id" | "createdAt">
): Assignment {
  const item: Assignment = {
    id: `a-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  DB_ASSIGNMENTS[classId] = [item, ...(DB_ASSIGNMENTS[classId] ?? [])];
  return item;
}

export function updateAssignment(
  classId: string,
  assignmentId: string,
  patch: Partial<Assignment>
): Assignment | undefined {
  const arr = DB_ASSIGNMENTS[classId] ?? [];
  const idx = arr.findIndex((a) => a.id === assignmentId);
  if (idx === -1) return undefined;
  const next = { ...arr[idx], ...patch };
  arr[idx] = next;
  DB_ASSIGNMENTS[classId] = [...arr];
  return next;
}

export function deleteAssignment(classId: string, assignmentId: string) {
  const arr = DB_ASSIGNMENTS[classId] ?? [];
  DB_ASSIGNMENTS[classId] = arr.filter((a) => a.id !== assignmentId);
}
