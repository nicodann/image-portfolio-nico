"use client";

import { useState, useRef } from "react";
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
  const [step, setStep] = useState<"profile" | "image">("profile");
  const [savedUser, setSavedUser] = useState<NetlifyUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageFormRef = useRef<HTMLFormElement>(null);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      setSavedUser(updatedUser);
      setStep("image");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setImageError(null);

    const token = getToken();
    if (!token) {
      setImageError("Not authenticated.");
      return;
    }

    const data = new FormData(e.currentTarget);

    setImageLoading(true);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }

      onComplete(savedUser ?? user);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <Modal onClose={onClose} disableClickOutsideClose>
      <div className="bg-neutral-900 rounded-sm p-8 max-w-lg w-full">
        {step === "profile" ? (
          <>
            <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">
              Welcome
            </h2>
            <p className="text-neutral-300 text-sm mb-8">
              Set up your portfolio before you get started. You can always
              change these later in Settings.
            </p>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
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
                  placeholder="e.g. Jane Smith — Portfolio"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-neutral-100 text-neutral-950 text-sm font-medium rounded-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Saving…" : "Continue"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("image")}
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">
              Add your first image
            </h2>
            <p className="text-neutral-300 text-sm mb-8">
              Upload your first piece of artwork to get things going.
            </p>
            <form
              ref={imageFormRef}
              onSubmit={handleImageSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
                  htmlFor="img-title"
                >
                  Title
                </label>
                <input
                  id="img-title"
                  name="title"
                  type="text"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
                  htmlFor="img-year"
                >
                  Year
                </label>
                <input
                  id="img-year"
                  name="year"
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
                  htmlFor="img-description"
                >
                  Description
                </label>
                <textarea
                  id="img-description"
                  name="description"
                  required
                  rows={4}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-sm px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-neutral-400 resize-none"
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-widest text-neutral-400 mb-1"
                  htmlFor="img-file"
                >
                  Image
                </label>
                <input
                  id="img-file"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full text-sm text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                />
              </div>

              {imageError && (
                <p className="text-sm text-red-400">{imageError}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={imageLoading}
                  className="px-5 py-2 bg-neutral-100 text-neutral-950 text-sm font-medium rounded-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {imageLoading ? "Uploading…" : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => onComplete(savedUser ?? user)}
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={() => setStep("profile")}
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {"<- back"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
