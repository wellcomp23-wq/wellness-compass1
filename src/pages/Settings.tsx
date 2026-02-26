import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  ArrowRight,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Phone verification states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // الحصول على بيانات المستخدم الحالي
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم");

      setCurrentUser(user);
      setEmailVerified(user.email_confirmed_at !== null);

      // الحصول على بيانات الملف الشخصي
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileErr && profileData) {
        setProfile(profileData);
        setPhoneNumber(profileData.phone_number || "");
        setPhoneVerified(profileData.phone_verified || false);
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailVerification = async () => {
    setIsVerifyingEmail(true);

    try {
      const { error } = await supabase.auth.resendEnrollFactorChallenge({
        factorId: currentUser.id,
      });

      if (error) {
        // Fallback: إرسال رسالة بريد إلكترونية للتحقق
        await supabase.auth.signInWithOtp({
          email: currentUser.email,
        });
      }

      toast({
        title: "نجاح",
        description: "تم إرسال رابط التحقق إلى بريدك الإلكتروني",
      });

      setShowEmailVerification(true);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال رابط التحقق",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSendPhoneOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال رقم هاتف صحيح",
        variant: "destructive",
      });
      phoneInputRef.current?.focus();
      return;
    }

    setIsVerifyingPhone(true);

    try {
      // تنسيق رقم الهاتف
      const cleaned = phoneNumber.replace(/\D/g, "");
      let formattedPhone = "";

      if (cleaned.startsWith("1")) {
        formattedPhone = `+1${cleaned}`;
      } else {
        formattedPhone = `+967${cleaned}`;
      }

      // استدعاء Edge Function لإرسال OTP
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ phone_number: formattedPhone }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "فشل إرسال الرمز");

      toast({
        title: "نجاح",
        description: "تم إرسال رمز التحقق إلى هاتفك",
      });

      setShowPhoneOTP(true);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleVerifyPhoneOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال رمز التحقق الكامل",
        variant: "destructive",
      });
      otpInputRef.current?.focus();
      return;
    }

    setIsVerifyingPhone(true);

    try {
      // تنسيق رقم الهاتف
      const cleaned = phoneNumber.replace(/\D/g, "");
      let formattedPhone = "";

      if (cleaned.startsWith("1")) {
        formattedPhone = `+1${cleaned}`;
      } else {
        formattedPhone = `+967${cleaned}`;
      }

      // استدعاء Edge Function للتحقق
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
            otp_code: otpCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "فشل التحقق");

      // تحديث قاعدة البيانات
      await supabase
        .from("profiles")
        .update({
          phone_number: formattedPhone,
          phone_verified: true,
        })
        .eq("id", currentUser.id);

      setPhoneVerified(true);
      setShowPhoneOTP(false);
      setOtpCode("");

      toast({
        title: "نجاح",
        description: "تم التحقق من رقم الهاتف بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleRequestPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: `${window.location.origin}/change-password`,
      });

      if (error) throw error;

      toast({
        title: "نجاح",
        description: "تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك.",
      });

      setShowPasswordChange(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال رابط تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            الإعدادات
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/home")}
              tabIndex={0}
              className="text-primary hover:text-primary/80 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-red-50"
              title="تسجيل الخروج"
              tabIndex={0}
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-floating rounded-lg p-1" role="tablist">
            <TabsTrigger value="account" tabIndex={0} role="tab" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              الحساب
            </TabsTrigger>
            <TabsTrigger value="security" tabIndex={0} role="tab" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              الأمان
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-800">معلومات الحساب</h2>

              {/* Email Section */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">البريد الإلكتروني</p>
                      <p className="text-sm text-gray-600">{currentUser?.email}</p>
                    </div>
                  </div>
                  {emailVerified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">مُوثَّق</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">غير مُوثَّق</span>
                    </div>
                  )}
                </div>

                {/* Email Verification Button */}
                {!emailVerified && (
                  <Button
                    onClick={handleSendEmailVerification}
                    disabled={isVerifyingEmail}
                    tabIndex={0}
                    variant="outline"
                    className="w-full rounded-xl border-primary text-primary hover:bg-primary/5"
                  >
                    {isVerifyingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "إرسال رابط التحقق"
                    )}
                  </Button>
                )}
              </div>

              {/* Phone Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-gray-800">رقم الهاتف</p>
                      <p className="text-sm text-gray-600">{phoneNumber || "لم يتم إدخال رقم هاتف"}</p>
                    </div>
                  </div>
                  {phoneVerified ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">مُوثَّق</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">غير مُوثَّق</span>
                    </div>
                  )}
                </div>

                {!phoneVerified && (
                  <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                    <Input
                      ref={phoneInputRef}
                      type="tel"
                      placeholder="أدخل رقم الهاتف (مثل: 733933331)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isVerifyingPhone}
                      tabIndex={0}
                      className="rounded-xl border-primary"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isVerifyingPhone || !phoneNumber}
                        tabIndex={0}
                        className="flex-1 gradient-primary text-white"
                      >
                        {isVerifyingPhone ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "إرسال الرمز"
                        )}
                      </Button>
                    </div>

                    {showPhoneOTP && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <Input
                          ref={otpInputRef}
                          type="text"
                          placeholder="أدخل رمز التحقق (6 أرقام)"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          tabIndex={0}
                          className="text-center text-lg tracking-widest font-bold rounded-xl border-primary"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isVerifyingPhone || otpCode.length < 6}
                            tabIndex={0}
                            className="flex-1 gradient-primary text-white"
                            onClick={(e) => handleVerifyPhoneOTP(e as any)}
                          >
                            {isVerifyingPhone ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "تأكيد الرمز"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPhoneOTP(false)}
                            tabIndex={0}
                            className="rounded-xl"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-800">الأمان والخصوصية</h2>
              <p className="text-sm text-gray-600">
                يمكنك إدارة إعدادات الأمان الخاصة بحسابك هنا.
              </p>

              {!showPasswordChange ? (
                <Button
                  onClick={() => setShowPasswordChange(true)}
                  variant="outline"
                  className="w-full rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-blue-50"
                  tabIndex={0}
                >
                  <Shield className="w-4 h-4 ml-2" />
                  تغيير كلمة المرور
                </Button>
              ) : (
                <form onSubmit={handleRequestPasswordChange} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <p className="text-sm text-blue-900 font-semibold">
                      🔒 سيتم إرسال رابط تأكيد إلى بريدك الإلكتروني. اتبع الخطوات لتغيير كلمة المرور بأمان.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      tabIndex={0}
                      className="flex-1 gradient-primary text-white rounded-xl"
                    >
                      {isChangingPassword ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "إرسال رابط التأكيد"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordChange(false)}
                      tabIndex={0}
                      className="flex-1 rounded-xl"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <div className="mt-8">
          <Button
            onClick={handleLogout}
            variant="ghost"
            tabIndex={0}
            className="w-full text-red-600 hover:bg-red-50 rounded-xl font-semibold"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
