import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Pill,
  Plus,
  Trash2,
  Bell,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Search,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
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

export default function MedicationsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      // جلب الأدوية من جدول medication_adherence
      const { data: medicationsData, error: medicationsErr } = await supabase
        .from('medication_adherence')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (medicationsErr) throw medicationsErr
      setMedications(medicationsData || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching medications:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب الأدوية")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (adherenceId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('medication_adherence')
        .update({ is_active: !currentState })
        .eq('adherence_id', adherenceId)

      if (error) throw error

      setMedications(meds => 
        meds.map(m => m.adherence_id === adherenceId 
          ? { ...m, is_active: !currentState }
          : m
        )
      )

      toast({
        title: "نجاح",
        description: !currentState ? "تم تفعيل الدواء" : "تم إيقاف الدواء"
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الدواء",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMedication = async (adherenceId: string) => {
    try {
      const { error } = await supabase
        .from('medication_adherence')
        .delete()
        .eq('adherence_id', adherenceId)

      if (error) throw error

      setMedications(meds => meds.filter(m => m.adherence_id !== adherenceId))

      toast({
        title: "نجاح",
        description: "تم حذف الدواء بنجاح"
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الدواء",
        variant: "destructive"
      })
    }
  }

  const activeMedications = (medications || []).filter(m => m.is_active)
  const inactiveMedications = (medications || []).filter(m => !m.is_active)

  const filteredActive = activeMedications.filter(m =>
    m.medication_name && m.medication_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInactive = inactiveMedications.filter(m =>
    m.medication_name && m.medication_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold">إدارة الأدوية</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل الأدوية...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">إدارة الأدوية</h1>
              <p className="text-xs text-muted-foreground">تتبع أدويتك والتزم بمواعيد تناولها</p>
            </div>
          </div>
          <Button 
            className="rounded-lg gap-2"
            onClick={() => navigate('/medications/add')}
          >
            <Plus className="w-4 h-4" />
            إضافة دواء
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن دواء..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-xl bg-white border-primary/10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-primary/5 rounded-xl p-1">
            <TabsTrigger value="active" className="rounded-lg">
              الأدوية النشطة ({activeMedications.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="rounded-lg">
              الأدوية المنتهية ({inactiveMedications.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Medications */}
          <TabsContent value="active" className="space-y-3">
            {filteredActive.length > 0 ? (
              <div className="space-y-3">
                {filteredActive.map((medication) => (
                  <div 
                    key={medication.adherence_id}
                    className="bg-white rounded-2xl border border-primary/5 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm">{medication.medication_name}</h3>
                          <Badge className="text-[10px] bg-green-100 text-green-800">
                            نشط
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {medication.dosage} - {medication.frequency_per_day} مرات يومياً
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-blue-500"
                          onClick={() => handleToggleActive(medication.adherence_id, medication.is_active)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl" className="rounded-2xl">
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف {medication.medication_name}؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel className="rounded-lg">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteMedication(medication.adherence_id)}
                                className="bg-red-600 hover:bg-red-700 rounded-lg"
                              >
                                حذف
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Medication Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">تاريخ البدء</p>
                        <p className="text-xs font-bold">{new Date(medication.start_date).toLocaleDateString('ar')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">تاريخ الانتهاء</p>
                        <p className="text-xs font-bold">{medication.end_date ? new Date(medication.end_date).toLocaleDateString('ar') : 'مستمر'}</p>
                      </div>
                    </div>
                    
                    {medication.instructions && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 mt-0.5 text-amber-500" />
                        <p>{medication.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-primary/20">
                <Pill className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">لا توجد أدوية نشطة حالياً</p>
              </div>
            )}
          </TabsContent>

          {/* Inactive Medications */}
          <TabsContent value="inactive" className="space-y-3">
            {filteredInactive.length > 0 ? (
              <div className="space-y-3">
                {filteredInactive.map((medication) => (
                  <div 
                    key={medication.adherence_id}
                    className="bg-white rounded-2xl border border-primary/5 p-4 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm">{medication.medication_name}</h3>
                          <Badge variant="outline" className="text-[10px]">
                            منتهي
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {medication.dosage}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-primary"
                        onClick={() => handleToggleActive(medication.adherence_id, medication.is_active)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-primary/20">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">لا توجد أدوية منتهية</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
