/* eslint-disable no-unused-vars */
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../../../components/page-shell";
import { Card, CardContent, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ChevronLeft, Users, Loader2, Mail } from "lucide-react";
import { getSubject } from "../../../api/subject";

export default function SubjectDetail() {
  const { id } = useParams();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSubject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSubject(id);
        // API responds as { success, message, data }. Support both a raw
        // subject object and the full envelope, in case getSubject() ever
        // stops unwrapping it for us.
        const data = res?.data ?? res;
        if (!cancelled) setSubject(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load subject");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSubject();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Loading subject…" eyebrow="Academic" />
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Fetching subject details…
        </div>
      </PageContainer>
    );
  }

  if (error || !subject) {
    return (
      <PageContainer>
        <Link
          to="/classes"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All Subjects
        </Link>
        <PageHeader title="Subject not found" eyebrow="Academic" />
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
      </PageContainer>
    );
  }

  const isActive = (subject.status ?? "Active").toLowerCase() === "active";
  // Prefer the hydrated `faculty` array (has name/email); fall back to bare
  // ids from faculty_user_ids only if the API ever omits the hydrated list.
  const facultyList =
    subject.faculty && subject.faculty.length > 0
      ? subject.faculty
      : (subject.faculty_user_ids ?? []).map((id) => ({ user_id: id, name: `Faculty #${id}`, email: null }));

  const initials = (name) =>
    (name || "?")
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  return (
    <PageContainer>
      <Link
        to="/classes"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground mb-3"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All Subjects
      </Link>

      <PageHeader
        eyebrow={`${subject.department ?? "General"} · ${subject.subject_code}`}
        title={subject.subject_name}
        description={`${subject.subject_type} · ${facultyList.length} faculty assigned`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Type</div>
            <div className="text-xl font-semibold mt-1">
              <Badge
                variant={
                  subject.subject_type === "Core"
                    ? "default"
                    : subject.subject_type === "Elective"
                      ? "secondary"
                      : "outline"
                }
              >
                {subject.subject_type}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="text-xl font-semibold mt-1">
              <Badge variant={isActive ? "default" : "outline"}>
                {subject.status ?? "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Faculty</div>
            <div className="text-2xl font-semibold mt-1">{facultyList.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Department</div>
            <div className="text-xl font-semibold mt-1">{subject.department ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              Faculty teaching {subject.subject_name}
            </h3>
          </div>

          {facultyList.length === 0 ? (
            <CardDescription>No faculty assigned to this subject yet.</CardDescription>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {facultyList.map((f) => (
                <div
                  key={f.user_id}
                  className="flex items-center gap-3 rounded-md border border-border/60 p-3"
                >
                  <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {initials(f.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    {f.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{f.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}