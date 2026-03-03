import { Link, useLocation } from "react-router-dom"
import { 
  Home, 
  User, 
  Calendar, 
  Users,
  Search,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomTabBar() {
  const location = useLocation()
  
  const tabs = [
    { href: "/home", icon: Home, label: "الرئيسية" },
    { href: "/symptom-checker", icon: Activity, label: "المحلل" },
    { href: "/appointments", icon: Calendar, label: "مواعيدي" },
    { href: "/community", icon: Users, label: "المجتمع" },
    { href: "/profile", icon: User, label: "حسابي" },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-primary/5 pb-safe px-2">
      <div className="flex items-center justify-around h-20">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded-2xl transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 scale-110 shadow-sm" : "bg-transparent"
              )}>
                <tab.icon className={cn("w-5 h-5", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
              </div>
              <span className={cn(
                "text-[9px] font-black transition-all",
                isActive ? "opacity-100 translate-y-0" : "opacity-80"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-primary rounded-full animate-in slide-in-from-top-1" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
