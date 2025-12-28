"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import SettingsFab from "./SettingsModal";
import ReactMarkdown from "react-markdown";
import ChatDrawer from "./ChatDrawer";

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

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [thinkingDots, setThinkingDots] = useState(0);

  const [chatsOpen, setChatsOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAuthed = useMemo(() => Boolean(session?.user?.email), [session?.user?.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isAuthed) return;
    if (activeChatId) return;

    (async () => {
      try {
        const res = await fetch("/api/chats", { method: "POST" });
        const data = await res.json().catch(() => null);
        const id = data?.chat?.id;
        if (id) setActiveChatId(String(id));
      } catch {}
    })();
  }, [isAuthed, activeChatId]);

  useEffect(() => {
    if (!isLoading) {
      setThinkingDots(0);
      return;
    }

    const interval = setInterval(() => {
      setThinkingDots((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  async function send() {
    const text = input.trim();
    if (!text || isLoading || !activeChatId) return;

    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          webSearch,
          messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json().catch(() => null);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data?.reply ?? "No reply received from server.",
          sources: Array.isArray(data?.sources) ? data.sources : [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Request error. Check the terminal." },
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
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-8 shadow-2xl">
          <div className="text-lg font-semibold text-white">Talk2Dianita</div>
          <div className="mt-2 text-sm text-white/70">Loading session...</div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-8 shadow-2xl">
          <div className="text-lg font-semibold text-white">Talk2Dianita</div>
          <div className="mt-2 text-sm text-white/70">You are not logged in.</div>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden border"
          style={{
            background: "var(--t2d-panel-bg)",
            borderColor: "var(--t2d-panel-border)",
            color: "var(--t2d-app-text)",
          }}
        >
          <header
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--t2d-panel-border)" }}
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <Image src="/logo-horizontal.png" alt="Talk2Dianita" width={160} height={40} priority />
                <div
                  className="text-xs truncate"
                  style={{ color: "color-mix(in srgb, var(--t2d-app-text) 70%, transparent)" }}
                >
                  Logged in as {session?.user?.email}
                </div>
              </div>

              <button
                type="button"
                className="mt-1 rounded-xl border px-3 py-2 text-sm font-semibold"
                style={{
                  borderColor: "var(--t2d-panel-border)",
                  background: "rgba(255,255,255,0.06)",
                }}
                onClick={() => setChatsOpen(true)}
              >
                Chats
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                style={{
                  borderColor: "var(--t2d-panel-border)",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                  className="accent-white"
                />
                Web search
              </label>

              <button
                className="rounded-xl border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--t2d-panel-border)",
                  background: "rgba(255,255,255,0.06)",
                }}
                onClick={clearChat}
                type="button"
              >
                Reset
              </button>

              <button
                className="rounded-xl border px-3 py-2 text-sm font-semibold"
                style={{
                  borderColor: "var(--t2d-panel-border)",
                  background: "rgba(255,255,255,0.06)",
                }}
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
          </header>

          <section className="h-[68vh] overflow-auto px-5 py-5">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="chat-bubble max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border"
                    style={{
                      borderColor: "var(--t2d-panel-border)",
                      background: m.role === "user" ? "var(--t2d-user-bubble-bg)" : "var(--t2d-assistant-bubble-bg)",
                      color: m.role === "user" ? "var(--t2d-user-text)" : "var(--t2d-assistant-text)",
                    }}
                  >
                    <div
                      className="text-[11px] font-semibold"
                      style={{ color: "color-mix(in srgb, var(--t2d-app-text) 65%, transparent)" }}
                    >
                      {m.role === "user" ? "You" : "Dianita"}
                    </div>

                    <div className="mt-1">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>

                    {m.role === "assistant" && m.sources?.length ? (
                      <div className="mt-3 text-xs">
                        <div
                          className="font-semibold"
                          style={{ color: "color-mix(in srgb, var(--t2d-app-text) 65%, transparent)" }}
                        >
                          Sources
                        </div>
                        <ul className="mt-1 list-disc pl-4 space-y-1">
                          {m.sources.slice(0, 5).map((s, idx) => (
                            <li key={idx}>
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                                  {s.title ?? s.url}
                                </a>
                              ) : (
                                <span>{s.title ?? "Source"}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="chat-bubble max-w-[85%] rounded-2xl px-4 py-3 text-sm border"
                    style={{
                      borderColor: "var(--t2d-panel-border)",
                      background: "var(--t2d-assistant-bubble-bg)",
                      color: "var(--t2d-assistant-text)",
                    }}
                  >
                    <div className="text-[11px] font-semibold">Dianita</div>
                    <div className="mt-1">Thinking{".".repeat(thinkingDots)}</div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </section>

          <footer className="border-t px-5 py-4" style={{ borderColor: "var(--t2d-panel-border)" }}>
            <div className="flex gap-3 items-end">
              <textarea
                className="flex-1 rounded-2xl border p-4 text-sm resize-none"
                style={{
                  borderColor: "var(--t2d-input-border)",
                  background: "var(--t2d-input-bg)",
                  color: "var(--t2d-input-text)",
                }}
                rows={2}
                placeholder="Type here. Enter sends. Shift plus Enter for new line."
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
                className="rounded-2xl border px-6 py-3 text-sm font-semibold"
                style={{
                  borderColor: "var(--t2d-panel-border)",
                  background: "rgba(255,255,255,0.06)",
                  opacity: isLoading || !activeChatId ? 0.6 : 1,
                }}
                onClick={send}
                disabled={isLoading || !activeChatId}
                type="button"
              >
                {!activeChatId ? "Starting..." : "Send"}
              </button>
            </div>
          </footer>
        </div>
      </div>

      <ChatDrawer
        open={chatsOpen}
        onClose={() => setChatsOpen(false)}
        activeChatId={activeChatId}
        onSetActiveChatId={(id) => setActiveChatId(id)}
        onLoadMessages={(msgs) => setMessages(msgs)}
        onClearMessages={() => setMessages([])}
      />

      <SettingsFab />
    </main>
  );
}
