import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support — ProposalForge",
  description: "Get help with ProposalForge. Our support team is ready to assist.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </Link>
        <Link href="/login" className="text-sm text-gray-600 hover:text-indigo-600">
          Sign in
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help?</h1>
        <p className="text-lg text-gray-500 mb-12">
          We&apos;re a small team and we respond to every message. Typical response time is under
          24 hours on business days.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-left space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Email Support</h2>
            <p className="text-sm text-gray-500 mb-2">
              For account issues, billing questions, bug reports, or anything else — just email us.
            </p>
            <a
              href="mailto:support@proposalforge.com"
              className="inline-block text-indigo-600 font-medium hover:underline text-sm"
            >
              support@proposalforge.com
            </a>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">What to include in your message</h2>
            <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
              <li>Your account email address</li>
              <li>A brief description of the issue or question</li>
              <li>Any relevant proposal ID or error message</li>
              <li>Screenshots, if applicable</li>
            </ul>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Common topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              {[
                { topic: "Billing & subscriptions", detail: "Plan changes, invoices, cancellation" },
                { topic: "Account access", detail: "Login issues, password reset, Google sign-in" },
                { topic: "Proposal issues", detail: "AI generation, exports, client portal" },
                { topic: "Payment requests", detail: "Stripe setup, deposit collection" },
                { topic: "Feature requests", detail: "Ideas and feedback are always welcome" },
                { topic: "Data & privacy", detail: "Data export, deletion, GDPR requests" },
              ].map((item) => (
                <div key={item.topic} className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="font-medium text-gray-800">{item.topic}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          For legal or privacy inquiries, see our{" "}
          <Link href="/privacy" className="hover:underline text-gray-500">Privacy Policy</Link>{" "}
          or{" "}
          <Link href="/terms" className="hover:underline text-gray-500">Terms of Service</Link>.
        </p>
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
