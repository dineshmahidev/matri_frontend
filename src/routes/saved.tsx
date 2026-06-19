import { createFileRoute } from "@tanstack/react-router";
import { BrowseLayout } from "./browse";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved Profiles — Ungalkalyanam" }] }),
  component: SavedProfiles,
});

function SavedProfiles() {
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["saved-profiles"],
    queryFn: () => api.get<{ data: any[] }>("/saved"),
  });

  const members = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <BrowseLayout 
      title="Saved Profiles" 
      subtitle="Your shortlist" 
      members={members} 
    />
  );
}
