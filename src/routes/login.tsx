import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";

import { Button } from "@/components/ui/button";
import { Heart, Eye, EyeOff, Sparkles, ShieldCheck, Mail, Lock, X, Construction } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { api } from "@/lib/api";


export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Ungalkalyanam" }] }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { language, t } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [showMaintPopup, setShowMaintPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginVal || !passwordVal) {
      toast.error(language === "ta" ? "மின்னஞ்சல்/கைபேசி மற்றும் கடவுச்சொல்லை உள்ளிடவும்" : "Please enter email/mobile and password");
      return;
    }

    setSubmitting(true);
    try {
      const settingsRes = await api.get("/settings");
      const mMode = settingsRes?.maintenance_mode === "1" || settingsRes?.maintenance_mode === true;
      if (mMode) {
        const user = await login(loginVal, passwordVal);
        setSubmitting(false);
        if (user.role !== "admin") {
          setShowMaintPopup(true);
          return;
        }
        toast.success(language === "ta" ? "வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்!" : "Successfully logged in!");
        navigate({ to: "/admin" });
        return;
      }

      const user = await login(loginVal, passwordVal);
      toast.success(language === "ta" ? "வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்!" : "Successfully logged in!");

      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else if (user.role === "staff") {
        navigate({ to: "/staff" });
      } else if (user.is_profile_completed === false) {
        navigate({ to: "/complete-profile" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || (language === "ta" ? "விவரங்கள் தவறானவை. மீண்டும் முயற்சிக்கவும்." : "Invalid credentials. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen login-page" style={{ background: "linear-gradient(180deg, #FFFDFB 0%, #FFF6F8 50%, #FFFDFB 100%)" }}>
      <style>{`.dark .login-page { background: linear-gradient(145deg, #0D0404 0%, #150608 30%, #0D0409 70%, #0D0404 100%) !important; }
        .dark .login-page .glass-card { background: rgba(13,4,4,0.85) !important; backdrop-filter: blur(12px) !important; border-color: rgba(232,63,123,0.2) !important; }
        .dark .login-page .glass-card h1, .dark .login-page .glass-card p { color: #f5e6e6 !important; }
        .dark .login-page .glass-card input, .dark .login-page .glass-card select { background: rgba(30,10,10,0.9) !important; border-color: rgba(232,63,123,0.25) !important; color: #f5e6e6 !important; }
        .dark .login-page .glass-card input::placeholder { color: #8B6565 !important; }
      `}</style>
      <Navbar />
      <section className="mx-auto grid max-w-6xl items-start px-4 py-8 sm:py-16 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Left — testimonial image */}
        <div className="block lg:sticky lg:top-24">
          <div className="relative">
            <img src="/form.png" alt="" className="aspect-[16/9] sm:aspect-[4/5] lg:aspect-[4/5] w-full object-cover shadow-elevated rounded-t-[24px] lg:rounded-[24px] rounded-b-none lg:rounded-b-[24px]" />
            <div className="absolute inset-0 rounded-t-[24px] lg:rounded-[24px] rounded-b-none lg:rounded-b-[24px]" style={{ background: "linear-gradient(0deg, rgba(13,4,4,0.4) 0%, transparent 50%)" }} />
            <div
              className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 rounded-[16px] sm:rounded-[24px] p-4 sm:p-5"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(232,63,123,0.12)",
                boxShadow: "0 8px 32px rgba(232,63,123,0.08)",
              }}
            >
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 20 20" fill="#D4AF37"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78L10 1z"/></svg>
                ))}
              </div>
              <p className="font-display text-base sm:text-lg font-semibold leading-snug" style={{ color: "#2D0808" }}>"Found my soulmate in 3 months."</p>
              <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "#C2185B" }}>— Anjali, Mumbai</p>
            </div>
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "#996515",
              }}
            >
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: "#D4AF37" }} />
              {language === "ta" ? "சரிபார்க்கப்பட்டது" : "Verified"}
            </div>
          </div>
        </div>

        {/* Right — Login form */}
        <div
          className="glass-card rounded-b-[24px] lg:rounded-[24px] rounded-t-none lg:rounded-t-[24px] p-6 sm:p-8 -mt-px lg:mt-0"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(232,63,123,0.10)",
            boxShadow: "0 8px 32px rgba(232,63,123,0.06)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(232,63,123,0.1), rgba(212,175,55,0.1))",
                border: "1px solid rgba(232,63,123,0.2)",
              }}
            >
              <Heart className="h-5 w-5" style={{ color: "#E83F7B", fill: "rgba(232,63,123,0.2)" }} />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: "#2D0808" }}>{language === "ta" ? "மீண்டும் வருக" : "Welcome back"}</h1>
              <p className="text-sm" style={{ color: "#8B6565" }}>{language === "ta" ? "உங்கள் வரன் தேடலைத் தொடரவும்" : "Continue your search for forever."}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8B6565" }}>
                <Mail className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />
                {language === "ta" ? "மின்னஞ்சல் / கைபேசி / யூசர் ஐடி" : "Email / Mobile / User ID"}
              </label>
              <input
                className="h-11 w-full rounded-xl px-4 text-sm outline-none transition-all"
                placeholder={language === "ta" ? "மின்னஞ்சல், கைபேசி அல்லது யூசர் ஐடி" : "Email, Mobile or User ID"}
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                required
                style={{
                  border: "1px solid rgba(232,63,123,0.15)",
                  background: "rgba(255,255,255,0.9)",
                  color: "#2D0808",
                }}
                onFocus={(e) => e.target.style.borderColor = "#E83F7B"}
                onBlur={(e) => e.target.style.borderColor = "rgba(232,63,123,0.15)"}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "#8B6565" }}>
                <Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />
                {t("password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="h-11 w-full rounded-xl pl-4 pr-10 text-sm outline-none transition-all"
                  placeholder={language === "ta" ? "குறைந்தது 8 எழுத்துக்கள்" : "Min 8 characters"}
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  required
                  style={{
                    border: "1px solid rgba(232,63,123,0.15)",
                    background: "rgba(255,255,255,0.9)",
                    color: "#2D0808",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#E83F7B"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(232,63,123,0.15)"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  style={{ color: "#8B6565" }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2" style={{ color: "#8B6565" }}>
                <input type="checkbox" className="accent-[#E83F7B]" /> {language === "ta" ? "என்னை நினைவில் கொள்க" : "Remember me"}
              </label>
              <Link to="/forgot-password" style={{ color: "#E83F7B" }} className="hover:underline font-medium">
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl font-semibold text-sm shadow-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #E83F7B, #C2185B)",
                color: "white",
                boxShadow: "0 8px 32px rgba(232,63,123,0.3)",
              }}
            >
              {submitting ? (language === "ta" ? "உள்நுழைகிறது..." : "Signing in...") : t("signIn")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div style={{ borderTop: "1px solid rgba(232,63,123,0.1)", width: "100%" }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: "rgba(255,255,255,0.8)", color: "#8B6565" }}>
                  {language === "ta" ? "அல்லது" : "or"}
                </span>
              </div>
            </div>

            <p className="text-center text-sm" style={{ color: "#8B6565" }}>
              {language === "ta" ? "புதியவரா?" : "New here?"}{" "}
              <Link to="/register" style={{ color: "#E83F7B" }} className="font-semibold hover:underline">
                {language === "ta" ? "கணக்கை உருவாக்குங்கள்" : "Create account"}
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "#8B6565" }}>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" style={{ color: "#D4AF37" }} /> {language === "ta" ? "பாதுகாப்பான" : "Secure"}</span>
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" style={{ color: "#D4AF37" }} /> {language === "ta" ? "இலவசம்" : "Free"}</span>
            </div>
          </form>
        </div>
      </section>

      {showMaintPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative max-w-sm w-full rounded-3xl border border-amber-500/30 bg-card p-8 text-center shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setShowMaintPopup(false)} className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-muted transition-colors cursor-pointer">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <Construction className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="font-display text-lg font-bold">{language === "ta" ? "தளம் பராமரிப்பில் உள்ளது" : "Site Under Maintenance"}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {language === "ta" ? "தற்போது எங்கள் தளம் பராமரிப்புப் பணிகளுக்காக மூடப்பட்டுள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்." : "We are currently performing scheduled maintenance. Please check back shortly."}
            </p>
            <button
              onClick={() => setShowMaintPopup(false)}
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold text-white gradient-rose cursor-pointer"
            >
              {language === "ta" ? "சரி" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
