"use client";

import { useState } from "react";
import { NetlifyUser } from "@/types/types";
import Modal from "./Modal";

interface SetupModalProps {
  user: NetlifyUser;
  getToken: () => string | null;
  onComplete: (updatedUser: NetlifyUser) => void;
  onClose: () => void;
}

export default function SetupModal({
  user,
  getToken,
  onComplete,
  onClose,
}: SetupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      setError("Not authenticated.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const full_name = (formData.get("full_name") as string).trim();
    const title = (formData.get("title") as string).trim();

    setLoading(true);
    try {
      const [userRes, siteRes] = await Promise.all([
        fetch("/.netlify/identity/user", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: { full_name } }),
        }),
        fetch("/api/upload-site-info", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        }),
      ]);

      if (!userRes.ok) {
        const body = await userRes.json().catch(() => ({}));
        throw new Error(body.msg || `Failed to save name (${userRes.status})`);
      }
      if (!siteRes.ok) {
        const body = await siteRes.json().catch(() => ({}));
        throw new Error(
          body.error || `Failed to save site title (${siteRes.status})`,
        );
      }

      const updatedUser: NetlifyUser = await userRes.json();
      onComplete(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="bg-neutral-900 rounded-sm p-8 max-w-lg w-full">
        <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">
          Welcome
        </h2>
        <p className="text-neutral-300 text-sm mb-8">
          Set up your portfolio before you get started. You can always change
          these later in Settings.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
              htmlFor="full_name"
            >
              Your name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={user.user_metadata?.full_name ?? ""}
              placeholder="e.g. Jane Smith"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label
              className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
              htmlFor="title"
            >
              Site title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Jane Smith — Portfolio"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-neutral-100 text-neutral-950 text-sm font-medium rounded-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving…" : "Get started"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
