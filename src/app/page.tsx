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

      {/* Trust bar */}
      <div className="bg-indigo-50 border-b border-indigo-100 py-3">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-700 font-medium">
          <span>2,000+ freelancers</span>
          <span className="text-indigo-300">·</span>
          <span>18,000+ proposals sent</span>
          <span className="text-indigo-300">·</span>
          <span>$4.2M in deals closed</span>
          <span className="text-indigo-300">·</span>
          <span>Avg &lt;10 min to create</span>
        </div>
      </div>

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
              className="bg-white rounded-2xl border p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 text-lg">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          From brief to signed in 3 steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Paste the job brief", desc: "Drop in the client's requirements. Takes 30 seconds." },
            { step: "02", title: "AI writes your proposal", desc: "Claude generates a tailored, professional proposal in seconds. Edit anything." },
            { step: "03", title: "Client signs & pays", desc: "Share a link. Client reviews, signs, and pays a deposit — no account required." },
          ].map((item) => (
            <div key={item.step} className="relative pl-10">
              <div className="absolute left-0 top-0 text-4xl font-black text-indigo-100 leading-none select-none">{item.step}</div>
              <div className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "I used to spend 2 hours on every proposal. Now it's 8 minutes. Won 3 clients this week.", name: "Alex M.", role: "Freelance Developer", initials: "AM" },
            { quote: "The client portal is what seals the deal. Clients love being able to sign right there.", name: "Sarah K.", role: "Brand Designer", initials: "SK" },
            { quote: "Collected a $2,400 deposit within an hour of sending. Never had that happen before.", name: "James R.", role: "Marketing Consultant", initials: "JR" },
          ].map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border p-6 shadow-sm space-y-3">
              <div className="text-yellow-400 text-sm">★★★★★</div>
              <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mid-page CTA */}
      <div className="bg-indigo-700 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-white">Ready to win your next client?</h2>
          <p className="text-indigo-200 text-lg">Start for free — 3 proposals/month on the free plan</p>
          <Link
            href="/login"
            className="inline-block bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition shadow-lg mt-2"
          >
            Get started free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-gray-400">
        © 2025 ProposalForge ·{" "}
        <Link href="/pricing" className="hover:underline">
          Pricing
        </Link>{" "}
        ·{" "}
        <Link href="/login" className="hover:underline">
          Sign in
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
