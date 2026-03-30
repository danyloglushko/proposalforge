import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobBrief, clientName, templateCategory } = await req.json();

  if (!jobBrief || jobBrief.trim().length < 20) {
    return NextResponse.json(
      { error: "Job brief is too short (minimum 20 characters)" },
      { status: 400 }
    );
  }

  if (jobBrief.length > 10000) {
    return NextResponse.json(
      { error: "Job brief is too long (maximum 10,000 characters)" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, planTier: true },
  });

  const freelancerName = user?.name ?? "the freelancer";
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are a senior business consultant producing client proposals.
Return ONLY a valid JSON object — no markdown fences, no commentary, just raw JSON.
The JSON must exactly match this TypeScript interface:
{
  title: string;
  clientName: string;
  freelancerName: string;
  date: string;
  executiveSummary: string;
  problem: string;
  solution: string;
  scopeOfWork: Array<{ deliverable: string; description: string }>;
  timeline: Array<{ phase: string; duration: string; description: string }>;
  pricing: Array<{ item: string; qty: number; rate: number; total: number }>;
  currency: string;
  terms: string;
  nextSteps: string;
}
Rules:
- scopeOfWork: 4–6 items
- timeline: 3–5 phases
- pricing: 3–5 line items with realistic rates; qty * rate must equal total
- currency: use "USD" unless the brief implies otherwise
- All text fields must be substantive (no placeholder text)
- Write in a confident, consultative tone suitable for a McKinsey-style deliverable`;

  const userPrompt = `Produce a professional proposal JSON for the following engagement.

Freelancer: ${freelancerName}
Client: ${clientName}
Service category: ${templateCategory ?? "general"}
Date: ${today}
Job brief:
${jobBrief}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const proposal = JSON.parse(cleaned);

    return NextResponse.json({ proposal });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate proposal. Please try again." },
      { status: 500 }
    );
  }
}
