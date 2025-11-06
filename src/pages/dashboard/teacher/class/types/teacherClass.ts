// teacherClass.ts
// tolong bikinkan type data siswanya perClass
// src/pages/sekolahislamku/teacher/teacherClass.ts

/* ========= Types siswa per kelas ========= */
export type StudentGender = "L" | "P";

export type StudentSummary = {
  id: string;
  name: string;
  nis?: string;            // opsional kalau ada
  gender?: StudentGender;  // "L" (laki-laki) | "P" (perempuan)
  avatarUrl?: string;
};

export type ClassStudentsMap = Record<string, StudentSummary[]>; // key = classId

/* ========= Dummy API: ambil siswa per class =========
   Ganti dengan pemanggilan API backend jika sudah siap.
*/
const dummyStore: ClassStudentsMap = {
  "tpa-a": [
    { id: "s1", name: "Ahmad", gender: "L" },
    { id: "s2", name: "Bilal", gender: "L" },
    { id: "s3", name: "Citra", gender: "P" },
    { id: "s4", name: "Dina", gender: "P" },
    { id: "s5", name: "Erlang", gender: "L" },
  ],
  "tpa-b": [
    { id: "s6", name: "Fatimah", gender: "P" },
    { id: "s7", name: "Ghani", gender: "L" },
    { id: "s8", name: "Hana", gender: "P" },
  ],
  "tpa-c": [
    { id: "s9", name: "Irfan", gender: "L" },
    { id: "s10", name: "Jihan", gender: "P" },
  ],
  "pra-tahfiz": [
    { id: "s11", name: "Kamil", gender: "L" },
    { id: "s12", name: "Laila", gender: "P" },
    { id: "s13", name: "Mika", gender: "P" },
    { id: "s14", name: "Naufal", gender: "L" },
  ],
  "tahsin-lanjutan": [
    { id: "s15", name: "Omar", gender: "L" },
    { id: "s16", name: "Putri", gender: "P" },
  ],
  "tahfiz-juz-29": [
    { id: "s17", name: "Qori", gender: "L" },
    { id: "s18", name: "Rania", gender: "P" },
    { id: "s19", name: "Salma", gender: "P" },
  ],
};

/** Ambil siswa untuk banyak classId sekaligus.
 *  Return: map { classId: StudentSummary[] }
 */
export async function fetchStudentsByClasses(
  classIds: string[]
): Promise<ClassStudentsMap> {
  // simulasi network
  await new Promise((r) => setTimeout(r, 150));
  const out: ClassStudentsMap = {};
  for (const id of classIds) {
    out[id] = dummyStore[id] ?? [];
  }
  return out;
}
