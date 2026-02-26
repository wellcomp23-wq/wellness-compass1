import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import OTPVerification from "./OTPVerification";
import { useToast } from "@/hooks/use-toast";

interface VerificationGateProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  actionName: string;
}

export default function VerificationGate({ isOpen, onClose, onVerified, actionName }: VerificationGateProps) {
  const [showOTP, setShowOTP] = useState(false);
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handleStartVerification = () => {
    const phoneRegex = /^(77|73|71|70)\d{7}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "خطأ في التنسيق",
        description: "يرجى إدخال رقم هاتف يمني صحيح (77XXXXXXX)",
        variant: "destructive",
      });
      return;
    }
    setShowOTP(true);
  };

  const handleVerify = (code: string) => {
    // Simulated verification
    toast({
      title: "تم التحقق بنجاح",
      description: `يمكنك الآن ${actionName} بكل سهولة`,
    });
    onVerified();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">خطوة أخيرة للمتابعة</DialogTitle>
          <DialogDescription className="text-center">
            لإتمام عملية {actionName}، نحتاج للتحقق من رقم هاتفك لضمان أمان حسابك.
          </DialogDescription>
        </DialogHeader>

        {!showOTP ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold mr-1">رقم الهاتف</label>
              <input
                type="tel"
                placeholder="77XXXXXXX"
                className="w-full h-14 rounded-2xl bg-accent/30 border-none px-5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              onClick={handleStartVerification}
              className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              إرسال رمز التحقق
            </button>
          </div>
        ) : (
          <div className="py-4">
            <OTPVerification
              phone={phone}
              onVerify={handleVerify}
              onResend={() => toast({ title: "تم إعادة الإرسال", description: "تم إرسال رمز جديد لهاتفك" })}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
