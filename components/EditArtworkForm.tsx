"use client";

import { useState, useRef } from "react";
import { Artwork } from "@/types/types";

interface EditArtworkFormProps {
  artwork: Artwork;
  getToken: () => string | null;
  onSuccess: (updated: Artwork) => void;
}

type Status = { type: "success" | "error"; message: string } | null;

export default function EditArtworkForm({
  artwork,
  getToken,
  onSuccess,
}: EditArtworkFormProps) {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    const token = getToken();
    if (!token) {
      setStatus({ type: "error", message: "Not authenticated." });
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("id", artwork.id);
    data.set("oldImageUrl", artwork.imageUrl);

    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/edit-artwork", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Edit failed (${res.status})`);
      }

      const updated: Artwork = await res.json();
      setStatus({ type: "success", message: "Artwork updated successfully." });
      onSuccess(updated);
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label
          className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
          htmlFor="edit-title"
        >
          Title
        </label>
        <input
          id="edit-title"
          name="title"
          type="text"
          required
          defaultValue={artwork.title}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400"
        />
      </div>

      <div>
        <label
          className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
          htmlFor="edit-year"
        >
          Year
        </label>
        <input
          id="edit-year"
          name="year"
          type="number"
          required
          min={1900}
          max={2100}
          defaultValue={artwork.year}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400"
        />
      </div>

      <div>
        <label
          className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
          htmlFor="edit-description"
        >
          Description
        </label>
        <textarea
          id="edit-description"
          name="description"
          required
          rows={4}
          defaultValue={artwork.description}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400 resize-none"
        />
      </div>

      <div>
        <label
          className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
          htmlFor="edit-image"
        >
          Replace image <span className="normal-case text-neutral-600">(optional)</span>
        </label>
        <input
          id="edit-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
        />
      </div>

      {status && (
        <p
          className={`text-sm ${
            status.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 bg-neutral-100 text-neutral-950 text-sm font-medium rounded-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
