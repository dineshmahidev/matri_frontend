import { useState, ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";
import { Heart, LayoutDashboard, User, Bell, CreditCard, MessageCircle, MessageSquare, Bookmark, Send, Inbox, Crown, LogOut, Search, Menu, X, Globe, Users, Home, Upload } from "lucide-react";
import { MemberTopbar } from "./Navbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useUpgrade } from "@/lib/upgrade";

const NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/browse", label: "Members", icon: Users },
  { to: "/dashboard/profile", label: "My Profile", icon: User },
  { to: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/saved", label: "Saved Profiles", icon: Bookmark },
  { to: "/interests-sent", label: "Interests Sent", icon: Send },
  { to: "/interests-received", label: "Interests Received", icon: Inbox },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/support-tickets", label: "Support Tickets", key: "supportTickets", icon: MessageSquare },
  { to: "/pricing", label: "Upgrade", icon: Crown, upgrade: true },
];

export function DashboardLayout({ children, hideMobileNav = false, noMargins = false, hideSidebar = false }: { children: ReactNode; hideMobileNav?: boolean; noMargins?: boolean; hideSidebar?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [showDrawer, setShowDrawer] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { resolvedTheme } = useTheme();
  const { openUpgrade } = useUpgrade();
  const logoSrc = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
    navigate({ to: "/login" });
  };

  return (
    <div className={`min-h-screen bg-muted/30 ${hideMobileNav ? '' : 'pb-24'} lg:pb-0`}>
      {!hideMobileNav && <MemberTopbar onOpenMenu={() => setShowDrawer(true)} />}
      <div className={`mx-auto ${hideSidebar ? 'block' : 'grid lg:grid-cols-[260px_1fr]'} ${noMargins ? 'w-full max-w-none p-0 gap-0' : 'max-w-7xl gap-6 px-4 py-6 sm:px-6'}`}>
        {/* Desktop Sidebar */}
        {!hideSidebar && (
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1 rounded-2xl border bg-card p-3 shadow-soft">
            {NAV.map((n: any) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              const Icon = n.icon;
              if (n.upgrade) {
                return (
                  <button onClick={openUpgrade} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-foreground/75 hover:bg-muted text-left">
                    <Icon className="h-4 w-4" /> {n.label}
                  </button>
                );
              }
              return (
                <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-foreground/75 hover:bg-muted"
                }`}>
                  <Icon className="h-4 w-4" fill={active ? "currentColor" : "none"} /> {n.label}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="w-full text-left mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </aside>
        )}

        {/* Main Content Area */}
        <main className="min-w-0">{children}</main>
      </div>

      {/* Floating Modern Mobile Bottom Navigation Bar */}
      {!hideMobileNav && (
        <nav className="fixed bottom-4 left-4 right-4 z-40 flex h-16 items-center justify-around rounded-2xl border border-black/80 dark:border-white/20 bg-card/90 px-3 py-1 shadow-glow backdrop-blur-md lg:hidden">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
          path === "/dashboard" ? "text-primary" : "text-muted-foreground"
        }`}>
          <Home className="h-5 w-5" fill={path === "/dashboard" ? "currentColor" : "none"} />
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
      )}

      {/* Mobile Drawer (More Features) */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div onClick={() => setShowDrawer(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" />
          
          {/* Drawer Body */}
          <div className="absolute inset-y-0 right-0 flex w-72 flex-col border-l bg-card shadow-2xl transition-transform duration-300">
            <header className="flex h-16 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <img src={logoSrc} alt="Ungal Kalyanam" className="h-10 w-auto object-contain" />
              </div>
              <button onClick={() => setShowDrawer(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <div className="pb-3 border-b mb-3 flex flex-col gap-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</span>
                  <button 
                    onClick={() => setLanguage(language === "en" ? "ta" : "en")} 
                    className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                  >
                    <Globe className="h-3 w-3" />
                    {language === "en" ? "தமிழ்" : "English"}
                  </button>
                </div>
              </div>

              {NAV.map((n: any) => {
                const active = n.exact ? path === n.to : path.startsWith(n.to);
                const Icon = n.icon;
                if (n.upgrade) {
                  return (
                    <button onClick={() => { setShowDrawer(false); openUpgrade(); }} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-foreground/75 hover:bg-muted text-left">
                      <Icon className="h-4 w-4" /> {n.label}
                    </button>
                  );
                }
                return (
                  <Link 
                    key={n.to} 
                    to={n.to} 
                    onClick={() => setShowDrawer(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-foreground/75 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" fill={active ? "currentColor" : "none"} /> {n.label}
                  </Link>
                );
              })}

              <button 
                onClick={() => { setShowDrawer(false); handleLogout(); }} 
                className="w-full text-left mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminLayout({ children, role = "Admin" }: { children: ReactNode; role?: "Admin" | "Staff" }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";
  const profileEndpoint = role === "Admin" ? "/admin/profile" : "/staff/profile";
  const profileKey = role === "Admin" ? ["admin-profile"] : ["staff-profile"];
  const { data: profile } = useQuery<any>({
    queryKey: profileKey,
    queryFn: () => api.get(profileEndpoint),
    retry: false,
  });

  const ADMIN = [
    { to: "/uk-control", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/uk-control/users", label: "Users", icon: User },
    { to: "/uk-control/leads", label: "Leads", icon: Inbox },
    { to: "/uk-control/staff", label: "Staff", icon: User },
    { to: "/uk-control/payments", label: "Payments", icon: CreditCard },
    { to: "/uk-control/reports", label: "Reports", icon: LayoutDashboard },
    { to: "/uk-control/cms", label: "CMS", icon: Bookmark },
    { to: "/uk-control/support-tickets", label: "Support Tickets", icon: MessageSquare },
    { to: "/uk-control/bulk-upload", label: "Bulk Upload", icon: Upload },
    { to: "/uk-control/edit-profile", label: "Edit Profile", icon: User },
  ];
  const STAFF = [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/staff/users", label: "Users", icon: User },
    { to: "/staff/leads", label: "Assigned Leads", icon: Inbox },
    { to: "/staff/notes", label: "Member Notes", icon: Bookmark },
    { to: "/staff/create-user", label: "Create User", icon: User },
    { to: "/staff/edit-profile", label: "Edit Profile", icon: User },
  ];
  const nav = role === "Admin" ? ADMIN : STAFF;
  const photoUrl = profile?.photo;
  const userName = profile?.name;

  const navigate = useNavigate();
  const { logout: adminAuthLogout } = useAuth();

  const handleLogout = () => {
    adminAuthLogout();
    navigate({ to: "/login" });
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-between px-2">
        <Link to="/" className="flex items-center gap-2">
          <div>
            <img src={logoSrc} alt="Ungal Kalyanam" className="h-10 w-auto object-contain" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{role} Panel</p>
          </div>
        </Link>
        <button onClick={() => setShowMobileSidebar(false)} className="rounded-full p-1.5 hover:bg-muted lg:hidden">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      <div className="mt-6 space-y-1 flex-1">
        {nav.map((n) => {
          const active = n.exact ? path === n.to : path.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link 
              key={n.to} 
              to={n.to} 
              onClick={() => setShowMobileSidebar(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/75 hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </div>
      <button 
        onClick={handleLogout} 
        className="w-full text-left mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar p-4 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div onClick={() => setShowMobileSidebar(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          {/* Drawer Body */}
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r bg-sidebar p-4 shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 glass">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center">
              <button 
                onClick={() => setShowMobileSidebar(true)} 
                className="mr-3 rounded-full p-1.5 hover:bg-muted lg:hidden" 
                aria-label="Toggle Navigation"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div className="relative hidden flex-1 max-w-md md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Search..." className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                {userName && <span className="hidden text-sm font-medium sm:block">{userName}</span>}
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="h-9 w-9 rounded-full object-cover border" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-rose" />
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
