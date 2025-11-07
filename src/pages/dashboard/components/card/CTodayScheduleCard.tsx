import { Card } from "@/components/ui/card";
import CButtonAllUnderline from "@/components/CButtonAllUnderline";
import { CalendarDays } from "lucide-react";
import { CMainTitleIcon } from "@/components/CMainTitleIcon";

export type ScheduleItem = {
    id: string;
    title: string;
    subject: string;
    teacher: string;
    time: string;
};

type TodayScheduleCardProps = {
    title?: string;
    items: ScheduleItem[];
    seeAllPath?: string;
    maxItems?: number;
};

export default function TodayScheduleCard({
    title = "Jadwal Hari Ini",
    items,
    seeAllPath,
    maxItems = 3,
}: TodayScheduleCardProps) {
    const visibleItems = items.slice(0, maxItems);

    return (
        <Card className="p-4 border border-border bg-card text-card-foreground">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <CMainTitleIcon
                    icon={<CalendarDays size={18} />}
                    title={title}
                    size="md"
                />
                {seeAllPath && <CButtonAllUnderline to={seeAllPath} />}
            </div>

            {/* Isi Jadwal */}
            {visibleItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Tidak ada jadwal hari ini.
                </p>
            ) : (
                <div className="space-y-3">
                    {visibleItems.map((s) => (
                        <div
                            key={s.id}
                            className="border-b pb-2 last:border-b-0 text-sm flex flex-col gap-1"
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{s.title}</p>
                                <span className="text-xs text-muted-foreground">{s.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Guru: {s.teacher}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
