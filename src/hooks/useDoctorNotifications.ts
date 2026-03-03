import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useDoctorNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      setNotifications(data || [])
      setUnreadCount(data?.length || 0)
    }
    fetchNotifications()
  }, [])

  return { notifications, unreadCount, markAsRead: () => {}, markAllAsRead: () => {} }
}
