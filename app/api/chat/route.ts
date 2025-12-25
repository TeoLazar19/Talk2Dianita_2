import OpenAI from "openai";

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

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { reply: "Lipsește OPENAI_API_KEY în .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const messages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const webSearchEnabled = Boolean(body?.webSearch);

    const cleaned = messages
      .map((m) => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        text: String(m?.text ?? "").trim(),
      }))
      .filter((m) => m.text.length > 0)
      .slice(-20);

    if (cleaned.length === 0) {
      return Response.json({ reply: "Trimite un mesaj valid." }, { status: 400 });
    }

    const systemPrompt =
      "Ești Dianita. Răspunzi în română, clar și friendly. Dacă web search e activ, folosește l doar când e nevoie și pune surse.";

    const input = [
      { role: "system" as const, content: systemPrompt },
      ...cleaned.map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
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
      "Nu am putut extrage un răspuns text din API.";

    const sources = webSearchEnabled ? extractWebSources(response) : [];

    return Response.json({ reply, sources });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Eroare necunoscută la OpenAI API.";
    return Response.json({ reply: msg }, { status: 500 });
  }
}
