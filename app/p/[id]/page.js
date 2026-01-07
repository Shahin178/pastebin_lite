import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

export default async function PastePage({ params }) {
  const { id } = await params;
  const key = `paste:${id}`;

  const paste = await redis.get(key);
  if (!paste) notFound();

  // Expiry check
  if (paste.expires_at && Date.now() >= paste.expires_at) {
    await redis.del(key);
    notFound();
  }

  // View limit check
  if (paste.max_views !== null && paste.views >= paste.max_views) {
    notFound();
  }

  // ✅ Increment views safely
  paste.views += 1;
  await redis.set(key, paste);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Paste</h1>
      <pre className="bg-gray-900 text-green-200 p-4 rounded whitespace-pre-wrap">
        {paste.content}
      </pre>
    </main>
  );
}
