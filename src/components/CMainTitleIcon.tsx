import React from "react";

/* ==============================
   Tipe props komponen
============================== */
type CMainTitleIconProps = {
    title: string;                // teks judul
    icon?: React.ReactNode;       // icon opsional (bisa kirim komponen icon)
    size?: "sm" | "md" | "lg";    // ukuran font
    className?: string;           // opsional tambahan styling
};

/* ==============================
   Mapping ukuran teks
============================== */
const sizeClasses = {
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-lg font-semibold",
};

/* ==============================
   Komponen utama
============================== */
export const CMainTitleIcon: React.FC<CMainTitleIconProps> = ({
    title,
    icon,
    size = "md",
    className = "",
}) => {
    const sizeClass = sizeClasses[size];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {icon && <span className="text-primary">{icon}</span>}
            <h2 className={sizeClass}>{title}</h2>
        </div>
    );
};
