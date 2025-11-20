// src/routes/IndexRoute.tsx

import { Routes, Route } from "react-router-dom";

import Unauthorized from "@/pages/UnAuthorized";
import NotFound from "@/pages/NotFound";

import { SchoolRoutes } from "./SchoolRoutes";
import Login from "@/pages/dashboard/auth/AuthLogin";
import Forbidden403 from "@/pages/Forbidden403";
import Register from "@/pages/dashboard/auth/AuthRegister";
import { TeacherRoutes } from "./TeacherRoutes";
import { StudentRoutes } from "./StudentRoutes";
import ProtectedRoute from "./ProtectedRoutes";
import RequireschoolRoles from "./RequireSchoolRoles";
import PendWebLayout from "@/components/layout/CPendWebLayout";
// import PendWebHome from "@/pages/profile/website/website/PendWebHome";
// import PendWebTutorial from "@/pages/profile/website/website/tutorial/PendWebTutorial";
// import PendWebFeature from "@/pages/profile/website/website/pages/navbar-page/PendWebFeature";
// import PendWebAbout from "@/pages/profile/website/website/pages/navbar-page/PendWebAbout";
// import PendWebContact from "@/pages/profile/website/website/pages/navbar-page/PendWebContact";
// import PendWebSupportUs from "@/pages/profile/website/website/support-us/PendWebSupportUs";

import { RegistrationRoutes } from "./RegistrationRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================================
          GROUP: Semua berbasis :school_slug
         ================================ */}
      <Route path=":school_slug">
        {/* ---------- Public website per sekolah ---------- */}
        <Route element={<PendWebLayout />}>
          {/* /:school_slug → landing website sekolah */}
          <Route index element={<Login />} />

          {/* <Route index element={<PendWebHome />} /> */}

          {/* alias /:school_slug/website */}
          {/* <Route path="website" element={<PendWebHome />} />
          <Route path="website/dukungan" element={<PendWebSupportUs />} />
          <Route path="website/panduan" element={<PendWebTutorial />} />
          <Route path="website/fitur" element={<PendWebFeature />} />
          <Route path="website/about" element={<PendWebAbout />} />
          <Route path="website/hubungi-kami" element={<PendWebContact />} /> */}
        </Route>

        {/* ---------- Auth per-tenant ---------- */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* ---------- Protected (dashboard dsb) ---------- */}
        <Route element={<ProtectedRoute />}>
          {/* Guru: /:school_slug/guru/... */}

          {/* ---------- Public PMB / Pendaftaran sekolah ---------- */}
          {RegistrationRoutes}

          <Route
            element={<RequireschoolRoles allow={["teacher", "admin", "dkm"]} />}
          >
            {TeacherRoutes}
          </Route>

          {/* Murid: /:school_slug/murid/... */}
          <Route
            element={<RequireschoolRoles allow={["student", "admin", "dkm"]} />}
          >
            {StudentRoutes}
          </Route>

          {/* Sekolah/Manajemen: /:school_slug/sekolah/... */}
          <Route element={<RequireschoolRoles allow={["admin", "dkm"]} />}>
            {SchoolRoutes}
          </Route>
        </Route>

        {/* ---------- Error page dalam konteks sekolah ---------- */}
        <Route path="forbidden" element={<Forbidden403 />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="not-found" element={<NotFound />} />
      </Route>

      {/* ================================
          Global (tanpa slug)
         ================================ */}
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
