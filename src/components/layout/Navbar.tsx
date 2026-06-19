import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Bell, X, LayoutDashboard, MessageCircle, User, LogOut, Bookmark, Send, Inbox, Crown, Users, MoreVertical, Home, Globe, Sparkles, CreditCard, Heart, Newspaper } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/language";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/lib/theme";
import { useUpgrade } from "@/lib/upgrade";

const NAV = [
  { to: "/", label: "Home", key: "home", icon: Home },
  { to: "/browse", label: "Browse", key: "browse", icon: Globe },
  { to: "/premium-members", label: "Premium", key: "premium", icon: Sparkles },
  { to: "/pricing", label: "Pricing", key: "pricing", icon: CreditCard },
  { to: "/success-stories", label: "Success Stories", key: "successStories", icon: Heart },
  { to: "/blog", label: "Blog", key: "blog", icon: Newspaper },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { language, setLanguage, t } = useLanguage();
  const token = typeof window !== "undefined" ? localStorage.getItem("ungalkalyanam_token") : null;
  const [showDrawer, setShowDrawer] = useState(false);
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";
  const { openUpgrade } = useUpgrade();

  const handleLogout = () => {
    localStorage.removeItem("ungalkalyanam_token");
    localStorage.removeItem("ungalkalyanam_user");
    window.location.href = "/login";
  };

  if (token) {
    return (
      <>
        <MemberTopbar onOpenMenu={() => setShowDrawer(true)} />

        {/* Floating Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-4 left-4 right-4 z-40 flex h-16 items-center justify-around rounded-2xl border border-[rgba(212,175,55,0.20)] bg-card/90 px-3 py-1 shadow-glow backdrop-blur-md lg:hidden">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            path === "/dashboard" ? "text-primary" : "text-muted-foreground"
          }`}>
            <LayoutDashboard className="h-5 w-5" fill={path === "/dashboard" ? "currentColor" : "none"} />
            <span>Home</span>
          </Link>
          <Link to="/browse" className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            path === "/browse" ? "text-primary" : "text-muted-foreground"
          }`}>
            <Users className="h-5 w-5" fill={path === "/browse" ? "currentColor" : "none"} />
            <span>Member</span>
          </Link>
          <Link to="/dashboard/messages" className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            path.startsWith("/dashboard/messages") ? "text-primary" : "text-muted-foreground"
          }`}>
            <MessageCircle className="h-5 w-5" fill={path.startsWith("/dashboard/messages") ? "currentColor" : "none"} />
            <span>Messages</span>
          </Link>
          <Link to="/dashboard/profile" className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            path.startsWith("/dashboard/profile") ? "text-primary" : "text-muted-foreground"
          }`}>
            <User className="h-5 w-5" fill={path.startsWith("/dashboard/profile") ? "currentColor" : "none"} />
            <span>Profile</span>
          </Link>
        </nav>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {showDrawer && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDrawer(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="absolute inset-y-0 right-0 flex w-72 flex-col border-l border-[rgba(212,175,55,0.15)] bg-card shadow-2xl"
              >
                <header className="flex h-16 items-center justify-between border-b border-[rgba(212,175,55,0.15)] px-4">
                  <Link to="/" className="flex items-center">
                    <img src={logoSrc} alt="Ungal Kalyanam" className="h-16 w-auto object-contain" />
                  </Link>
                  <button onClick={() => setShowDrawer(false)} className="rounded-full p-1.5 hover:bg-muted">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-left">
                  <Link to="/dashboard" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><LayoutDashboard className="h-4 w-4 text-[#D4AF37]" /> Home</Link>
                  <Link to="/dashboard/profile" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><User className="h-4 w-4 text-[#D4AF37]" /> My Profile</Link>
                  <Link to="/dashboard/messages" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><MessageCircle className="h-4 w-4 text-[#D4AF37]" /> Messages</Link>
                  <Link to="/dashboard/notifications" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><Bell className="h-4 w-4 text-[#D4AF37]" /> Notifications</Link>
                  <Link to="/saved" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><Bookmark className="h-4 w-4 text-[#D4AF37]" /> Saved Profiles</Link>
                  <Link to="/interests-sent" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><Send className="h-4 w-4 text-[#D4AF37]" /> Interests Sent</Link>
                  <Link to="/interests-received" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><Inbox className="h-4 w-4 text-[#D4AF37]" /> Interests Received</Link>
                  <button onClick={() => { setShowDrawer(false); openUpgrade(); }} className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"><Crown className="h-4 w-4 text-[#D4AF37]" /> Upgrade Premium</button>

                  <button
                    onClick={() => { setShowDrawer(false); handleLogout(); }}
                    className="w-full text-left mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo Image */}
        <Link to="/" className="flex items-center shrink-0 -my-2">
          <img
            src={logoSrc}
            alt="Ungal Kalyanam"
            className="h-20 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-[rgba(212,175,55,0.12)] text-[#D4AF37] dark:text-[#FFD966]"
                    : "text-foreground/70 hover:bg-[rgba(212,175,55,0.08)] hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {t(n.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className="flex items-center gap-1 rounded-full border border-[rgba(212,175,55,0.30)] bg-[rgba(212,175,55,0.06)] px-3 py-1.5 text-xs font-bold hover:bg-[rgba(212,175,55,0.12)] transition-colors"
            title="Switch Language"
          >
            <span className={language === "en" ? "text-[#D4AF37]" : "text-muted-foreground"}>EN</span>
            <span className="text-muted-foreground/40">|</span>
            <span className={language === "ta" ? "text-[#D4AF37]" : "text-muted-foreground"}>தமிழ்</span>
          </button>
          <Button asChild variant="ghost" size="sm" className="hover:text-[#D4AF37]">
            <Link to="/login">{t("login")}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="gradient-gold text-[#1A0808] font-semibold shadow-gold hover:opacity-90 transition-all"
          >
            <Link to="/register">{t("joinFree")}</Link>
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[rgba(212,175,55,0.15)] bg-background md:hidden"
          >
            <div className="flex flex-col p-4">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                    path === n.to ? "text-[#D4AF37] bg-[rgba(212,175,55,0.08)]" : "hover:bg-muted"
                  }`}
                >
                  <n.icon className="h-4 w-4" style={{ color: "#D4AF37" }} />
                  {t(n.key)}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-xl border border-[rgba(212,175,55,0.20)] bg-[rgba(212,175,55,0.05)] px-4 py-2.5">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[rgba(212,175,55,0.20)] bg-[rgba(212,175,55,0.05)] px-4 py-2.5 text-sm font-bold hover:bg-[rgba(212,175,55,0.10)] transition-colors w-full"
                >
                  <span className={language === "en" ? "text-[#D4AF37]" : "text-muted-foreground"}>English</span>
                  <span className="text-muted-foreground/40">|</span>
                  <span className={language === "ta" ? "text-[#D4AF37]" : "text-muted-foreground"}>தமிழ்</span>
                </button>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 border-[rgba(212,175,55,0.30)] hover:border-[#D4AF37]" onClick={() => setOpen(false)}>
                    <Link to="/login">{t("login")}</Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 gradient-gold text-[#1A0808] font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/register">{t("joinFree")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function MemberTopbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchVal.trim()) {
      navigate({ to: "/search", search: { q: searchVal.trim() } });
    }
  };

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center shrink-0 -my-2">
          <img
            src={logoSrc}
            alt="Ungal Kalyanam"
            className="h-20 w-auto object-contain"
          />
        </Link>
        <div className="hidden flex-1 max-w-md md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4AF37]" />
            <input
              placeholder="Search by name, ID, city, caste..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-10 w-full rounded-full border border-[rgba(212,175,55,0.25)] bg-background pl-10 pr-4 text-sm outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="h-9 w-9 hover:text-[#D4AF37]">
            <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex border-[rgba(212,175,55,0.30)] hover:border-[#D4AF37] hover:text-[#D4AF37]">
            <Link to="/dashboard">{t("dashboard")}</Link>
          </Button>
          <button onClick={onOpenMenu} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
