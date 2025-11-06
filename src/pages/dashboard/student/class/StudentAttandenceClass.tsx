// src/pages/sekolahislamku/pages/student/StudentAttandenceClass.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Stethoscope,
  CalendarX,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ===== Dummy mapping kelas (sesuai MyClass) ===== */
const CLASS_INFO: Record<
  string,
  { name: string; room?: string; homeroom?: string }
> = {
  tahsin: { name: "Tahsin", room: "Aula 1", homeroom: "Ustadz Abdullah" },
  tahfidz: { name: "Tahfidz", room: "R. Tahfiz", homeroom: "Ustadz Salman" },
};

type Status = "hadir" | "izin" | "sakit";

const StudentAttandenceClass: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  const cls = useMemo(
    () => CLASS_INFO[id ?? ""] ?? { name: id ?? "Kelas" },
    [id]
  );

  const [status, setStatus] = useState<Status | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const todayISO = new Date().toISOString();

  const handlePick = (s: Status) => {
    setStatus(s);
    setSubmittedAt(new Date().toISOString());
  };

  const statusBadgeVariant = (s: Status) => {
    switch (s) {
      case "hadir":
        return { label: "HADIR", variant: "default" as const };
      case "izin":
        return { label: "IZIN", variant: "outline" as const };
      case "sakit":
        return { label: "SAKIT", variant: "outline" as const };
    }
  };

  return (
    <div className="w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Content */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back + title */}
            <div className="md:flex hidden gap-3 items-center">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-lg font-semibold">Kehadiran Kelas</h1>
            </div>

            {/* Info kelas */}
            <Card>
              <CardContent className="p-4 md:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg md:text-xl font-semibold">
                    {cls.name}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {cls.room && <Badge variant="outline">{cls.room}</Badge>}
                    {cls.homeroom && <span>Wali Kelas: {cls.homeroom}</span>}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays size={14} />
                    <span>Hari ini: {dateLong(todayISO)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pilihan status */}
            <Card>
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="font-semibold">Pilih status kehadiran:</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    onClick={() => handlePick("hadir")}
                    className="w-full h-12 justify-center"
                  >
                    <CheckCircle2 size={18} className="mr-2" />
                    Hadir
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handlePick("izin")}
                    className="w-full h-12 justify-center"
                  >
                    <CalendarX size={18} className="mr-2" />
                    Izin
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handlePick("sakit")}
                    className="w-full h-12 justify-center"
                  >
                    <Stethoscope size={18} className="mr-2" />
                    Sakit
                  </Button>
                </div>

                {/* Notifikasi ringkas */}
                {status && (
                  <div className="mt-3 rounded-xl border px-4 py-3 text-sm bg-card text-foreground/90">
                    <span className="font-medium">Terkirim!</span> Status
                    kehadiran kamu untuk{" "}
                    <span className="font-medium">{cls.name}</span> hari ini
                    tercatat sebagai{" "}
                    {(() => {
                      const b = statusBadgeVariant(status);
                      return (
                        <Badge variant={b.variant} className="ml-1">
                          {b.label}
                        </Badge>
                      );
                    })()}
                    {submittedAt && (
                      <span className="text-muted-foreground">
                        {" "}
                        •{" "}
                        {new Date(submittedAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ringkasan singkat */}
            <Card>
              <CardContent className="p-4 md:p-5 text-sm text-muted-foreground">
                <div className="font-semibold mb-2 text-foreground">
                  Catatan
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Pilihan yang kamu klik langsung tersimpan (dummy/local).
                  </li>
                  <li>Jika salah pilih, klik tombol lain untuk memperbarui.</li>
                  <li>Admin/guru bisa melihat status ini pada sistem guru.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAttandenceClass;
