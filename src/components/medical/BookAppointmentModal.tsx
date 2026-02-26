import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Calendar as CalendarIcon, Clock, AlertCircle, Loader2 } from "lucide-react"
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

  // Available time slots (يمكن تعديلها حسب توفر الطبيب)
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ]

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedDate) {
      newErrors.date = "يرجى اختيار تاريخ الموعد"
    } else if (selectedDate < new Date()) {
      newErrors.date = "لا يمكن اختيار تاريخ في الماضي"
    }

    if (!selectedTime) {
      newErrors.time = "يرجى اختيار وقت الموعد"
    }

    if (!reason.trim()) {
      newErrors.reason = "يرجى إدخال سبب الزيارة"
    } else if (reason.trim().length < 3) {
      newErrors.reason = "يجب أن يكون سبب الزيارة على الأقل 3 أحرف"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // حفظ الموعد في قاعدة البيانات
  const handleBookAppointment = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // الحصول على معرف المستخدم الحالي
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

      // تنسيق التاريخ والوقت
      const appointmentDate = selectedDate!.toISOString().split('T')[0]
      const appointmentTime = selectedTime

      // إدراج الموعد في قاعدة البيانات
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: user.id,
            doctor_id: doctorId,
            hospital_id: hospitalId || null,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            reason_for_visit: reason.trim(),
            notes: notes.trim() || null,
            status: 'PENDING'
          }
        ])
        .select()

      if (error) {
        console.error('خطأ في حفظ الموعد:', error)
        toast({
          title: "خطأ في حفظ الموعد",
          description: error.message || "حدث خطأ أثناء محاولة حفظ الموعد",
          variant: "destructive"
        })
        return
      }

      // نجاح العملية
      toast({
        title: "تم حجز الموعد بنجاح",
        description: `تم حجز موعدك مع ${doctorName} في ${selectedDate?.toLocaleDateString('ar')} الساعة ${selectedTime}`,
      })

      // إعادة تعيين النموذج
      setSelectedDate(undefined)
      setSelectedTime("")
      setReason("")
      setNotes("")
      setErrors({})

      // استدعاء callback النجاح
      if (onSuccess) {
        onSuccess()
      }

      // إغلاق النافذة
      onClose()
    } catch (error) {
      console.error('خطأ غير متوقع:', error)
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ غير متوقع أثناء محاولة حفظ الموعد",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // إغلاق النافذة وإعادة تعيين الحالة
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">حجز موعد طبي</DialogTitle>
          <DialogDescription>
            احجز موعدك مع {doctorName}
            {hospitalName && ` في ${hospitalName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* تاريخ الموعد */}
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              تاريخ الموعد <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right h-11 rounded-xl border-primary/10",
                  selectedDate ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {selectedDate ? selectedDate.toLocaleDateString('ar') : "اختر التاريخ"}
              </Button>
              {showCalendar && (
                <div className="absolute top-12 right-0 z-50 bg-white border border-primary/10 rounded-xl shadow-lg p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setShowCalendar(false)
                      setErrors({ ...errors, date: "" })
                    }}
                    disabled={(date) => date < new Date()}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            {errors.date && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.date}
              </div>
            )}
          </div>

          {/* وقت الموعد */}
          <div className="space-y-2">
            <Label className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              وقت الموعد <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedTime} onValueChange={(value) => {
              setSelectedTime(value)
              setErrors({ ...errors, time: "" })
            }}>
              <SelectTrigger className="h-11 rounded-xl border-primary/10">
                <SelectValue placeholder="اختر الوقت المناسب" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.time && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                {errors.time}
              </div>
            )}
          </div>

          {/* سبب الزيارة */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">
              سبب الزيارة <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="مثال: فحص عام، متابعة مرض معين..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setErrors({ ...errors, reason: "" })
              }}
              className="h-11 rounded-xl border-primary/10"
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              {errors.reason && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {errors.reason}
                </div>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {reason.length}/200
              </span>
            </div>
          </div>

          {/* ملاحظات إضافية */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">
              ملاحظات إضافية <span className="text-muted-foreground text-xs">(اختياري)</span>
            </Label>
            <Textarea
              placeholder="أي ملاحظات أو معلومات إضافية تود إخبار الطبيب بها..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border-primary/10 resize-none min-h-24"
              maxLength={500}
            />
            <span className="text-[10px] text-muted-foreground">
              {notes.length}/500
            </span>
          </div>

          {/* ملخص الموعد */}
          {selectedDate && selectedTime && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-primary">ملخص الموعد:</p>
              <div className="text-xs space-y-1 text-foreground">
                <p>📅 التاريخ: {selectedDate.toLocaleDateString('ar')}</p>
                <p>🕐 الوقت: {selectedTime}</p>
                <p>👨‍⚕️ الطبيب: {doctorName}</p>
                {hospitalName && <p>🏥 المستشفى: {hospitalName}</p>}
                <p className="text-primary font-bold">📋 نوع الموعد: حضوري</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl border-primary/10"
          >
            إلغاء
          </Button>
          <Button
            variant="medical"
            onClick={handleBookAppointment}
            disabled={isLoading}
            className="rounded-xl shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4 ml-2" />
                تأكيد الحجز
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
