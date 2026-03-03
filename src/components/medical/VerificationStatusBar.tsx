import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface VerificationStatusBarProps {
  status: {
    is_verified: boolean
  }
}

export function VerificationStatusBar({ status }: VerificationStatusBarProps) {
  const navigate = useNavigate()

  if (status.is_verified) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <p className="text-sm font-bold text-green-900">حسابك المهني مؤكد ✅</p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <div>
          <p className="text-sm font-bold text-yellow-900">حسابك غير مؤكد ⏳</p>
          <p className="text-xs text-yellow-700 mt-1">يرجى إتمام عملية التحقق لتفعيل كافة الميزات</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="rounded-lg border-yellow-200 text-yellow-700 hover:bg-yellow-100 h-8 text-xs font-bold"
        onClick={() => navigate('/doctor/profile/edit')}
      >
        إتمام التحقق
        <ArrowRight className="w-3 h-3 mr-1" />
      </Button>
    </div>
  )
}
