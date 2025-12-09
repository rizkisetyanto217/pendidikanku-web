// src/components/costum/common/CBadgeAssignment.tsx

import { Badge } from "@/components/ui/badge";

export type StatusType =
    | "not_started"
    | "in_progress"
    | "submitted"
    | "graded"
    | "not_graded";

type StatusBadgeProps = {
    status: StatusType;
};

export default function CBadgeAssignment({ status }: StatusBadgeProps) {
    const base = "!text-[12px]"; // force font size 12px

    switch (status) {
        case "not_started":
            return (
                <Badge variant="outline" className={`${base} badge-assignment-not-started`}>
                    Belum Dikumpulkan
                </Badge>
            );

        case "in_progress":
            return (
                <Badge variant="outline" className={`${base} badge-assignment-in-progress`}>
                    Sedang Dikerjakan
                </Badge>
            );

        case "submitted":
            return (
                <Badge variant="outline" className={`${base} badge-assignment-submitted`}>
                    Sudah Dinilai
                </Badge>
            );

        case "graded":
            return (
                <Badge variant="outline" className={`${base} badge-assignment-graded`}>
                    Selesai
                </Badge>
            );

        case "not_graded":
            return (
                <Badge variant="outline" className={`${base} badge-assignment-not-started`}>
                    Belum Dinilai
                </Badge>
            );

        default:
            return null;
    }
}
