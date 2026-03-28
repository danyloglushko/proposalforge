import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <span className="text-2xl font-bold text-indigo-600">ProposalForge</span>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/login"
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          AI-Powered Proposal Tool
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          Win more clients.
          <br />
          <span className="text-indigo-600">In under 10 minutes.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Paste a job brief, get a tailored proposal in seconds. Share a branded
          client portal, collect a signature, and take a deposit — all in one
          flow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Start for free — no card required
          </Link>
          <Link
            href="/pricing"
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            See pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400">
          Free plan · 3 proposals/month · No credit card
        </p>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "⚡",
              title: "AI Proposal Generator",
              desc: "Paste a job description. Get a professional, tailored proposal in seconds — powered by Claude.",
            },
            {
              icon: "🔗",
              title: "Shareable Client Portal",
              desc: "Send a branded link. No login required. Clients can view, sign, and pay from one page.",
            },
            {
              icon: "💳",
              title: "Built-in Payments",
              desc: "Request a deposit or full payment from inside the proposal. Stripe-powered, instant payouts.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border p-6 shadow-sm space-y-3"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="text-center py-12 text-gray-400 text-sm">
        Join freelancers who stop losing deals to slow, generic proposals.
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-gray-400">
        © 2024 ProposalForge ·{" "}
        <Link href="/pricing" className="hover:underline">
          Pricing
        </Link>{" "}
        ·{" "}
        <Link href="/login" className="hover:underline">
          Sign in
        </Link>
      </footer>
    </div>
  );
}
