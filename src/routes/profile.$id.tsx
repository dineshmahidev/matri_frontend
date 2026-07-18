import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck, Crown, Heart, Lock, MapPin, MessageCircle, Clock,
  Phone, Bookmark, GraduationCap, Briefcase, Users,
  Loader2, ChevronLeft, Calendar, Ruler, Church,
  X, ChevronRight, Maximize2, Ban
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { api, getImageUrl } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { TranslateText } from "@/components/matrimony/TranslateText";
import { useUpgrade } from "@/lib/upgrade";


export const Route = createFileRoute("/profile/$id")({
  head: ({ params }) => ({ meta: [{ title: `Profile ${params.id} — Ungalkalyanam` }] }),
  loader: async ({ params }) => {
    try {
      const res = await api.get<{ data: any }>(`/members/${params.id}`);
      return res.data;
    } catch (e) {
      throw notFound();
    }
  },
  component: Profile,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-20 text-center">
      <div className="text-6xl">💔</div>
      <h2 className="font-display text-2xl font-bold">Profile not found</h2>
      <p className="text-muted-foreground">This profile may have been removed or doesn't exist.</p>
      <Link to="/browse" className="text-primary underline-offset-4 hover:underline">Browse profiles</Link>
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
};

function Profile() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { openUpgrade } = useUpgrade();
  const loaderData = Route.useLoaderData();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isTamil = language === "ta";

  const { data: memberData } = useQuery<any>({
    queryKey: ["member-profile", id],
    queryFn: () => api.get<any>(`/members/${id}`),
    initialData: { data: loaderData },
  });
  const m = memberData?.data || loaderData;
  const unlocked = m.isUnlocked || false;

  const token = typeof window !== "undefined" ? localStorage.getItem("ungalkalyanam_token") : null;

  const [tab, setTab] = useState<"about" | "family" | "career" | "preferences">("about");
  const [interestSent, setInterestSent] = useState(m.interestSent || false);
  const [saved, setSaved] = useState(m.isSaved || false);
  const [isBlocked, setIsBlocked] = useState(m.isBlockedByMe || false);
  const [hasBlockedMe, setHasBlockedMe] = useState(m.hasBlockedMe || false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => { setInterestSent(m.interestSent || false); }, [m.interestSent]);
  useEffect(() => { setSaved(m.isSaved || false); }, [m.isSaved]);
  useEffect(() => { setIsBlocked(m.isBlockedByMe || false); }, [m.isBlockedByMe]);
  useEffect(() => { setHasBlockedMe(m.hasBlockedMe || false); }, [m.hasBlockedMe]);

  // Contact request state
  const [isRequesting, setIsRequesting] = useState(false);

  const { data: contactReq } = useQuery<any>({
    queryKey: ["contact-request-check", id],
    queryFn: () => api.get(`/contact-requests/check/${m.userId || m.id}`),
    enabled: !!token && !unlocked,
  });

  const contactStatus = contactReq?.status || null; // pending | accepted | rejected
  const canViewContact = unlocked || contactReq?.can_view;

  const { data: myProfileRes } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
    enabled: !!token,
  });
  const myProfile = myProfileRes?.data;
  const myIsPremium = myProfile?.premium ?? false;
  const isOwnProfile = myProfile?.userId === m.userId;

  const handleSendContactRequest = async () => {
    setIsRequesting(true);
    try {
      const res = await api.post<any>("/contact-requests", { target_id: m.userId || m.id });
      toast.success(res.message || "Contact request sent!");
      queryClient.invalidateQueries({ queryKey: ["contact-request-check", id] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("contact view") || msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("upgrade")) {
        openUpgrade();
      } else {
        toast.error(msg);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const { data: similarData, isLoading: loadingSimilar } = useQuery({
    queryKey: ["similar-profiles", m.religion],
    queryFn: () => api.get<{ data: any[] }>(`/members/browse?religion=${m.religion}&per_page=5`),
  });

  const similarProfiles = (similarData?.data || []).filter((s) => s.id !== m.id).slice(0, 4);

  const photos = [m.photo, ...(m.gallery || [])].filter(Boolean).slice(0, 5).map(p => getImageUrl(p));
  const defaultFallback = m.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
  const mainPhoto = photos[activePhoto] || defaultFallback;

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft" && photos.length > 1) {
        setActivePhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" && photos.length > 1) {
        setActivePhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, photos.length]);

  const handleSendInterest = async () => {
    try {
      await api.post("/interests", { receiver_id: m.userId || m.id });
      toast.success("Interest sent successfully! 💌");
      setInterestSent(true);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member-profile", id] });
    } catch (err: any) {
      if (err.message?.includes("already sent")) {
        setInterestSent(true);
        return;
      }
      const msg = (err?.message || err?.error || "").toLowerCase();
      if (msg.includes("premium") || msg.includes("upgrade")) {
        openUpgrade();
        return;
      }
      if (msg.includes("insufficient") || msg.includes("credits")) {
        openUpgrade();
        return;
      }
      toast.error(err.message || "Failed to send interest. Please log in first.");
    }
  };

  const handleToggleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/saved/${m.userId || m.id}`);
        setSaved(false);
        toast.success("Removed from saved list");
      } else {
        await api.post("/saved", { saved_user_id: m.userId || m.id });
        setSaved(true);
        toast.success("Profile saved successfully ✓");
      }
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member-profile", id] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update saved list.");
    }
  };

  const handleToggleBlock = async () => {
    try {
      if (isBlocked) {
        await api.delete(`/blocks/${m.userId || m.id}`);
        setIsBlocked(false);
        toast.success("User unblocked");
      } else {
        await api.post("/blocks", { blocked_id: m.userId || m.id });
        setIsBlocked(true);
        toast.success("User blocked");
      }
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member-profile", id] });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update block status.");
    }
  };

  const TABS = ["about", "family", "career", "preferences"] as const;

  const content = (
    <div className="w-full pb-10 bg-background min-h-screen">
      {/* ── TOP HEADER (MOBILE & DESKTOP) ──────────────── */}
      <div className="sticky top-0 z-40 flex h-16 w-full items-center gap-3 bg-background/90 px-4 backdrop-blur-md border-b border-border/40 lg:px-8">
        <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => window.history.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-lg font-bold truncate">
          {m.name}'s Profile
        </h1>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:items-start lg:px-8 pt-4 sm:pt-6">
      
      {/* ── LEFT COLUMN: PHOTOS ──────────────── */}
      <div className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24">

      {/* ── MAIN PHOTO CONTAINER ──────────────── */}
      <div className="px-4 pt-0 sm:px-6 lg:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative aspect-[4/5] w-full max-w-[420px] mx-auto overflow-hidden rounded-3xl bg-muted shadow-elevated group cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          {/* Main photo */}
          <AnimatePresence mode="wait">
            <motion.img
              key={activePhoto}
              src={mainPhoto}
              alt={m.name}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = m.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
              }}
            />
          </AnimatePresence>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />

          {/* Fullscreen icon indicator on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm shadow-elevated">
              <Maximize2 className="h-6 w-6" />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute left-4 top-4 flex gap-2 sm:left-6 sm:top-6" onClick={(e) => e.stopPropagation()}>
            {token && (
              <button
                onClick={() => window.history.back()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {m.premium && (
              <span className="flex items-center gap-1.5 rounded-full gradient-gold px-3 py-1.5 text-xs font-bold text-amber-900 shadow-elevated">
                <Crown className="h-3.5 w-3.5" /> Premium
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6" onClick={(e) => e.stopPropagation()}>
            <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              ID: {m.id}
            </span>
          </div>

          {/* Floating Action Buttons overlayed at the bottom inside big container */}
          {!isBlocked && !hasBlockedMe && (
            <div
              className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2 rounded-2xl bg-black/40 border border-white/10 p-2 shadow-elevated backdrop-blur-md max-w-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={handleSendInterest}
                disabled={interestSent}
                className={`flex-1 gap-2 rounded-xl font-semibold transition-all ${
                  interestSent
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"
                    : "gradient-rose text-white hover:opacity-95 shadow-glow"
                }`}
              >
                <Heart className={`h-4 w-4 ${interestSent ? "fill-rose-400 text-rose-400" : ""}`} />
                <span className="text-xs sm:text-sm">{interestSent ? "Interest Sent" : "Send Interest"}</span>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex-1 gap-2 rounded-xl font-semibold border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Link to="/dashboard/messages" search={{ userId: m.id.toString(), userName: m.name, userPhoto: m.photo }}>
                  <MessageCircle className="h-4 w-4" /> <span className="text-xs sm:text-sm">Chat</span>
                </Link>
              </Button>

              <button
                onClick={handleToggleSave}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  saved ? "border-primary/30 bg-primary/20 text-primary-foreground" : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── THUMBNAILS GALLERY (DOWNSIDE/BELOW CONTAINER) ───────────── */}
      {photos.length > 1 && (
        <div className="flex gap-3 mt-4 justify-center px-4 overflow-x-auto py-1">
          {photos.map((p: string, i: number) => {
            const isLocked = !isOwnProfile && !myIsPremium && i > 0;
            return (
              <div
                key={i}
                className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl border-2 ${
                  activePhoto === i
                    ? "border-primary scale-110 shadow-elevated"
                    : "border-border opacity-70"
                }`}
              >
                {isLocked ? (
                  <div className="flex h-full w-full items-center justify-center bg-muted/80">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                ) : (
                  <button
                    onClick={() => setActivePhoto(i)}
                    className="h-full w-full transition-all hover:scale-105 active:scale-95"
                  >
                    <img src={p} alt="" className="h-full w-full object-cover object-top" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* ── RIGHT COLUMN: DETAILS ──────────────── */}
      <div className="flex-1 w-full mt-4 lg:mt-0 flex flex-col gap-4 sm:gap-6">

      {/* ── PROFILE IDENTITY CARD ────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="mx-4 sm:mx-6 lg:mx-0 rounded-3xl border bg-card p-6 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl flex items-center gap-2">
                {m.name}
                {m.verified && (
                  <BadgeCheck className="h-6 w-6 fill-rose-500 text-white shrink-0" />
                )}
              </h1>
            </div>

            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4 shrink-0" /> {m.city}
            </p>

            {/* Quick Stats Grid inside name/city container */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 border-t border-b py-4 my-4 border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Age</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{m.age} yrs</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Ruler className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Height</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{m.height}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Church className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Religion</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{m.religion}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Community</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">{m.community}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Marital Status</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground capitalize">{m.maritalStatus || "Single"}</p>
                </div>
              </div>
            </div>

            {/* Profession & Education Info */}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-muted-foreground/70 shrink-0" /> {m.profession}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-muted-foreground/70 shrink-0" /> {m.education}
              </span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── CONTACT LOCK / UNLOCK ───────────────────────────────────── */}
      {!isBlocked && !hasBlockedMe && (
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="mx-4 sm:mx-6 lg:mx-0"
        >
          <AnimatePresence mode="wait">
            {canViewContact ? (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border bg-card p-5 shadow-soft"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="font-semibold">Contact Information</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{isTamil ? "கைபேசி எண்" : "Phone"}</p>
                      <p className="text-sm font-semibold">{m.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                    <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{isTamil ? "மின்னஞ்சல்" : "Email"}</p>
                      <p className="text-sm font-semibold">{m.email || "—"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : contactStatus === "pending" ? (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border bg-amber-50 dark:bg-amber-950/20 p-5 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Request Pending</p>
                    <p className="text-sm text-muted-foreground">Waiting for {m.name?.split(" ")[0] || "member"} to accept your contact request</p>
                  </div>
                </div>
              </motion.div>
            ) : contactStatus === "rejected" ? (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border bg-card p-5 shadow-soft"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100">
                      <X className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Request Declined</p>
                      <p className="text-sm text-muted-foreground">{m.name?.split(" ")[0] || "Member"} declined your request</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleSendContactRequest} disabled={isRequesting}>
                    {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Again"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="locked"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl gradient-rose p-5 shadow-glow text-white"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg font-bold">Contact details locked</p>
                    <p className="text-sm text-white/80 mt-0.5">
                      {isTamil ? "கிரெடிட்களைப் பயன்படுத்தி காண்க" : "Send request to view contact"}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleSendContactRequest}
                      disabled={isRequesting}
                      className="flex-1 sm:flex-none bg-white text-black hover:bg-white/90 font-semibold shadow-soft"
                    >
                      {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : isTamil ? "கோரிக்கை அனுப்பு" : "Request Contact"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── TABBED DETAIL PANEL ─────────────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" custom={4}
        className="mx-4 sm:mx-6 lg:mx-0 overflow-hidden rounded-2xl border bg-card shadow-soft"
      >
        {/* Tab bar */}
        <div className="flex border-b bg-muted/30">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 px-2 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-5"
          >
            {tab === "about" && (
              <div className="space-y-3">
                <h3 className="font-display text-xl font-bold">About {m.name?.split(" ")[0]}</h3>
                <TranslateText text={m.bio || ""} />
                <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                  <InfoRow label={isTamil ? "புகைப்பிடிப்பவர்" : "Smoker"} value={m.smoking_status} />
                  <InfoRow label={isTamil ? "மது அருந்துபவர்" : "Drinker"} value={m.drinking_status} />
                  <InfoRow label={isTamil ? "ஊனமுற்றவர்" : "Disability"} value={m.disability} />
                </div>
              </div>
            )}

            {tab === "family" && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {m.family && Object.keys(m.family).length > 0
                  ? Object.entries(m.family)
                      .filter(([k]) => !['familyType', 'family_type', 'familyValues', 'family_values'].includes(k))
                      .map(([k, v]) => (
                        <InfoRow key={k} label={k.replace(/([A-Z])/g, " $1")} value={v as string} />
                      ))
                  : <p className="text-sm text-muted-foreground col-span-2">No family details added.</p>
                }
              </div>
            )}

            {tab === "career" && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                <InfoRow label="Profession" value={m.profession} />
                <InfoRow label="Education" value={m.education} />
                <InfoRow label="Annual Income" value={m.income} />
                <InfoRow label="Marital Status" value={m.maritalStatus} />
              </div>
            )}

            {tab === "preferences" && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {m.partnerPrefs && Object.keys(m.partnerPrefs).length > 0
                  ? Object.entries(m.partnerPrefs).map(([k, v]) => (
                      <InfoRow key={k} label={k.replace(/([A-Z])/g, " $1")} value={v as string} />
                    ))
                  : <p className="text-sm text-muted-foreground col-span-2">No partner preferences added.</p>
                }
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── SIMILAR PROFILES ────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show" custom={5}
        className="mx-4 sm:mx-6 lg:mx-0"
      >
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold">Similar Profiles</p>
            </div>
            <Link to="/browse" className="text-xs font-medium text-primary hover:underline underline-offset-4">
              View all
            </Link>
          </div>

          {loadingSimilar ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : similarProfiles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No similar profiles found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {similarProfiles.map((s, i) => (
                <motion.div key={s.id} variants={fadeUp} custom={5 + i * 0.3}>
                  <Link
                    to="/profile/$id"
                    params={{ id: s.id }}
                    className="group block overflow-hidden rounded-xl border bg-muted/30 transition-all hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={getImageUrl(s.photo) || (s.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")}
                        alt=""
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = s.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="truncate text-xs font-semibold text-white">{s.name}, {s.age}</p>
                        <p className="text-[10px] text-white/70">{s.city}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── BLOCK BUTTON ────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} className="mt-8 mb-4 flex justify-center">
        <Button variant="ghost" size="sm" onClick={handleToggleBlock} className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50/50">
          <Ban className="h-4 w-4 mr-2" />
          {isBlocked ? "Unblock User" : "Block User"}
        </Button>
      </motion.div>
      </div>

      {/* ── LIGHTBOX MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Bar */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 text-white/80 z-50">
              <span className="text-sm font-medium tracking-wide">
                {activePhoto + 1} / {photos.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="relative flex h-[80vh] w-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* Active Image */}
              <motion.img
                key={activePhoto}
                src={photos[activePhoto]}
                alt={m.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-full max-w-[90vw] rounded-xl object-contain shadow-elevated"
              />

            </div>

            {/* Bottom thumbnail selector inside lightbox */}
            {photos.length > 1 && (
              <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-[80vw] px-4 py-2" onClick={(e) => e.stopPropagation()}>
                {photos.map((p, idx) => {
                  const isLocked = !isOwnProfile && !myIsPremium && idx > 0;
                  return (
                    <div
                      key={idx}
                      className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activePhoto === idx ? "border-white scale-110" : "border-white/25 opacity-60"
                      } ${isLocked ? "" : "cursor-pointer"}`}
                    >
                      {isLocked ? (
                        <div className="flex h-full w-full items-center justify-center bg-black/60">
                          <Lock className="h-4 w-4 text-white/70" />
                        </div>
                      ) : (
                        <button onClick={() => setActivePhoto(idx)} className="h-full w-full">
                          <img src={p} alt="" className="h-full w-full object-cover" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <div>
          <Navbar />
          <div className="max-w-md mx-auto py-24 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-3">
              {isTamil ? "உள்நுழைவு தேவை" : "Private Profile"}
            </h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm">
              {isTamil 
                ? "சுயவிவரத்தின் முழு விவரங்களைக் காண தயவுசெய்து உங்கள் கணக்கில் உள்நுழையவும்." 
                : "Full profile details, matching calculators, and contact information are reserved for registered members. Please log in to continue."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button className="w-full h-11" onClick={() => window.location.href = '/login'}>
                {isTamil ? "உள்நுழை" : "Log In"}
              </Button>
              <Button variant="outline" className="w-full h-11" onClick={() => window.location.href = '/register'}>
                {isTamil ? "பதிவு செய்" : "Register"}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <DashboardLayout noMargins={true} hideSidebar={true}>
      {content}
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold capitalize">{value || "—"}</p>
      </div>
    </div>
  );
}
