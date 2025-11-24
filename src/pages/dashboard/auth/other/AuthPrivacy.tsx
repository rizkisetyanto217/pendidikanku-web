import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Kalau kamu punya layout publik khusus, bisa di-wrap pakai itu
// import { PublicLayout } from "@/components/layout/PublicLayout";

const LAST_UPDATED = "23 November 2025";

export default function AuthPrivacy() {
  // Optional: set document title
  useEffect(() => {
    document.title = "Kebijakan Privasi – Madinah Salam LMS";
  }, []);

  return (
    // <PublicLayout>  {/* kalau ada */}
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 lg:py-12">
        {/* Header */}
        <header className="space-y-3">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            Kebijakan Privasi
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Kebijakan Privasi Madinah Salam Learning Management System
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Dokumen ini menjelaskan bagaimana kami di{" "}
            <span className="font-medium">Yayasan Madinah Salam</span> mengelola
            dan melindungi data pribadi Anda saat menggunakan{" "}
            <span className="font-medium">
              Madinah Salam Learning Management System (Madinah Salam LMS)
            </span>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Terakhir diperbarui:{" "}
            <span className="font-medium">{LAST_UPDATED}</span>
          </p>
        </header>

        <Separator />

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              1. Pihak yang Bertanggung Jawab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Pengelola data pribadi (data controller) untuk Madinah Salam LMS
              adalah:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium">Yayasan Madinah Salam</span>
              </li>
              <li>Selanjutnya disebut sebagai “kami” atau “Madinah Salam”.</li>
            </ul>
            <p>
              Kebijakan ini berlaku untuk seluruh pengguna Madinah Salam LMS,
              termasuk peserta didik, orang tua/wali, guru, staf yayasan, dan
              pihak lain yang diberikan akses.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              2. Data Apa Saja yang Kami Kumpulkan?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Data yang kami kumpulkan bergantung pada peran dan fitur yang Anda
              gunakan di Madinah Salam LMS. Secara umum, kami dapat mengumpulkan
              kategori data berikut:
            </p>

            <div>
              <p className="font-medium text-foreground">
                a. Data Akun & Identitas
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Nama lengkap</li>
                <li>Alamat email dan/atau nomor telepon</li>
                <li>Username dan kata sandi (disimpan secara terenkripsi)</li>
                <li>
                  Peran di sistem (siswa, orang tua/wali, guru, staf, pengelola
                  yayasan)
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground">
                b. Data Profil & Akademik
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Tanggal lahir (jika diperlukan)</li>
                <li>Data rombel/kelas, mata pelajaran, jadwal belajar</li>
                <li>
                  Nilai, tugas, kuis, kehadiran, dan aktivitas pembelajaran
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground">
                c. Data Transaksi & Pembayaran (jika ada)
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>
                  Informasi tagihan (jenis iuran, nominal, status pembayaran)
                </li>
                <li>Riwayat pembayaran dan metode pembayaran yang digunakan</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-foreground">d. Data Teknis</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Alamat IP, jenis perangkat, jenis browser</li>
                <li>
                  Log aktivitas penggunaan aplikasi (misalnya waktu login, fitur
                  yang diakses)
                </li>
              </ul>
            </div>

            <p className="text-xs">
              Kami tidak meminta data yang tidak relevan dengan proses
              pendidikan dan pengelolaan lembaga, serta berusaha untuk membatasi
              pengumpulan data hanya pada hal-hal yang diperlukan.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              3. Untuk Apa Data Anda Digunakan?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Data Anda kami gunakan untuk keperluan antara lain:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Mengelola akun dan autentikasi pengguna Madinah Salam LMS.
              </li>
              <li>
                Menyediakan fitur pembelajaran, seperti materi, tugas, kuis,
                penilaian, dan laporan belajar.
              </li>
              <li>
                Mengelola administrasi pendidikan, seperti data kelas, jadwal,
                dan kehadiran.
              </li>
              <li>
                Mengelola administrasi keuangan pendidikan (tagihan, pembayaran,
                dan laporan) jika fitur ini digunakan.
              </li>
              <li>
                Meningkatkan kualitas layanan melalui analisis penggunaan sistem
                dan pengembangan fitur.
              </li>
              <li>
                Memenuhi kewajiban hukum dan regulasi yang berlaku di Indonesia.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              4. Dasar Hukum Pemrosesan Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Pemrosesan data pribadi di Madinah Salam LMS dilakukan
              berdasarkan:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Persetujuan pengguna atau orang tua/wali (khususnya bagi
                pengguna yang masih di bawah umur).
              </li>
              <li>
                Kebutuhan pelaksanaan layanan pendidikan dan administrasi di
                bawah naungan Yayasan Madinah Salam.
              </li>
              <li>
                Kewajiban hukum yang berlaku di Republik Indonesia terkait
                perlindungan data dan pendidikan.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              5. Cookies dan Teknologi Serupa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Madinah Salam LMS dapat menggunakan cookies atau teknologi serupa
              untuk:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Menjaga sesi login Anda tetap aktif dan aman.</li>
              <li>Mengingat preferensi tampilan atau pengaturan tertentu.</li>
              <li>
                Menganalisis penggunaan sistem secara umum untuk meningkatkan
                stabilitas dan pengalaman pengguna.
              </li>
            </ul>
            <p className="text-xs">
              Anda dapat mengatur browser untuk menolak cookies, namun beberapa
              bagian sistem mungkin tidak berfungsi dengan optimal.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              6. Berbagi Data dengan Pihak Ketiga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Kami tidak menjual data pribadi Anda kepada pihak manapun. Namun,
              data dapat dibagikan secara terbatas kepada:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Penyedia layanan teknologi (misalnya penyedia server,
                penyimpanan cloud, atau sistem pembayaran) yang bekerjasama
                dengan Yayasan Madinah Salam.
              </li>
              <li>
                Instansi pemerintah atau regulator jika diwajibkan oleh hukum
                yang berlaku.
              </li>
            </ul>
            <p className="text-xs">
              Dalam setiap kerja sama dengan pihak ketiga, kami berupaya
              memastikan adanya perlindungan yang memadai terhadap data pribadi
              Anda.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">7. Keamanan Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Kami menerapkan langkah-langkah keamanan yang wajar untuk
              melindungi data pribadi, termasuk penggunaan enkripsi pada kata
              sandi, pembatasan akses berdasarkan peran, dan pemantauan sistem.
            </p>
            <p>
              Meski demikian, tidak ada sistem yang dapat menjanjikan keamanan
              100%. Oleh karena itu, kami juga mengimbau Anda untuk:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Menjaga kerahasiaan kata sandi dan kredensial login Anda.</li>
              <li>Tidak membagikan akun kepada pihak lain.</li>
              <li>
                Segera menghubungi pengelola jika menduga ada penyalahgunaan
                akun atau pelanggaran keamanan.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              8. Penyimpanan dan Retensi Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Data pribadi Anda disimpan selama:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Diperlukan untuk mendukung proses pendidikan dan administrasi di
                Madinah Salam LMS; dan/atau
              </li>
              <li>
                Diperlukan untuk memenuhi kewajiban hukum, pelaporan, atau
                keperluan arsip lembaga.
              </li>
            </ul>
            <p className="text-xs">
              Setelah data tidak lagi dibutuhkan, kami akan menghapus atau
              melakukan anonimisasi sesuai kebijakan internal dan ketentuan
              peraturan perundang-undangan yang berlaku.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              9. Hak Anda atas Data Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Sesuai prinsip perlindungan data pribadi, Anda (atau orang
              tua/wali bagi pengguna di bawah umur) memiliki hak untuk:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Meminta akses terhadap data pribadi yang tersimpan di sistem.
              </li>
              <li>
                Meminta perbaikan apabila terdapat data yang tidak akurat atau
                tidak lengkap.
              </li>
              <li>
                Meminta penghapusan data tertentu dalam batas yang diperbolehkan
                oleh hukum dan kebijakan pendidikan yayasan.
              </li>
              <li>
                Menarik persetujuan pemrosesan data (dengan konsekuensi tertentu
                terhadap akses layanan).
              </li>
            </ul>
            <p className="text-xs">
              Permohonan hak di atas dapat diajukan melalui kontak resmi Yayasan
              Madinah Salam sebagaimana tercantum di bawah.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">10. Anak di Bawah Umur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Banyak pengguna Madinah Salam LMS merupakan peserta didik yang
              masih di bawah umur. Oleh karena itu:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Pendaftaran akun dan pengelolaan data dapat dilakukan melalui
                lembaga (sekolah/madrasah) dan/atau orang tua/wali.
              </li>
              <li>
                Orang tua/wali berhak untuk mengetahui dan meminta penjelasan
                terkait data anak yang disimpan dan digunakan di sistem.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              11. Perubahan Kebijakan Privasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Kebijakan Privasi ini dapat diperbarui dari waktu ke waktu untuk
              menyesuaikan dengan perkembangan layanan atau ketentuan hukum yang
              berlaku.
            </p>
            <p>
              Tanggal pembaruan terakhir akan selalu dicantumkan di bagian atas
              dokumen ini. Kami menganjurkan pengguna untuk meninjau halaman ini
              secara berkala.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-background shadow-sm mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">12. Kontak Kami</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Jika Anda memiliki pertanyaan, permintaan, atau keluhan terkait
              data pribadi dan penggunaan Madinah Salam LMS, silakan
              menghubungi:
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
              Mohon mengganti placeholder di atas dengan informasi kontak resmi
              Yayasan Madinah Salam sebelum halaman ini dipublikasikan kepada
              pengguna.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    // </PublicLayout>
  );
}
