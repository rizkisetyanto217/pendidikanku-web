import { Badge } from "@/components/ui/badge";

export type BillStatus = "paid" | "overdue" | "pending";

interface Props {
    status: BillStatus;
    className?: string;
}

export default function CBadgeBillStatus({ status, className }: Props) {
    const base = "text-[12px] leading-none"; // font-size default

    if (status === "paid") {
        return (
            <Badge className={`badge-paid ${base} ${className || ""}`}>
                Lunas
            </Badge>
        );
    }

    if (status === "overdue") {
        return (
            <Badge className={`badge-overdue ${base} ${className || ""}`}>
                Terlambat
            </Badge>
        );
    }

    return (
        <Badge className={`badge-pending ${base} ${className || ""}`}>
            Belum Dibayar
        </Badge>
    );
}
