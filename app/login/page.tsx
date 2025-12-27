"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/50 backdrop-blur-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-white">Login</h1>

        <p className="mt-2 text-sm text-white/70">
          Doar emailurile aprobate au acces.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/chat" })}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          <Image
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        <p className="mt-4 text-xs text-white/60">
          Dacă primești Access Denied, înseamnă că emailul nu e în whitelist.
        </p>
      </div>
    </main>
  );
}
