import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MedicalCardProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  variant?: "default" | "primary" | "secondary" | "emergency" | "warning"
  onClick?: () => void
}

export default function MedicalCard({ 
  title, 
  description, 
  icon, 
  children, 
  className,
  variant = "default",
  onClick
}: MedicalCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5"
      case "secondary":
        return "border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary-glow/5"
      case "emergency":
        return "border-emergency/20 bg-gradient-to-br from-emergency/5 to-emergency/10"
      case "warning":
        return "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10"
      default:
        return ""
    }
  }

  return (
    <Card 
      className={cn("medical-card", getVariantStyles(), className, onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <CardContent className="pb-0">
        {children}
      </CardContent>
      <CardHeader className="pt-3">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              variant === "primary" && "bg-primary/10 text-primary",
              variant === "secondary" && "bg-secondary/10 text-secondary", 
              variant === "emergency" && "bg-emergency/10 text-emergency",
              variant === "warning" && "bg-warning/10 text-warning",
              variant === "default" && "bg-accent text-foreground"
            )}>
              {icon}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}