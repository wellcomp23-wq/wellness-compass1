import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

interface ChangeAdminPasswordProps {
  onClose?: () => void;
}

const DEFAULT_ADMIN_PASSWORD = "Admin@2026";

const ChangeAdminPassword = ({ onClose }: ChangeAdminPasswordProps) => {
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // التحقق من صحة البيانات
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمات المرور الجديدة غير متطابقة");
      return;
    }

    if (newPassword.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (newPassword === currentPassword) {
      setError("كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية");
      return;
    }

    setIsLoading(true);

    try {
      // محاكاة تأخير الطلب
      await new Promise(resolve => setTimeout(resolve, 1000));

      // الحصول على كلمة المرور المحفوظة من localStorage
      const storedPassword = localStorage.getItem("adminPassword") || DEFAULT_ADMIN_PASSWORD;
      
      // التحقق من كلمة المرور الحالية
      if (currentPassword !== storedPassword) {
        setError("كلمة المرور الحالية غير صحيحة");
        setIsLoading(false);
        toast({
          title: "خطأ",
          description: "كلمة المرور الحالية غير صحيحة",
          variant: "destructive"
        });
        return;
      }

      // حفظ كلمة المرور الجديدة بشكل آمن في localStorage
      localStorage.setItem("adminPassword", newPassword);

      // تحديث بيانات الجلسة
      const adminSession = localStorage.getItem("adminSession");
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          const updatedSession = {
            ...session,
            lastPasswordChange: new Date().toISOString(),
            passwordVersion: (session.passwordVersion || 0) + 1
          };
          localStorage.setItem("adminSession", JSON.stringify(updatedSession));
        } catch (e) {
          console.error("Error updating session:", e);
        }
      }

      setSuccess(true);
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: "سيتم استخدام كلمة المرور الجديدة عند تسجيل الدخول القادم.",
      });

      // إعادة تعيين الحقول
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // إغلاق النافذة بعد ثانيتين
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء تغيير كلمة المرور";
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-6">
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <Lock className="w-5 h-5" /> تغيير كلمة المرور
        </CardTitle>
        <CardDescription className="text-xs font-bold">قم بتحديث بيانات اعتماد المسؤول بشكل آمن</CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-emerald-600 mb-2">تم التحديث بنجاح!</h3>
            <p className="text-sm text-muted-foreground font-bold">
              تم حفظ كلمة المرور الجديدة. سيتم استخدامها عند تسجيل الدخول القادم.
            </p>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-3">
              <Label htmlFor="current-password" className="text-sm font-black">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="أدخل كلمة المرور الحالية"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  disabled={isLoading}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPasswords.current ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-sm font-black">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="new-password"
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
                  {showPasswords.new ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-bold">يجب أن تكون 8 أحرف على الأقل</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-sm font-black">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
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
                  {showPasswords.confirm ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                className="flex-1 h-12 rounded-xl font-black text-base"
              >
                {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl font-black text-base"
                >
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangeAdminPassword;
