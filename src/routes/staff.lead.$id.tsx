import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layout/AppLayouts";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./uk-control.index";
import { Phone, Mail, MessageCircle, ArrowLeft, Loader2, Search, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/staff/lead/$id")({
  component: LeadDetail,
});

const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"] as const;

type LeadNote = {
  id: number;
  note: string;
  status?: string;
  follow_up_at?: string | null;
  created_at: string;
  author?: { name: string };
};

function LeadDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [noteStatus, setNoteStatus] = useState("all");
  const [noteFollowUp, setNoteFollowUp] = useState("all");
  const [noteFrom, setNoteFrom] = useState("");
  const [noteTo, setNoteTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "all",
    follow_up: "all",
    from: "",
    to: "",
  });

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ["staff-lead", id],
    queryFn: () => api.get<any>(`/staff/leads/${id}`),
  });

  const { data: notesResponse, isLoading: loadingNotes } = useQuery<{ data: LeadNote[] }>({
    queryKey: ["staff-lead-notes", id, appliedFilters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (appliedFilters.search) params.set("search", appliedFilters.search);
      if (appliedFilters.status !== "all") params.set("status", appliedFilters.status);
      if (appliedFilters.follow_up !== "all") params.set("follow_up", appliedFilters.follow_up);
      if (appliedFilters.from) params.set("from", appliedFilters.from);
      if (appliedFilters.to) params.set("to", appliedFilters.to);
      const qs = params.toString();
      return api.get(`/staff/leads/${id}/notes${qs ? `?${qs}` : ""}`);
    },
    enabled: !!id,
  });

  const notes = notesResponse?.data || lead?.notes || [];
  const allNotes = lead?.notes || [];

  const updateMutation = useMutation({
    mutationFn: (status: string) => api.put(`/staff/leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-lead", id] });
      queryClient.invalidateQueries({ queryKey: ["staff-leads"] });
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard-data"] });
      toast.success("Lead status updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update lead"),
  });

  const saveNoteMutation = useMutation({
    mutationFn: (payload: { note: string; follow_up_at?: string }) =>
      api.post(`/staff/leads/${id}/notes`, payload),
    onSuccess: () => {
      setNote("");
      setFollowUpAt("");
      queryClient.invalidateQueries({ queryKey: ["staff-lead-notes", id] });
      queryClient.invalidateQueries({ queryKey: ["staff-lead", id] });
      toast.success("Note saved");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save note"),
  });

  const applyNoteFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters({
      search: noteSearch,
      status: noteStatus,
      follow_up: noteFollowUp,
      from: noteFrom,
      to: noteTo,
    });
  };

  const clearNoteFilters = () => {
    setNoteSearch("");
    setNoteStatus("all");
    setNoteFollowUp("all");
    setNoteFrom("");
    setNoteTo("");
    setAppliedFilters({ search: "", status: "all", follow_up: "all", from: "", to: "" });
  };

  if (isLoading) {
    return (
      <AdminLayout role="Staff">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !lead) {
    return (
      <AdminLayout role="Staff">
        <p className="text-muted-foreground">Lead not found or you do not have access.</p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link to="/staff/leads">Back to leads</Link>
        </Button>
      </AdminLayout>
    );
  }

  const l = lead;

  return (
    <AdminLayout role="Staff">
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/staff/leads"><ArrowLeft className="mr-1 h-4 w-4" /> Back to leads</Link>
        </Button>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border bg-card p-6 shadow-soft lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold">{l.name}</h1>
                <p className="text-sm text-muted-foreground">{l.display_id ?? `L${l.id}`}{l.source ? ` · From ${l.source}` : ""}</p>
              </div>
              <StatusPill s={l.status} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3"><Phone className="h-4 w-4 text-primary" /> {l.phone}</div>
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3"><Mail className="h-4 w-4 text-primary" /> {l.email ?? "—"}</div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold">Update status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate(s)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${s === l.status ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Staff notes</p>
                <span className="text-xs text-muted-foreground">{notes.length} note(s)</span>
              </div>

              <form onSubmit={applyNoteFilters} className="rounded-xl border bg-muted/30 p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" /> Filter notes
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="relative sm:col-span-2">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search text..."
                      className="pl-8 h-9 text-sm"
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="field h-9 text-sm rounded-md border bg-background px-2"
                    value={noteStatus}
                    onChange={(e) => setNoteStatus(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    className="field h-9 text-sm rounded-md border bg-background px-2"
                    value={noteFollowUp}
                    onChange={(e) => setNoteFollowUp(e.target.value)}
                  >
                    <option value="all">Any follow-up</option>
                    <option value="today">Due today</option>
                    <option value="overdue">Call again (overdue)</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                  <Input type="date" className="h-9 text-sm" value={noteFrom} onChange={(e) => setNoteFrom(e.target.value)} />
                  <Input type="date" className="h-9 text-sm" value={noteTo} onChange={(e) => setNoteTo(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="secondary">Apply</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={clearNoteFilters}>Clear</Button>
                </div>
              </form>

              <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border p-3">
                {loadingNotes && !notesResponse ? (
                  <p className="text-sm text-muted-foreground">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : (
                  notes.map((n: LeadNote) => (
                    <div key={n.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                      <p>{n.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.author?.name ?? "Staff"} · {new Date(n.created_at).toLocaleString()}
                        {n.status && ` · ${n.status}`}
                        {n.follow_up_at && ` · Follow-up: ${new Date(n.follow_up_at).toLocaleString()}`}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div>
                <Label htmlFor="new-note">Add note</Label>
                <textarea
                  id="new-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm"
                  placeholder="Conversation summary, next steps..."
                />
                <div className="mt-2 space-y-1.5">
                  <Label htmlFor="follow-up">Call again on</Label>
                  <Input
                    id="follow-up"
                    type="datetime-local"
                    value={followUpAt}
                    onChange={(e) => setFollowUpAt(e.target.value)}
                  />
                </div>
                <Button
                  className="mt-3 gradient-rose text-white"
                  disabled={!note.trim() || saveNoteMutation.isPending}
                  onClick={() =>
                    saveNoteMutation.mutate({
                      note: note.trim(),
                      follow_up_at: followUpAt || undefined,
                    })
                  }
                >
                  {saveNoteMutation.isPending ? "Saving..." : "Save note"}
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border bg-card p-6 shadow-soft">
              <p className="font-semibold">Activity timeline</p>
              <ol className="mt-4 space-y-4 border-l border-border pl-4 text-sm">
                {allNotes.slice(0, 3).map((n: LeadNote) => (
                  <li key={`note-${n.id}`} className="relative">
                    <span className="absolute -left-[1.34rem] top-1 h-2 w-2 rounded-full bg-violet-500" />
                    <p className="font-medium">Note added</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.note}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </li>
                ))}
                {[
                  { t: `Status: ${l.status}`, d: l.updated_at ? new Date(l.updated_at).toLocaleString() : "—" },
                  { t: "Lead assigned to you", d: l.created_at ? new Date(l.created_at).toLocaleString() : "—" },
                ].map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.34rem] top-1 h-2 w-2 rounded-full bg-primary" />
                    <p className="font-medium">{e.t}</p>
                    <p className="text-xs text-muted-foreground">{e.d}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border bg-card p-6 shadow-soft">
              <p className="font-semibold">Quick actions</p>
              <div className="mt-3 space-y-2">
                {l.phone ? (
                  <Button className="w-full gradient-rose text-white" asChild>
                    <a href={`tel:${l.phone}`}><Phone className="mr-2 h-4 w-4" /> Call lead</a>
                  </Button>
                ) : (
                  <Button className="w-full gradient-rose text-white" disabled>
                    <Phone className="mr-2 h-4 w-4" /> No phone number
                  </Button>
                )}
                {l.phone ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> Send WhatsApp
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <MessageCircle className="mr-2 h-4 w-4" /> No phone number
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/staff/create-user">Convert to user</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
