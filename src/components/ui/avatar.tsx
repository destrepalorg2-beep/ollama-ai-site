"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar without @radix-ui/react-avatar (not installed): the image hides
 * itself if it fails to load and the fallback shows through underneath.
 */
const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  ),
);
Avatar.displayName = "Avatar";

const AvatarImage = ({ className, alt = "", ...props }: React.ComponentProps<"img">) => {
  const [failed, setFailed] = React.useState(false);
  if (failed || !props.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
};

const AvatarFallback = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground",
      className,
    )}
    {...props}
  />
);

export { Avatar, AvatarImage, AvatarFallback };
