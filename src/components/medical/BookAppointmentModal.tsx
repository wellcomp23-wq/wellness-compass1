import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Calendar as CalendarIcon, Clock, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: string
  doctorName: string
  hospitalId?: string
  hospitalName?: string
  onSuccess?: () => void
}

export default function BookAppointmentModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  hospitalId,
  hospitalName,
  onSuccess
}: BookAppointmentModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCalendar, setShowCalendar] = useState(false)

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedDate) {
      newErrors.date = "يرجى اختيار تاريخ الموعد"
    }

    if (!selectedTime) {
      newErrors.time = "يرجى اختيار وقت الموعد"
    }

    if (!reason.trim()) {
      newErrors.reason = "يرجى إدخال سبب الزيارة"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBookAppointment = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الدخول أولاً",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // تنسيق التاريخ والوقت ليتوافق مع قاعدة البيانات
      // استخدام التوقيت المحلي لتجنب مشاكل المناطق الزمنية عند تحويل التاريخ
      const year = selectedDate!.getFullYear();
      const month = String(selectedDate!.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate!.getDate()).padStart(2, '0');
      const appointmentDate = `${year}-${month}-${day}`;
      const appointmentTime = selectedTime // بتنسيق HH:mm

      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: user.id,
            doctor_id: doctorId,
            hospital_id: hospitalId || null,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            reason: reason.trim(),
            notes: notes.trim() || null,
            status: 'PENDING'
          }
        ])

      if (error) {
        console.error('Error saving appointment:', error)
        toast({
          title: "خطأ في حجز الموعد",
          description: error.message || "حدث خطأ أثناء محاولة حفظ الموعد في قاعدة البيانات",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "تم حجز الموعد بنجاح",
        description: `تم حجز موعدك مع ${doctorName} في ${appointmentDate} الساعة ${selectedTime}`,
      })

      // إعادة تعيين النموذج
      setSelectedDate(undefined)
      setSelectedTime("")
      setReason("")
      setNotes("")
      setErrors({})

      if (onSuccess) {
        onSuccess()
      }

      onClose()
    } catch (error: any) {
      console.error('Unexpected error:', error)
      toast({
        title: "خطأ غير متوقع",
        description: error.message || "حدث خطأ غير متوقع أثناء محاولة حفظ الموعد",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setSelectedDate(undefined)
      setSelectedTime("")
      setReason("")
      setNotes("")
      setErrors({})
      setShowCalendar(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95%] rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl font-black">حجز موعد طبي</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            احجز موعدك مع {doctorName}
            {hospitalName && ` في ${hospitalName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="text-sm font-bold mr-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              تاريخ الموعد
            </Label>
            <div className="relative">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right h-14 rounded-2xl border-none bg-accent/30 hover:bg-accent/40 transition-colors px-6",
                  selectedDate ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {selectedDate ? selectedDate.toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' }) : "اختر التاريخ"}
              </Button>
              {showCalendar && (
                <div className="absolute top-16 right-0 z-50 bg-white border border-primary/10 rounded-3xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setShowCalendar(false)
                      setErrors({ ...errors, date: "" })
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    className="rounded-2xl"
                  />
                </div>
              )}
            </div>
            {errors.date && <p className="text-red-500 text-[10px] font-bold mr-2">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold mr-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              الوقت المتاح
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "rounded-xl h-11 text-xs font-bold transition-all",
                    selectedTime === time ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "border-none bg-accent/30 hover:bg-accent/40"
                  )}
                  onClick={() => {
                    setSelectedTime(time)
                    setErrors({ ...errors, time: "" })
                  }}
                >
                  {time}
                </Button>
              ))}
            </div>
            {errors.time && <p className="text-red-500 text-[10px] font-bold mr-2">{errors.time}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold mr-2">سبب الزيارة</Label>
            <Input
              placeholder="مثال: فحص دوري، استشارة..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setErrors({ ...errors, reason: "" })
              }}
              className="h-14 rounded-2xl bg-accent/30 border-none focus-visible:ring-2 focus-visible:ring-primary px-6"
            />
            {errors.reason && <p className="text-red-500 text-[10px] font-bold mr-2">{errors.reason}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold mr-2">ملاحظات (اختياري)</Label>
            <Textarea
              placeholder="أضف أي تفاصيل أخرى..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl bg-accent/30 border-none focus-visible:ring-2 focus-visible:ring-primary p-6 resize-none min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-row gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-2xl h-14 font-bold"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleBookAppointment}
            disabled={isLoading}
            className="flex-[2] rounded-2xl h-14 font-bold bg-primary shadow-xl shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري التأكيد...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 ml-2" />
                تأكيد الحجز
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
