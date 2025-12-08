import { Badge } from "@/components/ui/badge";

export type AssignmentStatus =
    | "not_started"
    | "in_progress"
    | "submitted"
    | "graded";

export default function CBadgeAssignment({ status }: { status: AssignmentStatus }) {
    const isSubmitted = status === "submitted" || status === "graded";

    return isSubmitted ? (
        <Badge
            variant="outline"
            className="border-emerald-500/60 bg-emerald-500/5 text-emerald-500 dark:text-emerald-300 text-[12px]"
        >
            Selesai
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="border-red-400/60 bg-red-500/5 text-red-500 dark:text-red-300 text-[12px]"
        >
            Belum Dikumpulkan
        </Badge>
    );
}
