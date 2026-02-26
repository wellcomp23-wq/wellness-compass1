import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface DoctorRatingProps {
  isOpen: boolean
  onClose: () => void
  doctorName: string
  appointmentId: string
}

export default function DoctorRating({ 
  isOpen, 
  onClose, 
  doctorName,
  appointmentId
}: DoctorRatingProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
   const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "يرجى إضافة تقييم",
        description: "يجب اختيار عدد النجوم للتقييم",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("يجب تسجيل الدخول للقيام بالتقييم")

      // جلب معرف الطبيب من الموعد (اختياري، هنا نستخدم الـ appointmentId)
      // في جدول ratings نحتاج patient_id و provider_user_id
      // سنفترض أننا نحصل على provider_user_id من الموعد
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('appointment_id', appointmentId)
        .single()

      if (!appointmentData) throw new Error("لم يتم العثور على بيانات الموعد")

      const { error } = await supabase
        .from('ratings')
        .insert([{
          patient_id: user.id,
          provider_user_id: appointmentData.doctor_id,
          rating: rating,
          comment: review
        }])

      if (error) throw error

      toast({
        title: "شكراً لتقييمك",
        description: `تم إرسال تقييمك لـ ${doctorName} بنجاح`,
      })
      onClose()
      setRating(0)
      setReview("")
    } catch (err: any) {
      console.error("Error submitting rating:", err)
      toast({
        title: "خطأ",
        description: err.message || "فشل في إرسال التقييم",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تقييم الطبيب</DialogTitle>
          <DialogDescription>
            كيف كانت تجربتك مع {doctorName}؟
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <label className="text-sm font-medium mb-3 block">التقييم</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {rating === 5 && "ممتاز"}
                {rating === 4 && "جيد جداً"}
                {rating === 3 && "جيد"}
                {rating === 2 && "مقبول"}
                {rating === 1 && "ضعيف"}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              ملاحظاتك (اختياري)
            </label>
            <Textarea
              placeholder="شارك تجربتك مع الطبيب..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="medical" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
