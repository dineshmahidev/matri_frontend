import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, Phone, KeyRound, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Ungalkalyanam" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTa = language === "ta";
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sendOtpMutation = useMutation({
    mutationFn: (data: { email?: string; phone?: string }) =>
      api.post<any>("/auth/forgot-password", data),
    onSuccess: (res) => {
      setUserId(res.user_id);
      toast.success("OTP sent successfully");
      setStep("otp");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send OTP");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { user_id: number; otp: string; password: string }) =>
      api.post<any>("/auth/reset-password", data),
    onSuccess: () => {
      toast.success("Password reset successfully");
      navigate({ to: "/login" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to reset password");
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      toast.error("Please enter your email or phone number");
      return;
    }
    sendOtpMutation.mutate({ email: email || undefined, phone: phone || undefined });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    resetPasswordMutation.mutate({ user_id: userId!, otp, password: newPassword });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          {step === "email" ? (
            <>
              <h1 className="font-display text-3xl font-bold">Forgot password?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email or phone number and we'll send a reset OTP.
              </p>
              <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fp-email"><Mail className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} /> Email Address</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@example.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border/40" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 border-t border-border/40" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-phone"><Phone className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} /> Phone Number</Label>
                  <Input
                    id="fp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full gradient-rose text-white"
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending OTP...</>
                  ) : (
                    "Send Reset OTP"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">Back to login</Link>
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  {isTa ? "கணக்கு இல்லையா?" : "Don't have an account?"}{" "}
                  <Link to="/register" className="font-semibold text-primary hover:underline">{isTa ? "பதிவு செய்க" : "Register"}</Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("email")} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="font-display text-2xl font-bold">Reset Password</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Enter the 6-digit OTP sent to your {email ? "email" : "phone"} and set a new password.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fp-otp"><KeyRound className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} /> OTP Code</Label>
                  <Input
                    id="fp-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-new-password"><Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} /> New Password</Label>
                  <Input
                    id="fp-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full gradient-rose text-white"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Resetting...</>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
