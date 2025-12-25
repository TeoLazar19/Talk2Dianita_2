import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

function getAllowedEmails() {
  const raw = process.env.ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = String(profile?.email ?? "").toLowerCase();
      const allowed = getAllowedEmails();

      if (!email) return false;
      if (allowed.length === 0) return false;

      return allowed.includes(email);
    },
  },
});
