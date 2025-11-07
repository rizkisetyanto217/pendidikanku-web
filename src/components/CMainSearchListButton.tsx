import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search as SearchIcon, Plus } from "lucide-react";

type CMainSearchListButtonProps = {
    /* 🔎 Search */
    searchValue: string;
    onSearchChange: (val: string) => void;
    searchPlaceholder?: string;

    /* 📜 List per halaman (optional) */
    showListSelect?: boolean;
    listOptions?: number[];
    listValue?: number;
    onListChange?: (val: number) => void;

    /* ➕ Tombol aksi (optional) */
    showButton?: boolean;
    buttonLabel?: string;
    onButtonClick?: () => void;
    buttonIcon?: React.ReactNode;
};

/**
 * Komponen toolbar dengan search (wajib), list (opsional), dan button (opsional)
 * — digunakan di halaman seperti daftar buku, daftar siswa, dll.
 */
export const CMainSearchListButton: React.FC<CMainSearchListButtonProps> = ({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Cari...",
    showListSelect = false,
    listOptions = [10, 20, 50, 100],
    listValue,
    onListChange,
    showButton = false,
    buttonLabel = "Tambah",
    onButtonClick,
    buttonIcon = <Plus className="h-4 w-4" />,
}) => {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* 🔎 Search Input */}
            <div className="relative flex-1">
                <Input
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9"
                />
                <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* 📜 Select list halaman (opsional) */}
            {showListSelect && onListChange && (
                <Select
                    value={String(listValue ?? listOptions[0])}
                    onValueChange={(v) => onListChange(Number(v))}
                >
                    <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Per halaman" />
                    </SelectTrigger>
                    <SelectContent>
                        {listOptions.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {n} / hal
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* ➕ Tombol Aksi (opsional) */}
            {showButton && (
                <Button className="gap-1" onClick={onButtonClick}>
                    {buttonIcon}
                    {buttonLabel}
                </Button>
            )}
        </div>
    );
};

export default CMainSearchListButton;
