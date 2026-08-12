import { Building2, ChevronRight, MapPin } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { portalHomeForRole } from "../lib/portal-nav";
import { getAuthorizationContext, selectInstitute } from "../api/auth";
import useAuthStore from "../store/authStore";
import useInstituteStore from "../store/instituteStore";
import { toast } from "sonner";
import { useState } from "react";

export default function InstituteSelection() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const institutes = Array.isArray(user?.institutes) && user.institutes.length > 0
    ? user.institutes
    : user?.active_institute ? [user.active_institute] : [];
  const [selectingMembership, setSelectingMembership] = useState("");

  const enterInstitute = async (institute) => {
    if (!user || !institute) return;
    setSelectingMembership(institute.membership_uuid);

    try {
      const result = await selectInstitute({
        membershipUuid: institute.membership_uuid,
        instituteUuid: institute.institute_uuid,
      });
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);

      let authorizationContext = {};
      try {
        authorizationContext = await getAuthorizationContext();
      } catch {
        // The selection response is a safe fallback for older API versions.
      }

      const primaryRole = authorizationContext.role_codes?.[0] || result.role_codes?.[0] || institute.roles?.[0]?.role_code || user.role_code || user.role;
      const selectedUser = {
        ...user,
        role: primaryRole,
        role_code: primaryRole,
        role_codes: authorizationContext.role_codes || result.role_codes || institute.roles?.map((role) => role.role_code) || user.role_codes || [primaryRole],
        permissions: authorizationContext.permissions || result.permissions || [],
        role_permissions: authorizationContext.role_permissions || [],
        temporary_permissions: authorizationContext.temporary_permissions || [],
        override_allowed_permissions: authorizationContext.override_allowed_permissions || [],
        override_denied_permissions: authorizationContext.override_denied_permissions || [],
        selected_institute_uuid: result.institute_uuid || institute.institute_uuid,
        active_institute: {
          ...institute,
          institute_uuid: result.institute_uuid || institute.institute_uuid,
          institute_name: result.institute_name || institute.institute_name,
          membership_uuid: result.membership_uuid || institute.membership_uuid,
        },
      };

      localStorage.setItem("user", JSON.stringify(selectedUser));
      localStorage.setItem("scholaris.auth.user", JSON.stringify(selectedUser));
      localStorage.setItem("active_institute_uuid", selectedUser.selected_institute_uuid);
      useAuthStore.getState().setInstituteUUID(selectedUser.selected_institute_uuid);
      useInstituteStore.getState().setActiveInstitute(selectedUser.selected_institute_uuid);
      navigate(portalHomeForRole(primaryRole));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to select this institute");
    } finally {
      setSelectingMembership("");
    }
  };

  if (!user || institutes.length === 0) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-muted/30 px-5 py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Choose your institute</h1>
          <p className="mt-2 text-sm text-muted-foreground">Select an institute to open the workspace assigned to you.</p>
        </div>

        <div
          className={
            institutes.length === 1
              ? "mx-auto max-w-md"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center"
          }
        >
          {institutes.map((institute) => {
            const roleNames = institute.roles?.map((role) => role.role_name || role.role_code).filter(Boolean).join(", ");
            const selecting = selectingMembership === institute.membership_uuid;

            return (
              <Card
                key={institute.membership_uuid || institute.institute_uuid}
                className="w-full max-w-md border-border/70 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col items-center gap-5 p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="truncate text-lg font-semibold">{institute.institute_name || "Institute"}</div>
                    {institute.city && (
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{institute.city}</span>
                      </div>
                    )}
                    {roleNames && (
                      <div className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {roleNames}
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full gap-1.5"
                    onClick={() => enterInstitute(institute)}
                    disabled={Boolean(selectingMembership)}
                  >
                    {selecting ? "Opening…" : "Continue to workspace"}
                    {!selecting && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
