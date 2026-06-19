import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileCard } from "@/components/matrimony/ProfileCard";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { RELIGIONS, CASTES, MOTHER_TONGUES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import notFoundGif from "../../dad9a054-116e-11ee-aef8-9bf427a69ce4.gif";

export const Route = createFileRoute("/browse")({
  head: () => ({ meta: [{ title: "Browse Profiles — Ungalkalyanam" }] }),
  component: Browse,
});

type FilterType = {
  gender: string;
  ageMin: number;
  ageMax: number;
  religion: string;
  caste: string;
  motherTongue: string;
  city: string;
  education: string;
};

// Reusable Presentation Layout for lists like Search, Saved Profiles, Premium Members, etc.
type BrowseLayoutProps = {
  title: string;
  subtitle: string;
  members: any[];
  children?: ReactNode;
};

export function BrowseLayout({ title, subtitle, members, children }: BrowseLayoutProps) {
  const { language } = useLanguage();
  const token = typeof window !== 'undefined' ? localStorage.getItem('ungalkalyanam_token') : null;

  const content = (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl font-bold sm:text-4xl">{title}</h1>
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[1fr]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
          {members.length > 0 ? (
            members.map((m, i) => <ProfileCard key={m.id} m={m} index={i} />)
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              {language === "ta" ? "சுயவிவரங்கள் எதுவும் கிடைக்கவில்லை." : "No members found."}
            </div>
          )}
        </div>
      </div>
      {children}
    </section>
  );

  if (token) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        {content}
      </div>
      <Footer />
    </div>
  );
}

function Browse() {
  const { language, t } = useLanguage();
  const token = typeof window !== 'undefined' ? localStorage.getItem('ungalkalyanam_token') : null;
  const [activeTab, setActiveTab] = useState<"all" | "recommended" | "saved" | "newjoin">("all");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterType>({
    gender: "",
    ageMin: 18,
    ageMax: 60,
    religion: "",
    caste: "",
    motherTongue: "",
    city: "",
    education: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: myProfile } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
    enabled: !!token,
  });
  const myGender = myProfile?.data?.gender;
  const loggedInGender = myGender ? (myGender.toLowerCase() === "male" ? "Male" : "Female") : null;
  const oppositeGender = loggedInGender === "Male" ? "Female" : loggedInGender === "Female" ? "Male" : null;

  // Auto-set opposite-gender filter for logged-in users
  const [genderInitialized, setGenderInitialized] = useState(false);
  useEffect(() => {
    if (token && oppositeGender && !filters.gender) {
      setFilters(prev => ({ ...prev, gender: oppositeGender }));
      setGenderInitialized(true);
    }
    if (token && myProfile?.data && !oppositeGender && !filters.gender) {
      setGenderInitialized(true);
    }
    if (!token) setGenderInitialized(true);
  }, [token, oppositeGender, myProfile]);

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  if (filters.gender) queryParams.append("gender", filters.gender.toLowerCase());
  if (filters.ageMin) queryParams.append("age_min", filters.ageMin.toString());
  if (filters.ageMax) queryParams.append("age_max", filters.ageMax.toString());
  if (filters.religion) queryParams.append("religion", filters.religion);
  if (filters.caste) queryParams.append("caste", filters.caste);
  if (filters.motherTongue) queryParams.append("mother_tongue", filters.motherTongue);
  if (filters.city) queryParams.append("city", filters.city);
  if (filters.education) queryParams.append("education", filters.education);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["members", filters, activeTab, page],
    queryFn: () => {
      if (activeTab === "saved") {
        return api.get<any>("/saved");
      }
      if (activeTab === "recommended") {
        return api.get<any>(`/members/recommended?page=${page}`);
      }
      if (activeTab === "newjoin") {
        return api.get<any>(`/members/recently-joined?page=${page}`);
      }
      return api.get<any>(`/members/browse?${queryParams.toString()}`);
    },
    enabled: genderInitialized,
  });

  const members = data?.data || [];
  const meta = data?.meta || null;
  const filteredMembers = searchQuery 
    ? members.filter((m: any) => {
        const q = searchQuery.toLowerCase();
        return m.name?.toLowerCase().includes(q) || 
               m.id?.toLowerCase().includes(q) ||
               m.community?.toLowerCase().includes(q) ||
               m.religion?.toLowerCase().includes(q);
      })
    : members;

  // Reset page when filters change
  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* App-like Member Header */}
      <header className="sticky top-16 z-30 glass border-b shadow-sm">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 max-w-7xl mx-auto">
          {token && (
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="hidden lg:flex p-2 -ml-2 rounded-full hover:bg-muted shrink-0 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          <h1 className="font-display text-xl font-bold shrink-0">{language === "ta" ? "வரன்கள்" : "Member"}</h1>
          <div className="relative flex-1 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder={language === "ta" ? "தேடுங்கள்..." : "Search members..."}
              className="h-10 w-full rounded-full bg-muted/50 border border-input pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className={`p-2 rounded-full hover:bg-muted shrink-0 transition-colors lg:hidden ${activeTab !== 'all' ? 'hidden' : ''}`}>
                <SlidersHorizontal className="h-5 w-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
              <Filters filters={filters} onChange={handleFilterChange} isLoggedIn={!!token} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          <button 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'recommended' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('recommended'); setPage(1); }}
          >
            Recommended
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('all'); setPage(1); }}
          >
            All Members
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('saved'); setPage(1); }}
          >
            Saved
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'newjoin' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setActiveTab('newjoin'); setPage(1); }}
          >
            {language === "ta" ? "புதிய இணைப்புகள்" : "New Join"}
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-soft">
                <Filters filters={filters} onChange={handleFilterChange} isLoggedIn={!!token} />
              </div>
            </aside>
            <div>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
                  <p className="text-muted-foreground">{language === "ta" ? "ஏதோ தவறு ஏற்பட்டது." : "Something went wrong loading profiles."}</p>
                  <Button variant="outline" size="sm" onClick={() => setPage(1)}>Try again</Button>
                </div>
              ) : (
                <ErrorBoundary>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-fade-in">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((m: any, i: number) => <ProfileCard key={m.id} m={m} index={i} />)
                    ) : (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 max-w-full mb-4 flex items-center justify-center">
                          <img src={notFoundGif} alt="Not found" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="font-display text-lg font-semibold mb-1">
                          {language === "ta" ? "சுயவிவரங்கள் காணப்படவில்லை" : "No profiles found"}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-sm mb-6">
                          {searchQuery 
                            ? (language === "ta" ? `"${searchQuery}" என்ற தேடலுக்கு எந்த வரனும் கிடைக்கவில்லை.` : `We couldn't find any profiles matching "${searchQuery}".`)
                            : (language === "ta" ? "உங்கள் வடிப்பான்களுக்கு எந்த வரனும் கிடைக்கவில்லை." : "We couldn't find any profiles matching your filters.")}
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setFilters({ gender: "", ageMin: 18, ageMax: 60, religion: "", caste: "", motherTongue: "", city: "", education: "" });
                            setPage(1);
                          }}
                        >
                          {language === "ta" ? "தேடலை அகற்று" : "Clear Search & Filters"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Pagination */}
                  {meta && meta.last_page > 1 && (
                    <Pagination
                      currentPage={meta.current_page}
                      lastPage={meta.last_page}
                      total={meta.total}
                      perPage={meta.per_page}
                      onPageChange={setPage}
                    />
                  )}
                </ErrorBoundary>
              )}
            </div>
          </div>
        )}

        {activeTab === 'recommended' && (
          <div className="mt-8">
            {!token ? (
              <div className="max-w-md mx-auto py-16 px-6 flex flex-col items-center justify-center text-center bg-card rounded-2xl border shadow-soft animate-fade-in">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  {language === "ta" ? "உள்நுழையவும்" : "Login Required"}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                  {language === "ta" ? "பரிந்துரைக்கப்பட்ட சுயவிவரங்களைக் காண தயவுசெய்து உங்கள் கணக்கில் உள்நுழையவும்." : "Please log in to view profiles recommended for you based on your partner preferences."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button className="w-full" onClick={() => window.location.href = '/login'}>
                    {language === "ta" ? "உள்நுழை" : "Log In"}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/register'}>
                    {language === "ta" ? "பதிவு செய்" : "Register"}
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ErrorBoundary>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m: any, i: number) => <ProfileCard key={m.id} m={m} index={i} />)
                  ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 max-w-full mb-4 flex items-center justify-center">
                        <img src={notFoundGif} alt="Not found" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-1">
                        {language === "ta" ? "பரிந்துரைக்கப்பட்ட சுயவிவரங்கள் இல்லை" : "No recommended profiles"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {language === "ta" ? "உங்கள் விருப்பங்களுக்கு பொருந்தக்கூடிய வரன்கள் எதுவும் இல்லை. உங்கள் கணக்கு அமைப்புகளில் உங்கள் விருப்பங்களைப் புதுப்பிக்கவும்." : "No profiles match your partner preferences. Try updating your preferences in your account settings."}
                      </p>
                    </div>
                  )}
                  {/* Pagination for recommended */}
                  {meta && meta.last_page > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={meta.current_page}
                        lastPage={meta.last_page}
                        total={meta.total}
                        perPage={meta.per_page}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="mt-8">
            {!token ? (
              <div className="max-w-md mx-auto py-16 px-6 flex flex-col items-center justify-center text-center bg-card rounded-2xl border shadow-soft animate-fade-in">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  {language === "ta" ? "உள்நுழையவும்" : "Login Required"}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                  {language === "ta" ? "நீங்கள் சேமித்த சுயவிவரங்களைக் காண தயவுசெய்து உங்கள் கணக்கில் உள்நுழையவும்." : "Please log in to view and manage your saved/bookmarked profiles."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button className="w-full" onClick={() => window.location.href = '/login'}>
                    {language === "ta" ? "உள்நுழை" : "Log In"}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/register'}>
                    {language === "ta" ? "பதிவு செய்" : "Register"}
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ErrorBoundary>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m: any, i: number) => <ProfileCard key={m.id} m={m} index={i} />)
                  ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 max-w-full mb-4 flex items-center justify-center">
                        <img src={notFoundGif} alt="Not found" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-1">
                        {language === "ta" ? "சேமிக்கப்பட்ட சுயவிவரங்கள் இல்லை" : "No saved profiles"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {language === "ta" ? "நீங்கள் இன்னும் எந்த சுயவிவரங்களையும் சேமிக்கவில்லை." : "You haven't saved any profiles yet."}
                      </p>
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>
        )}

        {activeTab === 'newjoin' && (
          <div className="mt-8">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ErrorBoundary>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                  {members.length > 0 ? (
                    members.map((m: any, i: number) => <ProfileCard key={m.id} m={m} index={i} />)
                  ) : (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 max-w-full mb-4 flex items-center justify-center">
                        <img src={notFoundGif} alt="Not found" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-1">
                        {language === "ta" ? "புதிய இணைப்புகள் இல்லை" : "No recent joins"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {language === "ta" ? "சமீபத்தில் புதிய உறுப்பினர்கள் யாரும் சேரவில்லை." : "No new members joined recently."}
                      </p>
                    </div>
                  )}
                </div>
              </ErrorBoundary>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Pagination Component ── */
function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}) {
  const { language } = useLanguage();
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  // Generate visible page numbers (max 5 at a time)
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < lastPage - 2) pages.push("...");
      pages.push(lastPage);
    }
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {language === "ta"
          ? `${total} சுயவிவரங்களில் ${from}–${to} காட்டப்படுகிறது`
          : `Showing ${from}–${to} of ${total} profiles`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-sm transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === p
                  ? "gradient-rose text-white shadow-sm"
                  : "border bg-card hover:bg-accent"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-sm transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Filters({ filters, onChange, isLoggedIn }: { filters: FilterType; onChange: (f: FilterType) => void; isLoggedIn?: boolean }) {
  const { language, t } = useLanguage();
  const [age, setAge] = useState([filters.ageMin, filters.ageMax]);

  const handleGenderChange = (gender: string) => {
    onChange({ ...filters, gender: filters.gender === gender ? (isLoggedIn ? gender : "") : gender });
  };

  const handleSelectChange = (key: keyof FilterType, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const applyAgeFilter = () => {
    onChange({ ...filters, ageMin: age[0], ageMax: age[1] });
  };

  return (
    <div className="space-y-5 text-left">
      <h3 className="font-display text-lg font-semibold">{t("filters")}</h3>
      
      {!isLoggedIn && (
      <Section label={t("lookingFor")}>
        <div className="flex gap-2">
          {["Bride", "Groom"].map((x) => {
            const val = x === "Bride" ? "Female" : "Male";
            const active = filters.gender === val;
            return (
              <button 
                key={x} 
                onClick={() => handleGenderChange(val)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                  active ? "border-primary bg-primary/10 text-primary" : "hover:border-primary hover:text-primary"
                }`}
              >
                {x === "Bride" ? t("bride") : t("groom")}
              </button>
            );
          })}
        </div>
      </Section>
      )}

      <Section label={`${t("age")}: ${age[0]} – ${age[1]} yrs`}>
        <input 
          type="range" 
          min={18} 
          max={60} 
          value={age[1]} 
          onChange={(e) => setAge([age[0], +e.target.value])} 
          onMouseUp={applyAgeFilter}
          onTouchEnd={applyAgeFilter}
          className="w-full accent-primary" 
        />
      </Section>

      <Section label={t("religion")}>
        <select 
          className="field" 
          value={filters.religion} 
          onChange={(e) => handleSelectChange("religion", e.target.value)}
        >
          <option value="">{t("allReligions")}</option>
          {RELIGIONS.map((r) => <option key={r} value={r}>{language === "ta" ? (OPTION_TRANSLATIONS[r] || r) : r}</option>)}
        </select>
      </Section>

      <Section label={t("caste")}>
        <select 
          className="field" 
          value={filters.caste} 
          onChange={(e) => handleSelectChange("caste", e.target.value)}
        >
          <option value="">{language === "ta" ? "அனைத்து சாதிகள்" : "All Castes"}</option>
          {(filters.religion ? (RELIGION_CASTE_MAP[filters.religion] || ["Other"]) : CASTES).map((c) => <option key={c} value={c}>{language === "ta" ? (OPTION_TRANSLATIONS[c] || c) : c}</option>)}
        </select>
      </Section>

      <Section label={t("motherTongue")}>
        <select 
          className="field" 
          value={filters.motherTongue} 
          onChange={(e) => handleSelectChange("motherTongue", e.target.value)}
        >
          <option value="">{t("allTongues")}</option>
          {MOTHER_TONGUES.map((l) => <option key={l} value={l}>{language === "ta" ? (OPTION_TRANSLATIONS[l] || l) : l}</option>)}
        </select>
      </Section>

      <Section label={t("city")}>
        <select 
          className="field" 
          value={filters.city} 
          onChange={(e) => handleSelectChange("city", e.target.value)}
        >
          <option value="">{t("allCities")}</option>
          <option value="Chennai">{language === "ta" ? "சென்னை" : "Chennai"}</option>
          <option value="Bengaluru">{language === "ta" ? "பெங்களூரு" : "Bengaluru"}</option>
          <option value="Mumbai">{language === "ta" ? "மும்பை" : "Mumbai"}</option>
          <option value="Delhi">{language === "ta" ? "டெல்லி" : "Delhi"}</option>
          <option value="Hyderabad">{language === "ta" ? "ஹைதராபாத்" : "Hyderabad"}</option>
          <option value="Pune">{language === "ta" ? "புனே" : "Pune"}</option>
        </select>
      </Section>

      <Section label={t("education")}>
        <select 
          className="field" 
          value={filters.education} 
          onChange={(e) => handleSelectChange("education", e.target.value)}
        >
          <option value="">{t("allDegrees")}</option>
          <option>B.Tech</option>
          <option>MBA</option>
          <option>MBBS</option>
          <option>M.Tech</option>
          <option>CA</option>
        </select>
      </Section>

      <Button onClick={() => onChange({
        gender: filters.gender,
        ageMin: 18,
        ageMax: 60,
        religion: "",
        caste: "",
        motherTongue: "",
        city: "",
        education: "",
      })} className="w-full border border-rose-200 bg-transparent text-rose-500 hover:bg-rose-50">
        {t("resetFilters")}
      </Button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>{children}</div>;
}
