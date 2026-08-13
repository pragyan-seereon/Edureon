import { useNavigate, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { login, verifyOtp as verifyOtpRequest } from "../../api/auth.js"; // adjust path to match your project structure
import { portalHomeForRole } from "../../lib/portal-nav";
import { requiresInstituteSelection } from "../../lib/institute-selection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import {
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ── Inline SVG icons for Google & Facebook (kept for visual parity — wire up
//    real OAuth endpoints when available) ──────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const OTP_LENGTH = 6;
const emptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

export default function Login() {
  const navigate = useNavigate();

  // ── Sign-in form state ───────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ── OTP step state ───────────────────────────────────────────────────────
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(emptyOtp);
  const [pendingEmail, setPendingEmail] = useState("");

  const otpInputsRef = useRef([]);

  // ── Step 1: email + password → backend sends OTP ────────────────────────
  const submit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      return toast.error("Email and password are required");
    }

    setLoginError("");
    setLoading(true);
    try {
      const data = await login(email.trim(), password, rememberMe);

      setPendingEmail(email.trim());
      setOtpStep(true);
      setOtp(emptyOtp());

      toast.success(data?.message || `OTP sent to ${email.trim()}`);
      window.setTimeout(() => otpInputsRef.current[0]?.focus(), 80);
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.response?.data?.detail;
      const isInvalidCredential =
        (status >= 400 && status < 500) ||
        /invalid|incorrect|wrong password/i.test(String(message || ""));
      const errorText = isInvalidCredential
        ? "Invalid credentials"
        : message || "Unable to sign in. Please try again.";

      setLoginError(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit change with auto-advance and auto-submit on 6th digit ─────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (index === OTP_LENGTH - 1 && value) {
      const fullCode = [...next.slice(0, OTP_LENGTH - 1), value.slice(-1)].join("");
      if (fullCode.length === OTP_LENGTH) {
        setTimeout(() => verifyOtp(fullCode), 80);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ── Step 2: verify OTP → backend issues tokens + user record ────────────
  const verifyOtp = async (codeOverride) => {
    const code = codeOverride ?? otp.join("");
    if (code.length < OTP_LENGTH) {
      return toast.error("Please enter the 6-digit OTP");
    }

    setLoading(true);
    try {
    const data = await verifyOtpRequest(pendingEmail, code);

// Do not request authorization context here. Institute-scoped users receive
// it only after choosing an institute and receiving the scoped token.
const primaryRole =
  data.role_codes?.[0] ||
  data.user?.legacy_role?.role_code ||
  data.user?.role_code ||
  "ADMIN";

// Save user
const authUser = {
  ...data.user,
  name: data.user?.display_name || data.user?.name,
  role: primaryRole,
  role_code: primaryRole,
  role_codes: data.role_codes || [primaryRole],
  permissions: data.permissions || [],
  role_permissions: data.role_permissions || [],
  temporary_permissions: data.temporary_permissions || [],
  override_allowed_permissions: data.override_allowed_permissions || [],
  override_denied_permissions: data.override_denied_permissions || [],
  is_super_admin: data.is_super_admin,
  active_institute: data.active_institute,
  institutes: Array.isArray(data.institutes) ? data.institutes : [],
  requires_institute_selection: Boolean(data.requires_institute_selection),
};

localStorage.setItem("user", JSON.stringify(authUser));
localStorage.setItem("scholaris.auth.user", JSON.stringify(authUser));
localStorage.setItem("access_token", data.access_token);
localStorage.setItem("refresh_token", data.refresh_token);
localStorage.setItem("session_uuid", data.session_uuid);

toast.success("Welcome back");

// Institute users choose their institute before the workspace/sidebar opens.
if (requiresInstituteSelection(authUser)) {
  navigate("/select-institute");
} else {
  navigate(portalHomeForRole(primaryRole));
}
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Invalid or expired OTP. Please try again."
      );
      setOtp(emptyOtp());
      otpInputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = (e) => {
    e?.preventDefault();
    verifyOtp();
  };

  // ── Resend OTP — re-runs login() to get the backend to issue a new code ─
  const resendOtp = async () => {
    if (!pendingEmail || !password) {
      toast.error("Please sign in again");
      setOtpStep(false);
      return;
    }
    setLoading(true);
    try {
      toast.loading("Resending OTP…", { id: "otp-resend" });
      const data = await login(pendingEmail, password, rememberMe);
      toast.dismiss("otp-resend");
      toast.success(data?.message || "New OTP sent!");
      setOtp(emptyOtp());
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      toast.dismiss("otp-resend");
      toast.error(
        err?.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for OAuth providers — no backend endpoint provided yet.
  const socialLogin = (provider) => {
    toast.info(
      `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in isn't wired up yet`
    );
  };

  // ───────────────────────────────────────────────────────────────────────
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
              <div className="font-display text-lg font-semibold">EDUREON</div>
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-md gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Scholaris ERP</span>
          </div>

          {/* ── OTP / 2FA Screen ─────────────────────────────────────────── */}
          {otpStep ? (
            <>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Two-step verification
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-foreground">{pendingEmail}</span>.
              </p>

              <form onSubmit={submitOtp} className="mt-7 space-y-5">
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      id={`otp-${i}`}
                      ref={(el) => (otpInputsRef.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-12 text-center text-lg font-semibold p-0"
                      autoFocus={i === 0}
                      disabled={loading}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.join("").length < OTP_LENGTH}
                  className="w-full gradient-primary border-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify & Sign in"
                  )}
                </Button>
              </form>

              <p className="mt-4 text-xs text-muted-foreground text-center">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={resendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </p>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => {
                    setOtpStep(false);
                    setOtp(emptyOtp());
                  }}
                >
                  ← Back to login
                </button>
              </p>
            </>
          ) : (
            /* ── Regular login form ───────────────────────────────────── */
            <>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Sign in
              </h2>

              <form onSubmit={submit} className="mt-5 space-y-4">
                {loginError && (
                  <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                    <span>{loginError}</span>
                    <button
                      type="button"
                      onClick={() => setLoginError("")}
                      className="rounded p-0.5 hover:bg-destructive/15"
                      aria-label="Dismiss login error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError("");
                      }}
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

                <div className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-xs cursor-pointer select-none"
                  >
                    Remember me
                  </Label>
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

              {/* Social login (UI only — wire up real OAuth when available) */}
              <div className="relative my-5 flex items-center">
                <div className="flex-1 border-t" />
                <span className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                  or Sign in with
                </span>
                <div className="flex-1 border-t" />
              </div>

              <div className="flex justify-center gap-6">
                <button
                  type="button"
                  onClick={() => socialLogin("google")}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label="Sign in with Google"
                >
                  <span className="h-14 w-14 rounded-full border border-border bg-background flex items-center justify-center shadow-sm group-hover:border-primary/40 transition-colors">
                    <GoogleIcon />
                  </span>
                  <span className="text-[11px] text-muted-foreground">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => socialLogin("facebook")}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label="Sign in with Facebook"
                >
                  <span className="h-14 w-14 rounded-full border border-border bg-background flex items-center justify-center shadow-sm group-hover:border-primary/40 transition-colors">
                    <FacebookIcon />
                  </span>
                  <span className="text-[11px] text-muted-foreground">Facebook</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
