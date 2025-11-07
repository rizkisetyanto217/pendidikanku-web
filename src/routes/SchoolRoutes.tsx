import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Pages
import SchoolDashboard from "@/pages/dashboard/school/SchoolMainDashboard";
import SchoolProfile from "@/pages/dashboard/school/profile/SchoolProfile";
import SchoolFinance from "@/pages/dashboard/school/finance/SchoolFinance";
import SchoolDetailBill from "@/pages/dashboard/school/finance/SchoolDetailBill";
import SchoolSpp from "@/pages/dashboard/school/finance/SchoolSpp";
import SchoolTeacher from "@/pages/dashboard/school/teacher/SchoolDashboard";
import SchoolDetailTeacher from "@/pages/dashboard/school/teacher/details/SchoolDetailTeacher";
import SchoolMenuGrids from "@/pages/dashboard/school/menu/SchoolMenuGrids";
import SchoolClass from "@/pages/dashboard/school/class/SchoolClass";
import SchoolSection from "@/pages/dashboard/school/class/section/SchoolSection";
import SchoolSectionDetail from "@/pages/dashboard/school/class/section/SchoolSectionDetail";
import SchoolParent from "@/pages/dashboard/school/class/parent/SchoolParent";
import SchoolAllSchedule from "@/pages/dashboard/school/schedule/SchoolAllSchedule";
import SchoolDetailSchedule from "@/pages/dashboard/school/schedule/SchoolDetailSchedule";
import SchoolAcademic from "@/pages/dashboard/school/academic/SchoolAcademic";
import SchoolDetailAcademic from "@/pages/dashboard/school/academic/SchoolDetailAcademic";
import SchoolManagementAcademicDetail from "@/pages/dashboard/school/academic/SchoolManagementAcademic";
import SchoolBooks from "@/pages/dashboard/school/academic/books/SchoolBooks";
import SchoolRoom from "@/pages/dashboard/school/academic/rooms/SchoolRoom";
import SchoolSubject from "@/pages/dashboard/school/subject/SchoolSubject";
import SchoolDetailRoom from "@/pages/dashboard/school/academic/rooms/SchoolDetailRoom";
import SchoolBookDetail from "@/pages/dashboard/school/academic/books/detail/SchoolDetailBook";
import SchoolActiveClass from "@/pages/dashboard/school/class/active-class/SchoolActiveClass";
import SchoolCalenderAcademic from "@/pages/dashboard/school/calender/SchoolCalenderAcademic";
// import SchoolStudent from "@/pages/pendidikanku-dashboard/dashboard-school/coming-soon/student-(pending)/SchoolStudent";
// import SchoolAllSchedule from "@/pages/pendidikanku-dashboard/dashboard-school/academic/schedule/SchoolAllSchedule";
// import SchoolProfile from "@/pages/pendidikanku-dashboard/dashboard-school/profile/SchoolProfile";
// import SchoolFinance from "@/pages/pendidikanku-dashboard/dashboard-school/finance/SchoolFinance";
// import SchoolDetailBill from "@/pages/pendidikanku-dashboard/dashboard-school/finance/SchoolDetailBill";
// import SchoolTeacher from "@/pages/pendidikanku-dashboard/dashboard-school/teacher/SchoolTeacher";
// import SchoolDetailTeacher from "@/pages/pendidikanku-dashboard/dashboard-school/teacher/components/CSchoolDetailTeacher";
// import SchoolAcademic from "@/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolAcademic";
// import SchoolDetailAcademic from "@/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolDetailAcademic";
// import SchoolManagementAcademic from "@/pages/pendidikanku-dashboard/dashboard-school/academic/SchoolManagementAcademic";
// import SchoolDetailSchedule from "@/pages/pendidikanku-dashboard/dashboard-school/academic/schedule/SchoolDetailSchedule";
// import SchoolAllAnnouncement from "@/pages/pendidikanku-dashboard/dashboard-school/coming-soon/announcement-(pending)/SchoolAllAnnouncement";
// import SchoolClass from "@/pages/pendidikanku-dashboard/dashboard-school/class/SchoolClass";
// import SchoolSection from "@/pages/pendidikanku-dashboard/dashboard-school/class/section/SchoolSection";

// import SchoolAttendance from "@/pages/pendidikanku-dashboard/dashboard-school/coming-soon/attendance-(pending)/SchoolAttendance";
// import SchoolAnnouncement from "@/pages/pendidikanku-dashboard/dashboard-school/coming-soon/announcement-(pending)/SchoolAnnouncement";
// import SchoolBooks from "@/pages/pendidikanku-dashboard/dashboard-school/books/SchoolBooks";
// import SchoolDetailBook from "@/pages/pendidikanku-dashboard/dashboard-school/books/detail/SchoolDetailBook";

// // Menu Utama
// import SchoolMenuGrids from "@/pages/pendidikanku-dashboard/dashboard-school/menu/SchoolMenuGrids";
// import SchoolRoom from "@/pages/pendidikanku-dashboard/dashboard-school/academic/rooms/SchoolRoom";
// import SchoolDetailRoom from "@/pages/pendidikanku-dashboard/dashboard-school/academic/rooms/SchoolDetailRoom";
// import SchoolSpp from "@/pages/pendidikanku-dashboard/dashboard-school/finance/SchoolSpp";
// import SchoolSubject from "@/pages/pendidikanku-dashboard/dashboard-school/subject/SchoolSubject";
// import SchoolCertificate from "@/pages/pendidikanku-dashboard/dashboard-school/academic/certificate/SchoolCertificate";
// import SchoolDetailCertificate from "@/pages/pendidikanku-dashboard/dashboard-school/academic/certificate/components/CSchoolDetailCertificate";
// import CalenderAcademic from "@/pages/pendidikanku-dashboard/dashboard-school/calender/SchoolCalenderAcademic";
// import SchoolStatistik from "@/pages/pendidikanku-dashboard/dashboard-school/coming-soon/statistic-(pending)/SchoolStatistic";
// import SchoolSettings from "@/pages/pendidikanku-dashboard/dashboard-school/coming-soon/settings-(pending)/SchoolSettings";
// import SchoolActiveClass from "@/pages/pendidikanku-dashboard/dashboard-school/class/active-class/SchoolActiveClass";
// import SchoolRoutesPlayground from "@/pages/pendidikanku-dashboard/dashboard-school/SchoolRoutesPlayground";
// import SchoolSectionDetail from "@/pages/pendidikanku-dashboard/dashboard-school/class/section/SchoolSectionDetail";
// import SchoolParent from "@/pages/pendidikanku-dashboard/dashboard-school/class/parent/SchoolParent";
// import SchoolClasses from "@/pages/pendidikanku-dashboard/dashboard-school/class/classes/SchoolClasses";

export const SchoolRoutes = (
  <Route path="sekolah" element={<DashboardLayout />}>
    {/* === Dashboard Utama === */}
    <Route index element={<SchoolDashboard />} />

    {/* === Profil Sekolah === */}
    <Route path="profil-sekolah" element={<SchoolProfile />} />

    {/* === Keuangan === */}
    <Route path="keuangan" element={<SchoolFinance />} />
    {/* Halaman belum bisa */}
    <Route path="keuangan/detail/:id" element={<SchoolDetailBill />} />

    <Route path="spp" element={<SchoolSpp />} />

    {/* === Jadwal === */}
    <Route path="jadwal" element={<SchoolAllSchedule />} />
    <Route
      path="jadwal/detail/:scheduleId"
      element={<SchoolDetailSchedule />}
    />

    {/* === Guru === */}
    <Route path="guru">
      <Route index element={<SchoolTeacher />} />
      <Route path=":id" element={<SchoolDetailTeacher />} />
    </Route>

    <Route path="menu" element={<SchoolMenuGrids />} />

    {/* === Akademik === */}
    <Route path="akademik">
      <Route index element={<SchoolAcademic />} />
      <Route path="detail/:id" element={<SchoolDetailAcademic />} />
      <Route path="kelola" element={<SchoolManagementAcademicDetail />} />
    </Route>

    <Route path="kelas">
      <Route index element={<SchoolClass />} />
      <Route path="kelola/:id" element={<SchoolSection />} />
      <Route path="section/:id" element={<SchoolSectionDetail />} />
      // di file routes dashboard school
      <Route path="tingkat/:levelId" element={<SchoolParent />} />
      <Route path="kelas/:classId" element={<SchoolClass />} />
    </Route>

    {/* === Buku === */}
    <Route path="buku">
      <Route index element={<SchoolBooks />} />
      <Route path="detail/:id" element={<SchoolBookDetail />} />
    </Route>

    {/* === MENU UTAMA === */}
    <Route path="menu-utama">
      <Route index element={<SchoolMenuGrids />} />
      <Route path="profil-sekolah" element={<SchoolProfile showBack />} />
      <Route path="keuangan" element={<SchoolFinance />} />
      <Route path="keuangan/detail/:id" element={<SchoolDetailBill />} />
      <Route path="guru" element={<SchoolTeacher showBack />} />
      {/* <Route path="all-announcement" element={<AllAnnouncement />} /> */}
      <Route path="sekolah" element={<SchoolDashboard showBack />} />
      <Route path="ruangan" element={<SchoolRoom />} />
      <Route path="ruangan/:id" element={<SchoolDetailRoom />} />
      <Route path="spp" element={<SchoolSpp />} />
      <Route path="pelajaran" element={<SchoolSubject />} />
      <Route path="kalender" element={<SchoolCalenderAcademic />} />
      {/* <Route path="statistik" element={<SchoolStatistik />} /> */}
      <Route path="kelas-aktif" element={<SchoolActiveClass />} />
      <Route path="jadwal" element={<SchoolAllSchedule />} />

      <Route path="buku">
        <Route index element={<SchoolBooks />} />
        <Route path="detail/:id" element={<SchoolBookDetail />} />
      </Route>

      <Route path="akademik">
        <Route index element={<SchoolAcademic />} />
        <Route path="detail/:id" element={<SchoolDetailAcademic />} />
        <Route path="kelola" element={<SchoolManagementAcademicDetail />} />
      </Route>
      <Route path="kelas">
        <Route index element={<SchoolClass />} />
        <Route path="kelola/:id" element={<SchoolSection />} />
        <Route path="section/:id" element={<SchoolSectionDetail />} />
        // di file routes dashboard school
        <Route path="tingkat/:levelId" element={<SchoolParent />} />
        <Route path="kelas/:classId" element={<SchoolClass />} />
      </Route>
    </Route>
  </Route>
);
