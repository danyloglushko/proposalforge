import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple in-memory rate limiter: max 5 generations per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before generating again." },
      { status: 429 }
    );
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

  const systemPrompt = `You are ProposalForge, an expert at writing winning freelance proposals.
Your proposals are professional, concise, and conversion-focused.
Always write in a confident, consultative tone.
Format output as clean Markdown suitable for rendering.`;

  const userPrompt = `Write a professional freelance proposal based on the following job brief.

**Freelancer name:** ${user?.name ?? "the freelancer"}
**Client name:** ${clientName}
**Service category:** ${templateCategory ?? "general"}
**Job brief:**
${jobBrief}

Write a complete proposal with these sections:
1. **Introduction** — Brief personalized opener showing understanding of their needs
2. **What I'll Deliver** — Clear scope/deliverables list
3. **My Approach** — How you'll tackle the project (3-5 bullet points)
4. **Timeline** — Realistic delivery milestones
5. **Investment** — Placeholder for pricing (use [PRICE] for amounts)
6. **Why Me** — 2-3 sentences on relevant experience/results
7. **Next Steps** — Clear CTA

Keep it under 600 words. Be specific, not generic.`;

  // Stream the response
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  // Return as SSE stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
