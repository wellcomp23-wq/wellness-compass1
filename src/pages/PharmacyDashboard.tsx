import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Pill,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Search,
  Bell,
  MoreVertical,
  AlertTriangle,
  ClipboardList,
  Loader2,
  ArrowRight,
  User,
  Calendar,
  Trash2,
  Eye,
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

interface PharmacyOrder {
  order_id: string
  patient_id: string
  pharmacy_id: string
  created_at: string
  status: string
  total_price: number | null
  is_prescription: boolean
  patient?: {
    first_name: string
    last_name: string
    phone: string
  }
}

export default function PharmacyDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [orders, setOrders] = useState<PharmacyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pharmacyName, setPharmacyName] = useState("صيدلية العافية")
  const [showVerificationAlerts, setShowVerificationAlerts] = useState(true)
  const [verifiedPhone, setVerifiedPhone] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState(false)

  useEffect(() => {
    fetchPharmacyData()
  }, [])

  const fetchPharmacyData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      // جلب بيانات الصيدلية
      const { data: pharmacyData } = await supabase
        .from('pharmacies')
        .select('name')
        .eq('pharmacy_id', user.id)
        .single()
      
      if (pharmacyData) setPharmacyName(pharmacyData.name)

      // جلب الطلبات
      const { data: ordersData, error: ordersErr } = await supabase
        .from('drug_orders')
        .select(`
          *,
          patient:patients(first_name, last_name, phone)
        `)
        .eq('pharmacy_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersErr) throw ordersErr
      setOrders(ordersData || [])
      setError(null)
    } catch (err: any) {
      console.error("Error fetching pharmacy data:", err)
      setError(err.message || "فشل في جلب بيانات الصيدلية")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('drug_orders')
        .update({ status: newStatus })
        .eq('order_id', orderId)

      if (error) throw error

      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o))
      toast({ title: "نجاح", description: "تم تحديث حالة الطلب" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تحديث الطلب", variant: "destructive" })
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('drug_orders')
        .delete()
        .eq('order_id', orderId)

      if (error) throw error

      setOrders(prev => prev.filter(o => o.order_id !== orderId))
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
      case 'PROCESSING': return 'قيد التجهيز'
      case 'READY': return 'جاهز'
      case 'DELIVERED': return 'تم التوصيل'
      case 'CANCELED': return 'ملغي'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-700'
      case 'PROCESSING': return 'bg-orange-100 text-orange-700'
      case 'READY': return 'bg-emerald-100 text-emerald-700'
      case 'DELIVERED': return 'bg-gray-100 text-gray-700'
      case 'CANCELED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOrders = orders.filter(o => 
    o.patient?.first_name.includes(searchQuery) || 
    o.patient?.last_name.includes(searchQuery) ||
    o.order_id.includes(searchQuery)
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
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3.5rem] shadow-sm mb-6 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
               <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-lg font-black">{pharmacyName}</h1>
               <div className="flex items-center gap-1.5 mt-0.5">
                 <Badge className="bg-orange-100 text-orange-600 border-none text-[8px] px-2 py-0 rounded-lg">صيدلية معتمدة</Badge>
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

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "جديد", val: orders.filter(o => o.status === 'PENDING').length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "تجهيز", val: orders.filter(o => o.status === 'PROCESSING').length, icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "جاهز", val: orders.filter(o => o.status === 'READY').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "إجمالي", val: orders.length, icon: ClipboardList, color: "text-primary", bg: "bg-primary/5" },
          ].map((stat, i) => (
            <div key={i} className={cn("p-3 rounded-2xl flex flex-col items-center gap-1", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs font-black">{stat.val}</span>
              <span className="text-[8px] text-muted-foreground font-bold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Alerts */}
      {showVerificationAlerts && (
        <div className="container max-w-4xl mx-auto px-4 space-y-3 mb-6">
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

      <div className="container max-w-4xl mx-auto px-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن طلب أو عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-2xl bg-white border-primary/10 shadow-sm"
          />
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-primary/5 rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="orders" className="rounded-xl font-bold">الطلبات الجارية</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl font-bold">السجل</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {filteredOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELED').length > 0 ? (
              filteredOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELED').map((order) => (
                <div key={order.order_id} className="bg-white rounded-[2rem] border border-primary/5 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{order.patient?.first_name} {order.patient?.last_name}</h3>
                        <p className="text-[10px] text-muted-foreground">{order.order_id} • {new Date(order.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <Badge className={cn("rounded-lg border-none text-[10px]", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>

                  <div className="bg-accent/30 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        محتويات الطلب
                      </span>
                      {order.is_prescription && (
                        <Badge className="bg-red-100 text-red-600 text-[9px] border-none">وصفة طبية</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">تفاصيل الطلب تظهر هنا...</p>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold">إجمالي المبلغ</span>
                      <span className="text-lg font-black text-primary">{order.total_amount.toFixed(2)} ر.س</span>
                    </div>
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
                            <AlertDialogAction onClick={() => handleDeleteOrder(order.order_id)} className="bg-red-600 hover:bg-red-700 rounded-xl">حذف الطلب</AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {order.status === 'PENDING' && (
                      <Button className="w-full rounded-xl h-11 font-bold" onClick={() => handleStatusChange(order.order_id, 'PROCESSING')}>تجهيز الطلب</Button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <Button className="w-full rounded-xl h-11 font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange(order.order_id, 'READY')}>جاهز للاستلام</Button>
                    )}
                    {order.status === 'READY' && (
                      <Button className="w-full rounded-xl h-11 font-bold bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(order.order_id, 'DELIVERED')}>تأكيد التسليم</Button>
                    )}
                    <Button variant="outline" className="w-full rounded-xl h-11 font-bold text-red-500 border-red-100 hover:bg-red-50" onClick={() => handleStatusChange(order.order_id, 'CANCELED')}>إلغاء</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-primary/20">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">لا توجد طلبات جارية حالياً</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="text-center py-20 bg-white rounded-[2rem] border border-primary/5">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-bold">سجل الطلبات يظهر هنا</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
