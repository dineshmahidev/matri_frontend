import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Ungalkalyanam" }, { name: "description", content: "We're here to help. Reach out anytime." }] }),
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: settings, isLoading: loadingSettings } = useQuery<any>({
    queryKey: ["site-settings"],
    queryFn: () => api.get<any>("/settings"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/contact", {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      });

      toast.success("Thank you! Your message has been sent successfully.");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div className="text-left">
          <p className="text-sm font-medium text-primary">Get in touch</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">We'd love to hear from you.</h1>
          <p className="mt-4 text-muted-foreground">Questions, feedback or press enquiries — our team responds within 24 hours.</p>
          {loadingSettings ? (
            <div className="flex h-32 items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="mt-8 space-y-4">
              {[
                { icon: Mail, t: "Email", d: settings?.contact_email || "ungalkalyanam.in@gmail.com" },
                { icon: Phone, t: "Phone", d: settings?.contact_phone || "+91 9597558432" },
                { icon: MapPin, t: "Office", d: settings?.contact_address_en || "8th Floor, Indiranagar, Bengaluru 560038" }
              ].map((item) => (
                <div key={item.t} className="flex items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold">{item.t}</p>
                    <p className="text-sm text-muted-foreground">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form className="rounded-3xl border bg-card p-7 shadow-soft text-left" onSubmit={handleSubmit}>
          <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
          <div className="mt-5 space-y-4">
            <input 
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
              placeholder="Full name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input 
              type="email"
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
              placeholder="Phone (optional)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input 
              className="h-11 w-full rounded-xl border bg-background px-4 text-sm" 
              placeholder="Subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea 
              rows={5} 
              className="w-full rounded-xl border bg-background p-4 text-sm" 
              placeholder="Your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <Button disabled={submitting} type="submit" className="w-full gradient-rose text-white">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}
