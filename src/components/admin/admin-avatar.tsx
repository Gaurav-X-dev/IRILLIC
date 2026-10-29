"use client";

import Image from "next/image";
import { useState } from "react";

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

/**
 * An administrator's photograph, falling back to their initials.
 *
 * Uploaded avatars live on the server's disk, so the stored path can outlive
 * the file — after a redeploy, or on a host with an ephemeral filesystem. The
 * fallback keeps the topbar intact instead of showing a broken image.
 */
export function AdminAvatar({
  name,
  avatar,
  size = 32,
  className = "",
}: {
  name: string;
  avatar: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const show = avatar && !failed;

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg bg-ad-accent font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {show ? (
        <Image
          src={avatar}
          alt=""
          width={size * 2}
          height={size * 2}
          sizes={`${size}px`}
          // Uploads are already 512x512 WebP from sharp, so the optimiser has
          // nothing left to do and only adds a way for this to fail.
          unoptimized
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
