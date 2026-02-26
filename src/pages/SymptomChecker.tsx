import SymptomChecker from "@/components/medical/SymptomChecker"
import { Stethoscope, BrainCircuit, ShieldCheck, Sparkles, ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function SymptomCheckerPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      {/* Hero Header */}
      <div className="bg-primary text-white px-6 pt-10 pb-16 rounded-b-[3.5rem] shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => navigate(-1)} 
               className="rounded-full bg-white/20 hover:bg-white/30 text-white"
             >
               <ChevronLeft className="w-6 h-6 rotate-180" />
             </Button>
             <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BrainCircuit className="w-7 h-7 text-white" />
             </div>
             <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                مدعوم بالذكاء الاصطناعي
             </div>
          </div>
          <h1 className="text-3xl font-black mb-3">محلل الأعراض الذكي</h1>
          <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-[85%]">
            أجب على بعض الأسئلة للحصول على توجيه طبي أولي وتحديد التخصص المناسب لحالتك.
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="space-y-8">
          {/* Trust Banner */}
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-primary/5 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-600" />
             </div>
             <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
               هذا المحلل هو أداة استرشادية فقط ولا يغني عن التشخيص الطبي المتخصص. في الحالات الطارئة، توجه لأقرب مستشفى.
             </p>
          </div>

          <SymptomChecker />
        </div>
      </div>
    </div>
  )
}
