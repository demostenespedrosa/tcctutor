import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-slate-200 bg-[#fcfcfd] px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-[#fcfcfd] px-4 py-3 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-[13px] font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-800", className)}
      {...props}
    />
  )
)
Label.displayName = "Label"

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded flex-shrink-0 px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
      {
        "border border-transparent bg-blue-100 text-blue-700": variant === "default",
        "border border-transparent bg-slate-100 text-slate-900": variant === "secondary",
        "border border-transparent bg-red-100 text-red-700": variant === "destructive",
        "text-slate-950 border border-slate-200": variant === "outline",
        "border border-transparent bg-emerald-100 text-emerald-700": variant === "success",
        "border border-transparent bg-amber-100 text-amber-700": variant === "warning",
      },
      className
    )} {...props} />
  )
}

export { Input, Textarea, Label, Badge }
