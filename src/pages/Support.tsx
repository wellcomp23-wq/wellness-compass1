import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import {
  MessageCircle,
  Mail,
  HelpCircle,
  Send,
  Clock,
  Shield,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

interface SupportTicket {
  ticket_id: string
  user_id: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

export default function Support() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("faq")
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  })

  const subjectInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { data: ticketsData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(ticketsData || [])
    } catch (err) {
      console.error("Error fetching tickets:", err)
      toast({ title: "خطأ", description: "فشل في جلب التذاكر", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({ title: "تنبيه", description: "الرجاء ملء جميع الحقول", variant: "destructive" })
      subjectInputRef.current?.focus()
      return
    }

    try {
      setSubmitting(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          message: formData.message,
          status: 'OPEN'
        })

      if (error) throw error

      toast({ title: "نجاح", description: "تم إرسال طلبك بنجاح. سنرد عليك قريباً" })
      setFormData({ subject: "", message: "" })
      fetchTickets()
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في إرسال الطلب", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('ticket_id', ticketId)

      if (error) throw error

      setTickets(prev => prev.filter(t => t.ticket_id !== ticketId))
      toast({ title: "نجاح", description: "تم حذف التذكرة بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف التذكرة", variant: "destructive" })
    }
  }

  const faqs = [
    {
      question: "كيف أقوم بحجز موعد مع طبيب؟",
      answer: "من القائمة الرئيسية، اختر 'الأطباء'، ثم ابحث عن التخصص المطلوب، واختر الطبيب، وحدد الموعد المناسب من الأوقات المتاحة."
    },
    {
      question: "كيف أضيف دواء جديد لقائمة أدويتي؟",
      answer: "انتقل إلى صفحة 'الأدوية'، اضغط على زر 'إضافة دواء جديد'، ثم أدخل معلومات الدواء أو استخدم خاصية مسح الوصفة الطبية."
    },
    {
      question: "هل معلوماتي الصحية آمنة؟",
      answer: "نعم، نستخدم أعلى معايير التشفير لحماية بياناتك. جميع المعلومات الصحية مشفرة ومحمية وفقاً لمعايير الأمان العالمية."
    },
    {
      question: "كيف أستخدم محلل الأعراض؟",
      answer: "اذهب إلى صفحة 'محلل الأعراض'، اختر الأعراض التي تعاني منها، وسيقدم لك النظام توصيات حول التخصص الطبي المناسب."
    },
    {
      question: "كيف أطلب دواء من الصيدلية؟",
      answer: "ابحث عن الصيدلية المناسبة، اختر 'طلب دواء'، أدخل تفاصيل الطلب أو ارفع صورة الوصفة، وانتظر عرض السعر من الصيدلية."
    },
    {
      question: "كيف ألغي أو أعيد جدولة موعد؟",
      answer: "من صفحة 'مواعيدي'، اختر الموعد المراد تعديله، ثم اضغط على 'إعادة جدولة' أو 'إلغاء' حسب رغبتك."
    },
    {
      question: "كيف أقيم الطبيب بعد الموعد؟",
      answer: "بعد انتهاء الموعد، ستظهر لك نافذة التقييم تلقائياً. يمكنك أيضاً الذهاب إلى صفحة المواعيد السابقة والنقر على 'تقييم'."
    },
    {
      question: "كيف أحذف حسابي؟",
      answer: "اذهب إلى 'الإعدادات'، ثم 'إدارة الحساب'، واختر 'حذف الحساب'. ستحذف جميع بياناتك نهائياً."
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-bold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-6 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full" tabIndex={0}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
               <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="text-lg font-black">الدعم والمساعدة</h1>
               <p className="text-xs text-muted-foreground font-bold">نحن هنا لمساعدتك</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-primary/5 rounded-2xl p-1 shadow-sm" role="tablist">
            <TabsTrigger value="faq" tabIndex={0} role="tab" className="rounded-xl font-bold">الأسئلة الشائعة</TabsTrigger>
            <TabsTrigger value="tickets" tabIndex={0} role="tab" className="rounded-xl font-bold">تذاكري ({tickets.length})</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-4">
            <div className="bg-white rounded-[2rem] border border-primary/5 p-6 shadow-sm mb-6">
              <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                أرسل لنا رسالة
              </h3>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label htmlFor="subject" className="text-xs font-bold mb-2 block">الموضوع</label>
                  <Input
                    id="subject"
                    ref={subjectInputRef}
                    placeholder="موضوع الرسالة"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="rounded-xl border-primary/10 h-11"
                    tabIndex={0}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-xs font-bold mb-2 block">الرسالة</label>
                  <Textarea
                    id="message"
                    placeholder="اكتب رسالتك هنا..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="rounded-xl border-primary/10 resize-none h-24"
                    tabIndex={0}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11 font-bold gap-1 bg-primary hover:bg-primary/90" disabled={submitting} tabIndex={0}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال الرسالة
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-[2rem] border border-primary/5 p-6 shadow-sm">
              <h3 className="font-black text-sm mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                الأسئلة الشائعة
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border border-primary/10 rounded-xl px-4 data-[state=open]:bg-accent/30">
                    <AccordionTrigger className="font-bold text-sm hover:no-underline" tabIndex={0}>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.ticket_id} className="bg-white rounded-2xl border border-primary/5 p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{ticket.subject}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString('ar')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ticket.status === 'OPEN' ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-[10px] font-bold">قيد الانتظار</span>
                        ) : ticket.status === 'RESOLVED' ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            مغلق
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold">قيد المراجعة</span>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-red-500 hover:bg-red-50" tabIndex={0}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl" className="rounded-2xl">
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>هل أنت متأكد من حذف هذه التذكرة؟</AlertDialogDescription>
                            <div className="flex gap-3 justify-end mt-4">
                              <AlertDialogCancel className="rounded-xl" tabIndex={0}>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTicket(ticket.ticket_id)} className="bg-red-600 hover:bg-red-700 rounded-xl" tabIndex={0}>حذف</AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{ticket.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-primary/20">
                <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">لا توجد تذاكر دعم</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
