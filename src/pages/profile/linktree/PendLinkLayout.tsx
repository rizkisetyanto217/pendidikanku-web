// src/layouts/SchoolLayout.tsx
import { Outlet } from "react-router-dom";

export default function PendLinkLayout() {
  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* konten scrollable */}
      <div className="mx-auto w-full max-w-2xl px-4 md:px-6">
        <div className="pt-4 pb-24">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
