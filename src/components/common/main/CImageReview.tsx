// src/components/common/main/ImagePreview.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

type ImagePreviewProps = {
  label: string;
  url?: string | null;
  /** rasio gambar; default 16/9. set ke undefined untuk auto height */
  aspectRatio?: number;
  className?: string;
};

export default function ImagePreview({
  label,
  url,
  aspectRatio = 16 / 9,
  className,
}: ImagePreviewProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  if (!url) return null;

  return (
    <div className={cn("mt-2", className)}>
      <p className="mb-1 text-xs text-muted-foreground">
        Gambar {label} saat ini:
      </p>

      {/* Dengan AspectRatio */}
      {aspectRatio ? (
        <AspectRatio
          ratio={aspectRatio}
          className="overflow-hidden rounded-md border"
        >
          {!loaded && !error && <Skeleton className="h-full w-full" />}
          {!error ? (
            <img
              src={url}
              alt={`Gambar ${label}`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={cn(
                "h-full w-full object-contain",
                loaded ? "opacity-100" : "opacity-0"
              )}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
              Gagal memuat gambar
            </div>
          )}
        </AspectRatio>
      ) : (
        // Tanpa AspectRatio (auto height)
        <div className="overflow-hidden rounded-md border">
          {!loaded && !error && <Skeleton className="h-40 w-full" />}
          {!error ? (
            <img
              src={url}
              alt={`Gambar ${label}`}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={cn(
                "max-h-40 w-full object-contain",
                loaded ? "opacity-100" : "opacity-0"
              )}
            />
          ) : (
            <div className="grid h-40 w-full place-items-center text-xs text-muted-foreground">
              Gagal memuat gambar
            </div>
          )}
        </div>
      )}
    </div>
  );
}
