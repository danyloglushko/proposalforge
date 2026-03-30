import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? {});
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyName, freelancerName, contactEmail, logoUrl, defaultCurrency } =
    await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      companyName,
      freelancerName,
      contactEmail,
      logoUrl,
      defaultCurrency: defaultCurrency ?? "USD",
    },
    update: {
      companyName,
      freelancerName,
      contactEmail,
      logoUrl,
      defaultCurrency: defaultCurrency ?? "USD",
    },
  });

  return NextResponse.json(profile);
}
