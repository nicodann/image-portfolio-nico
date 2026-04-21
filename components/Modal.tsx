"use client";

import { useEffect, useCallback } from "react";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-5 text-neutral-400 hover:text-white text-3xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>

      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
