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
import TeacherClass from "@/pages/dashboard/teacher/class/TeacherClass";
import TeacherSubjects from "@/pages/dashboard/teacher/teacher-subject/TeacherSubjects";
import TeacherSchedule from "@/pages/dashboard/teacher/schedule/TeacherSchedule";
import TeacherClassAttendance from "@/pages/dashboard/teacher/class/attendance/TeacherClassAttendance";
import TeacherClassAttendanceDetail from "@/pages/dashboard/teacher/class/attendance/TeacherClassAttendanceDetail";
import TeacherProfil from "@/pages/dashboard/teacher/profil/TeacherProfil";
import TeacherGrading from "@/pages/dashboard/teacher/grade/TeacherGrade";
import TeacherDetailGrading from "@/pages/dashboard/teacher/grade/TeacherDetailGrading";
import TeacherDetailClass from "@/pages/dashboard/teacher/class/TeacherDetailClass";
import TeacherAssignmentClass from "@/pages/dashboard/teacher/class/asssigment/TeacherAssignmentClass";
import TeacherManagementClass from "@/pages/dashboard/teacher/class/management/TeacherManagementClass";
import TeacherDetailClassQuiz from "@/pages/dashboard/teacher/class/TeacherDetailClassQuiz";

// import TeacherClassDetail from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/TeacherDetailClasses";
// import TeacherSettings from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/settings/TeacherSettings";
// import TeacherAssignment from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/assignments/TeacherAssignment";
// import TeacherCertificate from "@/pages/pendidikanku-dashboard/dashboard-teacher/menu/certificate/TeacherCertificate";
// import TeacherRoutesPlayground from "@/pages/pendidikanku-dashboard/dashboard-teacher/TeacherRoutesPlayground";

export const TeacherRoutes = (
  <Route path="guru" element={<DashboardLayout />}>
    {/* Dashboard */}
    <Route index element={<TeacherDashboard />} />

    {/* Kehadiran */}
    <Route path="kehadiran">
      <Route index element={<TeacherClassAttendance />} />
      <Route path="detail" element={<TeacherClassAttendanceDetail />} />
    </Route>

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
      <Route path="tugas" element={<TeacherAssignmentClass />} />
      {/* <Route path="sertifikat" element={<TeacherCertificate />} /> */}
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
    <Route path="penilaian">
      <Route index element={<TeacherGrading />} />
      <Route path="detail" element={<TeacherDetailGrading />} />
    </Route>

    {/* Kelas */}
    <Route path="kelas">
      <Route index element={<TeacherClass />} />
      <Route path=":id" element={<TeacherDetailClass />} />
      <Route path=":id/absensi" element={<TeacherClassAttendance />} />
      <Route path=":id/tugas" element={<TeacherAssignmentClass />} />
    </Route>

    <Route path="kelola-kelas/:name" element={<TeacherManagementClass />} />
    <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />

    {/* Guru Mapel */}
    <Route path="guru-mapel">
      <Route index element={<TeacherSubjects />} />
    </Route>

    {/* Jadwal */}
    <Route path="jadwal" element={<TeacherSchedule />} />
  </Route>
);
