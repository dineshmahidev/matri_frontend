import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Check, ChevronRight, ChevronLeft, Sparkles, ImagePlus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language";
import { compressImage } from "@/lib/compressImage";
import { RELIGIONS, CASTES, MOTHER_TONGUES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { RASIS, NAKSHATRAMS, RASI_NAKSHATRAM_MAP } from "@/data/astrology";
import { STATE_CITY_MAP } from "@/data/locations";
import { EDUCATION_LEVELS, PROFESSIONS, ANNUAL_INCOME_RANGES } from "@/data/education";

export const Route = createFileRoute("/complete-profile")({
  head: () => ({ meta: [{ title: "Complete Profile — Ungalkalyanam" }] }),
  component: CompleteProfile,
});

const STEPS = [
  { key: "photo", label: "Photo", icon: "📸" },
  { key: "about", label: "About", icon: "📝" },
  { key: "basics", label: "Basic Info", icon: "👤" },
  { key: "religion", label: "Religion & Astro", icon: "🕉️" },
  { key: "location", label: "Location & Career", icon: "📍" },
  { key: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { key: "preferences", label: "Partner Prefs", icon: "💖" },
];

function CompleteProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isTa = language === "ta";
  const [step, setStep] = useState(0);

  const { data: profileResponse, isLoading } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
    retry: false,
  });

  const profile = profileResponse?.data ?? profileResponse;

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [height, setHeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [skinColour, setSkinColour] = useState("");
  const [religion, setReligion] = useState("");
  const [community, setCommunity] = useState("");
  const [customCommunity, setCustomCommunity] = useState("");
  const [isCustomCommunity, setIsCustomCommunity] = useState(false);
  const [motherTongue, setMotherTongue] = useState("");
  const [rasi, setRasi] = useState("");
  const [nakshatram, setNakshatram] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [income, setIncome] = useState("");
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [siblings, setSiblings] = useState("");
  const [familyStatus, setFamilyStatus] = useState("Middle Class");
  const [prefAgeRange, setPrefAgeRange] = useState("");
  const [prefHeightRange, setPrefHeightRange] = useState("");
  const [prefReligion, setPrefReligion] = useState("");
  const [prefCommunity, setPrefCommunity] = useState("");
  const [prefEducation, setPrefEducation] = useState("");
  const [prefProfession, setPrefProfession] = useState("");
  const [prefLocation, setPrefLocation] = useState("");
  const [prefBloodGroup, setPrefBloodGroup] = useState("");

  useEffect(() => {
    if (profile) {
      if (profile.photo) setProfilePhoto(profile.photo);
      if (profile.gallery) setGalleryPhotos(profile.gallery);
      setName(profile.name || "");
      setBio(profile.bio || "");
      setDob(profile.dob || "");
      setTob(profile.tob || "");
      setMaritalStatus(profile.maritalStatus || "Never Married");
      setHeight(profile.height || "");
      setBloodGroup(profile.blood_group || "");
      setSkinColour(profile.skinColour || "");
      setReligion(profile.religion || "");
      setMotherTongue(profile.motherTongue || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setProfession(profile.profession || "");
      setEducation(profile.education || "");
      setIncome(profile.income || "");
      setRasi(profile.rasi || "");
      setNakshatram(profile.nakshatram || "");
      setFather(profile.family?.father || "");
      setMother(profile.family?.mother || "");
      setSiblings(profile.family?.siblings || "");
      setFamilyStatus(profile.family?.familyStatus || "Middle Class");
      setPrefAgeRange(profile.partnerPrefs?.ageRange || "");
      setPrefHeightRange(profile.partnerPrefs?.heightRange || "");
      setPrefReligion(profile.partnerPrefs?.religion || "");
      setPrefCommunity(profile.partnerPrefs?.community || "");
      setPrefEducation(profile.partnerPrefs?.education || "");
      setPrefProfession(profile.partnerPrefs?.profession || "");
      setPrefLocation(profile.partnerPrefs?.location || "");
      setPrefBloodGroup(profile.partnerPrefs?.bloodGroup || "");
      if (profile.community) {
        const isStd = CASTES.includes(profile.community);
        if (isStd) { setCommunity(profile.community); setIsCustomCommunity(false); setCustomCommunity(""); }
        else { setCommunity("Other"); setIsCustomCommunity(true); setCustomCommunity(profile.community); }
      }
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.put("/profile", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });

  const collectData = () => {
    const data: Record<string, any> = {};
    if (name) data.name = name;
    if (bio) data.bio = bio;
    if (dob) data.dob = dob;
    if (tob) data.tob = tob;
    if (maritalStatus) data.marital_status = maritalStatus;
    if (height) data.height = height;
    if (bloodGroup) data.blood_group = bloodGroup;
    if (skinColour) data.skin_colour = skinColour;
    if (religion) data.religion = religion;
    const finalCommunity = community === "Other" ? customCommunity : community;
    if (finalCommunity) data.community = finalCommunity;
    if (motherTongue) data.mother_tongue = motherTongue;
    if (rasi) data.rasi = rasi;
    if (nakshatram) data.nakshatram = nakshatram;
    if (state) data.state = state;
    if (city) data.city = city;
    if (education) data.education = education;
    if (profession) data.profession = profession;
    if (income) data.income = income;
    const fam: Record<string, string> = {};
    if (father) fam.father = father;
    if (mother) fam.mother = mother;
    if (siblings) fam.siblings = siblings;
    if (familyStatus) fam.family_status = familyStatus;
    if (Object.keys(fam).length > 0) data.family = fam;
    const pref: Record<string, string> = {};
    if (prefAgeRange) pref.age_range = prefAgeRange;
    if (prefHeightRange) pref.height_range = prefHeightRange;
    if (prefReligion) pref.religion = prefReligion;
    if (prefCommunity) pref.community = prefCommunity;
    if (prefEducation) pref.education = prefEducation;
    if (prefProfession) pref.profession = prefProfession;
    if (prefLocation) pref.location = prefLocation;
    if (prefBloodGroup) pref.blood_group = prefBloodGroup;
    if (Object.keys(pref).length > 0) data.partner_preferences = pref;
    return data;
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/profile/photo", formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
    onError: (err: any) => toast.error(err.message || "Failed to upload photo"),
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
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
      toast.success(isTa ? "புகைப்படங்கள் பதிவேற்றப்பட்டன!" : "Gallery photos uploaded!");
    } catch {
      toast.error(isTa ? "புகைப்படங்களைப் பதிவேற்ற முடியவில்லை" : "Failed to upload gallery photos");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (url: string) => {
    try {
      await deleteGalleryMutation.mutateAsync(url);
      setGalleryPhotos((prev) => prev.filter((p) => p !== url));
      toast.success(isTa ? "புகைப்படம் நீக்கப்பட்டது!" : "Photo removed!");
    } catch {
      toast.error(isTa ? "புகைப்படத்தை நீக்க முடியவில்லை" : "Failed to remove photo");
    }
  };

  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressed);
      await uploadPhotoMutation.mutateAsync(formData);
      const preview = URL.createObjectURL(compressed);
      setProfilePhoto(preview);
      toast.success(isTa ? "புகைப்படம் பதிவேற்றப்பட்டது!" : "Photo uploaded!");
    } catch {
      toast.error(isTa ? "புகைப்படத்தைப் பதிவேற்ற முடியவில்லை" : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const doSave = async () => {
    await saveMutation.mutateAsync(collectData());
  };

  const handleNext = async () => {
    try {
      await doSave();
      if (step < STEPS.length - 1) setStep(s => s + 1);
      else navigate({ to: "/dashboard" });
    } catch { /* handled */ }
  };

  const handleSkip = async () => {
    try {
      await doSave();
    } catch { /* handled */ }
    navigate({ to: "/dashboard" });
  };

  const handleSkipAll = () => {
    navigate({ to: "/dashboard" });
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const label = (text: string, ta: string) => isTa ? ta : text;
  const selCls = "h-11 w-full rounded-xl border px-4 text-sm outline-none bg-background text-foreground";
  const inpCls = "h-11 w-full rounded-xl border px-4 text-sm outline-none bg-background text-foreground";

  return (
    <div className="min-h-screen py-16 px-4 complete-profile-page" style={{ background: "linear-gradient(180deg, #FFFDFB 0%, #FFF6F8 50%, #FFFDFB 100%)" }}>
      <style>{`
        .dark .complete-profile-page { background: linear-gradient(145deg, #0D0404 0%, #150608 30%, #0D0409 70%, #0D0404 100%) !important; }
        .dark .step-card { background: rgba(13,4,4,0.85) !important; backdrop-filter: blur(12px) !important; border-color: rgba(232,63,123,0.2) !important; }
        .dark .step-card input, .dark .step-card select, .dark .step-card textarea { background: rgba(30,10,10,0.9) !important; border-color: rgba(232,63,123,0.25) !important; color: #f5e6e6 !important; }
        .dark .step-card input::placeholder { color: #8B6565 !important; }
        .dark .step-card h3 { color: #f5e6e6 !important; }
      `}</style>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-3" style={{ background: "linear-gradient(135deg, rgba(232,63,123,0.1), rgba(212,175,55,0.1))", border: "1px solid rgba(232,63,123,0.2)", color: "#E83F7B" }}>
            <Sparkles className="h-3 w-3" />
            {label(`Step ${step + 1} of ${STEPS.length}`, `படி ${step + 1}/${STEPS.length}`)}
          </span>
          <h1 className="font-display text-3xl font-bold" style={{ color: "#2D0808" }}>
            {isTa ? "உங்கள் சுயவிவரத்தை முழுமையாக்குங்கள்" : "Complete Your Profile"}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8B6565" }}>
            {isTa ? "ஒவ்வொரு பிரிவிலும் விவரங்களை நிரப்பவும். தவிர்க்க Next அழுத்தவும்." : "Fill details in each section. Press Next to continue or Skip to save & move on."}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-5 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="step-card rounded-[24px] p-6" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(232,63,123,0.10)" }}>

          {/* Step 0: Profile Photo */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>📸</span> {label("Profile Photo", "சுயவிவர புகைப்படம்")}</h3>
              <p className="text-sm text-muted-foreground">{isTa ? "உங்கள் சுயவிவர புகைப்படத்தைப் பதிவேற்றவும்." : "Upload your profile photo."}</p>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="" className="h-36 w-36 rounded-full border-4 border-primary/20 object-cover shadow-md" />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-dashed border-muted-foreground/30 bg-muted/30">
                      <Camera className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <input type="file" ref={photoInputRef} onChange={handleProfilePhoto} accept="image/*" className="hidden" />
                <Button variant="outline" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                  <Camera className="mr-1.5 h-4 w-4" />
                  {profilePhoto
                    ? (isTa ? "புகைப்படத்தை மாற்ற" : "Change photo")
                    : (isTa ? "புகைப்படத்தைத் தேர்ந்தெடுக்கவும்" : "Select a photo")}
                </Button>
              </div>

              {/* Gallery Section */}
              <hr className="border-t border-border/50" />
              <div>
                <h4 className="font-display text-lg font-semibold flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-pink-500" />
                  {label("Photo Gallery", "புகைப்பட தொகுப்பு")}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {isTa
                    ? `உங்கள் புகைப்படங்களைச் சேர்க்கவும் (அதிகபட்சம் 3). மேலும் புகைப்படங்கள் அதிக பொருத்தங்களைத் தருகின்றன.`
                    : `Add your photos (max 3). More photos mean more matches.`}
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
                  {isTa
                    ? `${galleryPhotos.length}/3 புகைப்படங்கள் சேர்க்கப்பட்டுள்ளன`
                    : `${galleryPhotos.length}/3 photos added`}
                </p>
              </div>
            </div>
          )}

          {/* Step 1: About */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>📝</span> {label("About You", "உங்களைப் பற்றி")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("About / Bio", "சுயவிவர விளக்கம்")}</span>
                  <textarea rows={3} className="w-full rounded-xl border bg-background p-4 text-sm outline-none focus:border-primary" placeholder={label("Write about yourself...", "உங்களைப் பற்றி எழுதுங்கள்...")} value={bio} onChange={e => setBio(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Full Name", "முழு பெயர்")}</span>
                  <input className={inpCls} value={name} onChange={e => setName(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Date of Birth", "பிறந்த தேதி")}</span>
                  <input type="date" className={inpCls} value={dob} onChange={e => setDob(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Time of Birth", "பிறந்த நேரம்")}</span>
                  <input type="time" className={inpCls} value={tob} onChange={e => setTob(e.target.value)} />
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>👤</span> {label("Basic Information", "அடிப்படைத் தகவல்")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Marital Status", "திருமண நிலை")}</span>
                  <select className={selCls} value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)}>
                    <option value="Never Married">{label("Never Married", "திருமணமாகாதவர்")}</option>
                    <option value="Divorced">{label("Divorced", "விவாகரத்தானவர்")}</option>
                    <option value="Widowed">{label("Widowed", "துணையை இழந்தவர்")}</option>
                    <option value="Awaiting Divorce">{label("Awaiting Divorce", "விவாகரத்துக்காக காத்திருப்பவர்")}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Height", "உயரம்")}</span>
                  <select className={selCls} value={height} onChange={e => setHeight(e.target.value)}>
                    <option value="">{label("Select Height", "உயரத்தைத் தேர்ந்தெடுக்கவும்")}</option>
                    {Array.from({ length: 37 }, (_, i) => `${Math.floor(i / 12) + 4}ft ${i % 12}in`).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Blood Group", "இரத்த குழு")}</span>
                  <select className={selCls} value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                    <option value="">{label("Select", "தேர்ந்தெடுக்கவும்")}</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Skin Colour", "தோல் நிறம்")}</span>
                  <select className={selCls} value={skinColour} onChange={e => setSkinColour(e.target.value)}>
                    <option value="">{label("Select", "தேர்ந்தெடுக்கவும்")}</option>
                    {[label("Fair", "வெள்ளை"), label("Wheatish", "கோதுமை நிறம்"), label("Dusky", "கருத்த"), label("Dark", "கறுப்பு")].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Religion & Astro */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>🕉️</span> {label("Religion & Horoscope", "மதம் மற்றும் ஜாதகம்")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Religion", "மதம்")}</span>
                  <select className={selCls} value={religion} onChange={e => setReligion(e.target.value)}>
                    <option value="">{label("Select Religion", "மதத்தை தேர்ந்தெடுக்கவும்")}</option>
                    {RELIGIONS.map(r => <option key={r} value={r}>{isTa ? (OPTION_TRANSLATIONS[r] || r) : r}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Caste / Community", "சாதி")}</span>
                  <select className={selCls} value={community} onChange={e => { setCommunity(e.target.value); if (e.target.value === "Other") setIsCustomCommunity(true); else { setIsCustomCommunity(false); setCustomCommunity(""); }}}>
                    <option value="">{label("Select Caste", "சாதியை தேர்ந்தெடுக்கவும்")}</option>
                    {(religion ? (RELIGION_CASTE_MAP[religion] || ["Other"]) : CASTES).map(c => <option key={c} value={c}>{isTa ? (OPTION_TRANSLATIONS[c] || c) : c}</option>)}
                  </select>
                  {isCustomCommunity && <input className={`${inpCls} mt-2`} placeholder={label("Specify caste", "உங்கள் சாதியை உள்ளிடவும்")} value={customCommunity} onChange={e => setCustomCommunity(e.target.value)} />}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Mother Tongue", "தாய்மொழி")}</span>
                  <select className={selCls} value={motherTongue} onChange={e => setMotherTongue(e.target.value)}>
                    <option value="">{label("Select", "தேர்ந்தெடுக்கவும்")}</option>
                    {MOTHER_TONGUES.map(l => <option key={l} value={l}>{isTa ? (OPTION_TRANSLATIONS[l] || l) : l}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Rasi / Moon Sign", "ராசி")}</span>
                  <select className={selCls} value={rasi} onChange={e => { setRasi(e.target.value); setNakshatram(""); }}>
                    <option value="">{label("Select Rasi", "ராசியைத் தேர்ந்தெடுக்கவும்")}</option>
                    {RASIS.map(r => <option key={r.en} value={r.en}>{isTa ? r.ta : r.en}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Nakshatram / Birth Star", "நட்சத்திரம்")}</span>
                  <select className={selCls} value={nakshatram} onChange={e => setNakshatram(e.target.value)}>
                    <option value="">{label("Select Nakshatram", "நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்")}</option>
                    {(rasi ? (RASI_NAKSHATRAM_MAP[rasi] || []) : NAKSHATRAMS.map(n => n.en)).map(nName => {
                      const nObj = NAKSHATRAMS.find(n => n.en === nName);
                      return nObj ? <option key={nObj.en} value={nObj.en}>{isTa ? nObj.ta : nObj.en}</option> : null;
                    })}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Location & Career */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>📍</span> {label("Location & Career", "இருப்பிடம் மற்றும் பணி")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("State", "மாநிலம்")}</span>
                  <select className={selCls} value={state} onChange={e => { setState(e.target.value); setCity(""); }}>
                    <option value="">{label("Select State", "மாநிலத்தைத் தேர்ந்தெடுக்கவும்")}</option>
                    {Object.keys(STATE_CITY_MAP).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("City", "நகரம்")}</span>
                  <select className={selCls} value={city} onChange={e => setCity(e.target.value)} disabled={!state}>
                    <option value="">{label("Select City", "நகரத்தைத் தேர்ந்தெடுக்கவும்")}</option>
                    {(STATE_CITY_MAP[state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Education", "கல்வி")}</span>
                  <select className={selCls} value={education} onChange={e => setEducation(e.target.value)}>
                    <option value="">{label("Select Education", "கல்வியைத் தேர்ந்தெடுக்கவும்")}</option>
                    {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Profession", "தொழில்")}</span>
                  <select className={selCls} value={profession} onChange={e => setProfession(e.target.value)}>
                    <option value="">{label("Select Profession", "தொழிலைத் தேர்ந்தெடுக்கவும்")}</option>
                    {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Annual Income", "ஆண்டு வருமானம்")}</span>
                  <select className={selCls} value={income} onChange={e => setIncome(e.target.value)}>
                    <option value="">{label("Select Income", "வருமானத்தைத் தேர்ந்தெடுக்கவும்")}</option>
                    {ANNUAL_INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Family */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>👨‍👩‍👧‍👦</span> {label("Family Details", "குடும்ப விவரங்கள்")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { l: label("Father's Name / Profession", "தந்தை பெயர் / தொழில்"), v: father, s: setFather },
                  { l: label("Mother's Name / Profession", "தாய் பெயர் / தொழில்"), v: mother, s: setMother },
                  { l: label("Sibling Details", "உடன்பிறந்தோர் விவரம்"), v: siblings, s: setSiblings },
                ].map(f => (
                  <label key={f.l} className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.l}</span>
                    <input className={inpCls} value={f.v} onChange={e => f.s(e.target.value)} />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label("Family Status", "குடும்ப நிலை")}</span>
                  <select className={selCls} value={familyStatus} onChange={e => setFamilyStatus(e.target.value)}>
                    <option value="Middle Class">{label("Middle Class", "நடுத்தர வர்க்கம்")}</option>
                    <option value="Upper Middle Class">{label("Upper Middle Class", "உயர் நடுத்தர வர்க்கம்")}</option>
                    <option value="Rich / Affluent">{label("Rich / Affluent", "பணக்காரர் / செல்வாக்குமிக்கவர்")}</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Step 6: Partner Preferences */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2"><span>💖</span> {label("Partner Preferences", "வரன் விருப்பங்கள்")}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { l: label("Age Range", "வயது வரம்பு"), v: prefAgeRange, s: setPrefAgeRange, o: ["18-25","25-30","30-35","35-40","40-45","45-50","50+"] },
                  { l: label("Height Range", "உயரம் வரம்பு"), v: prefHeightRange, s: setPrefHeightRange, o: ["4ft-5ft","5ft-5ft6in","5ft6in-6ft","6ft+"] },
                  { l: label("Religion", "மதம்"), v: prefReligion, s: setPrefReligion, o: RELIGIONS },
                  { l: label("Community", "சமூகம்"), v: prefCommunity, s: setPrefCommunity, o: [] },
                  { l: label("Education", "கல்வி"), v: prefEducation, s: setPrefEducation, o: EDUCATION_LEVELS },
                  { l: label("Profession", "தொழில்"), v: prefProfession, s: setPrefProfession, o: PROFESSIONS },
                  { l: label("Location", "இருப்பிடம்"), v: prefLocation, s: setPrefLocation, o: Object.keys(STATE_CITY_MAP) },
                  { l: label("Blood Group", "இரத்த வகை"), v: prefBloodGroup, s: setPrefBloodGroup, o: ["A+","A-","B+","B-","AB+","AB-","O+","O-"] },
                ].map(p => (
                  <label key={p.l} className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{p.l}</span>
                    {p.o.length > 0 ? (
                      <select className={selCls} value={p.v} onChange={e => p.s(e.target.value)}>
                        <option value="">{label("Select", "தேர்ந்தெடுக்கவும்")}</option>
                        {p.o.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className={inpCls} value={p.v} onChange={e => p.s(e.target.value)} placeholder={label("Type here", "இங்கே தட்டச்சு செய்க")} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={() => { if (step > 0) setStep(s => s - 1); else navigate({ to: "/dashboard" }); }}>
              <ChevronLeft className="mr-1 h-4 w-4" /> {label("Back", "பின்")}
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip} disabled={saveMutation.isPending}>
                {label("Skip", "தவிர்க்க")}
              </Button>
              <Button variant="outline" onClick={handleSkipAll}>
                {label("Skip All", "அனைத்தையும் தவிர்க்க")}
              </Button>
              <Button onClick={handleNext} disabled={saveMutation.isPending} className="gradient-rose text-white">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : step === STEPS.length - 1 ? (isTa ? "முடிந்தது" : "Finish") : (isTa ? "அடுத்து" : "Next")}
                {!saveMutation.isPending && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
