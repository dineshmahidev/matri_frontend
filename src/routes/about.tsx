import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart, ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Ungalkalyanam" }, { name: "description", content: "Our mission, values and the people behind Ungalkalyanam." }] }),
  component: About,
});

function About() {
  const values = [
    { icon: Heart, t: "Empathy first", d: "Every feature starts with how it makes our members feel." },
    { icon: ShieldCheck, t: "Trust & safety", d: "Verified identities and privacy by design." },
    { icon: Sparkles, t: "Quality matches", d: "Compatibility over quantity, always." },
    { icon: Users, t: "Community", d: "We build for families, not just individuals." },
  ];
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="text-sm font-medium text-primary">About Ungalkalyanam</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Reimagining matrimony for modern India.</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Ungalkalyanam was founded with a single belief — that finding a life partner should be a journey of dignity, safety and joy.
          Today we serve over 5 million members across 240+ cities, with one of the highest match success rates in the industry.
        </p>
        <img src="https://images.unsplash.com/photo-1529636798458-92182e662485?w=1600&auto=format&fit=crop" alt="" className="mt-10 aspect-[16/8] w-full rounded-3xl object-cover shadow-elevated" />
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.t} className="rounded-2xl border bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><v.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-xl font-semibold">{v.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
