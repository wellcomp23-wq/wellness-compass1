import { Link, useLocation } from "react-router-dom"
import {
  Home,
  FileText,
  Brain,
  Calendar,
  Pill,
  Stethoscope,
  Building2,
  Users,
  Bell,
  HelpCircle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: Home, label: "الرئيسية", path: "/" },
  { icon: FileText, label: "ملفي الصحي", path: "/profile" },
  { icon: Brain, label: "محلل الأعراض", path: "/symptom-checker" },
  { icon: Calendar, label: "مواعيدي", path: "/appointments" },
  { icon: Pill, label: "أدويتي", path: "/medications" },
  { icon: Stethoscope, label: "الأطباء", path: "/doctors" },
  { icon: Building2, label: "الصيدليات", path: "/pharmacies" },
  { icon: Users, label: "المجتمعات", path: "/community" },
  { icon: Bell, label: "الإشعارات", path: "/notifications" },
  { icon: HelpCircle, label: "الدعم الفني", path: "/support" },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-72 bg-card border-l border-border z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0 lg:static lg:z-0"
        )}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary">بوصلة العافية</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
