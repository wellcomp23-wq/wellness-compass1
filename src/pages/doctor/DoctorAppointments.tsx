import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  Loader2,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText
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

interface Appointment {
  appointment_id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  reason_for_visit: string
  status: string
  patient?: {
    first_name: string
    last_name: string
    date_of_birth: string
    phone: string
  }
}

export default function DoctorAppointments() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")

      setCurrentUser(user)

      // جلب الطبيب
      const { data: doctorData, error: doctorErr } = await supabase
        .from('doctors')
        .select('doctor_id')
        .eq('doctor_id', user.id)
        .single()

      if (doctorErr && doctorErr.code !== 'PGRST116') throw doctorErr
      if (!doctorData) throw new Error("لم يتم العثور على بيانات الطبيب")

      // جلب المواعيد مع بيانات المريض
      const { data: appointmentsData, error: appointmentsErr } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name, date_of_birth, phone)
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: false })

      if (appointmentsErr) throw appointmentsErr

      setAppointments(appointmentsData || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب المواعيد")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('appointment_id', appointmentId)

      if (error) throw error

      setAppointments(appts =>
        appts.map(a => a.appointment_id === appointmentId
          ? { ...a, status: newStatus }
          : a
        )
      )

      toast({
        title: "نجاح",
        description: `تم تحديث حالة الموعد إلى ${newStatus}`
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الموعد",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('appointment_id', appointmentId)

      if (error) throw error

      setAppointments(appts =>
        appts.filter(a => a.appointment_id !== appointmentId)
      )

      toast({
        title: "نجاح",
        description: "تم حذف الموعد بنجاح"
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الموعد",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-500' }
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-500' }
      case 'CANCELED':
        return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-500' }
      case 'COMPLETED':
        return { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-500' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-500' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'مؤكد'
      case 'PENDING': return 'قيد الانتظار'
      case 'CANCELED': return 'ملغي'
      case 'COMPLETED': return 'مكتمل'
      default: return status
    }
  }

  const getPatientAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING')
  const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED')
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED')
  const canceledAppointments = appointments.filter(a => a.status === 'CANCELED')

  const filteredPending = pendingAppointments.filter(a =>
    a.patient?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patient?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredConfirmed = confirmedAppointments.filter(a =>
    a.patient?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patient?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCompleted = completedAppointments.filter(a =>
    a.patient?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.patient?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold">إدارة المواعيد</h1>
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
            <h1 className="text-2xl font-bold">إدارة المواعيد</h1>
          </div>
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
            placeholder="ابحث عن مريض..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-xl bg-white border-primary/10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white border border-primary/5 rounded-xl p-1">
            <TabsTrigger value="pending" className="rounded-lg text-xs">
              قيد الانتظار ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-lg text-xs">
              مؤكدة ({confirmedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs">
              مكتملة ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="canceled" className="rounded-lg text-xs">
              ملغاة ({canceledAppointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Appointments */}
          <TabsContent value="pending" className="space-y-3">
            {filteredPending.length > 0 ? (
              <div className="space-y-3">
                {filteredPending.map((appointment) => {
                  const colors = getStatusColor(appointment.status)
                  return (
                    <div 
                      key={appointment.appointment_id}
                      className={`rounded-2xl border p-4 hover:shadow-md transition-all ${colors.bg}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <h3 className="font-bold text-sm">
                              {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </h3>
                            <Badge className="text-[10px]">
                              {getPatientAge(appointment.patient?.date_of_birth || '')} سنة
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {appointment.patient?.phone}
                          </p>
                        </div>
                        <Badge className={`${colors.badge} text-white`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      <div className="mb-3 p-3 bg-white/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">سبب الزيارة</p>
                        <p className="text-sm font-medium">{appointment.reason_for_visit}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.appointment_date).toLocaleDateString('ar')}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-4 h-4" />
                          {appointment.appointment_time}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="flex-1 rounded-lg text-xs gap-1"
                          onClick={() => handleStatusChange(appointment.appointment_id, 'CONFIRMED')}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          تأكيد
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 rounded-lg text-xs gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              إلغاء
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl" className="rounded-2xl">
                            <AlertDialogTitle>تأكيد الإلغاء</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من إلغاء هذا الموعد؟ سيتم إخطار المريض بالإلغاء.
                            </AlertDialogDescription>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel className="rounded-lg">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleStatusChange(appointment.appointment_id, 'CANCELED')}
                                className="bg-red-600 hover:bg-red-700 rounded-lg"
                              >
                                تأكيد الإلغاء
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">لا توجد مواعيد قيد الانتظار</p>
              </div>
            )}
          </TabsContent>

          {/* Confirmed Appointments */}
          <TabsContent value="confirmed" className="space-y-3">
            {filteredConfirmed.length > 0 ? (
              <div className="space-y-3">
                {filteredConfirmed.map((appointment) => {
                  const colors = getStatusColor(appointment.status)
                  return (
                    <div 
                      key={appointment.appointment_id}
                      className={`rounded-2xl border p-4 hover:shadow-md transition-all ${colors.bg}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <h3 className="font-bold text-sm">
                              {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {appointment.patient?.phone}
                          </p>
                        </div>
                        <Badge className={`${colors.badge} text-white`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.appointment_date).toLocaleDateString('ar')}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-4 h-4" />
                          {appointment.appointment_time}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="flex-1 rounded-lg text-xs gap-1"
                          onClick={() => handleStatusChange(appointment.appointment_id, 'COMPLETED')}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          إكمال
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg text-xs gap-1"
                          onClick={() => navigate(`/doctor/patient/${appointment.patient_id}`)}
                        >
                          <Eye className="w-3 h-3" />
                          عرض الملف
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">لا توجد مواعيد مؤكدة</p>
              </div>
            )}
          </TabsContent>

          {/* Completed Appointments */}
          <TabsContent value="completed" className="space-y-3">
            {filteredCompleted.length > 0 ? (
              <div className="space-y-3">
                {filteredCompleted.map((appointment) => {
                  const colors = getStatusColor(appointment.status)
                  return (
                    <div 
                      key={appointment.appointment_id}
                      className={`rounded-2xl border p-4 opacity-75 ${colors.bg}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-sm">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleDateString('ar')} - {appointment.appointment_time}
                          </p>
                        </div>
                        <Badge className={`${colors.badge} text-white`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">لا توجد مواعيد مكتملة</p>
              </div>
            )}
          </TabsContent>

          {/* Canceled Appointments */}
          <TabsContent value="canceled" className="space-y-3">
            {canceledAppointments.length > 0 ? (
              <div className="space-y-3">
                {canceledAppointments.map((appointment) => {
                  const colors = getStatusColor(appointment.status)
                  return (
                    <div 
                      key={appointment.appointment_id}
                      className={`rounded-2xl border p-4 opacity-50 ${colors.bg}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm line-through">
                            {appointment.patient?.first_name} {appointment.patient?.last_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(appointment.appointment_date).toLocaleDateString('ar')}
                          </p>
                        </div>
                        <Badge className={`${colors.badge} text-white`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <XCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">لا توجد مواعيد ملغاة</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
