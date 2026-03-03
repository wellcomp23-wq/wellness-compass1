import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Beaker,
  Search,
  MapPin,
  Star,
  AlertCircle,
  Loader2,
  ArrowRight,
  Send,
  CheckCircle2
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

interface Lab {
  lab_id: string
  name: string
  address: string
  phone: string
  average_rating: number
  available_tests: string[]
}

interface LabRequest {
  request_id: string
  patient_id: string
  lab_id: string
  test_name: string
  urgency: string
  status: string
  created_at: string
  patient?: {
    first_name: string
    last_name: string
  }
  lab?: {
    name: string
  }
}

export default function DoctorLabs() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [labs, setLabs] = useState<Lab[]>([])
  const [requests, setRequests] = useState<LabRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
  const [requestForm, setRequestForm] = useState({
    patientId: "",
    testType: "",
    urgency: "NORMAL",
    notes: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")

      // جلب المختبرات
      const { data: labsData, error: labsErr } = await supabase
        .from('laboratories')
        .select('*')
        .order('average_rating', { ascending: false })

      if (labsErr) throw labsErr
      setLabs(labsData || [])

      // جلب طلبات المختبرات
      const { data: requestsData, error: requestsErr } = await supabase
        .from('lab_test_requests')
        .select(`
          *,
          patient:patients(first_name, last_name),
          lab:laboratories(name)
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      if (requestsErr) throw requestsErr
      setRequests(requestsData || [])

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async () => {
    try {
      if (!selectedLab || !requestForm.patientId || !requestForm.testType) {
        toast({
          title: "خطأ",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive"
        })
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase
        .from('lab_test_requests')
        .insert({
          doctor_id: user.id,
          patient_id: requestForm.patientId,
          lab_id: selectedLab.lab_id,
          test_name: requestForm.testType,
          urgency: requestForm.urgency,
          notes: requestForm.notes,
          status: 'PENDING'
        })

      if (error) throw error

      toast({
        title: "نجاح",
        description: "تم إرسال طلب التحليل بنجاح"
      })

      setRequestForm({ patientId: "", testType: "", urgency: "NORMAL", notes: "" })
      setSelectedLab(null)
      await fetchData()
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال الطلب",
        variant: "destructive"
      })
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('lab_test_requests')
        .update({ status: 'CANCELED' })
        .eq('request_id', requestId)

      if (error) throw error

      setRequests(reqs => reqs.map(r =>
        r.request_id === requestId ? { ...r, status: 'CANCELED' } : r
      ))

      toast({
        title: "نجاح",
        description: "تم إلغاء الطلب بنجاح"
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء الطلب",
        variant: "destructive"
      })
    }
  }

  const filteredLabs = labs.filter(lab =>
    lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingRequests = requests.filter(r => r.status === 'PENDING')
  const completedRequests = requests.filter(r => r.status === 'COMPLETED')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold">إدارة طلبات المختبرات</h1>
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
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">إدارة طلبات المختبرات</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Labs List */}
          <div className="lg:col-span-1">
            <h2 className="font-bold text-sm mb-4">المختبرات المتاحة</h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مختبر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-10 rounded-lg text-sm"
              />
            </div>

            {/* Labs */}
            <div className="space-y-2">
              {filteredLabs.map((lab) => (
                <button
                  key={lab.lab_id}
                  onClick={() => setSelectedLab(lab)}
                  className={`w-full text-right rounded-xl border p-3 transition-all ${
                    selectedLab?.lab_id === lab.lab_id
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/10 hover:border-primary/30'
                  }`}
                >
                  <h3 className="font-bold text-xs mb-1">{lab.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] text-muted-foreground">
                      {lab.average_rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {lab.address}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Request Form & Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* New Request Form */}
            {selectedLab && (
              <div className="bg-white rounded-2xl border border-primary/5 p-6">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Beaker className="w-4 h-4" />
                  طلب تحليل جديد
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold mb-2 block">المختبر</label>
                    <div className="p-3 bg-primary/5 rounded-lg text-sm font-medium">
                      {selectedLab.lab_name}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-2 block">معرف المريض</label>
                    <Input
                      placeholder="أدخل معرف المريض"
                      value={requestForm.patientId}
                      onChange={(e) => setRequestForm({ ...requestForm, patientId: e.target.value })}
                      className="h-10 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-2 block">نوع التحليل</label>
                    <Input
                      placeholder="مثال: تحليل دم شامل"
                      value={requestForm.testType}
                      onChange={(e) => setRequestForm({ ...requestForm, testType: e.target.value })}
                      className="h-10 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-2 block">درجة الاستعجالية</label>
                    <select
                      value={requestForm.urgency}
                      onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-primary/10 text-sm"
                    >
                      <option value="NORMAL">عادي</option>
                      <option value="URGENT">عاجل</option>
                      <option value="CRITICAL">حرج</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold mb-2 block">ملاحظات إضافية</label>
                    <Textarea
                      placeholder="أضف أي ملاحظات طبية مهمة..."
                      value={requestForm.notes}
                      onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                      className="min-h-20 rounded-lg text-sm"
                    />
                  </div>

                  <Button
                    className="w-full rounded-lg gap-2"
                    onClick={handleSendRequest}
                  >
                    <Send className="w-4 h-4" />
                    إرسال الطلب
                  </Button>
                </div>
              </div>
            )}

            {/* Pending Requests */}
            <div>
              <h3 className="font-bold text-sm mb-3">الطلبات قيد الانتظار ({pendingRequests.length})</h3>
              <div className="space-y-2">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <div key={request.lab_request_id} className="bg-white rounded-xl border border-yellow-200 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xs font-bold">
                            {request.patient?.first_name} {request.patient?.last_name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            {request.lab?.lab_name}
                          </p>
                        </div>
                        <Badge className="text-[10px] bg-yellow-500">قيد الانتظار</Badge>
                      </div>
                      <p className="text-xs mb-2">{request.test_type}</p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 rounded-lg text-xs"
                          >
                            إلغاء الطلب
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl" className="rounded-2xl">
                          <AlertDialogTitle>تأكيد الإلغاء</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من إلغاء هذا الطلب؟
                          </AlertDialogDescription>
                          <div className="flex gap-3 justify-end">
                            <AlertDialogCancel className="rounded-lg">إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleCancelRequest(request.lab_request_id)}
                              className="bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                              تأكيد الإلغاء
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات قيد الانتظار</p>
                )}
              </div>
            </div>

            {/* Completed Requests */}
            <div>
              <h3 className="font-bold text-sm mb-3">الطلبات المكتملة ({completedRequests.length})</h3>
              <div className="space-y-2">
                {completedRequests.length > 0 ? (
                  completedRequests.map((request) => (
                    <div key={request.lab_request_id} className="bg-white rounded-xl border border-green-200 p-3 opacity-75">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {request.patient?.first_name} {request.patient?.last_name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            {request.test_type}
                          </p>
                        </div>
                        <Badge className="text-[10px] bg-green-500">مكتمل</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">لا توجد طلبات مكتملة</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
