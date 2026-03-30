import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  PAID: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-red-100 text-red-700",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { upgraded } = await searchParams;

  const [user, proposals, statsAgg] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        planTier: true,
        proposalsThisMonth: true,
        stripeCurrentPeriodEnd: true,
        profile: {
          select: { onboardingDismissed: true },
        },
      },
    }),
    prisma.proposal.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true,
        totalAmount: true,
        currency: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        publicToken: true,
        sentAt: true,
        signature: { select: { id: true } },
      },
    }),
    prisma.proposal.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
  ]);

  type StatGroup = { status: string; _count: { id: number }; _sum: { totalAmount: number | null } };
  const sent = statsAgg.filter((g: StatGroup) => g.status !== "DRAFT").reduce((s: number, g: StatGroup) => s + g._count.id, 0);
  const accepted = statsAgg.filter((g: StatGroup) => ["ACCEPTED", "PAID"].includes(g.status)).reduce((s: number, g: StatGroup) => s + g._count.id, 0);
  const collected = statsAgg.filter((g: StatGroup) => g.status === "PAID").reduce((s: number, g: StatGroup) => s + (g._sum.totalAmount ?? 0), 0);
  const pending = statsAgg.filter((g: StatGroup) => ["SENT", "VIEWED"].includes(g.status)).reduce((s: number, g: StatGroup) => s + (g._sum.totalAmount ?? 0), 0);
  const acceptanceRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

  const stats = { sent, accepted, collected, pending, acceptanceRate };

  // Onboarding checklist state
  const onboardingDismissed = user?.profile?.onboardingDismissed ?? false;
  const hasSentProposal = proposals.some((p) => p.sentAt !== null);
  const hasSignature = proposals.some((p) => p.signature !== null);
  const hasCreatedProposal = proposals.length > 0;
  const allDone = hasCreatedProposal && hasSentProposal && hasSignature;
  const showOnboarding = !onboardingDismissed && !allDone;

  const isPro = user?.planTier === "PRO" || user?.planTier === "AGENCY";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
          ProposalForge
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Settings
          </Link>
          <span className="text-sm text-gray-500">
            {session.user.name ?? session.user.email}
          </span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {upgraded && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            Plan upgraded successfully! Welcome to {user?.planTier}.
          </div>
        )}

        {/* Onboarding checklist */}
        {showOnboarding && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Get started with ProposalForge</h2>
                <p className="text-sm text-gray-500 mt-0.5">Complete these steps to start winning clients.</p>
              </div>
              <form action="/api/onboarding/dismiss" method="POST">
                <button
                  type="submit"
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  Dismiss
                </button>
              </form>
            </div>
            <div className="space-y-3">
              {[
                { done: hasCreatedProposal, label: "Create your first proposal", href: hasCreatedProposal ? undefined : "/dashboard/proposals/new" },
                { done: hasSentProposal, label: "Send it to a client", href: undefined },
                { done: hasSignature, label: "Get your first signature", href: undefined },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-500" : "border-2 border-gray-300"}`}>
                    {item.done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {item.href ? (
                    <Link href={item.href} className="text-sm text-indigo-600 hover:underline">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`text-sm ${item.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Sent", value: stats.sent, icon: "📤", color: "text-blue-500" },
            { label: "Accepted", value: stats.accepted, icon: "✅", color: "text-green-500" },
            { label: "Acceptance Rate", value: `${stats.acceptanceRate}%`, icon: "📈", color: "text-indigo-500" },
            {
              label: "Collected",
              value: new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(stats.collected),
              icon: "💰",
              color: "text-emerald-500",
            },
            {
              label: "Pending",
              value: new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(stats.pending),
              icon: "⏳",
              color: "text-amber-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{stat.label}</p>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Plan badge */}
        <div className="bg-white rounded-xl border shadow-sm px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              user?.planTier === "FREE"
                ? "bg-gray-100 text-gray-600"
                : user?.planTier === "PRO" || user?.planTier === "AGENCY"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {user?.planTier ?? "FREE"}
            </span>
            {user?.planTier === "FREE" ? (
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    {user.proposalsThisMonth} / 3 proposals used this month
                  </p>
                  <div className="mt-1 w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        user.proposalsThisMonth >= 3 ? "bg-red-400" : "bg-indigo-500"
                      }`}
                      style={{ width: `${Math.min(100, (user.proposalsThisMonth / 3) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Unlimited proposals</p>
            )}
          </div>
          {user?.planTier === "FREE" && (
            <div className="text-right">
              <Link
                href="/pricing"
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium inline-block"
              >
                Upgrade →
              </Link>
              <p className="text-xs text-indigo-500 mt-1">
                Use code <span className="font-mono font-semibold">LAUNCH50</span> — 50% off forever
              </p>
            </div>
          )}
        </div>

        {/* Proposals table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Proposals</h2>
            <Link
              href="/dashboard/proposals/new"
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + New Proposal
            </Link>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl">📋</div>
              <div>
                <p className="text-gray-700 font-medium">No proposals yet</p>
                <p className="text-gray-400 text-sm mt-1">Create your first proposal in under 2 minutes</p>
              </div>
              <Link
                href="/dashboard/proposals/new"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Create your first proposal →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Proposal</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  {isPro && <th className="px-6 py-3 text-center">Views</th>}
                  {!isPro && <th className="px-6 py-3 text-center">Views</th>}
                  <th className="px-6 py-3 text-left">Updated</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link
                        href={`/dashboard/proposals/${p.id}`}
                        className="hover:text-indigo-600"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{p.clientName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {p.totalAmount
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: p.currency,
                          }).format(p.totalAmount)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.viewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          👁 {p.viewCount}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/p/${p.publicToken}`}
                        target="_blank"
                        className="text-indigo-500 hover:text-indigo-700 text-xs"
                      >
                        Client view ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
