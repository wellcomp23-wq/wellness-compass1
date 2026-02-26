import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Mail, ChevronLeft, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react"

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [checkingVerification, setCheckingVerification] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Poll to check if email is verified
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!currentUser) return

      setCheckingVerification(true)
      try {
        const { data: { user }, error } = await supabase.auth.refreshSession()
        
        if (!error && user?.email_confirmed_at) {
          // Update user profile
          await supabase
            .from("users")
            .update({ is_verified: true })
            .eq("user_id", user.id)

          setIsVerified(true)
          toast({
            title: "نجاح",
            description: "تم التحقق من بريدك الإلكتروني بنجاح"
          })

          setTimeout(() => {
            navigate("/home")
          }, 2000)
        }
      } catch (err) {
        console.error("Error checking verification:", err)
      } finally {
        setCheckingVerification(false)
      }
    }

    const interval = setInterval(checkEmailVerification, 3000)
    return () => clearInterval(interval)
  }, [currentUser, navigate, toast])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        navigate("/login")
        return
      }
      setCurrentUser(user)
      
      // Check if already verified
      if (user.email_confirmed_at) {
        setIsVerified(true)
      }
    } catch (err) {
      console.error("Error fetching user:", err)
      navigate("/login")
    }
  }

  const handleSendVerificationEmail = async () => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resendEnrollFactorChallenge({
        factorId: currentUser.id
      })

      if (error) {
        // Fallback: Use signInWithOtp to send verification email
        await supabase.auth.signInWithOtp({
          email: currentUser.email,
          options: {
            shouldCreateUser: false
          }
        })
      }

      setResendCountdown(60)
      toast({
        title: "نجاح",
        description: `تم إرسال رابط التحقق إلى ${currentUser.email}`
      })
    } catch (error: any) {
      console.error("Error sending verification email:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال رابط التحقق",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-green-600">تم التحقق بنجاح</h1>
            <p className="text-muted-foreground">تم التحقق من بريدك الإلكتروني بنجاح. جاري إعادة التوجيه...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </Button>
          <h1 className="text-2xl font-bold">التحقق من البريد الإلكتروني</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
              <Mail className="w-7 h-7 text-green-600" />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">تحقق من بريدك الإلكتروني</h2>
            <p className="text-muted-foreground text-sm">
              لقد أرسلنا رابط تحقق إلى{" "}
              <span className="font-bold text-foreground">{currentUser?.email}</span>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-bold mb-1">الخطوات:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>افتح بريدك الإلكتروني</li>
                <li>ابحث عن رسالة من "بوصلة العافية"</li>
                <li>انقر على رابط التحقق في الرسالة</li>
                <li>ستتم إعادة توجيهك تلقائياً هنا</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSendVerificationEmail}
              disabled={resendCountdown > 0 || isLoading}
              className="w-full h-12 rounded-xl font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : resendCountdown > 0 ? (
                `إعادة الإرسال بعد ${resendCountdown}ث`
              ) : (
                "إعادة إرسال رابط التحقق"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/home")}
              className="w-full h-12 rounded-xl font-bold"
            >
              تخطي في الوقت الحالي
            </Button>
          </div>

          {checkingVerification && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحقق من البريد الإلكتروني...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
