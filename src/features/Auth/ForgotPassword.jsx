import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword as resetPasswordApi,
} from "../../api/auth.js";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

const emptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

// const createOtp = () =>
//   String(Math.floor(100000 + Math.random() * 900000)).slice(0, OTP_LENGTH);

// function getPasswordStrength(password) {
//   let score = 0;
//   if (password.length >= 8) score += 1;
//   if (/[A-Z]/.test(password)) score += 1;
//   if (/[a-z]/.test(password)) score += 1;
//   if (/\d/.test(password)) score += 1;
//   if (/[^A-Za-z0-9]/.test(password)) score += 1;

//   if (!password)
//     return { score: 0, label: "Enter a new password", width: "0%" };
//   if (score <= 2) return { score, label: "Weak", width: "33%" };
//   if (score <= 4) return { score, label: "Good", width: "66%" };
//   return { score, label: "Strong", width: "100%" };
// }

export default function ForgotPassword() {
  // const generatedOtpRef = useRef("");
  const otpInputsRef = useRef([]);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
 const [resetToken, setResetToken] = useState("");
  // const passwordStrength = useMemo(
  //   () => getPasswordStrength(newPassword),
  //   [newPassword],
  // );
  const otpCode = otp.join("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character.";
  }

  return "";
};
const sendOtp = async (e) => {
  e.preventDefault();

  if (!email.trim()) {
    return toast.error("Email is required");
  }

  setLoading(true);

  try {
const response = await forgotPassword(email.trim());
    if (response.success) {
      setOtp(emptyOtp());
      setStep(2);
      setCooldown(COOLDOWN_SECONDS);

      toast.success(response.message);

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

 const resendOtp = async () => {
  if (cooldown > 0 || loading) return;

  setLoading(true);

  try {
const response = await forgotPassword(email);
    if (response.success) {
      setOtp(emptyOtp());
      setCooldown(COOLDOWN_SECONDS);

      toast.success("OTP sent successfully");

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to resend OTP");
  } finally {
    setLoading(false);
  }
};

  const updateOtpDigit = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

const verifyOtp = async (e) => {
  e.preventDefault();

  if (otpCode.length !== 6) {
    return toast.error("Enter valid OTP");
  }

  setLoading(true);

  try {
const response = await verifyForgotPasswordOtp(email, otpCode);
    if (response.success) {
      setResetToken(response.reset_token);
      setStep(3);

      toast.success(response.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
  }
};

  const resetPassword = async (e) => {
  e.preventDefault();
const passwordValidation = validatePassword(newPassword);

if (passwordValidation) {
  setPasswordError(passwordValidation);
  return;
}
  if (newPassword !== confirmPassword) {
    return setConfirmPasswordError("Passwords do not match");
  }

  setLoading(true);

  try {
   const response = await resetPasswordApi(
  resetToken,
  newPassword,
  confirmPassword
);

    if (response.success) {
      setComplete(true);
      toast.success(response.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Password reset failed");
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
              <div className="font-display text-lg font-semibold">EDUREON</div>
              <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">
                Enterprise &middot; CBSE Edition
              </div>
            </div>
          </Link>
        </div>
        <div className="relative space-y-6 max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Recover access without slowing the school day.
          </h1>
          <p className="text-sm text-sidebar-foreground/75 leading-relaxed">
            Verify your registered email, reset your password, and get back to
            your EDUREON workspace with the same secure flow used across every
            portal.
          </p>
          <div className="space-y-3">
            {[
              {
                icon: ShieldCheck,
                t: "Secure verification",
                d: "OTP checks protect account access before password reset.",
              },
              {
                icon: Zap,
                t: "Fast recovery",
                d: "Move from email verification to a new password in minutes.",
              },
              {
                icon: Sparkles,
                t: "One account",
                d: "Works across student, teacher, institute, and admin portals.",
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
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-md gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Edureon</span>
          </Link>

          {complete ? (
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h1 className="font-display text-xl font-semibold">
                Password reset complete
              </h1>
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="text-center">
                  <h1 className="font-display text-2xl font-semibold tracking-tight">
                    Reset your password
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your user account's verified email address and we will
                    send you a otp in mail.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="text-center">
                  <h1 className="font-display text-2xl font-semibold tracking-tight">
                    Enter Verification Code
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We sent a verification code to{" "}
                    <span className="font-medium">{email}</span>. Enter the code
                    to continue.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <h1 className="font-display text-2xl font-semibold tracking-tight">
                    Create new password
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a strong password for your account.
                  </p>
                </div>
              )}

              {/* <div className="mt-6 grid grid-cols-3 gap-2">
              {["Email", "OTP", "Password"].map((label, index) => {
                const itemStep = index + 1;
                const active = step === itemStep;
                const done = step > itemStep;
                return (
                  <div key={label} className="space-y-1">
                    <div
                      className={
                        done || active
                          ? "h-1.5 rounded-full gradient-primary"
                          : "h-1.5 rounded-full bg-muted"
                      }
                    />
                    <div
                      className={
                        active
                          ? "text-[10px] font-medium text-foreground text-center"
                          : "text-[10px] text-muted-foreground text-center"
                      }
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div> */}

              {step === 1 && (
                <form onSubmit={sendOtp} className="mt-7 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email" className="text-xs">
                      Email
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@institute.edu.in"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-primary border-0"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      " Send OTP"
                    )}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={verifyOtp} className="mt-7 space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            otpInputsRef.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            updateOtpDigit(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="h-12 w-12 p-0 text-center text-lg font-semibold"
                          autoFocus={index === 0}
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={cooldown > 0 || loading}
                      className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:text-muted-foreground"
                    >
                      {cooldown > 0
                        ? `Resend OTP in ${cooldown}s`
                        : "Resend OTP"}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpCode.length < OTP_LENGTH}
                    className="w-full gradient-primary border-0"
                  >
                    Verify
                  </Button>
                </form>
              )}

            {step === 3 && (
  <form onSubmit={resetPassword} className="mt-7 space-y-4">
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="new-password" className="text-xs">
          New Password
        </Label>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="New password requirements"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              className="max-w-64 leading-relaxed"
            >
              Password must be 8–128 characters and include at
              least one uppercase letter, one lowercase letter,
              one number, and one special character.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative">
        <Input
          id="new-password"
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => {
            const value = e.target.value;
            setNewPassword(value);
            setPasswordError(validatePassword(value));
            if (confirmPassword && value === confirmPassword) {
              setConfirmPasswordError("");
            }
          }}
          placeholder="Create a strong password"
          autoComplete="new-password"
          maxLength={128}
          className="pr-9"
          required
        />
        <button
          type="button"
          onClick={() => setShowNewPassword((current) => !current)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showNewPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {passwordError && (
        <p className="mt-1 text-xs text-destructive">
          {passwordError}
        </p>
      )}
    </div>{/* <-- THIS was missing: closes the New Password "space-y-1.5" wrapper */}

    <div className="space-y-1.5">
      <Label htmlFor="confirm-password" className="text-xs">
        Confirm New Password
      </Label>
      <div className="relative">
        <Input
          id="confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (newPassword === e.target.value) {
              setConfirmPasswordError("");
            }
          }}
          onBlur={() =>
            setConfirmPasswordError(
              confirmPassword && newPassword !== confirmPassword
                ? "Passwords do not match"
                : "",
            )
          }
          placeholder="Re-enter your password"
          autoComplete="new-password"
          className="pr-9"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((current) => !current)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={
            showConfirmPassword ? "Hide confirm password" : "Show confirm password"
          }
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {confirmPasswordError && (
        <p className="mt-1 text-xs text-destructive">
          {confirmPasswordError}
        </p>
      )}
    </div>

    <Button
      type="submit"
      disabled={loading}
      className="w-full gradient-primary border-0"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
    </Button>
  </form>
)}
              <p className="mt-6 text-xs text-muted-foreground text-center">
                <Link to="/login" className="text-primary hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
