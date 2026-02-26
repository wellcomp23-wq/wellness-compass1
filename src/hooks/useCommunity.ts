import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useCommunity() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      // في البداية، سنجلب من جدول notifications كمثال
      // يمكن إنشاء جدول منفصل للمنشورات لاحقاً
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (err) throw err
      setPosts(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب المنشورات')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('لم يتم العثور على المستخدم')

      const { data, error: err } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'منشور جديد',
          message: content,
          type: 'POST'
        })
        .select()

      if (err) throw err
      await fetchPosts()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء المنشور')
      return null
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost
  }
}
