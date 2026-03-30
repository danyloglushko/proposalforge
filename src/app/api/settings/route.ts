import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile, user] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { planTier: true } }),
  ]);

  return NextResponse.json({ ...(profile ?? {}), planTier: user?.planTier ?? "FREE" });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    companyName,
    freelancerName,
    contactEmail,
    logoUrl,
    defaultCurrency,
    emailNotifications,
    hidePoweredBy,
    onboardingDismissed,
  } = await req.json();

  // Only Pro/Agency users can hide the "Powered by ProposalForge" branding
  const planUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { planTier: true },
  });
  const isPro = planUser?.planTier === "PRO" || planUser?.planTier === "AGENCY";
  const resolvedHidePoweredBy = isPro ? hidePoweredBy : false;

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      companyName,
      freelancerName,
      contactEmail,
      logoUrl,
      defaultCurrency: defaultCurrency ?? "USD",
      emailNotifications: emailNotifications ?? true,
      hidePoweredBy: resolvedHidePoweredBy ?? false,
      onboardingDismissed: onboardingDismissed ?? false,
    },
    update: {
      ...(companyName !== undefined && { companyName }),
      ...(freelancerName !== undefined && { freelancerName }),
      ...(contactEmail !== undefined && { contactEmail }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(defaultCurrency !== undefined && { defaultCurrency }),
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(hidePoweredBy !== undefined && { hidePoweredBy: resolvedHidePoweredBy }),
      ...(onboardingDismissed !== undefined && { onboardingDismissed }),
    },
  });

  return NextResponse.json(profile);
}
