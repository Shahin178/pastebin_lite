import { redis } from "@/lib/redis";

function now(req) {
  if (process.env.TEST_MODE === "1") {
    const h = req.headers.get("x-test-now-ms");
    if (h) return Number(h);
  }
  return Date.now();
}

export async function GET(req, { params }) {
  const raw = await redis.get(`paste:${params.id}`);
  if (!raw) return Response.json({ error: "Not found" }, { status: 404 });

  const paste = JSON.parse(raw);
  const current = now(req);

  if (paste.expires_at && current >= paste.expires_at) {
    return Response.json({ error: "Expired" }, { status: 404 });
  }

  if (paste.max_views && paste.views >= paste.max_views) {
    return Response.json({ error: "View limit exceeded" }, { status: 404 });
  }

  paste.views += 1;
  await redis.set(`paste:${params.id}`, JSON.stringify(paste));

  return Response.json({
    content: paste.content,
    remaining_views: paste.max_views
      ? Math.max(paste.max_views - paste.views, 0)
      : null,
    expires_at: paste.expires_at
      ? new Date(paste.expires_at).toISOString()
      : null,
  });
}
