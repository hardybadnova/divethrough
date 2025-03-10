
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentProps<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "relative shrink-0",
        orientation === "horizontal" 
          ? "h-[1px] w-full before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-betster-700/60 before:to-transparent after:absolute after:inset-0 after:animate-pulse after:bg-gradient-to-r after:from-transparent after:via-betster-600/20 after:to-transparent after:opacity-70 after:blur-sm" 
          : "h-full w-[1px] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-betster-700/60 before:to-transparent after:absolute after:inset-0 after:animate-pulse after:bg-gradient-to-b after:from-transparent after:via-betster-600/20 after:to-transparent after:opacity-70 after:blur-sm",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
