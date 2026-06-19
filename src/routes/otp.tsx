import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify OTP — Ungalkalyanam" }] }),
  component: Otp,
});

function Otp() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState("your number");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const { language, t } = useLanguage();

  useEffect(() => {
    const savedUserId = sessionStorage.getItem("ungalkalyanam_reg_user_id");
    const savedPhone = sessionStorage.getItem("ungalkalyanam_reg_phone");
    const savedOtp = sessionStorage.getItem("ungalkalyanam_reg_otp");

    if (savedUserId) {
      setUserId(savedUserId);
    }
    if (savedPhone) {
      setPhone(savedPhone);
    }

    // Auto-fill test OTP if found in session storage
    if (savedOtp && savedOtp.length === 6) {
      setDigits(savedOtp.split(""));
    }
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    // Focus next input box
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error(language === "ta" ? "பதிவு அமர்வு எதுவும் கிடைக்கவில்லை. முதலில் பதிவு செய்யவும்." : "No registration session found. Please register first.");
      return;
    }

    const otpCode = digits.join("");
    if (otpCode.length < 6) {
      toast.error(language === "ta" ? "முழு 6 இலக்க OTP குறியீட்டையும் உள்ளிடவும்" : "Please enter the full 6-digit OTP code");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ token: string; user: any }>("/auth/verify-otp", {
        user_id: parseInt(userId),
        otp: otpCode,
      });

      localStorage.setItem("ungalkalyanam_token", res.token);
      localStorage.setItem("ungalkalyanam_user", JSON.stringify(res.user));
      
      toast.success(language === "ta" ? "கணக்கு வெற்றிகரமாக சரிபார்க்கப்பட்டது!" : "Account verified successfully!");
      
      // Full page reload redirect to refresh auth state
      if (res.user.is_profile_completed === false) {
        window.location.href = "/complete-profile";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      toast.error(err.message || (language === "ta" ? "தவறான அல்லது காலாவதியான OTP" : "Invalid or expired OTP"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <form onSubmit={handleVerify} className="rounded-3xl border bg-card p-8 text-center shadow-soft">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></span>
          <h1 className="mt-5 font-display text-3xl font-bold">{t("verifyOtp")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === "ta" ? `நாங்கள் ${phone} என்ற எண்ணிற்கு 6-இலக்க குறியீட்டை அனுப்பியுள்ளோம்` : `We sent a 6-digit code to ${phone}`}
          </p>
          
          <div className="mt-6 flex justify-center gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { if (el) inputRefs.current[i] = el; }}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                className="h-12 w-11 rounded-xl border bg-background text-center font-display text-lg font-bold outline-none focus:border-primary"
              />
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={submitting} 
            className="mt-7 h-11 w-full gradient-rose text-white shadow-glow"
          >
            {submitting ? (language === "ta" ? "சரிபார்க்கிறது..." : "Verifying...") : (language === "ta" ? "சரிபார்த்து தொடர்க" : "Verify & Continue")}
          </Button>

          <p className="mt-3 text-sm text-muted-foreground">
            {language === "ta" ? "குறியீடு வரவில்லையா?" : "Didn't get it?"}{" "}
            <button type="button" className="font-semibold text-primary hover:underline">
              {language === "ta" ? "மீண்டும் அனுப்புக" : "Resend"}
            </button>
          </p>
        </form>
      </section>
      <Footer />
    </div>
  );
}
