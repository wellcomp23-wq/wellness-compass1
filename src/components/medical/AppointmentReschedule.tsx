import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Calendar as CalendarIcon } from "lucide-react"

interface AppointmentRescheduleProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  doctorName: string
}

export default function AppointmentReschedule({ 
  isOpen, 
  onClose, 
  appointmentId, 
  doctorName 
}: AppointmentRescheduleProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ]

  const handleReschedule = () => {
    if (selectedDate && selectedTime) {
      toast({
        title: "تم إعادة جدولة الموعد بنجاح",
        description: `تم تحديث موعدك مع ${doctorName} إلى ${selectedDate.toLocaleDateString('ar')} الساعة ${selectedTime}`,
      })
      onClose()
    } else {
      toast({
        title: "يرجى اختيار التاريخ والوقت",
        description: "يجب تحديد التاريخ والوقت المناسبين",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إعادة جدولة الموعد</DialogTitle>
          <DialogDescription>
            اختر التاريخ والوقت الجديد للموعد مع {doctorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">اختر التاريخ</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border mx-auto"
              disabled={(date) => date < new Date()}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">اختر الوقت</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="medical" onClick={handleReschedule}>
            <CalendarIcon className="w-4 h-4 ml-2" />
            تأكيد إعادة الجدولة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
