import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowLeft, 
  FileText, User, MapPin, Briefcase, Users, Sparkles, Heart,
  Calendar, Phone, Mail, Church, Moon, Star, Globe, BookOpen, DollarSign,
  Ruler, Languages, Lock, Eye, EyeOff, Clock, Home, Droplet
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

export const Route = createFileRoute("/dashboard/edit-profile")({
  head: () => ({ meta: [{ title: "Edit Profile — Ungalkalyanam" }] }),
  component: EditProfile,
});

function EditProfile() {
  const queryClient = useQueryClient();
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
      toast.success(language === "ta" ? "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!" : "Profile updated successfully!");
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
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !profile) {
    return (
      <DashboardLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This section failed to load. Try refreshing.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSave} className="space-y-6 text-left animate-fade-in pb-10">
        <div className="flex items-center gap-4 mb-6 mt-4">
          <Link to="/dashboard/profile" className="grid h-10 w-10 place-items-center rounded-full bg-card border shadow-sm hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* 1. Bio Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-pink-500 fill-pink-500" />
            {t("bio")}
          </h3>
          <div className="mt-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><FileText className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "சுயவிவர விளக்கம் / பயோ" : "About / Bio"}</span>
              <textarea 
                rows={4}
                className="w-full rounded-xl border bg-background p-4 text-sm" 
                placeholder={language === "ta" ? "உங்களைப் பற்றி, உங்கள் பொழுதுபோக்குகள், கொள்கைகள் மற்றும் எதிர்கால இலக்குகள் பற்றி எழுதுங்கள்..." : "Write a few lines about yourself, your hobbies, values, and career goals..."} 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* 2. Basic Information Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-pink-500 fill-pink-500" />
            {language === "ta" ? "அடிப்படைத் தகவல்" : "Basic Information"}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><User className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("fullName")}</span>
              <input 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "பிறந்த தேதி" : "Date of Birth"}</span>
              <input 
                type="date"
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "பிறந்த நேரம்" : "Time of Birth"}</span>
              <input 
                type="time"
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={tob} 
                onChange={(e) => setTob(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Heart className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("maritalStatus")}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm"
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Droplet className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "ரத்த குழு" : "Blood Group"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">{language === "ta" ? "ரத்த குழியைத் தேர்ந்தெடுக்கவும்" : "Select Blood Group"}</option>
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
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Church className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("religion")}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={community}
                onChange={(e) => handleCommunityChange(e.target.value)}
              >
                <option value="">{language === "ta" ? "சாதியை தேர்ந்தெடுக்கவும்" : "Select Caste / Community"}</option>
                {(religion ? (RELIGION_CASTE_MAP[religion] || ["Other"]) : CASTES).map((c) => <option key={c} value={c}>{language === "ta" ? (OPTION_TRANSLATIONS[c] || c) : c}</option>)}
              </select>
              {isCustomCommunity && (
                <input 
                  className="mt-2 h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500 fill-pink-500" />
            {language === "ta" ? "ஜாதக விபரம் (ராசி & நட்சத்திரம்)" : "Horoscope Details (Rasi & Nakshatram)"}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Moon className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "ராசி" : "Rasi / Moon Sign"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-pink-500 fill-pink-500" />
            {language === "ta" ? "குடும்ப விவரங்கள்" : "Family Details"}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "தந்தை பெயர் / தொழில்" : "Father's Name / Profession"}</span>
              <input 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={father} 
                onChange={(e) => setFather(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "தாய் பெயர் / தொழில்" : "Mother's Name / Profession"}</span>
              <input 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={mother} 
                onChange={(e) => setMother(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "உடன்பிறந்தோர் விவரம்" : "Sibling Details"}</span>
              <input 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={siblings} 
                onChange={(e) => setSiblings(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Home className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "குடும்ப நிலை" : "Family Status"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm"
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
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-pink-500 fill-pink-500" />
            {language === "ta" ? "இருப்பிடம் மற்றும் தொடர்பு" : "Location & Contact"}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><MapPin className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{t("state")}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-pink-500 fill-pink-500" />
            {language === "ta" ? "கல்வி மற்றும் பணி" : "Education & Career"}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><BookOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "கல்வித் தகுதி" : "Highest Education"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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

        {/* 7. Partner Preferences Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
            {language === "ta" ? "வரன் விருப்பங்கள்" : "Partner Preferences"}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "வயது வரம்பு" : "Age Range"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={prefHeightRange}
                onChange={(e) => setPrefHeightRange(e.target.value)}
              >
                <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                <option value="4ft 0in - 5ft 0in">4ft 0in - 5ft 0in</option>
                <option value="5ft 0in - 5ft 6in">5ft 0in - 5ft 6in</option>
                <option value="5ft 6in - 6ft 0in">5ft 6in - 6ft 0in</option>
                <option value="6ft+">6ft+</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Church className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "மதம்" : "Religion"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={prefReligion}
                onChange={(e) => setPrefReligion(e.target.value)}
              >
                <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                <option value="Open to All">{language === "ta" ? "அனைத்து மதங்களுக்கும் تير்ந்து" : "Open to All"}</option>
                {RELIGIONS.map((r) => <option key={r} value={r}>{language === "ta" ? (OPTION_TRANSLATIONS[r] || r) : r}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "சாதி / சமூகம்" : "Community / Caste"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={prefCommunity}
                onChange={(e) => setPrefCommunity(e.target.value)}
              >
                <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                <option value="Open to All">{language === "ta" ? "அனைத்து சாதிகளுக்கும் تير்ந்து" : "Open to All"}</option>
                {CASTES.map((c) => <option key={c} value={c}>{language === "ta" ? (OPTION_TRANSLATIONS[c] || c) : c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><BookOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "கல்வித் தகுதி" : "Education"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
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
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                placeholder={language === "ta" ? "நகரம் / மாநிலம் / நாடு" : "City / State / Country"}
                value={prefLocation}
                onChange={(e) => setPrefLocation(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Droplet className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{language === "ta" ? "இரத்தம் குழம்பு" : "Blood Group"}</span>
              <select 
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
                value={prefBloodGroup}
                onChange={(e) => setPrefBloodGroup(e.target.value)}
              >
                <option value="">{language === "ta" ? "தேர்ந்தெடுக்கவும்" : "Select"}</option>
                <option value="Any">{language === "ta" ? "எந்தவொரு இரத்த குழம்பும்" : "Any Blood Group"}</option>
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

        <div className="flex justify-end pt-4 pb-8">
          <Button type="submit" disabled={updateMutation.isPending} className="gradient-rose text-white px-8 h-12 text-lg rounded-xl">
            {updateMutation.isPending ? (language === "ta" ? "சேமிக்கிறது..." : "Saving...") : t("saveChanges")}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
