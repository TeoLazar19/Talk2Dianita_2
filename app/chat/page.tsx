"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Salut, sunt Dianita. Spune mi ce vrei să fac." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [webSearch, setWebSearch] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

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
    setMessages([{ role: "assistant", text: "Am resetat conversația. Cu ce te ajut?" }]);
  }

  function logout() {
    signOut({ callbackUrl: "/login" });
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
          <div className="text-lg font-semibold">Talk2Dianita</div>
          <div className="mt-2 text-sm text-gray-600">Se încarcă sesiunea...</div>
        </div>
      </main>
    );
  }

  if (!session?.user?.email) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
          <div className="text-lg font-semibold">Talk2Dianita</div>
          <div className="mt-2 text-sm text-gray-600">
            Nu ești logat. Mergi la login.
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-3 text-sm hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Talk2Dianita</div>
            <div className="text-xs text-gray-600">
              Logat ca {session.user.email}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-700 flex items-center gap-2 border rounded-xl px-3 py-2 bg-white">
              <input
                type="checkbox"
                checked={webSearch}
                onChange={(e) => setWebSearch(e.target.checked)}
              />
              Web search
            </label>

            <button
              className="text-sm rounded-xl border bg-white px-3 py-2 hover:bg-gray-50"
              onClick={clearChat}
              type="button"
            >
              Reset
            </button>

            <button
              className="text-sm rounded-xl bg-black text-white px-3 py-2 hover:opacity-90"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          <div className="rounded-2xl border bg-white shadow-sm p-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed " +
                    (m.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-900")
                  }
                >
                  <div className="text-xs font-semibold opacity-70">
                    {m.role === "user" ? "Tu" : "Dianita"}
                  </div>

                  <div className="mt-1 whitespace-pre-wrap">{m.text}</div>

                  {m.role === "assistant" && m.sources && m.sources.length > 0 ? (
                    <div className="mt-3 text-xs">
                      <div className="font-semibold opacity-70">Surse</div>
                      <ul className="mt-1 list-disc pl-4 space-y-1">
                        {m.sources.slice(0, 5).map((s, idx) => (
                          <li key={idx} className="opacity-80">
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
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
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-gray-100 text-gray-900">
                  <div className="text-xs font-semibold opacity-70">Dianita</div>
                  <div className="mt-1">Scriu acum...</div>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          <div className="rounded-2xl border bg-white shadow-sm p-3">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 rounded-xl border p-3 outline-none text-sm resize-none"
                rows={3}
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
                className="rounded-xl bg-black text-white px-5 py-3 text-sm disabled:opacity-50"
                onClick={send}
                disabled={isLoading}
                type="button"
              >
                Send
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Web search e pentru întrebări care cer informații la zi.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
