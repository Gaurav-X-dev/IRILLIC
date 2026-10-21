"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface GalleryView {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
}

/** Product hero gallery: main stage with cross-fading views and thumbnail switcher. */
export function ProductGallery({ views }: { views: GalleryView[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="gallery reveal">
      <div className="gallery__main">
        {views.map((v, i) => (
          <Image
            key={v.src}
            className={cn(i === active && "is-active")}
            src={v.src}
            alt={v.alt}
            width={v.width}
            height={v.height}
            priority={i === 0}
            unoptimized
          />
        ))}
      </div>
      <div className="gallery__thumbs" role="group" aria-label="Product views">
        {views.map((v, i) => (
          <button key={v.src} type="button" aria-pressed={i === active} onClick={() => setActive(i)}>
            <Image src={v.src} alt="" width={v.width} height={v.height} unoptimized />
            <span>{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
