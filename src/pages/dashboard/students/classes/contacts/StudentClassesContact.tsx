// src/pages/ParentContacts.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MessageSquare,
  Users,
  UserSquare2,
  GraduationCap,
  Building2,
  ArrowLeft,
} from "lucide-react";

/* ===================== Types (ringkas) ===================== */
type Lecturer = {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
};
type Course = {
  id: string;
  name: string;
  lecturer: Lecturer;
};
type ProgramDetailLite = {
  courses: Course[];
  contact: {
    academicAdvisor: Lecturer; // Penanggung jawab / PA
    adminOffice: { email?: string; phone?: string };
  };
  // Tambahan dummy wali kelas (karena dataset asli tidak punya)
  waliKelas?: Lecturer;
};

/* ===================== Fake API (derivasi ringan) ===================== */
async function fetchContacts(): Promise<ProgramDetailLite> {
  // Kamu bisa ganti ini dengan fetch API asli.
  // Untuk sekarang, bikin dummy konsisten dengan halaman sebelumnya.
  const mkLect = (
    id: string,
    name: string,
    title?: string,
    email?: string,
    phone?: string,
    avatar_url?: string
  ): Lecturer => ({
    id,
    name,
    title,
    email,
    phone,
    avatar_url,
  });

  const courses: Course[] = [
    {
      id: "c1",
      name: "Balaghah Dasar",
      lecturer: mkLect(
        "t1",
        "Ust. Hendra",
        "Lc",
        "hendra@kampus.ac.id",
        "+62 812-1111-2222"
      ),
    },
    {
      id: "c2",
      name: "Nahwu Lanjutan",
      lecturer: mkLect(
        "t2",
        "Ust. Ali",
        "M.A.",
        "ali@kampus.ac.id",
        "+62 812-3333-4444"
      ),
    },
    {
      id: "c3",
      name: "Sharf Terapan",
      lecturer: mkLect("t3", "Ust. Faris", "M.Ag", "faris@kampus.ac.id"),
    },
    {
      id: "c4",
      name: "Ulum Al-Qur'an",
      lecturer: mkLect("t4", "Ust. Salman", "M.Ag", "salman@kampus.ac.id"),
    },
    {
      id: "c5",
      name: "Keterampilan Bahasa",
      lecturer: mkLect("t5", "Ust. Zaki", "M.Hum", "zaki@kampus.ac.id"),
    },
  ];

  return {
    courses,
    contact: {
      academicAdvisor: mkLect(
        "pa1",
        "Dr. Hilmi",
        "M.Ag",
        "hilmi@kampus.ac.id",
        "+62 812-0000-1111",
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=256&q=80"
      ),
      adminOffice: {
        email: "admin.akademik@kampus.ac.id",
        phone: "+62 21 555 7777",
      },
    },
    waliKelas: mkLect(
      "wk1",
      "Ust. Ridwan",
      "S.Pd.I",
      "ridwan@kampus.ac.id",
      "+62 812-8888-9999",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80"
    ),
  };
}

/* ===================== Small UI helpers ===================== */
function PersonRow({ p, right }: { p: Lecturer; right?: React.ReactNode }) {
  const initials =
    p.name
      ?.split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2) || "??";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={p.avatar_url} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium truncate">
            {p.title ? `${p.name}, ${p.title}` : p.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {p.email || p.phone || "—"}
          </div>
        </div>
      </div>
      {right}
    </div>
  );
}

export default function ParentContactsPage() {
  const { data } = useQuery({
    queryKey: ["parent-contacts"],
    queryFn: fetchContacts,
    staleTime: 60_000,
  });

  // Guru unik berdasarkan lecturer.id
  const guruUnik = Object.values(
    (data?.courses ?? []).reduce<Record<string, Lecturer>>((acc, c) => {
      if (c.lecturer?.id) acc[c.lecturer.id] = c.lecturer;
      return acc;
    }, {})
  );

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-6 px-4 md:px-6 py-4 md:py-6">
          {/* Header mini */}
          <div className="flex items-center justify-between">
            <Link to=".." relative="path">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Button>
            </Link>
            <Link to="/student/komunikasi">
              <Button size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" /> Pusat Komunikasi
              </Button>
            </Link>
          </div>

          {/* Wali Kelas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <UserSquare2 className="text-primary" /> Wali Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.waliKelas ? (
                <PersonRow
                  p={data.waliKelas}
                  right={
                    <div className="flex gap-2">
                      {data.waliKelas.phone && (
                        <a
                          href={`tel:${data.waliKelas.phone.replace(
                            /\s+/g,
                            ""
                          )}`}
                          className="text-sm inline-flex items-center gap-1"
                        >
                          <Phone className="w-4 h-4" /> Telp
                        </a>
                      )}
                      {data.waliKelas.email && (
                        <a
                          href={`mailto:${data.waliKelas.email}`}
                          className="text-sm inline-flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" /> Email
                        </a>
                      )}
                    </div>
                  }
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Belum ada data wali kelas.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Penanggung Jawab (PA) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <GraduationCap className="text-primary" /> Penanggung Jawab (PA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.contact.academicAdvisor ? (
                <PersonRow
                  p={data.contact.academicAdvisor}
                  right={
                    <div className="flex gap-2">
                      {data.contact.academicAdvisor.phone && (
                        <a
                          href={`tel:${data.contact.academicAdvisor.phone.replace(
                            /\s+/g,
                            ""
                          )}`}
                          className="text-sm inline-flex items-center gap-1"
                        >
                          <Phone className="w-4 h-4" /> Telp
                        </a>
                      )}
                      {data.contact.academicAdvisor.email && (
                        <a
                          href={`mailto:${data.contact.academicAdvisor.email}`}
                          className="text-sm inline-flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" /> Email
                        </a>
                      )}
                    </div>
                  }
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Belum ada data PA.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guru / Dosen Pengampu */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Users className="text-primary" /> Guru / Dosen Pengampu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guruUnik.length ? (
                guruUnik.map((g) => (
                  <div key={g.id}>
                    <PersonRow
                      p={g}
                      right={
                        <div className="flex gap-2">
                          {g.phone && (
                            <a
                              href={`tel:${g.phone.replace(/\s+/g, "")}`}
                              className="text-sm inline-flex items-center gap-1"
                            >
                              <Phone className="w-4 h-4" /> Telp
                            </a>
                          )}
                          {g.email && (
                            <a
                              href={`mailto:${g.email}`}
                              className="text-sm inline-flex items-center gap-1"
                            >
                              <Mail className="w-4 h-4" /> Email
                            </a>
                          )}
                        </div>
                      }
                    />
                    <Separator className="my-3 last:hidden" />
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  Belum ada data guru.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Building2 className="text-primary" /> Admin / Tata Usaha
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Bagian Akademik</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {data?.contact.adminOffice.phone && (
                  <a
                    href={`tel:${data.contact.adminOffice.phone.replace(
                      /\s+/g,
                      ""
                    )}`}
                    className="inline-flex items-center gap-1"
                  >
                    <Phone className="w-4 h-4" />{" "}
                    {data.contact.adminOffice.phone}
                  </a>
                )}
                {data?.contact.adminOffice.email && (
                  <a
                    href={`mailto:${data.contact.adminOffice.email}`}
                    className="inline-flex items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />{" "}
                    {data.contact.adminOffice.email}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
