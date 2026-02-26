import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Search,
  LogOut,
  Phone,
  Mail,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDoctorData } from "@/hooks/useDoctorData"
import { supabase } from "@/integrations/supabase/client"

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [showVerificationAlerts, setShowVerificationAlerts] = useState(true)
  const [verifiedPhone, setVerifiedPhone] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState(false)
  
  const { doctor, appointments, patients, loading, error, updateAppointmentStatus } = useDoctorData()

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold">لوحة تحكم الطبيب</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
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
          <div>
            <h1 className="text-2xl font-bold mb-2">لوحة تحكم الطبيب</h1>
            {doctor && (
              <p className="text-sm text-muted-foreground">
                مرحباً بك، د. {doctor.first_name} {doctor.last_name}
              </p>
            )}
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
          <div className="space-y-3 mb-8">
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            <TabsTrigger value="patients">المرضى</TabsTrigger>
            <TabsTrigger value="labs">الفحوصات</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن موعد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              {appointments?.map((apt: any) => (
                <div key={apt.id} className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{apt.patient_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3 inline ml-1" />
                      {new Date(apt.appointment_time).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(apt.status)}>
                    {getStatusLabel(apt.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مريض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              {patients?.map((patient: any) => (
                <div key={patient.id} className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{patient.first_name} {patient.last_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Users className="w-3 h-3 inline ml-1" />
                      {patient.phone}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد فحوصات معلقة</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
