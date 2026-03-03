import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  ArrowRight, 
  Pill, 
  Clock, 
  Calendar, 
  AlertCircle,
  Loader2,
  ChevronLeft,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import MedicationAddEdit from "@/components/medical/MedicationAddEdit"
import { supabase } from "@/integrations/supabase/client"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  medication_type?: string
  image_url?: string
  reminder_times?: string[]
}

export default function MedicationsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    adherenceRate: 0
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
      
      setStats({
        total: data?.length || 0,
        active: data?.filter(m => m.is_active).length || 0,
        adherenceRate: data && data.length > 0 ? Math.round((data.filter(m => m.is_active).length / data.length) * 100) : 0
      })
    } catch (err) {
      console.error("Error fetching medications:", err)
      toast({ 
        title: "خطأ", 
        description: "فشل في جلب قائمة الأدوية", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedication = async (id: string) => {
    try {
      setDeleting(id)
      const { error } = await supabase
        .from('medication_adherence')
        .delete()
        .eq('adherence_id', id)

      if (error) throw error
      
      setMedications(prev => prev.filter(m => m.adherence_id !== id))
      setDeleteConfirmId(null)
      toast({ 
        title: "نجاح", 
        description: "تم حذف الدواء بنجاح" 
      })
    } catch (err) {
      console.error("Error deleting medication:", err)
      toast({ 
        title: "خطأ", 
        description: "فشل في حذف الدواء", 
        variant: "destructive" 
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleMedication = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('medication_adherence')
        .update({ is_active: !currentState })
        .eq('adherence_id', id)

      if (error) throw error
      
      setMedications(prev => prev.map(m => 
        m.adherence_id === id ? { ...m, is_active: !currentState } : m
      ))
      
      toast({ 
        title: "نجاح", 
        description: !currentState ? "تم تفعيل الدواء" : "تم إيقاف الدواء" 
      })
    } catch (err) {
      console.error("Error toggling medication:", err)
      toast({ 
        title: "خطأ", 
        description: "فشل في تحديث حالة الدواء", 
        variant: "destructive" 
      })
    }
  }

  const MedicationSkeleton = () => (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-24"></div>
          </div>
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      </div>
      <div className="h-3 bg-slate-100 rounded w-full"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-800">الأدوية والالتزام</h1>
          </div>
          <Button 
            onClick={() => {
              setEditingMedication(null)
              setIsAddModalOpen(true)
            }}
            size="sm"
            className="rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة دواء
          </Button>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-6 pt-8">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">معدل الالتزام</p>
                <h2 className="text-3xl font-black">{stats.adherenceRate}%</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black">{stats.total}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase">الإجمالي</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{stats.active}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase">نشطة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-blue-400">{stats.total - stats.active}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase">موقوفة</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* Medications List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-black text-slate-800">قائمة الأدوية</h3>
            <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 font-bold">
              {medications.length}
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <MedicationSkeleton key={i} />
              ))}
            </div>
          ) : medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((med) => (
                <div 
                  key={med.adherence_id} 
                  className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all ${
                    med.is_active 
                      ? 'border-slate-100 hover:border-primary/20' 
                      : 'border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        med.is_active
                          ? 'bg-rose-50 border-rose-100/50'
                          : 'bg-slate-50 border-slate-100'
                      }`}>
                        <Pill className={`w-7 h-7 ${med.is_active ? 'text-rose-500' : 'text-slate-300'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-slate-800">{med.medication_name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none rounded-lg text-[10px] font-bold px-2">
                            {med.dosage}
                          </Badge>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {med.frequency_per_day} مرات يومياً
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`rounded-full font-black text-[10px] px-3 ${
                        med.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {med.is_active ? 'نشط' : 'موقوف'}
                      </Badge>
                    </div>
                  </div>

                  {/* Reminder Times */}
                  {med.reminder_times && med.reminder_times.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-600">مواعيد التذكير</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {med.reminder_times.map((time, idx) => (
                          <Badge key={idx} className="bg-white text-blue-600 border border-blue-200 rounded-lg text-[10px]">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration Info */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 flex-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[11px] font-bold">
                        من {new Date(med.start_date).toLocaleDateString('ar')}
                        {med.end_date && ` إلى ${new Date(med.end_date).toLocaleDateString('ar')}`}
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  {med.instructions && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 mb-1">تعليمات</p>
                          <p className="text-[10px] text-amber-700">{med.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMedication(med)
                        setIsAddModalOpen(true)
                      }}
                      className="flex-1 rounded-xl text-[12px] font-bold"
                    >
                      <Edit2 className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(med.adherence_id)}
                      className="flex-1 rounded-xl text-[12px] font-bold text-red-600 border-red-200 hover:bg-red-50"
                      disabled={deleting === med.adherence_id}
                    >
                      {deleting === med.adherence_id ? (
                        <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 ml-1" />
                      )}
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Pill className="w-8 h-8 text-slate-200" />
              </div>
              <h4 className="text-slate-800 font-black mb-1">لا توجد أدوية</h4>
              <p className="text-slate-400 text-xs font-medium mb-6">ابدأ بإضافة أدويتك لتلقي التنبيهات ومتابعة التزامك</p>
              <Button 
                onClick={() => {
                  setEditingMedication(null)
                  setIsAddModalOpen(true)
                }}
                className="rounded-xl font-black px-8 shadow-lg shadow-primary/20"
              >
                إضافة أول دواء
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <MedicationAddEdit 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingMedication(null)
        }}
        medication={editingMedication}
        onSuccess={() => {
          setIsAddModalOpen(false)
          setEditingMedication(null)
          fetchMedications()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الدواء</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الدواء؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteMedication(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              حذف
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
