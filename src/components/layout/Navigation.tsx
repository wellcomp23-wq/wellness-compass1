import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Heart, 
  Menu, 
  User, 
  Calendar, 
  Pill, 
  MapPin, 
  UserPlus, 
  ShieldAlert,
  Users,
  Search,
  LogOut,
  Stethoscope,
  Building2,
  TestTube2,
  HelpCircle,
  Bell,
  FileText,
  Hospital
} from "lucide-react"

interface NavigationProps {
  userRole?: "patient" | "doctor" | "pharmacy" | "lab" | "hospital" | "admin"
  userName?: string
}

export default function Navigation({ userRole = "patient", userName }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const getMenuItems = () => {
    switch (userRole) {
      case "patient":
        return [
          { href: "/", icon: Heart, label: "الرئيسية" },
          { href: "/profile", icon: User, label: "ملفي الصحي" },
          { href: "/symptom-checker", icon: Search, label: "محلل الأعراض" },
          { href: "/appointments", icon: Calendar, label: "مواعيدي" },
          { href: "/medications", icon: Pill, label: "أدويتي" },
          { href: "/doctors", icon: Stethoscope, label: "البحث عن طبيب" },
          { href: "/pharmacies", icon: Building2, label: "الصيدليات" },
          { href: "/labs", icon: TestTube2, label: "المختبرات" },
          { href: "/notifications", icon: Bell, label: "الإشعارات" },
          { href: "/community", icon: Users, label: "المجتمعات" },
          { href: "/support", icon: HelpCircle, label: "الدعم الفني" },
        ]
      case "doctor":
        return [
          { href: "/doctor/profile", icon: User, label: "الملف المهني" },
          { href: "/doctor/appointments", icon: Calendar, label: "المواعيد" },
          { href: "/doctor/patients", icon: Users, label: "الملفات الصحية" },
          { href: "/doctor/labs", icon: TestTube2, label: "المختبرات" },
          { href: "/doctor-dashboard", icon: Bell, label: "الإشعارات" },
        ]
      case "pharmacy":
        return [
          { href: "/pharmacy/profile", icon: Building2, label: "ملف الصيدلية" },
          { href: "/pharmacy/orders", icon: Pill, label: "طلبات الأدوية" },
          { href: "/pharmacy-dashboard", icon: Bell, label: "الإشعارات" },
          { href: "/pharmacy/support", icon: HelpCircle, label: "الدعم الفني" },
        ]
      case "lab":
        return [
          { href: "/lab-dashboard", icon: TestTube2, label: "ملف المختبر" },
          { href: "/lab-dashboard", icon: FileText, label: "إدارة الفحوصات" },
          { href: "/lab-dashboard", icon: FileText, label: "رفع النتائج" },
          { href: "/notifications", icon: Bell, label: "الإشعارات" },
          { href: "/support", icon: HelpCircle, label: "الدعم الفني" },
        ]
      case "hospital":
        return [
          { href: "/hospital-dashboard", icon: Hospital, label: "ملف المستشفى" },
          { href: "/hospital-dashboard", icon: Users, label: "الارتباطات" },
          { href: "/notifications", icon: Bell, label: "الإشعارات" },
          { href: "/support", icon: HelpCircle, label: "الدعم الفني" },
        ]
      case "admin":
        return [
          { href: "/admin", icon: ShieldAlert, label: "لوحة التحكم" },
          { href: "/notifications", icon: Bell, label: "الإشعارات" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-10 h-10 rounded-full gradient-healing flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block gradient-text">بوصلة العافية</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "medical" : "ghost"}
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link to={item.href}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {userName && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-sm">
                <div className="w-8 h-8 rounded-full gradient-healing flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs">مرحباً</p>
                  <p className="font-semibold">{userName}</p>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground" 
              asChild
            >
              <Link to="/login">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Link>
            </Button>

            {/* Mobile Menu - For all roles */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                    <div className="w-10 h-10 rounded-full gradient-healing flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">بوصلة العافية</div>
                      {userName && (
                        <div className="text-sm text-muted-foreground">{userName}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {menuItems.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <Button
                          key={item.href}
                          variant={isActive ? "medical" : "ghost"}
                          className="justify-start gap-3 h-12"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link to={item.href}>
                            <item.icon className="w-5 h-5" />
                            {item.label}
                          </Link>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}