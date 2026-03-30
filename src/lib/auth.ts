import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { createStripeCustomer } from "@/lib/stripe";

const DEMO_PROPOSAL_CONTENT = {
  title: "Website Redesign for Acme Corp",
  clientName: "Acme Corp",
  freelancerName: "Your Name",
  date: new Date().toISOString().split("T")[0],
  executiveSummary:
    "This is a sample proposal auto-created to show you how ProposalForge works. Edit or delete it when you're ready to create your own.",
  problem:
    "Acme Corp's current website is outdated, lacks mobile responsiveness, and isn't converting visitors into customers.",
  solution:
    "A modern, mobile-first redesign with clear calls-to-action, improved user experience, and performance optimization.",
  scopeOfWork: [
    { deliverable: "Discovery & Strategy", description: "Stakeholder interviews, competitor research, and wireframes" },
    { deliverable: "UI/UX Design", description: "Full responsive design in Figma with two revision rounds" },
    { deliverable: "Development", description: "Next.js frontend with headless CMS integration and QA testing" },
  ],
  timeline: [
    { phase: "Discovery", duration: "1 week", description: "Kickoff, research, and wireframes" },
    { phase: "Design", duration: "2 weeks", description: "UI design and client review rounds" },
    { phase: "Development", duration: "3 weeks", description: "Build, integrations, and QA" },
  ],
  pricing: [
    { item: "Discovery & Strategy", qty: 1, rate: 1500, total: 1500 },
    { item: "UI/UX Design", qty: 1, rate: 3000, total: 3000 },
    { item: "Development", qty: 1, rate: 5500, total: 5500 },
  ],
  currency: "USD",
  terms:
    "50% deposit due upfront, 50% on project completion. All work remains property of the client upon final payment. Scope changes will be quoted separately.",
  nextSteps:
    "Review this sample proposal to see how your clients will experience yours. When ready, delete it and create your first real proposal!",
};

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
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.planTier = (user as { planTier?: string }).planTier ?? "FREE";
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
