import { Bell, Check, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDoctorNotifications } from "@/hooks/useDoctorNotifications"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useDoctorNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/5">
          <Bell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl border-primary/10 shadow-xl" align="end">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-sm">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] h-7 text-primary hover:bg-primary/5"
              onClick={markAllAsRead}
            >
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.notification_id}
                className={`p-4 border-b border-gray-50 last:border-0 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''}`}
                onClick={() => markAsRead(notification.notification_id)}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notification.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <p className="text-xs text-gray-800 leading-relaxed">{notification.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ar })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t border-gray-50">
          <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground hover:text-primary">
            عرض جميع الإشعارات
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
