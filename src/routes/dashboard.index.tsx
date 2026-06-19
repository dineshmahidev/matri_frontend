import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Progress } from "@/components/ui/progress";
import { Heart, Crown, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/matrimony/ProfileCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { ProfileCompletionDialog } from "@/components/matrimony/ProfileCompletionDialog";
import { useUpgrade } from "@/lib/upgrade";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Ungalkalyanam" }] }),
  component: Dashboard,
});

type DashboardDataType = {
  user: {
    name: string;
    profile_completion: number;
    profile_complete?: boolean;
    missing_fields?: string[];
    membership: string;
    membership_valid_until: string | null;
    credits: number;
    photo?: string | null;
  };
  stats: {
    profile_views: string;
    profile_views_change: string;
    interests_received: number;
    interests_sent: number;
    messages: string;
  };
  matches: any[];
  notifications: any[];
  payments: any[];
};

const DISMISS_KEY = "ungalkalyanam_profile_popup_dismissed";

function Dashboard() {
  const { language, t } = useLanguage();
  const { openUpgrade } = useUpgrade();
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const { data, isLoading, isError } = useQuery<DashboardDataType>({
    queryKey: ["dashboard-data"],
    queryFn: () => api.get<DashboardDataType>("/dashboard"),
  });

  useEffect(() => {
    if (!data) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    const incomplete = data.user.profile_complete === false || data.user.profile_completion < 100;
    if (!dismissed && incomplete) {
      setShowCompletionPopup(true);
    }
  }, [data]);

  const dismissPopup = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShowCompletionPopup(false);
  };

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">{language === "ta" ? "டேஷ்போர்டை ஏற்ற முடியவில்லை" : "Failed to load dashboard"}</p>
          <Button onClick={() => window.location.reload()}>{language === "ta" ? "மீண்டும் முயற்சிக்கவும்" : "Retry"}</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const { user, matches = [], stats = { interests_received: 0 } as DashboardDataType['stats'] } = data;
  const completion = user.profile_completion;

  return (
    <DashboardLayout>
      <ProfileCompletionDialog
        open={showCompletionPopup}
        onOpenChange={(open) => {
          if (!open) dismissPopup();
          else setShowCompletionPopup(true);
        }}
        completionPercent={completion}
        missingFields={user.missing_fields ?? []}
        language={language}
      />

      <div className="space-y-6 text-left animate-fade-in">
        <div className="overflow-hidden rounded-3xl gradient-rose p-7 text-white shadow-glow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={user.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white/20 object-cover shadow-sm shrink-0"
                alt="Profile"
              />
              <div>
                <p className="text-sm text-white/80">{language === "ta" ? "மீண்டும் வருக," : "Welcome back,"}</p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">{user.name}</h1>
                <p className="mt-1 text-sm text-white/80">
                  {language === "ta" ? `இன்று உங்களுக்கு ${matches.length} புதிய வரன்கள் உள்ளன ✨` : `You have ${matches.length} new matches today ✨`}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 w-full" onClick={openUpgrade}>
                <Crown className="mr-1.5 h-4 w-4" /> {language === "ta" ? "மேம்படுத்து" : "Upgrade Plan"}
              </Button>
            </div>
          </div>
        </div>

        {completion < 100 && (
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold">{language === "ta" ? "சுயவிவர முழுமை" : "Profile completion"}</p>
                <p className="text-xs text-muted-foreground">
                  {language === "ta" ? "முழுமையான சுயவிவரம் அதிக பொருத்தங்களைத் தருகிறது" : "Complete profiles get more matches"}
                </p>
              </div>
              <span className="font-display text-2xl font-bold text-primary">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2 mb-3" />
            <Button asChild size="sm" variant="secondary">
              <Link to="/complete-profile">
                <Heart className="mr-1.5 h-4 w-4" />
                {language === "ta" ? "சுயவிவரத்தை முடிக்கவும்" : "Complete profile"}
              </Link>
            </Button>
          </div>
        )}

        <div>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold">{t("recommendedMatches")}</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/browse">{language === "ta" ? "அனைத்தையும் காண்க" : "See all"}</Link></Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {matches.map((m, i) => <ProfileCard key={m.id} m={m} index={i} />)}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
              {stats.interests_received > 0 ? (
                <><Heart className="h-5 w-5 text-pink-500 fill-pink-500" /> {language === "ta" ? "பெற்ற விருப்பங்கள்" : "Recent Interests Received"}</>
              ) : (
                <><UserPlus className="h-5 w-5 text-primary" /> {language === "ta" ? "சமீபத்தில் சேர்ந்தவர்கள்" : "Recently Joined"}</>
              )}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={stats.interests_received > 0 ? "/dashboard/messages" : "/recently-joined"}>
                {language === "ta" ? "அனைத்தையும் காண்க" : "View all"}
              </Link>
            </Button>
          </div>
          {stats.interests_received > 0 ? (
            <ReceivedInterests />
          ) : (
            <RecentlyJoinedFallback />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReceivedInterests() {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["interests-received-dashboard"],
    queryFn: () => api.get<{ data: any[] }>("/interests/received"),
  });

  const interests = data?.data || [];

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (interests.length === 0) {
    return <RecentlyJoinedFallback />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {interests.slice(0, 3).map((m: any, i: number) => <ProfileCard key={m.id} m={m} index={i} />)}
    </div>
  );
}

function RecentlyJoinedFallback() {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["recently-joined-dashboard"],
    queryFn: () => api.get<{ data: any[] }>("/members/recently-joined"),
  });

  const members = data?.data || [];

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (members.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed">
        <p className="text-sm text-muted-foreground">{language === "ta" ? "சமீபத்தில் யாரும் சேரவில்லை" : "No recently joined members"}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {members.slice(0, 3).map((m: any, i: number) => <ProfileCard key={m.id} m={m} index={i} />)}
    </div>
  );
}
