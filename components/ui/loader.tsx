import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function Loader({ className, size = "md", text }: LoaderProps) {
  const sizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  }

  const gaps = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("flex items-center", gaps[size])}>
        <div
          className={cn(
            sizes[size],
            "bg-primary rounded-full animate-pulse"
          )}
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <div
          className={cn(
            sizes[size],
            "bg-primary rounded-full animate-pulse"
          )}
          style={{ animationDelay: "150ms", animationDuration: "1000ms" }}
        />
        <div
          className={cn(
            sizes[size],
            "bg-primary rounded-full animate-pulse"
          )}
          style={{ animationDelay: "300ms", animationDuration: "1000ms" }}
        />
      </div>
      {text && (
        <p className="text-muted-foreground text-sm mt-3 font-medium">{text}</p>
      )}
    </div>
  )
}
