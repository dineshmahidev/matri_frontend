import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search, ShieldCheck, Sparkles, Star, ArrowRight, Crown,
  MessageCircle, Users, BadgeCheck, Heart, CheckCircle2,
  Gem, MapPin, Phone
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/matrimony/ProfileCard";
import { ProfileCompletionDialog } from "@/components/matrimony/ProfileCompletionDialog";
import { useLanguage } from "@/lib/language";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ungal Kalyanam — Premium Tamil Matrimony Platform" },
      { name: "description", content: "India's most trusted Tamil matrimony platform. Join 5M+ verified members. Smart matches, secure chats, lasting marriages — that's the Ungal Kalyanam promise." },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon.png" },
    ],
  }),
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const { data: profileData } = useQuery<any>({
    queryKey: ["home-profile-check"],
    queryFn: () => api.get("/dashboard"),
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    if (!profileData || !user) return;
    const dismissed = sessionStorage.getItem("ungalkalyanam_profile_popup_dismissed");
    const incomplete = profileData.user?.profile_complete === false || (profileData.user?.profile_completion ?? 0) < 100;
    if (!dismissed && incomplete) {
      setShowProfilePopup(true);
    }
  }, [profileData, user]);

  const { data: featuredData, isLoading: loadingFeatured } = useQuery<{ data: any[] }>({
    queryKey: ["featured-members-home"],
    queryFn: () => api.get<{ data: any[] }>("/members/featured?has_photo=1"),
  });
  const featuredMembers = featuredData?.data || [];

  const { data: fallbackData, isLoading: loadingFallback } = useQuery<{ data: any[] }>({
    queryKey: ["recently-joined-members-home"],
    queryFn: () => api.get<{ data: any[] }>("/members/recently-joined"),
    enabled: featuredMembers.length === 0,
  });
  const fallbackMembers = fallbackData?.data || [];

  const raw = featuredMembers.length > 0 ? featuredMembers : fallbackMembers;
  const isLoading = featuredMembers.length > 0 ? loadingFeatured : loadingFallback;

  const males = raw.filter((m: any) => m.gender?.toLowerCase() === "male" || m.gender?.toLowerCase() === "m");
  const females = raw.filter((m: any) => m.gender?.toLowerCase() === "female" || m.gender?.toLowerCase() === "f");
  const shuffledMales = [...males].sort(() => Math.random() - 0.5);
  const shuffledFemales = [...females].sort(() => Math.random() - 0.5);
  const pairCount = Math.min(shuffledMales.length, shuffledFemales.length, 4);
  const paired: any[] = [];
  for (let i = 0; i < pairCount; i++) {
    paired.push(shuffledFemales[i], shuffledMales[i]);
  }
  const remainder = [...shuffledFemales.slice(pairCount), ...shuffledMales.slice(pairCount)];
  const displayMembers = paired.length > 0 ? [...paired, ...remainder].slice(0, 8) : raw.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <ProfileCompletionDialog
          open={showProfilePopup}
          onOpenChange={setShowProfilePopup}
          completionPercent={profileData?.user?.profile_completion ?? 0}
          missingFields={profileData?.user?.missing_fields ?? []}
          language={language}
          isPremium={profileData?.user?.is_premium}
          currentPhoto={profileData?.user?.photo}
          gallery={profileData?.user?.gallery}
        />
      )}
      <Navbar />
      <Hero />
      <Trust />
      <Featured members={displayMembers} isLoading={isLoading} />
      <HowItWorks />
      <Stories />
      <Membership />
      <CTA />
      <Footer />
    </div>
  );
}

/* ──────────────────────────────────────────
   HERO — Premium 3-Column Layout
────────────────────────────────────────── */
function Hero() {
  const { language, t } = useLanguage();
  const isTamil = language === "ta";

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get("/settings"),
  });

  // Floating hearts animation config
  const hearts = [
    { x: "15%", y: "10%", size: 20, delay: 0 },
    { x: "75%", y: "15%", size: 16, delay: 0.8 },
    { x: "85%", y: "60%", size: 24, delay: 1.6 },
    { x: "10%", y: "70%", size: 14, delay: 2.4 },
    { x: "50%", y: "5%", size: 18, delay: 0.4 },
    { x: "60%", y: "80%", size: 22, delay: 1.2 },
  ];

  return (
    <section
      className="relative overflow-hidden hero-section"
      style={{
        background: "linear-gradient(180deg, #FFFDFB 0%, #FFF6F8 50%, #FFFDFB 100%)",
        minHeight: "90vh",
      }}
    >
      {/* Dark mode override */}
      <style>{`
        .dark section.hero-section { background: linear-gradient(145deg, #0D0404 0%, #150608 30%, #0D0409 70%, #0D0404 100%) !important; }
        .dark .hero-search-card { background: rgba(13,4,4,0.85) !important; border-color: rgba(212,175,55,0.15) !important; }
        .dark .hero-search-card select { background-color: #1A0808 !important; color: #FFF8E7 !important; border-color: rgba(212,175,55,0.2) !important; }
        .dark .hero-search-card select option { background-color: #1A0808 !important; color: #FFF8E7 !important; }
      `}</style>

      {/* Large blurred heart shape background behind couple */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div
          className="absolute"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(232,63,123,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
            borderRadius: "50%",
            transform: "translate(-10%, -5%)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 60%)",
            filter: "blur(80px)",
            borderRadius: "50%",
            transform: "translate(15%, 10%)",
          }}
        />
        {/* Decorative dots */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(232,63,123,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Floating hearts */}
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none z-10"
          style={{ left: h.x, top: h.y }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4 + i * 0.5,
            delay: h.delay,
            ease: "easeInOut",
          }}
        >
          <Heart
            className="text-[#E83F7B] drop-shadow-sm"
            style={{ width: h.size, height: h.size, fill: "rgba(232,63,123,0.15)" }}
          />
        </motion.div>
      ))}

      <div
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-center"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8">

          {/* ─── LEFT COLUMN ─── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center lg:items-start gap-5 order-2 lg:order-1"
          >
            {/* Welcome badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: "linear-gradient(135deg, rgba(232,63,123,0.1), rgba(212,175,55,0.1))",
                border: "1px solid rgba(232,63,123,0.2)",
                color: "#E83F7B",
              }}
            >
              <Sparkles className="h-3 w-3" />
              {isTamil ? "நம்பகமான தமிழ் மணமக்கள் தளம்" : "Premium Tamil Matrimony"}
            </motion.div>

            {/* Main heading with smile line */}
            <div className="text-center lg:text-left">
              <h1
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-3"
                style={{
                  background: "linear-gradient(135deg, #E83F7B, #C2185B)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {isTamil
                  ? (settings?.hero_title_ta || "உங்கள் சரியான வாழ்க்கை துணையை கண்டறியுங்கள்")
                  : (settings?.hero_title_en || "Find Your Perfect Match")}
              </h1>
              {/* Smile decorative line */}
              <svg className="w-48 h-4 mb-4 -ml-0.5" viewBox="0 0 192 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10.5C28 18 70 18 96 10.5C122 3 164 3 190 10.5" stroke="url(#smileGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="smileGrad" x1="2" y1="10.5" x2="190" y2="10.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E83F7B" />
                    <stop offset="1" stopColor="#D4AF37" />
                  </linearGradient>
                </defs>
              </svg>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                {isTamil
                  ? (settings?.hero_subtitle_ta || "5 மில்லியன் சரிபார்க்கப்பட்ட உறுப்பினர்களுடன் உங்கள் வாழ்க்கை துணையை இன்றே கண்டறியுங்கள்.")
                  : (settings?.hero_subtitle_en || "Your perfect life partner is waiting. Join 5M+ verified members and find your soulmate today.")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2.5 rounded-2xl font-semibold px-7 py-3.5 text-sm transition-all duration-300 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #D4AF37, #FFD966, #D4AF37)",
                    color: "#1A0808",
                    boxShadow: "0 8px 32px rgba(212,175,55,0.35)",
                  }}
                >
                  <Search className="h-4 w-4" />
                  {isTamil ? "வரன்களை தேடுங்கள்" : "Browse Matches"}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl font-semibold px-6 py-3.5 text-sm transition-all duration-300"
                  style={{
                    border: "1.5px solid rgba(232,63,123,0.3)",
                    color: "#C2185B",
                    background: "rgba(232,63,123,0.04)",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  {isTamil ? "இலவசமாக பதிவு செய்க" : "Register Free Today"}
                </Link>
              </motion.div>
            </div>

            {/* Verified members stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-[240px] rounded-2xl p-5 text-center bg-white/80 dark:bg-card/80"
              style={{
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(232,63,123,0.15)",
                boxShadow: "0 8px 32px rgba(232,63,123,0.08)",
              }}
            >
              <p className="font-display text-4xl font-bold" style={{ color: "#C2185B" }}>5M+</p>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: "#D4AF37" }} />
                <span className="text-xs font-semibold text-muted-foreground">
                  {isTamil ? "சரிபார்க்கப்பட்ட உறுப்பினர்கள்" : "Verified Members"}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* ─── CENTER COLUMN — Hero Image ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex flex-col items-center justify-center order-1 lg:order-2"
          >
            {/* Soft pink glow behind couple */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full"
                style={{
                  width: "480px",
                  height: "480px",
                  background: "radial-gradient(circle, rgba(232,63,123,0.15) 0%, transparent 65%)",
                  filter: "blur(60px)",
                }}
              />
            </div>

            {/* Image container */}
            <div className="relative w-full flex items-center justify-center">
              <motion.img
                src={settings?.hero_background || "/hero-pair.png"}
                alt="Find your perfect match"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="w-full max-w-[500px] lg:max-w-[600px] h-auto object-contain drop-shadow-2xl"
                style={{
                  filter: "drop-shadow(0 20px 60px rgba(232,63,123,0.12))",
                  maxHeight: "500px",
                  maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                }}
              />
            </div>

            {/* Verified badge below image */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2"
              style={{
                background: "linear-gradient(135deg, rgba(232,63,123,0.08), rgba(212,175,55,0.08))",
                border: "1px solid rgba(232,63,123,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <BadgeCheck className="h-4 w-4" style={{ color: "#D81B60" }} />
              <span className="text-xs font-semibold" style={{ color: "#D81B60" }}>
                {isTamil ? "100% சரிபார்க்கப்பட்ட சுயவிவரங்கள்" : "100% Verified Profiles"}
              </span>
            </motion.div>

            {/* Trust statement */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-muted-foreground mt-2 text-center"
            >
              {isTamil
                ? "12 லட்சத்திற்கும் மேற்பட்ட வெற்றிகரமான திருமணங்கள்"
                : "Trusted by 12 Lakh+ Successful Marriages"}
            </motion.p>
          </motion.div>
        </div>

        {/* SEARCH BAR — Bottom of hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="w-full max-w-3xl mx-auto rounded-2xl p-3 hero-search-card"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(232,63,123,0.12)",
            boxShadow: "0 8px 32px rgba(232,63,123,0.08)",
          }}
        >
          <form className="grid grid-cols-2 md:grid-cols-4 gap-2" onSubmit={(e) => e.preventDefault()}>
            <select className="h-11 rounded-xl border border-[rgba(232,63,123,0.15)] bg-white px-3 text-sm focus:outline-none text-foreground dark:bg-[#1A0808] dark:text-[#FFF8E7] dark:border-[rgba(212,175,55,0.2)]">
              <option>{t("lookingFor")}</option>
              <option>{t("bride")}</option>
              <option>{t("groom")}</option>
            </select>
            <select className="h-11 rounded-xl border border-[rgba(232,63,123,0.15)] bg-white px-3 text-sm focus:outline-none text-foreground dark:bg-[#1A0808] dark:text-[#FFF8E7] dark:border-[rgba(212,175,55,0.2)]">
              <option>{isTamil ? "வயது 24 - 30" : "Age 24 – 30"}</option>
              <option>{isTamil ? "வயது 30 - 35" : "Age 30 – 35"}</option>
              <option>{isTamil ? "வயது 35 - 45" : "Age 35 – 45"}</option>
            </select>
            <select className="h-11 rounded-xl border border-[rgba(232,63,123,0.15)] bg-white px-3 text-sm focus:outline-none text-foreground dark:bg-[#1A0808] dark:text-[#FFF8E7] dark:border-[rgba(212,175,55,0.2)]">
              <option>{isTamil ? "மதம்" : "Religion"}</option>
              <option>Hindu</option>
              <option>Muslim</option>
              <option>Christian</option>
            </select>
            <Button asChild className="h-11 rounded-xl font-semibold shadow-lg"
              style={{ background: "linear-gradient(135deg, #D4AF37, #FFD966, #D4AF37)", color: "#1A0808" }}>
              <Link to="/browse"><Search className="mr-1.5 h-4 w-4" />{t("find")}</Link>
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   TRUST STRIP
────────────────────────────────────────── */
function Trust() {
  const { language } = useLanguage();
  const items = [
    {
      icon: ShieldCheck,
      color: "#E91E63",
      t: language === "ta" ? "100% சரிபார்க்கப்பட்டது" : "100% Verified",
      d: language === "ta" ? "அனைத்து சுயவிவரங்களும் மொபைல், மின்னஞ்சல் மற்றும் ஐடி மூலம் சரிபார்க்கப்படுகிறது." : "Every profile is verified by mobile, email and government ID.",
    },
    {
      icon: BadgeCheck,
      color: "#D81B60",
      t: language === "ta" ? "தனியுரிமைக்கு முன்னுரிமை" : "Privacy First",
      d: language === "ta" ? "நீங்கள் விரும்பும் வரை உங்கள் தொடர்பு விவரங்கள் ரகசியமாக இருக்கும்." : "Your contact stays private until you choose to share.",
    },
    {
      icon: Sparkles,
      color: "#C2185B",
      t: language === "ta" ? "AI பொருத்தம்" : "AI Smart Matching",
      d: language === "ta" ? "மதிப்புகள் மற்றும் வாழ்க்கை முறையின் அடிப்படையில் பொருத்தமான வரன்கள்." : "AI-driven compatibility based on values & lifestyle preferences.",
    },
    {
      icon: MessageCircle,
      color: "#AD1457",
      t: language === "ta" ? "பாதுகாப்பான அரட்டை" : "Secure Chat",
      d: language === "ta" ? "பயன்பாட்டிற்குள் பாதுகாப்பான மற்றும் வசதியான அரட்டை வசதி." : "End-to-end encrypted messaging within the app.",
    },
  ];

  return (
    <section className="border-y" style={{ borderColor: "rgba(212,175,55,0.15)", background: "linear-gradient(135deg, rgba(212,175,55,0.04), rgba(194,24,91,0.03))" }}>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {items.map((it, idx) => (
          <motion.div
            key={it.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-3"
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: `${it.color}15`, border: `1px solid ${it.color}25` }}
            >
              <it.icon className="h-5 w-5" style={{ color: it.color }} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm">{it.t}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   FEATURED PROFILES
────────────────────────────────────────── */
function Featured({ members, isLoading }: { members: any[]; isLoading?: boolean }) {
  const { language, t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-0.5 w-8 rounded-full" style={{ background: "linear-gradient(90deg, #D4AF37, #FFD966)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#D4AF37" }}>
              {language === "ta" ? "உங்களுக்காக தேர்ந்தெடுக்கப்பட்டவை" : "Handpicked for you"}
            </p>
          </div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("featuredProfiles")}</h2>
        </div>
        <Button asChild variant="ghost" className="hidden sm:flex hover:text-[#D4AF37] gap-1">
          <Link to="/browse">{language === "ta" ? "அனைத்தையும் காண்க" : "View all"} <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m, i) => <ProfileCard key={m.id} m={m} index={i} />)}
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────
   HOW IT WORKS
────────────────────────────────────────── */
function HowItWorks() {
  const { language, t } = useLanguage();
  const steps = [
    {
      n: "01",
      icon: Users,
      color: "#D4AF37",
      t: language === "ta" ? "சுயவிவரத்தை உருவாக்கவும்" : "Create Your Profile",
      d: language === "ta" ? "2 நிமிடங்களில் கணக்கு உருவாக்கி உங்களை சரிபார்க்கவும்." : "Sign up in under 2 minutes and verify your identity securely.",
    },
    {
      n: "02",
      icon: Search,
      color: "#C2185B",
      t: language === "ta" ? "வரன்களைக் கண்டறியவும்" : "Discover Matches",
      d: language === "ta" ? "புத்திசாலித்தனமான தேர்வுகள் மூலம் பொருத்தமான வரன்களைத் தேடுங்கள்." : "Use smart filters and AI suggestions to find compatible partners.",
    },
    {
      n: "03",
      icon: Heart,
      color: "#4A0404",
      t: language === "ta" ? "பாதுகாப்பாக இணையுங்கள்" : "Connect Securely",
      d: language === "ta" ? "விருப்பத்தை அனுப்பவும், பாதுகாப்பாக உரையாடவும் மற்றும் சந்திக்கவும்." : "Express interest, chat safely and meet when you're both ready.",
    },
  ];

  return (
    <section className="py-20" style={{ background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.04), transparent)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 ornament">
            <Gem className="h-4 w-4 text-[#D4AF37]" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">{t("howItWorks")}</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {language === "ta" ? "3 படிகளில் உங்கள் வாழ்க்கைத்துணை தேடல்" : "Your Journey to Forever in 3 Steps"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">
            {language === "ta" ? "எளிமையான செயல்முறை, நிரந்தர பலன்கள்" : "Simple process, lasting results — we've helped 12L+ couples find their forever."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5"
            style={{ background: "linear-gradient(90deg, #D4AF37, #C2185B, #D4AF37)" }} />

          {steps.map((s, idx) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl p-8 shadow-soft relative overflow-hidden group"
              style={{ background: "var(--color-card)", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}08, transparent 70%)` }} />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display text-5xl font-bold text-shimmer">{s.n}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-2xl"
                    style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </span>
                </div>
                <h3 className="text-xl font-semibold font-display mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   SUCCESS STORIES
────────────────────────────────────────── */
function Stories() {
  const { language, t } = useLanguage();
  const { data: stories = [], isLoading } = useQuery<any[]>({
    queryKey: ["home-stories"],
    queryFn: () => api.get<any[]>("/success-stories"),
  });
  const displayStories = stories.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-0.5 w-8 rounded-full" style={{ background: "linear-gradient(90deg, #C2185B, #E91E8C)" }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C2185B]">{t("realStories")}</p>
          </div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {language === "ta" ? "அன்பு நிலையான உறவாக மாறிய இடம்" : "Where Love Became Forever"}
          </h2>
        </div>
        <Button asChild variant="ghost" className="hidden sm:flex hover:text-[#C2185B] gap-1">
          <Link to="/success-stories">
            {language === "ta" ? "அனைத்து கதைகளும்" : "All stories"} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-3xl bg-muted animate-pulse" style={{ aspectRatio: "4/3" }} />
          ))
        ) : (
          displayStories.map((s: any, idx: number) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-3xl shadow-soft"
              style={{ border: "1px solid rgba(212,175,55,0.15)", background: "var(--color-card)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.photo}
                  alt={s.couple_name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(0deg, rgba(212,175,55,0.20), transparent)" }} />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.92)", color: "#4A0404" }}>
                  <MapPin className="h-3 w-3 text-[#C2185B]" /> {s.city}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {language === "ta" ? "திருமணம்" : "Married"} {s.date}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.couple_name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">"{s.quote}"</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   MEMBERSHIP PLANS
────────────────────────────────────────── */
function Membership() {
  const { language } = useLanguage();
  const { data: plansData, isLoading } = useQuery<any[]>({
    queryKey: ["home-plans"],
    queryFn: () => api.get<any[]>("/plans"),
  });

  const colorMap: Record<string, string> = {
    rose: "#C2185B", gold: "#D4AF37", emerald: "#059669",
    blue: "#2563EB", purple: "#7C3AED", slate: "#64748B",
  };

  const plans = plansData?.map((p: any) => {
    const hex = colorMap[p.color] || "#D4AF37";
    return {
      name: p.name,
      price: `₹${p.price}`,
      period: p.period === "Lifetime" ? (language === "ta" ? "வாழ்நாள்" : "Lifetime") : `/ ${p.period.toLowerCase()}`,
      color: hex,
      features: Array.isArray(p.features) ? p.features : [],
      cta: language === "ta" ? "இப்போது சேரவும்" : "Get Started",
      href: "/pricing",
      popular: !!p.popular,
    };
  }) || [];

  return (
    <section className="py-20" style={{ background: "linear-gradient(180deg, transparent, rgba(74,4,4,0.03), transparent)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-2">
            {language === "ta" ? "திட்டங்கள் & விலைகள்" : "Plans & Pricing"}
          </p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {language === "ta" ? "உங்களுக்கான சிறந்த திட்டத்தை தேர்வு செய்யவும்" : "Choose Your Perfect Plan"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            {language === "ta" ? "எல்லா திட்டங்களிலும் 30 நாள் பணம் திரும்ப உத்தரவாதம்" : "All plans include 30-day money-back guarantee. No hidden fees."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-3xl bg-muted animate-pulse h-80" />
            ))
          ) : (
            plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-7 shadow-soft overflow-hidden ${plan.popular ? "scale-[1.02]" : ""}`}
                style={{
                  background: plan.popular
                    ? "linear-gradient(145deg, #1A0808, #2A0808)"
                    : "var(--color-card)",
                  border: plan.popular
                    ? `2px solid ${plan.color}`
                    : `1px solid rgba(212,175,55,0.15)`,
                }}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-[#1A0808]"
                    style={{ background: "linear-gradient(135deg, #D4AF37, #FFD966)" }}>
                    ✦ {language === "ta" ? "மிகவும் பிரபலம்" : "Most Popular"}
                  </div>
                )}

                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                  style={{ background: `radial-gradient(circle, ${plan.color}, transparent)`, filter: "blur(20px)" }} />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="h-5 w-5" style={{ color: plan.color }} />
                    <span className={`font-display text-lg font-bold ${plan.popular ? "text-white" : ""}`}>
                      {plan.name}
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                    <span className={`text-sm ml-1 ${plan.popular ? "text-gray-400" : "text-muted-foreground"}`}>{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: plan.color }} />
                        <span className={plan.popular ? "text-gray-200" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.href}
                    className="block w-full rounded-2xl py-3 text-center text-sm font-semibold transition-all hover:opacity-90"
                    style={plan.popular
                      ? { background: `linear-gradient(135deg, ${plan.color}, #FFD966)`, color: "#1A0808" }
                      : { background: `${plan.color}12`, border: `1px solid ${plan.color}30`, color: plan.color }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   CTA BANNER
────────────────────────────────────────── */
function CTA() {
  const { language, t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] p-10 text-white shadow-glow sm:p-16"
        style={{ background: "linear-gradient(135deg, #4A0404 0%, #7A0A0A 30%, #C2185B 65%, #D4AF37 100%)" }}
      >
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FFD966, transparent)", filter: "blur(40px)" }} />

        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="text-[#FFD966] text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {language === "ta" ? "இன்றே இணையுங்கள்" : "Start Your Journey Today"}
            </p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl text-white leading-tight">
              {language === "ta"
                ? "உங்களின் வரன் ஒரு சொடுக்கே தூரம்."
                : "Your Forever Person is One Click Away."}
            </h2>
            <p className="mt-3 max-w-md text-white/80 text-sm leading-relaxed">
              {language === "ta"
                ? "இன்றே இலவசமாக இணைந்து, ஆயிரக்கணக்கான பொருத்தமான வரன்களைப் பாருங்கள்."
                : "Join free today and unlock thousands of compatible matches. 12L+ marriages and counting."}
            </p>

            {/* Trust indicators */}
            <div className="mt-6 flex flex-wrap gap-4">
              {[
                { icon: Users, text: language === "ta" ? "5M+ உறுப்பினர்கள்" : "5M+ Members" },
                { icon: ShieldCheck, text: language === "ta" ? "100% சரிபார்க்கப்பட்டது" : "100% Verified" },
                { icon: Phone, text: language === "ta" ? "24/7 ஆதரவு" : "24/7 Support" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-sm text-white/80">
                  <item.icon className="h-3.5 w-3.5 text-[#FFD966]" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:justify-end">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #D4AF37, #FFD966)", color: "#1A0808" }}
            >
              <Heart className="h-4 w-4" />
              {t("createFreeProfile")}
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              <Crown className="h-4 w-4 text-[#FFD966]" />
              {t("viewPlans")}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
