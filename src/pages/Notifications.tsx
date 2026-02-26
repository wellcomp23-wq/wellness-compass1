import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Calendar, 
  Pill, 
  FileText, 
  Trash2, 
  Check,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/hooks/useNotifications"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [filter, setFilter] = useState("all")
  
  const { notifications, loading, error, markAsRead, deleteNotification } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': 
        return { icon: Calendar, color: "bg-blue-50 text-blue-600", label: "موعد" }
      case 'medication': 
        return { icon: Pill, color: "bg-orange-50 text-orange-600", label: "دواء" }
      case 'lab_result': 
        return { icon: FileText, color: "bg-green-50 text-green-600", label: "نتيجة" }
      case 'POST':
        return { icon: Bell, color: "bg-purple-50 text-purple-600", label: "إشعار" }
      default: 
        return { icon: Bell, color: "bg-primary/5 text-primary", label: "إشعار" }
    }
  }

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">الإشعارات</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل الإشعارات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">الإشعارات</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => notifications.forEach(n => !n.is_read && markAsRead(n.id))}
            >
              <Check className="w-3 h-3 ml-2" />
              تحديد الكل
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'appointment', label: 'المواعيد' },
            { id: 'medication', label: 'الأدوية' },
            { id: 'lab_result', label: 'النتائج' },
            { id: 'POST', label: 'الإشعارات' }
          ].map(cat => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat.id)}
              className="rounded-full text-xs whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const { icon: Icon, color, label } = getIcon(notification.type)
              return (
                <div 
                  key={notification.id}
                  className={`bg-white rounded-2xl border p-4 transition-all ${
                    notification.is_read 
                      ? 'border-primary/5 opacity-75' 
                      : 'border-primary/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-sm">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString('ar')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">لا توجد إشعارات</p>
            <p className="text-xs text-muted-foreground">ستظهر الإشعارات هنا عند وجود تحديثات</p>
          </div>
        )}
      </div>
    </div>
  )
}
