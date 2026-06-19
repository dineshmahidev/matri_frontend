import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/AppLayouts";
import { Shield, Lock, Eye, EyeOff, Bell, ChevronLeft, ChevronRight, ExternalLink, Loader2, KeyRound } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/privacy")({
  head: () => ({ meta: [{ title: "Privacy & Security — Ungalkalyanam" }] }),
  component: PrivacySecurity,
});

function PrivacySecurity() {
  const { language } = useLanguage();
  const isTamil = language === "ta";

  const [photoVisibility, setPhotoVisibility] = useState("all");
  const [profileVisibility, setProfileVisibility] = useState("all");
  const [showContact, setShowContact] = useState(false);
  const [notifyInterest, setNotifyInterest] = useState(true);
  const [notifyMessage, setNotifyMessage] = useState(true);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      api.post("/auth/change-password", data),
    onSuccess: () => {
      toast.success(isTamil ? "கடவுச்சொல் மாற்றப்பட்டது!" : "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || (isTamil ? "கடவுச்சொல் மாற்ற முடியவில்லை" : "Failed to change password"));
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(isTamil ? "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்" : "Enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error(isTamil ? "புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்" : "New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(isTamil ? "கடவுச்சொற்கள் பொருந்தவில்லை" : "Passwords do not match");
      return;
    }
    changePasswordMutation.mutate({ current_password: currentPassword, new_password: newPassword });
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  const SelectRow = ({ label, value, onChange, options }: any) => (
    <div className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm bg-muted/60 border border-border/40 rounded-xl px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  const visibilityOptions = [
    { value: "all", label: isTamil ? "அனைவரும்" : "Everyone" },
    { value: "members", label: isTamil ? "உறுப்பினர்கள்" : "Members Only" },
    { value: "none", label: isTamil ? "யாரும் வேண்டாம்" : "No One" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold">{isTamil ? "தனியுரிமை & பாதுகாப்பு" : "Privacy & Security"}</h1>
            <p className="text-xs text-muted-foreground">{isTamil ? "உங்கள் கணக்கை பாதுகாக்கவும்" : "Manage your privacy settings"}</p>
          </div>
        </div>

        {/* Profile Visibility */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold">{isTamil ? "சுயவிவர தெரிவுநிலை" : "Profile Visibility"}</h2>
          </div>
          <SelectRow
            label={isTamil ? "யார் சுயவிவரம் பார்க்கலாம்?" : "Who can view my profile?"}
            value={profileVisibility}
            onChange={setProfileVisibility}
            options={visibilityOptions}
          />
          <SelectRow
            label={isTamil ? "யார் புகைப்படம் பார்க்கலாம்?" : "Who can view my photos?"}
            value={photoVisibility}
            onChange={setPhotoVisibility}
            options={visibilityOptions}
          />
        </motion.div>

        {/* Contact Visibility */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-emerald-500" />
            <h2 className="font-display text-base font-bold">{isTamil ? "தொடர்பு பாதுகாப்பு" : "Contact Protection"}</h2>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-sm font-medium">{isTamil ? "தொலைபேசி எண் காட்டு" : "Show Phone Number"}</p>
              <p className="text-xs text-muted-foreground">{isTamil ? "திறக்கப்பட்ட உறுப்பினர்களுக்கு மட்டும்" : "Only to unlocked members"}</p>
            </div>
            <Toggle value={showContact} onChange={() => setShowContact(v => !v)} />
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-5 w-5 text-rose-500" />
            <h2 className="font-display text-base font-bold">{isTamil ? "கடவுச்சொல் மாற்று" : "Change Password"}</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-password"><Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{isTamil ? "தற்போதைய கடவுச்சொல்" : "Current Password"}</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isTamil ? "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்" : "Enter current password"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password"><Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{isTamil ? "புதிய கடவுச்சொல்" : "New Password"}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isTamil ? "குறைந்தது 8 எழுத்துகள்" : "Minimum 8 characters"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password"><Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />{isTamil ? "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்" : "Confirm New Password"}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isTamil ? "மீண்டும் உள்ளிடவும்" : "Re-enter new password"}
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-rose text-white"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {isTamil ? "மாற்றுகிறது..." : "Changing..."}</>
              ) : (
                isTamil ? "கடவுச்சொல்லை மாற்றவும்" : "Update Password"
              )}
            </Button>
          </form>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-base font-bold">{isTamil ? "அறிவிப்புகள்" : "Notifications"}</h2>
          </div>
          <div className="flex items-center justify-between py-3.5 border-b border-border/40">
            <div>
              <p className="text-sm font-medium">{isTamil ? "ஆர்வம் அனுப்பினால் அறிவி" : "Interest Notifications"}</p>
              <p className="text-xs text-muted-foreground">{isTamil ? "யாரேனும் ஆர்வம் காட்டும்போது" : "When someone sends you interest"}</p>
            </div>
            <Toggle value={notifyInterest} onChange={() => setNotifyInterest(v => !v)} />
          </div>
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-sm font-medium">{isTamil ? "செய்தி அறிவிப்புகள்" : "Message Notifications"}</p>
              <p className="text-xs text-muted-foreground">{isTamil ? "புதிய செய்தி வரும்போது" : "When you receive a new message"}</p>
            </div>
            <Toggle value={notifyMessage} onChange={() => setNotifyMessage(v => !v)} />
          </div>
        </motion.div>

        {/* Privacy Policy Link */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border bg-card shadow-soft overflow-hidden">
          <div className="flex flex-col divide-y divide-border/40">
            <Link to="/privacy" className="flex items-center justify-between p-5 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{isTamil ? "தனியுரிமைக் கொள்கை" : "Privacy Policy"}</p>
                  <p className="text-xs text-muted-foreground">{isTamil ? "கடைசியாக புதுப்பிக்கப்பட்டது: ஜூன் 2026" : "Last updated: June 2026"}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/terms" className="flex items-center justify-between p-5 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{isTamil ? "பயன்பாட்டு விதிமுறைகள்" : "Terms of Service"}</p>
                  <p className="text-xs text-muted-foreground">{isTamil ? "நிபந்தனைகள் மற்றும் விதிமுறைகள்" : "Our terms and conditions"}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </motion.div>

        {/* Save Button */}
        <button
          onClick={() => toast.success(isTamil ? "அமைப்புகள் சேமிக்கப்பட்டன!" : "Privacy settings saved!")}
          className="w-full py-4 rounded-2xl gradient-rose text-white font-bold text-sm shadow-soft transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer"
        >
          {isTamil ? "அமைப்புகளை சேமிக்கவும்" : "Save Settings"}
        </button>
      </div>
    </DashboardLayout>
  );
}
