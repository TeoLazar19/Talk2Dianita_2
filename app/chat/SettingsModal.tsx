"use client";

import { useEffect, useState } from "react";

type Theme = {
  appText: string;
  panelBg: string;
  panelBorder: string;
  userBubbleBg: string;
  assistantBubbleBg: string;
  inputBg: string;
  inputBorder: string;
};

const defaults: Theme = {
  appText: "#FFFFFF",
  panelBg: "#09090B",
  panelBorder: "rgba(255,255,255,0.15)",
  userBubbleBg: "#27272A",
  assistantBubbleBg: "#18181B",
  inputBg: "#18181B",
  inputBorder: "rgba(255,255,255,0.15)",
};

export default function SettingsModal({
  open,
  theme,
  onClose,
  onChange,
  onSave,
  onReset,
}: {
  open: boolean;
  theme: Theme;
  onClose: () => void;
  onChange: (next: Theme) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
}) {
  const [local, setLocal] = useState<Theme>(theme);

  useEffect(() => {
    setLocal(theme);
  }, [theme, open]);

  function setField<K extends keyof Theme>(key: K, value: Theme[K]) {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-white">Settings</div>
            <div className="mt-1 text-sm text-white/60">
              These settings are saved to your account.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 transition"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4">
          <Row label="Text color">
            <input
              type="color"
              value={local.appText}
              onChange={(e) => setField("appText", e.target.value)}
              className="h-10 w-16 rounded-lg border border-white/15 bg-transparent"
            />
          </Row>

          <Row label="Panel background">
            <input
              type="color"
              value={local.panelBg}
              onChange={(e) => setField("panelBg", e.target.value)}
              className="h-10 w-16 rounded-lg border border-white/15 bg-transparent"
            />
          </Row>

          <Row label="Panel border">
            <input
              value={local.panelBorder}
              onChange={(e) => setField("panelBorder", e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
              placeholder="rgba(255,255,255,0.15)"
            />
          </Row>

          <Row label="User bubble background">
            <input
              type="color"
              value={local.userBubbleBg}
              onChange={(e) => setField("userBubbleBg", e.target.value)}
              className="h-10 w-16 rounded-lg border border-white/15 bg-transparent"
            />
          </Row>

          <Row label="Assistant bubble background">
            <input
              type="color"
              value={local.assistantBubbleBg}
              onChange={(e) => setField("assistantBubbleBg", e.target.value)}
              className="h-10 w-16 rounded-lg border border-white/15 bg-transparent"
            />
          </Row>

          <Row label="Textbox background">
            <input
              type="color"
              value={local.inputBg}
              onChange={(e) => setField("inputBg", e.target.value)}
              className="h-10 w-16 rounded-lg border border-white/15 bg-transparent"
            />
          </Row>

          <Row label="Textbox border">
            <input
              value={local.inputBorder}
              onChange={(e) => setField("inputBorder", e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
              placeholder="rgba(255,255,255,0.15)"
            />
          </Row>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setLocal(defaults);
              onChange(defaults);
              onReset();
            }}
            className="rounded-xl border border-white/15 bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 transition"
          >
            Reset to default
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm text-white/80">{label}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
