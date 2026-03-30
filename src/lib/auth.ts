import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { createStripeCustomer } from "@/lib/stripe";

const DEMO_PROPOSAL_CONTENT = `# Website Redesign for Acme Corp

**Prepared for:** Acme Corp
**Date:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

> This is a sample proposal auto-created to show you how ProposalForge works. Edit or delete it when you're ready to create your own.

---

## Executive Summary

Acme Corp's current website is outdated, lacks mobile responsiveness, and isn't converting visitors into customers. This proposal outlines a modern, mobile-first redesign with clear calls-to-action, improved user experience, and performance optimization.

## The Problem

Acme Corp's current website is holding the business back:
- Not mobile-responsive (60%+ of traffic is mobile)
- Slow page load times hurt SEO rankings
- Unclear messaging and calls-to-action
- Outdated design reduces credibility with prospects

## Our Solution

A full website redesign using modern technologies and design principles:
- Mobile-first, responsive design across all devices
- Performance optimization for fast load times
- Clear messaging hierarchy and compelling CTAs
- Modern visual identity aligned with your brand

## Scope of Work

| Deliverable | Description |
|---|---|
| Discovery & Strategy | Stakeholder interviews, competitor research, and wireframes |
| UI/UX Design | Full responsive design in Figma with two revision rounds |
| Development | Next.js frontend with CMS integration and QA testing |

## Timeline

| Phase | Duration | Details |
|---|---|---|
| Discovery | 1 week | Kickoff, research, and wireframes |
| Design | 2 weeks | UI design and client review rounds |
| Development | 3 weeks | Build, integrations, and QA |

## Investment

| Item | Qty | Rate | Total |
|---|---|---|---|
| Discovery & Strategy | 1 | $1,500 | $1,500 |
| UI/UX Design | 1 | $3,000 | $3,000 |
| Development | 1 | $5,500 | $5,500 |

**Grand Total: $10,000 USD**

## Terms

50% deposit due upfront, 50% on project completion. All work remains property of the client upon final payment. Scope changes will be quoted separately.

## Next Steps

Review this sample proposal to see how your clients will experience yours. When ready, delete it and create your first real proposal!
`;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST ?? "smtp.gmail.com",
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM ?? "noreply@proposalforge.com",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Always fetch planTier fresh from DB so upgrades are reflected immediately
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { planTier: true },
        });
        session.user.planTier = dbUser?.planTier ?? "FREE";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Provision Stripe customer and create demo proposal on first sign-up
      await Promise.all([
        user.email
          ? createStripeCustomer(user.email, user.name ?? undefined).then((customer) =>
              prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customer.id },
              })
            )
          : Promise.resolve(),
        prisma.proposal.create({
          data: {
            userId: user.id,
            title: "Sample: Website Redesign for Acme Corp",
            clientName: "Acme Corp",
            jobBrief: "Demo proposal showing how ProposalForge works. Delete when ready.",
            content: DEMO_PROPOSAL_CONTENT,
            totalAmount: 10000,
            currency: "USD",
            status: "DRAFT",
          },
        }),
      ]);
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
};
