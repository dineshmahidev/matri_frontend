import { createFileRoute } from "@tanstack/react-router";
import { BrowseLayout } from "./browse";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/interests-received")({
  head: () => ({ meta: [{ title: "Interests Received — Ungalkalyanam" }] }),
  component: InterestsReceived,
});

function InterestsReceived() {
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["interests-received"],
    queryFn: () => api.get<{ data: any[] }>("/interests/received"),
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
      title="Interests Received" 
      subtitle="Members interested in you" 
      members={members} 
    />
  );
}
