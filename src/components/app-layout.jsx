import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AppSidebar } from "./app-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { SidebarProvider } from "./ui/sidebar";
import { Topbar } from "./topbar";
import { Toaster } from "./ui/sonner";
import { requiresInstituteSelection } from "../lib/institute-selection";
import useInstituteStore from "../store/instituteStore";
import useSessionStore from "../store/sessionStore";

// import { useAuth } from "../lib/auth";

const publicPaths = [
  "/login",
  "/admin/login",
  "/teacher/login",
  "/instute/login",
  "/signup",
  "/forgot-password",
];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading workspace...
      </div>
    </div>
  );
}

export function AppLayout() {
const user = JSON.parse(localStorage.getItem("user"));
const ready = true;
  const { pathname } = useLocation();
  const activeInstituteId = useInstituteStore((state) => state.activeInstituteId);
  const sessionYear = useSessionStore((state) => state.sessionYear);

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }

  if (pathname === "/select-institute") {
    if (!user) return <Navigate to="/login" replace />;
    return <><Outlet /><Toaster /></>;
  }

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiresInstituteSelection(user) && !user.selected_institute_uuid) {
    return <Navigate to="/select-institute" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="min-w-0 flex-1 pb-16 md:pb-0">
            {/* Recreate the active page when the global institute or session
                changes so every page reruns its initial data loaders. */}
            <div key={`${activeInstituteId}:${sessionYear}`} className="min-h-full">
              <Outlet />
            </div>
          </main>
        </div>

        <MobileBottomNav />
      </div>

      <Toaster />
    </SidebarProvider>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1>404 Page Not Found</h1>
    </div>
  );
}
