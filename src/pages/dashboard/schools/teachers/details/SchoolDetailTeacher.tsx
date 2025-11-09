// src/pages/school/CSchoolDetailTeacher.tsx
/* ================= Imports ================= */
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft, Mail, Phone } from "lucide-react";

/* ===== shadcn/ui ===== */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ================= Types ================= */
interface TeacherItem {
  id: string;
  nip?: string;
  name: string;
  subject?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status?: "aktif" | "nonaktif" | "alumni";
}

/* ================= Dummy Data ================= */
const DUMMY_TEACHERS: TeacherItem[] = [
  {
    id: "1",
    nip: "19800101",
    name: "Ahmad Fauzi",
    subject: "Matematika",
    gender: "L",
    phone: "081234567890",
    email: "ahmad.fauzi@example.com",
    status: "aktif",
  },
  {
    id: "2",
    nip: "19800202",
    name: "Siti Nurhaliza",
    subject: "Bahasa Indonesia",
    gender: "P",
    phone: "081298765432",
    email: "siti.nurhaliza@example.com",
    status: "aktif",
  },
];

/* ================= Helpers ================= */
const genderLabel = (g?: "L" | "P") =>
  g === "L" ? "Laki-laki" : g === "P" ? "Perempuan" : "-";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* Map status → warna badge */
const statusBadgeClass = (s?: TeacherItem["status"]) => {
  switch (s) {
    case "aktif":
      return "bg-green-600 text-white hover:bg-green-600";
    case "nonaktif":
      return "bg-yellow-500 text-black hover:bg-yellow-500";
    case "alumni":
      return "bg-blue-600 text-white hover:bg-blue-600";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

/* ================= Component ================= */
const SchoolDetailTeacher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  const schoolId = useMemo(() => {
    const u: any = user || {};
    return u.school_id || u.lembaga_id || u?.school?.id || u?.lembaga?.id || "";
  }, [user]);

  const { data: resp } = useQuery({
    queryKey: ["school-teachers", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const res = await axios.get("/api/a/school-teachers/by-school", {
        params: schoolId ? { school_id: schoolId } : undefined,
      });
      return res.data;
    },
  });

  const teachersFromApi: TeacherItem[] =
    resp?.data?.teachers?.map((t: any) => ({
      id: t.school_teachers_id,
      nip: t.nip ?? "N/A",
      name: t.user_name,
      subject: t.subject ?? "Umum",
      gender: t.gender,
      phone: t.phone,
      email: t.email,
      status: t.status,
    })) ?? [];

  const teachers =
    teachersFromApi.length > 0 ? teachersFromApi : DUMMY_TEACHERS;
  const teacher = teachers.find((t) => t.id === id);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Simple header (tanpa palette/thema custom) */}
      <header className="w-full border-b bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex flex-col">
              <h1 className="font-semibold">Detail Guru</h1>
              <span className="text-xs text-muted-foreground">
                {hijriWithWeekday(new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-6">
        <div className="max-w-screen-2xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-5">
              {teacher ? (
                <>
                  <div>
                    <h2 className="text-xl font-semibold">{teacher.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {teacher.subject ?? "-"}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">NIP</div>
                      <div>{teacher.nip ?? "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Gender</div>
                      <div>{genderLabel(teacher.gender)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Kontak</div>
                      <div className="flex gap-3 mt-1">
                        {teacher.phone && (
                          <a
                            href={`tel:${teacher.phone}`}
                            className="flex items-center gap-1 hover:underline text-primary"
                          >
                            <Phone size={14} /> {teacher.phone}
                          </a>
                        )}
                        {teacher.email && (
                          <a
                            href={`mailto:${teacher.email}`}
                            className="flex items-center gap-1 hover:underline text-primary"
                          >
                            <Mail size={14} /> Email
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Status</div>
                      <Badge className={statusBadgeClass(teacher.status)}>
                        {teacher.status ?? "-"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Data guru tidak ditemukan.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolDetailTeacher;
