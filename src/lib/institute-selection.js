const INSTITUTE_SELECTION_EXEMPT_ROLES = new Set([
  "SUPERADMIN",
  "SUPER_ADMIN",
  "SUPER ADMIN",
  "STUDENT",
  "PARENT",
]);

export function requiresInstituteSelection(user) {
  const role = String(user?.role_code || user?.role || "").toUpperCase();
  return Boolean(user) && !user.is_super_admin && !INSTITUTE_SELECTION_EXEMPT_ROLES.has(role);
}
