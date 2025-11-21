// src/pages/sekolahislamku/pages/classes/SchoolRoomForm.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";
import { ArrowLeft, Info, Loader2, MapPin } from "lucide-react";

/* Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Current user context */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

/* ===================== TYPES ===================== */
export type Room = {
  id: string;
  school_id?: string;
  name: string;
  capacity: number;
  location?: string | null;
  is_virtual?: boolean;
  is_active: boolean;
  platform?: string | null;
};

type RoomApi = {
  class_room_id: string;
  class_room_school_id: string;
  class_room_name: string;
  class_room_capacity: number;
  class_room_location?: string | null;
  class_room_is_virtual?: boolean;
  class_room_is_active: boolean;
  class_room_platform?: string | null;
};

type RoomDetailResponse = {
  data?: RoomApi;
  [key: string]: any;
};

/* ===================== HELPERS ===================== */
function mapApiToRoom(x: RoomApi): Room {
  return {
    id: x.class_room_id,
    school_id: x.class_room_school_id,
    name: x.class_room_name,
    capacity: x.class_room_capacity,
    location: x.class_room_location,
    is_virtual: x.class_room_is_virtual,
    is_active: x.class_room_is_active,
    platform: x.class_room_platform,
  };
}

function extractErrorMessage(err: any) {
  const d = err?.response?.data;
  if (!d) return err?.message || "Request error";
  if (typeof d === "string") return d;
  if (d.message) return d.message;
  if (Array.isArray(d.errors)) {
    return d.errors
      .map((e: any) => [e.field, e.message].filter(Boolean).join(": "))
      .join("\n");
  }
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
}

/* ===================== PAGE ADD/EDIT RUANGAN ===================== */
const SchoolRoomForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  const { data: currentUser } = useCurrentUser();
  const membership = currentUser?.membership ?? null;
  const schoolIdFromMembership = membership?.school_id ?? null;
  const schoolSlug = membership?.school_slug ?? "";
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  const roomId = params.id;
  const isEditMode = Boolean(roomId && roomId !== "new");

  const qc = useQueryClient();
  const { setHeader } = useDashboardHeader();

  // kalau navigate dari list bisa bawa state
  const stateRoom = (location.state as { room?: Room } | undefined)?.room;

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Edit Ruangan" : "Tambah Ruangan",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        {
          label: "Ruangan",
          href: schoolSlug
            ? `/${schoolSlug}/sekolah/akademik/ruangan`
            : undefined,
        },
        { label: isEditMode ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEditMode, schoolSlug]);

  /* ===================== DETAIL QUERY (opsional) ===================== */
  const detailQ = useQuery<Room, Error>({
    queryKey: ["room-detail", schoolId, roomId],
    enabled: isEditMode && !!schoolId && !!roomId && !stateRoom,
    queryFn: async () => {
      const res = await axios.get<RoomDetailResponse>(
        `/public/${schoolId}/class-rooms/${roomId}`
      );
      const raw = (res.data as any).data ?? (res.data as any);
      return mapApiToRoom(raw as RoomApi);
    },
  });

  const room = useMemo<Room | undefined>(() => {
    if (stateRoom) return stateRoom;
    if (!isEditMode) return undefined;
    return detailQ.data;
  }, [stateRoom, detailQ.data, isEditMode]);

  /* ===================== FORM STATE ===================== */
  const [name, setName] = useState<string>(room?.name ?? "");
  const [capacity, setCapacity] = useState<number>(room?.capacity ?? 0);
  const [locationText, setLocationText] = useState<string>(
    room?.location ?? ""
  );
  const [isActive, setIsActive] = useState<boolean>(room?.is_active ?? true);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // sinkron bila room hasil query datang
  useEffect(() => {
    if (!room) return;
    setName(room.name ?? "");
    setCapacity(room.capacity ?? 0);
    setLocationText(room.location ?? "");
    setIsActive(room.is_active ?? true);
  }, [room]);

  const canSubmit =
    !!schoolId && name.trim().length > 0 && Number.isFinite(capacity);

  const loadingDetail = isEditMode && !room && detailQ.isLoading;
  const detailError = isEditMode && !room && detailQ.isError;

  /* ===================== MUTATIONS ===================== */
  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      capacity: number;
      location?: string;
      is_active: boolean;
    }) => {
      if (!schoolId) throw new Error("School ID tidak tersedia");
      const body = {
        room_name: payload.name,
        room_capacity: payload.capacity,
        room_location: payload.location ?? null,
        room_is_active: payload.is_active,
      };
      const res = await axios.post(`/a/${schoolId}/class-rooms`, body);
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["public-rooms"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      capacity: number;
      location?: string;
      is_active: boolean;
    }) => {
      if (!schoolId) throw new Error("School ID tidak tersedia");
      const body = {
        room_name: payload.name,
        room_capacity: payload.capacity,
        room_location: payload.location ?? null,
        room_is_active: payload.is_active,
      };
      const res = await axios.put(
        `/a/${schoolId}/class-rooms/${payload.id}`,
        body
      );
      return res.data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["public-rooms"],
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleBack = () => {
    if (schoolSlug) {
      navigate(`/${schoolSlug}/sekolah/akademik/ruangan`);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || !schoolId) return;
      setSubmitError(null);

      const payload = {
        name: name.trim(),
        capacity: Number.isFinite(capacity) ? capacity : 0,
        location: locationText.trim() || undefined,
        is_active: isActive,
      };

      if (isEditMode && roomId) {
        updateMutation.mutate(
          { id: roomId, ...payload },
          {
            onSuccess: () => {
              handleBack();
            },
            onError: (err: any) => {
              setSubmitError(extractErrorMessage(err));
            },
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            handleBack();
          },
          onError: (err: any) => {
            setSubmitError(extractErrorMessage(err));
          },
        });
      }
    },
    [
      canSubmit,
      schoolId,
      name,
      capacity,
      locationText,
      isActive,
      isEditMode,
      roomId,
      updateMutation,
      createMutation,
    ]
  );

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto max-w-3xl flex flex-col gap-4 lg:gap-6 py-4">
          {/* Header + Back */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEditMode ? "Edit Ruangan" : "Tambah Ruangan"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Perbarui informasi ruangan kelas."
                  : "Tambahkan ruangan baru untuk jadwal kelas dan kegiatan."}
              </p>
            </div>
          </div>

          {loadingDetail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin h-4 w-4" />
              Memuat data ruangan…
            </div>
          )}

          {detailError && (
            <div className="rounded-xl border p-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" /> Gagal memuat data ruangan.
              </div>
              <pre className="text-xs opacity-70 overflow-auto">
                {extractErrorMessage(detailQ.error)}
              </pre>
              <Button size="sm" onClick={() => detailQ.refetch()}>
                Coba lagi
              </Button>
            </div>
          )}

          {/* FORM CARD */}
          <Card className="border">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {isEditMode ? "Form Edit Ruangan" : "Form Tambah Ruangan"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Nama + Kapasitas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="room_name">Nama Ruangan *</Label>
                    <Input
                      id="room_name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="cth. Lab Komputer, Kelas 7A"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="room_capacity">Kapasitas *</Label>
                    <Input
                      id="room_capacity"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={Number.isFinite(capacity) ? capacity : 0}
                      onChange={(e) =>
                        setCapacity(parseInt(e.target.value || "0", 10))
                      }
                    />
                  </div>
                </div>

                {/* Lokasi */}
                <div className="space-y-1.5">
                  <Label htmlFor="room_location">Lokasi</Label>
                  <Input
                    id="room_location"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="Gedung A, Lt. 2 / Musholla / Link Zoom"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                    <Checkbox
                      id="room_active"
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        setIsActive(Boolean(checked))
                      }
                    />
                    <div className="space-y-0.5">
                      <label
                        htmlFor="room_active"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {isActive ? "Aktif" : "Tandai sebagai aktif"}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Ruangan nonaktif tidak akan muncul sebagai opsi utama di
                        beberapa fitur.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ringkasan mini */}
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs md:text-sm text-muted-foreground flex gap-2">
                  <Info className="h-4 w-4 mt-[2px]" />
                  <div>
                    <div className="font-medium">Ringkasan</div>
                    <div className="mt-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {name || "Nama ruangan belum diisi"}
                        </span>
                        {locationText && (
                          <span className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {locationText}
                          </span>
                        )}
                      </div>
                      <div>
                        Kapasitas:{" "}
                        <span className="font-medium">
                          {Number.isFinite(capacity) ? capacity : 0} siswa
                        </span>{" "}
                        • Status:{" "}
                        <span className="font-medium">
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs whitespace-pre-wrap">
                    <span className="font-medium">Gagal menyimpan:</span>{" "}
                    {submitError}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan…
                    </span>
                  ) : isEditMode ? (
                    "Simpan Perubahan"
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolRoomForm;
