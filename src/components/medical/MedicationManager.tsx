import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Pill, Plus, Clock, Bell, Check, X, Edit, Trash2, 
  ChevronLeft, Calendar, AlertCircle, Activity, 
  Loader2, CheckCircle2, History, Info, Save, 
  ChevronRight, ArrowRight, Trash
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

interface Medication {
  adherence_id: string
  patient_id: string
  medication_name: string
  dosage: string
  frequency_per_day: number
  medication_type: string
  start_date: string
  end_date?: string
  instructions?: string
  is_active: boolean
  reminder_times?: string[]
  created_at: string
}

interface Dose {
  dose_id: string
  adherence_id: string
  scheduled_datetime: string
  status: 'PENDING' | 'TAKEN' | 'SKIPPED'
  taken_at?: string
  notes?: string
}

const MEDICATION_TYPES = [
  { id: 'PILL', label: 'حبوب', icon: Pill },
  { id: 'SYRUP', label: 'شراب', icon: Activity },
  { id: 'INJECTION', label: 'حقنة', icon: Activity },
  { id: 'CREAM', label: 'كريم', icon: Activity },
]

export default function MedicationManager() {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [editingMedId, setEditingMedId] = useState<string | null>(null)
  const [showAdherence, setShowAdherence] = useState(false)
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [doses, setDoses] = useState<Dose[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency_per_day: "1",
    medication_type: "PILL",
    instructions: "",
    start_date: new Date().toISOString().split('T')[0],
    reminder_times: ["08:00"]
  })

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('medication_adherence')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedications(data || [])
    } catch (err) {
      console.error("Error fetching medications:", err)
      toast({ title: "خطأ", description: "فشل في تحميل قائمة الأدوية", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchDoses = async (med: Medication) => {
    try {
      setSelectedMed(med)
      setLoading(true)
      const { data, error } = await supabase
        .from('medication_doses')
        .select('*')
        .eq('adherence_id', med.adherence_id)
        .order('scheduled_datetime', { ascending: true })

      if (error) throw error
      setDoses(data || [])
      setShowAdherence(true)
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في جلب سجلات الالتزام", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMedication = async () => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast({ title: "تنبيه", description: "يرجى إدخال اسم الدواء والجرعة", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const payload = {
        action: editingMedId ? "update" : "create",
        medicationId: editingMedId,
        medicationData: {
          medication_name: formData.name,
          dosage: formData.dosage,
          frequency_per_day: parseInt(formData.frequency_per_day),
          medication_type: formData.medication_type,
          instructions: formData.instructions,
          start_date: formData.start_date,
        },
        reminder_times: formData.reminder_times
      }

      const { data, error } = await supabase.functions.invoke('manage-medications', {
        body: payload
      })

      if (error) throw error

      toast({ 
        title: "تم بنجاح", 
        description: editingMedId ? "تم تحديث بيانات الدواء" : "تم إضافة الدواء وجدولة الجرعات",
        className: "bg-green-50 border-green-200"
      })

      setIsAddingMed(false)
      setEditingMedId(null)
      setFormData({ 
        name: "", 
        dosage: "", 
        frequency_per_day: "1", 
        medication_type: "PILL", 
        instructions: "", 
        start_date: new Date().toISOString().split('T')[0],
        reminder_times: ["08:00"]
      })
      fetchMedications()
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في حفظ الدواء", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkDose = async (doseId: string, status: 'TAKEN' | 'SKIPPED') => {
    try {
      const { error } = await supabase.functions.invoke('manage-medications', {
        body: {
          action: "update_dose",
          medicationData: { doseId, status }
        }
      })

      if (error) throw error
      setDoses(prev => prev.map(d => d.dose_id === doseId ? { ...d, status, taken_at: status === 'TAKEN' ? new Date().toISOString() : undefined } : d))
      toast({ title: "تحديث", description: status === 'TAKEN' ? "تم تسجيل أخذ الجرعة" : "تم تخطي الجرعة" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تحديث الجرعة", variant: "destructive" })
    }
  }

  const handleDeleteMedication = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدواء؟ سيتم حذف جميع سجلات الجرعات المرتبطة به.")) return

    try {
      const { error } = await supabase.functions.invoke('manage-medications', {
        body: { action: "delete", medicationId: id }
      })

      if (error) throw error
      setMedications(meds => meds.filter(m => m.adherence_id !== id))
      toast({ title: "نجاح", description: "تم حذف الدواء بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف الدواء", variant: "destructive" })
    }
  }

  const addReminderTime = () => {
    setFormData(prev => ({
      ...prev,
      reminder_times: [...prev.reminder_times, "08:00"],
      frequency_per_day: (prev.reminder_times.length + 1).toString()
    }))
  }

  const updateReminderTime = (index: number, time: string) => {
    const newTimes = [...formData.reminder_times]
    newTimes[index] = time
    setFormData(prev => ({ ...prev, reminder_times: newTimes }))
  }

  const removeReminderTime = (index: number) => {
    const newTimes = formData.reminder_times.filter((_, i) => i !== index)
    setFormData(prev => ({ 
      ...prev, 
      reminder_times: newTimes,
      frequency_per_day: newTimes.length.toString()
    }))
  }

  if (loading && medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">جاري تحميل أدويتك...</p>
      </div>
    )
  }

  if (showAdherence && selectedMed) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-left-4 duration-300" dir="rtl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowAdherence(false)} className="rounded-full">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{selectedMed.medication_name}</h2>
            <p className="text-sm text-muted-foreground">سجل الالتزام والجرعات</p>
          </div>
        </div>

        <div className="space-y-4">
          {doses.length === 0 ? (
            <div className="bg-white p-10 rounded-[2.5rem] border border-dashed flex flex-col items-center text-center gap-3">
              <History className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">لا توجد جرعات مجدولة لهذا الدواء حالياً</p>
            </div>
          ) : (
            doses.map((dose) => (
              <div key={dose.dose_id} className={cn(
                "p-5 rounded-[2rem] border transition-all duration-300 flex items-center justify-between",
                dose.status === 'TAKEN' ? "bg-green-50/50 border-green-100" : 
                dose.status === 'SKIPPED' ? "bg-red-50/50 border-red-100" : "bg-white border-primary/5 shadow-sm"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    dose.status === 'TAKEN' ? "bg-green-100 text-green-600" : 
                    dose.status === 'SKIPPED' ? "bg-red-100 text-red-600" : "bg-primary/5 text-primary"
                  )}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">
                      {new Date(dose.scheduled_datetime).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(dose.scheduled_datetime).toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                {dose.status === 'PENDING' ? (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-xl text-red-500 hover:bg-red-50"
                      onClick={() => handleMarkDose(dose.dose_id, 'SKIPPED')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="rounded-xl bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleMarkDose(dose.dose_id, 'TAKEN')}
                    >
                      <Check className="w-4 h-4 ml-1" />
                      تم
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className={cn(
                    "rounded-full px-3 py-1",
                    dose.status === 'TAKEN' ? "bg-green-500 text-white border-none" : "bg-red-500 text-white border-none"
                  )}>
                    {dose.status === 'TAKEN' ? 'تم أخذها' : 'تم تخطيها'}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24" dir="rtl">
      {/* Header with Stats */}
      <div className="relative overflow-hidden bg-primary rounded-[3rem] p-8 text-white shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">أدويتي</h1>
              <p className="text-primary-foreground/80 text-sm">إدارة المواعيد والالتزام اليومي</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Pill className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
              <span className="text-3xl font-black block">{medications.filter(m => m.is_active).length}</span>
              <span className="text-xs text-primary-foreground/70">أدوية نشطة</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10">
              <span className="text-3xl font-black block">85%</span>
              <span className="text-xs text-primary-foreground/70">نسبة الالتزام</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            قائمة الأدوية الحالية
          </h2>
          <Button 
            onClick={() => setIsAddingMed(true)}
            className="rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20 h-11 px-6"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة دواء
          </Button>
        </div>

        {medications.length === 0 ? (
          <div className="bg-white p-12 rounded-[3rem] border border-dashed border-primary/20 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
              <Pill className="w-10 h-10 text-primary/40" />
            </div>
            <div>
              <h3 className="font-bold text-lg">لا توجد أدوية مضافة</h3>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">ابدأ بإضافة أدويتك اليومية لتلقي التنبيهات وتتبع صحتك</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med.adherence_id} className="group bg-white p-6 rounded-[2.5rem] border border-primary/5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Pill className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{med.medication_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0">
                          {med.dosage}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {med.frequency_per_day} مرات يومياً
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch 
                      checked={med.is_active}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {med.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </div>
                </div>

                {med.instructions && (
                  <div className="mb-6 p-3 bg-accent/30 rounded-2xl flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{med.instructions}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl h-12 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => fetchDoses(med)}
                  >
                    <History className="w-4 h-4 ml-2" />
                    سجل الالتزام
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-12 h-12 rounded-2xl text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteMedication(med.adherence_id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal (Simulated with fixed overlay for mobile feel) */}
      {isAddingMed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">{editingMedId ? 'تعديل الدواء' : 'إضافة دواء جديد'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddingMed(false)} className="rounded-full bg-accent/50">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold mr-2">اسم الدواء</label>
                <Input 
                  placeholder="مثلاً: بانادول، أوميبرازول..." 
                  className="rounded-2xl h-14 bg-accent/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold mr-2">الجرعة</label>
                  <Input 
                    placeholder="500 ملغ" 
                    className="rounded-2xl h-14 bg-accent/30 border-none"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold mr-2">تاريخ البدء</label>
                  <Input 
                    type="date"
                    className="rounded-2xl h-14 bg-accent/30 border-none"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold mr-2">أوقات التذكير</label>
                <div className="space-y-3">
                  {formData.reminder_times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2 animate-in slide-in-from-right-2">
                      <div className="relative flex-1">
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                        <Input 
                          type="time"
                          className="rounded-2xl h-14 bg-accent/30 border-none pr-12"
                          value={time}
                          onChange={(e) => updateReminderTime(index, e.target.value)}
                        />
                      </div>
                      {formData.reminder_times.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-2xl h-14 w-14 text-red-500 hover:bg-red-50"
                          onClick={() => removeReminderTime(index)}
                        >
                          <Trash className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full rounded-2xl h-14 border-dashed border-2 border-primary/20 text-primary hover:bg-primary/5"
                    onClick={addReminderTime}
                  >
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة وقت آخر
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold mr-2">تعليمات إضافية (اختياري)</label>
                <textarea 
                  className="w-full rounded-3xl p-4 bg-accent/30 border-none min-h-[100px] focus:ring-2 focus:ring-primary outline-none text-sm"
                  placeholder="مثلاً: قبل الأكل بـ 30 دقيقة..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                />
              </div>

              <Button 
                className="w-full rounded-2xl h-16 text-lg font-bold bg-primary shadow-xl shadow-primary/20 mt-4"
                onClick={handleSaveMedication}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 ml-2" />
                    حفظ الدواء
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
