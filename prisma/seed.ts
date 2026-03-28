import { PrismaClient, TemplateCategory } from "@prisma/client";

const prisma = new PrismaClient();

const SYSTEM_TEMPLATES: {
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
}[] = [
  {
    name: "Web Development Project",
    description: "Full-stack web application development",
    category: TemplateCategory.DEVELOPMENT,
    content: `# Web Development Proposal

## Introduction
Thank you for considering me for your web development project. Based on your brief, I understand you need [PROJECT_SUMMARY].

## What I'll Deliver
- Fully responsive, mobile-first web application
- Clean, maintainable codebase with documentation
- Database design and implementation
- Deployment to production with CI/CD pipeline
- 30 days post-launch support

## My Approach
- **Discovery:** Align on requirements, user flows, and tech stack
- **Design:** Wireframes and UI mockups for your approval
- **Development:** Iterative builds with weekly demos
- **Testing:** Cross-browser and device testing
- **Launch:** Deployment and handoff documentation

## Timeline
| Milestone | Duration |
|-----------|----------|
| Discovery & Design | 1 week |
| Core Development | 3 weeks |
| Testing & QA | 1 week |
| Launch & Handoff | 3 days |

## Investment
**Total: [PRICE]**

Optional 50% deposit to kick off the project.

## Why Me
I've delivered [X] web projects in the past [X] years, specializing in [STACK]. Recent clients include [CLIENT1] and [CLIENT2], both of whom saw measurable results within the first month.

## Next Steps
Ready to get started? Click **Accept Proposal** below, and I'll send over the contract and invoice for the deposit within 24 hours.`,
  },
  {
    name: "Brand Identity & Logo Design",
    description: "Logo design and brand identity package",
    category: TemplateCategory.DESIGN,
    content: `# Brand Identity Proposal

## Introduction
Great brands don't happen by accident. After reviewing your brief, I'm excited to help [CLIENT_NAME] build a visual identity that resonates with [TARGET_AUDIENCE].

## What I'll Deliver
- Primary logo (3 initial concepts → 2 revisions)
- Color palette with hex/RGB/CMYK codes
- Typography system (primary + secondary fonts)
- Brand guidelines PDF
- Final files: SVG, PNG, PDF (all sizes)

## My Approach
- **Research:** Competitor analysis and mood board
- **Concepts:** 3 distinct design directions presented
- **Refinement:** Chosen direction refined to perfection
- **Delivery:** Print and digital-ready files

## Timeline
**4 weeks total** from deposit receipt.

## Investment
**Total: [PRICE]**

50% deposit required to begin.

## Why Me
I've designed identities for [X]+ brands across [INDUSTRIES]. My work has been featured in [PUBLICATION] and I take pride in creating logos that stand the test of time.

## Next Steps
Accept below to lock in your start date. Slots fill up 2-3 weeks out.`,
  },
  {
    name: "Content Marketing Retainer",
    description: "Monthly content creation and strategy",
    category: TemplateCategory.MARKETING,
    content: `# Content Marketing Proposal

## Introduction
Consistent, high-quality content is the highest-ROI marketing channel for [CLIENT_NAME]'s stage and audience. Here's how I'll help you build it.

## What I'll Deliver (Monthly)
- 4 long-form blog posts (1,500–2,500 words, SEO-optimized)
- 8 social media posts with captions
- 1 email newsletter
- Monthly performance report

## My Approach
- **Month 1:** Content audit, keyword research, editorial calendar
- **Ongoing:** Consistent publishing, A/B testing headlines, iterating on what works
- **Reporting:** Monthly review of traffic, engagement, and leads generated

## Timeline
Onboarding in week 1; first content live by end of week 2.

## Investment
**[PRICE]/month** — 3-month minimum commitment
Cancel anytime after 3 months with 30-day notice.

## Why Me
My content has generated [X]M+ organic visits and [X]k+ email subscribers for clients in [INDUSTRIES]. I write in your brand voice, not mine.

## Next Steps
Accept this proposal to begin your content engine. I'll send a brand questionnaire within 24 hours of signing.`,
  },
  {
    name: "SEO Audit & Strategy",
    description: "Technical SEO audit and 90-day roadmap",
    category: TemplateCategory.SEO,
    content: `# SEO Audit & Strategy Proposal

## Introduction
Based on a preliminary look at [CLIENT_NAME]'s site, I've identified significant organic growth opportunities. Here's what a proper audit and strategy engagement looks like.

## What I'll Deliver
- Full technical SEO audit (crawl errors, Core Web Vitals, indexation)
- Keyword gap analysis vs. top 3 competitors
- Content opportunity report (50+ topics ranked by potential)
- 90-day prioritized action plan
- 1-hour strategy call to walk through findings

## My Approach
- **Week 1–2:** Technical audit using Screaming Frog, Ahrefs, and Google Search Console
- **Week 3:** Competitor and keyword analysis
- **Week 4:** Deliverable compilation and presentation

## Timeline
**4 weeks** from project kickoff.

## Investment
**[PRICE]** (one-time)

Optional: Monthly retainer for ongoing implementation at [RETAINER_PRICE]/month.

## Why Me
I've completed 200+ SEO audits. Past clients have seen average organic traffic increases of [X]% within 6 months of implementing my recommendations.

## Next Steps
Accept below and I'll schedule our kickoff call within 48 hours.`,
  },
  {
    name: "Business Strategy Consulting",
    description: "Strategic consulting and advisory engagement",
    category: TemplateCategory.CONSULTING,
    content: `# Strategy Consulting Proposal

## Introduction
Thank you for the opportunity to support [CLIENT_NAME]. Based on our conversation, you're facing [CORE_CHALLENGE] — a problem I've helped [X] similar companies navigate.

## What I'll Deliver
- Current-state assessment and opportunity mapping
- 3 strategic options with pros/cons analysis
- Recommended 90-day execution roadmap
- KPI framework and success metrics
- Weekly 1:1 advisory calls for [DURATION]

## My Approach
- **Weeks 1–2:** Discovery — stakeholder interviews, data review, competitive landscape
- **Week 3:** Analysis and option development
- **Week 4:** Presentation and roadmap finalization
- **Ongoing:** Weekly check-ins and ad-hoc support

## Timeline
**4-week intensive + [X] months advisory** as needed.

## Investment
**[PRICE]** for the 4-week engagement
Optional advisory retainer: [RETAINER_PRICE]/month

## Why Me
I've advised [X]+ companies from [STAGE] to [OUTCOME]. My work directly contributed to [SPECIFIC_RESULT] for [COMPANY].

## Next Steps
Let's move forward. Accept below and I'll send calendar invites for our kickoff session.`,
  },
];

async function main() {
  console.log("Seeding system templates...");

  for (const template of SYSTEM_TEMPLATES) {
    await prisma.template.upsert({
      where: {
        // Use name+userId as logical unique key for system templates
        // Since there's no unique constraint, we check by name and null userId
        id: `system-${template.category.toLowerCase()}-${template.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {
        content: template.content,
        description: template.description,
      },
      create: {
        id: `system-${template.category.toLowerCase()}-${template.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: template.name,
        description: template.description,
        category: template.category,
        content: template.content,
        isPublic: true,
        userId: null,
      },
    });
    console.log(`  ✓ ${template.name}`);
  }

  console.log(`Seeded ${SYSTEM_TEMPLATES.length} templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
