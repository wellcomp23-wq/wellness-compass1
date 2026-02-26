import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  FlaskConical,
  Activity,
  CheckCircle2,
  ClipboardList,
  Search,
  Bell,
  MoreVertical,
  Loader2,
  ArrowRight,
  User,
  Calendar,
  Trash2,
  Eye,
  FileText,
  Upload,
  AlertCircle,
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
import { supabase } from "@/integrations/supabase/client"

interface LabRequest {
  request_id: string
  patient_id: string
  doctor_id: string
  lab_id: string
  test_name: string
  urgency: string
  status: string
  created_at: string
  notes: string
  patient?: {
    first_name: string
    last_name: string
    phone: string
  }
  doctor?: {
    first_name: string
    last_name: string
  }
}

export default function LabDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [requests, setRequests] = useState<LabRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [labName, setLabName] = useState("مختبر الشفاء")
  const [showVerificationAlerts, setShowVerificationAlerts] = useState(true)
  const [verifiedPhone, setVerifiedPhone] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState(false)

  useEffect(() => {
    fetchLabData()
  }, [])

  const fetchLabData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      // جلب بيانات المختبر
      const { data: labData } = await supabase
        .from('laboratories')
        .select('name')
        .eq('lab_id', user.id)
        .single()
      
      if (labData) setLabName(labData.name)

      // جلب طلبات التحاليل
      const { data: requestsData, error: requestsErr } = await supabase
        .from('lab_test_requests')
        .select(`
          *,
          patient:patients(first_name, last_name, phone),
          doctor:doctors(first_name, last_name)
        `)
        .eq('lab_id', user.id)
        .order('created_at', { ascending: false })

      if (requestsErr) throw requestsErr
      setRequests(requestsData || [])
      setError(null)
    } catch (err: any) {
      console.error("Error fetching lab data:", err)
      setError(err.message || "فشل في جلب بيانات المختبر")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('lab_test_requests')
        .update({ status: newStatus })
        .eq('request_id', requestId)

      if (error) throw error

      setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, status: newStatus } : r))
      toast({ title: "نجاح", description: "تم تحديث حالة الطلب" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تحديث الطلب", variant: "destructive" })
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('lab_test_requests')
        .delete()
        .eq('request_id', requestId)

      if (error) throw error

      setRequests(prev => prev.filter(r => r.request_id !== requestId))
      toast({ title: "نجاح", description: "تم حذف الطلب بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف الطلب", variant: "destructive" })
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'جديد'
      case 'PROCESSING': return 'قيد المعالجة'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELED': return 'ملغي'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-purple-100 text-purple-700'
      case 'PROCESSING': return 'bg-blue-100 text-blue-700'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700'
      case 'CANCELED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredRequests = requests.filter(r => 
    r.patient?.first_name.includes(searchQuery) || 
    r.patient?.last_name.includes(searchQuery) ||
    r.lab_request_id.includes(searchQuery) ||
    r.test_type.includes(searchQuery)
  )

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
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-6 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
               <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-lg font-black">{labName}</h1>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <Badge className="bg-purple-100 text-purple-600 border-none text-[8px] px-2 py-0 rounded-lg">مختبر معتمد</Badge>
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[9px] text-muted-foreground font-bold">مفتوح الآن</span>
               </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-2xl bg-accent/50 h-10 w-10">
               <Bell className="w-5 h-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-red-50 h-10 w-10"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Verification Alerts */}
        {showVerificationAlerts && (
          <div className="space-y-3 mb-6 px-4">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "جديد", val: requests.filter(r => r.status === 'PENDING').length, icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "معالجة", val: requests.filter(r => r.status === 'PROCESSING').length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "مكتمل", val: requests.filter(r => r.status === 'COMPLETED').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "إجمالي", val: requests.length, icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat, i) => (
            <div key={i} className={cn("p-3 rounded-2xl flex flex-col items-center gap-1", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs font-black">{stat.val}</span>
              <span className="text-[8px] text-muted-foreground font-bold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مريض أو تحليل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-2xl bg-white border-primary/10 shadow-sm"
          />
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-primary/5 rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="requests" className="rounded-xl font-bold">الطلبات الجارية</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl font-bold">السجل</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {filteredRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELED').length > 0 ? (
              filteredRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELED').map((request) => (
                <div key={request.request_id} className="bg-white rounded-[2rem] border border-primary/5 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{request.patient?.first_name} {request.patient?.last_name}</h3>
                        <p className="text-[10px] text-muted-foreground">{request.request_id} • {new Date(request.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={cn("rounded-lg border-none text-[10px]", getStatusColor(request.status))}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      {request.urgency === 'URGENT' && (
                        <Badge className="bg-red-100 text-red-600 text-[8px] border-none animate-pulse">عاجل جداً</Badge>
                      )}
                    </div>
                  </div>

                  <div className="bg-accent/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        نوع التحليل: {request.test_name}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">بطلب من: د. {request.doctor?.first_name} {request.doctor?.last_name}</p>
                    {request.notes && (
                      <div className="mt-2 p-2 bg-white/50 rounded-lg border border-primary/5">
                        <p className="text-[10px] text-muted-foreground"><span className="font-bold">ملاحظات الطبيب:</span> {request.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl" className="rounded-2xl">
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                          <div className="flex gap-3 justify-end mt-4">
                            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRequest(request.request_id)} className="bg-red-600 hover:bg-red-700 rounded-xl">حذف الطلب</AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'PENDING' && (
                        <Button className="rounded-xl h-10 px-6 font-bold" onClick={() => handleStatusChange(request.request_id, 'PROCESSING')}>بدء المعالجة</Button>
                      )}
                      {request.status === 'PROCESSING' && (
                        <Button className="rounded-xl h-10 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => handleStatusChange(request.request_id, 'COMPLETED')}>
                          <Upload className="w-4 h-4" />
                          رفع النتائج
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-primary/20">
                <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">لا توجد تحاليل جارية حالياً</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="text-center py-20 bg-white rounded-[2rem] border border-primary/5">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-bold">سجل التحاليل المكتملة يظهر هنا</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
