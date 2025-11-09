// src/components/common/public/SocialMediaModal.tsx
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* shadcn/ui */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SocialMediaModalProps {
  show: boolean;
  onClose: () => void;
  data: {
    school_instagram_url?: string;
    school_whatsapp_url?: string;
    school_youtube_url?: string;
    school_facebook_url?: string;
    school_tiktok_url?: string;
    school_whatsapp_group_ikhwan_url?: string;
    school_whatsapp_group_akhwat_url?: string;
  };
  /** optional: kalau false, klik backdrop tidak menutup */
  closeOnBackdrop?: boolean;
}

type ItemConf = {
  key: keyof SocialMediaModalProps["data"];
  label: string;
  prefix?: string;
  iconSrc: string;
  normalize?: (v: string) => string;
  customHref?: (raw: string) => string;
};

function toHref(conf: ItemConf, rawValue: string) {
  const v = conf.normalize ? conf.normalize(rawValue.trim()) : rawValue.trim();
  const isURL = /^https?:\/\//i.test(v);
  if (isURL) return v;
  if (conf.customHref) return conf.customHref(v);
  if (conf.prefix) return `${conf.prefix}${v}`;
  return `https://${v}`;
}

export default function SocialMediaModal({
  show,
  onClose,
  data,
  closeOnBackdrop = true,
}: SocialMediaModalProps) {
  const items: ItemConf[] = [
    {
      key: "school_instagram_url",
      label: "Instagram",
      prefix: "https://instagram.com/",
      iconSrc: "/icons/instagram.svg",
      normalize: (v) => v.replace(/^@/, ""),
    },
    {
      key: "school_whatsapp_url",
      label: "WhatsApp",
      prefix: "https://wa.me/",
      iconSrc: "/icons/whatsapp.svg",
      normalize: (v) => v.replace(/[^\d]/g, "").replace(/^0/, "62"),
    },
    {
      key: "school_youtube_url",
      label: "YouTube",
      iconSrc: "/icons/youtube.svg",
    },
    {
      key: "school_facebook_url",
      label: "Facebook",
      prefix: "https://facebook.com/",
      iconSrc: "/icons/facebook.svg",
    },
    {
      key: "school_tiktok_url",
      label: "TikTok",
      prefix: "https://tiktok.com/@",
      iconSrc: "/icons/tiktok.svg",
      normalize: (v) => v.replace(/^@/, ""),
    },
    // Grup WhatsApp
    {
      key: "school_whatsapp_group_ikhwan_url",
      label: "Grup WhatsApp Ikhwan",
      iconSrc: "/icons/whatsapp.svg",
      customHref: (v) =>
        /^https?:\/\//i.test(v) ? v : `https://chat.whatsapp.com/${v}`,
    },
    {
      key: "school_whatsapp_group_akhwat_url",
      label: "Grup WhatsApp Akhwat",
      iconSrc: "/icons/whatsapp.svg",
      customHref: (v) =>
        /^https?:\/\//i.test(v) ? v : `https://chat.whatsapp.com/${v}`,
    },
  ];

  // Filter yang ada valuenya
  const visibleItems = items
    .map((conf) => {
      const raw = data[conf.key];
      if (!raw || !raw.trim()) return null;
      return { ...conf, href: toHref(conf, raw) };
    })
    .filter(Boolean) as Array<ItemConf & { href: string }>;

  return (
    <Dialog open={show} onOpenChange={(v) => (!v ? onClose() : void 0)}>
      {/* custom overlay: blur halus */}
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogContent
        aria-label="Sosial Media sekolah"
        onInteractOutside={(e) => {
          if (!closeOnBackdrop) e.preventDefault();
        }}
        className={cn(
          "z-50 w-[92vw] max-w-xl rounded-2xl border bg-background p-6 text-foreground shadow-2xl",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:zoom-out-95"
        )}
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-semibold">
            Sosial Media sekolah
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {visibleItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Belum ada tautan sosial media yang diset.
            </div>
          ) : (
            visibleItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-5 py-3 text-sm font-medium",
                  "transition-colors hover:bg-accent"
                )}
              >
                <img
                  src={item.iconSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5"
                  loading="lazy"
                />
                <span>{item.label}</span>
              </a>
            ))
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
