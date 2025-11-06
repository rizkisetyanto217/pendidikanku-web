import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Pages
import SchoolDashboard from "@/pages/dashboard/school/SchoolMainDashboard";
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
  </Route>
);
