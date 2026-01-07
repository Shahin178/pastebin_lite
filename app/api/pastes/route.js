import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";

export async function POST(req) {
  const body = await req.json().catch(() => null);

  if (
    !body?.content ||
    typeof body.content !== "string" ||
    !body.content.trim()
  ) {
    return Response.json({ error: "Invalid content" }, { status: 400 });
  }

  if (
    body.ttl_seconds !== undefined &&
    (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1)
  ) {
    return Response.json({ error: "Invalid ttl_seconds" }, { status: 400 });
  }

  if (
    body.max_views !== undefined &&
    (!Number.isInteger(body.max_views) || body.max_views < 1)
  ) {
    return Response.json({ error: "Invalid max_views" }, { status: 400 });
  }

  const id = nanoid(8);
  const createdAt = Date.now();
  const expiresAt = body.ttl_seconds
    ? createdAt + body.ttl_seconds * 1000
    : null;

  await redis.set(
    `paste:${id}`,
    JSON.stringify({
      id,
      content: body.content,
      created_at: createdAt,
      expires_at: expiresAt,
      max_views: body.max_views ?? null,
      views: 0,
    })
  );

  return Response.json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`,
  });
}
