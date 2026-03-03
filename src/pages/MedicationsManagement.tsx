import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  Check,
  Pill,
  Calendar,
  X,
  Search,
  Clock,
  AlertTriangle
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface Medication {
  medication_id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  status: string
  notes: string
}

interface ValidationError {
  field: string
  message: string
}

const FREQUENCIES = [
  { value: 'once_daily', label: 'مرة يومياً' },
  { value: 'twice_daily', label: 'مرتين يومياً' },
  { value: 'three_times_daily', label: 'ثلاث مرات يومياً' },
  { value: 'four_times_daily', label: 'أربع مرات يومياً' },
  { value: 'every_12_hours', label: 'كل 12 ساعة' },
  { value: 'every_8_hours', label: 'كل 8 ساعات' },
  { value: 'every_6_hours', label: 'كل 6 ساعات' },
  { value: 'as_needed', label: 'حسب الحاجة' }
]

export default function MedicationsManagementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    start_date: "",
    end_date: "",
    notes: ""
  })
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'save' | 'delete', id?: string }>({ type: 'save' })

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")
      setCurrentUser(user)

      // Fetch medications
      const { data: medsList, error: medsErr } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', user.id)
        .order('start_date', { ascending: false })

      if (medsList) {
        setMedications(medsList)
      }
    } catch (err) {
      console.error("Error fetching medications:", err)
      toast({ title: "خطأ", description: "فشل في تحميل الأدوية", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationError[] = []

    if (!formData.name.trim()) {
      errors.push({ field: 'name', message: 'اسم الدواء مطلوب' })
    }
    if (!formData.dosage.trim()) {
      errors.push({ field: 'dosage', message: 'الجرعة مطلوبة' })
    }
    if (!formData.frequency) {
      errors.push({ field: 'frequency', message: 'التكرار مطلوب' })
    }
    if (!formData.start_date) {
      errors.push({ field: 'start_date', message: 'تاريخ البداية مطلوب' })
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      errors.push({ field: 'end_date', message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const resetForm = () => {
    setFormData({
      name: "",
      dosage: "",
      frequency: "",
      start_date: "",
      end_date: "",
      notes: ""
    })
    setValidationErrors([])
    setEditingId(null)
  }

  const handleAddMedication = () => {
    resetForm()
    setShowAddForm(true)
  }

  const handleEditMedication = (med: Medication) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      start_date: med.start_date,
      end_date: med.end_date || "",
      notes: med.notes
    })
    setEditingId(med.medication_id)
    setShowAddForm(true)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: "تنبيه", description: "يرجى تصحيح الأخطاء المشار إليها", variant: "destructive" })
      return
    }

    setConfirmAction({ type: 'save' })
    setShowConfirmDialog(true)
  }

  const confirmSave = async () => {
    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      if (editingId) {
        // Update existing medication
        const { error } = await supabase
          .from('medications')
          .update({
            ...formData,
            status: formData.end_date && new Date(formData.end_date) < new Date() ? 'INACTIVE' : 'ACTIVE'
          })
          .eq('medication_id', editingId)

        if (error) throw error
        toast({ title: "نجح", description: "تم تحديث الدواء بنجاح" })
      } else {
        // Add new medication
        const { error } = await supabase
          .from('medications')
          .insert({
            patient_id: currentUser.id,
            ...formData,
            status: 'ACTIVE'
          })

        if (error) throw error
        toast({ title: "نجح", description: "تم إضافة الدواء بنجاح" })
      }

      resetForm()
      setShowAddForm(false)
      await fetchMedications()
    } catch (err: any) {
      console.error("Error saving medication:", err)
      toast({ title: "خطأ", description: err.message || "فشل في حفظ الدواء", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMedication = (medId: string) => {
    setConfirmAction({ type: 'delete', id: medId })
    setShowConfirmDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('medication_id', confirmAction.id)

      if (error) throw error

      toast({ title: "نجح", description: "تم حذف الدواء بنجاح" })
      await fetchMedications()
    } catch (err: any) {
      console.error("Error deleting medication:", err)
      toast({ title: "خطأ", description: err.message || "فشل في حذف الدواء", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(e => e.field === fieldName)?.message
  }

  const getFrequencyLabel = (value: string): string => {
    return FREQUENCIES.find(f => f.value === value)?.label || value
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMedicationStatus = (med: Medication): { label: string; color: string } => {
    if (med.end_date && new Date(med.end_date) < new Date()) {
      return { label: 'منتهي', color: 'bg-slate-100 text-slate-600' }
    }
    return { label: 'نشط', color: 'bg-emerald-50 text-emerald-600' }
  }

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeMedications = filteredMedications.filter(m => !m.end_date || new Date(m.end_date) >= new Date())
  const inactiveMedications = filteredMedications.filter(m => m.end_date && new Date(m.end_date) < new Date())

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري تحميل الأدوية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-8 sticky top-0 z-50 border-b border-primary/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">إدارة الأدوية</h1>
              <p className="text-xs text-slate-400 font-bold">تتبع وإدارة أدويتك الحالية والسابقة</p>
            </div>
          </div>
          <Button 
            onClick={handleAddMedication}
            className="rounded-xl font-black h-10 px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 ml-2" />
            دواء جديد
          </Button>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Add/Edit Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 mb-8"
              >
                <h2 className="text-lg font-black text-slate-800 mb-6">
                  {editingId ? 'تعديل الدواء' : 'إضافة دواء جديد'}
                </h2>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-[2rem] p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-black text-red-900 mb-2">يرجى تصحيح الأخطاء التالية:</p>
                        <ul className="space-y-1">
                          {validationErrors.map((error, idx) => (
                            <li key={idx} className="text-sm text-red-700">• {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">
                        اسم الدواء <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('name') ? 'border-red-300' : ''}`}
                        placeholder="مثال: الأسبرين"
                      />
                      {getFieldError('name') && <p className="text-xs text-red-600">{getFieldError('name')}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">
                        الجرعة <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.dosage}
                        onChange={e => setFormData({...formData, dosage: e.target.value})}
                        className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('dosage') ? 'border-red-300' : ''}`}
                        placeholder="مثال: 500 ملغ"
                      />
                      {getFieldError('dosage') && <p className="text-xs text-red-600">{getFieldError('dosage')}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">
                        التكرار <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={e => setFormData({...formData, frequency: e.target.value})}
                        className={`w-full rounded-2xl border border-slate-100 h-12 font-bold bg-slate-50/50 px-4 ${getFieldError('frequency') ? 'border-red-300' : ''}`}
                      >
                        <option value="">اختر التكرار</option>
                        {FREQUENCIES.map(freq => (
                          <option key={freq.value} value={freq.value}>{freq.label}</option>
                        ))}
                      </select>
                      {getFieldError('frequency') && <p className="text-xs text-red-600">{getFieldError('frequency')}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">
                        تاريخ البداية <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                        className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('start_date') ? 'border-red-300' : ''}`}
                      />
                      {getFieldError('start_date') && <p className="text-xs text-red-600">{getFieldError('start_date')}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">تاريخ النهاية (اختياري)</label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={e => setFormData({...formData, end_date: e.target.value})}
                      className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('end_date') ? 'border-red-300' : ''}`}
                    />
                    {getFieldError('end_date') && <p className="text-xs text-red-600">{getFieldError('end_date')}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">ملاحظات</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full rounded-2xl border border-slate-100 h-24 font-bold bg-slate-50/50 p-4 resize-none"
                      placeholder="مثال: تناول مع الطعام، قد يسبب النعاس"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        resetForm()
                      }}
                      className="flex-1 h-12 rounded-2xl font-black"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 h-12 rounded-2xl font-black"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                      حفظ
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          {medications.length > 0 && (
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دواء..."
                  className="rounded-2xl border-slate-100 h-12 font-bold pl-12 bg-white"
                />
              </div>
            </div>
          )}

          {/* Active Medications */}
          {activeMedications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                الأدوية النشطة ({activeMedications.length})
              </h2>
              <div className="space-y-4">
                {activeMedications.map(med => (
                  <motion.div
                    key={med.medication_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-slate-800">{med.name}</p>
                            <p className="text-sm text-slate-600 font-bold">{med.dosage}</p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                            نشط
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{getFrequencyLabel(med.frequency)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>منذ {formatDate(med.start_date)}</span>
                          </div>
                        </div>

                        {med.notes && (
                          <p className="text-xs text-slate-500 mt-3 p-3 bg-slate-50 rounded-xl">
                            📝 {med.notes}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMedication(med)}
                          className="rounded-xl font-black h-10 px-3"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMedication(med.medication_id)}
                          className="rounded-xl font-black h-10 px-3 text-red-500 border-red-50 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Medications */}
          {inactiveMedications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-400" />
                الأدوية المنتهية ({inactiveMedications.length})
              </h2>
              <div className="space-y-4">
                {inactiveMedications.map(med => (
                  <motion.div
                    key={med.medication_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-slate-800">{med.name}</p>
                            <p className="text-sm text-slate-600 font-bold">{med.dosage}</p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                            منتهي
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>من {formatDate(med.start_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>إلى {med.end_date ? formatDate(med.end_date) : '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMedication(med.medication_id)}
                          className="rounded-xl font-black h-10 px-3 text-red-500 border-red-50 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {medications.length === 0 && (
            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-50 text-center">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">لم تقم بإضافة أي أدوية بعد</p>
              <p className="text-xs text-slate-400 mt-2">ابدأ بإضافة أدويتك الحالية لتتبعها بسهولة</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center mb-2">
              {confirmAction.type === 'save' ? 'تأكيد الحفظ' : 'تأكيد الحذف'}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              {confirmAction.type === 'save'
                ? 'هل أنت متأكد من رغبتك في حفظ بيانات الدواء؟'
                : 'هل أنت متأكد من رغبتك في حذف هذا الدواء؟ لا يمكن التراجع عن هذا الإجراء.'}
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-12 rounded-2xl font-black"
              >
                إلغاء
              </Button>
              <Button 
                onClick={confirmAction.type === 'save' ? confirmSave : confirmDelete}
                disabled={isSaving}
                className={`flex-1 h-12 rounded-2xl font-black ${
                  confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 ml-2" />}
                {confirmAction.type === 'save' ? 'حفظ' : 'حذف'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
