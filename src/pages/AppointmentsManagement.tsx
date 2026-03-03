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
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  Stethoscope
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface Appointment {
  appointment_id: string
  doctor_id: string
  doctor_name: string
  specialization: string
  appointment_date: string
  appointment_time: string
  location: string
  reason: string
  status: string
  notes: string
}

interface ValidationError {
  field: string
  message: string
}

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'استشارة عامة' },
  { value: 'follow_up', label: 'متابعة' },
  { value: 'lab_test', label: 'فحوصات مخبرية' },
  { value: 'imaging', label: 'تصوير طبي' },
  { value: 'procedure', label: 'إجراء طبي' },
  { value: 'vaccination', label: 'تطعيم' },
  { value: 'dental', label: 'أسنان' },
  { value: 'other', label: 'أخرى' }
]

export default function AppointmentsManagementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    doctor_name: "",
    specialization: "",
    appointment_date: "",
    appointment_time: "",
    location: "",
    reason: "",
    notes: ""
  })
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'save' | 'delete' | 'cancel', id?: string }>({ type: 'save' })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")
      setCurrentUser(user)

      // Fetch appointments
      const { data: appsList, error: appsErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: true })

      if (appsList) {
        setAppointments(appsList)
      }
    } catch (err) {
      console.error("Error fetching appointments:", err)
      toast({ title: "خطأ", description: "فشل في تحميل المواعيد", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationError[] = []

    if (!formData.doctor_name.trim()) {
      errors.push({ field: 'doctor_name', message: 'اسم الطبيب مطلوب' })
    }
    if (!formData.appointment_date) {
      errors.push({ field: 'appointment_date', message: 'التاريخ مطلوب' })
    }
    if (!formData.appointment_time) {
      errors.push({ field: 'appointment_time', message: 'الوقت مطلوب' })
    }
    if (!formData.reason.trim()) {
      errors.push({ field: 'reason', message: 'سبب الموعد مطلوب' })
    }
    if (!formData.location.trim()) {
      errors.push({ field: 'location', message: 'مكان الموعد مطلوب' })
    }

    // Check if appointment date is in the past
    const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
    if (appointmentDateTime < new Date() && !editingId) {
      errors.push({ field: 'appointment_date', message: 'لا يمكن إضافة موعد في الماضي' })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const resetForm = () => {
    setFormData({
      doctor_name: "",
      specialization: "",
      appointment_date: "",
      appointment_time: "",
      location: "",
      reason: "",
      notes: ""
    })
    setValidationErrors([])
    setEditingId(null)
  }

  const handleAddAppointment = () => {
    resetForm()
    setShowAddForm(true)
  }

  const handleEditAppointment = (app: Appointment) => {
    setFormData({
      doctor_name: app.doctor_name,
      specialization: app.specialization,
      appointment_date: app.appointment_date,
      appointment_time: app.appointment_time,
      location: app.location,
      reason: app.reason,
      notes: app.notes
    })
    setEditingId(app.appointment_id)
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

      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)
      const status = appointmentDateTime < new Date() ? 'COMPLETED' : 'SCHEDULED'

      if (editingId) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update({
            ...formData,
            status
          })
          .eq('appointment_id', editingId)

        if (error) throw error
        toast({ title: "نجح", description: "تم تحديث الموعد بنجاح" })
      } else {
        // Add new appointment
        const { error } = await supabase
          .from('appointments')
          .insert({
            patient_id: currentUser.id,
            ...formData,
            status
          })

        if (error) throw error
        toast({ title: "نجح", description: "تم إضافة الموعد بنجاح" })
      }

      resetForm()
      setShowAddForm(false)
      await fetchAppointments()
    } catch (err: any) {
      console.error("Error saving appointment:", err)
      toast({ title: "خطأ", description: err.message || "فشل في حفظ الموعد", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAppointment = (appId: string) => {
    setConfirmAction({ type: 'delete', id: appId })
    setShowConfirmDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('appointment_id', confirmAction.id)

      if (error) throw error

      toast({ title: "نجح", description: "تم حذف الموعد بنجاح" })
      await fetchAppointments()
    } catch (err: any) {
      console.error("Error deleting appointment:", err)
      toast({ title: "خطأ", description: err.message || "فشل في حذف الموعد", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(e => e.field === fieldName)?.message
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':')
    return `${hours}:${minutes}`
  }

  const getAppointmentStatus = (app: Appointment): { label: string; color: string; icon: any } => {
    const appointmentDateTime = new Date(`${app.appointment_date}T${app.appointment_time}`)
    const now = new Date()

    if (appointmentDateTime < now) {
      return { label: 'مكتمل', color: 'bg-slate-100 text-slate-600', icon: CheckCircle }
    } else if (appointmentDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: 'قريب جداً', color: 'bg-yellow-50 text-yellow-600', icon: AlertTriangle }
    }
    return { label: 'مجدول', color: 'bg-emerald-50 text-emerald-600', icon: Calendar }
  }

  const filteredAppointments = appointments.filter(app =>
    app.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingAppointments = filteredAppointments.filter(app => {
    const appointmentDateTime = new Date(`${app.appointment_date}T${app.appointment_time}`)
    return appointmentDateTime >= new Date()
  })

  const pastAppointments = filteredAppointments.filter(app => {
    const appointmentDateTime = new Date(`${app.appointment_date}T${app.appointment_time}`)
    return appointmentDateTime < new Date()
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري تحميل المواعيد...</p>
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
              <h1 className="text-xl font-black text-slate-800">المواعيد الطبية</h1>
              <p className="text-xs text-slate-400 font-bold">إدارة وتتبع مواعيدك الطبية</p>
            </div>
          </div>
          <Button 
            onClick={handleAddAppointment}
            className="rounded-xl font-black h-10 px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 ml-2" />
            موعد جديد
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
                  {editingId ? 'تعديل الموعد' : 'إضافة موعد جديد'}
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
                        اسم الطبيب <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.doctor_name}
                        onChange={e => setFormData({...formData, doctor_name: e.target.value})}
                        className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('doctor_name') ? 'border-red-300' : ''}`}
                        placeholder="مثال: د. أحمد محمد"
                      />
                      {getFieldError('doctor_name') && <p className="text-xs text-red-600">{getFieldError('doctor_name')}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">التخصص</label>
                      <Input
                        value={formData.specialization}
                        onChange={e => setFormData({...formData, specialization: e.target.value})}
                        className="rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50"
                        placeholder="مثال: طبيب عام"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">
                        التاريخ <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.appointment_date}
                        onChange={e => setFormData({...formData, appointment_date: e.target.value})}
                        className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('appointment_date') ? 'border-red-300' : ''}`}
                      />
                      {getFieldError('appointment_date') && <p className="text-xs text-red-600">{getFieldError('appointment_date')}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500">
                        الوقت <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="time"
                        value={formData.appointment_time}
                        onChange={e => setFormData({...formData, appointment_time: e.target.value})}
                        className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('appointment_time') ? 'border-red-300' : ''}`}
                      />
                      {getFieldError('appointment_time') && <p className="text-xs text-red-600">{getFieldError('appointment_time')}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">
                      المكان <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('location') ? 'border-red-300' : ''}`}
                      placeholder="مثال: مستشفى الملك فيصل"
                    />
                    {getFieldError('location') && <p className="text-xs text-red-600">{getFieldError('location')}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">
                      سبب الموعد <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.reason}
                      onChange={e => setFormData({...formData, reason: e.target.value})}
                      className={`rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50 ${getFieldError('reason') ? 'border-red-300' : ''}`}
                      placeholder="مثال: فحص دوري"
                    />
                    {getFieldError('reason') && <p className="text-xs text-red-600">{getFieldError('reason')}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">ملاحظات</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full rounded-2xl border border-slate-100 h-24 font-bold bg-slate-50/50 p-4 resize-none"
                      placeholder="مثال: إحضار التقارير السابقة"
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
          {appointments.length > 0 && (
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن موعد..."
                  className="rounded-2xl border-slate-100 h-12 font-bold pl-12 bg-white"
                />
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                المواعيد القادمة ({upcomingAppointments.length})
              </h2>
              <div className="space-y-4">
                {upcomingAppointments.map(app => {
                  const status = getAppointmentStatus(app)
                  const StatusIcon = status.icon
                  return (
                    <motion.div
                      key={app.appointment_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-black text-slate-800">د. {app.doctor_name}</p>
                              <Badge className={`rounded-full font-black text-[10px] uppercase tracking-widest ${status.color}`}>
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 font-bold">{app.specialization}</p>

                            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{formatDate(app.appointment_date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>{formatTime(app.appointment_time)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{app.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Stethoscope className="w-4 h-4 text-slate-400" />
                                <span>{app.reason}</span>
                              </div>
                            </div>

                            {app.notes && (
                              <p className="text-xs text-slate-500 mt-3 p-3 bg-slate-50 rounded-xl">
                                📝 {app.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(app)}
                            className="rounded-xl font-black h-10 px-3"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAppointment(app.appointment_id)}
                            className="rounded-xl font-black h-10 px-3 text-red-500 border-red-50 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-slate-400" />
                المواعيد المكتملة ({pastAppointments.length})
              </h2>
              <div className="space-y-4">
                {pastAppointments.map(app => (
                  <motion.div
                    key={app.appointment_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-black text-slate-800">د. {app.doctor_name}</p>
                            <Badge className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                              مكتمل
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 font-bold">{app.specialization}</p>

                          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{formatDate(app.appointment_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>{formatTime(app.appointment_time)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppointment(app.appointment_id)}
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
          {appointments.length === 0 && (
            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-50 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">لم تقم بإضافة أي مواعيد بعد</p>
              <p className="text-xs text-slate-400 mt-2">ابدأ بإضافة مواعيدك الطبية لتتبعها بسهولة</p>
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
                ? 'هل أنت متأكد من رغبتك في حفظ بيانات الموعد؟'
                : 'هل أنت متأكد من رغبتك في حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.'}
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
