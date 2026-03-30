import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ProposalForge",
  description: "ProposalForge Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto border-b">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </Link>
        <Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600">
          Sign in
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-gray">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2025</p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using ProposalForge (&ldquo;the Service&rdquo;), you agree to these
              Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service. These Terms
              form a binding agreement between you and ProposalForge (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>
              ProposalForge is a web-based SaaS platform that helps freelancers and small agencies
              create, share, and close client proposals. Core features include AI-assisted proposal
              generation, a shareable client portal, e-signature collection, and payment request
              processing via Stripe.
            </p>
            <p className="mt-2">
              We reserve the right to modify, suspend, or discontinue any part of the Service at
              any time with reasonable notice. We will not be liable to you or any third party for
              any such changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Your Account</h2>
            <p>
              You must provide accurate information when creating an account. You are responsible
              for maintaining the security of your account credentials and for all activity that
              occurs under your account. Notify us immediately at{" "}
              <a href="mailto:support@proposalforge.com" className="text-indigo-600 hover:underline">
                support@proposalforge.com
              </a>{" "}
              if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. User Responsibilities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Submit false, misleading, or fraudulent proposals or content.</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the platform or its AI features.</li>
              <li>Share your account with others outside of your purchased seat allocation.</li>
              <li>Use the Service to harm, defraud, or deceive your clients.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Payments & Subscriptions</h2>
            <p>
              Paid subscriptions are billed monthly or annually in advance. Payments are processed
              securely by{" "}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Stripe
              </a>
              . We do not store your credit card information. By subscribing, you authorize us to
              charge your payment method on a recurring basis until you cancel.
            </p>
            <p className="mt-2">
              You may cancel your subscription at any time from your account settings. Cancellation
              takes effect at the end of the current billing period. We do not issue refunds for
              partial periods, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Your Content</h2>
            <p>
              You retain full ownership of any proposal content, client information, or materials
              you create using the Service. By using ProposalForge, you grant us a limited,
              non-exclusive license to store and process your content solely to operate and improve
              the Service. We will not sell your content or use it for advertising.
            </p>
            <p className="mt-2">
              You are solely responsible for the accuracy and legality of the proposals and content
              you generate. We are not liable for any disputes between you and your clients arising
              from proposal content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Intellectual Property</h2>
            <p>
              The ProposalForge platform, logo, design, and underlying software are owned by us
              and protected by applicable intellectual property laws. You may not copy, reproduce,
              or create derivative works from our platform without our written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ProposalForge shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages — including lost
              profits, lost data, or loss of business — arising from your use of or inability to
              use the Service. Our total liability to you for any claim shall not exceed the amount
              you paid us in the 12 months preceding the claim.
            </p>
            <p className="mt-2">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Termination</h2>
            <p>
              Either party may terminate the agreement at any time. We may suspend or terminate
              your account immediately if you violate these Terms, engage in fraudulent activity,
              or pose a security risk. Upon termination, your right to access the Service ceases.
              You may export your proposal data before cancellation; after 30 days following
              account closure, we may delete your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the State
              of Delaware, United States, without regard to conflict-of-law principles. Any
              disputes shall be resolved in the courts of Delaware, and you consent to
              jurisdiction there.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. If we make material changes, we will
              notify you by email or through the Service at least 14 days before the changes take
              effect. Continued use of the Service after the effective date constitutes acceptance
              of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:support@proposalforge.com" className="text-indigo-600 hover:underline">
                support@proposalforge.com
              </a>
              .
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t py-8 text-center text-xs text-gray-400">
        © 2025 ProposalForge ·{" "}
        <Link href="/terms" className="hover:underline">Terms</Link>{" "}·{" "}
        <Link href="/privacy" className="hover:underline">Privacy</Link>{" "}·{" "}
        <Link href="/contact" className="hover:underline">Contact</Link>{" "}·{" "}
        <Link href="/pricing" className="hover:underline">Pricing</Link>
      </footer>
    </div>
  );
}
