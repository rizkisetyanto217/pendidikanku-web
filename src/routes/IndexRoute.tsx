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
import PendWebHome from "@/pages/profile/website/website/PendWebHome";
import PendWebTutorial from "@/pages/profile/website/website/tutorial/PendWebTutorial";
import PendWebFeature from "@/pages/profile/website/website/pages/navbar-page/PendWebFeature";
import PendWebAbout from "@/pages/profile/website/website/pages/navbar-page/PendWebAbout";
import PendWebContact from "@/pages/profile/website/website/pages/navbar-page/PendWebContact";
import PendWebSupportUs from "@/pages/profile/website/website/support-us/PendWebSupportUs";
import PendWebPMBInfo from "@/pages/dashboard/registration/PendWebPMBInfo";

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
          <Route index element={<PendWebHome />} />

          {/* Kalau mau tetap ada /:school_slug/website juga */}
          <Route path="website" element={<PendWebHome />} />

          <Route path="website/dukungan" element={<PendWebSupportUs />} />
          <Route path="website/panduan" element={<PendWebTutorial />} />
          <Route path="website/fitur" element={<PendWebFeature />} />
          <Route path="website/about" element={<PendWebAbout />} />
          <Route path="website/hubungi-kami" element={<PendWebContact />} />
        </Route>

        {/* ---------- Public PMB sekolah ---------- */}
        <Route path="pmb" element={<PendWebPMBInfo />} />

        {/* ---------- Auth per-tenant ---------- */}
        <Route path="login" element={<Login />} />
        {/* Kalau register juga mau per sekolah */}
        <Route path="register" element={<Register />} />

        {/* ---------- Protected (dashboard dsb) ---------- */}
        <Route element={<ProtectedRoute />}>
          {/* Guru: /:school_slug/guru/... */}
          <Route
            element={<RequireschoolRoles allow={["teacher", "admin", "dkm"]} />}
          >
            {TeacherRoutes}
          </Route>

          {/* Murid: /:school_slug/santri/... */}
          <Route
            element={<RequireschoolRoles allow={["student", "admin", "dkm"]} />}
          >
            {StudentRoutes}
          </Route>

          {/* Sekolah/Manajemen: /:school_slug/admin/... */}
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
          Global (tanpa slug) – opsional
          Bisa dipakai buat 404 global
         ================================ */}
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
