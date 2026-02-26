import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ArrowRight, Lock, CheckCircle } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "تنبيه",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "نجاح",
        description: "تم تغيير كلمة المرور بنجاح",
      });

      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">تم التغيير بنجاح</h1>
            <p className="text-gray-600">تم تغيير كلمة المرور بنجاح. سيتم إعادة توجيهك الآن...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-center">بوصلة العافية</h1>
          <p className="text-sm text-muted-foreground font-bold mt-2">تغيير كلمة المرور</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
            <h2 className="text-2xl font-black">كلمة مرور جديدة</h2>
            <p className="text-sm font-bold text-gray-600 mt-1">أدخل كلمة مرور قوية وآمنة</p>
          </div>

          <form onSubmit={handleChangePassword} className="p-8 space-y-6">
            {/* New Password */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-700">كلمة المرور الجديدة</label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  disabled={isLoading}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords.new ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-700">تأكيد كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  disabled={isLoading}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords.confirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full h-12 rounded-xl font-black text-base"
            >
              {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-xs text-blue-900 font-bold leading-relaxed">
                🔒 تأكد من استخدام كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة.
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground font-bold mt-6">
          © 2026 بوصلة العافية - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
