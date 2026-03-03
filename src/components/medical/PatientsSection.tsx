import { Users, FileText, Plus, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'
import { Patient } from '@/hooks/useDoctorData'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PatientsSectionProps {
  patients: Patient[]
  loading?: boolean
}

export function PatientsSection({ patients, loading }: PatientsSectionProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">المرضى الأخيرون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between px-0">
        <CardTitle className="text-lg font-bold">المرضى الأخيرون</CardTitle>
        <Button
          size="sm"
          variant="ghost"
          className="text-primary font-medium"
          onClick={() => navigate('/doctor/patients')}
        >
          عرض الكل
          <ArrowRight className="w-4 h-4 mr-1" />
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        {patients.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-300">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>لا توجد مرضى</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.slice(0, 3).map((patient) => {
              const initials = `${(patient.first_name || '').charAt(0)}${(patient.last_name || '').charAt(0)}`.toUpperCase() || 'P'
              let lastVisitDate = ''

              try {
                if (patient.last_appointment_date) {
                  lastVisitDate = format(parseISO(patient.last_appointment_date), 'dd MMM yyyy', { locale: ar })
                }
              } catch (e) {
                lastVisitDate = patient.last_appointment_date || 'لم يتم تحديده'
              }

              return (
                <div
                  key={patient.patient_id}
                  className="bg-white border border-primary/5 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{patient.first_name} {patient.last_name}</p>
                      {lastVisitDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>آخر زيارة: {lastVisitDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => navigate(`/doctor/patients/${patient.patient_id}`)}
                    >
                      <FileText className="w-3 h-3 ml-1" />
                      الملف الطبي
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs rounded-lg bg-primary hover:bg-primary/90"
                      onClick={() => navigate(`/doctor/prescriptions/new?patient=${patient.patient_id}`)}
                    >
                      <Plus className="w-3 h-3 ml-1" />
                      وصفة
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
