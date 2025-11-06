/* ========= Types Siswa ========= */
export type StudentGender = "L" | "P";

export type StudentSummary = {
    id: string;
    name: string;
    nis?: string;
    gender?: StudentGender;
    avatarUrl?: string;
};

export type ClassStudentsMap = Record<string, StudentSummary[]>;

/* ========= Dummy API untuk siswa ========= */
const dummyStore: ClassStudentsMap = {
    "tpa-a": [
        { id: "s1", name: "Ahmad", gender: "L" },
        { id: "s2", name: "Bilal", gender: "L" },
        { id: "s3", name: "Citra", gender: "P" },
    ],
    "tpa-b": [
        { id: "s4", name: "Dina", gender: "P" },
        { id: "s5", name: "Erlang", gender: "L" },
    ],
};

export async function fetchStudentsByClasses(
    classIds: string[]
): Promise<ClassStudentsMap> {
    await new Promise((r) => setTimeout(r, 150));
    const out: ClassStudentsMap = {};
    for (const id of classIds) {
        out[id] = dummyStore[id] ?? [];
    }
    return out;
}

/* ========= Types Kelas Guru ========= */
export type TeacherClassSummary = {
    id: string;
    name: string;
    room?: string;
    homeroom: string;
};
