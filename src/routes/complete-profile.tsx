import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { 
  FileText, User, MapPin, Briefcase, Users, Sparkles, Loader2, Heart, Droplet,
  Calendar, Phone, Mail, Church, Moon, Star, Globe, BookOpen, DollarSign, Baby,
  Ruler, Languages, Lock, Eye, EyeOff, Clock, Home
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { RELIGIONS, CASTES, MOTHER_TONGUES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { RASIS, NAKSHATRAMS, RASI_NAKSHATRAM_MAP } from "@/data/astrology";
import { STATE_CITY_MAP } from "@/data/locations";
import { EDUCATION_LEVELS, PROFESSIONS, ANNUAL_INCOME_RANGES } from "@/data/education";

export const Route = createFileRoute("/complete-profile")({
  head: () => ({ meta: [{ title: "Complete Profile — Ungalkalyanam" }] }),
  component: CompleteProfile,
});

function CompleteProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const { data: profileResponse, isLoading, isError } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
    retry: false,
  });

  const profile = profileResponse?.data ?? profileResponse;

  // Local state for all fields
  const [name, setName] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [bio, setBio] = useState("");
  const [religion, setReligion] = useState("");
  const [community, setCommunity] = useState("");
  const [customCommunity, setCustomCommunity] = useState("");
  const [isCustomCommunity, setIsCustomCommunity] = useState(false);
  const [motherTongue, setMotherTongue] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [height, setHeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");

  // Partner preferences state
  const [prefAgeRange, setPrefAgeRange] = useState("");
  const [prefHeightRange, setPrefHeightRange] = useState("");
  const [prefReligion, setPrefReligion] = useState("");
  const [prefCommunity, setPrefCommunity] = useState("");
  const [prefEducation, setPrefEducation] = useState("");
  const [prefProfession, setPrefProfession] = useState("");
  const [prefLocation, setPrefLocation] = useState("");
  const [prefBloodGroup, setPrefBloodGroup] = useState("");

  // Family details state
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [siblings, setSiblings] = useState("");
  const [familyStatus, setFamilyStatus] = useState("");

  // Horoscope details state
  const [rasi, setRasi] = useState("");
  const [nakshatram, setNakshatram] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMaritalStatus(profile.maritalStatus || "Never Married");
      setBio(profile.bio || "");
      setReligion(profile.religion || "");
      setMotherTongue(profile.motherTongue || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setProfession(profile.profession || "");
      setEducation(profile.education || "");
      setIncome(profile.income || "");
      setHeight(profile.height || "");
      setBloodGroup(profile.blood_group || "");
      setDob(profile.dob || "");
      setTob(profile.tob || "");

      // Family details
      setFather(profile.family?.father || "");
      setMother(profile.family?.mother || "");
      setSiblings(profile.family?.siblings || "");
      setFamilyStatus(profile.family?.familyStatus || "Middle Class");

      // Horoscope details
      setRasi(profile.rasi || "");
      setNakshatram(profile.nakshatram || "");

      // Partner preferences
      setPrefAgeRange(profile.partnerPrefs?.ageRange || "");
      setPrefHeightRange(profile.partnerPrefs?.heightRange || "");
      setPrefReligion(profile.partnerPrefs?.religion || "");
      setPrefCommunity(profile.partnerPrefs?.community || "");
      setPrefEducation(profile.partnerPrefs?.education || "");
      setPrefProfession(profile.partnerPrefs?.profession || "");
      setPrefLocation(profile.partnerPrefs?.location || "");
      setPrefBloodGroup(profile.partnerPrefs?.bloodGroup || "");

      // Handle custom caste initialization
      if (profile.community) {
        const isStd = CASTES.includes(profile.community);
        if (isStd) {
          setCommunity(profile.community);
          setIsCustomCommunity(false);
          setCustomCommunity("");
        } else {
          setCommunity("Other");
          setIsCustomCommunity(true);
          setCustomCommunity(profile.community);
        }
      } else {
        setCommunity("");
        setIsCustomCommunity(false);
        setCustomCommunity("");
      }
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put("/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success(language === "ta" ? "சுயவிவரம் வெற்றிகரமாக முடிக்கப்பட்டது!" : "Profile completed successfully!");
      navigate({ to: "/dashboard" });
    },
    onError: (err: any) => {
      toast.error(err.message || (language === "ta" ? "சுயவிவரத்தை புதுப்பிக்க முடியவில்லை." : "Failed to update profile."));
    },
  });

  const handleCommunityChange = (val: string) => {
    setCommunity(val);
    if (val === "Other") {
      setIsCustomCommunity(true);
    } else {
      setIsCustomCommunity(false);
      setCustomCommunity("");
    }
  };

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const citiesForState = STATE_CITY_MAP[selectedState] || [];
    if (citiesForState.length > 0) {
      setCity(citiesForState[0]);
    } else {
      setCity("");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommunity = community === "Other" ? customCommunity : community;
    updateMutation.mutate({
      name,
      marital_status: maritalStatus,
      bio,
      religion,
      community: finalCommunity,
      mother_tongue: motherTongue,
      city,
      state,
      profession,
      education,
      income,
      height,
      blood_group: bloodGroup,
      dob,
      tob,
      rasi,
      nakshatram,
      family: {
        father,
        mother,
        siblings,
        family_status: familyStatus,
      },
      partner_preferences: {
        age_range: prefAgeRange,
        height_range: prefHeightRange,
        religion: prefReligion,
        community: prefCommunity,
        education: prefEducation,
        profession: prefProfession,
        location: prefLocation,
        blood_group: prefBloodGroup,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">This section failed to load. Try refreshing.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen complete-profile-page" style={{ background: "linear-gradient(180deg, #FFFDFB 0%, #FFF6F8 50%, #FFFDFB 100%)" }}>
      <style>{`.dark .complete-profile-page { background: linear-gradient(145deg, #0D0404 0%, #150608 30%, #0D0409 70%, #0D0404 100%) !important; }
        .dark .complete-profile-page .glass-card { background: rgba(13,4,4,0.85) !important; backdrop-filter: blur(12px) !important; border-color: rgba(232,63,123,0.2) !important; }
        .dark .complete-profile-page .glass-card h3 { color: #f5e6e6 !important; }
        .dark .complete-profile-page .glass-card label span { color: #b89595 !important; }
        .dark .complete-profile-page .glass-card input, .dark .complete-profile-page .glass-card select, .dark .complete-profile-page .glass-card textarea { background: rgba(30,10,10,0.9) !important; border-color: rgba(232,63,123,0.25) !important; color: #f5e6e6 !important; }
        .dark .complete-profile-page .glass-card input::placeholder { color: #8B6565 !important; }
      `}</style>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-3"
            style={{
              background: "linear-gradient(135deg, rgba(232,63,123,0.1), rgba(212,175,55,0.1))",
              border: "1px solid rgba(232,63,123,0.2)",
              color: "#E83F7B",
            }}
          >
            <Sparkles className="h-3 w-3" />
            {language === "ta" ? "படி 2/3" : "Step 2 of 3"}
          </div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: "#2D0808" }}>
            {language === "ta" ? "உங்கள் சுயவிவரத்தை முழுமையாக்குங்கள்" : "Complete Your Profile"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8B6565" }}>
            {language === "ta" ? "சிறந்த வரன்களை பெற உங்கள் சுயவிவரத்தை முழுமையாக நிரப்பவும்" : "Help us find the best matches by completing your profile details."}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-left animate-fade-in">
          {/* 1. Bio Section */}
          <div className="rounded-[24px] p-6 glass-card"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(232,63,123,0.10)",
              boxShadow: "0 8px 32px rgba(232,63,123,0.06)",
            }}
          >
            <h3 className="font-display text-xl font-semibold flex items-center gap-2" style={{ color: "#2D0808" }}>
              <span className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #E83F7B, #D4AF37)" }} />
              <FileText className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {t("bio")}
            </h3>
            <div className="mt-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><FileText className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "சுயவிவர விளக்கம் / பயோ" : "About / Bio"}</span>
                <textarea 
                  rows={4}
                  className="w-full rounded-xl border bg-background p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                  placeholder={language === "ta" ? "உங்களைப் பற்றி, உங்கள் பொழுதுபோக்குகள், கொள்கைகள் மற்றும் எதிர்கால இலக்குகள் பற்றி எழுதுங்கள்..." : "Write a few lines about yourself, your hobbies, values, and career goals..."} 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* 2. Basic Information Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "அடிப்படைத் தகவல்" : "Basic Information"}
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><User className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("fullName")}</span>
                <input 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "பிறந்த தேதி" : "Date of Birth"}</span>
                <input 
                  type="date"
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "பிறந்த நேரம்" : "Time of Birth"}</span>
                <input 
                  type="time"
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={tob} 
                  onChange={(e) => setTob(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Heart className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("maritalStatus")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}}
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                >
                  <option value="Never Married">{language === "ta" ? "திருமணமாகாதவர்" : "Never Married"}</option>
                  <option value="Divorced">{language === "ta" ? "விவாகரத்தானவர்" : "Divorced"}</option>
                  <option value="Widowed">{language === "ta" ? "துணையை இழந்தவர்" : "Widowed"}</option>
                  <option value="Awaiting Divorce">{language === "ta" ? "விவாகரத்துக்காக காத்திருப்பவர்" : "Awaiting Divorce"}</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Ruler className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("height")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                >
                  <option value="">{language === "ta" ? "உயரத்தைத் தேர்ந்தெடுக்கவும்" : "Select Height"}</option>
                  {Array.from({ length: 37 }, (_, i) => {
                    const f = Math.floor(i / 12) + 4;
                    const in_ = i % 12;
                    return `${f}ft ${in_}in`;
                  }).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Church className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("religion")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                >
                  <option value="">{language === "ta" ? "மதத்தை தேர்ந்தெடுக்கவும்" : "Select Religion"}</option>
                  {RELIGIONS.map((r) => <option key={r} value={r}>{language === "ta" ? (OPTION_TRANSLATIONS[r] || r) : r}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("caste")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={community}
                  onChange={(e) => handleCommunityChange(e.target.value)}
                >
                  <option value="">{language === "ta" ? "சாதியை தேர்ந்தெடுக்கவும்" : "Select Caste / Community"}</option>
                  {(religion ? (RELIGION_CASTE_MAP[religion] || ["Other"]) : CASTES).map((c) => <option key={c} value={c}>{language === "ta" ? (OPTION_TRANSLATIONS[c] || c) : c}</option>)}
                </select>
                {isCustomCommunity && (
                  <input 
                    className="mt-2 h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                    placeholder={language === "ta" ? "உங்கள் சாதியை உள்ளிடவும்" : "Specify your caste / community"}
                    value={customCommunity}
                    onChange={(e) => setCustomCommunity(e.target.value)}
                    required
                  />
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Languages className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("motherTongue")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தாய்மொழியை தேர்ந்தெடுக்கவும்" : "Select Tongue"}</option>
                  {MOTHER_TONGUES.map((l) => <option key={l} value={l}>{language === "ta" ? (OPTION_TRANSLATIONS[l] || l) : l}</option>)}
                </select>
              </label>
            </div>
          </div>

          {/* 3. Horoscope (Rasi & Nakshatram) Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "ஜாதக விபரம் (ராசி & நட்சத்திரம்)" : "Horoscope Details (Rasi & Nakshatram)"}
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Moon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "ராசி" : "Rasi / Moon Sign"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={rasi}
                  onChange={(e) => {
                    setRasi(e.target.value);
                    setNakshatram("");
                  }}
                >
                  <option value="">{language === "ta" ? "ராசியைத் தேர்ந்தெடுக்கவும்" : "Select Rasi"}</option>
                  {RASIS.map((r) => (
                    <option key={r.en} value={r.en}>
                      {language === "ta" ? r.ta : r.en}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Star className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "நட்சத்திரம்" : "Nakshatram / Birth Star"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={nakshatram}
                  onChange={(e) => setNakshatram(e.target.value)}
                >
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
              </label>
            </div>
          </div>

          {/* 4. Family Information Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "குடும்ப விவரங்கள்" : "Family Details"}
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "தந்தை பெயர் / தொழில்" : "Father's Name / Profession"}</span>
                <input 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={father} 
                  onChange={(e) => setFather(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "தாய் பெயர் / தொழில்" : "Mother's Name / Profession"}</span>
                <input 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={mother} 
                  onChange={(e) => setMother(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "உடன்பிறந்தோர் விவரம்" : "Sibling Details"}</span>
                <input 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={siblings} 
                  onChange={(e) => setSiblings(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Home className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "குடும்ப நிலை" : "Family Status"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}}
                  value={familyStatus}
                  onChange={(e) => setFamilyStatus(e.target.value)}
                >
                  <option value="Middle Class">{language === "ta" ? "நடுத்தர வர்க்கம்" : "Middle Class"}</option>
                  <option value="Upper Middle Class">{language === "ta" ? "உயர் நடுத்தர வர்க்கம்" : "Upper Middle Class"}</option>
                  <option value="Rich / Affluent">{language === "ta" ? "பணக்காரர் / செல்வாக்குமிக்கவர்" : "Rich / Affluent"}</option>
                </select>
              </label>
            </div>
          </div>

          {/* 5. Location & Contact Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "இருப்பிடம் மற்றும் தொடர்பு" : "Location & Contact"}
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("state")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={state} 
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  <option value="">Select State</option>
                  {Object.keys(STATE_CITY_MAP).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("city")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!state}
                >
                  <option value="">Select City</option>
                  {(STATE_CITY_MAP[state] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* 6. Education & Career Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "கல்வி மற்றும் பணி" : "Education & Career"}
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><BookOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "கல்வித் தகுதி" : "Highest Education"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={education} 
                  onChange={(e) => setEducation(e.target.value)}
                >
                  <option value="">{language === "ta" ? "கல்வியைத் தேர்ந்தெடுக்கவும்" : "Select Education"}</option>
                  {EDUCATION_LEVELS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Briefcase className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("profession")}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={profession} 
                  onChange={(e) => setProfession(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தொழிலைத் தேர்ந்தெடுக்கவும்" : "Select Profession"}</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><DollarSign className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "ஆண்டு வருமானம்" : "Annual Income"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={income} 
                  onChange={(e) => setIncome(e.target.value)}
                >
                  <option value="">{language === "ta" ? "வருமானத்தைத் தேர்ந்தெடுக்கவும்" : "Select Income"}</option>
                  {ANNUAL_INCOME_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* 7. Blood Group Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Droplet className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "இரத்த குழு" : "Blood Group"}
            </h3>
            <div className="mt-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Droplet className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "உங்கள் இரத்த குழு" : "Your Blood Group"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
            </div>
          </div>

          {/* 8. Partner Preferences Section */}
          <div className="rounded-[24px] p-6 glass-card" style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(12px)",border:"1px solid rgba(232,63,123,0.10)",boxShadow:"0 8px 32px rgba(232,63,123,0.06)"}}>
            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: "#E83F7B" }} />
              {language === "ta" ? "வரன் விருப்பங்கள்" : "Partner Preferences"}
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "வயது வரம்பு" : "Age Range"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefAgeRange}
                  onChange={(e) => setPrefAgeRange(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="18-25">18-25</option>
                  <option value="25-30">25-30</option>
                  <option value="30-35">30-35</option>
                  <option value="35-40">35-40</option>
                  <option value="40-45">40-45</option>
                  <option value="45-50">45-50</option>
                  <option value="50+">50+</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Ruler className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "உயரம் வரம்பு" : "Height Range"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefHeightRange}
                  onChange={(e) => setPrefHeightRange(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="4ft-5ft">4ft - 5ft</option>
                  <option value="5ft-5ft6in">5ft - 5ft 6in</option>
                  <option value="5ft6in-6ft">5ft 6in - 6ft</option>
                  <option value="6ft+">6ft+</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Church className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "மதம்" : "Religion"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefReligion}
                  onChange={(e) => setPrefReligion(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="Open to All">{language === "ta" ? "அனைத்து மதங்களுக்கும்" : "Open to All"}</option>
                  {RELIGIONS.map((r) => <option key={r} value={r}>{language === "ta" ? (OPTION_TRANSLATIONS[r] || r) : r}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "சாதி / சமூகம்" : "Community / Caste"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefCommunity}
                  onChange={(e) => setPrefCommunity(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="Open to All">{language === "ta" ? "அனைத்து சாதிகளுக்கும்" : "Open to All"}</option>
                  {CASTES.map((c) => <option key={c} value={c}>{language === "ta" ? (OPTION_TRANSLATIONS[c] || c) : c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><BookOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "கல்வித் தகுதி" : "Education"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefEducation}
                  onChange={(e) => setPrefEducation(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="Any">{language === "ta" ? "எந்ததும்" : "Any"}</option>
                  {EDUCATION_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Briefcase className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "தொழில்" : "Profession"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefProfession}
                  onChange={(e) => setPrefProfession(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="Any">{language === "ta" ? "எந்ததும்" : "Any"}</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "இருப்பிடம்" : "Location"}</span>
                <input 
                  type="text"
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  placeholder={language === "ta" ? "நகரம் / மாநிலம்" : "City / State / Country"}
                  value={prefLocation}
                  onChange={(e) => setPrefLocation(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Droplet className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "இரத்த குழு" : "Blood Group"}</span>
                <select 
                  className="h-11 w-full rounded-xl border px-4 text-sm outline-none" style={{borderColor:"rgba(232,63,123,0.15)",background:"rgba(255,255,255,0.9)",color:"#2D0808"}} 
                  value={prefBloodGroup}
                  onChange={(e) => setPrefBloodGroup(e.target.value)}
                >
                  <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                  <option value="Any">{language === "ta" ? "எந்தவொரு" : "Any"}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-center pt-8 pb-10">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto rounded-xl font-semibold shadow-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #E83F7B, #C2185B)",
                color: "white",
                boxShadow: "0 8px 32px rgba(232,63,123,0.3)",
                padding: "0 3rem",
                height: "3.5rem",
                fontSize: "1.05rem",
              }}
            >
              {updateMutation.isPending ? (language === "ta" ? "சமர்ப்பிக்கிறது..." : "Submitting...") : (language === "ta" ? "முடித்து தொடரவும்" : "Complete & Continue")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
