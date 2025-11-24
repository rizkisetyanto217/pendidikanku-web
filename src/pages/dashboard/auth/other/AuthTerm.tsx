
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const LAST_UPDATED = "23 November 2025";

export default function AuthTerm() {
  useEffect(() => {
    document.title = "Syarat & Ketentuan – Madinah Salam LMS";
  }, []);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 lg:py-12">
        {/* Header */}
        <header className="space-y-3">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            Syarat & Ketentuan
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Syarat dan Ketentuan Penggunaan Madinah Salam Learning Management
            System
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Halaman ini menjelaskan syarat dan ketentuan penggunaan{" "}
            <span className="font-medium">
              Madinah Salam Learning Management System (Madinah Salam LMS)
            </span>
            yang dikelola oleh{" "}
            <span className="font-medium">Yayasan Madinah Salam</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Terakhir diperbarui:{" "}
            <span className="font-medium">{LAST_UPDATED}</span>
          </p>
        </header>

        <Separator />

        {/* 1. Penerimaan Ketentuan */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">1. Penerimaan Ketentuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Dengan mengakses dan/atau menggunakan Madinah Salam LMS, Anda
              menyatakan telah membaca, memahami, dan menyetujui untuk terikat
              pada Syarat dan Ketentuan ini, serta Kebijakan Privasi yang
              berlaku.
            </p>
            <p>
              Jika Anda tidak setuju dengan salah satu bagian dari Syarat dan
              Ketentuan ini, maka Anda tidak diperkenankan untuk menggunakan
              Madinah Salam LMS.
            </p>
            <p className="text-xs">
              Bagi pengguna yang masih di bawah umur, penggunaan sistem ini
              diasumsikan berada di bawah sepengetahuan dan tanggung jawab orang
              tua/wali serta lembaga pendidikan terkait.
            </p>
          </CardContent>
        </Card>

        {/* 2. Definisi */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">2. Definisi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">“Madinah Salam LMS”</span> adalah
                sistem manajemen pembelajaran yang digunakan untuk mendukung
                proses pendidikan dan administrasi di bawah naungan Yayasan
                Madinah Salam.
              </li>
              <li>
                <span className="font-medium">“Pengguna”</span> adalah setiap
                individu yang mengakses atau menggunakan Madinah Salam LMS,
                termasuk peserta didik, orang tua/wali, guru, staf, dan
                pengelola yayasan.
              </li>
              <li>
                <span className="font-medium">“Akun”</span> adalah kredensial
                akses (username/email dan kata sandi) yang digunakan untuk masuk
                ke Madinah Salam LMS.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. Pendaftaran & Akun Pengguna */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              3. Pendaftaran dan Akun Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Beberapa fitur Madinah Salam LMS hanya dapat diakses melalui
                akun yang terdaftar dan diverifikasi oleh lembaga/yayasan.
              </li>
              <li>
                Anda berkewajiban memberikan informasi yang benar, akurat, dan
                terkini saat proses pendaftaran atau pembaruan data.
              </li>
              <li>
                Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata
                sandi, serta atas semua aktivitas yang terjadi melalui akun
                Anda.
              </li>
              <li>
                Kami berhak membatasi, menangguhkan, atau menonaktifkan akun
                jika ditemukan pelanggaran terhadap ketentuan yang berlaku atau
                indikasi penyalahgunaan sistem.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 4. Penggunaan yang Diperbolehkan */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              4. Penggunaan yang Diperbolehkan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Madinah Salam LMS hanya boleh digunakan untuk tujuan:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>kegiatan pembelajaran dan pengajaran,</li>
              <li>pengelolaan administrasi pendidikan,</li>
              <li>
                komunikasi internal antara peserta didik, orang tua/wali, guru,
                dan pengelola lembaga,
              </li>
              <li>
                pengelolaan administrasi keuangan pendidikan (jika fitur
                tersebut diaktifkan oleh lembaga).
              </li>
            </ul>
            <p className="text-xs">
              Setiap penggunaan di luar tujuan pendidikan dan pengelolaan
              lembaga harus mendapatkan persetujuan tertulis dari Yayasan
              Madinah Salam.
            </p>
          </CardContent>
        </Card>

        {/* 5. Larangan Penggunaan */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">5. Larangan Penggunaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Pengguna dilarang untuk:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Menggunakan Madinah Salam LMS untuk tujuan yang melanggar hukum,
                merugikan, menipu, atau bertentangan dengan norma dan nilai
                keislaman yang dijunjung yayasan.
              </li>
              <li>
                Mengunggah, membagikan, atau menyebarkan konten yang mengandung
                ujaran kebencian, pornografi, kekerasan berlebihan, SARA, atau
                konten lain yang tidak pantas.
              </li>
              <li>
                Mencoba mengakses data atau akun milik pengguna lain tanpa hak
                yang sah (hacking, cracking, atau bentuk penyalahgunaan akses
                lainnya).
              </li>
              <li>
                Mengganggu atau mengakibatkan gangguan pada operasi teknis
                sistem, misalnya dengan menyebarkan virus, malware, atau
                aktivitas serangan siber lainnya.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 6. Konten Pengguna */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">6. Konten Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Beberapa fitur memungkinkan pengguna mengunggah atau menginput
                konten (misalnya jawaban tugas, materi pembelajaran, atau
                pesan).
              </li>
              <li>
                Pengguna bertanggung jawab penuh atas konten yang diunggah dan
                menjamin bahwa konten tersebut tidak melanggar hak pihak
                manapun.
              </li>
              <li>
                Dengan mengunggah konten ke Madinah Salam LMS, pengguna
                memberikan hak non-eksklusif kepada yayasan dan lembaga untuk
                menggunakan konten tersebut sebatas diperlukan untuk kegiatan
                pembelajaran dan administrasi.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. Pembayaran & Tagihan (jika fitur digunakan) */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              7. Pembayaran dan Tagihan (Jika Berlaku)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Jika Madinah Salam LMS digunakan untuk mengelola tagihan dan
              pembayaran pendidikan:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Nominal, jenis iuran, dan jadwal pembayaran diatur oleh
                lembaga/yayasan sesuai kebijakan internal.
              </li>
              <li>
                Informasi terkait jatuh tempo, status pembayaran, dan riwayat
                transaksi akan ditampilkan melalui akun yang terkait.
              </li>
              <li>
                Integrasi dengan penyedia layanan pembayaran (jika ada) tunduk
                pada syarat dan ketentuan penyedia layanan tersebut.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 8. Hak Kekayaan Intelektual */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              8. Hak Kekayaan Intelektual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Seluruh desain, logo, nama sistem, kode program, dan elemen lain
                yang terkait dengan Madinah Salam LMS merupakan hak milik
                Yayasan Madinah Salam dan/atau pihak pengembang yang bekerja
                sama.
              </li>
              <li>
                Pengguna tidak diperkenankan menyalin, memodifikasi,
                mendistribusikan, atau merekayasa-balik (reverse engineering)
                sistem tanpa izin tertulis.
              </li>
              <li>
                Hak kekayaan intelektual atas materi pembelajaran dapat dimiliki
                oleh guru/penyusun materi dan/atau lembaga sesuai kebijakan
                internal.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 9. Batasan Tanggung Jawab */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              9. Batasan Tanggung Jawab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Madinah Salam LMS disediakan sebagaimana adanya (“as is”) untuk
              mendukung proses pendidikan. Kami berupaya menjaga sistem tetap
              stabil dan aman, namun:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Kami tidak menjamin bahwa sistem akan selalu bebas dari
                gangguan, kesalahan, atau keterlambatan akses yang disebabkan
                faktor teknis maupun non-teknis.
              </li>
              <li>
                Kami tidak bertanggung jawab atas kerugian tidak langsung,
                kehilangan data, atau kerusakan yang timbul dari penggunaan atau
                ketidakmampuan menggunakan sistem, sejauh diizinkan oleh hukum
                yang berlaku.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 10. Penghentian Akses */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">10. Penghentian Akses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Kami berhak membatasi atau menghentikan akses pengguna ke
                Madinah Salam LMS jika terdapat pelanggaran terhadap Syarat dan
                Ketentuan ini, indikasi penipuan, atau penyalahgunaan sistem.
              </li>
              <li>
                Penghentian akses bisa bersifat sementara atau permanen, sesuai
                tingkat pelanggaran dan kebijakan lembaga.
              </li>
              <li>
                Pengguna dapat mengajukan klarifikasi kepada pihak
                lembaga/yayasan apabila merasa terjadi kesalahan dalam
                penonaktifan akses.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 11. Perubahan Ketentuan */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              11. Perubahan Syarat dan Ketentuan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Syarat dan Ketentuan ini dapat diperbarui dari waktu ke waktu
              untuk menyesuaikan dengan perkembangan layanan, kebijakan internal
              yayasan, atau ketentuan hukum yang berlaku.
            </p>
            <p>
              Tanggal pembaruan terakhir akan selalu dicantumkan di bagian atas
              halaman ini. Penggunaan berkelanjutan terhadap sistem setelah
              adanya perubahan dianggap sebagai bentuk persetujuan Anda terhadap
              perubahan tersebut.
            </p>
          </CardContent>
        </Card>

        {/* 12. Hukum yang Berlaku */}
        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">12. Hukum yang Berlaku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum
              yang berlaku di Republik Indonesia. Setiap perselisihan yang
              timbul sehubungan dengan penggunaan Madinah Salam LMS akan
              diupayakan penyelesaiannya secara musyawarah melalui
              lembaga/yayasan terlebih dahulu, sebelum menempuh jalur lain yang
              diatur oleh peraturan perundang-undangan.
            </p>
          </CardContent>
        </Card>

        {/* 13. Kontak */}
        <Card className="border-none bg-background shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">13. Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Untuk pertanyaan lebih lanjut terkait Syarat dan Ketentuan ini,
              silakan menghubungi:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Yayasan Madinah Salam</li>
              <li>
                Email: <span className="font-mono">[isi-email-resmi]</span>
              </li>
              <li>
                No. Telepon:{" "}
                <span className="font-mono">[isi-nomor-resmi]</span>
              </li>
              <li>
                Alamat: <span className="font-mono">[isi-alamat-yayasan]</span>
              </li>
            </ul>
            <p className="text-xs">
              Mohon mengganti placeholder di atas dengan data resmi yayasan
              sebelum halaman ini digunakan secara publik.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
