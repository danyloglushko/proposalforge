"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const NEW_PRO_FEATURES = [
  { icon: "📧", text: "Email alerts when clients view, sign & pay" },
  { icon: "📊", text: "Proposal analytics — see who viewed and when" },
  { icon: "🎨", text: "Custom logo on client portal" },
  { icon: "✨", text: "Remove ProposalForge branding" },
];

const PLANS = [
  {
    tier: "FREE",
    name: "Free",
    price: 0,
    tagline: "Try it out",
    features: [
      "3 proposals/month",
      "AI generation",
      "Client portal",
      "E-signature",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    tier: "SOLO",
    name: "Solo",
    price: 9,
    tagline: "For active freelancers",
    features: [
      "Unlimited proposals",
      "AI generation",
      "Client portal",
      "E-signature",
      "1 user",
    ],
    cta: "Start Solo",
    highlighted: false,
  },
  {
    tier: "PRO",
    name: "Pro",
    price: 29,
    tagline: "For serious earners",
    features: [
      "Everything in Solo",
      "Stripe payment requests",
      { text: "Email alerts when clients view, sign & pay", isNew: true },
      { text: "Proposal analytics — see who viewed and when", isNew: true },
      { text: "Custom logo on client portal", isNew: true },
      { text: "Remove ProposalForge branding", isNew: true },
      "Priority support",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    tier: "AGENCY",
    name: "Agency",
    price: 49,
    tagline: "For small agencies",
    features: [
      "Everything in Pro",
      "5 seats",
      "White-label portal",
      "Dedicated support",
    ],
    cta: "Start Agency",
    highlighted: false,
  },
];

type Feature = string | { text: string; isNew: boolean };

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  async function handleUpgrade(tier: string) {
    if (tier === "FREE") return;
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setLoading(tier);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </Link>
        {session ? (
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">
            Dashboard →
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign in
          </Link>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-gray-500 mt-3">
            Start free. Upgrade when you need more.
          </p>
          <p className="text-sm text-indigo-600 mt-1">14-day free trial on paid plans</p>
          <div className="flex items-center justify-center gap-3 text-sm mt-4">
            <span className={!annual ? "text-gray-900 font-medium" : "text-gray-400"}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-11 h-6 rounded-full transition-colors ${annual ? "bg-indigo-600" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className={annual ? "text-gray-900 font-medium" : "text-gray-400"}>
              Annual <span className="text-green-600 font-semibold">Save 17%</span>
            </span>
          </div>
        </div>

        {/* New Pro features callout */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              New in Pro
            </span>
            <p className="text-indigo-100 text-sm">Just launched — 4 powerful features now included</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {NEW_PRO_FEATURES.map((f) => (
              <div key={f.text} className="bg-white/10 rounded-xl p-4 space-y-2">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-white text-sm font-medium leading-snug">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-2xl border p-6 space-y-5 ${
                plan.highlighted
                  ? "border-indigo-500 shadow-lg shadow-indigo-100 ring-1 ring-indigo-500 bg-indigo-50/30"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <div className="text-center -mx-6 -mt-6 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide py-1.5 rounded-t-2xl">
                  Most popular
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500">{plan.tagline}</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price === 0 ? "Free" : annual ? `$${Math.round(plan.price * 10 / 12)}` : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-400 text-sm">/month{annual ? ", billed annually" : ""}</span>
                )}
              </div>
              <ul className="space-y-2">
                {(plan.features as Feature[]).map((f) => {
                  const isObj = typeof f === "object";
                  const text = isObj ? f.text : f;
                  const isNew = isObj && f.isNew;
                  return (
                    <li key={text} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      <span className="flex-1">{text}</span>
                      {isNew && (
                        <span className="shrink-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.tier)}
                disabled={loading === plan.tier || plan.tier === "FREE"}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : plan.tier === "FREE"
                    ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    : "border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                } disabled:opacity-50`}
              >
                {loading === plan.tier
                  ? "Redirecting..."
                  : plan.tier === "FREE"
                  ? session
                    ? "Current plan"
                    : "Get started"
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-400">
          All plans include SSL, uptime SLA, and standard support.
          Cancel anytime. Annual plans save 2 months.
        </p>
      </div>
    </div>
  );
}
