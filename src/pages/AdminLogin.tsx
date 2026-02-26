import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

// البيانات الافتراضية الأولية للمسؤول
const DEFAULT_ADMIN_EMAIL = "admin@wellness.ps";
const DEFAULT_ADMIN_PASSWORD = "Admin@2026";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on email input
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // محاكاة تأخير الطلب
    await new Promise(resolve => setTimeout(resolve, 800));

    // الحصول على كلمة المرور المحفوظة من localStorage (إن وجدت)
    const storedPassword = localStorage.getItem("adminPassword") || DEFAULT_ADMIN_PASSWORD;

    // التحقق من بيانات الاعتماد
    if (email === DEFAULT_ADMIN_EMAIL && password === storedPassword) {
      // حفظ جلسة المسؤول في localStorage
      const adminSession = {
        isAdminLoggedIn: true,
        adminEmail: email,
        loginTime: new Date().toISOString(),
        token: btoa(`${email}:${Date.now()}`) // رمز بسيط للجلسة
      };
      localStorage.setItem("adminSession", JSON.stringify(adminSession));

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "أهلاً وسهلاً في لوحة تحكم بوصلة العافية",
      });

      // إعادة التوجيه إلى لوحة التحكم بعد تأخير قصير لضمان حفظ الجلسة
      setTimeout(() => {
        navigate("/admin-dashboard", { replace: true });
      }, 100);
    } else {
      setError("بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.");
      setIsLoading(false);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "بيانات الدخول غير صحيحة",
        variant: "destructive"
      });
      // Focus back to email on error
      emailInputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-center">بوصلة العافية</h1>
          <p className="text-sm text-muted-foreground font-bold mt-2">لوحة تحكم المسؤول</p>
        </div>

        {/* Login Card */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-6">
            <CardTitle className="text-2xl font-black">تسجيل الدخول</CardTitle>
            <CardDescription className="text-sm font-bold">أدخل بيانات اعتماد المسؤول</CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-black">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  ref={emailInputRef}
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  tabIndex={0}
                  className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-black">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    tabIndex={0}
                    className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    tabIndex={0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                tabIndex={0}
                className="w-full h-12 rounded-xl font-black text-base"
              >
                {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
              </Button>

              {/* Security Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-xs text-blue-900 font-bold leading-relaxed">
                  🔒 هذه واجهة آمنة لتسجيل دخول المسؤولين فقط. يمكنك تغيير كلمة المرور الخاصة بك من لوحة التحكم بعد تسجيل الدخول.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground font-bold mt-6">
          © 2026 بوصلة العافية - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
