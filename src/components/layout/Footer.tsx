import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Youtube, Heart, MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";

export function Footer() {
  const { language } = useLanguage();
  const isTamil = language === "ta";
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => api.get("/settings"),
  });

  const socialLinks = [
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Facebook, href: "#", label: "Facebook" },
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Youtube, href: "#", label: "Youtube" },
  ];

  return (
    <footer
      className="mt-16 border-t"
      style={{
        borderColor: "rgba(212,175,55,0.15)",
        background: "linear-gradient(180deg, var(--color-background) 0%, rgba(74,4,4,0.04) 100%)",
      }}
    >
      {/* Gold ornament line */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #C2185B, #D4AF37, transparent)" }} />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img
                src={logoSrc}
                alt="Ungal Kalyanam"
                className="h-10 w-auto object-contain"
                style={{ maxWidth: "180px" }}
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {isTamil
                ? (settings?.footer_description_ta || "இந்தியாவின் மிகவும் நம்பகமான திருமண தளம். சரிபார்க்கப்பட்ட சுயவிவரங்கள், பாதுகாப்பான உரையாடல்கள், நிலையான உறவுகள்.")
                : (settings?.footer_description_en || "India's most trusted Tamil matrimony platform. Verified profiles, secure conversations, lasting matches.")}
            </p>

            {/* Contact info */}
            <div className="mt-4 space-y-2">
              <a href={`tel:${settings?.footer_phone || '+919999999999'}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-[#D4AF37] transition-colors">
                <Phone className="h-3.5 w-3.5 text-[#D4AF37]" /> {settings?.footer_phone || '+91 99999 99999'}
              </a>
              <a href={`mailto:${settings?.footer_email || 'support@ungalkalyanam.com'}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-[#D4AF37] transition-colors">
                <Mail className="h-3.5 w-3.5 text-[#D4AF37]" /> {settings?.footer_email || 'support@ungalkalyanam.com'}
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#C2185B]" /> {isTamil ? (settings?.footer_address_ta || 'சென்னை, தமிழ்நாடு') : (settings?.footer_address_en || 'Chennai, Tamil Nadu')}
              </div>
              {settings?.footer_timing && (
                <div className="text-xs text-muted-foreground ml-5">
                  {settings.footer_timing}
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="mt-5 flex gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full transition-all hover:scale-110"
                  style={{
                    border: "1px solid rgba(212,175,55,0.25)",
                    background: "rgba(212,175,55,0.06)",
                    color: "#D4AF37",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.14)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.06)";
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="h-3.5 w-0.5 rounded-full inline-block" style={{ background: "#D4AF37" }} />
              {isTamil ? "கண்டறியுங்கள்" : "Discover"}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { to: "/browse", label: isTamil ? "உறுப்பினர்களை உலாவுங்கள்" : "Browse Members" },
                { to: "/premium-members", label: isTamil ? "பிரீமியம் உறுப்பினர்கள்" : "Premium Members" },
                { to: "/recently-joined", label: isTamil ? "சமீபத்தில் சேர்ந்தவர்கள்" : "Recently Joined" },
                { to: "/search", label: isTamil ? "மேம்பட்ட தேடல்" : "Advanced Search" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-current opacity-40 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="h-3.5 w-0.5 rounded-full inline-block" style={{ background: "#C2185B" }} />
              {isTamil ? "நிறுவனம்" : "Company"}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { to: "/about", label: isTamil ? "எங்களைப் பற்றி" : "About Us" },
                { to: "/contact", label: isTamil ? "தொடர்பு கொள்ளவும்" : "Contact" },
                { to: "/success-stories", label: isTamil ? "வெற்றிக் கதைகள்" : "Success Stories" },
                { to: "/blog", label: isTamil ? "வலைப்பதிவு" : "Blog" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-[#C2185B] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-current opacity-40 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="h-3.5 w-0.5 rounded-full inline-block" style={{ background: "#996515" }} />
              {isTamil ? "ஆதரவு" : "Support"}
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {[
                { to: "/faq", label: isTamil ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "FAQs" },
                { to: "/pricing", label: isTamil ? "விலை நிர்ணயம்" : "Pricing" },
                { to: "/privacy", label: isTamil ? "தனியுரிமைக் கொள்கை" : "Privacy Policy" },
                { to: "/terms", label: isTamil ? "விதிமுறைகள்" : "Terms & Conditions" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-[#996515] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-current opacity-40 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* App badges */}
            <div className="mt-6 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">{isTamil ? "பயன்பாட்டை பதிவிறக்கவும்" : "Download Our App"}</p>
              <div className="flex flex-col gap-2">
                <a href="#" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:scale-105"
                  style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.20)", color: "var(--color-foreground)" }}>
                  📱 {isTamil ? "App Store" : "App Store"}
                </a>
                <a href="#" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:scale-105"
                  style={{ background: "rgba(194,24,91,0.06)", border: "1px solid rgba(194,24,91,0.18)", color: "var(--color-foreground)" }}>
                  🤖 {isTamil ? "Google Play" : "Google Play"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row"
          style={{ borderTop: "1px solid rgba(212,175,55,0.12)" }}
        >
          <p>{settings?.footer_copyright || "© 2026 Ungal Kalyanam Matrimony Pvt. Ltd. All rights reserved."}</p>
          <p className="flex items-center gap-1.5">
            {isTamil ? "அன்புடன் செய்யப்பட்டது" : "Made with"}
            <Heart className="inline h-3 w-3 fill-[#C2185B] text-[#C2185B]" />
            {isTamil ? "இந்தியாவில்" : "in India"}
          </p>
        </div>
      </div>
    </footer>
  );
}
