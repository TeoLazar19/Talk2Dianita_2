"use client";

import { useEffect, useMemo, useState } from "react";

type ThemeJson = {
  appText: string;
  panelBg: string;
  panelBorder: string;
  userBubbleBg: string;
  assistantBubbleBg: string;
  inputBg: string;
  inputBorder: string;

  userText?: string;
  assistantText?: string;
  inputText?: string;
  placeholderText?: string;
};

const defaultTheme: ThemeJson = {
  appText: "#FFFFFF",
  panelBg: "#09090B",
  panelBorder: "rgba(255,255,255,0.15)",
  userBubbleBg: "#27272A",
  assistantBubbleBg: "#18181B",
  inputBg: "#18181B",
  inputBorder: "rgba(255,255,255,0.15)",
  userText: "#FFFFFF",
  assistantText: "#FFFFFF",
  inputText: "#FFFFFF",
  placeholderText: "rgba(255,255,255,0.55)",
};

function applyThemeToCssVars(theme: ThemeJson) {
  const root = document.documentElement;

  root.style.setProperty("--t2d-app-text", theme.appText);
  root.style.setProperty("--t2d-panel-bg", theme.panelBg);
  root.style.setProperty("--t2d-panel-border", theme.panelBorder);
  root.style.setProperty("--t2d-user-bubble-bg", theme.userBubbleBg);
  root.style.setProperty("--t2d-assistant-bubble-bg", theme.assistantBubbleBg);
  root.style.setProperty("--t2d-input-bg", theme.inputBg);
  root.style.setProperty("--t2d-input-border", theme.inputBorder);

  root.style.setProperty("--t2d-user-text", theme.userText ?? theme.appText);
  root.style.setProperty("--t2d-assistant-text", theme.assistantText ?? theme.appText);
  root.style.setProperty("--t2d-input-text", theme.inputText ?? theme.appText);
  root.style.setProperty("--t2d-placeholder-text", theme.placeholderText ?? "rgba(255,255,255,0.55)");
}

function mergeTheme(base: ThemeJson, incoming: any): ThemeJson {
  if (!incoming || typeof incoming !== "object") return base;

  const t: ThemeJson = {
    ...base,
    ...incoming,
  };

  return t;
}

type Preset = {
  key: string;
  name: string;
  hint: string;
  theme: ThemeJson;
  swatch: { a: string; b: string; c: string };
};

function makePreset(
  key: string,
  name: string,
  hint: string,
  swatch: { a: string; b: string; c: string },
  theme: Partial<ThemeJson>
): Preset {
  return {
    key,
    name,
    hint,
    swatch,
    theme: mergeTheme(defaultTheme, theme),
  };
}

function GearIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13.3c.04-.43.06-.87.06-1.3s-.02-.87-.06-1.3l2.01-1.57a.55.55 0 0 0 .13-.7l-1.9-3.29a.55.55 0 0 0-.66-.24l-2.37.96a9.2 9.2 0 0 0-2.25-1.3l-.36-2.52A.55.55 0 0 0 11.46 1h-3.9a.55.55 0 0 0-.54.46L6.66 3.98c-.8.32-1.55.75-2.25 1.3l-2.37-.96a.55.55 0 0 0-.66.24L-.52 7.85a.55.55 0 0 0 .13.7L1.62 10.1c-.04.43-.06.87-.06 1.3s.02.87.06 1.3l-2.01 1.57a.55.55 0 0 0-.13.7l1.9 3.29c.14.24.43.34.66.24l2.37-.96c.7.55 1.45.98 2.25 1.3l.36 2.52c.05.26.28.46.54.46h3.9c.27 0 .5-.2.54-.46l.36-2.52c.8-.32 1.55-.75 2.25-1.3l2.37.96c.23.1.52 0 .66-.24l1.9-3.29a.55.55 0 0 0-.13-.7l-2.01-1.57Z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.9"
      />
    </svg>
  );
}

export default function SettingsFab() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<ThemeJson>(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = useMemo<Preset[]>(
    () => [
      makePreset(
        "purple",
        "Mov",
        "Calm, modern, contrast bun",
        { a: "#A855F7", b: "#3B0764", c: "#0B0212" },
        {
          panelBg: "#08010F",
          panelBorder: "rgba(168,85,247,0.25)",
          userBubbleBg: "rgba(168,85,247,0.20)",
          assistantBubbleBg: "rgba(255,255,255,0.06)",
          inputBg: "rgba(255,255,255,0.05)",
          inputBorder: "rgba(168,85,247,0.30)",
          appText: "#FFFFFF",
          userText: "#FFFFFF",
          assistantText: "#FFFFFF",
          inputText: "#FFFFFF",
          placeholderText: "rgba(255,255,255,0.55)",
        }
      ),
      makePreset(
        "red",
        "Roșu",
        "Bold și energic",
        { a: "#EF4444", b: "#7F1D1D", c: "#0B0505" },
        {
          panelBg: "#0B0505",
          panelBorder: "rgba(239,68,68,0.25)",
          userBubbleBg: "rgba(239,68,68,0.22)",
          assistantBubbleBg: "rgba(255,255,255,0.06)",
          inputBg: "rgba(255,255,255,0.05)",
          inputBorder: "rgba(239,68,68,0.32)",
          appText: "#FFFFFF",
          userText: "#FFFFFF",
          assistantText: "#FFFFFF",
          inputText: "#FFFFFF",
          placeholderText: "rgba(255,255,255,0.55)",
        }
      ),
      makePreset(
        "pink",
        "Roz",
        "Soft, vibe nice",
        { a: "#EC4899", b: "#831843", c: "#0B0311" },
        {
          panelBg: "#0B0311",
          panelBorder: "rgba(236,72,153,0.25)",
          userBubbleBg: "rgba(236,72,153,0.22)",
          assistantBubbleBg: "rgba(255,255,255,0.06)",
          inputBg: "rgba(255,255,255,0.05)",
          inputBorder: "rgba(236,72,153,0.32)",
          appText: "#FFFFFF",
          userText: "#FFFFFF",
          assistantText: "#FFFFFF",
          inputText: "#FFFFFF",
          placeholderText: "rgba(255,255,255,0.55)",
        }
      ),
      makePreset(
        "white",
        "Alb",
        "Clean, light",
        { a: "#FFFFFF", b: "#E5E7EB", c: "#111827" },
        {
          panelBg: "#FFFFFF",
          panelBorder: "rgba(17,24,39,0.12)",
          userBubbleBg: "rgba(17,24,39,0.08)",
          assistantBubbleBg: "rgba(17,24,39,0.06)",
          inputBg: "rgba(17,24,39,0.04)",
          inputBorder: "rgba(17,24,39,0.14)",
          appText: "#0B1220",
          userText: "#0B1220",
          assistantText: "#0B1220",
          inputText: "#0B1220",
          placeholderText: "rgba(11,18,32,0.45)",
        }
      ),
      makePreset(
        "black",
        "Negru",
        "Ultra dark",
        { a: "#111827", b: "#000000", c: "#0A0A0A" },
        {
          panelBg: "#000000",
          panelBorder: "rgba(255,255,255,0.16)",
          userBubbleBg: "rgba(255,255,255,0.10)",
          assistantBubbleBg: "rgba(255,255,255,0.06)",
          inputBg: "rgba(255,255,255,0.05)",
          inputBorder: "rgba(255,255,255,0.18)",
          appText: "#FFFFFF",
          userText: "#FFFFFF",
          assistantText: "#FFFFFF",
          inputText: "#FFFFFF",
          placeholderText: "rgba(255,255,255,0.55)",
        }
      ),
      makePreset(
        "grayLight",
        "Gri light",
        "Neutru și calm",
        { a: "#F3F4F6", b: "#D1D5DB", c: "#111827" },
        {
          panelBg: "#F3F4F6",
          panelBorder: "rgba(17,24,39,0.10)",
          userBubbleBg: "rgba(17,24,39,0.08)",
          assistantBubbleBg: "rgba(17,24,39,0.06)",
          inputBg: "rgba(17,24,39,0.04)",
          inputBorder: "rgba(17,24,39,0.14)",
          appText: "#0B1220",
          userText: "#0B1220",
          assistantText: "#0B1220",
          inputText: "#0B1220",
          placeholderText: "rgba(11,18,32,0.45)",
        }
      ),
      makePreset(
        "grayDark",
        "Gri dark",
        "Modern și discret",
        { a: "#4B5563", b: "#111827", c: "#09090B" },
        {
          panelBg: "#09090B",
          panelBorder: "rgba(255,255,255,0.14)",
          userBubbleBg: "rgba(255,255,255,0.10)",
          assistantBubbleBg: "rgba(255,255,255,0.06)",
          inputBg: "rgba(255,255,255,0.05)",
          inputBorder: "rgba(255,255,255,0.16)",
          appText: "#FFFFFF",
          userText: "#FFFFFF",
          assistantText: "#FFFFFF",
          inputText: "#FFFFFF",
          placeholderText: "rgba(255,255,255,0.55)",
        }
      ),
      makePreset(
        "yellow",
        "Galben",
        "Bright, dar lizibil",
        { a: "#FBBF24", b: "#92400E", c: "#0B0702" },
        {
          panelBg: "#0B0702",
          panelBorder: "rgba(251,191,36,0.26)",
          userBubbleBg: "rgba(251,191,36,0.20)",
          assistantBubbleBg: "rgba(255,255,255,0.06)",
          inputBg: "rgba(255,255,255,0.05)",
          inputBorder: "rgba(251,191,36,0.34)",
          appText: "#FFFFFF",
          userText: "#FFFFFF",
          assistantText: "#FFFFFF",
          inputText: "#FFFFFF",
          placeholderText: "rgba(255,255,255,0.55)",
        }
      ),
    ],
    []
  );

  async function loadThemeFromDb() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/preferences", { method: "GET" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ? String(data.error) : "Failed to load preferences";
        setError(msg);
        const merged = mergeTheme(defaultTheme, null);
        setActiveTheme(merged);
        applyThemeToCssVars(merged);
        return;
      }

      const merged = mergeTheme(defaultTheme, data?.theme);
      setActiveTheme(merged);
      applyThemeToCssVars(merged);
    } catch {
      setError("Failed to load preferences");
      const merged = mergeTheme(defaultTheme, null);
      setActiveTheme(merged);
      applyThemeToCssVars(merged);
    } finally {
      setLoading(false);
    }
  }

  async function saveThemeToDb(nextTheme: ThemeJson) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextTheme }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.error ? String(data.error) : "Failed to save preferences";
        setError(msg);
        return;
      }

      const merged = mergeTheme(defaultTheme, data?.theme);
      setActiveTheme(merged);
      applyThemeToCssVars(merged);
    } catch {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadThemeFromDb();
  }, []);

  function onPickPreset(p: Preset) {
    setActiveTheme(p.theme);
    applyThemeToCssVars(p.theme);
    void saveThemeToDb(p.theme);
  }

  return (
    <>
      <style>{`
        :root{
          --t2d-app-text: ${defaultTheme.appText};
          --t2d-panel-bg: ${defaultTheme.panelBg};
          --t2d-panel-border: ${defaultTheme.panelBorder};
          --t2d-user-bubble-bg: ${defaultTheme.userBubbleBg};
          --t2d-assistant-bubble-bg: ${defaultTheme.assistantBubbleBg};
          --t2d-input-bg: ${defaultTheme.inputBg};
          --t2d-input-border: ${defaultTheme.inputBorder};
          --t2d-user-text: ${defaultTheme.userText};
          --t2d-assistant-text: ${defaultTheme.assistantText};
          --t2d-input-text: ${defaultTheme.inputText};
          --t2d-placeholder-text: ${defaultTheme.placeholderText};
        }

        .t2d-settings-fab{
          position: fixed;
          left: 18px;
          bottom: 18px;
          z-index: 50;
          width: 46px;
          height: 46px;
          border-radius: 9999px;
          border: 1px solid var(--t2d-panel-border);
          background: var(--t2d-panel-bg);
          color: var(--t2d-app-text);
          display: grid;
          place-items: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          cursor: pointer;
          user-select: none;
        }

        .t2d-settings-fab:active{
          transform: scale(0.98);
        }

        .t2d-settings-overlay{
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 18px;
        }

        .t2d-settings-panel{
          width: min(440px, calc(100vw - 36px));
          border-radius: 16px;
          border: 1px solid var(--t2d-panel-border);
          background: var(--t2d-panel-bg);
          color: var(--t2d-app-text);
          box-shadow: 0 18px 60px rgba(0,0,0,0.55);
          overflow: hidden;
        }

        .t2d-settings-header{
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 14px 10px 14px;
        }

        .t2d-settings-title{
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2px;
          opacity: 0.95;
        }

        .t2d-settings-close{
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--t2d-panel-border);
          background: transparent;
          color: var(--t2d-app-text);
          cursor: pointer;
        }

        .t2d-settings-body{
          padding: 12px 14px 14px 14px;
        }

        .t2d-settings-sub{
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 10px;
        }

        .t2d-grid{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .t2d-card{
          border: 1px solid var(--t2d-panel-border);
          border-radius: 14px;
          padding: 10px;
          cursor: pointer;
          background: rgba(255,255,255,0.03);
        }

        .t2d-card:active{
          transform: scale(0.99);
        }

        .t2d-row{
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .t2d-name{
          font-size: 13px;
          font-weight: 700;
        }

        .t2d-hint{
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .t2d-swatch{
          display: flex;
          gap: 6px;
        }

        .t2d-dot{
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.25);
        }

        .t2d-status{
          padding: 10px 14px 14px 14px;
          font-size: 12px;
          opacity: 0.85;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid var(--t2d-panel-border);
        }

        .t2d-badge{
          font-size: 11px;
          opacity: 0.75;
        }

        .t2d-error{
          font-size: 12px;
          color: #FCA5A5;
          opacity: 0.95;
        }
      `}</style>

      <button
        type="button"
        className="t2d-settings-fab"
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        title="Settings"
      >
        <GearIcon size={20} />
      </button>

      {open ? (
        <div
          className="t2d-settings-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="t2d-settings-panel">
            <div className="t2d-settings-header">
              <div className="t2d-settings-title">Settings</div>
              <button type="button" className="t2d-settings-close" onClick={() => setOpen(false)} aria-label="Close">
                X
              </button>
            </div>

            <div className="t2d-settings-body">
              <div className="t2d-settings-sub">
                Alege un theme. Se aplică instant și se salvează pe userul tău.
              </div>

              <div className="t2d-grid">
                {presets.map((p) => (
                  <div
                    key={p.key}
                    className="t2d-card"
                    onClick={() => onPickPreset(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onPickPreset(p);
                    }}
                    aria-label={`Theme ${p.name}`}
                    title={p.name}
                  >
                    <div className="t2d-row">
                      <div>
                        <div className="t2d-name">{p.name}</div>
                        <div className="t2d-hint">{p.hint}</div>
                      </div>

                      <div className="t2d-swatch" aria-hidden="true">
                        <span className="t2d-dot" style={{ background: p.swatch.a }} />
                        <span className="t2d-dot" style={{ background: p.swatch.b }} />
                        <span className="t2d-dot" style={{ background: p.swatch.c }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="t2d-status">
              <div className="t2d-badge">
                {loading ? "Loading theme..." : saving ? "Saving..." : "Ready"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {error ? <div className="t2d-error">{error}</div> : null}
                <div className="t2d-badge">
                  Theme activ: {presets.find((p) => JSON.stringify(p.theme) === JSON.stringify(activeTheme))?.name ?? "Custom"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
