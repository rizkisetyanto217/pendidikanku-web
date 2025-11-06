// src/pages/sekolahislamku/dashboard-school/rooms/DetailRoomSchool.shadcn.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, Loader2, Building2, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* ===================== TYPES (UI) ================= */
export type Room = {
  id: string;
  school_id?: string;
  name: string;
  code?: string;
  slug?: string;
  description?: string;
  capacity: number;
  location?: string | null;
  is_virtual?: boolean;
  is_active: boolean;

  image_url?: string | null;

  features?: string[];
  platform?: string | null;
  join_url?: string | null;
  meeting_id?: string | null;
  passcode?: string | null;

  schedule?: {
    label: string;
    day?: string;
    date?: string;
    from: string;
    to: string;
    group?: string;
  }[];

  notes?: Array<{ ts?: string; text?: string }>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

/* ========== TYPES (payload dari API publik) ========= */
type ClassRoomApi = {
  class_room_id: string;
  class_room_school_id: string;
  class_room_name: string;
  class_room_code?: string | null;
  class_room_slug?: string | null;
  class_room_location?: string | null;
  class_room_capacity: number;
  class_room_description?: string | null;
  class_room_is_virtual: boolean;
  class_room_is_active: boolean;

  class_room_image_url?: string | null;

  class_room_platform?: string | null;
  class_room_join_url?: string | null;
  class_room_meeting_id?: string | null;
  class_room_passcode?: string | null;

  class_room_features?: string[] | null;
  class_room_schedule?: any[] | null; // variasi bentuk
  class_room_notes?: Array<{ ts?: string; text?: string }> | null;

  class_room_created_at?: string;
  class_room_updated_at?: string;
  class_room_deleted_at?: string | null;
};

type PublicRoomsResponse = {
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  data: ClassRoomApi[];
};

/* ===================== QK ========================= */
const QK = {
  ROOM_PUBLIC: (schoolId: string, id: string) =>
    ["public-room", schoolId, id] as const,
};

/* ===================== HELPERS ==================== */


function normalizeSchedule(s: any[] | null | undefined): Room["schedule"] {
  if (!s || !Array.isArray(s)) return [];
  return s.map((it: any) => {
    if (it.from || it.to) {
      return {
        label: it.label ?? "",
        day: it.day,
        date: it.date,
        from: it.from ?? it.start ?? "",
        to: it.to ?? it.end ?? "",
        group: it.group,
      };
    }
    return {
      label: it.label ?? "",
      day:
        it.weekday && typeof it.weekday === "string"
          ? it.weekday.toLowerCase()
          : undefined,
      from: it.start ?? "",
      to: it.end ?? "",
    };
  });
}

function mapApiRoomToRoom(x: ClassRoomApi): Room {
  return {
    id: x.class_room_id,
    school_id: x.class_room_school_id,
    name: x.class_room_name,
    code: x.class_room_code ?? undefined,
    slug: x.class_room_slug ?? undefined,
    description: x.class_room_description ?? undefined,
    capacity: x.class_room_capacity,
    location: x.class_room_location ?? null,
    is_virtual: x.class_room_is_virtual,
    is_active: x.class_room_is_active,

    image_url: x.class_room_image_url ?? null,

    features: x.class_room_features ?? undefined,
    platform: x.class_room_platform ?? null,
    join_url: x.class_room_join_url ?? null,
    meeting_id: x.class_room_meeting_id ?? null,
    passcode: x.class_room_passcode ?? null,

    schedule: normalizeSchedule(x.class_room_schedule),
    notes: x.class_room_notes ?? [],

    created_at: x.class_room_created_at,
    updated_at: x.class_room_updated_at,
    deleted_at: x.class_room_deleted_at ?? null,
  };
}

/* =============== API QUERY (public) =============== */
function usePublicRoomQuery(schoolId: string, id: string) {
  return useQuery<Room | null>({
    queryKey: QK.ROOM_PUBLIC(schoolId, id),
    enabled: !!schoolId && !!id,
    staleTime: 60_000,
    retry: 1,
    queryFn: async () => {
      const res = await axios.get<PublicRoomsResponse>(
        `/public/${schoolId}/class-rooms/list`,
        { params: { ids: id, page: 1, per_page: 1 } }
      );
      const item = res.data.data?.[0];
      return item ? mapApiRoomToRoom(item) : null;
    },
  });
}

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
      <h3 className="font-semibold text-sm">{title}</h3>
      <Separator />
      {children}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return <Badge variant="default">Aktif</Badge>;
  }
  return <Badge variant="outline">Nonaktif</Badge>;
}

/* ===================== PAGE ======================= */
export default function SchoolDetailRoom() {
  const { school_id, id } = useParams<{ school_id?: string; id?: string }>();
  const navigate = useNavigate();

  // kept to mirror original usage; not strictly needed now
  // useful if kamu butuh tanggal untuk header/topbar ke depan

  const schoolId = school_id ?? "";
  const roomId = id ?? "";

  const roomQuery = usePublicRoomQuery(schoolId, roomId);

  // Loading state (skeleton)
  if (roomQuery.isLoading) {
    return (
      <div className="w-full grid place-items-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat data ruangan…</p>
          <div className="mt-4 w-[680px] max-w-[92vw] space-y-3">
            <Skeleton className="h-10 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  const room = roomQuery.data;

  // Not found
  if (!room) {
    return (
      <main className="px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto">
          <Card>
            <CardContent className="py-10 text-center">
              <Building2 className="mx-auto mb-3 opacity-40" size={48} />
              <h2 className="text-lg font-semibold">Ruangan tidak ditemukan</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Data ruangan dengan ID tersebut tidak tersedia.
              </p>
              <Button onClick={() => navigate(-1)}>Kembali</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 md:px-6 md:py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            title="Kembali"
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate">{room.name}</h1>
            {room.code && (
              <p className="text-sm text-muted-foreground mt-1">
                Kode: {room.code}
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Kapasitas</div>
                <div className="text-lg font-semibold">{room.capacity}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="text-sm font-medium">
                  {room.location || "—"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Nama Ruangan" value={room.name} />
                <InfoRow label="Kode" value={room.code ?? "—"} />
                <InfoRow label="Kapasitas" value={`${room.capacity} siswa`} />
                <InfoRow label="Lokasi" value={room.location ?? "—"} />
                <InfoRow
                  label="Status"
                  value={<StatusBadge active={room.is_active} />}
                />
              </div>

              {room.description && (
                <div className="pt-4">
                  <InfoSection title="Deskripsi">
                    <p className="text-sm">{room.description}</p>
                  </InfoSection>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Virtual Room Info */}
          {room.is_virtual && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Informasi Virtual Room
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label="Platform" value={room.platform ?? "—"} />
                  <InfoRow label="Meeting ID" value={room.meeting_id ?? "—"} />
                  <InfoRow label="Passcode" value={room.passcode ?? "—"} />
                  <InfoRow
                    label="Join URL"
                    value={
                      room.join_url ? (
                        <a
                          href={room.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline break-all"
                        >
                          {room.join_url}
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

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fasilitas</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {room.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule */}
        {room.schedule && room.schedule.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jadwal</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {room.schedule.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="font-medium text-sm mb-0.5">
                    {s.label || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {s.day ?? s.date ?? "—"} • {s.from} – {s.to}
                    {s.group ? ` • Grup ${s.group}` : ""}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {room.notes && room.notes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {room.notes.map((note, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-card">
                  <div className="text-xs text-muted-foreground mb-1">
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

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metadata</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                label="Dibuat pada"
                value={
                  room.created_at
                    ? new Date(room.created_at).toLocaleString("id-ID")
                    : "—"
                }
              />
              <InfoRow
                label="Diperbarui pada"
                value={
                  room.updated_at
                    ? new Date(room.updated_at).toLocaleString("id-ID")
                    : "—"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
