import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, UserPlus } from "lucide-react";
import { MemberProfileFields } from "@/components/matrimony/MemberProfileFields";

export const Route = createFileRoute("/staff/create-user")({
  head: () => ({ meta: [{ title: "Create User Profile — Staff" }] }),
  component: StaffCreateUser,
});

function StaffCreateUser() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [motherTongue, setMotherTongue] = useState("Tamil");
  const [religionId, setReligionId] = useState<number | null>(null);
  const [casteId, setCasteId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post<any>("/staff/create-user", data),
    onSuccess: () => {
      toast.success("User profile created successfully!");
      navigate({ to: "/staff/users" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create user profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !gender || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!religionId || !casteId || !stateId || !cityId) {
      toast.error("Please select religion, caste, state, and city");
      return;
    }

    createMutation.mutate({
      name,
      email,
      phone,
      gender,
      password,
      dob: dob || undefined,
      mother_tongue: motherTongue,
      religion_id: religionId,
      caste_id: casteId,
      state_id: stateId,
      city_id: cityId,
    });
  };

  return (
    <AdminLayout role="Staff">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate({ to: "/staff/users" })}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <UserPlus className="h-7 w-7 text-primary" />
              Create User Profile
            </h1>
            <p className="text-sm text-muted-foreground">On-board a new member on behalf of a lead.</p>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="create-name">Full Name *</Label>
                <Input
                  id="create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-email">Email Address *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajesh@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-phone">Phone Number *</Label>
                <Input
                  id="create-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-gender">Gender *</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="create-gender">
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
                <Label htmlFor="create-dob">Date of Birth</Label>
                <Input
                  id="create-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-password">Temporary Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-mother-tongue">Mother Tongue</Label>
                <Input
                  id="create-mother-tongue"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                />
              </div>

              <MemberProfileFields
                religionId={religionId}
                casteId={casteId}
                stateId={stateId}
                cityId={cityId}
                onReligionChange={setReligionId}
                onCasteChange={setCasteId}
                onStateChange={setStateId}
                onCityChange={setCityId}
                required
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                type="submit"
                className="w-full gradient-rose text-white shadow-soft h-11"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  "Create Member Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
