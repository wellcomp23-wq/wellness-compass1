import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useNotifications(providedUserId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      let userId = providedUserId
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      
      if (userId) {
        fetchNotifications(userId)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [providedUserId])

  const fetchNotifications = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId) // Using user_id as per standard schema
        .order('created_at', { ascending: false })

      if (err) {
        // Fallback to recipient_user_id if user_id fails
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_user_id', userId)
          .order('created_at', { ascending: false })
        
        if (fallbackErr) throw fallbackErr
        setNotifications(fallbackData || [])
      } else {
        setNotifications(data || [])
      }
      setError(null)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError(err instanceof Error ? err.message : 'فشل في جلب الإشعارات')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .match({ id: id }) // Use match to be safe with field names

      if (err) throw err
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error("Error marking as read:", err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .delete()
        .match({ id: id })

      if (err) throw err
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  return {
    notifications,
    loading,
    error,
    markAsRead,
    deleteNotification,
    unreadCount: notifications.filter(n => !n.is_read).length
  }
}
