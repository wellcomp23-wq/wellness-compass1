import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, AlertCircle, Bell, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDoctorData } from "@/hooks/useDoctorData"
import { useDoctorNotifications } from "@/hooks/useDoctorNotifications"
import { useDoctorLabTests } from "@/hooks/useDoctorLabTests"
import { useDoctorPrescriptions } from "@/hooks/useDoctorPrescriptions"
import { DoctorProfileHeader } from "@/components/medical/DoctorProfileHeader"
import { VerificationStatusBar } from "@/components/medical/VerificationStatusBar"
import { NotificationsPopover } from "@/components/medical/NotificationsPopover"
import { AppointmentsSection } from "@/components/medical/AppointmentsSection"
import { PatientsSection } from "@/components/medical/PatientsSection"
import { LabTestsSection } from "@/components/medical/LabTestsSection"
import { PrescriptionsSection } from "@/components/medical/PrescriptionsSection"
import { supabase } from "@/integrations/supabase/client"

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const { doctor, upcomingAppointments, recentPatients, loading, error, updateAppointmentStatus } = useDoctorData()
  const { unreadCount } = useDoctorNotifications()
  const { labTests, refetch: refetchLabTests } = useDoctorLabTests()
  const { prescriptions } = useDoctorPrescriptions()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الخروج",
        variant: "destructive"
      })
    }
  }

  const handleAppointmentStatusChange = async (appointmentId: string, status: string) => {
    const success = await updateAppointmentStatus(appointmentId, status)
    if (success) {
      toast({
        title: "نجح",
        description: `تم ${status === 'CONFIRMED' ? 'تأكيد' : 'إلغاء'} الموعد`,
      })
    } else {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الموعد",
        variant: "destructive"
      })
    }
    return success
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header with Notifications and Logout */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">لوحة تحكم الطبيب</h1>
          <div className="flex items-center gap-2">
            <NotificationsPopover />
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Doctor Profile Header */}
        {doctor && (
          <DoctorProfileHeader 
            doctor={doctor}
            rankingScore={doctor.average_rating || 0}
          />
        )}

        {/* Verification Status Bar */}
        {doctor && (
          <VerificationStatusBar 
            status={{ is_verified: !!doctor.is_verified }}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <AppointmentsSection 
              appointments={upcomingAppointments || []}
              onStatusChange={handleAppointmentStatusChange}
              loading={loading}
            />
            <LabTestsSection 
              labTests={labTests || []}
              onRefresh={refetchLabTests}
              loading={loading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PatientsSection 
              patients={recentPatients || []}
              loading={loading}
            />
            <PrescriptionsSection 
              prescriptions={prescriptions || []}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
