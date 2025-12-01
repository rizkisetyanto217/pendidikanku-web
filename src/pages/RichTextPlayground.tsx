// src/pages/RichTextPlayground.tsx
import { useEffect, useMemo, useState } from "react";

import {
    htmlToPlainText,
    RichTextInput,
} from "@/components/costum/CRichTextEditor";

/* shadcn/ui */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

/* Optional: kalau di dalam dashboard Madinah Salam */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

export function RichTextPlayground() {
    const [value, setValue] = useState<string>("");

    // Optional dashboard header (kalau hook ini ada)
    let setHeader:
        | ((cfg: { title: string; description?: string }) => void)
        | undefined;
    try {
        const header = useDashboardHeader();
        setHeader = header?.setHeader;
    } catch {
        // ignore kalau dipakai di luar layout dashboard
    }

    useEffect(() => {
        setHeader?.({
            title: "Rich Text Playground",
            description:
                "Halaman khusus untuk menguji semua fitur RichTextInput: bold, list, warna, link, RTL, dan lainnya.",
        });
    }, [setHeader]);

    const plainText = useMemo(() => htmlToPlainText(value), [value]);

    const stats = useMemo(() => {
        const text = plainText;
        const length = text.length;
        const wordCount = text
            ? text.trim().split(/\s+/).filter(Boolean).length
            : 0;

        return { length, wordCount };
    }, [plainText]);

    const loadSampleIndo = () => {
        setValue(
            [
                `<h2>Contoh soal rich text</h2>`,
                `<p>Ini contoh paragraf <strong>teks tebal</strong>, <em>miring</em>, dan <u>garis bawah</u>.</p>`,
                `<p>Shortcut list:</p>`,
                `<ul>`,
                `<li>Ketik <code>-</code> lalu spasi untuk bullet list</li>`,
                `<li>Ketik <code>1.</code> lalu spasi untuk numbered list</li>`,
                `</ul>`,
                `<blockquote>Ini contoh blockquote. Tekan Enter saat di dalam blockquote untuk keluar ke paragraf baru.</blockquote>`,
                `<p><a href="https://pendidikanku.id" target="_blank" rel="noreferrer">Contoh link eksternal</a></p>`,
            ].join("")
        );
    };

    const loadSampleArabicRtl = () => {
        setValue(
            [
                `<p dir="rtl" style="text-align: right;">`,
                `هذا نص <strong>تجريبي</strong> لخاصية الكتابة من اليمين إلى اليسار.`,
                `</p>`,
                `<p dir="rtl" style="text-align: right;">`,
                `يمكنك استخدام زر <strong>AR</strong> في toolbar لتفعيل وضع RTL.`,
                `</p>`,
            ].join("")
        );
    };

    const clearContent = () => setValue("");

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        Rich Text Playground
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Uji semua fitur <code>RichTextInput</code>: bold, heading, list,
                        warna teks, highlight, link, RTL, dan shortcut keyboard.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={clearContent}>
                        Kosongkan
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadSampleIndo}>
                        Muat contoh (Indonesia)
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadSampleArabicRtl}>
                        Muat contoh (Arab / RTL)
                    </Button>
                </div>
            </div>

            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <span>Editor</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">
                                Karakter: {stats.length.toLocaleString("id-ID")}
                            </Badge>
                            <Badge variant="outline">
                                Kata: {stats.wordCount.toLocaleString("id-ID")}
                            </Badge>
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <RichTextInput
                        value={value}
                        onChange={setValue}
                        placeholder="Tulis teks di sini, lalu coba bold, list, warna, link, RTL, dll..."
                        className="min-h-[120px]"
                    />

                    <div className="text-[11px] text-muted-foreground space-y-1">
                        <p className="font-medium">Catatan pengujian cepat:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            <li>
                                <span className="font-mono">-</span> + spasi → bullet list,
                                <span className="font-mono"> 1.</span> + spasi → numbered list.
                            </li>
                            <li>
                                Di dalam blockquote, tekan Enter (tanpa Shift) → keluar ke
                                paragraf baru.
                            </li>
                            <li>
                                Pilih teks lalu tekan tombol <strong>Link</strong> untuk tambah
                                / edit / hapus link.
                            </li>
                            <li>
                                Gunakan tombol <strong>AR</strong> untuk mengaktifkan mode RTL
                                (teks Arab).
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preview & Debug</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="rendered" className="space-y-3">
                        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                            <TabsTrigger value="rendered">Rendered HTML</TabsTrigger>
                            <TabsTrigger value="html">Raw HTML</TabsTrigger>
                            <TabsTrigger value="plaintext">Plain text</TabsTrigger>
                        </TabsList>

                        <Separator />

                        {/* Rendered */}
                        <TabsContent value="rendered" className="mt-0">
                            <div className="text-xs text-muted-foreground mb-1">
                                Preview persis seperti yang akan dirender di halaman lain.
                            </div>
                            <ScrollArea className="border rounded-md p-3 h-[220px] bg-background">
                                {value ? (
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: value }}
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        (Belum ada konten)
                                    </p>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        {/* Raw HTML */}
                        <TabsContent value="html" className="mt-0">
                            <div className="text-xs text-muted-foreground mb-1">
                                Cek apakah tag HTML, span styling, link, dan list sesuai
                                harapan.
                            </div>
                            <ScrollArea className="border rounded-md p-3 h-[220px] bg-muted/40">
                                <pre className="text-xs whitespace-pre-wrap break-all font-mono">
                                    {value || "(kosong)"}
                                </pre>
                            </ScrollArea>
                        </TabsContent>

                        {/* Plain text */}
                        <TabsContent value="plaintext" className="mt-0">
                            <div className="text-xs text-muted-foreground mb-1">
                                Hasil konversi ke plain text via <code>htmlToPlainText</code>.
                            </div>
                            <ScrollArea className="border rounded-md p-3 h-[220px] bg-muted/40">
                                <pre className="text-xs whitespace-pre-wrap break-all font-mono">
                                    {plainText || "(kosong)"}
                                </pre>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default RichTextPlayground;