import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Send, 
  UserX, 
  Image as ImageIcon, 
  Smile, 
  Hash, 
  ShieldCheck,
  Sparkles,
  Heart,
  TrendingUp,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: 'mental', label: 'صحة نفسية', icon: Heart },
  { id: 'chronic', label: 'أمراض مزمنة', icon: TrendingUp },
  { id: 'caregivers', label: 'مقدمو الرعاية', icon: Users },
  { id: 'general', label: 'نصائح عامة', icon: Sparkles },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "حقول ناقصة",
        description: "الرجاء كتابة عنوان ومحتوى للمنشور",
        variant: "destructive"
      });
      if (!title.trim()) titleInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "تم النشر بنجاح! 🎉",
        description: isAnonymous ? "تم نشر منشورك بشكل مجهول في المجتمع" : "تم نشر منشورك وظهر للمجتمع الآن",
      });
      setIsLoading(false);
      navigate("/community");
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent, catId: string) => {
    const currentIndex = categories.findIndex(c => c.id === catId);
    if (e.key === 'ArrowLeft') {
      const nextIndex = (currentIndex + 1) % categories.length;
      setActiveCategory(categories[nextIndex].id);
      (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
    } else if (e.key === 'ArrowRight') {
      const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
      setActiveCategory(categories[prevIndex].id);
      (e.currentTarget.parentElement?.children[prevIndex] as HTMLElement)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-10" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm border-b border-primary/5 sticky top-0 z-50 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/community")}
            className="rounded-2xl bg-accent/50 h-11 w-11"
            tabIndex={0}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-black gradient-text">إنشاء منشور</h1>
            <p className="text-[10px] text-muted-foreground font-bold">شارك قصتك وألهم الآخرين</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="bg-white p-5 rounded-[2rem] border border-primary/5 shadow-sm">
            <Label className="text-sm font-black mb-4 block">اختر القسم المناسب</Label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  onKeyDown={(e) => handleKeyDown(e, cat.id)}
                  tabIndex={activeCategory === cat.id ? 0 : -1}
                  role="radio"
                  aria-checked={activeCategory === cat.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border transition-all text-right focus:outline-none focus:ring-2 focus:ring-primary",
                    activeCategory === cat.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-accent/30 border-transparent text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    activeCategory === cat.id ? "bg-white/20" : "bg-white"
                  )}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-black mr-2">العنوان</Label>
              <Input
                id="title"
                ref={titleInputRef}
                placeholder="عن ماذا تود التحدث؟"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-2xl bg-accent/20 border-none focus-visible:ring-primary/20 font-bold"
                required
                tabIndex={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-black mr-2">المحتوى</Label>
              <Textarea
                id="content"
                placeholder="اكتب تجربتك، استفسارك، أو نصيحتك هنا..."
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-[1.5rem] bg-accent/20 border-none focus-visible:ring-primary/20 resize-none leading-relaxed"
                required
                tabIndex={0}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 pt-2 border-t border-primary/5">
              <Button type="button" variant="ghost" size="icon" className="rounded-xl bg-accent/40 h-10 w-10 text-primary" tabIndex={0}>
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-xl bg-accent/40 h-10 w-10 text-primary" tabIndex={0}>
                <Smile className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-xl bg-accent/40 h-10 w-10 text-primary" tabIndex={0}>
                <Hash className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Settings & Action */}
          <div className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">نشر بهوية مجهولة</h4>
                  <p className="text-[10px] text-muted-foreground">لن يظهر اسمك للآخرين</p>
                </div>
              </div>
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                className="h-6 w-6 rounded-lg data-[state=checked]:bg-primary"
                tabIndex={0}
              />
            </div>

            <div className="bg-secondary/5 p-4 rounded-2xl flex gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                بضغطك على "نشر"، أنت توافق على قواعد المجتمع. نحن نضمن سرية بياناتك ونسعى لتوفير بيئة آمنة للجميع.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              tabIndex={0}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 ml-2" />
                  نشر المنشور الآن
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
