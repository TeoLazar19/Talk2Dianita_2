import { NextResponse } from "next/server";

export const runtime = "nodejs";

function redactDbUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.host;
    const db = u.pathname.replace("/", "") || "unknown";
    return { host, db };
  } catch {
    return { host: "invalid_url", db: "unknown" };
  }
}

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const directUrl = process.env.DIRECT_URL || "";

    const dbInfo = dbUrl ? redactDbUrl(dbUrl) : { host: "missing", db: "missing" };
    const directInfo = directUrl ? redactDbUrl(directUrl) : { host: "missing", db: "missing" };

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const existsRows: Array<{ exists: boolean }> = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'User'
          AND column_name = 'passwordHash'
      ) AS "exists";
    `;

    const exists = Boolean(existsRows?.[0]?.exists);

    await prisma.$disconnect();

    return NextResponse.json({
      ok: true,
      databaseUrl: dbInfo,
      directUrl: directInfo,
      passwordHashColumnExists: exists,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
