import { createFileRoute } from "@tanstack/react-router";
import { BrowseLayout } from "./browse";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/lib/language";

export const Route = createFileRoute("/recently-joined")({
  head: () => ({ meta: [{ title: "Recently Joined — Ungalkalyanam" }] }),
  component: RecentlyJoined,
});

function RecentlyJoined() {
  const { language } = useLanguage();
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["recently-joined-members"],
    queryFn: () => api.get<{ data: any[] }>("/members/recently-joined"),
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
      title={language === "ta" ? "சமீபத்தில் இணைந்தவர்கள்" : "Recently Joined"} 
      subtitle={language === "ta" ? "புதிய சுயவிவரங்கள்" : "Fresh profiles"} 
      members={members} 
    />
  );
}
