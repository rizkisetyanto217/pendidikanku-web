// // src/routes/TeacherRoutes.tsx
// import { Route, Navigate } from "react-router-dom";
// import DashboardLayout from "@/layout/CDashboardLayout";

// // Dashboard & Profil
// import TeacherDashboard from "@/pages/pendidikanku-dashboard/dashboard-teacher/TeacherMainDashboard";
// import TeacherProfil from "@/pages/pendidikanku-dashboard/dashboard-teacher/profil/TeacherProfil";

// // Attendance
// import TeacherAttendance from "@/pages/pendidikanku-dashboard/dashboard-teacher/attendance/TeacherAttendance";
// import TeacherAttendanceDetail from "@/pages/pendidikanku-dashboard/dashboard-teacher/attendance/components/CTeacherAttendanceDetail";

// // Grading
// import TeacherGrading from "@/pages/pendidikanku-dashboard/dashboard-teacher/grade/TeacherGrade";
// import TeacherDetailGrading from "@/pages/pendidikanku-dashboard/dashboard-teacher/grade/CTeacherDetailGrading";

// // Class & Assignments
// import TeacherClass from "@/pages/pendidikanku-dashboard/dashboard-teacher/class/TeacherClass";
// import TeacherDetailClass from "@/pages/pendidikanku-dashboard/dashboard-teacher/class/TeacherDetailClass";
// import TeacherClassAttandence from "@/pages/pendidikanku-dashboard/dashboard-teacher/attendance/TeacherClassAttandence";
// import TeacherAssignmentClass from "@/pages/pendidikanku-dashboard/dashboard-teacher/asssigment/TeacherAssignmentClass";


// import TeacherManagementClass from "@/pages/pendidikanku-dashboard/dashboard-teacher/class/TeacherManagementClass";
// import TeacherDetailClassQuiz from "@/pages/pendidikanku-dashboard/dashboard-teacher/class/TeacherDetailClassQuiz";
// import TeacherAllAssignment from "@/pages/pendidikanku-dashboard/dashboard-teacher/asssigment/TeacherAllAssignment";

// // Schedule
// import TeacherSchedule from "@/pages/pendidikanku-dashboard/dashboard-teacher/schedule/TeacherSchedule";
// import TeacherScheduleThreeDays from "@/pages/pendidikanku-dashboard/dashboard-teacher/schedule/components/CTeacherScheduleThreeDays";
// import TeacherDetailScheduleThreeDays from "@/pages/pendidikanku-dashboard/dashboard-teacher/schedule/TeacherDetailScheduleThreeDays";
// import TeacherScheduleSevenDays from "@/pages/pendidikanku-dashboard/dashboard-teacher/schedule/components/CTeacherScheduleSevenDays";
// import TeacherDetailScheduleSevenDays from "@/pages/pendidikanku-dashboard/dashboard-teacher/schedule/TeacherDetailScheduleSevenDays";

// // Menu utama guru
// import TeacherMenuGrids from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/TeacherMenuGrids";

// import TeacherClassDetail from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/TeacherDetailClasses";
// import TeacherSettings from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/settings/TeacherSettings";
// import TeacherAssignment from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/assignments/TeacherAssignment";
// import TeacherCertificate from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/certificate/TeacherCertificate";
// import TeacherSubjectsList from "@/pages/pendidikanku-dashboard/dashboard-teacher/TeacherSubject/TeacherSubjects";
// import TeacherRoutesPlayground from "@/pages/pendidikanku-dashboard/dashboard-teacher/TeacherRoutesPlayground";

// export const TeacherRoutes = (
//   <Route path="guru" element={<DashboardLayout />}>
//     {/* Dashboard */}
//     <Route index element={<TeacherDashboard />} />

//     {/* Kehadiran */}
//     <Route path="kehadiran">
//       <Route index element={<TeacherAttendance />} />
//       <Route path="detail" element={<TeacherAttendanceDetail />} />
//     </Route>

//     {/* Profil & Penilaian */}
//     <Route path="profil-guru" element={<TeacherProfil />} />
//     <Route path="penilaian">
//       <Route index element={<TeacherGrading />} />
//       <Route path="detail" element={<TeacherDetailGrading />} />
//     </Route>

//     {/* Pengumuman */}
//     {/* <Route path="pengumuman" element={<TeacherAnnouncements />} />
//     <Route path="all-announcement-teacher">
//       <Route index element={<AllAnnouncementTeacher />} />
//       <Route path="detail" element={<DetailAnnouncementTeacher />} />
//     </Route> */}

//     {/* Jadwal */}
//     <Route path="jadwal" element={<TeacherSchedule />} />
//     <Route path="schedule-3-hari">
//       <Route index element={<TeacherScheduleThreeDays />} />
//       <Route path=":scheduleId" element={<TeacherDetailScheduleThreeDays />} />
//     </Route>
//     <Route path="schedule-seven-days">
//       <Route index element={<TeacherScheduleSevenDays />} />
//       <Route path=":scheduleId" element={<TeacherDetailScheduleSevenDays />} />
//     </Route>
//     <Route
//       path="schedule-seven-days/*"
//       element={<Navigate to="../schedule-seven-days" replace />}
//     />

//     {/* Kelas */}
//     <Route path="kelas">
//       <Route index element={<TeacherClass />} />
//       <Route path=":id" element={<TeacherDetailClass />} />
//       <Route path=":id/absensi" element={<TeacherClassAttandence />} />
//       <Route path=":id/tugas" element={<TeacherAssignmentClass />} />


//     </Route>

//     {/* Tugas & Manajemen */}
//     <Route path="tugas">
//       <Route index element={<TeacherAllAssignment />} />
//     </Route>

//     <Route path="kelola-kelas/:name" element={<TeacherManagementClass />} />
//     <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />

//     {/* Menu Utama Guru */}
//     <Route path="menu-utama">
//       <Route index element={<TeacherMenuGrids />} />
//       <Route path="kelas">
//         <Route index element={<TeacherClass />} />
//         <Route path=":id" element={<TeacherDetailClass />} />
//       </Route>
//       <Route path="guru-mapel">
//         <Route index element={<TeacherSubjectsList />} />
//       </Route>
//       <Route path="jadwal" element={<TeacherSchedule showBack />} />
//       <Route path="profil-guru" element={<TeacherProfil />} />
//       <Route path="pengaturan" element={<TeacherSettings />} />
//       <Route path="tugas" element={<TeacherAssignment />} />
//       {/* <Route path="sertifikat" element={<TeacherCertificate />} /> */}
//     </Route>

//     {/* Guru Mapel */}
//     <Route path="guru-mapel">
//       <Route index element={<TeacherSubjectsList />} />
//     </Route>
//     <Route path="dev/semua-link" element={<TeacherRoutesPlayground />} />
//   </Route>
// );
