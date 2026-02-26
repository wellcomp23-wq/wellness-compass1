import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Heart, ArrowRight, User, Stethoscope, Mail, Lock, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, getRoleBasedRedirect, UserRole } from "@/lib/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"patient" | "provider">("patient");
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  
  const firstInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    isMounted.current = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isMounted.current) {
        // If a session exists, get the role and redirect immediately.
        getUserRole(session.user.id).then(role => {
          if (isMounted.current) {
            const redirectPath = getRoleBasedRedirect(role as UserRole);
            navigate(redirectPath, { replace: true });
          }
        });
      }
    });
    return () => { isMounted.current = false; };
  }, [navigate]);

  // Auto-focus on first input
  useEffect(() => {
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, [loginType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // Input validation
    if (loginType === "patient") {
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        toast({ title: "تنبيه", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
        firstInputRef.current?.focus();
        return;
      }
    } else {
      if (!trimmedUsername) {
        toast({ title: "تنبيه", description: "يرجى إدخال اسم المستخدم", variant: "destructive" });
        firstInputRef.current?.focus();
        return;
      }
    }

    if (!trimmedPassword || trimmedPassword.length < 6) {
      toast({ title: "تنبيه", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      passwordInputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const loginEmail = loginType === "provider" ? `${trimmedUsername}@provider.local` : trimmedEmail;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      if (data.user && isMounted.current) {
        const userRole = await getUserRole(data.user.id);
        const redirectPath = getRoleBasedRedirect(userRole as UserRole);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في بوصلة العافية",
        });

        setTimeout(() => {
          if (isMounted.current) {
            navigate(redirectPath, { replace: true });
          }
        }, 500);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (isMounted.current) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message === "Invalid login credentials" ? "البيانات المدخلة غير صحيحة" : error.message || "حدث خطأ أثناء محاولة الدخول",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/home` },
      });
      if (error) throw error;
    } catch (error: any) {
      if (isMounted.current) {
        toast({
          title: "خطأ في الدخول عبر جوجل",
          description: error.message || "حدث خطأ أثناء محاولة الدخول",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        // If in the first input, move to the password input
        if (e.currentTarget.id === 'email-username') {
            e.preventDefault();
            passwordInputRef.current?.focus();
        }
        // If in the password input, submit the form
        else if (e.currentTarget.id === 'password') {
            handleLogin(e as any);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Link to="/welcome" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">بوصلة العافية</h1>
          <p className="text-slate-500">رفيقك الذكي في رحلة الصحة والعافية</p>
        </div>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 bg-slate-50/50">
            <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              {loginType === "patient" ? "مرحباً بك مجدداً" : "دخول مقدمي الخدمة"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginType("patient")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  loginType === "patient" ? "bg-white shadow-sm text-primary" : "text-slate-500"
                }`}
              >
                مريض
              </button>
              <button
                type="button"
                onClick={() => setLoginType("provider")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  loginType === "provider" ? "bg-white shadow-sm text-secondary" : "text-slate-500"
                }`}
              >
                مقدم خدمة
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-username">{loginType === "patient" ? "البريد الإلكتروني" : "اسم المستخدم"}</Label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {loginType === "patient" ? <Mail className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <Input
                    id="email-username"
                    ref={firstInputRef}
                    type={loginType === "patient" ? "email" : "text"}
                    placeholder={loginType === "patient" ? "example@email.com" : "username"}
                    value={loginType === "patient" ? email : username}
                    onChange={(e) => loginType === "patient" ? setEmail(e.target.value) : setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10 h-12 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10 h-12 rounded-xl"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            {loginType === "patient" && (
              <div className="space-y-4">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="px-3 text-xs text-slate-400 uppercase">أو عبر</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-bold flex items-center justify-center gap-2"
                >
                  <Chrome className="w-5 h-5 text-red-500" />
                  الدخول عبر جوجل
                </Button>
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500">
                ليس لديك حساب؟{" "}
                <Link to="/register" className="text-primary font-bold hover:underline">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
