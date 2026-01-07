import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

export default async function PastePage({ params }) {
  const { id } = await params;
  const key = `paste:${id}`;

  // Fetch the hash
  const paste = await redis.hgetall(key);

  // If paste doesn't exist
  if (!paste || !paste.content) notFound();

  const now = Date.now();

  // Check TTL
  const expiresAt = paste.expires_at ? Number(paste.expires_at) : null;
  if (expiresAt && now >= expiresAt) {
    // Delete expired paste
    await redis.del(key);
    notFound();
  }

  // Atomically increment views
  const views = await redis.hincrby(key, "views", 1);

  const maxViews = paste.max_views ? Number(paste.max_views) : null;
  if (maxViews && views > maxViews) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Paste</h1>
      <pre className="bg-gray-900 text-green-200 p-4 rounded whitespace-pre-wrap">
        {paste.content}
      </pre>
    </main>
  );
}
