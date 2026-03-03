import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  User,
  Calendar,
  Phone,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  FileText
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface Patient {
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  phone: string
  blood_type: string
  chronic_diseases?: string
  last_appointment?: string
}

export default function DoctorPatients() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")

      // جلب المرضى الذين لهم مواعيد مع هذا الطبيب
      const { data: appointmentsData, error: appointmentsErr } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .distinct()

      if (appointmentsErr) throw appointmentsErr

      const patientIds = appointmentsData?.map(a => a.patient_id) || []

      if (patientIds.length === 0) {
        setPatients([])
        setError(null)
        setLoading(false)
        return
      }

      // جلب بيانات المرضى
      const { data: patientsData, error: patientsErr } = await supabase
        .from('patients')
        .select('*')
        .in('patient_id', patientIds)
        .order('first_name', { ascending: true })

      if (patientsErr) throw patientsErr

      // جلب آخر موعد لكل مريض
      const patientsWithLastAppointment = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const { data: lastAppointment } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('patient_id', patient.patient_id)
            .eq('doctor_id', user.id)
            .order('appointment_date', { ascending: false })
            .limit(1)
            .single()

          return {
            ...patient,
            last_appointment: lastAppointment?.appointment_date
          }
        })
      )

      setPatients(patientsWithLastAppointment)
      setError(null)
    } catch (err) {
      console.error("Error fetching patients:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب قائمة المرضى")
    } finally {
      setLoading(false)
    }
  }

  const getPatientAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const filteredPatients = patients.filter(patient =>
    patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold">قائمة المرضى</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل قائمة المرضى...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">قائمة المرضى</h1>
          </div>
          <Badge variant="outline" className="rounded-lg">
            {filteredPatients.length} مريض
          </Badge>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مريض بالاسم أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-xl bg-white border-primary/10"
          />
        </div>

        {/* Patients List */}
        {filteredPatients.length > 0 ? (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div 
                key={patient.patient_id}
                className="bg-white rounded-2xl border border-primary/5 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {getPatientAge(patient.date_of_birth)} سنة - {patient.gender === 'MALE' ? 'ذكر' : 'أنثى'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {patient.blood_type && (
                    <Badge className="rounded-lg bg-red-100 text-red-700">
                      {patient.blood_type}
                    </Badge>
                  )}
                </div>

                {/* Contact Info */}
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </div>
                </div>

                {/* Health Info */}
                {patient.chronic_diseases && (
                  <div className="mb-3 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <span className="font-bold">الأمراض المزمنة:</span> {patient.chronic_diseases}
                    </p>
                  </div>
                )}

                {/* Last Visit */}
                {patient.last_appointment && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    آخر موعد: {new Date(patient.last_appointment).toLocaleDateString('ar')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="flex-1 rounded-lg text-xs gap-1"
                    onClick={() => navigate(`/doctor/patient/${patient.patient_id}`)}
                  >
                    <Eye className="w-3 h-3" />
                    عرض الملف
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-lg text-xs gap-1"
                    onClick={() => navigate(`/doctor/patient/${patient.patient_id}/medical-history`)}
                  >
                    <FileText className="w-3 h-3" />
                    السجل الطبي
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <User className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {searchQuery ? "لم يتم العثور على مرضى" : "لا توجد مرضى بعد"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-muted-foreground mt-1">
                سيظهر المرضى هنا بعد حجز أول موعد
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
