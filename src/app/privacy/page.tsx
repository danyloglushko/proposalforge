import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ProposalForge",
  description: "ProposalForge Privacy Policy",
};

export default function PrivacyPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2025</p>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">

          <section>
            <p>
              ProposalForge (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, how we use it, and the
              choices you have. By using the Service, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h2>

            <h3 className="font-medium text-gray-800 mt-4 mb-1">Account Information</h3>
            <p>
              When you create an account, we collect your name and email address. If you sign in
              via Google OAuth, we receive your name, email, and profile picture from Google, but
              we do not store your Google password.
            </p>

            <h3 className="font-medium text-gray-800 mt-4 mb-1">Proposal Content</h3>
            <p>
              We store the proposals, job briefs, and template content you create using the Service.
              This content is yours — see our{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>{" "}
              for details on ownership.
            </p>

            <h3 className="font-medium text-gray-800 mt-4 mb-1">Payment Information</h3>
            <p>
              We do not collect or store your credit card or banking details. All payment processing
              is handled by{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Stripe
              </a>
              , which is PCI-DSS compliant. We receive limited transaction metadata from Stripe
              (e.g., subscription status, last 4 digits of card) to manage your account.
            </p>

            <h3 className="font-medium text-gray-800 mt-4 mb-1">Usage Data</h3>
            <p>
              We collect basic usage data such as pages visited, features used, and error logs.
              This helps us improve the product. We do not sell this data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate and deliver the Service (authentication, proposal storage, portal sharing)</li>
              <li>To process payments and manage your subscription via Stripe</li>
              <li>To send transactional emails (proposal activity, signature notifications, receipts)</li>
              <li>To improve and debug the platform</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not use your proposal content for advertising or sell it to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Third-Party Services</h2>
            <p>We use the following third-party services to operate ProposalForge:</p>

            <div className="mt-3 space-y-3">
              <div>
                <span className="font-medium text-gray-800">Stripe</span> — payment processing
                and subscription management. Your payment data is governed by{" "}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Stripe&apos;s Privacy Policy
                </a>.
              </div>
              <div>
                <span className="font-medium text-gray-800">Google OAuth</span> — optional
                sign-in method. Governed by{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Google&apos;s Privacy Policy
                </a>. We only request access to your name and email.
              </div>
              <div>
                <span className="font-medium text-gray-800">Anthropic (Claude AI)</span> — powers
                our AI proposal generation. When you generate a proposal, your job brief is sent
                to Anthropic&apos;s API to produce proposal text. Anthropic does not retain your data
                for training purposes under our enterprise API agreement. See{" "}
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Anthropic&apos;s Privacy Policy
                </a>.
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Data Retention</h2>
            <p>
              We retain your account and proposal data for as long as your account is active.
              If you close your account, we will delete your data within 30 days, except where
              we are required by law to retain it longer (e.g., financial records for tax purposes,
              which may be retained for up to 7 years).
            </p>
            <p className="mt-2">
              You can export your proposals at any time from your dashboard before closing your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Your Rights</h2>
            <p>Depending on where you are located, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> inaccurate information</li>
              <li><strong>Delete</strong> your account and associated data</li>
              <li><strong>Export</strong> your proposal data in a portable format</li>
              <li><strong>Object</strong> to or restrict certain processing activities</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:support@proposalforge.com" className="text-indigo-600 hover:underline">
                support@proposalforge.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies</h2>
            <p>
              We use session cookies to keep you logged in and functional cookies to remember
              your preferences. We do not use advertising or tracking cookies. You can disable
              cookies in your browser settings, but this may affect the functionality of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Security</h2>
            <p>
              We use industry-standard security practices including HTTPS encryption, hashed
              passwords, and access controls to protect your data. However, no system is
              completely secure — please use a strong, unique password and contact us immediately
              if you suspect a breach.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed at children under 16. We do not knowingly collect
              personal data from anyone under 16. If you believe we have done so accidentally,
              please contact us and we will promptly delete the data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes via email or an in-app notice. Continued use of the Service
              after the effective date constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact Us</h2>
            <p>
              For privacy questions, data requests, or concerns, please contact us at:
            </p>
            <div className="mt-2">
              <p>ProposalForge</p>
              <p>
                Email:{" "}
                <a href="mailto:support@proposalforge.com" className="text-indigo-600 hover:underline">
                  support@proposalforge.com
                </a>
              </p>
            </div>
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
