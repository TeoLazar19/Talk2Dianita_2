import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chat = await prisma.chatSession.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const messages = await prisma.chatMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, text: true, sources: true, createdAt: true },
    });

    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to load messages", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
