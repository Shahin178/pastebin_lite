"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function createPaste() {
    setError("");
    const res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        ttl_seconds: ttl ? Number(ttl) : undefined,
        max_views: views ? Number(views) : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setUrl(data.url);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pastebin Lite</h1>

      <textarea
        className="w-full border p-3 rounded mb-4"
        rows="8"
        placeholder="Enter paste content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex gap-4 mb-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="TTL (seconds)"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Max Views"
          value={views}
          onChange={(e) => setViews(e.target.value)}
        />
      </div>

      <button
        onClick={createPaste}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Paste
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {url && (
        <p className="mt-4">
          Share URL:{" "}
          <a className="text-blue-600 underline" href={url}>
            {url}
          </a>
        </p>
      )}
    </main>
  );
}
