"use client";

import { useState } from "react";
import { NetlifyUser } from "@/types/types";

interface UserSettingsFormProps {
  user: NetlifyUser;
  getToken: () => string | null;
  onSuccess: (updatedUser: NetlifyUser) => void;
}

type Status = { type: "success" | "error"; message: string } | null;

export default function UserSettingsForm({
  user,
  getToken,
  onSuccess,
}: UserSettingsFormProps) {
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    const token = getToken();
    if (!token) {
      setStatus({ type: "error", message: "Not authenticated." });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const full_name = (formData.get("full_name") as string).trim();

    setLoading(true);
    try {
      const res = await fetch("/.netlify/identity/user", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { full_name } }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.msg || `Update failed (${res.status})`);
      }

      const updatedUser: NetlifyUser = await res.json();
      setStatus({ type: "success", message: "Settings saved." });
      onSuccess(updatedUser);
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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label
          className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
          htmlFor="full_name"
        >
          Display name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={user.user_metadata?.full_name ?? ""}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">
          Email
        </label>
        <p className="text-sm text-neutral-500">{user.email}</p>
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
