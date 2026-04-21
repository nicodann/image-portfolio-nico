"use client";

import { useState } from "react";
import Image from "next/image";
import Masonry from "react-masonry-css";
import Lightbox from "./Lightbox";
import { Artwork } from "@/types/types";
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";

const breakpointCols = {
  default: 4,
  1280: 4,
  1024: 3,
  640: 2,
  0: 1,
};

function DraggableCard({
  children,
  id,
  showHandle,
}: {
  children: React.ReactNode;
  id: number | string;
  showHandle?: boolean;
}) {
  const { ref, handleRef, isDragging } = useDraggable({ id });
  const { ref: dropRef } = useDroppable({ id });

  return (
    <div
      ref={ref}
      className={`relative transition-opacity ${isDragging ? "opacity-30" : "opacity-100"}`}
    >
      {showHandle && (
        <button
          ref={handleRef}
          className="absolute top-2 left-2 z-10 cursor-grab text-neutral-400 hover:text-neutral-100 leading-none select-none"
        >
          ⠿
        </button>
      )}
      <div ref={dropRef}>{children}</div>
    </div>
  );
}

export default function MasonryGrid({
  artwork,
  onDelete,
  onEdit,
  onReorder,
}: {
  artwork: Artwork[];
  onDelete?: (artwork: Artwork) => void;
  onEdit?: (artwork: Artwork) => void;
  onReorder?: (reordered: Artwork[]) => void;
}) {
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const activeArtwork = artwork.find((a) => a.id === activeId) ?? null;

  if (artwork.length === 0) {
    return (
      <p className="text-center text-neutral-500 mt-24 text-sm tracking-widest uppercase">
        No works yet
      </p>
    );
  }

  return (
    <DragDropProvider
      onDragStart={(e) => {
        setActiveId(e.operation.source?.id ?? null);
      }}
      onDragEnd={(e) => {
        setActiveId(null);
        if (e.canceled) return;

        const sourceId = e.operation.source?.id;
        const targetId = e.operation.target?.id;

        if (!sourceId || !targetId || sourceId === targetId) return;

        const oldIndex = artwork.findIndex((a) => a.id === sourceId);
        const newIndex = artwork.findIndex((a) => a.id === targetId);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = [...artwork];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        onReorder?.(reordered);
      }}
    >
      <Masonry
        breakpointCols={breakpointCols}
        className="flex gap-4 px-4 pt-4"
        columnClassName="flex flex-col gap-4"
      >
        {artwork.map((item, index) => (
          <DraggableCard
            key={item.id}
            id={item.id}
            showHandle={!!onReorder}
            // isDragging={item.id === activeId}
          >
            <div
              className="w-full text-left group relative block overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setSelected(item)}
            >
              <div className="relative w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-80"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index < 4}
                />
              </div>
              <div className="pt-2 pb-1">
                <div className="flex flex-col">
                  <div className="flex justify-between w-full items-baseline">
                    <p className="text-sm font-medium text-neutral-100 leading-snug">
                      {item.title}
                    </p>
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                        aria-label={`Delete ${item.title}`}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between w-full">
                    <p className="text-xs text-neutral-500">{item.year}</p>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="text-xs text-neutral-500 hover:text-neutral-100 transition-colors"
                        aria-label={`Edit ${item.title}`}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DraggableCard>
        ))}
      </Masonry>

      <DragOverlay>
        {activeArtwork && (
          <div className="opacity-90 shadow-2xl rounded-sm overflow-hidden rotate-1">
            <Image
              src={activeArtwork.imageUrl}
              alt={activeArtwork.title}
              width={400}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </DragOverlay>

      {selected && (
        <Lightbox
          artwork={selected}
          onClose={() => setSelected(null)}
          onDelete={
            onDelete
              ? () => {
                  onDelete(selected);
                  setSelected(null);
                }
              : undefined
          }
          onEdit={onEdit ? () => onEdit(selected) : undefined}
        />
      )}
    </DragDropProvider>
  );
}
