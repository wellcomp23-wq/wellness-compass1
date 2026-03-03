import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  LogOut,
  ArrowRight,
  Loader2,
  Lock,
  Bell,
  HelpCircle,
  ChevronLeft,
  Settings,
  Phone,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);

      // Fetch profile for phone verification status if needed
      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!profileErr) {
        setUserProfile(profile);
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({ title: "خطأ", description: "فشل في جلب بيانات المستخدم", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!currentUser?.email) return;
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: `${window.location.origin}/change-password`,
      });
      if (error) throw error;
      toast({ title: "نجاح", description: "تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني." });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-8 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowRight className="w-6 h-6 text-slate-600" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">الإعدادات</h1>
            <p className="text-xs text-muted-foreground font-bold">تخصيص تجربتك في التطبيق</p>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Account Security Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              الأمان والخصوصية
            </h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {/* Email Verification */}
              <div className="p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">البريد الإلكتروني</p>
                    <p className="text-[10px] font-bold text-slate-400">{currentUser?.email}</p>
                  </div>
                </div>
                {currentUser?.email_confirmed_at ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-full font-black text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> مؤكد
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-1 rounded-full font-black text-[10px]">قيد التأكيد</Badge>
                )}
              </div>

              {/* Phone Verification */}
              <div className="p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">رقم الهاتف</p>
                    <p className="text-[10px] font-bold text-slate-400">{userProfile?.phone_number || "غير محدد"}</p>
                  </div>
                </div>
                {userProfile?.is_verified ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-full font-black text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> مؤكد
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate("/verify-phone")} 
                    className="rounded-xl font-black h-10 px-6 border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    تأكيد الآن
                  </Button>
                )}
              </div>

              {/* Password Change */}
              <div className="p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">كلمة المرور</p>
                    <p className="text-[10px] font-bold text-slate-400">تغيير كلمة المرور الحالية</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleRequestPasswordChange} disabled={isChangingPassword} className="rounded-xl font-black h-10 px-6">
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "تغيير"}
                </Button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              تفضيلات التطبيق
            </h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              <div className="p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm">الإشعارات</p>
                    <p className="text-[10px] font-bold text-slate-400">إدارة تنبيهات المواعيد والأدوية</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                   <div className="w-4 h-4 bg-white rounded-full mr-auto shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                <button onClick={() => navigate('/support')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group text-right">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                         <HelpCircle className="w-6 h-6 text-slate-500 group-hover:text-primary" />
                      </div>
                      <div>
                         <p className="font-black text-slate-800 text-sm">مركز المساعدة</p>
                         <p className="text-[10px] font-bold text-slate-400">تواصل مع الدعم الفني</p>
                      </div>
                   </div>
                   <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
                <button onClick={handleLogout} className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-colors group text-right">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                         <LogOut className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                         <p className="font-black text-red-600 text-sm">تسجيل الخروج</p>
                         <p className="text-[10px] font-bold text-red-400/60">الخروج الآمن من الحساب</p>
                      </div>
                   </div>
                </button>
             </div>
          </div>

          <div className="text-center pt-4">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">إصدار التطبيق 1.0.0 (BETA)</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
