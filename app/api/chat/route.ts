import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type IncomingMessage = {
  role: "user" | "assistant";
  text: string;
};

function extractWebSources(response: any): Array<{ title?: string; url?: string }> {
  const out: Array<{ title?: string; url?: string }> = [];

  const items = response?.output ?? [];
  for (const item of items) {
    if (item?.type === "web_search_call") {
      const sources = item?.action?.sources ?? [];
      for (const s of sources) {
        out.push({ title: s?.title, url: s?.url });
      }
    }
  }

  const seen = new Set<string>();
  return out.filter((s) => {
    const key = (s.url ?? "") + "|" + (s.title ?? "");
    if (!key.trim()) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function requireUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };

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

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const { user, error } = await requireUser();
    if (error) return error;

    const body = await req.json().catch(() => null);

    const chatId = String(body?.chatId ?? "").trim();
    if (!chatId) {
      return Response.json({ error: "Missing chatId" }, { status: 400 });
    }

    const messages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const webSearchEnabled = Boolean(body?.webSearch);

    const cleaned = messages
      .map((m) => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        text: String(m?.text ?? "").trim(),
      }))
      .filter((m) => m.text.length > 0);

    const lastUser = cleaned.slice().reverse().find((m) => m.role === "user");
    const userText = String(lastUser?.text ?? "").trim();

    if (!userText) {
      return Response.json({ error: "Send a valid message." }, { status: 400 });
    }

    const chat = await prisma.chatSession.findFirst({
      where: { id: chatId, userId: user!.id },
      select: { id: true },
    });

    if (!chat) {
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: "user",
        text: userText,
      },
    });

    await prisma.chatSession.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    const history = await prisma.chatMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, text: true },
    });

    const systemPrompt =
      "You are Dianita. Answer in English, clear and friendly. If web search is active, use it when necessary and add the sources used too.";

    const input = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      })),
    ];

    const response = await client.responses.create({
      model: "gpt-5.2",
      input,
      tools: webSearchEnabled ? [{ type: "web_search" }] : [],
      include: webSearchEnabled ? ["web_search_call.action.sources"] : [],
      text: { verbosity: "low" },
    });

    const reply =
      String(response.output_text ?? "").trim() ||
      "I couldn't extract a text answer from the API.";

    const sources = webSearchEnabled ? extractWebSources(response) : [];

    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        text: reply,
        sources: sources.length ? sources : undefined,
      },
    });

    await prisma.chatSession.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    return Response.json({ reply, sources });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown Error at OpenAI API.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
