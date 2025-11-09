// src/components/common/main/ShimmerImage.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export type ShimmerImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  shimmerClassName?: string;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDoubleClick?: (e: React.MouseEvent | React.TouchEvent) => void;

  /** ====== penambahan opsional (non-breaking) ====== */
  /** rasio 16/9, 1, 4/3, dll; kalau undefined, tinggi auto */
  aspectRatio?: number;
  /** "cover" (default) atau "contain" */
  objectFit?: "cover" | "contain";
  /** rounded + border bawaan */
  rounded?: boolean;
  bordered?: boolean;
  /** loading hint bawaan browser */
  loading?: "lazy" | "eager";
  /** tampilkan placeholder teks saat error */
  errorPlaceholderText?: string;
};

export default function ShimmerImage({
  src,
  alt = "image",
  className,
  style,
  shimmerClassName,
  onClick,
  onDoubleClick,

  aspectRatio,
  objectFit = "cover",
  rounded = true,
  bordered = false,
  loading = "lazy",
  errorPlaceholderText = "Gagal memuat gambar",
}: ShimmerImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  // double-tap mobile
  const lastTapRef = React.useRef<number | null>(null);
  const doubleTapDelay = 300;
  const handleTouchEnd = (e: React.TouchEvent<HTMLImageElement>) => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < doubleTapDelay) {
      e.preventDefault();
      onDoubleClick?.(e);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  };

  const commonWrapperCls = cn(
    "relative overflow-hidden bg-card",
    rounded && "rounded-md",
    bordered && "border",
    className
  );

  const commonImgCls = cn(
    "h-full w-full transition-opacity duration-300",
    objectFit === "cover" ? "object-cover" : "object-contain",
    loaded ? "opacity-100" : "opacity-0",
    (onClick || onDoubleClick) && "cursor-pointer"
  );

  const shimmer = (
    <Skeleton
      className={cn("absolute inset-0 h-full w-full", shimmerClassName)}
    />
  );

  const errored = (
    <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
      {errorPlaceholderText}
    </div>
  );

  const imgEl =
    !error && src ? (
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        onClick={(e) => onClick?.(e)}
        onDoubleClick={(e) => {
          e.preventDefault();
          onDoubleClick?.(e);
        }}
        onTouchEnd={handleTouchEnd}
        className={commonImgCls}
        style={style}
      />
    ) : (
      errored
    );

  if (aspectRatio) {
    return (
      <div className={commonWrapperCls} style={style}>
        <AspectRatio ratio={aspectRatio}>
          {!loaded && !error && shimmer}
          {imgEl}
        </AspectRatio>
      </div>
    );
  }

  return (
    <div className={commonWrapperCls} style={style}>
      <div className="relative h-full w-full">
        {!loaded && !error && (
          <div className="h-40 w-full">
            {/* tinggi default saat tanpa ratio */}
            <Skeleton className="absolute inset-0 h-full w-full" />
          </div>
        )}
        {imgEl}
      </div>
    </div>
  );
}
