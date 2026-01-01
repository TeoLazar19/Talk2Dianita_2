"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginWithCredentials() {
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/chat",
    });

    if (!res?.ok) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/chat");
  }

  async function createAccount() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "Failed to create account.");
      setLoading(false);
      return;
    }

    await loginWithCredentials();
  }

  function continueAsGuest() {
    try {
      localStorage.setItem("t2d_guest", "1");
    } catch {}
    router.push("/chat?guest=1");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/50 backdrop-blur-xl p-8 shadow-2xl text-white">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 transition"
            type="button"
          >
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            Continue with Google
          </button>

          <button
            onClick={continueAsGuest}
            className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 transition"
            type="button"
          >
            Continue as guest
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                mode === "login"
                  ? "bg-white/20 border-white/30"
                  : "border-white/20"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                mode === "signup"
                  ? "bg-white/20 border-white/30"
                  : "border-white/20"
              }`}
            >
              Create account
            </button>
          </div>

          {mode === "signup" && (
            <div className="mt-4">
              <label className="text-xs text-white/70">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none"
                placeholder="Optional"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="text-xs text-white/70">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-3">
            <label className="text-xs text-white/70">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white outline-none"
              type="password"
              placeholder="Minimum 8 characters"
            />
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            onClick={mode === "login" ? loginWithCredentials : createAccount}
            className="mt-4 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20 transition disabled:opacity-60"
            type="button"
          >
            {loading
              ? "Working..."
              : mode === "login"
              ? "Login with email"
              : "Create account"}
          </button>
        </div>

        <p className="mt-4 text-xs text-white/60">
          Guest mode does not save chats or settings.
        </p>
      </div>
    </main>
  );
}
