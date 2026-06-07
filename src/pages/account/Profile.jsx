import { useMemo, useRef, useState } from "react";
import { PageContainer, PageHeader } from "../../components/page-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { Progress } from "../../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth, initials, roleLabel } from "../../lib/auth";
import {
  Upload,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  // Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const DEMO_PASSWORD = "demo1234";
const displayNamePattern = /^[A-Za-z .-]+$/;
const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const languages = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
];
const timezones =
  typeof Intl !== "undefined" && Intl.supportedValuesOf
    ? Intl.supportedValuesOf("timeZone")
    : [
        "Asia/Kolkata",
        "Asia/Dubai",
        "UTC",
        "America/New_York",
        "Europe/London",
      ];
const notificationEvents = [
  ["newInstituteCreated", "New Institute Created"],
  ["paymentReceived", "Payment Received"],
  ["trialExpiry", "Trial Expiry"],
  ["systemAlerts", "System Alerts"],
];
const steps = [
  {
    id: "identity",
    number: 1,
    title: "Identity",
    // desc: "Tell us who you are. This appears across the platform.",
  },
  {
    id: "password",
    number: 2,
    title: " Change Password",
    // desc: "Secure your account with a strong new password.",
  },
  {
    id: "locale",
    number: 3,
    title: " Locale",
    // desc: "Set timezone, date format and language preferences.",
  },
  {
    id: "notifications",
    number: 4,
    title: " Notification Prefs",
    // desc: "Choose how alerts should reach you.",
  },
  {
    id: "review",
    number: 5,
    title: "Review & Finish",
    desc: "Confirm everything before saving your setup.",
  },
];

function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  return {
    score,
    width: `${(score / checks.length) * 100}%`,
    value: (score / checks.length) * 100,
    label:
      score <= 1
        ? "Weak"
        : score <= 3
          ? "Good"
          : score === 4
            ? "Strong"
            : "Excellent",
  };
}

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const fileRef = useRef(null);
  const [activeStep, setActiveStep] = useState("identity");
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  // const [crop, setCrop] = useState({ zoom: 1, x: 50, y: 50 });
  // const [photoDraft, setPhotoDraft] = useState(null);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    designation: user?.designation ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    timezone: user?.timezone ?? "Asia/Kolkata",
    dateFormat: user?.dateFormat ?? "DD/MM/YYYY",
    language: user?.language ?? "English",
    notifications: {
      email: user?.notifications?.email ?? true,
      inApp: user?.notifications?.inApp ?? true,
      newInstituteCreated: user?.notifications?.newInstituteCreated ?? true,
      paymentReceived: user?.notifications?.paymentReceived ?? true,
      trialExpiry: user?.notifications?.trialExpiry ?? true,
      systemAlerts: user?.notifications?.systemAlerts ?? true,
    },
  });

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.newPassword),
    [form.newPassword],
  );
  const activeStepIndex = steps.findIndex((step) => step.id === activeStep);
  const currentStep = steps[activeStepIndex] ?? steps[0];

  if (!user) return null;

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const setNotification = (key, value) => {
    setForm((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value },
    }));
  };

  const togglePasswordVisibility = (key) => {
    setShowPasswords((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      return toast.error("Use JPG, PNG or WEBP");
    }
    if (f.size > 5 * 1024 * 1024) return toast.error("Max 5MB image");
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (image.width < 100 || image.height < 100) {
          toast.error("Photo must be at least 100 x 100px");
          return;
        }
        // setPhotoDraft(reader.result);
        // setCrop({ zoom: 1, x: 50, y: 50 });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(f);
  };

  // const applyCrop = () => {
  //   if (!photoDraft) return;
  //   const image = new Image();
  //   image.onload = () => {
  //     const size = Math.min(image.width, image.height) / crop.zoom;
  //     const maxX = image.width - size;
  //     const maxY = image.height - size;
  //     const sx = (maxX * crop.x) / 100;
  //     const sy = (maxY * crop.y) / 100;
  //     const canvas = document.createElement("canvas");
  //     canvas.width = 512;
  //     canvas.height = 512;
  //     const ctx = canvas.getContext("2d");
  //     ctx.drawImage(image, sx, sy, size, size, 0, 0, 512, 512);
  //     updateProfile({ avatar: canvas.toDataURL("image/webp", 0.92) });
  //     setPhotoDraft(null);
  //     toast.success("Photo updated");
  //   };
  //   image.src = photoDraft;
  // };

  const validateIdentity = () => {
    const nextErrors = {};
    const name = form.name.trim();
    if (!name) nextErrors.name = "Display name is required";
    else if (name.length < 2) nextErrors.name = "Use at least 2 characters";
    else if (name.length > 100) nextErrors.name = "Use 100 characters or fewer";
    else if (!displayNamePattern.test(name)) {
      nextErrors.name = "Only letters, spaces, dots and hyphens are allowed";
    }
    if (form.designation.length > 100) {
      nextErrors.designation = "Use 100 characters or fewer";
    }
    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validatePassword = () => {
    const nextErrors = {};
    const savedPassword = user.password ?? DEMO_PASSWORD;
    if (!form.currentPassword) nextErrors.currentPassword = "Current password is required";
    else if (form.currentPassword !== savedPassword) {
      nextErrors.currentPassword = "Current password does not match";
    }
    if (!form.newPassword) nextErrors.newPassword = "New password is required";
    else if (form.newPassword.length < 8) nextErrors.newPassword = "Use at least 8 characters";
    else if (passwordStrength.score < 5) {
      nextErrors.newPassword = "Use uppercase, lowercase, digit and special character";
    } else if (form.newPassword === form.currentPassword) {
      nextErrors.newPassword = "New password cannot match current password";
    }
    if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = "Passwords must match";
    }
    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateLocale = () => {
    const nextErrors = {};
    if (!timezones.includes(form.timezone)) {
      nextErrors.timezone = "Choose a valid IANA timezone";
    }
    if (!dateFormats.includes(form.dateFormat)) {
      nextErrors.dateFormat = "Choose a valid date format";
    }
    if (!languages.some((lang) => lang.value === form.language)) {
      nextErrors.language = "Choose a valid language";
    }
    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = (nextStep) => {
    const valid =
      activeStep === "identity"
        ? validateIdentity()
        : activeStep === "password"
          ? validatePassword()
          : activeStep === "locale"
            ? validateLocale()
            : true;
    if (valid) setActiveStep(nextStep);
  };

  const finishSetup = async () => {
    if (!validateIdentity() || !validatePassword() || !validateLocale()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    await changePassword(form.currentPassword, form.newPassword);
    updateProfile({
      name: form.name.trim(),
      designation: form.designation.trim(),
      password: form.newPassword,
      timezone: form.timezone,
      dateFormat: form.dateFormat,
      language: form.language,
      notifications: form.notifications,
    });
    setForm((current) => ({
      ...current,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    toast.success("Profile setup finished");
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Profile Settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-border/60 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-28 gradient-primary opacity-90" />
          <CardContent className="pt-16 pb-6 relative">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-display text-lg font-semibold mt-3">
                {user.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {user.designation}
              </p>
              <Badge
                variant="secondary"
                className="mt-2 text-[10px] uppercase tracking-wider"
              >
                {roleLabel[user.role]}
              </Badge>

              <div className="flex gap-2 mt-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFile}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
                {user.avatar && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      updateProfile({ avatar: undefined });
                      toast.success("Photo removed");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <Separator className="my-5" />

            <div className="space-y-3 text-sm">
              <Row icon={Mail} label="Email" value={user.email} />
              <Row icon={Phone} label="Phone" value={user.phone || "-"} />
              <Row
                icon={Building2}
                label="Institute"
                value={user.institute || "-"}
              />
              <Row
                icon={Calendar}
                label="Joined"
                value={user.joinedAt || "-"}
              />
              <Row
                icon={Shield}
                label="2FA"
                value={
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </span>
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <WizardStepper
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
              <CardTitle className="text-lg font-display pt-4">
                {currentStep.title}
              </CardTitle>
              <CardDescription className="max-w-xl">
                {currentStep.desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeStep} onValueChange={setActiveStep}>
            <TabsContent value="identity">
              <div className="space-y-4">
                <Field label=" Name" error={errors.name} required>
                  <Input
                    value={form.name}
                    maxLength={100}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>

                {/* <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Profile Photo
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar className="h-16 w-16 bg-muted">
                      {user.avatar && (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      )}
                      <AvatarFallback>{initials(form.name)}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Upload & crop
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    JPG/PNG/WEBP · Max 5MB · Min 100 x 100px · Cropped to 1:1
                  </div>
                </div>

                {photoDraft && (
                  <div className="rounded-lg border border-border/60 p-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">Crop profile photo</div>
                        <div className="text-xs text-muted-foreground">
                          Square 1:1 crop. JPG, PNG or WEBP up to 5MB.
                        </div>
                      </div>
                      <Button size="sm" onClick={applyCrop} className="gradient-primary border-0">
                        <Check className="h-3.5 w-3.5" />
                        Apply
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-center">
                      <div className="h-40 w-40 overflow-hidden rounded-md border bg-muted">
                        <img
                          src={photoDraft}
                          alt="Crop preview"
                          className="h-full w-full object-cover"
                          style={{
                            objectPosition: `${crop.x}% ${crop.y}%`,
                            transform: `scale(${crop.zoom})`,
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <Field label="Zoom">
                          <Input
                            type="range"
                            min="1"
                            max="2"
                            step="0.05"
                            value={crop.zoom}
                            onChange={(e) =>
                              setCrop({ ...crop, zoom: Number(e.target.value) })
                            }
                          />
                        </Field>
                        <Field label="Horizontal">
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={crop.x}
                            onChange={(e) =>
                              setCrop({ ...crop, x: Number(e.target.value) })
                            }
                          />
                        </Field>
                        <Field label="Vertical">
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={crop.y}
                            onChange={(e) =>
                              setCrop({ ...crop, y: Number(e.target.value) })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                )} */}

                <Field label="Job Title" error={errors.designation}>
                  <Input
                    value={form.designation}
                    maxLength={100}
                    placeholder="e.g. Principal"
                    onChange={(e) => set("designation", e.target.value)}
                  />
                </Field>

                <StepActions
                  backDisabled
                  onBack={() => setActiveStep("identity")}
                  onNext={() => goNext("password")}
                  nextLabel="Next"
                />
              </div>
            </TabsContent>

            <TabsContent value="password">
              <div className="space-y-4 max-w-md">
                  <Field label="Current Password" error={errors.currentPassword} required>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={form.currentPassword}
                        autoComplete="current-password"
                        onChange={(e) => set("currentPassword", e.target.value)}
                        className="pr-9"
                      />
                      <PasswordVisibilityButton
                        visible={showPasswords.current}
                        onClick={() => togglePasswordVisibility("current")}
                        label="current password"
                      />
                    </div>
                  </Field>
                  <Field label="New Password" error={errors.newPassword}>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={form.newPassword}
                        autoComplete="new-password"
                        onChange={(e) => set("newPassword", e.target.value)}
                        className="pr-9"
                      />
                      <PasswordVisibilityButton
                        visible={showPasswords.new}
                        onClick={() => togglePasswordVisibility("new")}
                        label="new password"
                      />
                    </div>
                    <Progress value={passwordStrength.value} className="mt-2 h-1.5" />
                    <div className="text-[11px] text-muted-foreground">
                      {form.newPassword ? passwordStrength.label : "Enter a new password"}
                    </div>
                  </Field>
                  <Field label="Confirm New Password" error={errors.confirmPassword}>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={form.confirmPassword}
                        autoComplete="new-password"
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        className="pr-9"
                      />
                      <PasswordVisibilityButton
                        visible={showPasswords.confirm}
                        onClick={() => togglePasswordVisibility("confirm")}
                        label="confirm password"
                      />
                    </div>
                  </Field>
                  <StepActions
                    onBack={() => setActiveStep("identity")}
                    onNext={() => goNext("locale")}
                    nextLabel="Next"
                  />
              </div>
            </TabsContent>

            <TabsContent value="locale">
              <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Timezone" error={errors.timezone} required>
                    <Input
                      list="profile-timezones"
                      value={form.timezone}
                      onChange={(e) => set("timezone", e.target.value)}
                    />
                    <datalist id="profile-timezones">
                      {timezones.map((tz) => (
                        <option key={tz} value={tz} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Date Format" error={errors.dateFormat} required>
                    <Select
                      value={form.dateFormat}
                      onValueChange={(v) => set("dateFormat", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Language" error={errors.language} required>
                    <Select
                      value={form.language}
                      onValueChange={(v) => set("language", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="sm:col-span-3">
                    <StepActions
                      onBack={() => setActiveStep("password")}
                      onNext={() => goNext("notifications")}
                      nextLabel="Next"
                    />
                  </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="divide-y divide-border/60">
                  <ToggleRow
                    label="Email notifications"
                    desc="Receive account alerts by email."
                    checked={form.notifications.email}
                    onCheckedChange={(v) => setNotification("email", v)}
                  />
                  <ToggleRow
                    label="In-app notifications"
                    desc="Show alerts inside the Edureon dashboard."
                    checked={form.notifications.inApp}
                    onCheckedChange={(v) => setNotification("inApp", v)}
                  />
                  {notificationEvents.map(([key, label]) => (
                    <ToggleRow
                      key={key}
                      label={label}
                      desc="Notify when this event occurs."
                      checked={form.notifications[key]}
                      onCheckedChange={(v) => setNotification(key, v)}
                    />
                  ))}
                  <div className="pt-4">
                    <StepActions
                      onBack={() => setActiveStep("locale")}
                      onNext={() => setActiveStep("review")}
                      nextLabel="Next"
                    />
                  </div>
              </div>
            </TabsContent>

            <TabsContent value="review">
              <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Summary label=" Name" value={form.name || "-"} />
                    <Summary label="Job Title" value={form.designation || "-"} />
                    <Summary label="Timezone" value={form.timezone || "-"} />
                    <Summary label="Date Format" value={form.dateFormat || "-"} />
                    <Summary label="Language" value={form.language || "-"} />
                    <Summary label="Password" value={form.newPassword ? "Ready to update" : "-"} />
                  </div>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      ["Email notifications", form.notifications.email],
                      ["In-app notifications", form.notifications.inApp],
                      ...notificationEvents.map(([key, label]) => [
                        label,
                        form.notifications[key],
                      ]),
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-md border border-border/60 p-2.5 text-sm"
                      >
                        <span>{label}</span>
                        <Badge variant={value ? "secondary" : "outline"}>
                          {value ? "On" : "Off"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <StepActions
                    onBack={() => setActiveStep("notifications")}
                    onNext={finishSetup}
                    nextLabel="Finish Setup"
                  />
              </div>
            </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function PasswordVisibilityButton({ visible, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function ToggleRow({ label, desc, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function WizardStepper({ activeStep, setActiveStep }) {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => setActiveStep(step.id)}
              className="flex flex-col items-center gap-1"
              aria-label={step.title}
            >
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isActive
                    ? "gradient-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                ].join(" ")}
              >
                {step.number}
              </div>
              <span
                className={[
                  "text-[10px] leading-tight text-center max-w-[56px] hidden sm:block",
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {step.title.trim()}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className="mx-2 mb-4 h-px w-5 bg-border sm:w-8" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepActions({ backDisabled, onBack, onNext, nextLabel }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
      <Button variant="outline" onClick={onBack} disabled={backDisabled}>
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      <Button onClick={onNext} className="gradient-primary border-0">
        {nextLabel}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-md border border-border/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-medium mt-0.5 break-words">{value}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm truncate">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
