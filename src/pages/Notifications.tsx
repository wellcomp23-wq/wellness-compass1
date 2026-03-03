import { useState } from "react"
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
  ArrowRight,
  Inbox,
  Clock
} from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { motion, AnimatePresence } from "framer-motion"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const { notifications, loading, markAsRead, deleteNotification, unreadCount } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return { icon: Calendar, color: "bg-blue-50 text-blue-600", label: "موعد" }
      case 'medication': return { icon: Pill, color: "bg-orange-50 text-orange-600", label: "دواء" }
      case 'lab_result': return { icon: FileText, color: "bg-emerald-50 text-emerald-600", label: "نتيجة" }
      default: return { icon: Bell, color: "bg-primary/10 text-primary", label: "إشعار" }
    }
  }

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => n.type === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-8 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 text-right">الإشعارات</h1>
              <p className="text-xs text-muted-foreground font-bold text-right">ابقَ على اطلاع بكل جديد</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => notifications.forEach(n => !n.is_read && markAsRead(n.id))} className="rounded-xl font-black h-10 px-4 border-primary/20 text-primary hover:bg-primary/5">
              <Check className="w-4 h-4 ml-2" />
              تحديد الكل
            </Button>
          )}
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 space-y-6">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-row-reverse">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'appointment', label: 'المواعيد' },
            { id: 'medication', label: 'الأدوية' },
            { id: 'lab_result', label: 'النتائج' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`rounded-2xl px-6 h-10 font-black text-xs transition-all whitespace-nowrap ${
                filter === cat.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => {
                const { icon: Icon, color, label } = getIcon(notification.type)
                return (
                  <motion.div 
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-[2rem] border p-6 transition-all ${
                      notification.is_read 
                        ? 'border-slate-50 opacity-80' 
                        : 'border-primary/10 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-5 flex-row-reverse">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color} shadow-inner`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 flex-row-reverse">
                          <h3 className="font-black text-slate-800 text-sm truncate text-right">{notification.title}</h3>
                          {!notification.is_read && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-slate-500 font-bold mb-4 leading-relaxed line-clamp-2 text-right">{notification.message}</p>
                        <div className="flex items-center justify-between flex-row-reverse">
                          <div className="flex items-center gap-3 flex-row-reverse">
                             <Badge variant="secondary" className="bg-slate-50 text-slate-500 hover:bg-slate-100 border-none px-3 py-1 rounded-lg font-black text-[10px]">{label}</Badge>
                             <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               {new Date(notification.created_at).toLocaleDateString('ar')}
                             </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-emerald-50 hover:text-emerald-600" onClick={() => markAsRead(notification.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => deleteNotification(notification.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-slate-50 shadow-sm">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <Inbox className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black text-lg">صندوق الإشعارات فارغ</p>
              <p className="text-xs text-slate-400 font-bold mt-2">سنخطرك فور وجود أي تحديثات جديدة</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
