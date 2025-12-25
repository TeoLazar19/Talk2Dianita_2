"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Doar emailurile aprobate au acces.
        </p>

        <button
          className="mt-6 w-full rounded-xl bg-black text-white px-4 py-3 text-sm hover:opacity-90"
          onClick={() => signIn("google", { callbackUrl: "/chat" })}
          type="button"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-xs text-gray-500">
          Dacă primești Access Denied, înseamnă că emailul nu e în whitelist.
        </p>
      </div>
    </main>
  );
}
