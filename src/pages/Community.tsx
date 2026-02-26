import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  MessageSquare,
  Plus,
  Search,
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
  Clock,
  ThumbsUp,
  Loader2,
  AlertCircle,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client"

interface Post {
  post_id: string
  author_id: string
  author_name?: string
  content: string
  created_at: string
  likes_count?: number
  comments_count?: number
  community_id?: string
}

export default function Community() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)

      const { data: postsData, error: postsErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (postsErr) throw postsErr
      setPosts(postsData || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError("فشل في جلب المنشورات")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({ title: "تنبيه", description: "الرجاء كتابة محتوى المنشور", variant: "destructive" })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: newPostContent,
          is_anonymous: false
        })

      if (error) throw error

      setNewPostContent("")
      toast({ title: "نجاح", description: "تم نشر المنشور بنجاح" })
      fetchPosts()
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في نشر المنشور", variant: "destructive" })
    }
  }

  const handleLikePost = async (postId: string) => {
    // Note: The 'posts' table doesn't have a likes_count column in the schema provided.
    // This would normally be handled by a separate 'likes' table.
    // For now, we'll just simulate it or toast that it's coming soon.
    toast({ title: "قريباً", description: "ميزة الإعجاب ستكون متاحة قريباً" })
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('post_id', postId)

      if (error) throw error

      setPosts(prev => prev.filter(p => p.post_id !== postId))
      toast({ title: "نجاح", description: "تم حذف المنشور بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف المنشور", variant: "destructive" })
    }
  }

  const filteredPosts = (posts || []).filter(p => 
    p.content && p.content.includes(searchQuery)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-bold">جاري تحميل المجتمع...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-6 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
               <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="text-lg font-black">المجتمع الصحي</h1>
               <p className="text-xs text-muted-foreground font-bold">تبادل الخبرات والدعم</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منشور..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-2xl bg-accent/30 border-primary/10 shadow-sm"
          />
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* New Post Section */}
        <div className="bg-white rounded-[2rem] border border-primary/5 p-6 shadow-sm mb-6">
          <h3 className="font-black text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            شارك تجربتك
          </h3>
          <Textarea
            placeholder="ما الذي تود مشاركته مع المجتمع؟"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="rounded-xl border-primary/10 mb-4 resize-none h-24"
          />
          <div className="flex gap-2">
            <Button className="flex-1 rounded-xl h-11 font-bold gap-1 bg-primary hover:bg-primary/90" onClick={handleCreatePost}>
              <Plus className="w-4 h-4" />
              نشر المنشور
            </Button>
            <Button variant="outline" className="rounded-xl h-11 font-bold" onClick={() => setNewPostContent("")}>إلغاء</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-primary/5 rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="all" className="rounded-xl font-bold">الكل</TabsTrigger>
            <TabsTrigger value="health" className="rounded-xl font-bold">صحة</TabsTrigger>
            <TabsTrigger value="support" className="rounded-xl font-bold">دعم</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts List */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.post_id} className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm hover:shadow-md transition-all">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{post.author_name || "مستخدم"}</h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString('ar')}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl" className="rounded-2xl">
                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                      <AlertDialogDescription>هل أنت متأكد من حذف هذا المنشور؟</AlertDialogDescription>
                      <div className="flex gap-3 justify-end mt-4">
                        <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePost(post.post_id)} className="bg-red-600 hover:bg-red-700 rounded-xl">حذف</AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Post Content */}
                <p className="text-sm text-foreground mb-4 leading-relaxed">{post.content}</p>

                {/* Post Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-primary/5">
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.comments_count || 0}
                    </span>
                  </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-lg h-8 gap-1 text-[10px] font-bold", likedPosts.includes(post.post_id) ? "text-red-500" : "text-muted-foreground")}
                    onClick={() => handleLikePost(post.post_id)}
                  >
                    <Heart className={cn("w-3 h-3", likedPosts.includes(post.post_id) && "fill-current")} />
                    إعجاب
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-primary/20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold">لا توجد منشورات حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}
