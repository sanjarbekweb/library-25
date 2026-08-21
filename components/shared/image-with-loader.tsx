"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithLoaderProps extends Omit<ImageProps, "onLoad" | "onError"> {
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
}

export function ImageWithLoader({
  src,
  alt,
  className,
  containerClassName,
  fallbackIcon,
  loading,
  priority,
  ...props
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Default lazy loading unless priority is true
  const effectiveLoading = priority ? "eager" : loading || "lazy";

  if (hasError || !src) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-3 text-center w-full h-full bg-brand-blue/5 text-muted-foreground",
          containerClassName
        )}
      >
        {fallbackIcon || <BookOpen className="h-8 w-8 text-brand-blue/60" />}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
      {/* Zero-CLS Skeleton Shimmer Loader */}
      {isLoading && (
        <div className="absolute inset-0 z-10 skeleton-shimmer flex items-center justify-center bg-muted/80">
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue/70" />
        </div>
      )}

      {/* Next.js Lazy-Loaded Image */}
      <Image
        src={src}
        alt={alt}
        loading={effectiveLoading}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={cn(
          "transition-opacity duration-300 ease-out",
          isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100",
          className
        )}
        {...props}
      />
    </div>
  );
}
