import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import MedicalCard from "./MedicalCard"
import BookAppointmentModal from "./BookAppointmentModal"
import { Search, Brain, AlertTriangle, Stethoscope, Clock, Plus, X, HeartPulse } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [customSymptom, setCustomSymptom] = useState("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<{
    id: string
    name: string
    hospital: string
  } | null>(null)

  const commonSymptoms = [
    "صداع", "حمى", "سعال", "ألم في الصدر", "ضيق تنفس",
    "ألم في البطن", "غثيان", "دوخة", "ألم في المفاصل", "إعياء"
  ]

  const handleSymptomSelect = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()])
      setCustomSymptom("")
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول للقيام بالتحليل")

      // محاكاة استجابة AI حالياً (سيتم ربطها بـ Gemini Pro لاحقاً)
      const mockAnalysis = {
        suggestedSpecialty: "طب الباطنة",
        urgencyLevel: "متوسط",
        recommendations: [
          "يُنصح بزيارة طبيب الباطنة في أقرب وقت",
          "تجنب الإجهاد البدني والحصول على قسط وافر من الراحة",
          "الإكثار من شرب السوائل الدافئة والماء"
        ],
        nearbyDoctors: [
          { name: "د. محمد الحكيمي", specialty: "طب الباطنة", rating: 4.8, distance: "2.5 كم", hospital: "مستشفى ابن سينا - الحوبان" },
          { name: "د. فاطمة الشامي", specialty: "طب الباطنة", rating: 4.7, distance: "3.1 كم", hospital: "مستشفى الثورة - تعز" }
        ]
      }

      // حفظ في قاعدة البيانات
      const { error } = await supabase
        .from('symptom_check_history')
        .insert([{
          patient_id: user.id,
          symptoms: selectedSymptoms.join(", "),
          additional_notes: symptoms,
          ai_analysis: mockAnalysis,
          suggested_specialty: mockAnalysis.suggestedSpecialty,
          urgency_level: mockAnalysis.urgencyLevel
        }])

      if (error) throw error

      setAnalysis({
        ...mockAnalysis,
        urgencyColor: "text-orange-500 bg-orange-50"
      })
    } catch (err: any) {
      console.error("Error analyzing symptoms:", err)
      // في حال وجود خطأ، نظهر الاستجابة الوهمية للمستخدم مع تنبيه
      setAnalysis({
        suggestedSpecialty: "طب الباطنة",
        urgencyLevel: "متوسط",
        urgencyColor: "text-orange-500 bg-orange-50",
        recommendations: ["حدث خطأ في حفظ النتائج، ولكن إليك التحليل الأولي..."],
        nearbyDoctors: []
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-xl shadow-primary/5 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">المحلل الذكي</h2>
              <p className="text-xs text-muted-foreground">أدخل أعراضك للحصول على توجيه طبي</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-3 block mr-1">الأعراض الشائعة</label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom)
                  return (
                    <button
                      key={symptom}
                      onClick={() => handleSymptomSelect(symptom)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-medium transition-all border",
                        isSelected
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-white text-muted-foreground border-primary/10 hover:border-primary/30"
                      )}
                    >
                      {symptom}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <Input
                placeholder="أضف عرضاً آخر..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCustomSymptom()}
                className="h-12 pr-4 pl-12 rounded-xl bg-accent/30 border-none focus:ring-primary/20"
              />
              <Button
                onClick={handleAddCustomSymptom}
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 text-primary"
                disabled={!customSymptom.trim()}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                {selectedSymptoms.map(s => (
                  <Badge key={s} className="bg-white text-primary border-primary/20 px-3 py-1 gap-1.5 rounded-lg">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => handleSymptomSelect(s)} />
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <label className="text-sm font-bold mb-1 block mr-1">وصف إضافي (اختياري)</label>
              <Textarea
                placeholder="صف حالتك بالتفصيل (متى بدأت، شدتها، أي ملاحظات أخرى)..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[120px] rounded-2xl bg-accent/30 border-none focus:ring-primary/20 p-4"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={selectedSymptoms.length === 0 && !symptoms.trim()}
              className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 btn-medical mt-4"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحليل الذكي...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  ابدأ التحليل الآن
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <HeartPulse className="w-6 h-6 text-secondary" />
              <h3 className="text-xl font-bold">نتائج التحليل الأولي</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="text-[10px] text-muted-foreground mb-1">التخصص المقترح</div>
                <div className="font-bold text-primary flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  {analysis.suggestedSpecialty}
                </div>
              </div>
              <div className={cn("p-4 rounded-2xl border", analysis.urgencyColor)}>
                <div className="text-[10px] opacity-70 mb-1">مستوى الإلحاح</div>
                <div className="font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {analysis.urgencyLevel}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-sm mr-1">توصيات ذكاء العافية:</h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-xl text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-yellow-800 leading-relaxed">
                <strong>تنبيه طبي:</strong> هذا التحليل إرشادي فقط ولا يعتبر تشخيصاً نهائياً. في حالات الطوارئ الشديدة، يرجى التوجه فوراً لأقرب مركز طوارئ أو الاتصال بالإسعاف.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold px-2">أطباء مقترحون لحالتك في منطقتك</h3>
            <div className="space-y-3">
              {analysis.nearbyDoctors.map((doctor: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary font-bold">
                    {doctor.name[3]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{doctor.name}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{doctor.hospital}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="text-yellow-600 font-bold">⭐ {doctor.rating}</span>
                      <span className="text-muted-foreground">• {doctor.distance}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="medical" 
                    className="rounded-lg h-9 text-xs"
                    onClick={() => {
                      setSelectedDoctorForBooking({
                        id: `doctor-${index}`,
                        name: doctor.name,
                        hospital: doctor.hospital
                      })
                      setIsBookingModalOpen(true)
                    }}
                  >
                    حجز
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* نافذة حجز الموعد */}
      {selectedDoctorForBooking && (
        <BookAppointmentModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedDoctorForBooking(null)
          }}
          doctorId={selectedDoctorForBooking.id}
          doctorName={selectedDoctorForBooking.name}
          hospitalName={selectedDoctorForBooking.hospital}
          onSuccess={() => {
            // يمكن إضافة منطق إضافي هنا عند نجاح الحجز
          }}
        />
      )}
    </div>
  )
}
