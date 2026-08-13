import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { GraduationCap, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";
import { initials } from "../lib/auth";
import { navForUser, portalLabelForRole } from "../lib/portal-nav";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAuthorizationContext } from "../api/auth";
import useInstituteStore from "../store/instituteStore";

const getInstituteId = (institute) => institute?.institute_uuid ?? institute?.uuid ?? institute?.id;
const getInstituteName = (institute) => institute?.institute_name ?? institute?.name ?? "Institute";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);
  const [authorizationContext, setAuthorizationContext] = useState(null);
  const activeInstituteId = useInstituteStore((state) => state.activeInstituteId);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const assignedInstitutes = Array.isArray(user?.institutes) ? user.institutes : [];
  const activeInstitute = assignedInstitutes.find(
    (institute) => getInstituteId(institute) === activeInstituteId,
  ) || user?.active_institute;
  const activeInstituteName = activeInstituteId === "__all__"
    ? "All schools"
    : getInstituteName(activeInstitute);

  useEffect(() => {
    let active = true;
    getAuthorizationContext()
      .then((context) => {
        if (!active) return;
        setAuthorizationContext(context);

        // Keep future renders and page reloads in sync with the backend's
        // effective permission calculation, including the SUPER_ADMIN '*'.
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...storedUser,
          role_code: context.role_codes?.[0] || storedUser.role_code,
          role_codes: context.role_codes || storedUser.role_codes,
          permissions: context.permissions || [],
          role_permissions: context.role_permissions || [],
          temporary_permissions: context.temporary_permissions || [],
          override_allowed_permissions: context.override_allowed_permissions || [],
          override_denied_permissions: context.override_denied_permissions || [],
          is_super_admin: context.is_super_admin,
        }));
      })
      .catch(() => {
        // Retain the login response if the context endpoint is temporarily unavailable.
      });
    return () => { active = false; };
  }, [activeInstituteId]);

const role = authorizationContext?.role_codes?.[0] || user?.role_code;

const groups = navForUser(role, {
  permissions: authorizationContext?.permissions ?? user?.permissions,
  rolePermissions: authorizationContext?.role_permissions ?? user?.role_permissions,
  temporaryPermissions: authorizationContext?.temporary_permissions ?? user?.temporary_permissions,
  overrideAllowedPermissions: authorizationContext?.override_allowed_permissions ?? user?.override_allowed_permissions,
  overrideDeniedPermissions: authorizationContext?.override_denied_permissions ?? user?.override_denied_permissions,
});
const portalLabel = portalLabelForRole(role);
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md gradient-primary shadow-sm shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-display font-semibold text-sidebar-foreground truncate">
                EDUREON
              </span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                {portalLabel}
              </span>
              {activeInstituteId !== "__all__" && activeInstitute && (
                <span className="truncate text-[10px] text-sidebar-foreground/60">
                  {activeInstituteName}
                </span>
              )}
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
                {g.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="group/link">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                          {!collapsed && active && (
                            <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Link to="/profile" className="block">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-2 py-2 hover:bg-sidebar-accent rounded-md">
              <Avatar className="h-8 w-8 shrink-0">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground font-semibold">
                  {user ? initials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.name ?? "Guest"}
                </span>
                {/* <span className="text-[10px] text-sidebar-foreground/60 truncate">
                  {user?.designation ?? "—"}
                </span> */}
              </div>
            </div>
          ) : (
            <Avatar className="h-8 w-8 mx-auto">
              {user?.avatar && (
                <AvatarImage src={user.avatar} alt={user.name} />
              )}
              <AvatarFallback className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground font-semibold">
                {user ? initials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
          )}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
