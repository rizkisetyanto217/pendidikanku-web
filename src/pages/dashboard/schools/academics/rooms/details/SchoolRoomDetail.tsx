// src/pages/sekolahislamku/dashboard-school/rooms/RoomDetailSchool.shadcn.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ArrowLeft,
  Building2,
  Layers,
} from "lucide-react";

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CBadgeStatus from "@/components/costum/common/badges/CBadgeStatus";

/* ===================== API TYPES ===================== */
type ApiClassSection = {
  id: string;
  class_id: string;
  class_room_id: string;
  slug: string;
  name: string;
  code: string | null;
  total_students: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ApiClassRoom = {
  class_room_id: string;
  class_room_school_id: string;
  class_room_name: string;
  class_room_code?: string | null;
  class_room_slug?: string | null;
  class_room_description?: string | null;
  class_room_capacity?: number | null;
  class_room_location?: string | null;
  class_room_is_virtual?: boolean;
  class_room_is_active: boolean;

  class_room_image_url?: string | null;

  class_room_features?: string[];
  class_room_platform?: string | null; // zoom | google_meet | ms_teams | dll
  class_room_join_url?: string | null;
  class_room_meeting_id?: string | null;
  class_room_passcode?: string | null;

  class_room_schedule?: any[];
  class_room_notes?: Array<{ ts?: string; text?: string }>;

  class_room_created_at?: string;
  class_room_updated_at?: string;
  class_room_deleted_at?: string | null;

  class_sections?: ApiClassSection[];
  class_sections_count?: number;
};

type ApiRoomListResp = {
  data: ApiClassRoom[];
};

/* ============== REUSABLE COMPONENTS ============== */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Separator />
      {children}
    </div>
  );
}


/* ===================== HOOK: FETCH DETAIL ===================== */
function useRoomDetail(id?: string) {
  return useQuery({
    queryKey: ["class-room-detail", id],
    enabled: !!id,
    queryFn: async (): Promise<ApiClassRoom | null> => {
      const res = await axios.get<ApiRoomListResp>("/u/class-rooms/list", {
        params: {
          id,
          include: "sections",
          per_page: 1,
        },
      });
      return res.data?.data?.[0] ?? null;
    },
    staleTime: 60_000,
  });
}

/* ===================== PAGE ======================= */
export default function SchoolRoomDetail() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Ruangan",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Ruangan", href: "akademik/ruangan" },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  const { data: room, isLoading, isError } = useRoomDetail(id);

  const capacity = room?.class_room_capacity ?? 0;
  const isVirtual = Boolean(room?.class_room_is_virtual);
  const isActive = Boolean(room?.class_room_is_active);
  const location =
    room?.class_room_location ?? (isVirtual ? "Online" : "—");
  const features = room?.class_room_features ?? [];
  const schedule = (room?.class_room_schedule ?? []) as any[];
  const notes = room?.class_room_notes ?? [];
  const sections = room?.class_sections ?? [];
  const sectionsCount = room?.class_sections_count ?? sections.length;

  /* ======= LOADING / ERROR / NOT FOUND ======= */
  if (isLoading) {
    return (
      <main className="px-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-screen-2xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Building2 className="mb-1 size-10 opacity-40" />
              Memuat detail ruangan…
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (isError || !room) {
    return (
      <main className="px-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-screen-2xl">
          <Card>
            <CardContent className="py-10 text-center">
              <Building2 className="mx-auto mb-3 opacity-40" size={48} />
              <h2 className="text-lg font-semibold">
                Ruangan tidak ditemukan
              </h2>
              <p className="mt-1 mb-4 text-sm text-muted-foreground">
                Pastikan link atau ID ruangan yang digunakan sudah benar.
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">
                  Kembali
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="mx-auto space-y-6">
        {/* Header atas */}
        <div className="md:flex hidden items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="20" />
          </Button>
          <h1 className="font-semibold text-lg md:text-xl">Detail Ruangan</h1>
        </div>

        {/* Hero Image (opsional, kalau nanti ada di API) */}
        {room.class_room_image_url && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={room.class_room_image_url}
            alt={room.class_room_name}
            className="h-40 w-full rounded-xl border object-cover md:h-56"
          />
        )}

        {/* Main grid */}
        <div
          className={
            isVirtual
              ? "grid grid-cols-1 gap-4 md:grid-cols-2" // 2 kolom: Info Dasar + Virtual Room
              : "grid grid-cols-1 gap-4" // 1 kolom full width
          }
        >

          {/* Informasi Dasar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow label="Nama" value={room.class_room_name} />
                <InfoRow
                  label="Kode"
                  value={room.class_room_code ?? "—"}
                />
                <InfoRow
                  label="Kapasitas"
                  value={
                    capacity
                      ? `${capacity} siswa`
                      : "—"
                  }
                />
                <InfoRow label="Lokasi" value={location} />
                <InfoRow
                  label="Status"
                  value={
                    <CBadgeStatus
                      status={isActive ? "active" : "inactive"}
                    />
                  }
                />

                <InfoRow
                  label="Tipe"
                  value={isVirtual ? "Virtual / Online" : "Fisik / Offline"}
                />
              </div>

              {room.class_room_description && (
                <div className="pt-4">
                  <InfoSection title="Deskripsi">
                    <p className="text-sm">
                      {room.class_room_description}
                    </p>
                  </InfoSection>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Virtual Room Info (skenario virtual) */}
          {isVirtual && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Informasi Virtual Room
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoRow
                    label="Platform"
                    value={room.class_room_platform ?? "—"}
                  />
                  <InfoRow
                    label="Meeting ID"
                    value={room.class_room_meeting_id ?? "—"}
                  />
                  <InfoRow
                    label="Passcode"
                    value={room.class_room_passcode ?? "—"}
                  />
                  <InfoRow
                    label="Join URL"
                    value={
                      room.class_room_join_url ? (
                        <a
                          href={room.class_room_join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-primary underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {room.class_room_join_url}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fasilitas */}
        {features.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fasilitas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="mb-3" />
              <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jadwal (kalau nanti sudah diisi di backend) */}
        {schedule.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Separator className="mb-3" />
              {schedule.map((s, idx) => {
                const label = s.label ?? "Jadwal";
                const dayOrDate = s.day ?? s.date ?? "—";
                const from = s.from ?? s.start ?? "??";
                const to = s.to ?? s.end ?? "??";
                const group = s.group ? ` • Grup ${s.group}` : "";
                return (
                  <div
                    key={idx}
                    className="rounded-lg border bg-card p-3 text-sm"
                  >
                    <div className="mb-0.5 font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground">
                      {dayOrDate} • {from} – {to}
                      {group}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Rombongan belajar yang memakai ruangan ini */}

        {sectionsCount > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Kelas yang Menggunakan Ruangan Ini
                </CardTitle>
                <Badge variant="outline">Total: {sectionsCount}</Badge>
              </div>
            </CardHeader>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              <CardContent className="space-y-2 pt-0">
                <Separator className="mb-3" />
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3 text-xs"
                  >
                    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold">
                          {sec.name}
                        </div>
                        <CBadgeStatus
                          status={sec.is_active ? "active" : "inactive"}
                        />

                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="rounded-full border px-2 py-0.5">
                          {sec.slug}
                        </span>
                        {sec.code && (
                          <span className="rounded-full border px-2 py-0.5 font-mono">
                            {sec.code}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Siswa terdaftar:{" "}
                        <span className="font-medium">
                          {sec.total_students ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </div>
          </Card>
        )}

        {/* Catatan */}
        {notes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Separator className="mb-3" />
              {notes.map((note, idx) => (
                <div key={idx} className="rounded-lg border bg-card p-3">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {note.ts
                      ? new Date(note.ts).toLocaleString("id-ID", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "—"}
                  </div>
                  <div className="text-sm">{note.text ?? "—"}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main >
  );
}