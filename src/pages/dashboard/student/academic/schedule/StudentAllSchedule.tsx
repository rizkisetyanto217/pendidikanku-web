// src/pages/sekolahislamku/student/AllScheduleStudent.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// 🔗 Ambil tipe & data helper (biarkan seperti semula)
import {
  type TodayScheduleItem,
  mockTodaySchedule,
} from "@/pages/dashboard/student/academic/schedule/TodaySchedule";

type LocationState = {
  items?: TodayScheduleItem[];
  title?: string;
};

export default function StudentAllSchedule() {
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  // Ambil data hanya untuk hari ini
  const items: TodayScheduleItem[] =
    state?.items && state.items.length > 0 ? state.items : mockTodaySchedule;

  return (
    <div className="w-full bg-background text-foreground">
      {/* Header sederhana */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-base md:text-lg font-semibold tracking-tight">
            Daftar Jadwal Hari Ini
          </h1>
        </div>
      </header>

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="mx-auto max-w-6xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Jadwal Saya</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {items.length === 0 ? (
                <div className="rounded-lg border text-sm text-muted-foreground p-6 text-center">
                  Tidak ada jadwal hari ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((it, idx) => {
                    const id = encodeURIComponent(
                      it.slug ?? it.title ?? String(idx)
                    );
                    return (
                      <Link
                        key={id}
                        to={`detail/${id}`}
                        state={{ item: it }}
                        className="block rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                      >
                        <div className="p-3 md:p-4">
                          <div className="font-semibold text-sm md:text-base">
                            {it.title}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <Badge variant="outline">{it.time}</Badge>
                            </span>
                            {it.room && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <Badge variant="outline">{it.room}</Badge>
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
