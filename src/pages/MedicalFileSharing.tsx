import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  Share2,
  AlertCircle,
  Check,
  Clock,
  User,
  Calendar,
  Download,
  X,
  FileDown
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface Doctor {
  doctor_id: string
  first_name: string
  last_name: string
  email: string
  specialization: string
}

interface SharedFile {
  sharing_id: string
  doctor_id: string
  doctor: Doctor
  shared_sections: string[]
  shared_at: string
  expires_at: string | null
  status: 'active' | 'expired'
}

const AVAILABLE_SECTIONS = [
  { id: 'personal', label: 'البيانات الشخصية', icon: '👤', description: 'الاسم، تاريخ الميلاد، الجنس' },
  { id: 'medical_history', label: 'السجل الطبي', icon: '📋', description: 'الأمراض المزمنة والتاريخ الطبي' },
  { id: 'medications', label: 'الأدوية', icon: '💊', description: 'الأدوية النشطة والسابقة' },
  { id: 'allergies', label: 'الحساسيات', icon: '⚠️', description: 'الحساسيات والتفاعلات الدوائية' },
  { id: 'vitals', label: 'المؤشرات الحيوية', icon: '❤️', description: 'ضغط الدم، النبض، الحرارة' },
  { id: 'lab_results', label: 'نتائج الفحوصات', icon: '🔬', description: 'نتائج التحاليل والفحوصات' },
  { id: 'appointments', label: 'المواعيد', icon: '📅', description: 'المواعيد القادمة والسابقة' },
  { id: 'documents', label: 'الملفات الطبية', icon: '📄', description: 'الوثائق والتقارير الطبية' }
]

export default function MedicalFileSharingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [expiryDays, setExpiryDays] = useState<number>(30)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'share' | 'revoke', id?: string }>({ type: 'share' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")
      setCurrentUser(user)

      // Fetch shared files
      const { data: shared } = await supabase
        .from('medical_sharing')
        .select('*, doctors(*)')
        .eq('patient_id', user.id)
        .order('shared_at', { ascending: false })

      if (shared) {
        const enrichedShared = shared.map(item => ({
          ...item,
          doctor: item.doctors,
          status: item.expires_at && new Date(item.expires_at) < new Date() ? 'expired' : 'active'
        }))
        setSharedFiles(enrichedShared)
      }

      // Fetch all doctors
      const { data: doctorsList } = await supabase
        .from('doctors')
        .select('doctor_id, first_name, last_name, email, specialization')
        .order('first_name')

      if (doctorsList) {
        setDoctors(doctorsList)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      toast({ title: "خطأ", description: "فشل في تحميل البيانات", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    if (!selectedDoctor) {
      toast({ title: "تنبيه", description: "يرجى اختيار طبيب", variant: "destructive" })
      return false
    }
    if (selectedSections.length === 0) {
      toast({ title: "تنبيه", description: "يرجى اختيار جزء واحد على الأقل للمشاركة", variant: "destructive" })
      return false
    }
    if (expiryDays < 1 || expiryDays > 365) {
      toast({ title: "تنبيه", description: "مدة الصلاحية يجب أن تكون بين 1 و 365 يوم", variant: "destructive" })
      return false
    }
    return true
  }

  const handleShareFile = async () => {
    if (!validateForm()) return
    setConfirmAction({ type: 'share' })
    setShowConfirmDialog(true)
  }

  const confirmShare = async () => {
    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + expiryDays)

      const { error } = await supabase
        .from('medical_sharing')
        .insert({
          patient_id: currentUser.id,
          doctor_id: selectedDoctor,
          shared_sections: selectedSections,
          expires_at: expiryDate.toISOString()
        })

      if (error) throw error

      toast({ title: "نجح", description: "تم مشاركة الملف الصحي بنجاح" })
      setSelectedDoctor("")
      setSelectedSections([])
      setExpiryDays(30)
      setShowAddForm(false)
      await fetchData()
    } catch (err: any) {
      console.error("Error sharing file:", err)
      toast({ title: "خطأ", description: err.message || "فشل في مشاركة الملف", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevokeAccess = (sharingId: string) => {
    setConfirmAction({ type: 'revoke', id: sharingId })
    setShowConfirmDialog(true)
  }

  const confirmRevoke = async () => {
    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      const { error } = await supabase
        .from('medical_sharing')
        .delete()
        .eq('sharing_id', confirmAction.id)

      if (error) throw error

      toast({ title: "نجح", description: "تم إلغاء المشاركة بنجاح" })
      await fetchData()
    } catch (err: any) {
      console.error("Error revoking access:", err)
      toast({ title: "خطأ", description: err.message || "فشل في إلغاء المشاركة", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const getDoctorName = (doctor: Doctor): string => {
    return `د. ${doctor.first_name} ${doctor.last_name}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    )
  }

  const exportToPDF = () => {
    toast({ title: "جاري التصدير", description: "سيتم تحميل ملف PDF قريباً" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="container max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-800">مشاركة الملف الصحي</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToPDF} className="rounded-xl font-black h-10 px-4">
              <FileDown className="w-4 h-4 ml-2" />
              تصدير PDF
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-xl font-black h-10 px-6"
            >
              <Plus className="w-4 h-4 ml-2" />
              مشاركة جديدة
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-6 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Add Sharing Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8"
              >
                <h2 className="text-lg font-black text-slate-800 mb-8">إضافة مشاركة جديدة</h2>

                {/* Doctor Selection */}
                <div className="space-y-8">
                  {/* Doctor Selector */}
                  <div className="space-y-4">
                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      اختر الطبيب <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                      {doctors.map(doctor => (
                        <button
                          key={doctor.doctor_id}
                          onClick={() => setSelectedDoctor(doctor.doctor_id)}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            selectedDoctor === doctor.doctor_id
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-100 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-black text-slate-800">{getDoctorName(doctor)}</p>
                              <p className="text-xs text-slate-500 font-bold mt-1">{doctor.specialization}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-2">{doctor.email}</p>
                            </div>
                            {selectedDoctor === doctor.doctor_id && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sections Selection */}
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-primary" />
                      اختر الأجزاء المراد مشاركتها <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AVAILABLE_SECTIONS.map(section => (
                        <button
                          key={section.id}
                          onClick={() => toggleSection(section.id)}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            selectedSections.includes(section.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-100 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{section.icon}</span>
                            <div className="flex-1">
                              <p className="font-black text-slate-800">{section.label}</p>
                              <p className="text-[10px] text-slate-500 font-bold mt-1">{section.description}</p>
                            </div>
                            {selectedSections.includes(section.id) && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expiry Days */}
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      مدة الصلاحية (أيام) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={expiryDays}
                        onChange={e => setExpiryDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 30)))}
                        className="rounded-2xl border-slate-100 h-12 font-bold max-w-xs"
                      />
                      <span className="text-sm font-black text-slate-600">
                        ينتهي في: {new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString('ar')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setSelectedDoctor("")
                        setSelectedSections([])
                        setExpiryDays(30)
                      }}
                      className="flex-1 h-12 rounded-2xl font-black"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleShareFile}
                      disabled={isSaving}
                      className="flex-1 h-12 rounded-2xl font-black"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Check className="w-4 h-4 ml-2" />}
                      مشاركة الآن
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared Files List */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 mb-6">المشاركات النشطة</h3>
            {sharedFiles.length > 0 ? (
              <div className="space-y-4">
                {sharedFiles.map((file) => (
                  <motion.div
                    key={file.sharing_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-lg">{getDoctorName(file.doctor)}</p>
                          <p className="text-xs text-slate-500 font-bold mt-1">{file.doctor.specialization}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className={file.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'} variant="outline">
                              {file.status === 'active' ? 'نشطة' : 'منتهية'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeAccess(file.sharing_id)}
                        disabled={isSaving}
                        className="p-3 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Shared Sections */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">الأجزاء المشاركة:</p>
                      <div className="flex flex-wrap gap-2">
                        {file.shared_sections.map(sectionId => {
                          const section = AVAILABLE_SECTIONS.find(s => s.id === sectionId)
                          return section ? (
                            <Badge
                              key={sectionId}
                              className="bg-blue-50 text-blue-600 border-none px-3 py-1.5 rounded-xl font-bold text-xs"
                            >
                              {section.icon} {section.label}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>مشارك في: {formatDate(file.shared_at)}</span>
                      </div>
                      {file.expires_at && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>ينتهي في: {formatDate(file.expires_at)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
                <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold mb-4">لم تقم بمشاركة ملفك مع أي طبيب حتى الآن</p>
                <Button onClick={() => setShowAddForm(true)} className="rounded-xl font-black h-10 px-6">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مشاركة أولى
                </Button>
              </div>
            )}
          </div>
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
              {confirmAction.type === 'share' ? 'تأكيد المشاركة' : 'تأكيد إلغاء المشاركة'}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              {confirmAction.type === 'share'
                ? 'هل أنت متأكد من رغبتك في مشاركة ملفك الصحي مع هذا الطبيب؟'
                : 'هل أنت متأكد من رغبتك في إلغاء المشاركة؟ لن يتمكن الطبيب من الوصول للملف بعد ذلك.'}
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
                onClick={() => {
                  confirmAction.type === 'share' ? confirmShare() : confirmRevoke()
                }}
                disabled={isSaving}
                className={`flex-1 h-12 rounded-2xl font-black ${confirmAction.type === 'revoke' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 ml-2" />}
                {confirmAction.type === 'share' ? 'مشاركة' : 'إلغاء'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
