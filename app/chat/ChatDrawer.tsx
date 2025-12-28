"use client";

import { useEffect, useMemo, useState } from "react";

type ChatItem = {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: Array<{ title?: string; url?: string }>;
};

export default function ChatDrawer(props: {
  open: boolean;
  onClose: () => void;

  activeChatId: string | null;
  onSetActiveChatId: (id: string) => void;

  onLoadMessages: (messages: Message[]) => void;
  onClearMessages: () => void;
}) {
  const { open, onClose, activeChatId, onSetActiveChatId, onLoadMessages, onClearMessages } = props;

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const sortedChats = useMemo(() => chats, [chats]);

  async function refreshChats() {
    setLoading(true);
    try {
      const res = await fetch("/api/chats", { method: "GET" });
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data?.chats) ? data.chats : [];
      setChats(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    refreshChats();
  }, [open]);

  async function createChat() {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/chats", { method: "POST" });
      const data = await res.json().catch(() => null);
      const chat = data?.chat;
      if (chat?.id) {
        await refreshChats();
        onSetActiveChatId(String(chat.id));
        onClearMessages();
        onClose();
      }
    } finally {
      setCreating(false);
    }
  }

  async function openChat(id: string) {
    try {
      const res = await fetch(`/api/chats/${id}/messages`, { method: "GET" });
      const data = await res.json().catch(() => null);
      const msgs = Array.isArray(data?.messages) ? data.messages : [];

      const mapped: Message[] = msgs.map((m: any) => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        text: String(m?.text ?? ""),
        sources: Array.isArray(m?.sources) ? m.sources : [],
      }));

      onSetActiveChatId(id);
      onLoadMessages(mapped);
      onClose();
    } catch {}
  }

  function startRename(chat: ChatItem) {
    setRenamingId(chat.id);
    setRenameValue(chat.title ?? "");
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue("");
  }

  async function saveRename(id: string) {
    const title = renameValue.trim();
    if (!title) return;

    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) return;

      await refreshChats();
      cancelRename();
    } catch {}
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.45)" }}
        aria-label="Close"
      />

      <aside
        className="absolute left-0 top-0 h-full w-[320px] border-r shadow-2xl p-4 flex flex-col"
        style={{
          background: "var(--t2d-panel-bg)",
          borderColor: "var(--t2d-panel-border)",
          color: "var(--t2d-app-text)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Chats</div>
          <button
            type="button"
            className="rounded-lg border px-2 py-1 text-xs"
            style={{ borderColor: "var(--t2d-panel-border)", background: "rgba(255,255,255,0.06)" }}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <button
          type="button"
          className="mt-3 rounded-xl border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: "var(--t2d-panel-border)", background: "rgba(255,255,255,0.06)" }}
          onClick={createChat}
          disabled={creating}
        >
          {creating ? "Creating..." : "New chat"}
        </button>

        <div className="mt-4 flex-1 overflow-auto">
          {loading ? (
            <div className="text-sm" style={{ color: "color-mix(in srgb, var(--t2d-app-text) 70%, transparent)" }}>
              Loading chats...
            </div>
          ) : sortedChats.length === 0 ? (
            <div className="text-sm" style={{ color: "color-mix(in srgb, var(--t2d-app-text) 70%, transparent)" }}>
              No chats yet.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedChats.map((c) => {
                const isActive = c.id === activeChatId;
                const isRenaming = renamingId === c.id;

                return (
                  <div
                    key={c.id}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: "var(--t2d-panel-border)",
                      background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                    }}
                  >
                    {isRenaming ? (
                      <div className="flex gap-2">
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 rounded-lg border px-2 py-2 text-sm outline-none"
                          style={{
                            borderColor: "var(--t2d-input-border)",
                            background: "var(--t2d-input-bg)",
                            color: "var(--t2d-input-text)",
                          }}
                        />
                        <button
                          type="button"
                          className="rounded-lg border px-2 text-sm"
                          style={{ borderColor: "var(--t2d-panel-border)", background: "rgba(255,255,255,0.06)" }}
                          onClick={() => saveRename(c.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border px-2 text-sm"
                          style={{ borderColor: "var(--t2d-panel-border)", background: "rgba(255,255,255,0.06)" }}
                          onClick={cancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="text-left flex-1"
                          onClick={() => openChat(c.id)}
                          style={{ color: "var(--t2d-app-text)" }}
                        >
                          <div className="text-sm font-semibold line-clamp-1">{c.title}</div>
                          <div
                            className="mt-1 text-[11px]"
                            style={{ color: "color-mix(in srgb, var(--t2d-app-text) 65%, transparent)" }}
                          >
                            {new Date(c.updatedAt).toLocaleString()}
                          </div>
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border px-2 py-1 text-xs"
                          style={{ borderColor: "var(--t2d-panel-border)", background: "rgba(255,255,255,0.06)" }}
                          onClick={() => startRename(c)}
                        >
                          Rename
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
