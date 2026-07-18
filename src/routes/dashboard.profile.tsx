import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Camera, BadgeCheck, Loader2, Pencil, LogOut, MessageCircle, 
  Eye, Heart as HeartIcon, X, ChevronLeft, ChevronRight, Trash2,
  Settings, Shield, CreditCard, HelpCircle, ChevronRight as ChevronRightIcon,
  Crown, Sparkles
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { motion, AnimatePresence } from "framer-motion";
import { useUpgrade } from "@/lib/upgrade";
import { toast } from "sonner";
import { compressImage } from "@/lib/compressImage";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "My Profile — Ungalkalyanam" }] }),
  component: MyProfile,
});

function MyProfile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { openUpgrade } = useUpgrade();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const { data: profileResponse, isLoading, isError } = useQuery<any>({
    queryKey: ["my-profile"],
    queryFn: () => api.get<any>("/profile"),
    retry: false,
  });

  const profile = profileResponse?.data ?? profileResponse;

  if (isError && !profile) {
    return (
      <DashboardLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This section failed to load. Try refreshing.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Keyboard navigation for Lightbox slide show
  useEffect(() => {
    if (lightboxIndex === null || !profile?.gallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft" && profile.gallery.length > 1) {
        setLightboxIndex((prev) => (prev === 0 || prev === null ? profile.gallery.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" && profile.gallery.length > 1) {
        setLightboxIndex((prev) => (prev === profile.gallery.length - 1 || prev === null ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, profile?.gallery]);

  const updateProfilePhotoMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return api.post("/profile/photo", formData);
    },
    onSuccess: () => {
      toast.success("Profile photo updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile photo");
    }
  });

  const addGalleryMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return api.post("/profile/gallery/bulk", formData);
    },
    onSuccess: (res: any) => {
      const count = res?.images?.length || 0;
      toast.success(`${count} photo(s) uploaded to gallery successfully!`);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload photos");
    }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (imageUrl: string) => {
      return api.delete("/profile/gallery", {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl })
      });
    },
    onSuccess: () => {
      toast.success("Photo deleted from gallery successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setLightboxIndex(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete photo");
    }
  });

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch {
      toast.error(language === "ta" ? "புகைப்படங்களைப் பதிவேற்ற முடியவில்லை" : "Failed to upload photos");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressed);
      updateProfilePhotoMutation.mutate(formData);
    }
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

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This section failed to load. Try refreshing.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const gallery = profile.gallery || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left animate-fade-in pb-10">
        
        {/* Hidden File Input for uploading gallery photos */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* Hidden File Input for uploading profile photo */}
        <input
          type="file"
          ref={profilePhotoInputRef}
          onChange={handleProfilePhotoChange}
          accept="image/*"
          className="hidden"
        />

        <div className="overflow-hidden rounded-3xl border shadow-soft relative">
          {/* Package Name Label Top Left */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
            <div className="bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5">
              {profile.premium && <Crown className="h-3.5 w-3.5 text-[#D4AF37] fill-[#D4AF37]" />}
              {profile.planName || (profile.premium ? "Premium Plan" : "Free Plan")}
            </div>
            {profile.premium && profile.plan_expires_at && (
              <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-semibold text-white/90">
                {language === "ta" ? "முடிவடையும் நாள்: " : "Expires: "}
                {new Date(profile.plan_expires_at).toLocaleDateString(language === "ta" ? "ta-IN" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
            )}
          </div>

          <div className="p-6 pt-16 gradient-rose text-white">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              {/* Profile Pic */}
              <div 
                className="relative shrink-0 cursor-pointer group"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                <img 
                  src={getImageUrl(profile.photo) || (profile.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png")} 
                  className="h-32 w-32 rounded-full border-4 border-white/20 object-cover shadow-elevated" 
                  alt="" 
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = profile.gender?.toLowerCase() === "female" ? "/avatar-female.png" : "/avatar-male.png";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {updateProfilePhotoMutation.isPending ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              
              {/* Info & Credits */}
              <div className="flex-1 text-center sm:text-left space-y-4">
                <div className="flex justify-center sm:justify-start items-start">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                      {profile.verified && <BadgeCheck className="h-5 w-5 fill-white text-primary" />}
                    </div>
                    <p className="text-sm text-white/80">{profile.id}</p>
                  </div>
                </div>

                {/* Remaining Credits (Icons) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10" title="Chats Left">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-bold">{profile.message_quota ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10" title="Contacts Left">
                    <Eye className="h-4 w-4" />
                    <span className="font-bold">{profile.contact_quota ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10" title="Interest Credits">
                    <HeartIcon className="h-4 w-4" />
                    <span className="font-bold">{profile.credits ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons at the Bottom */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <Button asChild type="button" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full justify-center">
                <Link to={`/profile/${profile.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {language === "ta" ? "சுயவிவரம்" : "Public Profile"}
                </Link>
              </Button>
              {profile.premium ? (
                <Button type="button" variant="outline" className="bg-emerald-400/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/30 w-full justify-center cursor-pointer" onClick={openUpgrade}>
                  <Sparkles className="mr-2 h-4 w-4 text-emerald-300" />
                  {language === "ta" ? "டாப்-அப்" : "Top-up Credits"}
                </Button>
              ) : (
                <Button type="button" variant="outline" className="bg-amber-400/20 border-amber-400/40 text-amber-300 hover:bg-amber-400/30 w-full justify-center cursor-pointer" onClick={openUpgrade}>
                  <Crown className="mr-2 h-4 w-4 text-[#D4AF37]" />
                  {language === "ta" ? "மேம்படுத்து" : "Upgrade"}
                </Button>
              )}
              <Button asChild type="button" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full justify-center">
                <Link to="/dashboard/edit-profile">
                  <Pencil className="mr-2 h-4 w-4" />
                  {language === "ta" ? "திருத்து" : "Edit Profile"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Completion Widget */}
        {(() => {
          let completion = 20; // Base points for having an account
          if (profile.photo) completion += 20;
          if (profile.bio && profile.bio.trim().length > 0) completion += 10;
          
          const hasFamily = profile.family && (profile.family.father || profile.family.mother || profile.family.siblings);
          if (hasFamily) completion += 15;
          
          if (profile.dob) completion += 15;
          if (profile.education && profile.profession && profile.income) completion += 10;
          if (gallery && gallery.length > 0) completion += 10;
          
          completion = Math.min(completion, 100);
          
          return (
            <div className="rounded-3xl border bg-card p-6 shadow-soft relative overflow-hidden">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {language === "ta" ? "சுயவிவரம் நிறைவு" : "Profile Completion"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {completion === 100 
                      ? (language === "ta" ? "உங்கள் சுயவிவரம் 100% முடிந்தது!" : "Your profile is 100% complete!")
                      : (language === "ta" ? "மேலும் விவரங்களைச் சேர்க்கவும்" : "Add more details to get more matches")}
                  </p>
                </div>
                <span className="font-display text-2xl font-black text-primary">{completion}%</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full gradient-rose rounded-full transition-all duration-1000" 
                  style={{ width: `${completion}%` }}
                />
              </div>
              {completion < 100 && (
                <Button asChild variant="outline" className="w-full mt-4 rounded-xl border-primary/20 text-primary hover:bg-primary/5">
                  <Link to="/complete-profile">
                    {language === "ta" ? "முழுமையாக்கு" : "Complete Profile"}
                  </Link>
                </Button>
              )}
            </div>
          );
        })()}

        {/* Profile Details Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-xl font-semibold">{language === "ta" ? "சுயவிவர விவரங்கள்" : "Profile Details"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{language === "ta" ? "உங்கள் முழுமையான சுயவிவர தகவல்" : "Your complete profile information"}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs shrink-0">
              <Link to="/complete-profile">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                {language === "ta" ? "திருத்து" : "Edit"}
              </Link>
            </Button>
          </div>

          {[
            {
              title: language === "ta" ? "அடிப்படை தகவல்" : "Basic Info",
              items: [
                { label: language === "ta" ? "பெயர்" : "Name", value: profile.name },
                { label: language === "ta" ? "பிறந்த தேதி" : "DOB", value: profile.dob },
                { label: language === "ta" ? "திருமண நிலை" : "Marital Status", value: profile.maritalStatus },
                { label: "Height", value: profile.height },
                { label: language === "ta" ? "இரத்த குழு" : "Blood Group", value: profile.blood_group },
              ],
            },
            {
              title: language === "ta" ? "மதம் & சமூகம்" : "Religion & Community",
              items: [
                { label: language === "ta" ? "மதம்" : "Religion", value: profile.religion },
                { label: language === "ta" ? "சமூகம்" : "Community", value: profile.community },
                { label: language === "ta" ? "தாய்மொழி" : "Mother Tongue", value: profile.motherTongue },
              ],
            },
            {
              title: language === "ta" ? "இருப்பிடம்" : "Location",
              items: [
                { label: language === "ta" ? "மாநிலம்" : "State", value: profile.state },
                { label: language === "ta" ? "நகரம்" : "City", value: profile.city },
              ],
            },
            {
              title: language === "ta" ? "கல்வி & பணி" : "Education & Career",
              items: [
                { label: language === "ta" ? "கல்வி" : "Education", value: profile.education },
                { label: language === "ta" ? "தொழில்" : "Profession", value: profile.profession },
                { label: language === "ta" ? "வருமானம்" : "Income", value: profile.income },
              ],
            },
            {
              title: language === "ta" ? "குடும்பம்" : "Family",
              items: [
                { label: language === "ta" ? "தந்தை" : "Father", value: profile.family?.father },
                { label: language === "ta" ? "தாய்" : "Mother", value: profile.family?.mother },
                { label: language === "ta" ? "உடன்பிறந்தோர்" : "Siblings", value: profile.family?.siblings },
                { label: language === "ta" ? "குடும்ப நிலை" : "Family Status", value: profile.family?.familyStatus },
              ],
            },
            {
              title: language === "ta" ? "வாழ்க்கை முறை" : "Lifestyle",
              items: [
                { label: language === "ta" ? "புகைப்பிடிப்பவர்" : "Smoker", value: profile.smoking_status },
                { label: language === "ta" ? "மது அருந்துபவர்" : "Drinker", value: profile.drinking_status },
                { label: language === "ta" ? "ஊனமுற்றவர்" : "Disability", value: profile.disability },
              ],
            },
          ].map(section => {
            const hasValue = section.items.some(i => i.value);
            if (!hasValue) return null;
            return (
              <div key={section.title} className="mb-5 last:mb-0">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {section.title}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {section.items.filter(i => i.value).map(i => (
                    <div key={i.label} className="rounded-xl bg-muted/40 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{i.label}</p>
                      <p className="text-sm font-medium truncate">{i.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gallery Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-xl font-semibold">{language === "ta" ? "எனது புகைப்பட கேலரி" : "My Photo Gallery"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{language === "ta" ? "உங்கள் சிறந்த புகைப்படங்களைச் சேர்த்து வரன்களை ஈர்க்கவும்" : "Add your best photos to attract compatible matches"}</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="text-xs shrink-0"
              onClick={handleAddPhotoClick}
              disabled={uploadingGallery}
            >
              {uploadingGallery ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="mr-1.5 h-3.5 w-3.5" />
              )}
              {language === "ta" ? "சேர்க்கவும்" : "Add Photo"}
            </Button>
          </div>

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {gallery.map((url: string, index: number) => (
                <div 
                  key={index} 
                  className="relative group aspect-square overflow-hidden rounded-2xl border bg-muted cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img 
                    src={url} 
                    alt={`Gallery ${index + 1}`} 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                  
                  {/* Delete button (floating & always visible on mobile/desktop, easily tappable) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent opening lightbox
                      if (confirm(language === "ta" ? "இந்தப் புகைப்படத்தை நீக்க வேண்டுமா?" : "Are you sure you want to delete this photo?")) {
                        deletePhotoMutation.mutate(url);
                      }
                    }}
                    disabled={deletePhotoMutation.isPending}
                    className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm shadow-soft transition-all hover:bg-rose-600 hover:text-white active:scale-95 cursor-pointer"
                    title="Delete photo"
                  >
                    {deletePhotoMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
              {language === "ta" ? "கேலரியில் புகைப்படங்கள் எதுவும் இல்லை." : "No gallery photos found."}
            </div>
          )}
        </div>

        {/* Partner Preferences */}
        {profile.partnerPrefs && (
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-semibold">{language === "ta" ? "வாழ்க்கைத்துணை முன்னுரிமைகள்" : "Partner Preferences"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{language === "ta" ? "நீங்கள் விரும்பும் வரனின் விவரங்கள்" : "Your ideal partner criteria"}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs shrink-0">
                <Link to="/dashboard/edit-profile">
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  {language === "ta" ? "திருத்து" : "Edit"}
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: language === "ta" ? "வயது வரம்பு" : "Age Range", value: profile.partnerPrefs.ageRange },
                { label: language === "ta" ? "உயரம்" : "Height Range", value: profile.partnerPrefs.heightRange },
                { label: language === "ta" ? "மதம்" : "Religion", value: profile.partnerPrefs.religion },
                { label: language === "ta" ? "சமூகம்" : "Community", value: profile.partnerPrefs.community },
                { label: language === "ta" ? "கல்வி" : "Education", value: profile.partnerPrefs.education },
                { label: language === "ta" ? "தொழில்" : "Profession", value: profile.partnerPrefs.profession },
                { label: language === "ta" ? "இருப்பிடம்" : "Location", value: profile.partnerPrefs.location },
                { label: language === "ta" ? "இரத்த வகை" : "Blood Group", value: profile.partnerPrefs.bloodGroup },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-medium">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links Menu */}
        <div className="rounded-3xl border bg-card shadow-soft overflow-hidden">
          <div className="flex flex-col divide-y divide-border/50">
            <Link to="/dashboard/edit-profile" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Settings className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">{language === "ta" ? "கணக்கு அமைப்புகள்" : "Account Settings"}</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/privacy" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">{language === "ta" ? "தனியுரிமை & பாதுகாப்பு" : "Privacy & Security"}</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/subscription" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">{language === "ta" ? "சந்தா மேலாண்மை" : "Manage Subscription"}</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/dashboard/support" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">{language === "ta" ? "உதவி & ஆதரவு" : "Help & Support"}</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/privacy" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">{language === "ta" ? "தனியுரிமைக் கொள்கை" : "Privacy Policy"}</span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={() => {
              localStorage.removeItem("ungalkalyanam_token");
              localStorage.removeItem("ungalkalyanam_user");
              navigate({ to: "/login" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-600 p-4 font-semibold hover:bg-red-100 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Bar */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 text-white/80 z-50">
              <span className="text-sm font-medium tracking-wide">
                {lightboxIndex + 1} / {gallery.length}
              </span>
              <div className="flex items-center gap-3">
                {/* Delete button from within the Lightbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(language === "ta" ? "இந்தப் புகைப்படத்தை நீக்க வேண்டுமா?" : "Are you sure you want to delete this photo?")) {
                      deletePhotoMutation.mutate(gallery[lightboxIndex]);
                    }
                  }}
                  disabled={deletePhotoMutation.isPending}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-rose-600/80 hover:text-white transition-colors text-rose-500 cursor-pointer"
                  title="Delete this photo"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                  title="Close lightbox"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex h-[80vh] w-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* Navigation Left */}
              {gallery.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === 0 || prev === null ? gallery.length - 1 : prev - 1))}
                  className="absolute left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Active Image */}
              <motion.img
                key={lightboxIndex}
                src={gallery[lightboxIndex]}
                alt={`Gallery ${lightboxIndex + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-full max-w-[90vw] rounded-xl object-contain shadow-elevated"
              />

              {/* Navigation Right */}
              {gallery.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === gallery.length - 1 || prev === null ? 0 : prev + 1))}
                  className="absolute right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Bottom thumbnail selector inside lightbox */}
            {gallery.length > 1 && (
              <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-[80vw] px-4 py-2" onClick={(e) => e.stopPropagation()}>
                {gallery.map((p: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                      lightboxIndex === idx ? "border-white scale-110" : "border-white/25 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
