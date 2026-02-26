import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  Users,
  UserPlus,
  Activity,
  Bell,
  Search,
  LayoutDashboard,
  Settings,
  ArrowRight,
  MapPin,
  Loader2,
  Trash2,
  UserCheck,
  Stethoscope,
  LogOut,
  Phone,
  Mail,
  X
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
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

interface HospitalDoctor {
  doctor_id: string
  first_name: string
  last_name: string
  specialty: string
  status: string
}

export default function HospitalDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [doctors, setDoctors] = useState<HospitalDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hospitalInfo, setHospitalInfo] = useState({ name: "مستشفى الحكمة", location: "صنعاء" })
  const [showVerificationAlerts, setShowVerificationAlerts] = useState(true)
  const [verifiedPhone, setVerifiedPhone] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState(false)

  useEffect(() => {
    fetchHospitalData()
  }, [])

  const fetchHospitalData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      // جلب بيانات المستشفى
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('hospital_name, location')
        .eq('hospital_id', user.id)
        .single()
      
      if (hospitalData) {
        setHospitalInfo({
          name: hospitalData.hospital_name,
          location: hospitalData.location
        })
      }

      // جلب الأطباء المرتبطين بالمستشفى
      const { data: doctorsData, error: doctorsErr } = await supabase
        .from('doctors')
        .select('doctor_id, first_name, last_name, specialty')
        .eq('hospital_id', user.id)

      if (doctorsErr) throw doctorsErr
      setDoctors(doctorsData || [])
      setError(null)
    } catch (err: any) {
      console.error("Error fetching hospital data:", err)
      setError(err.message || "فشل في جلب بيانات المستشفى")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ hospital_id: null })
        .eq('doctor_id', doctorId)

      if (error) throw error

      setDoctors(prev => prev.filter(d => d.doctor_id !== doctorId))
      toast({ title: "نجاح", description: "تم فصل الطبيب عن المنشأة بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تحديث بيانات الطبيب", variant: "destructive" })
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الخروج",
        variant: "destructive"
      })
    }
  }

  const handleVerifyPhone = () => {
    navigate('/verify-phone')
  }

  const handleVerifyEmail = () => {
    navigate('/verify-email')
  }

  const stats = [
    { label: "الأطباء", value: doctors.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "الأقسام", value: "8", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "طلبات جديدة", value: "2", icon: UserPlus, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "إشغال الأسرّة", value: "85%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-bold">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Top Header Section */}
      <div className="bg-white px-6 pt-8 pb-6 rounded-b-[3rem] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border-2 border-primary/10">
               <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
               <h1 className="text-xl font-black">{hospitalInfo.name}</h1>
               <p className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                 <MapPin className="w-3 h-3" />
                 {hospitalInfo.location}
               </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-2xl bg-accent/50 relative">
               <Bell className="w-5 h-5 text-primary" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
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
        </div>

        {/* Verification Alerts */}
        {showVerificationAlerts && (
          <div className="space-y-3 mb-6">
            {!verifiedPhone && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-blue-900">تأكيد رقم الهاتف</h3>
                    <p className="text-xs text-blue-700 mt-1">تأكيد رقم هاتفك يعزز أمان حسابك المهني</p>
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
                    <p className="text-xs text-green-700 mt-1">تحقق من بريدu0643 الإلكتروني لتأمين حسابك بالكامل</p>
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
           {stats.map((stat, i) => (
             <div key={i} className="bg-accent/30 p-4 rounded-2xl flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                   <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                   <span className="text-lg font-black block leading-none">{stat.value}</span>
                   <span className="text-[10px] text-muted-foreground font-bold">{stat.label}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
            { id: 'doctors', label: 'الأطباء', icon: Users },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map((tab) => (
            <Button 
              key={tab.id} 
              variant={activeTab === tab.id ? "medical" : "outline"} 
              className="rounded-full h-10 px-6 text-xs whitespace-nowrap gap-2"
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  آخر الأنشطة
                </h3>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground text-center py-10">لا توجد أنشطة حديثة لعرضها</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm">قائمة الكادر الطبي ({doctors.length})</h3>
                <Button size="sm" className="rounded-xl h-8 text-[10px] gap-1">
                  <UserPlus className="w-3 h-3" />
                  إضافة طبيب
                </Button>
              </div>
              
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.doctor_id} className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">د. {doctor.first_name} {doctor.last_name}</h4>
                        <p className="text-[10px] text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 bg-accent/30">
                        <Settings className="w-4 h-4 text-primary" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl" className="rounded-2xl">
                          <AlertDialogTitle>تأكيد الفصل</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من فصل الطبيب عن المنشأة؟ سيظل ملفه متاحاً كطبيب مستقل.</AlertDialogDescription>
                          <div className="flex gap-3 justify-end mt-4">
                            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDoctor(doctor.doctor_id)} className="bg-red-600 hover:bg-red-700 rounded-xl">تأكيد الفصل</AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-primary/20">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">لا يوجد أطباء مرتبطون بالمنشأة حالياً</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
