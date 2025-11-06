// src/pages/sekolahislamku/student/DetailSheduleStudent.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Samakan tipe dengan list
type TodayScheduleItem = {
  time: string;
  title: string;
  room?: string;
  date?: string; // ISO date (opsional)
  slug?: string;
};

type LocationState = { item?: TodayScheduleItem };

function formatDateID(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function StudentDetailSchedule() {
  const { scheduleId = "" } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState | undefined;
  const item = state?.item;

  const readableId = (() => {
    try {
      return decodeURIComponent(scheduleId);
    } catch {
      return scheduleId;
    }
  })();

  const todayISO = new Date().toISOString();

  return (
    <div className="w-full bg-background text-foreground">
      {/* Top bar sederhana pakai shadcn tokens */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-semibold tracking-tight">
            Detail Jadwal
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDateID(item?.date ?? todayISO)}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Aksi kembali */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        {/* Konten */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {item ? item.title : "Detail Jadwal"}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {item ? (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Badge variant="outline">{item.time || "-"}</Badge>
                  </span>

                  {item.room && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <Badge variant="outline">{item.room}</Badge>
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Data tidak dikirim dari halaman sebelumnya. ID:{" "}
                  <b className="text-foreground">{readableId}</b>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
