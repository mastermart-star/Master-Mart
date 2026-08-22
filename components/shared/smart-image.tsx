"use client";

import Image from "next/image";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * next/image for remote URLs; a plain <img> for base64 data-URLs
 * (the Cloudinary-less upload fallback stores images as data URLs).
 */
export function SmartImage({ src, alt, className, sizes, priority }: SmartImageProps) {
  if (src.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 50vw, 33vw"}
      className={className}
      priority={priority}
    />
  );
}
