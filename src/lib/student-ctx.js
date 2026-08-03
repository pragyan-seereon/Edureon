/* eslint-disable react-hooks/preserve-manual-memoization */
import { useMemo } from "react";
import { useAuth } from "./auth";
import { useStudents } from "./store";

/**
 * Resolves the Student record backing the signed-in student session.
 * Falls back to the demo student so the portal is always populated.
 */
export function useCurrentStudent() {
  const { user } = useAuth();
  const students = useStudents();

  const student = useMemo(() => {
    if (!students.length) return undefined;
    const email = user?.email?.toLowerCase();
    const byEmail = email ? students.find((s) => s.email?.toLowerCase() === email) : undefined;
    if (byEmail) return byEmail;
    const byName = user?.name ? students.find((s) => s.name.toLowerCase() === user.name.toLowerCase()) : undefined;
    if (byName) return byName;
    return students.find((s) => s.id === "STU1000") ?? students[0];
  }, [students, user?.email, user?.name]);

  return {
    student,
    klass: student ? `${student.class}-${student.section}` : "X-B",
    firstName: (student?.name ?? user?.name ?? "Student").split(" ")[0],
  };
}