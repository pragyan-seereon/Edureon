import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AppSidebar } from "./app-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { SidebarProvider } from "./ui/sidebar";
import { Topbar } from "./topbar";
import { Toaster } from "./ui/sonner";

import { useAuth } from "../lib/auth";

const publicPaths = [
  "/login",
  "/admin/login",
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
  const { user, ready } = useAuth();
  const { pathname } = useLocation();

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

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="min-w-0 flex-1 pb-16 md:pb-0">
            <Outlet />
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
