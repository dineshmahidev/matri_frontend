import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Camera, ImagePlus, Check, X, Loader2, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { compressImage } from "@/lib/compressImage";
import { toast } from "sonner";

const FIELD_LABELS: Record<string, string> = {
  date_of_birth: "Date of birth",
  religion: "Religion",
  caste: "Caste / community",
  city: "City",
  state: "State",
  education: "Education",
  profile_photo: "Profile photo",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completionPercent: number;
  missingFields: string[];
  language?: "en" | "ta";
  isPremium?: boolean;
  currentPhoto?: string | null;
  gallery?: string[];
};

export function ProfileCompletionDialog({
  open,
  onOpenChange,
  completionPercent,
  missingFields,
  language = "en",
  isPremium = false,
  currentPhoto,
  gallery = [],
}: Props) {
  const isTa = language === "ta";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(getImageUrl(currentPhoto) || null);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(gallery.map(p => getImageUrl(p)));

  // Reset state when dialog opens/closes
  const prevOpenRef = useRef(open);
  if (open !== prevOpenRef.current) {
    prevOpenRef.current = open;
    if (open) {
      setProfilePhoto(getImageUrl(currentPhoto) || null);
      setGalleryPhotos(gallery.map(p => getImageUrl(p)));
      setStep(1);
    }
  }
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const maxGallery = isPremium ? 6 : 3;

  const totalSteps = missingFields.length > 0 ? 3 : 2;

  const updateProfilePhotoMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/profile/photo", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile photo");
    },
  });

  const addGalleryMutation = useMutation({
    mutationFn: (formData: FormData) => api.post("/profile/gallery/bulk", formData),
    onSuccess: (res: any) => {
      const urls = res?.images || [];
      if (urls.length > 0) setGalleryPhotos((prev) => [...prev, ...urls]);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload photos");
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (imageUrl: string) =>
      api.delete("/profile/gallery", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete photo");
    },
  });

  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressed);
      await updateProfilePhotoMutation.mutateAsync(formData);
      const preview = URL.createObjectURL(compressed);
      setProfilePhoto(preview);
      toast.success(isTa ? "சுயவிவர புகைப்படம் புதுப்பிக்கப்பட்டது!" : "Profile photo updated!");
    } catch {
      toast.error(isTa ? "புகைப்படத்தைப் பதிவேற்ற முடியவில்லை" : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remainingSlots = maxGallery - galleryPhotos.length;
    if (remainingSlots <= 0) {
      toast.error(
        isTa
          ? `அதிகபட்சம் ${maxGallery} புகைப்படங்கள் மட்டுமே அனுமதிக்கப்படும்`
          : `Maximum ${maxGallery} photos allowed`
      );
      return;
    }
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < filesToUpload.length; i++) {
        const compressed = await compressImage(filesToUpload[i]);
        formData.append("images[]", compressed);
      }
      const res = await addGalleryMutation.mutateAsync(formData);
      const urls = res?.images || [];
      if (urls.length > 0) {
        setGalleryPhotos((prev) => [...prev, ...urls]);
      }
      toast.success(isTa ? "புகைப்படங்கள் பதிவேற்றப்பட்டன!" : "Gallery photos uploaded!");
    } catch {
      toast.error(isTa ? "புகைப்படங்களைப் பதிவேற்ற முடியவில்லை" : "Failed to upload gallery photos");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (url: string) => {
    try {
      await deletePhotoMutation.mutateAsync(url);
      setGalleryPhotos((prev) => prev.filter((p) => p !== url));
      toast.success(isTa ? "புகைப்படம் நீக்கப்பட்டது!" : "Photo removed!");
    } catch {
      toast.error(isTa ? "புகைப்படத்தை நீக்க முடியவில்லை" : "Failed to remove photo");
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    navigate({ to: "/" });
  };

  const handleCompleteStep1 = () => {
    setStep(2);
  };

  const handleCompleteStep2 = () => {
    setStep(3);
  };

  const handleFinish = () => {
    onOpenChange(false);
    navigate({ to: "/" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      s < step
                        ? "bg-primary text-primary-foreground"
                        : s === step
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <Check className="h-3 w-3" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`h-px w-6 ${s < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {isTa ? `படி ${step}/${totalSteps}` : `Step ${step}/${totalSteps}`}
            </span>
          </div>

          {step === 1 && (
            <>
              <DialogTitle className="flex items-center gap-2 font-display text-xl">
                <AlertCircle className="h-5 w-5 text-primary" />
                {isTa ? "உங்கள் சுயவிவரத்தை முடிக்கவும்" : "Complete your profile"}
              </DialogTitle>
              <DialogDescription>
                {isTa
                  ? "வரன்களை உலாவுவதற்கு முன் கீழே உள்ள விவரங்களை நிரப்பவும்."
                  : "Please fill in the details below before browsing matches."}
              </DialogDescription>
            </>
          )}
          {step === 2 && (
            <>
              <DialogTitle className="flex items-center gap-2 font-display text-xl">
                <Camera className="h-5 w-5 text-primary" />
                {isTa ? "சுயவிவர புகைப்படம்" : "Profile Photo"}
              </DialogTitle>
              <DialogDescription>
                {isTa
                  ? "உங்கள் சிறந்த புகைப்படத்தைப் பதிவேற்றவும். இது உங்கள் சுயவிவரத்தில் காட்டப்படும்."
                  : "Upload your best photo. This will be shown on your profile."}
              </DialogDescription>
            </>
          )}
          {step === 3 && (
            <>
              <DialogTitle className="flex items-center gap-2 font-display text-xl">
                <ImagePlus className="h-5 w-5 text-primary" />
                {isTa ? "புகைப்பட தொகுப்பு" : "Photo Gallery"}
              </DialogTitle>
              <DialogDescription>
                {isTa
                  ? `உங்கள் புகைப்படங்களைச் சேர்க்கவும் (அதிகபட்சம் ${maxGallery}). மேலும் புகைப்படங்கள் அதிக பொருத்தங்களைத் தருகின்றன.`
                  : `Add your photos (max ${maxGallery}). More photos mean more matches.`}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isTa ? "சுயவிவர முழுமை" : "Profile completion"}
              </span>
              <span className="font-semibold">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
            {missingFields.length > 0 && (
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {FIELD_LABELS[field] ?? field}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="w-full gradient-rose text-white" onClick={() => onOpenChange(false)}>
                <Link to="/complete-profile">
                  {isTa ? "விவரங்களை நிரப்ப" : "Fill details"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSkip}>
                {isTa ? "இப்போதைக்கு தவிர்க்கவும்" : "Skip for now"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={getImageUrl(profilePhoto)}
                    alt="Profile"
                    className="h-32 w-32 rounded-full border-4 border-primary/20 object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-muted-foreground/30 bg-muted/30">
                    <Camera className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePhoto}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Camera className="mr-1.5 h-4 w-4" />
                {profilePhoto
                  ? isTa
                    ? "புகைப்படத்தை மாற்ற"
                    : "Change photo"
                  : isTa
                  ? "புகைப்படத்தைத் தேர்ந்தெடுக்கவும்"
                  : "Select a photo"}
              </Button>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleCompleteStep2}
                className="w-full gradient-rose text-white"
                disabled={!profilePhoto}
              >
                {isTa ? "தொடரவும்" : "Continue"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSkip}>
                {isTa ? "இப்போதைக்கு தவிர்க்கவும்" : "Skip for now"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: maxGallery }).map((_, i) => {
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
                        <img
                          src={getImageUrl(photo)}
                          alt={`Gallery ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
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
                          const idx = galleryPhotos.length;
                          if (idx < maxGallery) galleryInputRef.current?.click();
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
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleGalleryUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isTa
                ? `${galleryPhotos.length}/${maxGallery} புகைப்படங்கள் சேர்க்கப்பட்டுள்ளன`
                : `${galleryPhotos.length}/${maxGallery} photos added`}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleFinish} className="w-full gradient-rose text-white">
                {isTa ? "முடிந்தது" : "Done"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSkip}>
                {isTa ? "இப்போதைக்கு தவிர்க்கவும்" : "Skip for now"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
