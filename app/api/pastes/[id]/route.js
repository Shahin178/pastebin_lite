import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { getNow } from "@/lib/time";

export async function GET(req, { params }) {
  const { id } = await params; // ✅ FIXED
  const key = `paste:${id}`;

  const paste = await redis.hgetall(key);

  if (!paste || !paste.content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = getNow(req);

  if (paste.expires_at && now >= Number(paste.expires_at)) {
    await redis.del(key);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (paste.max_views && Number(paste.views) >= Number(paste.max_views)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ✅ atomic increment
  const views = await redis.hincrby(key, "views", 1);

  const remaining =
    paste.max_views === ""
      ? null
      : Math.max(0, Number(paste.max_views) - views);

  return NextResponse.json({
    content: paste.content,
    remaining_views: remaining,
    expires_at: paste.expires_at
      ? new Date(Number(paste.expires_at)).toISOString()
      : null,
  });
}
