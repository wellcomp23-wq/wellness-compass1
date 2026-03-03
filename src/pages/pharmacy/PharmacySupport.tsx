import { useState } from "react"
import Navigation from "@/components/layout/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, MessageSquare, Send, FileText, CheckCircle2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SupportTicket {
  id: string
  subject: string
  category: string
  status: "open" | "pending" | "resolved"
  date: string
  description: string
}

export default function PharmacySupport() {
  const { toast } = useToast()
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("orders")
  const [description, setDescription] = useState("")
  
  const [tickets] = useState<SupportTicket[]>([
    {
      id: "1",
      subject: "مشكلة في تحديث المخزون",
      category: "تقني",
      status: "open",
      date: "2024-01-14",
      description: "واجهت مشكلة في تحديث كميات المخزون"
    },
    {
      id: "2",
      subject: "استفسار عن نظام الطلبات",
      category: "عام",
      status: "resolved",
      date: "2024-01-10",
      description: "كيف يمكنني تتبع الطلبات المكتملة؟"
    }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "تم إرسال الطلب",
      description: "سيتم الرد عليك في أقرب وقت ممكن",
    })
    setSubject("")
    setDescription("")
  }

  const openTickets = tickets.filter(t => t.status === "open")
  const pendingTickets = tickets.filter(t => t.status === "pending")
  const resolvedTickets = tickets.filter(t => t.status === "resolved")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation userRole="pharmacy" userName="صيدلية الشفاء" />
      
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">الدعم الفني للصيدليات</h1>
          <p className="text-muted-foreground">نحن هنا لمساعدتك في إدارة الصيدلية وحل أي مشكلة تقنية</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* نموذج طلب دعم جديد */}
          <div className="lg:col-span-2">
            <Card className="card-medical mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  طلب دعم جديد
                </CardTitle>
                <CardDescription>املأ النموذج أدناه وسنتواصل معك في أقرب وقت</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: مشكلة في نظام الطلبات"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">التصنيف</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      required
                    >
                      <option value="orders">إدارة الطلبات</option>
                      <option value="inventory">المخزون</option>
                      <option value="technical">مشكلة تقنية</option>
                      <option value="account">الحساب والإعدادات</option>
                      <option value="general">استفسار عام</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">التفاصيل</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="اشرح المشكلة أو الاستفسار بالتفصيل..."
                      className="mt-1 min-h-[150px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    إرسال الطلب
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* طلبات الدعم السابقة */}
            <Card className="card-medical">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  طلباتي السابقة
                </CardTitle>
                <CardDescription>تتبع حالة طلبات الدعم الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="open" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="open" className="gap-2">
                      <Clock className="w-4 h-4" />
                      مفتوحة ({openTickets.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      قيد المعالجة ({pendingTickets.length})
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      محلولة ({resolvedTickets.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="open" className="space-y-3 mt-4">
                    {openTickets.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">لا توجد طلبات مفتوحة</p>
                    ) : (
                      openTickets.map(ticket => (
                        <Card key={ticket.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{ticket.subject}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                            </div>
                            <Badge variant="destructive">مفتوح</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>{ticket.date}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-3 mt-4">
                    {pendingTickets.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">لا توجد طلبات قيد المعالجة</p>
                    ) : (
                      pendingTickets.map(ticket => (
                        <Card key={ticket.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{ticket.subject}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                            </div>
                            <Badge className="bg-amber-500">قيد المعالجة</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>{ticket.date}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="resolved" className="space-y-3 mt-4">
                    {resolvedTickets.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6">لا توجد طلبات محلولة</p>
                    ) : (
                      resolvedTickets.map(ticket => (
                        <Card key={ticket.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{ticket.subject}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                            </div>
                            <Badge className="bg-green-500">محلول</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <span>{ticket.category}</span>
                            <span>•</span>
                            <span>{ticket.date}</span>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* الأسئلة الشائعة */}
          <div>
            <Card className="card-medical sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  أسئلة شائعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">كيف أقبل طلب دواء جديد؟</h4>
                  <p className="text-sm text-muted-foreground">
                    انتقل إلى صفحة "طلبات الأدوية" وانقر على زر "قبول" للطلب المطلوب.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">كيف أحدث معلومات الصيدلية؟</h4>
                  <p className="text-sm text-muted-foreground">
                    اذهب إلى صفحة "ملف الصيدلية" وانقر على "تعديل المعلومات".
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">كيف أتواصل مع المريض؟</h4>
                  <p className="text-sm text-muted-foreground">
                    يمكنك الاتصال برقم هاتف المريض الموجود في تفاصيل الطلب.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">ماذا أفعل في حالة نفاد الدواء؟</h4>
                  <p className="text-sm text-muted-foreground">
                    يمكنك رفض الطلب مع توضيح السبب، وسيتم إشعار المريض.
                  </p>
                </div>

                <Button variant="outline" className="w-full mt-4" asChild>
                  <a href="#" className="gap-2">
                    <FileText className="w-4 h-4" />
                    دليل الاستخدام الكامل
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
