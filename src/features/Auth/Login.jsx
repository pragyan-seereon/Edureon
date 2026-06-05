import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../../lib/auth";
import { portalHomeForRole } from "../../lib/portal-nav";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
// import { Card } from "../../components/ui/card";
import {
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ── Inline SVG icons for Google & Facebook ────────────────────────────────────
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

// ── Role detection from pathname ─────────────────────────────────────────────
const ROLE_CONFIG = {
  "/admin/login":     { role: "superadmin", defaultEmail: "superadmin@scholaris.io" },
  "/teacher/login":   { role: "teacher",    defaultEmail: "teacher@dps.edu.in"      },
  "/instute/login": { role: "principal",  defaultEmail: "principal@dps.edu.in"    },
  "/login":           { role: "student",    defaultEmail: "student@edu.in"                         },
};

// ── Claude API helpers ────────────────────────────────────────────────────────

/**
 * Calls Claude to generate a 6-digit OTP and return it as plain JSON.
 * In production you would: generate the OTP server-side, store it with a TTL,
 * and email it via your email provider. This demo generates + returns it via
 * the Claude API so everything is self-contained in the frontend.
 */
async function generateOtpViaClaude(email, provider) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Generate a secure 6-digit numeric OTP for a user signing in via ${provider} with email ${email}.
Respond ONLY with a JSON object — no markdown, no explanation — in this exact shape:
{"otp":"XXXXXX","message":"Your EDUREON verification code is XXXXXX. It expires in 10 minutes. Do not share this code with anyone."}
Where XXXXXX is the 6-digit OTP you generated.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error("Claude API error");

  const data = await response.json();
  const text = data.content.map((b) => b.text || "").join("");
  // Strip any accidental markdown fences before parsing
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean); // { otp, message }
}

/**
 * Simulates sending the OTP to the user's email.
 * In production, replace with your email provider (SendGrid, SES, Resend, etc.).
 * Here we just log it to console so you can test the flow.
 */
function sendOtpEmail(email, message) {
  // TODO: replace with real email send
  console.info(`[OTP EMAIL → ${email}]:`, message);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive role config from the current path
  const roleConfig = ROLE_CONFIG[location.pathname] ?? ROLE_CONFIG["/login"];
  const { role: pageRole, defaultEmail } = roleConfig;

  const isAdmin     = pageRole === "superadmin";
  const isTeacher   = pageRole === "teacher";
  const isPrincipal = pageRole === "principal";
  const isStudent   = pageRole === "student";

  // Show demo persona panel on all staff portals
  // const showDemoPersonas = isAdmin || isTeacher || isPrincipal;

  const [email, setEmail]           = useState(defaultEmail);
  const [password, setPassword]     = useState(defaultEmail ? "demo1234" : "");
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ── OTP state ────────────────────────────────────────────────────────────────
  const [otpStep, setOtpStep]           = useState(false);
  const [otp, setOtp]                   = useState(["", "", "", "", "", ""]);
  const [pendingUser, setPendingUser]   = useState(null);
  const [socialProvider, setSocialProvider] = useState(null);

  // Store the generated OTP in a ref (not state) so it doesn't re-render
  const generatedOtpRef = useRef(null);
  const otpInputsRef    = useRef([]);

  // ── Regular email/password login ─────────────────────────────────────────────
  const submit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return toast.error("Email and password are required");
    setLoading(true);
    try {
      const u = await auth.login(email, password);

      if (u?.requires2FA) {
        setPendingUser(u);
        setOtpStep(true);
        toast.success("OTP sent to your registered email / phone");
        return;
      }

      toast.success("Welcome back");
      navigate(portalHomeForRole(u.role));
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ── Social login — generates OTP via Claude API, then shows OTP screen ───────
  const socialLogin = async (provider) => {
    setLoading(true);
    setSocialProvider(provider);
    try {
      // 1. Attempt OAuth — auth.socialLogin may not be wired up yet (returns null/undefined).
      //    We fall back to a stub user so the OTP flow always works in dev/demo.
      let u = null;
      try {
        u = await auth.socialLogin?.(provider);
      } catch {
        // OAuth popup blocked or not implemented — continue to OTP with stub
      }

      // Fallback stub: use whatever email is typed in the field, default role from page
      if (!u) {
        const fallbackEmail = email.trim() || `demo+${provider}@edureon.in`;
        u = { email: fallbackEmail, role: pageRole, provider };
      }

      const userEmail = u.email ?? email;

      // 2. Generate OTP via Claude API
      toast.loading("Sending OTP…", { id: "otp-gen" });
      const { otp: generatedOtp, message } = await generateOtpViaClaude(userEmail, provider);
      generatedOtpRef.current = generatedOtp;

      // 3. "Send" OTP — logs to console in dev; replace body with real email provider
      sendOtpEmail(userEmail, message);
      toast.dismiss("otp-gen");

      // 4. Show OTP screen
      setPendingUser(u);
      setOtpStep(true);
      setOtp(["", "", "", "", "", ""]);

      toast.success(`OTP sent to ${userEmail}`, { duration: 4000 });
    } catch (err) {
      console.error(err);
      toast.dismiss("otp-gen");
      toast.error(`${provider} sign-in failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit change with auto-advance and auto-submit on 6th digit ──────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (index === 5 && value) {
      const fullCode = [...next.slice(0, 5), value.slice(-1)].join("");
      if (fullCode.length === 6) {
        // Small timeout so the last digit renders before submitting
        setTimeout(() => verifyOtp(fullCode), 80);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ── OTP verification ─────────────────────────────────────────────────────────
  const verifyOtp = async (codeOverride) => {
    const code = codeOverride ?? otp.join("");
    if (code.length < 6) return toast.error("Please enter the 6-digit OTP");

    setLoading(true);
    try {
      // Compare against the Claude-generated OTP stored in the ref
      if (generatedOtpRef.current && code !== generatedOtpRef.current) {
        throw new Error("OTP mismatch");
      }

      // If your auth layer also has an OTP verify step, call it here:
      const u = (await auth.verifyOtp?.(pendingUser, code)) ?? pendingUser;

      toast.success("Welcome back! 🎉");
      navigate(portalHomeForRole(u.role));
    } catch {
      toast.error("Invalid or expired OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = (e) => {
    e?.preventDefault();
    verifyOtp();
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (!pendingUser || !socialProvider) {
      toast.info("OTP resent");
      return;
    }
    setLoading(true);
    try {
      const userEmail = pendingUser.email ?? email;
      toast.loading("Resending OTP…", { id: "otp-resend" });
      const { otp: newOtp, message } = await generateOtpViaClaude(userEmail, socialProvider);
      generatedOtpRef.current = newOtp;
      sendOtpEmail(userEmail, message);
      toast.dismiss("otp-resend");
      toast.success("New OTP sent!");
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } catch {
      toast.dismiss("otp-resend");
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Quick-login personas ──────────────────────────────────────────────────────
  // const quickAs = async (preset) => {
  //   setEmail(preset);
  //   setPassword("demo1234");
  //   setLoading(true);
  //   try {
  //     const u = await auth.login(preset, "demo1234");
  //     navigate(portalHomeForRole(u.role));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ── Demo persona definitions per portal ──────────────────────────────────────
  // const DEMO_PERSONAS = {
  //   superadmin: [
  //     { label: "Super Admin",  email: "superadmin@scholaris.io" },
  //     { label: "Teacher",      email: "teacher@dps.edu.in"      },
  //     { label: "Principal",    email: "principal@dps.edu.in"    },
  //   ],
  //   teacher: [
  //     { label: "Teacher (DPS)",     email: "teacher@dps.edu.in"       },
  //     { label: "Teacher (Kendriya)", email: "teacher@kendriya.edu.in"  },
  //   ],
  //   principal: [
  //     { label: "Principal (DPS)",     email: "principal@dps.edu.in"     },
  //     { label: "Principal (Kendriya)", email: "principal@kendriya.edu.in"},
  //   ],
  // };

  // const demoPersonas = DEMO_PERSONAS[pageRole] ?? [];

  // ─────────────────────────────────────────────────────────────────────────────
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

          {/* ── OTP / 2FA Screen ───────────────────────────────────────────── */}
          {otpStep ? (
            <>
              <div className="mb-1 flex items-center gap-2">
                {socialProvider === "google" && <GoogleIcon />}
                {socialProvider === "facebook" && <FacebookIcon />}
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Two-step verification
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {socialProvider
                  ? `We sent a 6-digit code to the email linked to your ${
                      socialProvider.charAt(0).toUpperCase() + socialProvider.slice(1)
                    } account.`
                  : "Enter the 6-digit code sent to your registered email or phone."}
              </p>

              <form onSubmit={submitOtp} className="mt-7 space-y-5">
                {/* 6-box OTP input — auto-submits on 6th digit */}
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
                  disabled={loading || otp.join("").length < 6}
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
                    setOtp(["", "", "", "", "", ""]);
                    setSocialProvider(null);
                    generatedOtpRef.current = null;
                  }}
                >
                  ← Back to login
                </button>
              </p>
            </>
          ) : (
            /* ── Regular login form ─────────────────────────────────────────── */
            <>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {isStudent   && " Login"}
                {isTeacher   && " Login"}
                {isPrincipal && " Login"}
                {isAdmin     && " Login"}
              </h2>

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

              <p className="mt-6 text-xs text-muted-foreground text-center">
                Not registered yet?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  Create an Account
                </Link>
              </p>

              {/* Social login */}
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
                  disabled={loading}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label="Sign in with Google"
                >
                  <span className="h-14 w-14 rounded-full border border-border bg-background flex items-center justify-center shadow-sm group-hover:border-primary/40 transition-colors">
                    {loading && socialProvider === "google" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <GoogleIcon />
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => socialLogin("facebook")}
                  disabled={loading}
                  className="flex flex-col items-center gap-1.5 group"
                  aria-label="Sign in with Facebook"
                >
                  <span className="h-14 w-14 rounded-full border border-border bg-background flex items-center justify-center shadow-sm group-hover:border-primary/40 transition-colors">
                    {loading && socialProvider === "facebook" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <FacebookIcon />
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground">Facebook</span>
                </button>
              </div>

              {/* Demo personas — staff portals only */}
              {/* {showDemoPersonas && demoPersonas.length > 0 && (
                <>
                  <div className="relative my-6 flex items-center">
                    <div className="flex-1 border-t" />
                    <span className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Demo personas
                    </span>
                    <div className="flex-1 border-t" />
                  </div>

                  <Card className="p-2 flex flex-col md:flex-row gap-2 border-border/60">
                    {demoPersonas.map((p) => (
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
                  </Card>
                </>
              )} */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}