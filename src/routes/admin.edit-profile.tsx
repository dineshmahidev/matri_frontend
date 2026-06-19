import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import {
  Loader2, ArrowLeft, User, Mail, Phone, Calendar, ShieldCheck,
  Crown, Search, X, Check, Image
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/edit-profile")({
  head: () => ({ meta: [{ title: "Edit Profile — Admin — Ungalkalyanam" }] }),
  component: AdminEditProfile,
});

function AdminEditProfile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileResponse, isLoading, isError, error } = useQuery<any>({
    queryKey: ["admin-profile"],
    queryFn: () => api.get<any>("/admin/profile"),
    retry: false,
  });
  const profile = profileResponse;

  console.log("[Admin Edit Profile] error:", error, "isError:", isError, "profileResponse:", profileResponse);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Member management
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setGender(profile.gender || "");
      setDob(profile.dob || "");
      setPhoto(profile.photo || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put("/admin/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update profile."),
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("photo", file);
      return api.post("/admin/profile/photo", fd);
    },
    onSuccess: (res: any) => {
      setPhoto(res?.url || "");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Photo updated!");
    },
    onError: () => toast.error("Failed to upload photo"),
  });

  // Member premium/verify toggle
  const searchMembers = async (q: string) => {
    if (!q.trim()) { setMembers([]); return; }
    setSearching(true);
    try {
      const res = await api.get<any>(`/admin/users?search=${encodeURIComponent(q)}&all=1`);
      setMembers(res?.data || []);
    } catch { setMembers([]); }
    setSearching(false);
  };

  const togglePremium = useMutation({
    mutationFn: ({ id, premium }: { id: number; premium: boolean }) =>
      api.put(`/admin/users/${id}`, { premium }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Premium status updated!");
    },
    onError: () => toast.error("Failed to update premium"),
  });

  const toggleVerified = useMutation({
    mutationFn: ({ id, verified }: { id: number; verified: boolean }) =>
      api.put(`/admin/users/${id}`, { verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Verification status updated!");
    },
    onError: () => toast.error("Failed to update verification"),
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      photoMutation.mutate(f);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, email, phone, gender, dob });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !profile) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Failed to load profile: {errMsg}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="space-y-6 text-left animate-fade-in pb-10">
        <div className="flex items-center gap-4 mb-6 mt-2">
          <h1 className="font-display text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Profile Photo */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-5">
            <Image className="h-5 w-5 text-pink-500 fill-pink-500" />
            Profile Photo
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20">
              {photo ? (
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={photoMutation.isPending}>
                {photoMutation.isPending ? "Uploading..." : "Change Photo"}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">Max 5MB</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-pink-500 fill-pink-500" />
            Profile Information
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><User className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />Full Name</span>
              <input className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Mail className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />Email</span>
              <input className="h-11 w-full rounded-xl border bg-background px-4 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Phone className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />Phone</span>
              <input className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><User className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />Gender</span>
              <select className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground"><Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" style={{ color: "#E83F7B" }} />Date of Birth</span>
              <input type="date" className="h-11 w-full rounded-xl border bg-background px-4 text-sm" value={dob} onChange={(e) => setDob(e.target.value)} />
            </label>
          </div>
        </div>

        {/* Premium & Verification Management */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-pink-500 fill-pink-500" />
            Premium & Verification Management
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Search members to toggle premium or verified status</p>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm"
              placeholder="Search member name, email or ID..."
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                if (e.target.value.length >= 2) searchMembers(e.target.value);
                else setMembers([]);
              }}
            />
            {memberSearch && (
              <button type="button" onClick={() => { setMemberSearch(""); setMembers([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {searching && <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-primary" />}

          {members.length > 0 && (
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {members.map((m: any) => (
                <div key={m.userId} className="flex items-center justify-between rounded-xl border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-rose/20 overflow-hidden">
                      {m.photo ? <img src={m.photo} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 m-auto mt-2.5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.id} · {m.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePremium.mutate({ id: m.userId, premium: !m.premium })}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        m.premium ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      {m.premium ? "Premium" : "Free"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVerified.mutate({ id: m.userId, verified: !m.verified })}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        m.verified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {m.verified ? "Verified" : "Unverified"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {memberSearch.length >= 2 && !searching && members.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground text-center">No members found</p>
          )}
        </div>

        <div className="flex justify-end pt-4 pb-8">
          <Button type="submit" disabled={updateMutation.isPending} className="gradient-rose text-white px-8 h-12 text-lg rounded-xl">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
