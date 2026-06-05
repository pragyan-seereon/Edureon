import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ArrowLeft, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

const emptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

const createOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000)).slice(0, OTP_LENGTH);

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) return { score: 0, label: "Enter a new password", width: "0%" };
  if (score <= 2) return { score, label: "Weak", width: "33%" };
  if (score <= 4) return { score, label: "Good", width: "66%" };
  return { score, label: "Strong", width: "100%" };
}

export default function ForgotPassword() {
  const auth = useAuth();
  const generatedOtpRef = useRef("");
  const otpInputsRef = useRef([]);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );
  const otpCode = otp.join("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return toast.error("Email address is required");

    setLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      generatedOtpRef.current = createOtp();
      setOtp(emptyOtp());
      setStep(2);
      setCooldown(COOLDOWN_SECONDS);
      toast.success(`OTP sent to ${email.trim()}`);
      toast.info(`Demo OTP: ${generatedOtpRef.current}`, { duration: 6000 });
      window.setTimeout(() => otpInputsRef.current[0]?.focus(), 80);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      generatedOtpRef.current = createOtp();
      setOtp(emptyOtp());
      setCooldown(COOLDOWN_SECONDS);
      toast.success("New OTP sent");
      toast.info(`Demo OTP: ${generatedOtpRef.current}`, { duration: 6000 });
      window.setTimeout(() => otpInputsRef.current[0]?.focus(), 80);
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

  const verifyOtp = (e) => {
    e?.preventDefault();
    if (otpCode.length < OTP_LENGTH) return toast.error("Enter the 6-digit OTP");
    if (otpCode !== generatedOtpRef.current) {
      setOtp(emptyOtp());
      otpInputsRef.current[0]?.focus();
      return toast.error("Invalid OTP");
    }

    setStep(3);
    toast.success("OTP verified");
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (passwordStrength.score < 3) {
      return toast.error("Choose a stronger password");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      await auth.changePassword(newPassword);
      setComplete(true);
      toast.success("Password reset successfully");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
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
                        onChange={(e) => updateOtpDigit(index, e.target.value)}
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
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
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
                  <Label htmlFor="new-password" className="text-xs">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                  />
                  <div className="pt-1">
                    {/* <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all"
                        style={{ width: passwordStrength.width }}
                      />
                    </div> */}
                    {/* <div className="mt-1 text-[10px] text-muted-foreground">
                      {passwordStrength.label}
                    </div> */}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
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
                    "Reset Password"
                  )}
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
  );
}
