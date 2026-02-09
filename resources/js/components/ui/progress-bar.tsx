import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "h-full w-full flex-1 bg-primary transition-all",
  {
    variants: {
      variant: {
        default: "bg-slate-900 dark:bg-slate-100",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
        info: "bg-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  color?: "default" | "success" | "warning" | "danger" | "info"
}

const ProgressBar = React.forwardRef<
  HTMLDivElement,
  ProgressBarProps
>(({ className, value, max = 100, color = "default", ...props }, ref) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      {...props}
    >
      <div
        className={cn(progressVariants({ variant: color }))}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
})
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }

