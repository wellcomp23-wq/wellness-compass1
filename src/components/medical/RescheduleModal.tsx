import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  Check,
  ChevronRight,
  Stethoscope
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppointments } from "@/hooks/useAppointments"

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: any
  onSuccess?: () => void
}

const availableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
]

export default function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onSuccess
}: RescheduleModalProps) {
  const { toast } = useToast()
  const { updateAppointment } = useAppointments()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState<"date" | "time">("date")

  // Reset state when modal opens
  useEffect(() => {
    if (appointment && isOpen) {
      try {
        setSelectedDate(new Date(appointment.appointment_date))
      } catch {
        setSelectedDate(undefined)
      }
      setSelectedTime(appointment.appointment_time?.substring(0, 5) || "")
      setErrors({})
      setStep("date")
    }
  }, [appointment, isOpen])

  const doctorName = appointment?.doctor
    ? `د. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`
    : "الطبيب"

  const validateAndProceed = () => {
    if (!selectedDate) {
      setErrors({ date: "يرجى اختيار تاريخ الموعد" })
      return
    }
    setErrors({})
    setStep("time")
  }

  const handleReschedule = async () => {
    if (!selectedDate) {
      setErrors({ date: "يرجى اختيار تاريخ الموعد" })
      setStep("date")
      return
    }
    if (!selectedTime) {
      setErrors({ time: "يرجى اختيار وقت الموعد" })
      return
    }

    setIsLoading(true)
    try {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const appointmentDate = `${year}-${month}-${day}`

      await updateAppointment(appointment.appointment_id, {
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
      })

      toast({
        title: "✅ تم إعادة جدولة الموعد بنجاح",
        description: `تم تحديث موعدك مع ${doctorName} إلى ${selectedDate.toLocaleDateString("ar-YE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })} الساعة ${selectedTime}`,
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Reschedule error:", error)
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إعادة جدولة الموعد. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("ar-YE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md w-[95%] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white">
                إعادة جدولة الموعد
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                {doctorName}
              </DialogDescription>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                step === "date"
                  ? "bg-white text-primary"
                  : "bg-white/20 text-white"
              )}
            >
              <CalendarIcon className="w-3 h-3" />
              اختر التاريخ
            </div>
            <ChevronRight className="w-4 h-4 text-white/50" />
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                step === "time"
                  ? "bg-white text-primary"
                  : "bg-white/20 text-white"
              )}
            >
              <Clock className="w-3 h-3" />
              اختر الوقت
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === "date" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>اختر تاريخ الموعد الجديد</span>
              </div>

              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setErrors({ ...errors, date: "" })
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="rounded-2xl border border-primary/10 bg-accent/20 p-3"
                />
              </div>

              {errors.date && (
                <p className="text-red-500 text-xs font-bold text-center animate-in fade-in">
                  {errors.date}
                </p>
              )}

              {selectedDate && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center animate-in fade-in">
                  <p className="text-xs text-muted-foreground">التاريخ المختار</p>
                  <p className="font-bold text-primary mt-1">{formattedDate}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>اختر الوقت المناسب</span>
                </div>
                <button
                  onClick={() => setStep("date")}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3" />
                  تغيير التاريخ
                </button>
              </div>

              {selectedDate && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-primary">{formattedDate}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time)
                      setErrors({ ...errors, time: "" })
                    }}
                    className={cn(
                      "rounded-xl h-12 text-xs font-bold transition-all duration-200 border",
                      selectedTime === time
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                        : "bg-accent/30 text-foreground border-transparent hover:bg-accent/60 hover:border-primary/20"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {errors.time && (
                <p className="text-red-500 text-xs font-bold text-center animate-in fade-in">
                  {errors.time}
                </p>
              )}

              {selectedTime && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center animate-in fade-in">
                  <p className="text-xs text-muted-foreground">الموعد الجديد</p>
                  <p className="font-black text-primary mt-1 text-lg">{selectedTime}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-2xl h-14 font-bold text-muted-foreground hover:text-foreground"
          >
            إلغاء
          </Button>

          {step === "date" ? (
            <Button
              onClick={validateAndProceed}
              disabled={!selectedDate}
              className="flex-[2] rounded-2xl h-14 font-bold bg-primary shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              <Clock className="w-5 h-5 ml-2" />
              اختر الوقت
            </Button>
          ) : (
            <Button
              onClick={handleReschedule}
              disabled={isLoading || !selectedTime}
              className="flex-[2] rounded-2xl h-14 font-bold bg-primary shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 ml-2" />
                  تأكيد إعادة الجدولة
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
