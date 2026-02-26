import EmergencyGuide from "@/components/medical/EmergencyGuide"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import EmergencyNumbers from "@/components/medical/EmergencyNumbers"
import { AlertCircle, Siren, HeartPulse, ShieldAlert, ArrowRight } from "lucide-react"

export default function EmergencyPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      {/* Header Section */}
      <div className="bg-red-600 text-white px-6 pt-10 pb-12 rounded-b-[3.5rem] shadow-xl shadow-red-200">
        <div className="flex items-center justify-between mb-6">
           <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full text-white hover:bg-white/20"
           >
              <ArrowRight className="w-5 h-5" />
           </Button>
           <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Siren className="w-7 h-7 animate-pulse" />
           </div>
           <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              <div className="w-2 h-2 rounded-full bg-white/50" />
           </div>
        </div>
        <h1 className="text-3xl font-black mb-3">مركز الطوارئ</h1>
        <p className="text-red-50 text-sm leading-relaxed opacity-90">
          دليلك السريع للتعامل مع الحالات الحرجة في اليمن. ابقَ هادئاً واتبع الإرشادات.
        </p>
      </div>

      <div className="container max-w-4xl mx-auto px-4 -mt-8">
        <div className="space-y-10">
          {/* Quick Action Alert */}
          <div className="bg-white p-5 rounded-[2.5rem] shadow-lg border border-red-50 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
             </div>
             <p className="text-xs font-bold text-red-800 leading-relaxed">
               في حالات توقف التنفس أو النزيف الحاد، اتصل بالإسعاف فوراً قبل البدء بالإسعافات.
             </p>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-6 px-2">
               <HeartPulse className="w-5 h-5 text-red-600" />
               <h2 className="text-xl font-black">أرقام التواصل السريع</h2>
            </div>
            <EmergencyNumbers />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 px-2">
               <ShieldAlert className="w-5 h-5 text-red-600" />
               <h2 className="text-xl font-black">دليل الإسعافات الأولية</h2>
            </div>
            <EmergencyGuide />
          </section>
        </div>
      </div>
    </div>
  )
}
