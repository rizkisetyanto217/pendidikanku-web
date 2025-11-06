//src/routes/IndexRoute.tsx

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import Unauthorized from "@/pages/UnAuthorized";
import NotFound from "@/pages/NotFound";

// Layout & Pages
// import PendWebLayout from "@/layout/CPendWebLayout";
// import PendWebHome from "@/pages/pendidikanku-profile/website/PendWebHome";
// import Registerschool from "@/pages/pendidikanku-dashboard/auth/register/RegisterSchool";
// import RegisterUser from "@/pages/pendidikanku-dashboard/auth/register/RegisterUser";
// import SupportPage from "@/pages/pendidikanku-profile/website/website/pages/navbar-page/PendWebSupport";
// import Panduan from "@/pages/pendidikanku-profile/website/website/pages/navbar-page/PendWebGuide";
// import Fitur from "@/pages/pendidikanku-profile/website/website/pages/navbar-page/PendWebFeature";
// import About from "@/pages/pendidikanku-profile/website/website/pages/navbar-page/PendWebAbout";
// import Contact from "@/pages/pendidikanku-profile/website/website/pages/navbar-page/PendWebContact";

// import schoolLayout from "@/pages/pendidikanku-profile/linktree/PendLinkLayout";
// import PendLinkTree from "@/pages/pendidikanku-profile/linktree/PendLinkTreeHome";
// import schoolQuizLectureSessions from "@/pages/pendidikanku-dashboard/quizzes/TeacherschoolQuizLectureSessions";
// import schoolResultQuizLectureSessions from "@/pages/pendidikanku-dashboard/quizzes/TeacherschoolResultQuizLectureSessions";

// import { TeacherRoutes } from "./TeacherRoutes";
// import { StudentRoutes } from "./StudentRoutes";
import { SchoolRoutes } from "./SchoolRoutes";
import Login from "@/pages/dashboard/auth/Login";
import Forbidden403 from "@/pages/Forbidden403";
import RequireschoolRoles from "./RequireSchoolRoles";
import Register from "@/pages/dashboard/auth/Register";
import SchoolMainDashboard from "@/pages/dashboard/school/SchoolMainDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Public schoolku --- */}
      {/* <Route element={<PendWebLayout />}>
        <Route index element={<PendWebHome />} />
        <Route path="website" element={<PendWebHome />} />
        <Route path="website/dukungan" element={<SupportPage />} />
        <Route path="website/panduan" element={<Panduan />} />
        <Route path="website/fitur" element={<Fitur />} />
        <Route path="website/about" element={<About />} />
        <Route path="website/hubungi-kami" element={<Contact />} />
      </Route> */}

      {/* --- Public Auth --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/registeri" element={<Register />} />

      {/* --- LinkTree --- */}
      {/* <Route path="/" element={<PendWebLayout />}>
        <Route path="school/:slug" index element={<PendLinkTree />} />
        <Route path="school/:slug">
          <Route path="login" element={<Login />} />
          <Route path="login/:id" element={<RegisterAdminMasji />} />
          <Route path="register-school" element={<RegisterAdminschool />} />
          <Route
            path="soal-materi/:lecture_session_slug/latihan-soal"
            element={<schoolQuizLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/latihan-soal/hasil"
            element={<schoolResultQuizLectureSessions />}
          />
        </Route>
      </Route> */}

      {/* --- Protected (dengan schoolId) --- */}
      {/* Ganti :schoolId -> :schoolId agar konsisten */}
      {/* --- Protected (dengan schoolId) --- */}
      {/* Ganti :schoolId -> :schoolId agar konsisten */}
      <Route path=":schoolId" element={<ProtectedRoute />}>
        {/* ===== Guru cluster: hanya teacher/admin/dkm ===== */}
        {/* <Route
          element={<RequireschoolRoles allow={["teacher", "admin", "dkm"]} />}
        >
          {TeacherRoutes}
        </Route> */}

        {/* ===== Murid cluster: student/admin/dkm ===== */}
        {/* <Route
          element={<RequireschoolRoles allow={["student", "admin", "dkm"]} />}
        >
          {StudentRoutes}
        </Route> */}

        {/* ===== Sekolah/Manajemen: admin/dkm ===== */}
        <Route element={<RequireschoolRoles allow={["admin", "dkm"]} />}>
          {SchoolRoutes}
        </Route>
      </Route>

      <Route path="/main-dashboard" element={<SchoolMainDashboard />} />
      {/* --- Forbidden harus di atas wildcard --- */}
      <Route path=":schoolId/forbidden" element={<Forbidden403 />} />

      {/* --- 404 & Unauthorized --- */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
