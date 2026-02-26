import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Pill, 
  Plus, 
  Clock, 
  Bell, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  ChevronLeft,
  Calendar,
  AlertCircle,
  Activity,
  Loader2
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
  start_date: string
  end_date?: string
  instructions?: string
  is_active: boolean
  created_at: string
}

export default function MedicationManager() {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingMed, setIsAddingMed] = useState(false)
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency_per_day: "1",
    instructions: "",
    start_date: new Date().toISOString().split('T')[0]
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
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedication = async () => {
    if (!newMed.name.trim() || !newMed.dosage.trim()) {
      toast({ title: "تنبيه", description: "يرجى إكمال البيانات المطلوبة", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase
        .from('medication_adherence')
        .insert({
          patient_id: user.id,
          medication_name: newMed.name,
          dosage: newMed.dosage,
          frequency_per_day: parseInt(newMed.frequency_per_day),
          instructions: newMed.instructions,
          start_date: newMed.start_date,
          is_active: true
        })

      if (error) throw error

      toast({ title: "نجاح", description: "تم إضافة الدواء بنجاح" })
      setIsAddingMed(false)
      setNewMed({ name: "", dosage: "", frequency_per_day: "1", instructions: "", start_date: new Date().toISOString().split('T')[0] })
      fetchMedications()
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في إضافة الدواء", variant: "destructive" })
    }
  }

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('medication_adherence')
        .update({ is_active: !currentState })
        .eq('adherence_id', id)

      if (error) throw error
      setMedications(meds => meds.map(m => m.adherence_id === id ? { ...m, is_active: !currentState } : m))
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" })
    }
  }

  const handleDeleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medication_adherence')
        .delete()
        .eq('adherence_id', id)

      if (error) throw error
      setMedications(meds => meds.filter(m => m.adherence_id !== id))
      toast({ title: "نجاح", description: "تم حذف الدواء" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف الدواء", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-white p-4 rounded-[2rem] border border-primary/5 shadow-sm flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
               <Pill className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
               <span className="text-2xl font-black text-primary block">{medications.filter(m => m.is_active).length}</span>
               <span className="text-[10px] text-muted-foreground">أدوية نشطة</span>
            </div>
         </div>
         <div className="bg-white p-4 rounded-[2rem] border border-secondary/5 shadow-sm flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center">
               <Activity className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-center">
               <span className="text-2xl font-black text-secondary block">100%</span>
               <span className="text-[10px] text-muted-foreground">الالتزام العام</span>
            </div>
         </div>
      </div>

      {/* All Medications List */}
      <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold">قائمة الأدوية</h2>
            <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs text-primary font-bold" onClick={() => setIsAddingMed(true)}>
               <Plus className="w-4 h-4 ml-1" />
               إضافة
            </Button>
         </div>

         <div className="space-y-4">
            {medications.length > 0 ? medications.map((med) => (
              <div key={med.adherence_id} className="bg-white p-5 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                         <Pill className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                         <h3 className="font-bold text-base leading-tight">{med.medication_name}</h3>
                         <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency_per_day} مرات يومياً</p>
                      </div>
                   </div>
                   <Switch 
                    checked={med.is_active}
                    onCheckedChange={() => handleToggleActive(med.adherence_id, med.is_active)}
                   />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="p-3 rounded-2xl bg-accent/30 border border-transparent flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <div>
                         <span className="text-[10px] text-muted-foreground block">تاريخ البدء</span>
                         <span className="text-[10px] font-bold">{new Date(med.start_date).toLocaleDateString('ar')}</span>
                      </div>
                   </div>
                </div>

                {med.instructions && (
                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 flex gap-2 mb-4">
                     <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-orange-800 leading-relaxed">{med.instructions}</p>
                  </div>
                )}

                <div className="flex items-center justify-end pt-2">
                   <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500" onClick={() => handleDeleteMedication(med.adherence_id)}>
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-muted-foreground">لا توجد أدوية مضافة</div>
            )}
         </div>
      </div>

      {/* Add Medication Overlay */}
      {isAddingMed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 animate-in slide-in-from-bottom-10 duration-500">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold">إضافة دواء جديد</h2>
                 <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAddingMed(false)}>
                    <X className="w-5 h-5" />
                 </Button>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold mr-1">اسم الدواء</label>
                    <Input 
                      placeholder="مثال: باراسيتامول" 
                      className="h-12 rounded-xl bg-accent/30 border-none"
                      value={newMed.name}
                      onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold mr-1">الجرعة</label>
                       <Input 
                        placeholder="500 مجم" 
                        className="h-12 rounded-xl bg-accent/30 border-none"
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold mr-1">التكرار (مرات يومياً)</label>
                       <Input 
                        type="number"
                        placeholder="1" 
                        className="h-12 rounded-xl bg-accent/30 border-none"
                        value={newMed.frequency_per_day}
                        onChange={(e) => setNewMed({...newMed, frequency_per_day: e.target.value})}
                       />
                    </div>
                 </div>
                 <Button className="w-full h-14 rounded-2xl font-black text-lg btn-medical mt-4 shadow-xl shadow-primary/20" onClick={handleAddMedication}>
                    حفظ الدواء
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
