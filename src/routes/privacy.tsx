import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const PRIVACY_CONTENT = {
  title: "Privacy Policy",
  body: `<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create or modify your account, fill out your profile, send messages, or contact support.</p>

<h2>How We Use Your Information</h2>
<p>We use your information to provide, maintain, and improve our services, to process matches and communications, and to send you technical notices and support messages.</p>

<h2>Payment Information</h2>
<p>All payments on Ungalkalyanam are processed through Razorpay, a PCI-DSS compliant payment gateway. We do not store, process, or have access to your credit/debit card numbers, CVV, or bank account details. All sensitive payment data is encrypted and handled directly by Razorpay in compliance with PCI-DSS standards.</p>

<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>

<h2>Your Rights</h2>
<p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.</p>

<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at ungalkalyanam.in@gmail.com.</p>`,
};

const TERMS_CONTENT = {
  title: "Terms of Service",
  body: `<h2>Acceptance of Terms</h2>
<p>By using Ungalkalyanam, you agree to these terms. If you do not agree, please do not use our service.</p>

<h2>User Responsibilities</h2>
<p>You agree to provide accurate information, maintain confidentiality of your account, and comply with all applicable laws.</p>

<h2>Prohibited Conduct</h2>
<p>You may not use the service for any unlawful purpose, impersonate others, or harvest data without permission.</p>

<h2>Limitation of Liability</h2>
<p>Ungalkalyanam is not liable for any damages arising from your use of the service.</p>

<h2>Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance.</p>`,
};

const REFUND_CONTENT = {
  title: "Refund & Cancellation Policy",
  body: `<h2>No Refund Policy</h2>
<p>All payments made to Ungalkalyanam for membership plans, contact unlocks, and any other services are <strong>non-refundable</strong>.</p>

<h2>Cancellation</h2>
<p>Once a payment is successfully processed, the service is activated immediately. Therefore, cancellations and refund requests cannot be accommodated after the transaction is completed.</p>

<h2>Chargebacks</h2>
<p>Initiating a chargeback or payment dispute with your bank or payment provider (including Razorpay) will result in an immediate suspension of your account and all associated services. Your account may be permanently disabled.</p>

<h2>Disputes</h2>
<p>If you have any questions or concerns regarding a payment, please contact our support team before initiating any dispute. We are committed to resolving any legitimate concerns promptly.</p>

<h2>Contact Us</h2>
<p>Email: ungalkalyanam.in@gmail.com<br/>Phone: 9597558432</p>`,
};

const FALLBACK: Record<string, { title: string; body: string }> = {
  "privacy-policy": PRIVACY_CONTENT,
  "terms-of-service": TERMS_CONTENT,
  "terms-and-conditions": TERMS_CONTENT,
  "refund-policy": REFUND_CONTENT,
};

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Ungalkalyanam" }] }),
  component: () => <Legal slug="privacy-policy" />,
});

export function Legal({ slug }: { slug: string }) {
  const { data: page, isLoading, isError } = useQuery<any>({
    queryKey: ["page", slug],
    queryFn: () => api.get(`/pages/${slug}`),
    retry: false,
    staleTime: 0,
  });

  const resolvedPage = page || FALLBACK[slug];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resolvedPage ? (
          <>
            <h1 className="font-display text-4xl font-bold">{resolvedPage.title}</h1>
            <div 
              className="prose prose-neutral mt-8 max-w-none text-foreground/90"
              dangerouslySetInnerHTML={{ __html: resolvedPage.body }}
            />
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p>The requested page could not be found.</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
