import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowLeft, 
  FileText, User, MapPin, Briefcase, Users, Sparkles, Heart,
  Calendar, Phone, Mail, Church, Globe, BookOpen, DollarSign,
  Ruler, Languages, Lock, Eye, EyeOff, Home, Droplet,
  ImagePlus, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { compressImage } from "@/lib/compressImage";
import { RELIGIONS, CASTES, MOTHER_TONGUES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { STATE_CITY_MAP } from "@/data/locations";
import { EDUCATION_LEVELS, PROFESSIONS, ANNUAL_INCOME_RANGES } from "@/data/education";
import { useReligions, useCastes, useStates, useCities } from "@/lib/useReferenceData";

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

  // DB Reference hooks for edit profile dropdowns
  const { data: dbReligions = [] } = useReligions();
  const [religion, setReligion] = useState("");
  const religionId = dbReligions.find((r) => r.name === religion)?.id ?? null;
  const { data: dbCastes = [] } = useCastes(religionId);
  const [community, setCommunity] = useState("");

  const { data: dbStates = [] } = useStates();
  const [state, setState] = useState("");
  const stateId = dbStates.find((s) => s.name === state)?.id ?? null;
  const { data: dbCities = [] } = useCities(stateId);
  const [city, setCity] = useState("");

  // Local state for all fields
  const [name, setName] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [bio, setBio] = useState("");
  const [customCommunity, setCustomCommunity] = useState("");
  const [isCustomCommunity, setIsCustomCommunity] = useState(false);
  const [motherTongue, setMotherTongue] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [height, setHeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dob, setDob] = useState("");

  const [smokingStatus, setSmokingStatus] = useState("no");
  const [drinkingStatus, setDrinkingStatus] = useState("no");
  const [disability, setDisability] = useState("no");

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

  // Gallery state
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMaritalStatus(profile.maritalStatus || "Never Married");
      setBio(profile.bio || "");
      setReligion(profile.religion || "");
      if (profile.gallery) setGalleryPhotos(profile.gallery);
      setMotherTongue(profile.motherTongue || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setProfession(profile.profession || "");
      setEducation(profile.education || "");
      setIncome(profile.income || "");
      setHeight(profile.height || "");
      setBloodGroup(profile.blood_group || "");
      setDob(profile.dob || "");
      setSmokingStatus(profile.smoking_status || "no");
      setDrinkingStatus(profile.drinking_status || "no");
      setDisability(profile.disability || "no");

      // Family details
      setFather(profile.family?.father || "");
      setMother(profile.family?.mother || "");
      setSiblings(profile.family?.siblings || "");
      setFamilyStatus(profile.family?.familyStatus || "Middle Class");

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
    setCity("");
  };

  const addGalleryMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/profile/gallery/bulk", formData),
    onSuccess: (res: any) => {
      const urls = res?.images || [];
      if (urls.length > 0) setGalleryPhotos((prev) => [...prev, ...urls]);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to upload gallery photos"),
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: (imageUrl: string) => api.delete("/profile/gallery", { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: imageUrl }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
    onError: (err: any) => toast.error(err.message || "Failed to delete photo"),
  });

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i]);
        formData.append("images[]", compressed);
      }
      await addGalleryMutation.mutateAsync(formData);
      toast.success(language === "ta" ? "புகைப்படங்கள் பதிவேற்றப்பட்டன!" : "Gallery photos uploaded!");
    } catch {
      toast.error(language === "ta" ? "புகைப்படங்களைப் பதிவேற்ற முடியவில்லை" : "Failed to upload gallery photos");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (url: string) => {
    try {
      await deleteGalleryMutation.mutateAsync(url);
      setGalleryPhotos((prev) => prev.filter((p) => p !== url));
      toast.success(language === "ta" ? "புகைப்படம் நீக்கப்பட்டது!" : "Photo removed!");
    } catch {
      toast.error(language === "ta" ? "புகைப்படத்தை நீக்க முடியவில்லை" : "Failed to remove photo");
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
      smoking_status: smokingStatus,
      drinking_status: drinkingStatus,
      disability,
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
    <DashboardLayout hideSidebar={true} noMargins={true}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
              <div className="mb-2">
                <select className="w-full rounded-xl border bg-background px-3 py-2 text-xs text-muted-foreground outline-none" value="" onChange={e => { if (e.target.value) setBio(e.target.value); }}>
                  <option value="">{language === "ta" ? "வார்ப்புருவைத் தேர்ந்தெடுக்கவும்..." : "Choose a template..."}</option>
                  <option value={language === "ta" ? "நான் எளிமையான, நேர்மையான மற்றும் அக்கறையுள்ள நபர். உறவுகளையும் மதிப்புகளையும் மதிக்கிறேன். என் வாழ்க்கையை பகிர்ந்து கொள்ள ஒரு அன்பான துணையை தேடுகிறேன்." : "I am a simple, honest and caring person. I believe in respecting relationships and values. Looking for a loving partner to spend my life with."}>{language === "ta" ? "எளிமையான & அக்கறையுள்ள" : "Simple & Caring"}</option>
                  <option value={language === "ta" ? "நான் ஒரு புகழ்பெற்ற நிறுவனத்தில் பணிபுரியும் தொழில்முறை நபர். நான் குடும்ப சார்பு மற்றும் மரபுகளை மதிக்கிறேன். பயணம், வாசிப்பு மற்றும் புதிய உணவுகளை ஆராய்வதை ரசிக்கிறேன்." : "I am a professional working in a reputed company. I am family-oriented and value traditions. I enjoy traveling, reading, and exploring new cuisines."}>{language === "ta" ? "தொழில்முறை & குடும்ப சார்பு" : "Professional & Family-oriented"}</option>
                  <option value={language === "ta" ? "நான் மகிழ்ச்சியான, நேர்மறையான மனநிலை கொண்ட நபர். இசை, திரைப்படங்கள் மற்றும் நண்பர்கள் மற்றும் குடும்பத்துடன் நேரம் செலவிட விரும்புகிறேன். பொருத்தமான துணையை தேடுகிறேன்." : "I am a fun-loving, cheerful person with a positive outlook on life. I love music, movies, and spending time with friends and family. Looking for a compatible partner."}>{language === "ta" ? "மகிழ்ச்சியான & மகிழ்ச்சியான" : "Fun-loving & Cheerful"}</option>
                  <option value={language === "ta" ? "நான் நேர்மை, விசுவாசம் மற்றும் பரஸ்பர மரியாதைக்கு மேலாக மதிக்கிறேன். இதே மதிப்புகளை பகிர்ந்து கொள்ளும் மற்றும் ஒரு அழகான வாழ்க்கையை ஒன்றாக உருவாக்க தயாராக உள்ள வாழ்க்கை துணையை தேடுகிறேன்." : "I value honesty, loyalty, and mutual respect above all. I am looking for a life partner who shares similar values and is ready to build a beautiful life together."}>{language === "ta" ? "மதிப்புகள் சார்ந்த" : "Values-driven"}</option>
                </select>
              </div>
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
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{language === "ta" ? "புகைப்பிடிப்பவர்" : "Smoker"}</span>
              <select className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={smokingStatus} onChange={(e) => setSmokingStatus(e.target.value)}>
                <option value="no">{language === "ta" ? "இல்லை" : "No"}</option>
                <option value="yes">{language === "ta" ? "ஆம்" : "Yes"}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{language === "ta" ? "மது அருந்துபவர்" : "Drinker"}</span>
              <select className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={drinkingStatus} onChange={(e) => setDrinkingStatus(e.target.value)}>
                <option value="no">{language === "ta" ? "இல்லை" : "No"}</option>
                <option value="yes">{language === "ta" ? "ஆம்" : "Yes"}</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{language === "ta" ? "ஊனமுற்றவர்" : "Disability"}</span>
              <select className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={disability} onChange={(e) => setDisability(e.target.value)}>
                <option value="no">{language === "ta" ? "இல்லை" : "No"}</option>
                <option value="yes">{language === "ta" ? "ஆம்" : "Yes"}</option>
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
                {dbReligions.map((r) => <option key={r.id} value={r.name}>{language === "ta" ? (OPTION_TRANSLATIONS[r.name] || r.name) : r.name}</option>)}
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
                {dbCastes.map((c) => <option key={c.id} value={c.name}>{language === "ta" ? (OPTION_TRANSLATIONS[c.name] || c.name) : c.name}</option>)}
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

        {/* 3. Family Information Section */}
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
                {dbStates.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
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
                {dbCities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
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

        {/* Gallery Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-pink-500" />
            {language === "ta" ? "புகைப்பட தொகுப்பு" : "Photo Gallery"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {language === "ta"
              ? "உங்கள் புகைப்படங்களைச் சேர்க்கவும் (அதிகபட்சம் 3)."
              : "Add your photos (max 3)."}
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {Array.from({ length: 3 }).map((_, i) => {
              const photo = galleryPhotos[i];
              return (
                <div
                  key={i}
                  className={`relative flex aspect-square items-center justify-center rounded-xl border-2 ${
                    photo
                      ? "border-primary/20 overflow-hidden"
                      : "border-dashed border-muted-foreground/30 bg-muted/20"
                  }`}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteGallery(photo)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (uploadingGallery) return;
                        if (galleryPhotos.length < 3) galleryInputRef.current?.click();
                      }}
                      className="flex h-full w-full items-center justify-center"
                      disabled={uploadingGallery}
                    >
                      {uploadingGallery ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-muted-foreground/50" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleGalleryUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            {language === "ta"
              ? `${galleryPhotos.length}/3 புகைப்படங்கள் சேர்க்கப்பட்டுள்ளன`
              : `${galleryPhotos.length}/3 photos added`}
          </p>
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
    </div>
  </DashboardLayout>
);
}
