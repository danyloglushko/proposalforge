"use client";

import type { ProposalStructure } from "@/types/proposal";

interface Props {
  proposal: ProposalStructure;
}

export default function ProposalDocument({ proposal }: Props) {
  const grandTotal = proposal.pricing?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: proposal.currency ?? "USD",
    }).format(n);

  return (
    <div className="proposal-document font-sans text-gray-900">
      {/* Cover */}
      <div className="cover-section bg-gradient-to-br from-indigo-900 to-indigo-700 text-white rounded-xl p-10 mb-8">
        <p className="text-indigo-300 text-xs uppercase tracking-widest mb-6 font-medium">
          Proposal
        </p>
        <h1 className="text-3xl font-bold mb-8 leading-snug">{proposal.title}</h1>
        <div className="border-t border-indigo-600 pt-6 flex flex-col gap-1">
          <p className="text-sm text-indigo-200">
            <span className="text-indigo-400 uppercase tracking-wide text-xs mr-2">
              Prepared for
            </span>
            {proposal.clientName}
          </p>
          <p className="text-sm text-indigo-200">
            <span className="text-indigo-400 uppercase tracking-wide text-xs mr-2">By</span>
            {proposal.freelancerName}
          </p>
          <p className="text-sm text-indigo-200">
            <span className="text-indigo-400 uppercase tracking-wide text-xs mr-2">Date</span>
            {proposal.date}
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      {proposal.executiveSummary && (
        <Section title="Executive Summary">
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="text-gray-700 leading-relaxed">{proposal.executiveSummary}</p>
          </div>
        </Section>
      )}

      {/* Problem */}
      {proposal.problem && (
        <Section title="Problem / Opportunity">
          <p className="text-gray-700 leading-relaxed">{proposal.problem}</p>
        </Section>
      )}

      {/* Solution */}
      {proposal.solution && (
        <Section title="Proposed Solution">
          <p className="text-gray-700 leading-relaxed">{proposal.solution}</p>
        </Section>
      )}

      {/* Scope of Work */}
      {proposal.scopeOfWork?.length > 0 && (
        <Section title="Scope of Work">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="text-left px-4 py-2 font-semibold text-indigo-900 border border-gray-200 w-1/3">
                  Deliverable
                </th>
                <th className="text-left px-4 py-2 font-semibold text-indigo-900 border border-gray-200">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {proposal.scopeOfWork.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 border border-gray-200 font-medium align-top">
                    {row.deliverable}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600 align-top">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Timeline */}
      {proposal.timeline?.length > 0 && (
        <Section title="Implementation Timeline">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="text-left px-4 py-2 font-semibold text-indigo-900 border border-gray-200">
                  Phase
                </th>
                <th className="text-left px-4 py-2 font-semibold text-indigo-900 border border-gray-200 w-32">
                  Duration
                </th>
                <th className="text-left px-4 py-2 font-semibold text-indigo-900 border border-gray-200">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {proposal.timeline.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 border border-gray-200 font-medium align-top">
                    {row.phase}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600 align-top whitespace-nowrap">
                    {row.duration}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-gray-600 align-top">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Pricing */}
      {proposal.pricing?.length > 0 && (
        <Section title="Investment">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="text-left px-4 py-2 font-semibold text-indigo-900 border border-gray-200">
                  Item
                </th>
                <th className="text-right px-4 py-2 font-semibold text-indigo-900 border border-gray-200 w-16">
                  Qty
                </th>
                <th className="text-right px-4 py-2 font-semibold text-indigo-900 border border-gray-200 w-28">
                  Rate
                </th>
                <th className="text-right px-4 py-2 font-semibold text-indigo-900 border border-gray-200 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {proposal.pricing.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-2 border border-gray-200 align-top">{row.item}</td>
                  <td className="px-4 py-2 border border-gray-200 text-right align-top">
                    {row.qty}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-right align-top">
                    {fmt(row.rate)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-right align-top">
                    {fmt(row.total)}
                  </td>
                </tr>
              ))}
              <tr className="bg-indigo-50 font-bold">
                <td
                  colSpan={3}
                  className="px-4 py-2 border border-gray-200 text-right text-indigo-900"
                >
                  Grand Total
                </td>
                <td className="px-4 py-2 border border-gray-200 text-right text-indigo-900">
                  {fmt(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      )}

      {/* Terms */}
      {proposal.terms && (
        <Section title="Terms and Assumptions">
          <p className="text-gray-700 leading-relaxed">{proposal.terms}</p>
        </Section>
      )}

      {/* Next Steps */}
      {proposal.nextSteps && (
        <Section title="Next Steps">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
            <p className="text-indigo-900 leading-relaxed">{proposal.nextSteps}</p>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-3 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
