import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  Stethoscope,
  AlertCircle,
  Plus,
  CalendarDays,
  ChevronLeft,
  Trash2,
  CalendarClock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAppointments } from "@/hooks/useAppointments"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import RescheduleModal from "@/components/medical/RescheduleModal"

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function AppointmentSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-100 rounded-full" />
            <div className="h-3 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="h-12 bg-gray-100 rounded-2xl" />
        <div className="h-12 bg-gray-100 rounded-2xl" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-gray-100 rounded-2xl" />
        <div className="flex-1 h-12 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patientId, setPatientId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setPatientId(user.id)
    }
    fetchUser()
  }, [])

  const { appointments, loading, error, cancelAppointment, fetchAppointments } = useAppointments(patientId)

  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointmentDate >= today && a.status !== 'CANCELED'
  }).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())

  const pastAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return appointmentDate < today || a.status === 'COMPLETED' || a.status === 'CANCELED'
  }).sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())

  const displayedAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">قيد الانتظار</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">مؤكد</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">مكتمل</Badge>
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">ملغى</Badge>
      default:
        return <Badge className="rounded-full px-3 py-1 text-[10px] font-bold">{status}</Badge>
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟\nلا يمكن التراجع عن هذا الإجراء.')) return
    setCancellingId(id)
    try {
      await cancelAppointment(id)
      toast({
        title: "تم إلغاء الموعد",
        description: "تم إلغاء موعدك بنجاح.",
      })
      fetchAppointments()
    } catch (err) {
      console.error('Cancel error:', err)
      toast({
        title: "فشل الإلغاء",
        description: "لم نتمكن من إلغاء الموعد. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      })
    } finally {
      setCancellingId(null)
    }
  }

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsRescheduleModalOpen(true)
  }

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
        <div className="bg-white px-6 pt-8 pb-6 rounded-b-[3rem] shadow-sm border-b border-primary/5">
          <div className="container max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="h-12 w-28 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
            <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
        <div className="container max-w-4xl mx-auto px-6 py-8 space-y-4">
          {[1, 2, 3].map(i => <AppointmentSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-6 rounded-b-[3rem] shadow-sm border-b border-primary/5">
        <div className="container max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-2xl bg-accent/50 h-12 w-12 min-w-[44px] min-h-[44px]"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-black">مواعيدي</h1>
            </div>
            <Button
              onClick={() => navigate('/doctors')}
              className="rounded-2xl bg-primary shadow-lg shadow-primary/20 h-12 px-6 font-bold min-h-[44px]"
            >
              <Plus className="w-5 h-5 ml-2" />
              حجز جديد
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex p-1.5 bg-accent/30 rounded-2xl">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 min-h-[44px]",
                activeTab === "upcoming"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              القادمة ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 min-h-[44px]",
                activeTab === "past"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              السابقة ({pastAppointments.length})
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-8 space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-bold">حدث خطأ في تحميل المواعيد. يرجى تحديث الصفحة.</p>
          </div>
        )}

        {/* Appointment Cards */}
        {displayedAppointments.length > 0 ? (
          displayedAppointments.map((appointment: any) => (
            <div
              key={appointment.appointment_id}
              className="group bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-6 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            >
              {/* Doctor Info */}
              <div className="flex items-start justify-between mb-6 flex-row-reverse">
                <div className="flex items-center gap-4 flex-row-reverse text-right">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Stethoscope className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">
                      {appointment.doctor
                        ? `د. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
                        : 'طبيب متخصص'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {appointment.doctor?.specialization || 'استشاري'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(appointment.status || 'PENDING')}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-accent/30 p-3 rounded-2xl flex items-center gap-2 flex-row-reverse">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold">
                    {new Date(appointment.appointment_date).toLocaleDateString('ar-YE', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <div className="bg-accent/30 p-3 rounded-2xl flex items-center gap-2 flex-row-reverse">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold">
                    {appointment.appointment_time?.substring(0, 5)}
                  </span>
                </div>
              </div>

              {/* Reason */}
              {appointment.reason && (
                <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-right">
                  <p className="text-[10px] font-black text-primary mb-1">سبب الزيارة:</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{appointment.reason}</p>
                </div>
              )}

              {/* Actions — only for upcoming & non-cancelled */}
              {activeTab === "upcoming" && appointment.status !== 'CANCELED' && (
                <div className="flex gap-3">
                  {/* ✅ زر إعادة جدولة الموعد */}
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-2xl h-12 min-h-[44px] text-primary hover:bg-primary/5 font-bold text-xs border border-primary/10"
                    onClick={() => handleReschedule(appointment)}
                  >
                    <CalendarClock className="w-4 h-4 ml-2" />
                    إعادة جدولة الموعد
                  </Button>

                  {/* زر الإلغاء */}
                  <Button
                    variant="ghost"
                    disabled={cancellingId === appointment.appointment_id}
                    className="flex-1 rounded-2xl h-12 min-h-[44px] text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs border border-red-100"
                    onClick={() => handleCancel(appointment.appointment_id)}
                  >
                    {cancellingId === appointment.appointment_id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        جاري الإلغاء...
                      </span>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 ml-2" />
                        إلغاء
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          /* ─── Empty State ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 animate-in fade-in">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-primary/30" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {activeTab === "upcoming" ? "لا توجد مواعيد قادمة" : "لا توجد مواعيد سابقة"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-[220px] mx-auto mt-1">
                {activeTab === "upcoming"
                  ? "احجز موعدك الأول مع أحد أطبائنا المتخصصين"
                  : "مواعيدك السابقة ستظهر هنا"}
              </p>
            </div>
            {activeTab === "upcoming" && (
              <Button
                className="rounded-2xl bg-primary shadow-lg shadow-primary/20 h-12 px-8 font-bold min-h-[44px]"
                onClick={() => navigate('/doctors')}
              >
                <Plus className="w-5 h-5 ml-2" />
                احجز موعداً الآن
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  )
}
