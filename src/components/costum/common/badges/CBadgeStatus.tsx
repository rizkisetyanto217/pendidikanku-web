import { cn } from "@/lib/utils";

export type StatusType = "active" | "inactive" | "pending";

interface CBadgeStatusProps {
    status: StatusType;
    className?: string;
}

const STATUS_MAP: Record<StatusType, string> = {
    active: "badge-info",
    inactive: "badge-neutral",
    pending: "badge-warn",
};

const LABEL_MAP: Record<StatusType, string> = {
    active: "Aktif",
    inactive: "Nonaktif",
    pending: "Pending",
};

export default function CBadgeStatus({ status, className }: CBadgeStatusProps) {
    return (
        <span className={cn("text-xs font-medium", STATUS_MAP[status], className)}>
            {LABEL_MAP[status]}
        </span>
    );
}
