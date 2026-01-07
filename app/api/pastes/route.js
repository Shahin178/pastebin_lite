import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getNow } from "@/lib/time";

export async function POST(req) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, ttl_seconds, max_views } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return NextResponse.json(
      { error: "ttl_seconds must be >= 1" },
      { status: 400 }
    );
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return NextResponse.json(
      { error: "max_views must be >= 1" },
      { status: 400 }
    );
  }

  const id = nanoid(8);
  const now = getNow(req); 
  const expiresAt = ttl_seconds ? now + ttl_seconds * 1000 : "";

  await redis.hset(`paste:${id}`, {
    content,
    created_at: now,
    expires_at: expiresAt,
    max_views: max_views ?? "",
    views: 0,
  });

  return NextResponse.json({
    id,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/p/${id}`,
  });
}
