import { Beaker, RefreshCw, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { LabTest } from '@/hooks/useDoctorLabTests'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface LabTestsSectionProps {
  labTests: LabTest[]
  loading?: boolean
  onRefresh?: () => void
}

export function LabTestsSection({ labTests, loading, onRefresh }: LabTestsSectionProps) {
  const navigate = useNavigate()

  const pendingTests = labTests.filter(test => test.status === 'PENDING')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الفحوصات المعلقة</CardTitle>
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
        <CardTitle className="text-lg font-bold">الفحوصات المعلقة</CardTitle>
        <div className="flex gap-2">
          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-primary font-medium"
            onClick={() => navigate('/doctor/lab-tests')}
          >
            عرض الكل
            <ArrowRight className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {pendingTests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-300">
            <Beaker className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>لا توجد فحوصات معلقة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTests.slice(0, 3).map((test) => {
              let requestedDate = ''

              try {
                if (test.requested_at) {
                  requestedDate = format(new Date(test.requested_at), 'dd MMM yyyy', { locale: ar })
                }
              } catch (e) {
                requestedDate = test.requested_at || 'تاريخ غير معروف'
              }

              return (
                <div
                  key={test.request_id}
                  className="bg-white border border-primary/5 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm">{test.test_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">المريض: {test.patient_name || 'غير معروف'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{requestedDate}</span>
                      </div>
                    </div>
                    <Badge className="bg-yellow-50 text-yellow-700 border-none">
                      <Clock className="w-3 h-3 ml-1" />
                      معلق
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => navigate(`/doctor/lab-tests/${test.request_id}`)}
                    >
                      عرض التفاصيل
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
