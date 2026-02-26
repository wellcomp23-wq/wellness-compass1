import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert } from '@/integrations/supabase/types'

type Notification = Tables<'notifications'>
type NotificationInsert = TablesInsert<'notifications'>

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', userId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setNotifications(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب الإشعارات')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async (notification: NotificationInsert) => {
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (err) throw err
      setNotifications([data, ...notifications])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء الإشعار')
      return null
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('notification_id', id)
        .select()
        .single()

      if (err) throw err
      setNotifications(notifications.map(n => n.notification_id === id ? data : n))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث الإشعار')
      return null
    }
  }

  const getUnreadCount = () => {
    return notifications.filter(n => !n.is_read).length
  }

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    markAsRead,
    getUnreadCount
  }
}
