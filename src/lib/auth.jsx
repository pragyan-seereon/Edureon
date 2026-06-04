import { createContext, useContext, useEffect, useState } from "react";
const Ctx = createContext(null);
const STORAGE_KEY = "scholaris.auth.user";
const titleCase = (s) =>
  s.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // Ignore malformed persisted auth state and continue as signed out.
    }
    setReady(true);
  }, []);
  const persist = (u) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    }
  };
  const value = {
    user,
    ready,
    login: async (email) => {
      await sleep(450);
      // Lookup provisioned user by email
      const { appUsersApi, institutesApi } = await import("./store");
      const matched = appUsersApi
        .list()
        .find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        const inst = institutesApi.get(matched.instituteId);
        const u = {
          id: "u_" + Date.now().toString(36),
          name: matched.name,
          email,
          role: matched.role,
          designation: roleLabel[matched.role],
          phone: matched.phone,
          institute: inst?.name ?? "—",
          joinedAt: "2024-04-01",
        };
        persist(u);
        return u;
      }
      // Fallback: demo personas inferred from email
      const local = email.split("@")[0] || "user";
      const name = titleCase(local) || "Rahul Kapoor";
      const role = local.includes("super")
        ? "super_admin"
        : local.includes("teacher")
          ? "teacher"
          : local.includes("student")
            ? "student"
            : local.includes("parent")
              ? "parent"
              : local.includes("hr")
                ? "hr"
                : local.includes("account")
                  ? "accountant"
                  : "principal";
      const u = {
        id: "u_" + Date.now().toString(36),
        name,
        email,
        role,
        designation: roleLabel[role],
        phone: "+91 98100 12345",
        institute: "Delhi Public School — North",
        bio: "Building a future-ready learning campus with technology.",
        joinedAt: "2024-04-01",
      };
      persist(u);
      return u;
    },
    signup: async ({ name, email, institute }) => {
      await sleep(500);
      const u = {
        id: "u_" + Date.now().toString(36),
        name,
        email,
        role: "admin",
        designation: "Administrator",
        institute: institute || "New Institute",
        phone: "",
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      persist(u);
      return u;
    },
    logout: () => persist(null),
    updateProfile: (patch) => {
      if (!user) return;
      persist({ ...user, ...patch });
    },
    forgotPassword: async () => {
      await sleep(600);
    },
    changePassword: async () => {
      await sleep(450);
    },
    switchRole: (role) => {
      const base = user ?? {
        id: "u_" + Date.now().toString(36),
        name: "Demo User",
        email: "demo@scholaris.app",
        role,
        institute: "Delhi Public School — North",
        joinedAt: "2024-04-01",
      };
      const designation =
        role === "super_admin"
          ? "Platform Owner"
          : role === "principal"
            ? "Principal"
            : role === "teacher"
              ? "Senior Teacher"
              : role === "student"
                ? "Student"
                : role === "parent"
                  ? "Parent"
                  : role === "hr"
                    ? "HR Manager"
                    : role === "accountant"
                      ? "Accountant"
                      : "Administrator";
      persist({ ...base, role, designation });
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
export const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
export const roleLabel = {
  super_admin: "Super Admin",
  admin: "Administrator",
  principal: "Principal",
  teacher: "Teacher",
  accountant: "Accountant",
  hr: "HR Manager",
  parent: "Parent",
  student: "Student",
};
