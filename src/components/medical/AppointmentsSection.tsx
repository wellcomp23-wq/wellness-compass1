import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Appointment {
  appointment_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED'
  patient_name?: string
}

interface AppointmentsSectionProps {
  appointments: Appointment[]
  loading?: boolean
  onStatusChange?: (appointmentId: string, status: string) => Promise<boolean>
}

export function AppointmentsSection({ appointments, loading, onStatusChange }: AppointmentsSectionProps) {
  const navigate = useNavigate()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'مؤكد', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'PENDING':
        return { label: 'معلق', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
      case 'CANCELED':
        return { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 'COMPLETED':
        return { label: 'مكتمل', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">المواعيد القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle className="text-lg font-bold">المواعيد القادمة</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="text-primary font-medium"
          onClick={() => navigate('/doctor/appointments')}
        >
          عرض الكل
          <ArrowRight className="w-4 h-4 mr-1" />
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        {appointments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-300">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>لا توجد مواعيد قادمة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => {
              const statusInfo = getStatusBadge(appointment.status)
              const StatusIcon = statusInfo.icon
              let appointmentDate = ''
              let appointmentTime = ''

              try {
                if (appointment.appointment_date) {
                  appointmentDate = format(parseISO(appointment.appointment_date), 'dd MMM yyyy', { locale: ar })
                }
                if (appointment.appointment_time) {
                  appointmentTime = appointment.appointment_time
                }
              } catch (e) {
                appointmentDate = appointment.appointment_date || 'تاريخ غير معروف'
                appointmentTime = appointment.appointment_time || 'وقت غير معروف'
              }

              return (
                <div
                  key={appointment.appointment_id}
                  className="bg-white border border-primary/5 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{appointment.patient_name || 'مريض'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{appointmentDate}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{appointmentTime}</span>
                      </div>
                    </div>
                    <Badge className={`${statusInfo.color} border-none`}>
                      <StatusIcon className="w-3 h-3 ml-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {appointment.status === 'PENDING' && onStatusChange && (
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs rounded-lg border-green-200 text-green-600 hover:bg-green-50"
                        onClick={() => onStatusChange(appointment.appointment_id, 'CONFIRMED')}
                      >
                        تأكيد
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => onStatusChange(appointment.appointment_id, 'CANCELED')}
                      >
                        إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
