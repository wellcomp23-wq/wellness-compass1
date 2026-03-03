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

    // محاكاة تأخير الطلب لإعطاء شعور بالتحقق الأمني
    await new Promise(resolve => setTimeout(resolve, 800));

    // الحصول على كلمة المرور المحفوظة من localStorage (إن وجدت) أو استخدام الافتراضية
    const storedPassword = localStorage.getItem("adminPassword") || DEFAULT_ADMIN_PASSWORD;

    // التحقق من بيانات الاعتماد
    if (email === DEFAULT_ADMIN_EMAIL && password === storedPassword) {
      // توليد توكن بسيط للجلسة (Base64)
      const token = btoa(`${email}:${Date.now()}`);
      
      // تعيين وقت انتهاء الجلسة (مثلاً بعد 24 ساعة)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);

      // حفظ البيانات في localStorage بالمفاتيح التي يتوقعها AdminProtectedRoute في App.tsx
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminTokenExpiry", expiryTime.toString());
      
      // حفظ بيانات إضافية للمسؤول (اختياري)
      const adminSession = {
        isAdminLoggedIn: true,
        adminEmail: email,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("adminSession", JSON.stringify(adminSession));

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "أهلاً وسهلاً بك في لوحة تحكم المسؤول لبوصلة العافية",
      });

      // التوجيه الفوري إلى لوحة التحكم
      navigate("/admin-dashboard", { replace: true });
    } else {
      setError("بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.");
      setIsLoading(false);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      // إعادة التركيز على حقل البريد الإلكتروني عند الخطأ
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
          <h1 className="text-3xl font-black text-center text-slate-800">بوصلة العافية</h1>
          <p className="text-sm text-muted-foreground font-bold mt-2">لوحة تحكم المسؤول</p>
        </div>

        {/* Login Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6 text-center border-b border-slate-50">
            <CardTitle className="text-2xl font-black text-slate-800">تسجيل الدخول</CardTitle>
            <CardDescription className="text-sm font-bold text-slate-500">أدخل بيانات اعتماد المسؤول للوصول</CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-black text-slate-700 mr-1">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  ref={emailInputRef}
                  type="email"
                  placeholder="admin@wellness.ps"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-12 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-black text-slate-700 mr-1">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 rounded-xl border-2 border-slate-100 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-bold pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التحقق...</span>
                  </div>
                ) : "تسجيل الدخول كمسؤول"}
              </Button>

              {/* Security Notice */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-[11px] text-blue-800 font-bold leading-relaxed text-center">
                  🔒 هذه المنطقة مخصصة لمسؤولي النظام فقط. يتم تسجيل جميع محاولات الدخول لأغراض أمنية.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 font-bold mt-8">
          © 2026 بوصلة العافية • نظام الإدارة المركزي
        </p>
      </div>
    </div>
  );
};

// Loader component for the button
const Loader2 = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default AdminLogin;
