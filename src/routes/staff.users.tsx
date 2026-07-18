import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Crown, 
  ShieldCheck, 
  X,
  Coins
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RELIGIONS, CASTES, RELIGION_CASTE_MAP, OPTION_TRANSLATIONS } from "@/data/castes";
import { EDUCATION_LEVELS, PROFESSIONS } from "@/data/education";

export const Route = createFileRoute("/staff/users")({
  head: () => ({ meta: [{ title: "Users — Staff" }] }),
  component: StaffUsers,
});

function StaffUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasPhoto, setHasPhoto] = useState("all");
  const [hasGallery, setHasGallery] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);

  // Form states for edit drawer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  // const [tob, setTob] = useState("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [religion, setReligion] = useState("");
  const [community, setCommunity] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [profession, setProfession] = useState("");
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [premium, setPremium] = useState(false);
  const [verified, setVerified] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("free");

  // Horoscope fields (removed rasi/nakshatram)

  // Family fields
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [siblings, setSiblings] = useState("");
  const [familyStatus, setFamilyStatus] = useState("Middle Class");

  // Partner Preferences fields
  const [prefAgeRange, setPrefAgeRange] = useState("");
  const [prefHeightRange, setPrefHeightRange] = useState("");
  const [prefReligion, setPrefReligion] = useState("");
  const [prefCommunity, setPrefCommunity] = useState("");
  const [prefEducation, setPrefEducation] = useState("");
  const [prefProfession, setPrefProfession] = useState("");
  const [prefLocation, setPrefLocation] = useState("");

  // Fetch users (paginated)
  const { data: usersResponse, isLoading } = useQuery<any>({
    queryKey: ["staff-users", page, search, hasPhoto, hasGallery],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (hasPhoto !== "all") params.set("has_photo", hasPhoto);
      if (hasGallery !== "all") params.set("has_gallery", hasGallery);
      return api.get<any>(`/admin/users?${params.toString()}`);
    },
    retry: false,
  });

  const users = usersResponse?.data || [];
  const meta = usersResponse?.meta;

  const { data: plansData } = useQuery<any[]>({
    queryKey: ["staff-plans-list"],
    queryFn: () => api.get<any>("/admin/plans"),
  });
  const plans = plansData || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // Mutate for update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      toast.success("User updated successfully");
      setIsEditing(false);
      setActiveUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  const handleOpenEdit = (user: any) => {
    setActiveUser(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setGender(user.gender || "male");
    setDob(user.dob || "");
    setBio(user.bio || "");
    setHeight(user.height || "");
    setReligion(user.religion || "");
    setCommunity(user.community || "");
    setMotherTongue(user.motherTongue || "Tamil");
    setCity(user.city || "");
    setState(user.state || "");
    setProfession(user.profession || "");
    setEducation(user.education || "");
    setIncome(user.income || "");
    setMaritalStatus(user.maritalStatus || "Never Married");
    setPremium(!!user.premium);
    setVerified(!!user.verified);
    setSelectedPlanId(user.planId ? String(user.planId) : "free");
    setFather(user.family?.father || "");
    setMother(user.family?.mother || "");
    setSiblings(user.family?.siblings || "");
    setFamilyStatus(user.family?.familyStatus || "Middle Class");
    setPrefAgeRange(user.partnerPrefs?.ageRange || "");
    setPrefHeightRange(user.partnerPrefs?.heightRange || "");
    setPrefReligion(user.partnerPrefs?.religion || "");
    setPrefCommunity(user.partnerPrefs?.community || "");
    setPrefEducation(user.partnerPrefs?.education || "");
    setPrefProfession(user.partnerPrefs?.profession || "");
    setPrefLocation(user.partnerPrefs?.location || "");
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    
    updateMutation.mutate({
      id: activeUser.userId,
      data: {
        name,
        email,
        phone,
        gender,
        dob,
        bio,
        height,
        religion,
        community,
        motherTongue,
        city,
        state,
        profession,
        education,
        income,
        maritalStatus,
        premium,
        verified,
        planId: selectedPlanId === "free" ? null : Number(selectedPlanId),
        family: {
          father,
          mother,
          siblings,
          familyStatus,
        },
        partnerPrefs: {
          ageRange: prefAgeRange,
          heightRange: prefHeightRange,
          religion: prefReligion,
          community: prefCommunity,
          education: prefEducation,
          profession: prefProfession,
          location: prefLocation,
        },
      },
    });
  };

  return (
    <AdminLayout role="Staff">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">
              {meta ? `${meta.total} total users` : "Loading users..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/staff/create-user">
              <Button className="gradient-rose text-white shadow-soft">
                <Plus className="mr-1.5 h-4 w-4" /> Add user
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or ID (e.g. UK0010008)..."
                className="pl-9 pr-8"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Profile photo</Label>
              <Select value={hasPhoto} onValueChange={(v) => { setHasPhoto(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has photo</SelectItem>
                  <SelectItem value="no">No photo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Gallery</Label>
              <Select value={hasGallery} onValueChange={(v) => { setHasGallery(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Has gallery</SelectItem>
                  <SelectItem value="no">No gallery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Users Table */}
        <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-muted-foreground">
              <p className="font-semibold text-lg">No users found</p>
              <p className="text-sm">Try clearing your filters or searches.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">ID</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Plan Status</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((m: any) => (
                    <tr 
                      key={m.userId} 
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td 
                        className="p-4 cursor-pointer" 
                        onClick={() => handleOpenEdit(m)}
                      >
                        <div className="flex items-center gap-3">
                          {m.photo ? (
                            <img src={m.photo} className="h-9 w-9 rounded-full object-cover border shadow-sm" alt="" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border uppercase text-xs">
                              {m.name ? m.name.slice(0, 2) : "??"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              {m.name}
                              {m.premium && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">{m.profession || "Not Specified"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{m.id}</td>
                      <td className="p-4">{m.city ? `${m.city}, ${m.state}` : "N/A"}</td>
                      <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.premium ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                            {m.premium ? "Premium" : "Free"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium">
                            <Coins className="h-3 w-3 text-amber-500" />
                            {m.credits ?? 0}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.verified ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {m.verified ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-0.5" />
                              Verified
                            </>
                          ) : (
                            "Unverified"
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 shadow-lg border rounded-xl p-1">
                            <DropdownMenuItem 
                              onClick={() => handleOpenEdit(m)}
                              className="gap-2 cursor-pointer rounded-lg text-sm"
                            >
                              <Edit className="h-4 w-4" /> Edit details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t p-4 bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">
                Page {meta.current_page} of {meta.last_page} ({meta.total} users)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="shadow-sm"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Slide-over Drawer */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-xl h-full flex flex-col p-6 border-l shadow-2xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="font-display text-2xl font-bold flex items-center gap-2">
              Edit User Profile
              {activeUser && (
                <span className="text-xs font-mono font-normal bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {activeUser.id}
                </span>
              )}
            </SheetTitle>
            <SheetDescription>
              Modify member details. Toggle premium and verification flags manually.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 pr-1 space-y-6">
            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Account Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input 
                    id="edit-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input 
                    id="edit-phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="edit-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-dob">Date of Birth</Label>
                  <Input 
                    id="edit-dob" 
                    type="date" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                  />
                </div>
                {/* TOB field removed */}
              </div>
            </div>

            {/* Status & Privileges */}
            <div className="space-y-4 bg-muted/30 p-4 rounded-2xl border">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Status & Privileges</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-1.5 cursor-pointer" htmlFor="edit-premium">
                      <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Premium Member
                    </Label>
                    <p className="text-xs text-muted-foreground">Grant unlock credits and highlighted badges.</p>
                  </div>
                  <Switch 
                    id="edit-premium" 
                    checked={premium} 
                    onCheckedChange={setPremium} 
                  />
                </div>
                <div className="space-y-1.5 bg-card border p-3.5 rounded-xl shadow-sm">
                  <Label htmlFor="edit-plan" className="text-xs font-semibold">Membership Plan</Label>
                  <Select value={selectedPlanId} onValueChange={v => { setSelectedPlanId(v); setPremium(v !== "free") }}>
                    <SelectTrigger id="edit-plan" className="h-9">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Plan (Basic)</SelectItem>
                      {plans.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} (₹{p.price} / {p.period})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-1.5 cursor-pointer" htmlFor="edit-verified">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Verified Profile
                    </Label>
                    <p className="text-xs text-muted-foreground">Indicate government ID or phone validation completed.</p>
                  </div>
                  <Switch 
                    id="edit-verified" 
                    checked={verified} 
                    onCheckedChange={setVerified} 
                  />
                </div>
              </div>
            </div>

            {/* Religious Background */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Religious Background</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-religion">Religion</Label>
                  <Select value={religion} onValueChange={setReligion}>
                    <SelectTrigger id="edit-religion">
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-community">Community / Caste</Label>
                  <Select value={community} onValueChange={setCommunity}>
                    <SelectTrigger id="edit-community">
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASTES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-mothertongue">Mother Tongue</Label>
                  <Input 
                    id="edit-mothertongue" 
                    value={motherTongue} 
                    onChange={(e) => setMotherTongue(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-height">Height</Label>
                  <Input 
                    id="edit-height" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)} 
                    placeholder="e.g. 5ft 8in"
                  />
                </div>
              </div>
            </div>

            {/* Location & Career */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Location & Career</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-city">City</Label>
                  <Input 
                    id="edit-city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-state">State</Label>
                  <Input 
                    id="edit-state" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="edit-education">Education</Label>
                  <Input 
                    id="edit-education" 
                    value={education} 
                    onChange={(e) => setEducation(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-profession">Profession</Label>
                  <Input 
                    id="edit-profession" 
                    value={profession} 
                    onChange={(e) => setProfession(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-income">Annual Income</Label>
                  <Input 
                    id="edit-income" 
                    value={income} 
                    onChange={(e) => setIncome(e.target.value)} 
                    placeholder="e.g. ₹12 LPA"
                  />
                </div>
              </div>
            </div>

            {/* Bio & Marriage details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Bio & Personal Status</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-marital">Marital Status</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger id="edit-marital">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Awaiting Divorce">Awaiting Divorce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-bio">Bio Details</Label>
                  <Textarea 
                    id="edit-bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Horoscope Details (removed rasi/nakshatram) */}

            {/* Family Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Family Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-father">Father's Name</Label>
                  <Input id="edit-father" value={father} onChange={(e) => setFather(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-mother">Mother's Name</Label>
                  <Input id="edit-mother" value={mother} onChange={(e) => setMother(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-siblings">Sibling Details</Label>
                  <Input id="edit-siblings" value={siblings} onChange={(e) => setSiblings(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-family-status">Family Status</Label>
                  <Select value={familyStatus} onValueChange={setFamilyStatus}>
                    <SelectTrigger id="edit-family-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich / Affluent">Rich / Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-primary border-b pb-1">Partner Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-age">Age Range</Label>
                  <Select value={prefAgeRange} onValueChange={setPrefAgeRange}>
                    <SelectTrigger id="edit-pref-age">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {["18-25","25-30","30-35","35-40","40-45","45-50","50+"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-height">Height Range</Label>
                  <Select value={prefHeightRange} onValueChange={setPrefHeightRange}>
                    <SelectTrigger id="edit-pref-height">
                      <SelectValue placeholder="Select height range" />
                    </SelectTrigger>
                    <SelectContent>
                      {["4ft-5ft","5ft-5ft6in","5ft6in-6ft","6ft+"].map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-religion">Religion</Label>
                  <Select value={prefReligion} onValueChange={setPrefReligion}>
                    <SelectTrigger id="edit-pref-religion">
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-community">Community</Label>
                  <Input id="edit-pref-community" value={prefCommunity} onChange={(e) => setPrefCommunity(e.target.value)} placeholder="Any" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-education">Education</Label>
                  <Select value={prefEducation} onValueChange={setPrefEducation}>
                    <SelectTrigger id="edit-pref-education">
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-pref-profession">Profession</Label>
                  <Select value={prefProfession} onValueChange={setPrefProfession}>
                    <SelectTrigger id="edit-pref-profession">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="edit-pref-location">Preferred Location</Label>
                  <Input id="edit-pref-location" value={prefLocation} onChange={(e) => setPrefLocation(e.target.value)} placeholder="e.g. Chennai, Bangalore" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-rose text-white"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
