// src/components/common/public/ShareBCLectureSessionsButton.tsx
import { useMemo, useCallback, useState } from "react";
import { Share2, X, Copy, MessageCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* =========================
   Types
========================= */
type SocialLinks = {
  maps?: string;
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  groupIkhwan?: string;
  groupAkhwat?: string;
  website?: string;
};

type Props = {
  title: string;
  dateIso?: string;
  teacher?: string;
  place?: string;
  url?: string;
  buttonLabel?: string;
  className?: string;
  variant?: "primary" | "soft" | "ghost";
  /** Baru */
  schoolSlug?: string; // contoh: "school-ar-raudhah"
  socialLinks?: SocialLinks; // kalau sudah dikasih, fetch tidak jalan
  prefetchOnHover?: boolean; // default true
};

/* =========================
   Helpers
========================= */
const isValid = (v?: string) => {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  if (!s || s === "update") return false;
  return (
    s.startsWith("http") || s.startsWith("wa.me") || s.startsWith("maps.app")
  );
};

const formatTanggalId = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const tgl = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${tgl} • ${jam} WIB`;
};

const triggerClassesByVariant: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  soft: "bg-primary/10 text-primary ring-1 ring-primary/30 hover:bg-primary/15 hover:ring-primary/40",
  ghost:
    "bg-transparent text-primary ring-1 ring-primary/30 hover:bg-primary/10 hover:ring-primary/40",
};

/* =========================
   Component
========================= */
export default function ShareBCLectureSessionsButton({
  title,
  dateIso,
  teacher,
  place,
  url,
  buttonLabel = "Bagikan",
  className,
  variant = "primary",
  schoolSlug,
  socialLinks,
  prefetchOnHover = true,
}: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [copiedBC, setCopiedBC] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = useMemo(
    () => url || (typeof window !== "undefined" ? window.location.href : ""),
    [url]
  );

  /* ============== Lazy fetch school public (slug) ============== */
  const shouldFetch = open && !socialLinks && !!schoolSlug;
  const { data: school } = useQuery({
    queryKey: ["school-public", schoolSlug],
    enabled: shouldFetch,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const res = await axios.get(`/public/schools/${schoolSlug}`);
      return res.data?.data as {
        school_name?: string;
        school_google_maps_url?: string;
        school_instagram_url?: string;
        school_whatsapp_url?: string;
        school_youtube_url?: string;
        school_facebook_url?: string;
        school_tiktok_url?: string;
        school_whatsapp_group_ikhwan_url?: string;
        school_whatsapp_group_akhwat_url?: string;
        school_domain?: string;
      };
    },
  });

  // Prefetch saat hover di tombol trigger
  const handleMouseEnter = async () => {
    if (!prefetchOnHover || !schoolSlug || socialLinks) return;
    await qc.prefetchQuery({
      queryKey: ["school-public", schoolSlug],
      staleTime: 5 * 60_000,
      queryFn: async () => {
        const res = await axios.get(`/public/schools/${schoolSlug}`);
        return res.data?.data;
      },
    });
  };

  // Normalisasi field API → SocialLinks
  const normalizedFromApi: SocialLinks | undefined = useMemo(() => {
    if (!school) return undefined;
    const website = school.school_domain
      ? school.school_domain.startsWith("http")
        ? school.school_domain
        : `https://${school.school_domain}`
      : undefined;
    return {
      maps: school.school_google_maps_url,
      instagram: school.school_instagram_url,
      whatsapp: school.school_whatsapp_url,
      youtube: school.school_youtube_url,
      facebook: school.school_facebook_url,
      tiktok: school.school_tiktok_url,
      groupIkhwan: school.school_whatsapp_group_ikhwan_url,
      groupAkhwat: school.school_whatsapp_group_akhwat_url,
      website,
    };
  }, [school]);

  const finalSocials = socialLinks ?? normalizedFromApi;
  const schoolName = school?.school_name;

  const socialsBlock = useMemo(() => {
    if (!finalSocials) return [];
    const lines: string[] = [];
    if (isValid(finalSocials.maps)) lines.push(`🗺️ Maps: ${finalSocials.maps}`);
    if (isValid(finalSocials.whatsapp))
      lines.push(`💬 WhatsApp: ${finalSocials.whatsapp}`);
    if (isValid(finalSocials.groupIkhwan))
      lines.push(`👥 Grup Ikhwan: ${finalSocials.groupIkhwan}`);
    if (isValid(finalSocials.groupAkhwat))
      lines.push(`👩 Grup Akhwat: ${finalSocials.groupAkhwat}`);
    if (isValid(finalSocials.instagram))
      lines.push(`📸 Instagram: ${finalSocials.instagram}`);
    if (isValid(finalSocials.youtube))
      lines.push(`▶️ YouTube: ${finalSocials.youtube}`);
    if (isValid(finalSocials.facebook))
      lines.push(`📘 Facebook: ${finalSocials.facebook}`);
    if (isValid(finalSocials.tiktok))
      lines.push(`🎵 TikTok: ${finalSocials.tiktok}`);
    if (isValid(finalSocials.website))
      lines.push(`🌐 Website: ${finalSocials.website}`);
    return lines;
  }, [finalSocials]);

  const bcText = useMemo(() => {
    const waktu = formatTanggalId(dateIso);
    const lines = [
      `*${title || "Kajian school"}*`,
      teacher ? `👤 Pemateri: *${teacher}*` : null,
      dateIso ? `🗓️ Waktu: ${waktu}` : null,
      place ? `📍 Tempat: ${place}` : null,
      "",
      "InsyaAllah kajian terbuka untuk umum. Yuk hadir & ajak keluarga/teman.",
      "",
      shareUrl ? `🔗 Info lengkap: ${shareUrl}` : null,
    ].filter(Boolean) as string[];

    if (socialsBlock.length) {
      lines.push("");
      lines.push(`Kontak & Sosial${schoolName ? ` — ${schoolName}` : ""}:`);
      lines.push(...socialsBlock);
    }

    lines.push("", "#Kajianschool #schoolKu");
    return lines.join("\n");
  }, [title, teacher, dateIso, place, shareUrl, socialsBlock, schoolName]);

  // Copy helpers
  const copy = useCallback(async (text: string, set: (b: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      set(true);
      setTimeout(() => set(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      set(true);
      setTimeout(() => set(false), 1500);
    }
  }, []);

  const handleCopyBC = () => copy(bcText, setCopiedBC);
  const handleCopyLink = () => copy(shareUrl, setCopiedLink);
  const handleWhatsApp = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(bcText)}`,
      "_blank",
      "noopener,noreferrer"
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onMouseEnter={handleMouseEnter}>
        <Button
          className={cn(
            "gap-2 px-3 py-2 h-9",
            triggerClassesByVariant[variant],
            className
          )}
          variant="ghost" // visual sudah dioverride via class di atas
        >
          <Share2 size={16} />
          <span>{buttonLabel}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <DialogHeader className="p-0">
            <DialogTitle className="text-base text-primary">
              Bagikan Kajian
            </DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Tutup modal"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div className="rounded-md border bg-muted/40 text-sm p-3 max-h-60 overflow-auto whitespace-pre-wrap">
            {bcText}
          </div>

          <div className="space-y-2">
            <Button className="w-full gap-2" onClick={handleCopyBC}>
              <Copy size={16} />
              <span>
                {copiedBC ? "Broadcast Tersalin!" : "Salin Broadcast"}
              </span>
            </Button>

            {shareUrl && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleCopyLink}
              >
                <Copy size={16} />
                <span>{copiedLink ? "Link Tersalin!" : "Salin Link Saja"}</span>
              </Button>
            )}

            <Button
              className="w-full gap-2"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                color: "hsl(var(--secondary-foreground))",
              }}
              onClick={handleWhatsApp}
            >
              <MessageCircle size={16} />
              <span>Kirim via WhatsApp</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
