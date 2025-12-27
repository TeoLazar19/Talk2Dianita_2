"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

type Source = {
  title?: string;
  url?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
};

export default function ChatPage() {
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isAuthed = useMemo(() => Boolean(session?.user?.email), [session?.user?.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    if (isLoading) return;

    const nextMessages: Message[] = [...messages, { role: "user", text }];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webSearch,
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply ?? "Nu am primit răspuns de la server.",
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Eroare la request. Uită te în terminal." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  function logout() {
    signOut({ callbackUrl: "/login" });
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950/90 p-8 shadow-2xl">
          <div className="text-lg font-semibold text-white">Talk2Dianita</div>
          <div className="mt-2 text-sm text-white/70">Se încarcă sesiunea...</div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950/90 p-8 shadow-2xl">
          <div className="text-lg font-semibold text-white">Talk2Dianita</div>
          <div className="mt-2 text-sm text-white/70">Nu ești logat. Mergi la login.</div>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white text-black px-4 py-3 text-sm font-semibold hover:bg-white/90 transition"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-white/15 bg-zinc-950/90 shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="min-w-0">
              <div className="text-base font-semibold text-white">Talk2Dianita</div>
              <div className="mt-0.5 text-xs text-white/60 truncate">
                Logat ca {session?.user?.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                  className="accent-white"
                />
                Web search
              </label>

              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition"
                onClick={clearChat}
                type="button"
              >
                Reset
              </button>

              <button
                className="rounded-xl bg-white text-black px-3 py-2 text-sm font-semibold hover:bg-white/90 transition"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
          </header>

          <section className="h-[68vh] overflow-auto px-5 py-5">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="text-lg font-semibold text-white">Scrie primul mesaj</div>
                  <div className="mt-2 text-sm text-white/60">
                    Dianita răspunde după ce trimiți primul mesaj.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                        (m.role === "user"
                          ? "bg-white text-black"
                          : "bg-zinc-900 text-white border border-white/10")
                      }
                    >
                      <div className="text-[11px] font-semibold opacity-70">
                        {m.role === "user" ? "Tu" : "Dianita"}
                      </div>

                      <div className="mt-1 whitespace-pre-wrap">{m.text}</div>

                      {m.role === "assistant" && m.sources && m.sources.length > 0 ? (
                        <div className="mt-3 text-xs text-white/80">
                          <div className="font-semibold text-white/60">Surse</div>
                          <ul className="mt-1 list-disc pl-4 space-y-1">
                            {m.sources.slice(0, 5).map((s, idx) => (
                              <li key={idx} className="text-white/75">
                                {s.url ? (
                                  <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline decoration-white/30 hover:decoration-white/70"
                                  >
                                    {s.title ? s.title : s.url}
                                  </a>
                                ) : (
                                  <span>{s.title ?? "Sursă"}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-zinc-900 text-white border border-white/10">
                      <div className="text-[11px] font-semibold opacity-70">Dianita</div>
                      <div className="mt-1">Scriu acum...</div>
                    </div>
                  </div>
                ) : null}

                <div ref={bottomRef} />
              </div>
            )}
          </section>

          <footer className="border-t border-white/10 px-5 py-4">
            <div className="flex gap-3 items-end">
              <textarea
                className="flex-1 rounded-2xl border border-white/10 bg-zinc-900 text-white placeholder:text-white/40 p-4 outline-none text-sm resize-none focus:border-white/20"
                rows={2}
                placeholder="Scrie aici. Enter trimite. Shift plus Enter pentru rând nou."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />

              <button
                className="rounded-2xl bg-white text-black px-6 py-3 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-50"
                onClick={send}
                disabled={isLoading}
                type="button"
              >
                Send
              </button>
            </div>

            <div className="mt-2 text-xs text-white/50">
              Web search e pentru întrebări care cer informații la zi.
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
