import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

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

  return { user };
}

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const chats = await prisma.chatSession.findMany({
      where: { userId: user!.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    });

    return NextResponse.json({ chats });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to load chats", details: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const chat = await prisma.chatSession.create({
      data: { userId: user!.id, title: "New chat" },
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    });

    return NextResponse.json({ chat });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create chat", details: String(e?.message ?? e) }, { status: 500 });
  }
}
