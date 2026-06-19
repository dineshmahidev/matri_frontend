import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart, MapPin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/success-stories")({
  head: () => ({ meta: [{ title: "Success Stories — Ungalkalyanam" }, { name: "description", content: "Real couples, real stories. Find yours next." }] }),
  component: Stories,
});

type StoryType = {
  id: number | string;
  couple_name: string;
  date: string;
  city: string;
  photo: string;
  quote: string;
};

function Stories() {
  const { data: stories = [], isLoading } = useQuery<StoryType[]>({
    queryKey: ["success-stories"],
    queryFn: () => api.get<StoryType[]>("/success-stories"),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-sm font-medium text-primary">Success stories</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">120,000+ happily married couples.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Every story started with a hello on Ungalkalyanam. Read how our members found each other.</p>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <div key={s.id} className="hover-lift overflow-hidden rounded-3xl border bg-card shadow-soft text-left animate-fade-in">
                <img src={s.photo} alt={s.couple_name} className="aspect-[4/3] w-full object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {s.city} · {s.date}</div>
                  <h3 className="mt-2 font-display text-xl font-semibold">{s.couple_name}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">"{s.quote}"</p>
                  <p className="mt-4 flex items-center gap-1 text-xs font-medium text-primary"><Heart className="h-3 w-3 fill-primary" /> Matched on Ungalkalyanam</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
