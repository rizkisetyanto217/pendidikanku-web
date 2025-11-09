// src/components/common/BorderLine.tsx
import * as React from "react";
import { Separator } from "@/components/ui/separator";

/** Opsi tambahan biar fleksibel tapi tetap simple */
type Orientation = "horizontal" | "vertical";

interface BorderLineProps {
  className?: string;
  style?: React.CSSProperties;
  /** default: horizontal */
  orientation?: Orientation;
  /** default spacing: my-6 — bisa override */
  spacingClassName?: string;
  /** kalau true, kasih inset kecil ala list divider */
  inset?: boolean;
}

const BorderLine: React.FC<BorderLineProps> = ({
  className = "",
  style,
  orientation = "horizontal",
  spacingClassName = "my-6",
  inset = false,
}) => {
  return (
    <Separator
      orientation={orientation}
      decorative
      className={[
        // pakai token shadcn: warna ikut theme (light/dark)
        "bg-border",
        // default spacing
        spacingClassName,
        // inset opsional (horizontal aja yang relevan)
        inset && orientation === "horizontal" ? "ml-4" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    />
  );
};

export default BorderLine;
