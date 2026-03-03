import { FileText, Plus, ArrowRight, Calendar, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { Prescription } from '@/hooks/useDoctorPrescriptions'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PrescriptionsSectionProps {
  prescriptions: Prescription[]
  loading?: boolean
}

export function PrescriptionsSection({ prescriptions, loading }: PrescriptionsSectionProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">آخر الوصفات</CardTitle>
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
        <CardTitle className="text-lg font-bold">آخر الوصفات</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-primary font-medium"
            onClick={() => navigate('/doctor/prescriptions')}
          >
            عرض الكل
            <ArrowRight className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Button
          className="w-full mb-4 h-12 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none flex items-center justify-center gap-2"
          onClick={() => navigate('/doctor/prescriptions/new')}
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">وصفة جديدة</span>
        </Button>

        {prescriptions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-300">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>لا توجد وصفات طبية</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.slice(0, 3).map((prescription) => {
              let issueDate = ''

              try {
                if (prescription.issue_date) {
                  issueDate = format(new Date(prescription.issue_date), 'dd MMM yyyy', { locale: ar })
                }
              } catch (e) {
                issueDate = prescription.issue_date || 'تاريخ غير معروف'
              }

              return (
                <div
                  key={prescription.prescription_id}
                  className="bg-white border border-primary/5 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-sm">المريض: {prescription.patient_name || 'غير معروف'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{issueDate}</span>
                      </div>
                    </div>
                    <FileText className="w-5 h-5 text-primary/40" />
                  </div>

                  {prescription.drugs && prescription.drugs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prescription.drugs.slice(0, 2).map((drug, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded text-[10px] text-gray-600">
                          <Pill className="w-2 h-2" />
                          <span>{drug.drug_name}</span>
                        </div>
                      ))}
                      {prescription.drugs.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{prescription.drugs.length - 2} المزيد</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 mt-3 border-t border-gray-50">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 h-8 text-xs rounded-lg text-primary hover:bg-primary/5"
                      onClick={() => navigate(`/doctor/prescriptions/${prescription.prescription_id}`)}
                    >
                      عرض الوصفة
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
