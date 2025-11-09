import { Outlet } from "react-router-dom";

export default function PendWebLayout() {
  return (
    <div className="min-h-[100svh] flex flex-col overflow-hidden">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 overflow-auto">
        <Outlet />
      </main>
      {/* <BottomNavbar /> */}
    </div>
  );
}
