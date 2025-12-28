import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

async function requireUserEmail() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  return email;
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const email = await requireUserEmail();
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const title = body?.title;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chat = await prisma.chatSession.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.chatSession.update({
      where: { id: chat.id },
      data: { title },
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    });

    return NextResponse.json({ chat: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to rename chat", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
