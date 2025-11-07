import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type CButtonAllUnderlineProps = {
    /** Label teks tombol (default: "Lihat Semua") */
    label?: string;
    /** Path tujuan navigasi */
    to: string;
    /** Ukuran ikon (default: 14) */
    iconSize?: number;
    /** Tambahan className opsional */
    className?: string;
};

/**
 * 🔗 CButtonAllUnderline
 * Tombol kecil bergaris bawah dengan ikon ArrowRight — cocok untuk aksi "Lihat Semua".
 * Menggunakan React Router `useNavigate` agar navigasi tanpa reload halaman.
 */
export default function CButtonAllUnderline({
    label = "Lihat Semua",
    to,
    iconSize = 14,
    className = "",
}: CButtonAllUnderlineProps) {
    const navigate = useNavigate();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(to)}
            className={`inline-flex items-center gap-1 text-sm ${className}`}
        >
            {label}
            <ArrowRight size={iconSize} />
        </Button>
    );
}
