import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, onboardingDismissed: true },
    update: { onboardingDismissed: true },
  });

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
