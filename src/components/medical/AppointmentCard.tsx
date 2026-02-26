import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import MedicalCard from "./MedicalCard"
import { Calendar, Clock, MapPin, User, Phone, MessageCircle } from "lucide-react"

interface Appointment {
  id: string
  doctorName: string
  specialty: string
  date: string
  time: string
  location: string
  status: "confirmed" | "pending" | "cancelled" | "completed"
  type: "consultation" | "followup" | "emergency"
  price: string
}

interface AppointmentCardProps {
  appointment: Appointment
  onReschedule?: (id: string) => void
  onCancel?: (id: string) => void
  onMessage?: (id: string) => void
}

export default function AppointmentCard({ 
  appointment, 
  onReschedule, 
  onCancel, 
  onMessage 
}: AppointmentCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "success"
      case "pending": return "warning"
      case "cancelled": return "destructive"
      case "completed": return "secondary"
      default: return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "مؤكد"
      case "pending": return "في الانتظار"
      case "cancelled": return "ملغي"
      case "completed": return "مكتمل"
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "consultation": return "استشارة"
      case "followup": return "متابعة"
      case "emergency": return "طارئ"
      default: return type
    }
  }

  return (
    <MedicalCard
      title={appointment.doctorName}
      description={appointment.specialty}
      icon={<User className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* Status and Type */}
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(appointment.status)}>
            {getStatusText(appointment.status)}
          </Badge>
          <Badge variant="outline">
            {getTypeText(appointment.type)}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">الرسوم:</span>
            <span className="font-medium text-primary">{appointment.price}</span>
          </div>
        </div>

        {/* Actions */}
        {appointment.status !== "completed" && appointment.status !== "cancelled" && (
          <div className="flex gap-2 pt-4 border-t">
            {onMessage && (
              <Button variant="outline" size="sm" onClick={() => onMessage(appointment.id)}>
                <MessageCircle className="w-4 h-4" />
                رسالة
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4" />
              اتصال
            </Button>
            {onReschedule && (
              <Button variant="secondary" size="sm" onClick={() => onReschedule(appointment.id)}>
                <Calendar className="w-4 h-4" />
                إعادة جدولة
              </Button>
            )}
            {onCancel && (
              <Button variant="destructive" size="sm" onClick={() => onCancel(appointment.id)}>
                إلغاء
              </Button>
            )}
          </div>
        )}
      </div>
    </MedicalCard>
  )
}