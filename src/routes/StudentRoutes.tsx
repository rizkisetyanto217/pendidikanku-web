// import { Route } from "react-router-dom";
// import DashboardLayout from "@/layout/CDashboardLayout";
// import StudentDashboard from "@/pages/pendidikanku-dashboard/dashboard-student/StudentMainDashboard";
// import StudentProgressDetail from "@/pages/pendidikanku-dashboard/dashboard-student/progress/StudentProgress";
// import StudentAllSchedule from "@/pages/pendidikanku-dashboard/dashboard-student/academic/book/StudentAllSchedule";
// import StudentProfil from "@/pages/pendidikanku-dashboard/dashboard-student/profil/StudentProfil";
// import StudentAssignmentClass from "@/pages/pendidikanku-dashboard/dashboard-student/assignment/StudentAssignmentClass";
// import StudentDetailSchedule from "@/pages/pendidikanku-dashboard/dashboard-student/academic/schedule/StudentDetailSchedule";
// import StudentAnnouncements from "@/pages/pendidikanku-dashboard/dashboard-student/announcement/StudentAnnouncement";

// import StudentRaport from "@/pages/pendidikanku-dashboard/dashboard-student/progress/raport/StudentRaport";

// import StudentFInance from "@/pages/pendidikanku-dashboard/dashboard-student/finance/StudentFinance";
// import StudentSchedule from "@/pages/pendidikanku-dashboard/dashboard-student/schedule/StudentSchedule";
// import StudentListFinance from "@/pages/pendidikanku-dashboard/dashboard-student/finance/StudentListFinance";

// import StudentAbsence from "@/pages/pendidikanku-dashboard/dashboard-student/progress/absence/StudentAbsence";
// import StudentNotesSummary from "@/pages/pendidikanku-dashboard/dashboard-student/progress/notes-summary/StudentNotesSummary";
// import StudentMenuGrids from "@/pages/pendidikanku-dashboard/dashboard-student/menu/StudentMenuGrids";
// import StudentMyClass from "@/pages/pendidikanku-dashboard/dashboard-student/class/StudentMyClass";
// import StudentMaterial from "@/pages/pendidikanku-dashboard/dashboard-student/class/StudentMaterial";
// import StudentQuizPage from "@/pages/pendidikanku-dashboard/dashboard-student/class/StudentQuizPage";
// import StudentAttandenceClass from "@/pages/pendidikanku-dashboard/dashboard-student/class/StudentAttandenceClass";
// import StudentCertificate from "@/pages/pendidikanku-dashboard/dashboard-student/certificate/StudentCertificate";
// import StudentRoutesPlayground from "@/pages/pendidikanku-dashboard/dashboard-student/StudentRoutesPlayground";

// // ======================
// // Routing untuk halaman MURID (Student Dashboard)
// // ======================

// export const StudentRoutes = (
//   // Route utama: semua path di bawah "/murid"
//   <Route path="murid" element={<DashboardLayout />}>
//     {/* =====================
//         DASHBOARD UTAMA
//     ===================== */}
//     {/* Halaman utama dashboard murid */}
//     <Route index element={<StudentDashboard />} />

//     {/* =====================
//         PROGRESS AKADEMIK
//     ===================== */}
//     {/* Detail perkembangan belajar murid */}
//     <Route path="progress" element={<StudentProgressDetail />} />
//     {/* Halaman raport */}
//     <Route path="progress/raport" element={<StudentRaport />} />
//     {/* Halaman absensi */}
//     <Route path="progress/absensi" element={<StudentAbsence />} />
//     {/* Halaman catatan hasil belajar */}
//     <Route path="progress/catatan-hasil" element={<StudentNotesSummary />} />

//     {/* =====================
//         JADWAL & DETAILNYA
//     ===================== */}
//     {/* Halaman semua jadwal */}
//     <Route path="jadwal" element={<StudentAllSchedule />} />
//     {/* Detail jadwal tertentu berdasarkan ID */}
//     <Route path="semua-jadwal/:id" element={<StudentDetailSchedule />} />
//     {/* Jadwal utama (khusus tampilan kelas saya / tab jadwal) */}
//     <Route path="jadwal" element={<StudentSchedule />} />

//     {/* =====================
//         PROFIL & MENU LAINNYA
//     ===================== */}
//     {/* Profil murid */}
//     <Route path="profil-murid" element={<StudentProfil />} />
//     {/* Detail umum murid */}

//     {/* =====================
//         TUGAS / ASSIGNMENT
//     ===================== */}
//     {/* Daftar tugas */}
//     <Route path="tugas" element={<StudentAssignmentClass />} />

//     {/* =====================
//         KEUANGAN / TAGIHAN
//     ===================== */}
//     {/* Halaman keuangan ringkas */}
//     <Route path="keuangan" element={<StudentFInance />} />
//     {/* Daftar seluruh tagihan */}
//     <Route path="keuangan-list" element={<StudentListFinance />} />
//     {/* Detail tagihan berdasarkan ID */}

//     {/* =====================
//         MENU UTAMA KELAS SAYA
//     ===================== */}
//     <Route path="menu-utama">
//       {/* Halaman utama menu grid murid */}
//       <Route index element={<StudentMenuGrids />} />

//       {/* Halaman daftar kelas */}
//       <Route path="kelas-saya" element={<StudentMyClass />} />

//       {/* Halaman keuangan ringkas */}
//       <Route path="keuangan" element={<StudentFInance />} />

//       {/* Jadwal utama (khusus tampilan kelas saya / tab jadwal) */}
//       <Route path="jadwal" element={<StudentSchedule />} />

//       {/* Detail per kelas (dengan dynamic :id) */}
//       <Route path="kelas-saya/:id/materi" element={<StudentMaterial />} />
//       <Route path="kelas-saya/:id/tugas" element={<StudentAssignmentClass />} />
//       <Route path="kelas-saya/:id/quiz" element={<StudentQuizPage />} />
//       <Route
//         path="kelas-saya/:id/kehadiran"
//         element={<StudentAttandenceClass />}
//       />

//       {/* Profil murid dari menu utama */}
//       <Route path="profil-murid" element={<StudentProfil />} />

//       {/* Sertifikat murid (sementara dinonaktifkan)
//       <Route path="sertifikat-murid" element={<StudentCertificate />} /> */}
//     </Route>

//     {/* =====================
//         PENGUMUMAN (sementara dinonaktifkan)
//     ===================== */}
//     {/* <Route path="announcements" element={<AnnouncementsStudent />} />
//     <Route path="announcements/:id" element={<DetailAnnouncementStudent />} /> */}
//     {/* <Route path="pengumuman">
//       <Route index element={<StudentAnnouncement />} />
//       <Route path="detail/:id" element={<StudentDetailAnnouncement />} />
//     </Route> */}
//     <Route path="dev/semua-link" element={<StudentRoutesPlayground />} />
//   </Route>
// );
