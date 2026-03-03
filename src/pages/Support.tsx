import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  HelpCircle,
  Send,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Trash2,
  Headphones,
  BookOpen
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"

interface SupportTicket {
  ticket_id: string
  user_id: string
  subject: string
  message: string
  status: string
  created_at: string
}

export default function Support() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("faq")
  const [formData, setFormData] = useState({ subject: "", message: "" })
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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
      setActiveTab("tickets")
      fetchTickets()
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في إرسال الطلب", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      setIsDeleting(ticketId)
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('ticket_id', ticketId)

      if (error) throw error
      
      setTickets(tickets.filter(t => t.ticket_id !== ticketId))
      toast({ title: "نجاح", description: "تم حذف التذكرة بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف التذكرة", variant: "destructive" })
    } finally {
      setIsDeleting(null)
    }
  }

  const faqs = [
    { question: "كيف أقوم بحجز موعد مع طبيب؟", answer: "من القائمة الرئيسية، اختر 'الأطباء'، ثم ابحث عن التخصص المطلوب، واختر الطبيب، وحدد الموعد المناسب." },
    { question: "كيف أضيف دواء جديد؟", answer: "انتقل إلى صفحة 'الأدوية'، اضغط على زر 'إضافة دواء جديد'، ثم أدخل معلومات الدواء." },
    { question: "هل معلوماتي الصحية آمنة؟", answer: "نعم، نستخدم أعلى معايير التشفير لحماية بياناتك. جميع المعلومات الصحية مشفرة ومحمية." },
    { question: "كيف أطلب دواء من الصيدلية؟", answer: "ابحث عن الصيدلية، اختر 'طلب دواء'، ارفع صورة الوصفة، وانتظر عرض السعر." }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" dir="rtl">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-8 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowRight className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <Headphones className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">الدعم والمساعدة</h1>
            <p className="text-xs text-muted-foreground font-bold">نحن هنا لمساعدتك دائماً</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border border-slate-100 rounded-[2rem] p-1.5 shadow-sm h-16">
            <TabsTrigger value="faq" className="rounded-[1.5rem] font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white">الأسئلة الشائعة</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-[1.5rem] font-black h-full data-[state=active]:bg-primary data-[state=active]:text-white">تذاكري ({tickets.length})</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="faq" className="space-y-8">
              {/* Support Options */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate('/how-to-use')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-black text-slate-800 text-sm">دليل المستخدم</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">تعلم كيفية الاستخدام</p>
                </button>
                <button className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="font-black text-slate-800 text-sm">دردشة مباشرة</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">قريباً في التحديث القادم</p>
                </button>
              </div>

              {/* Ticket Form */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  فتح تذكرة دعم جديدة
                </h3>
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">موضوع الطلب</label>
                    <Input placeholder="مثال: مشكلة في حجز موعد" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">تفاصيل الرسالة</label>
                    <Textarea placeholder="اشرح لنا المشكلة بالتفصيل..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-2xl border-slate-100 min-h-[120px] font-bold resize-none" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full rounded-2xl h-14 font-black text-lg shadow-lg shadow-primary/20">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الطلب"}
                  </Button>
                </form>
              </div>

              {/* FAQs */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  الأسئلة الأكثر شيوعاً
                </h3>
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border border-slate-100 rounded-2xl px-6 overflow-hidden">
                      <AccordionTrigger className="font-black text-sm hover:no-underline py-4">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-slate-500 font-bold pb-4 leading-relaxed">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="space-y-4">
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.ticket_id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800">{ticket.subject}</h4>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.created_at).toLocaleDateString('ar')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`rounded-xl px-4 py-1 font-black text-[10px] ${ticket.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {ticket.status === 'OPEN' ? 'قيد المعالجة' : 'تم الحل'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => handleDeleteTicket(ticket.ticket_id)}
                            disabled={isDeleting === ticket.ticket_id}
                          >
                            {isDeleting === ticket.ticket_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-bold line-clamp-2">{ticket.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-black">لا توجد تذاكر دعم سابقة</p>
                </div>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}
