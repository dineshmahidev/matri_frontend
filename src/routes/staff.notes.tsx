import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Search, Phone, ChevronLeft, ChevronRight, StickyNote } from "lucide-react";

export const Route = createFileRoute("/staff/notes")({
  head: () => ({ meta: [{ title: "Follow-up Notes — Staff" }] }),
  component: StaffNotes,
});

type StaffNoteRow = {
  id: number;
  content: string;
  status: string;
  follow_up_at: string | null;
  created_at: string;
  member?: { id: number; name: string; phone?: string; profile?: { display_id: string } };
  lead?: { id: number; name: string; phone: string };
};

function StaffNotes() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [followUp, setFollowUp] = useState("all");
  const [content, setContent] = useState("");
  const [memberId, setMemberId] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");

  const { data, isLoading } = useQuery<any>({
    queryKey: ["staff-notes", page, search, status, followUp],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (followUp !== "all") params.set("follow_up", followUp);
      return api.get(`/staff/notes?${params.toString()}`);
    },
  });

  const notes: StaffNoteRow[] = data?.data ?? [];
  const meta = data?.meta;

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/staff/notes", payload),
    onSuccess: () => {
      toast.success("Note saved");
      setContent("");
      setMemberId("");
      setFollowUpAt("");
      queryClient.invalidateQueries({ queryKey: ["staff-notes"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save note"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/staff/notes/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-notes"] });
      toast.success("Note updated");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <AdminLayout role="Staff">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <StickyNote className="h-7 w-7 text-primary" />
            Follow-up Notes
          </h1>
          <p className="text-sm text-muted-foreground">
            Track member calls, filter by follow-up date, and mark notes complete.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
          <h2 className="font-semibold">Add member note</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Member user ID</Label>
              <Input
                placeholder="Numeric user ID from Users list"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Follow-up date & time</Label>
              <Input
                type="datetime-local"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Note</Label>
              <Textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Call summary, next steps..."
              />
            </div>
          </div>
          <Button
            className="gradient-rose text-white"
            disabled={!content.trim() || !memberId || createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                member_id: Number(memberId),
                content: content.trim(),
                follow_up_at: followUpAt || undefined,
              })
            }
          >
            {createMutation.isPending ? "Saving..." : "Save note"}
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search notes or member name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
          <div className="flex flex-wrap gap-3">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={followUp} onValueChange={(v) => { setFollowUp(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Follow-up" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any follow-up</SelectItem>
                <SelectItem value="today">Due today</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notes.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No notes found.</p>
          ) : (
            <div className="divide-y">
              {notes.map((n) => (
                <div key={n.id} className="p-4 hover:bg-muted/20">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {n.member?.name ?? n.lead?.name ?? "Unknown"}
                        {n.member?.profile?.display_id && (
                          <span className="ml-2 text-xs font-mono text-muted-foreground">
                            {n.member.profile.display_id}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString()}
                        {n.follow_up_at && (
                          <> · Follow-up: {new Date(n.follow_up_at).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      n.status === "completed" ? "bg-emerald-100 text-emerald-800"
                        : n.status === "cancelled" ? "bg-slate-100 text-slate-600"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {n.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{n.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(n.member?.phone || n.lead?.phone) && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${n.member?.phone ?? n.lead?.phone}`}>
                          <Phone className="mr-1 h-3.5 w-3.5" /> Call again
                        </a>
                      </Button>
                    )}
                    {n.member && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/staff/users">View user</Link>
                      </Button>
                    )}
                    {n.status === "pending" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: n.id, status: "completed" })}
                      >
                        Mark done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t p-4 bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
