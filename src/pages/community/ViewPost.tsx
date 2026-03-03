import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  MoreVertical, 
  Send,
  User,
  Clock,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  time: string;
  likes: number;
}

const postData = {
  id: "p1",
  author: {
    name: "مستخدم مجهول",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anon",
    role: "مريض",
    isAnonymous: true
  },
  content: "هل هناك نصائح للتعامل مع نوبات القلق المفاجئة أثناء العمل؟ بدأت أشعر بها مؤخراً وأحتاج لمساعدة.",
  likes: 24,
  comments: [
    {
      id: "c1",
      author: {
        name: "د. أحمد سامي",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
        role: "طبيب نفسي"
      },
      content: "أهلاً بك. أهم خطوة هي 'التنفس العميق' (Deep Breathing). جرب تقنية 4-7-8: استنشق لـ 4 ثوانٍ، احبس لـ 7، وازفر لـ 8. كررها 4 مرات وستشعر بهدوء فوري.",
      time: "منذ ساعة",
      likes: 15
    },
    {
      id: "c2",
      author: {
        name: "ليلى حسن",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laila",
        role: "مستخدم"
      },
      content: "أنا أيضاً أمر بنفس الشيء. وجدت أن الاستماع لبعض الموسيقى الهادئة أو المشي لـ 5 دقائق يساعدني كثيراً. لست وحدك!",
      time: "منذ 45 دقيقة",
      likes: 8
    }
  ],
  time: "منذ ساعتين",
  category: "الصحة النفسية",
  isLiked: true
};

export default function ViewPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(postData.isLiked);
  const [likesCount, setLikesCount] = useState(postData.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    toast({
      title: "تمت إضافة تعليقك",
      description: "شكراً لمشاركتك في المجتمع"
    });
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm border-b border-primary/5 sticky top-0 z-50 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/community")}
              className="rounded-2xl bg-accent/50 h-11 w-11"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black gradient-text">تفاصيل المنشور</h1>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4">
        {/* Main Post Card */}
        <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={postData.author.avatar} alt={postData.author.name} className="w-12 h-12 rounded-full bg-accent" />
                {postData.author.isAnonymous && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-base font-black">{postData.author.name}</h4>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold">
                  <span>{postData.author.role}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {postData.time}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[10px] px-3 py-1 rounded-xl">
              {postData.category}
            </Badge>
          </div>

          <p className="text-base leading-relaxed text-foreground/90 mb-8 font-medium">
            {postData.content}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-primary/5">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 text-sm font-black transition-colors",
                  isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-current")} />
                {likesCount}
              </button>
              <div className="flex items-center gap-2 text-sm font-black text-muted-foreground">
                <MessageSquare className="w-5 h-5" />
                {postData.comments.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground">
                <Bookmark className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black">التعليقات ({postData.comments.length})</h3>
            <div className="flex items-center gap-1 text-xs text-secondary font-bold">
              <ShieldCheck className="w-4 h-4" />
              بيئة آمنة
            </div>
          </div>

          <div className="space-y-4">
            {postData.comments.map((comment) => (
              <div key={comment.id} className="bg-white/60 backdrop-blur-sm rounded-[2rem] border border-primary/5 p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img src={comment.author.avatar} alt={comment.author.name} className="w-9 h-9 rounded-full bg-accent" />
                    <div>
                      <h5 className="text-xs font-black">{comment.author.name}</h5>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold">
                        <span className="text-primary">{comment.author.role}</span>
                        <span>•</span>
                        <span>{comment.time}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-primary">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80 font-medium pr-12">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment Input Box */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-primary/5 p-4 z-50">
        <div className="container max-w-3xl mx-auto">
          <form onSubmit={handleAddComment} className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Input 
                placeholder="اكتب تعليقك هنا..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="h-12 pr-4 rounded-2xl bg-accent/30 border-none focus-visible:ring-primary/20"
              />
            </div>
            <Button 
              type="submit" 
              variant="medical" 
              size="icon" 
              className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 shrink-0"
              disabled={!newComment.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
