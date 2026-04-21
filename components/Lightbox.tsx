"use client";

import Image from "next/image";
import { Artwork } from "@/types/types";
import Modal from "./Modal";

interface LightboxProps {
  artwork: Artwork;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function Lightbox({
  artwork,
  onClose,
  onDelete,
  onEdit,
}: LightboxProps) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col lg:flex-row items-center gap-8 max-w-6xl w-full max-h-full">
        <div className="relative flex-1 w-full max-h-[75vh] flex items-center justify-center">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            width={1400}
            height={1000}
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-sm"
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority
          />
        </div>

        <div className="flex flex-col shrink-0 text-left items-start gap-2">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">
            {artwork.year}
          </p>

          <h2 className="text-xl font-medium text-neutral-100">
            {artwork.title}
          </h2>

          <p className="text-sm text-neutral-400 leading-relaxed">
            {artwork.description}
          </p>

          <div className="flex flex-col gap-1 items-start">
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                aria-label={`Delete ${artwork.title}`}
              >
                Delete
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-xs text-neutral-500 hover:text-neutral-100 transition-colors"
                aria-label={`Edit ${artwork.title}`}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
