import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — Ungalkalyanam" }, { name: "description", content: "Answers to common questions about Ungalkalyanam." }] }),
  component: FaqPage,
});

type FaqType = {
  id: number;
  question: string;
  answer: string;
};

function FaqPage() {
  const { data: faqs = [], isLoading } = useQuery<FaqType[]>({
    queryKey: ["faqs"],
    queryFn: () => api.get<FaqType[]>("/faqs"),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-sm font-medium text-primary">FAQs</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Frequently asked questions</h1>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="mt-10 divide-y rounded-2xl border bg-card shadow-soft">
            {faqs.map((f, i) => (
              <AccordionItem key={f.id} value={`i${i}`} className="px-5">
                <AccordionTrigger className="text-left text-base font-semibold">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-left">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
      <Footer />
    </div>
  );
}
