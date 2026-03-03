import { useState } from "react"
import Navigation from "@/components/layout/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import MedicalCard from "@/components/medical/MedicalCard"
import { Pill, Clock, CheckCircle, XCircle, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MedicationOrder {
  id: string
  patientName: string
  medication: string
  quantity: string
  date: string
  time: string
  status: "pending" | "processing" | "ready" | "completed" | "rejected"
  prescription: string
  phone: string
}

export default function PharmacyOrders() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<MedicationOrder[]>([
    {
      id: "1",
      patientName: "أحمد محمد",
      medication: "أموكسيسيلين 500 ملغ",
      quantity: "20 كبسولة",
      date: "2024-01-15",
      time: "10:30 ص",
      status: "pending",
      prescription: "RX-2024-001",
      phone: "0501234567"
    },
    {
      id: "2",
      patientName: "فاطمة علي",
      medication: "باراسيتامول 500 ملغ",
      quantity: "30 قرص",
      date: "2024-01-15",
      time: "11:00 ص",
      status: "processing",
      prescription: "RX-2024-002",
      phone: "0509876543"
    },
    {
      id: "3",
      patientName: "خالد سعيد",
      medication: "أومبيرازول 20 ملغ",
      quantity: "14 كبسولة",
      date: "2024-01-15",
      time: "09:45 ص",
      status: "ready",
      prescription: "RX-2024-003",
      phone: "0551234567"
    }
  ])

  const handleAcceptOrder = (id: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: "processing" } : order
    ))
    toast({
      title: "تم قبول الطلب",
      description: "تم البدء في تجهيز الطلب",
    })
  }

  const handleCompleteOrder = (id: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: "ready" } : order
    ))
    toast({
      title: "الطلب جاهز",
      description: "تم إشعار المريض بجاهزية الطلب",
    })
  }

  const handleRejectOrder = (id: string) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: "rejected" } : order
    ))
    toast({
      title: "تم رفض الطلب",
      description: "تم إشعار المريض برفض الطلب",
      variant: "destructive"
    })
  }

  const pendingOrders = orders.filter(o => o.status === "pending")
  const processingOrders = orders.filter(o => o.status === "processing")
  const readyOrders = orders.filter(o => o.status === "ready")

  const OrderCard = ({ order }: { order: MedicationOrder }) => (
    <MedicalCard
      title={order.medication}
      description={`المريض: ${order.patientName}`}
      icon={<Pill className="w-5 h-5" />}
      variant="secondary"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">الكمية:</span>
            <p className="font-medium">{order.quantity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">الوصفة:</span>
            <p className="font-medium">{order.prescription}</p>
          </div>
          <div>
            <span className="text-muted-foreground">التاريخ:</span>
            <p className="font-medium">{order.date}</p>
          </div>
          <div>
            <span className="text-muted-foreground">الوقت:</span>
            <p className="font-medium">{order.time}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">الهاتف:</span>
            <p className="font-medium flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {order.phone}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {order.status === "pending" && (
            <>
              <Button 
                onClick={() => handleAcceptOrder(order.id)}
                className="flex-1 gap-2"
                variant="medical"
              >
                <CheckCircle className="w-4 h-4" />
                قبول
              </Button>
              <Button 
                onClick={() => handleRejectOrder(order.id)}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <XCircle className="w-4 h-4" />
                رفض
              </Button>
            </>
          )}
          {order.status === "processing" && (
            <Button 
              onClick={() => handleCompleteOrder(order.id)}
              className="w-full gap-2"
              variant="medical"
            >
              <CheckCircle className="w-4 h-4" />
              تم التجهيز
            </Button>
          )}
          {order.status === "ready" && (
            <Badge className="w-full justify-center py-2 bg-green-500">
              جاهز للاستلام
            </Badge>
          )}
        </div>
      </div>
    </MedicalCard>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation userRole="pharmacy" userName="صيدلية الشفاء" />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">إدارة طلبات الأدوية</h1>
          <p className="text-muted-foreground">متابعة وإدارة طلبات صرف الأدوية</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="card-medical">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                طلبات جديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="card-medical">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" />
                قيد التجهيز
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{processingOrders.length}</div>
            </CardContent>
          </Card>

          <Card className="card-medical">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                جاهزة للاستلام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{readyOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* قوائم الطلبات */}
        <Card className="card-medical">
          <CardHeader>
            <CardTitle>الطلبات</CardTitle>
            <CardDescription>إدارة طلبات الأدوية حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  جديدة ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="processing" className="gap-2">
                  <Pill className="w-4 h-4" />
                  قيد التجهيز ({processingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="ready" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  جاهزة ({readyOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات جديدة</p>
                ) : (
                  pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>

              <TabsContent value="processing" className="space-y-4 mt-6">
                {processingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات قيد التجهيز</p>
                ) : (
                  processingOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>

              <TabsContent value="ready" className="space-y-4 mt-6">
                {readyOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات جاهزة</p>
                ) : (
                  readyOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
