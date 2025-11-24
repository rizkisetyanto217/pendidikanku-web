// src/components/layout/dashboard/team-switcher.tsx
import { useSidebar } from "@/components/ui/sidebar";

export function TeamHeader({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl?: string | null;
}) {
  const { open, isMobile } = useSidebar();

  // Kalau sidebar collapse (icon) di desktop → sembunyikan teks
  // Di mobile tetap tampil teks biar headernya jelas
  const showText = open || isMobile;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="h-8 w-8 object-cover rounded-lg"
          />
        ) : (
          <div className="h-8 w-8 bg-muted" />
        )}
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-medium text-sm truncate">{name}</span>
          <span className="text-xs text-muted-foreground">
            Yayasan Madinah Salam
          </span>
        </div>
      )}
    </div>
  );
}