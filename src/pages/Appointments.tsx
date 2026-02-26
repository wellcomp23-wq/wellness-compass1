import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  X,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAppointments } from "@/hooks"
import BookAppointmentModal from "@/components/medical/BookAppointmentModal"
import { supabase } from "@/integrations/supabase/client"

export default function AppointmentsPage() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const { appointments, loading, error, updateAppointment } = useAppointments(patientId)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")

      setCurrentUser(user)
      setPatientId(user.id)
    } catch (err) {
      console.error("Error fetching user:", err)
    }
  }

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
        return <Badge className="bg-yellow-100 text-yellow-800 text-[10px]">قيد الانتظار</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800 text-[10px]">مؤكد</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 text-[10px]">مكتمل</Badge>
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-800 text-[10px]">ملغى</Badge>
      default:
        return <Badge className="text-[10px]">{status}</Badge>
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) {
      await updateAppointment(appointmentId, { status: 'CANCELED' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">مواعيدي</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل المواعيد...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header with Back Button */}
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
            <h1 className="text-2xl font-bold">مواعيدي</h1>
          </div>
          <Button 
            className="rounded-xl"
            onClick={() => setIsBookingModalOpen(true)}
          >
            <Plus className="w-4 h-4 ml-2" />
            حجز موعد
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 border border-primary/5">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === "upcoming"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            القادمة ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === "past"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            السابقة ({pastAppointments.length})
          </button>
        </div>

        {/* Appointments List */}
        {displayedAppointments.length > 0 ? (
          <div className="space-y-4">
            {displayedAppointments.map((appointment: any) => {
              const doctor = appointment.doctor
              const hospital = doctor?.hospital

              return (
                <div
                  key={appointment.appointment_id}
                  className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Doctor Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-7 h-7 text-primary" />
                      </div>

                      {/* Appointment Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm mb-1">
                          {doctor ? `د. ${doctor.first_name} ${doctor.last_name}` : 'طبيب'}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {doctor?.specialty || 'تخصص'}
                        </p>

                        {/* Date and Time */}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(appointment.appointment_date).toLocaleDateString('ar')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {appointment.appointment_time}
                          </div>
                        </div>

                        {/* Hospital */}
                        {hospital && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            {hospital.hospital_name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0 ml-4">
                      {getStatusBadge(appointment.status || 'PENDING')}
                    </div>
                  </div>

                  {/* Reason */}
                  {appointment.reason_for_visit && (
                    <div className="mb-4 p-3 bg-primary/5 rounded-xl">
                      <p className="text-xs font-medium text-primary mb-1">سبب الزيارة:</p>
                      <p className="text-xs text-muted-foreground">{appointment.reason_for_visit}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="mb-4 p-3 bg-secondary/5 rounded-xl">
                      <p className="text-xs font-medium text-secondary mb-1">ملاحظات:</p>
                      <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {activeTab === "upcoming" && appointment.status !== 'CANCELED' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg text-xs"
                        onClick={() => handleCancelAppointment(appointment.appointment_id)}
                      >
                        <X className="w-3.5 h-3.5 ml-1" />
                        إلغاء الموعد
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {activeTab === "upcoming" ? "لا توجد مواعيد قادمة" : "لا توجد مواعيد سابقة"}
            </p>
            {activeTab === "upcoming" && (
              <Button 
                className="mt-4 rounded-xl"
                onClick={() => navigate('/doctors')}
              >
                حجز موعد جديد
              </Button>
            )}
          </div>
        )}

        {/* Booking Modal */}
        <BookAppointmentModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          doctorId="1"
          doctorName="اختر طبيباً"
          hospitalName=""
          onSuccess={() => {
            setIsBookingModalOpen(false)
            window.location.reload()
          }}
        />
      </div>
    </div>
  )
}
