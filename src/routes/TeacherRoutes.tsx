// src/routes/TeacherRoutes.tsx
import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Dashboard & Profil
import TeacherDashboard from "@/pages/dashboard/teacher/TeacherMainDashboard";
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

// Menu utama guru
import TeacherMenuGrids from "@/pages/dashboard/teacher/menu/TeacherMenuGrids";
import TeacherClass from "@/pages/dashboard/teacher/csst/TeacherClass";
import TeacherSubjects from "@/pages/dashboard/teacher/class/TeacherSubjects";
import TeacherSchedule from "@/pages/dashboard/teacher/schedule/TeacherSchedule";

import TeacherProfil from "@/pages/dashboard/teacher/profil/TeacherProfil";

import TeacherDetailClass from "@/pages/dashboard/teacher/csst/details/TeacherDetailClass";

import TeacherManagementClass from "@/pages/dashboard/teacher/csst/management/TeacherManagementClass";
import TeacherDetailClassQuiz from "@/pages/dashboard/teacher/csst/TeacherDetailClassQuiz";
import TeacherClassStudentsList from "@/pages/dashboard/teacher/csst/menu/student/TeacherClassStudentList";
import TeacherClassStudentAttendanceList from "@/pages/dashboard/teacher/csst/menu/attendance/TeacherClassStudentAttendanceList";
import TeacherMaterialList from "@/pages/dashboard/teacher/csst/menu/TeacherMaterialList";
import TeacherExamList from "@/pages/dashboard/teacher/csst/menu/exam/TeacherExamList";
import TeacherBookList from "@/pages/dashboard/teacher/csst/menu/book/TeacherBookList";
import TeacherDetailClassStudent from "@/pages/dashboard/teacher/csst/menu/student/TeacherDetailClassStudent";
import TeacherDetailBook from "@/pages/dashboard/teacher/csst/menu/book/TeacherDetailBook";
import TeacherClassAttendance from "@/pages/dashboard/teacher/csst/menu/attendance/TeacherClassAttandence";
import TeacherAssignment from "@/pages/dashboard/teacher/csst/menu/assignment/TeacherAssignment";
import TeacherDetailAssignement from "@/pages/dashboard/teacher/csst/menu/assignment/TeacherDetailAssignment";

// import TeacherClassDetail from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/TeacherDetailClasses";
// import TeacherSettings from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/settings/TeacherSettings";
// import TeacherAssignment from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/assignments/TeacherAssignment";
// import TeacherCertificate from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/certificate/TeacherCertificate";
// import TeacherRoutesPlayground from "@/pages/pendidikanku-dashboard/dashboard-teacher/TeacherRoutesPlayground";

export const TeacherRoutes = (
  <Route path="guru" element={<DashboardLayout />}>
    {/* Dashboard */}
    <Route index element={<TeacherDashboard />} />

    {/* Menu Utama Guru */}
    <Route path="menu-utama">
      <Route index element={<TeacherMenuGrids />} />
      <Route path="kelas">
        <Route index element={<TeacherClass />} />
        <Route path=":id" element={<TeacherDetailClass />} />
      </Route>
      <Route path="guru-mapel">
        <Route index element={<TeacherSubjects />} />
      </Route>
      <Route path="jadwal" element={<TeacherSchedule />} />
      <Route path="profil-guru" element={<TeacherProfil />} />
      {/* <Route path="pengaturan" element={<TeacherSettings />} /> */}
      <Route path="tugas" element={<TeacherAssignment />} />
      {/* <Route path="sertifikat" element={<TeacherCertificate />} /> */}
      <Route path="kehadiran" element={<TeacherClassAttendance />} />
      <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />
    </Route>
    <Route path="kelas">
      <Route index element={<TeacherClass />} />
      {/* <Route path=":id" element={<TeacherDetailClass />} /> */}
      <Route path="guru-mapel">
        <Route index element={<TeacherSubjects />} />
      </Route>
      <Route path="jadwal" element={<TeacherSchedule />} />
    </Route>

    {/* Profil & Penilaian */}
    <Route path="profil-guru" element={<TeacherProfil />} />

    {/* Wali Kelas */}
    <Route path="wali-kelas">
      <Route index element={<TeacherClass />} />
    </Route>

    <Route path="kelola-kelas/:name" element={<TeacherManagementClass />} />
    <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />

    {/* Guru Mapel */}
    <Route path="guru-mapel">
      <Route index element={<TeacherSubjects />} />
      <Route path=":id" element={<TeacherDetailClass />} />
      <Route path=":id/absensi-hari-ini" element={<TeacherClassAttendance />} />
      <Route path=":id/quiz" element={<TeacherDetailClassQuiz />} />
      <Route path=":id/semua-siswa" element={<TeacherClassStudentsList />} />
      <Route
        path=":id/semua-siswa/:id"
        element={<TeacherDetailClassStudent />}
      />
      <Route path=":id/tugas" element={<TeacherAssignment />} />
      <Route path=":id/tugas/detail" element={<TeacherDetailAssignement />} />
      <Route
        path=":id/semua-kehadiran"
        element={<TeacherClassStudentAttendanceList />}
      />
      <Route path=":id/materi" element={<TeacherMaterialList />} />
      <Route path=":id/ujian" element={<TeacherExamList />} />
      <Route path=":id/buku" element={<TeacherBookList />} />
      <Route path=":id/buku/:bookId" element={<TeacherDetailBook />} />
    </Route>

    {/* Jadwal */}
    <Route path="jadwal" element={<TeacherSchedule />} />
  </Route>
);
