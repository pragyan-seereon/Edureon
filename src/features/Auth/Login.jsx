import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../lib/auth";
import { portalHomeForRole } from "../../lib/portal-nav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "../../components/ui/card";
import {
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're on the admin login route
  const isAdmin = location.pathname === "/admin/login";

  const [email, setEmail] = useState(isAdmin ? "rahul@dpsnorth.edu.in" : "");
  const [password, setPassword] = useState(isAdmin ? "demo1234" : "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!email || !password)
      return toast.error("Email and password are required");
    setLoading(true);
    try {
      const u = await auth.login(email, password);
      toast.success("Welcome back");
      navigate(portalHomeForRole(u.role));
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Only available on admin login
  const quickAs = async (preset) => {
    setEmail(preset);
    setPassword("demo1234");
    setLoading(true);
    try {
      const u = await auth.login(preset, "demo1234");
      navigate(portalHomeForRole(u.role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex relative bg-sidebar text-sidebar-foreground p-10 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-25" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">
                EDUREON
              </div>
              <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">
                Enterprise · CBSE Edition
              </div>
            </div>
          </Link>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            The operating system for modern educational institutes.
          </h1>
          <p className="text-sm text-sidebar-foreground/75 leading-relaxed">
            Admissions, academics, fees, payroll, transport, hostel,
            communications — unified in one beautifully simple platform trusted
            by 600+ schools.
          </p>
          <div className="space-y-3">
            {[
              {
                icon: ShieldCheck,
                t: "ISO 27001 · DPDP compliant",
                d: "Bank-grade security, role-based access, full audit trails.",
              },
              {
                icon: Zap,
                t: "Real-time everywhere",
                d: "Attendance, payments, notices — live on web and mobile.",
              },
              {
                icon: Sparkles,
                t: "Built for CBSE",
                d: "Aligned with NEP, board reporting, exam structures and forms.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-sidebar-accent flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t}</div>
                  <div className="text-xs text-sidebar-foreground/65">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-md gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Scholaris ERP</span>
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Login
          </h2>
          {/* <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your institute workspace.
          </p> */}

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institute.edu.in"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary border-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Not registered yet?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              Create an Account
            </Link>
          </p>

          {/* Demo personas — only shown on /admin/login */}
          {isAdmin && (
            <>
              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t" />
                <span className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Demo personas
                </span>
                <div className="flex-1 border-t" />
              </div>

<Card className="p-2 flex flex-col md:flex-row gap-2 border-border/60">
  {[
    { label: "Super Admin", email: "superadmin@scholaris.io" },
    { label: "Teacher", email: "teacher@dps.edu.in" },
    { label: "Principal", email: "principal@dps.edu.in" },
  ].map((p) => (
    <Button
      key={p.email}
      variant="ghost"
      size="sm"
      className="flex-1 justify-center text-xs font-normal"
      onClick={() => quickAs(p.email)}
      disabled={loading}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success mr-2" />
      {p.label}
    </Button>
  ))}
</Card>            </>
          )}
        </div>
      </div>
    </div>
  );
}