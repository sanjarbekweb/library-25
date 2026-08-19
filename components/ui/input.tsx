import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-input bg-background/80 px-3.5 py-1.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 ease-out hover:border-foreground/20 hover:bg-background focus-visible:border-brand-blue focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-brand-blue/15 focus-visible:-translate-y-0.5 focus-visible:shadow-[0_0_0_1px_rgba(29,97,255,0.2),0_2px_12px_-2px_rgba(29,97,255,0.18)] dark:bg-input/20 dark:hover:bg-input/40 dark:focus-visible:border-brand-blue dark:focus-visible:bg-background/90 dark:focus-visible:ring-brand-blue/25 dark:focus-visible:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_16px_rgba(59,130,246,0.22)] file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 aria-invalid:shadow-none dark:aria-invalid:border-destructive/80 dark:aria-invalid:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
}

export { Input }
