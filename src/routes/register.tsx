import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { useReligions, useCastes } from "@/lib/useReferenceData";
import { MOTHER_TONGUES, OPTION_TRANSLATIONS } from "@/data/castes";
import { RASIS, NAKSHATRAMS, RASI_NAKSHATRAM_MAP } from "@/data/astrology";
import { Sparkles, ShieldCheck, Heart, Star, BadgeCheck, Eye, EyeOff, User, Users, Calendar, Phone, Mail, Church, Languages, Moon, Lock } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Ungalkalyanam" }] }),
  component: Register,
});

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [profileFor, setProfileFor] = useState("Self");
  const [gender, setGender] = useState("Female");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [religion, setReligion] = useState("Hindu");
  const { data: religions = [] } = useReligions();
  const religionId = religions.find((r) => r.name === religion)?.id ?? null;
  const { data: castes = [] } = useCastes(religionId);
  const [caste, setCaste] = useState("");
  const [motherTongue, setMotherTongue] = useState("Tamil");
  const [rasi, setRasi] = useState("");
  const [nakshatram, setNakshatram] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !dob || !phone || !caste) {
      toast.error(language === "ta" ? "தயவுசெய்து அனைத்து கட்டாய புலங்களையும் நிரப்பவும்." : "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error(language === "ta" ? "கடவுச்சொல் பொருத்தமாக இல்லை." : "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        name,
        email,
        password,
        phone,
        gender: gender.toLowerCase(),
        dob,
        religion,
        community: caste,
        mother_tongue: motherTongue,
        profile_for: profileFor,
        rasi,
        nakshatram,
      });

      sessionStorage.setItem("ungalkalyanam_reg_user_id", res.user_id.toString());
      sessionStorage.setItem("ungalkalyanam_reg_otp", res.otp);
      sessionStorage.setItem("ungalkalyanam_reg_phone", phone);

      toast.success(language === "ta" ? `சுயவிவரம் உருவாக்கப்பட்டது! சோதனை OTP: ${res.otp}` : `Profile created! Use test OTP: ${res.otp}`);
      navigate({ to: "/otp" });
    } catch (err: any) {
      toast.error(err.message || (language === "ta" ? "பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen register-page" style={{ background: "linear-gradient(180deg, #FFFDFB 0%, #FFF6F8 50%, #FFFDFB 100%)" }}>
      <style>{`.dark .register-page { background: linear-gradient(145deg, #0D0404 0%, #150608 30%, #0D0409 70%, #0D0404 100%) !important; }
        .dark .register-page .glass-card { background: rgba(13,4,4,0.85) !important; backdrop-filter: blur(12px) !important; border-color: rgba(232,63,123,0.2) !important; }
        .dark .register-page .glass-card h1, .dark .register-page .glass-card p { color: #f5e6e6 !important; }
        .dark .register-page .glass-card input, .dark .register-page .glass-card select, .dark .register-page .glass-card .field { background: rgba(30,10,10,0.9) !important; border-color: rgba(232,63,123,0.25) !important; color: #f5e6e6 !important; }
        .dark .register-page .glass-card input::placeholder { color: #8B6565 !important; }
      `}</style>
      <Navbar />
      <section className="mx-auto grid max-w-6xl items-start px-4 py-8 sm:py-16 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Left — Image */}
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
              <p className="font-display text-base sm:text-lg font-semibold leading-snug" style={{ color: "#2D0808" }}>
                {language === "ta" ? "உங்கள் வாழ்க்கை துணையை இன்றே கண்டறியுங்கள்" : "Start your journey to forever"}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "#D4AF37" }} />
                <span className="text-[10px] sm:text-xs font-medium" style={{ color: "#C2185B" }}>
                  {language === "ta" ? "இலவச பதிவு • 2 நிமிடங்கள்" : "Free registration • 2 minutes"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs" style={{ color: "#8B6565" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ fill: "#D4AF37", color: "#D4AF37" }} />
            ))}
            <span className="ml-1">{language === "ta" ? "5 மில்லியன் உறுப்பினர்களுடன் இணைகிறது" : "Joining 5M+ members"}</span>
          </div>
        </div>

        {/* Right — Register form */}
        <div
          className="glass-card rounded-b-[24px] lg:rounded-[24px] rounded-t-none lg:rounded-t-[24px] p-6 sm:p-8 -mt-px lg:mt-0"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(232,63,123,0.10)",
            boxShadow: "0 8px 32px rgba(232,63,123,0.06)",
          }}
        >
          {/* Header */}
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
              <p className="text-xs font-semibold" style={{ color: "#E83F7B" }}>
                {language === "ta" ? "படி 1/3" : "Step 1 of 3"}
              </p>
              <h1 className="font-display text-2xl font-bold" style={{ color: "#2D0808" }}>{t("registerTitle")}</h1>
              <p className="text-xs" style={{ color: "#8B6565" }}>{t("registerSubtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label={t("profileFor")} icon={User}>
              <select className="field" value={profileFor} onChange={(e) => setProfileFor(e.target.value)}>
                <option value="Self">{language === "ta" ? "எனக்கு" : "Self"}</option>
                <option value="Son">{language === "ta" ? "மகனுக்கு" : "Son"}</option>
                <option value="Daughter">{language === "ta" ? "மகளுக்கு" : "Daughter"}</option>
                <option value="Brother">{language === "ta" ? "சகோதரனுக்கு" : "Brother"}</option>
                <option value="Sister">{language === "ta" ? "சகோதரிக்கு" : "Sister"}</option>
              </select>
            </Field>
            <Field label={t("gender")} icon={Users}>
              <select className="field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Female">{language === "ta" ? "பெண்" : "Female"}</option>
                <option value="Male">{language === "ta" ? "ஆண்" : "Male"}</option>
              </select>
            </Field>
            <Field label={t("fullName")} required icon={User}>
              <input className="field" placeholder={language === "ta" ? "அடையாள அட்டைப்படி" : "As per ID"} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={t("dob")} required icon={Calendar}>
              <input type="date" className="field" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </Field>
            <Field label={t("mobile")} required icon={Phone}>
              <input className="field" placeholder="+91" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </Field>
            <Field label={t("email")} required icon={Mail}>
              <input className="field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label={t("religion")} icon={Church}>
              <select className="field" value={religion} onChange={(e) => setReligion(e.target.value)}>
                {(religions.length ? religions.map((r) => r.name) : ["Hindu", "Muslim", "Christian"]).map((r) => (
                  <option key={r} value={r}>{language === "ta" ? (OPTION_TRANSLATIONS[r] || r) : r}</option>
                ))}
              </select>
            </Field>
            <Field label={language === "ta" ? "சாதி" : "Caste / Community"} required icon={Users}>
              <select className="field" value={caste} onChange={(e) => setCaste(e.target.value)} required>
                <option value="">{language === "ta" ? "சாதியைத் தேர்ந்தெடுக்கவும்" : "Select Caste"}</option>
                {castes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label={t("motherTongue")} icon={Languages}>
              <select className="field" value={motherTongue} onChange={(e) => setMotherTongue(e.target.value)}>
                {MOTHER_TONGUES.map((l) => <option key={l} value={l}>{language === "ta" ? (OPTION_TRANSLATIONS[l] || l) : l}</option>)}
              </select>
            </Field>
            <Field label={language === "ta" ? "ராசி" : "Rasi / Moon Sign"} icon={Moon}>
              <select className="field" value={rasi} onChange={(e) => { setRasi(e.target.value); setNakshatram(""); }}>
                <option value="">{language === "ta" ? "ராசியைத் தேர்ந்தெடுக்கவும்" : "Select Rasi"}</option>
                {RASIS.map((r) => <option key={r.en} value={r.en}>{language === "ta" ? r.ta : r.en}</option>)}
              </select>
            </Field>
            <Field label={language === "ta" ? "நட்சத்திரம்" : "Nakshatram / Birth Star"} icon={Star}>
              <select className="field" value={nakshatram} onChange={(e) => setNakshatram(e.target.value)}>
                <option value="">{language === "ta" ? "நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்" : "Select Nakshatram"}</option>
                {(rasi ? (RASI_NAKSHATRAM_MAP[rasi] || []) : NAKSHATRAMS.map(n => n.en)).map((nName) => {
                  const nObj = NAKSHATRAMS.find(n => n.en === nName);
                  return nObj ? (
                    <option key={nObj.en} value={nObj.en}>
                      {language === "ta" ? nObj.ta : nObj.en}
                    </option>
                  ) : null;
                })}
              </select>
            </Field>
            <Field label={t("password")} required className="sm:col-span-2" icon={Lock}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="field pr-10" placeholder={language === "ta" ? "குறைந்தது 8 எழுத்துக்கள்" : "Min 8 characters"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8B6565" }} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <Field label={language === "ta" ? "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்" : "Re-enter Password"} required className="sm:col-span-2" icon={Lock}>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} className="field pr-10" placeholder={language === "ta" ? "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்" : "Re-enter password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#8B6565" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            <div className="sm:col-span-2">
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
                {submitting ? (language === "ta" ? "பதிவு செய்கிறது..." : "Submitting...") : (language === "ta" ? "தொடர்க" : "Continue")}
              </Button>
              <p className="mt-4 text-center text-sm" style={{ color: "#8B6565" }}>
                {t("alreadyHaveAccount")}{" "}
                <Link to="/login" style={{ color: "#E83F7B" }} className="font-semibold hover:underline">
                  {t("login")}
                </Link>
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: "#8B6565" }}>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" style={{ color: "#D4AF37" }} /> {language === "ta" ? "பாதுகாப்பான" : "Secure"}</span>
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" style={{ color: "#D4AF37" }} /> {language === "ta" ? "இலவசம்" : "Free"}</span>
              </div>
            </div>
          </form>
        </div>
      </section>

    </div>
  );
}

function Field({ label, children, className = "", required, icon: Icon }: { label: string; children: React.ReactNode; className?: string; required?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium" style={{ color: "#8B6565" }}>
        {Icon && <Icon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />}
        {label}
        {required && <span className="ml-0.5" style={{ color: "#E83F7B" }}>*</span>}
      </span>
      {children}
    </label>
  );
}
