// src/components/costum/common/CMenuSearch.tsx

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type CMenuSearchProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export default function CMenuSearch({
    value,
    onChange,
    placeholder = "Cari...",
    className,
}: CMenuSearchProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-2 border rounded-xl px-4 py-2 bg-background shadow-sm w-full sm:w-auto",
                className
            )}
        >
            <Search size={18} className="text-muted-foreground" />

            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-transparent outline-none text-sm w-full"
            />
        </div>
    );
}
