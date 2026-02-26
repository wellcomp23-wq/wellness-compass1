import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import BookAppointmentModal from "@/components/medical/BookAppointmentModal"
import {
  Heart,
  Brain,
  Calendar,
  Pill,
  ShieldAlert,
  Users,
  Stethoscope,
  Activity,
  Clock,
  Plus,
  ArrowLeft,
  Search,
  ChevronLeft,
  FileText,
  Loader2,
  AlertCircle,
  Bell,
  TrendingUp,
  LogOut,
  Phone,
  Mail,
  CheckCircle2,
  X
} from "lucide-react"
import { useAppointments } from "@/hooks"
import { supabase } from "@/integrations/supabase/client"

export default function Home() {
  const navigate = useNavigate()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dailyStats, setDailyStats] = useState({
    remainingDoses: 0,
    todayAppointments: 0,
    adherenceRate: 0,
    pendingNotifications: 0
  })
  const [nextAppointment, setNextAppointment] = useState<any>(null)
  const [todaysMedications, setTodaysMedications] = useState<any[]>([])
  const [showVerificationAlerts, setShowVerificationAlerts] = useState(true)
  const [verifiedPhone, setVerifiedPhone] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async (retryCount = 0) => {
    try {
      setLoading(true)

      // الحصول على المستخدم الحالي من الجلسة أولاً لضمان توفر التوكن
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr) throw sessionErr
      
      const user = session?.user
      if (!user) {
        navigate('/login')
        return
      }

      setCurrentUser(user)

      // جلب بيانات المريض
      const { data: patientData, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', user.id)
        .single()

      if (patientErr && patientErr.code !== 'PGRST116') throw patientErr
      setPatientData(patientData)

      // جلب الإحصائيات اليومية
      const { data: medicationsData } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .gte('appointment_time', new Date().toISOString())
        .order('appointment_time', { ascending: true })
        .limit(1)

      setDailyStats({
        remainingDoses: medicationsData?.length || 0,
        todayAppointments: appointmentsData?.length || 0,
        adherenceRate: 85,
        pendingNotifications: 3
      })

      setNextAppointment(appointmentsData?.[0] || null)
      setTodaysMedications(medicationsData || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching user data:', err)
      setError(err.message || 'فشل في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      setError('فشل في تسجيل الخروج')
    }
  }

  const handleVerifyPhone = () => {
    navigate('/verify-phone')
  }

  const handleVerifyEmail = () => {
    navigate('/verify-email')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-bold">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-6 rounded-b-3xl shadow-sm mb-6 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">مرحباً بك</h1>
            <p className="text-sm text-muted-foreground">
              {patientData?.first_name} {patientData?.last_name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full hover:bg-red-50"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 text-red-600" />
          </Button>
        </div>

        {/* Verification Alerts */}
        {showVerificationAlerts && (
          <div className="space-y-3">
            {!verifiedPhone && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-blue-900">تأكيد رقم الهاتف</h3>
                    <p className="text-xs text-blue-700 mt-1">تأكيد رقم هاتفك يعزز أمان حسابك</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 h-8"
                    onClick={handleVerifyPhone}
                  >
                    تأكيد
                  </Button>
                  <button
                    onClick={() => setVerifiedPhone(true)}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {!verifiedEmail && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-green-900">التحقق من البريد الإلكتروني</h3>
                    <p className="text-xs text-green-700 mt-1">تحقق من بريدك الإلكتروني لتأمين حسابك بالكامل</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-green-200 text-green-600 hover:bg-green-50 h-8"
                    onClick={handleVerifyEmail}
                  >
                    تحقق
                  </Button>
                  <button
                    onClick={() => setVerifiedEmail(true)}
                    className="text-green-400 hover:text-green-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Daily Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "الجرعات المتبقية", value: dailyStats.remainingDoses, icon: Pill, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "المواعيد اليوم", value: dailyStats.todayAppointments, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "معدل الالتزام", value: `${dailyStats.adherenceRate}%`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "التنبيهات", value: dailyStats.pendingNotifications, icon: Bell, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-2xl flex items-center gap-3 ${stat.bg}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <span className="text-lg font-black block">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground font-bold">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">الموعد القادم</h2>
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{new Date(nextAppointment.appointment_time).toLocaleDateString('ar-SA')}</span>
              </div>
              <Button className="w-full rounded-xl" onClick={() => navigate('/appointments')}>
                عرض المزيد
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <h2 className="text-lg font-black mb-4">الخدمات السريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "الأطباء", icon: Stethoscope, path: "/doctors", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "الصيدليات", icon: Pill, path: "/pharmacies", color: "text-green-600", bg: "bg-green-50" },
              { label: "المختبرات", icon: Activity, path: "/labs", color: "text-purple-600", bg: "bg-purple-50" },
              { label: "السجل الطبي", icon: FileText, path: "/medical-record", color: "text-orange-600", bg: "bg-orange-50" },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 ${action.bg} hover:shadow-md transition`}
              >
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <span className="text-xs font-bold text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Checker */}
        <Button
          className="w-full rounded-2xl h-14 mb-8"
          onClick={() => navigate('/symptom-checker')}
        >
          <Brain className="w-5 h-5 ml-2" />
          محلل الأعراض الذكي
        </Button>
      </div>
    </div>
  )
}
