// src/pages/sekolahislamku/announcement/CTeacherAddEditAnnouncement.tsx
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type TeacherAnnouncementForm = {
    id?: string;
    title: string;
    date: string; // ISO (YYYY-MM-DDT00:00:00Z)
    body: string;
    themeId?: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    initial?: TeacherAnnouncementForm | null; // jika ada => mode Edit
    onSubmit: (v: TeacherAnnouncementForm) => void;
    saving?: boolean;
    error?: string | null;
};

const isoToInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");
const inputToIsoUTC = (ymd: string) =>
    ymd ? new Date(`${ymd}T00:00:00.000Z`).toISOString() : "";

export default function CTeacherAddEditAnnouncement({
    open,
    onClose,
    initial,
    onSubmit,
    saving,
    error,
}: Props) {
    const isEdit = !!initial?.id;

    const [title, setTitle] = useState("");
    const [dateYmd, setDateYmd] = useState("");
    const [body, setBody] = useState("");
    const [themeId, setThemeId] = useState("");

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTitle(initial.title ?? "");
            setDateYmd(isoToInput(initial.date));
            setBody(initial.body ?? "");
            setThemeId(initial.themeId ?? "");
        } else {
            setTitle("");
            setDateYmd("");
            setBody("");
            setThemeId("");
        }
    }, [open, initial]);

    const disabled = saving || !title.trim() || !dateYmd;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-xl p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>
                        {isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}
                    </DialogTitle>
                    <DialogDescription>
                        Isi informasi pengumuman di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <Card className="border-0 shadow-none">
                    <CardContent className="p-4 md:p-6 grid gap-4">
                        {/* Judul */}
                        <div className="grid gap-1">
                            <label className="text-sm text-muted-foreground">Judul</label>
                            <Input
                                placeholder="Judul pengumuman"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Tanggal */}
                        <div className="grid gap-1">
                            <label className="text-sm text-muted-foreground">Tanggal</label>
                            <Input
                                type="date"
                                value={dateYmd}
                                onChange={(e) => setDateYmd(e.target.value)}
                            />
                        </div>

                        {/* Isi */}
                        <div className="grid gap-1">
                            <label className="text-sm text-muted-foreground">Isi</label>
                            <Textarea
                                rows={5}
                                placeholder="Konten pengumuman"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        {/* Tombol */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={!!saving}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() =>
                                    onSubmit({
                                        id: initial?.id,
                                        title: title.trim(),
                                        date: inputToIsoUTC(dateYmd),
                                        body: body.trim(),
                                        themeId: (themeId || "").trim() || undefined,
                                    })
                                }
                                disabled={disabled}
                            >
                                {saving ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
