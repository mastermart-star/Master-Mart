// Deliberately does NOT touch the database — a slow database must not get the
// container killed by the platform health check.
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({ ok: true });
}
