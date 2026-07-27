"use client";

import Image from "next/image";
import { useState } from "react";

export default function OptimizedGalleryImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const [state, setState] = useState<
    "loading" | "loaded" | "failed"
  >("loading");

  return (
    <>
      {state !== "loaded" && (
        <span
          className={`galleryImagePlaceholder ${state}`}
          role={state === "failed" ? "status" : undefined}
        >
          {state === "failed" ? "Image unavailable" : ""}
        </span>
      )}

      {state !== "failed" && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={76}
          priority={priority}
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
        />
      )}
    </>
  );
}
