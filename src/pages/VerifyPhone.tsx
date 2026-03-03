import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Phone, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function VerifyPhonePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState<"enter" | "verify">("enter")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  const phoneInputRef = useRef<HTMLInputElement>(null)
  const otpInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        navigate("/login")
        return
      }
      setCurrentUser(user)
    } catch (err) {
      console.error("Error fetching user:", err)
      navigate("/login")
    }
  }

  const validatePhone = (phone: string) => {
    // Accept Yemeni phone numbers starting with +967 or 00967 or just the local format
    const phoneRegex = /^(\+967|00967|0)?(7[0-9]|9[0-9])\d{7}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedPhone = phoneNumber.trim().replace(/\s/g, "")
    
    if (!validatePhone(trimmedPhone)) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم هاتف صحيح (مثال: +967771234567 أو 0771234567)",
        variant: "destructive"
      })
      phoneInputRef.current?.focus()
      return
    }

    setIsLoading(true)
    try {
      // Format phone number to E.164 format
      let formattedPhone = trimmedPhone
      if (formattedPhone.startsWith("00967")) {
        formattedPhone = "+" + formattedPhone.substring(2)
      } else if (formattedPhone.startsWith("0")) {
        formattedPhone = "+967" + formattedPhone.substring(1)
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+967" + formattedPhone
      }

      // Call OTP sending function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ phone_number: formattedPhone })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل في إرسال رمز التحقق")
      }

      setPhoneNumber(formattedPhone)
      setStep("verify")
      setResendCountdown(60)
      
      toast({
        title: "نجاح",
        description: "تم إرسال رمز التحقق إلى رقم هاتفك"
      })

      setTimeout(() => otpInputRef.current?.focus(), 100)
    } catch (error: any) {
      console.error("Error sending OTP:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال رمز التحقق",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive"
      })
      otpInputRef.current?.focus()
      return
    }

    setIsLoading(true)
    try {
      // Verify OTP
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            phone_number: phoneNumber,
            otp_code: otpCode
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل التحقق من الرمز")
      }

      // Update user profile with verified phone
      await supabase
        .from("users")
        .update({
          phone_number: phoneNumber,
          is_verified: true
        })
        .eq("user_id", currentUser.id)

      setIsVerified(true)
      toast({
        title: "نجاح",
        description: "تم التحقق من رقم هاتفك بنجاح"
      })

      setTimeout(() => {
        navigate("/home")
      }, 2000)
    } catch (error: any) {
      console.error("Error verifying OTP:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل التحقق من الرمز",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-phone-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ phone_number: phoneNumber })
        }
      )

      if (!response.ok) {
        throw new Error("فشل في إعادة إرسال الرمز")
      }

      setResendCountdown(60)
      toast({
        title: "نجاح",
        description: "تم إعادة إرسال رمز التحقق"
      })
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إعادة إرسال الرمز",
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
            <p className="text-muted-foreground">تم التحقق من رقم هاتفك بنجاح. جاري إعادة التوجيه...</p>
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
          <h1 className="text-2xl font-bold">تأكيد رقم الهاتف</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Phone className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          {step === "enter" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="+967771234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  className="h-12 rounded-xl text-right"
                  dir="rtl"
                />
                <p className="text-xs text-muted-foreground">
                  أدخل رقم هاتفك بصيغة +967 أو 00967 أو 0
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full h-12 rounded-xl font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال رمز التحقق"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">رمز التحقق</Label>
                <Input
                  id="otp"
                  ref={otpInputRef}
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isLoading}
                  maxLength={6}
                  className="h-12 rounded-xl text-center text-2xl tracking-widest font-bold"
                />
                <p className="text-xs text-muted-foreground text-center">
                  أدخل الرمز المكون من 6 أرقام المرسل إلى {phoneNumber}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full h-12 rounded-xl font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  "تأكيد"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={resendCountdown > 0 || isLoading}
                onClick={handleResendOTP}
                className="w-full h-12 rounded-xl font-bold"
              >
                {resendCountdown > 0
                  ? `إعادة الإرسال بعد ${resendCountdown}ث`
                  : "إعادة إرسال الرمز"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("enter")
                  setOtpCode("")
                  setResendCountdown(0)
                }}
                className="w-full"
              >
                تغيير رقم الهاتف
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
