import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

const defaultTheme = {
  appText: "#FFFFFF",
  panelBg: "#09090B",
  panelBorder: "rgba(255,255,255,0.15)",
  userBubbleBg: "#27272A",
  assistantBubbleBg: "#18181B",
  inputBg: "#18181B",
  inputBorder: "rgba(255,255,255,0.15)",

  userText: "#FFFFFF",
  assistantText: "#FFFFFF",
  inputText: "#FFFFFF",
  placeholderText: "rgba(255,255,255,0.55)",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: session.user?.name ?? undefined,
      image: session.user?.image ?? undefined,
    },
    create: {
      email,
      name: session.user?.name ?? null,
      image: session.user?.image ?? null,
    },
  });

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId: user.id },
  });

  if (!prefs) {
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        themeJson: defaultTheme,
      },
    });
    return NextResponse.json({ theme: defaultTheme });
  }

  return NextResponse.json({ theme: prefs.themeJson ?? defaultTheme });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const theme = body?.theme;

  if (!theme || typeof theme !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: session.user?.name ?? undefined,
      image: session.user?.image ?? undefined,
    },
    create: {
      email,
      name: session.user?.name ?? null,
      image: session.user?.image ?? null,
    },
  });

  const updated = await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: { themeJson: theme },
    create: { userId: user.id, themeJson: theme },
  });

  return NextResponse.json({ theme: updated.themeJson });
}
