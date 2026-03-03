import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Timer, RefreshCw } from "lucide-react";

interface OTPVerificationProps {
  phone: string;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export default function OTPVerification({ phone, onVerify, onResend }: OTPVerificationProps) {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = () => {
    if (code.length !== 6) {
      toast({
        title: "رمز غير صحيح",
        description: "يرجى إدخال الرمز المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }
    onVerify(code);
  };

  return (
    <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">التحقق من الرقم</h2>
        <p className="text-muted-foreground text-sm">
          أدخل الرمز المرسل إلى الرقم <span dir="ltr" className="font-bold text-primary">{phone}</span>
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="0 0 0 0 0 0"
          className="text-center text-2xl tracking-[1em] h-14 font-bold rounded-xl border-primary/20"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        
        <div className="flex items-center justify-center gap-2 text-sm">
          {timeLeft > 0 ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer className="w-4 h-4" />
              إعادة الإرسال خلال {timeLeft} ثانية
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { setTimeLeft(60); onResend(); }} className="text-primary font-bold">
              <RefreshCw className="w-4 h-4 ml-1" />
              إعادة إرسال الرمز
            </Button>
          )}
        </div>
      </div>

      <Button onClick={handleVerify} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 btn-medical">
        تأكيد الرمز
      </Button>
    </div>
  );
}
