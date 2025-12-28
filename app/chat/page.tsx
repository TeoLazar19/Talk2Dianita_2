"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import SettingsModal from "./settingsModal";

type Source = {
  title?: string;
  url?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
};

type Theme = {
  appText: string;
  panelBg: string;
  panelBorder: string;
  userBubbleBg: string;
  assistantBubbleBg: string;
  inputBg: string;
  inputBorder: string;
};

const defaultTheme: Theme = {
  appText: "#FFFFFF",
  panelBg: "#09090B",
  panelBorder: "rgba(255,255,255,0.15)",
  userBubbleBg: "#27272A",
  assistantBubbleBg: "#18181B",
  inputBg: "#18181B",
  inputBorder: "rgba(255,255,255,0.15)",
};

export default function ChatPage() {
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAuthed = useMemo(() => Boolean(session?.user?.email), [session?.user?.email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isAuthed) return;

    (async () => {
      try {
        const res = await fetch("/api/preferences", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.theme) setTheme(data.theme);
      } catch {}
    })();
  }, [isAuthed]);

  async function saveTheme() {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (data?.theme) setTheme(data.theme);
      setSettingsOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;

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
          text: data.reply ?? "No reply received from server.",
          sources: Array.isArray(data.sources) ? data.sources : [],
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

  const cssVars = {
    ["--appText" as any]: theme.appText,
    ["--panelBg" as any]: theme.panelBg,
    ["--panelBorder" as any]: theme.panelBorder,
    ["--userBubbleBg" as any]: theme.userBubbleBg,
    ["--assistantBubbleBg" as any]: theme.assistantBubbleBg,
    ["--inputBg" as any]: theme.inputBg,
    ["--inputBorder" as any]: theme.inputBorder,
  } as React.CSSProperties;

  return (
    <main className="min-h-screen flex flex-col px-4 py-6" style={cssVars}>
      <div className="mx-auto w-full max-w-5xl">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden border"
          style={{ background: "var(--panelBg)", borderColor: "var(--panelBorder)" }}
        >
          <header className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--panelBorder)" }}>
            <div className="flex flex-col gap-1">
              <Image
                src="/logo-horizontal.png.png"
                alt="Talk2Dianita"
                width={160}
                height={40}
                priority
              />
              <div className="text-xs truncate" style={{ color: "color-mix(in srgb, var(--appText) 70%, transparent)" }}>
                Logged in as {session?.user?.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold transition"
                style={{ borderColor: "var(--panelBorder)", color: "var(--appText)", background: "rgba(255,255,255,0.06)" }}
              >
                Settings
              </button>

              <label
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                style={{ borderColor: "var(--panelBorder)", color: "var(--appText)", background: "rgba(255,255,255,0.06)" }}
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
                className="rounded-xl border px-3 py-2 text-sm transition"
                style={{ borderColor: "var(--panelBorder)", color: "var(--appText)", background: "rgba(255,255,255,0.06)" }}
                onClick={clearChat}
                type="button"
              >
                Reset
              </button>

              <button
                className="rounded-xl border px-3 py-2 text-sm font-semibold transition"
                style={{ borderColor: "var(--panelBorder)", color: "var(--appText)", background: "rgba(255,255,255,0.06)" }}
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
          </header>

          <section className="h-[68vh] overflow-auto px-5 py-5">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="text-lg font-semibold" style={{ color: "var(--appText)" }}>
                    Type your first message
                  </div>
                  <div className="mt-2 text-sm" style={{ color: "color-mix(in srgb, var(--appText) 60%, transparent)" }}>
                    The conversation starts when you send the first message.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border"
                      style={{
                        borderColor: "var(--panelBorder)",
                        background: m.role === "user" ? "var(--userBubbleBg)" : "var(--assistantBubbleBg)",
                        color: "var(--appText)",
                      }}
                    >
                      <div className="text-[11px] font-semibold" style={{ color: "color-mix(in srgb, var(--appText) 65%, transparent)" }}>
                        {m.role === "user" ? "You" : "Dianita"}
                      </div>

                      <div className="mt-1 whitespace-pre-wrap">{m.text}</div>

                      {m.role === "assistant" && m.sources?.length ? (
                        <div className="mt-3 text-xs">
                          <div className="font-semibold" style={{ color: "color-mix(in srgb, var(--appText) 65%, transparent)" }}>
                            Sources
                          </div>
                          <ul className="mt-1 list-disc pl-4 space-y-1">
                            {m.sources.slice(0, 5).map((s, idx) => (
                              <li key={idx} style={{ color: "color-mix(in srgb, var(--appText) 70%, transparent)" }}>
                                {s.url ? (
                                  <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                    style={{ textDecorationColor: "color-mix(in srgb, var(--appText) 30%, transparent)" }}
                                  >
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
                      className="max-w-[85%] rounded-2xl px-4 py-3 text-sm border"
                      style={{
                        borderColor: "var(--panelBorder)",
                        background: "var(--assistantBubbleBg)",
                        color: "var(--appText)",
                      }}
                    >
                      <div className="text-[11px] font-semibold" style={{ color: "color-mix(in srgb, var(--appText) 65%, transparent)" }}>
                        Dianita
                      </div>
                      <div className="mt-1">Typing...</div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </section>

          <footer className="border-t px-5 py-4" style={{ borderColor: "var(--panelBorder)" }}>
            <div className="flex gap-3 items-end">
              <textarea
                className="flex-1 rounded-2xl border p-4 text-sm outline-none resize-none"
                style={{
                  borderColor: "var(--inputBorder)",
                  background: "var(--inputBg)",
                  color: "var(--appText)",
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
                className="rounded-2xl border px-6 py-3 text-sm font-semibold transition disabled:opacity-50"
                style={{
                  borderColor: "var(--panelBorder)",
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--appText)",
                }}
                onClick={send}
                disabled={isLoading}
                type="button"
              >
                Send
              </button>
            </div>

            <div className="mt-2 text-xs" style={{ color: "color-mix(in srgb, var(--appText) 55%, transparent)" }}>
              Use web search for questions that need up to date information.
            </div>
          </footer>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        theme={theme}
        onClose={() => setSettingsOpen(false)}
        onChange={(next) => setTheme(next)}
        onSave={async () => {
          if (saving) return;
          await saveTheme();
        }}
        onReset={() => setTheme(defaultTheme)}
      />
    </main>
  );
}
