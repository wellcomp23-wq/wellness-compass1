import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Stethoscope, Users, ShieldCheck, Activity, Bell } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center px-4 py-8 md:py-16 overflow-x-hidden" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl relative z-10 space-y-12 md:space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-primary/10 shadow-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary">أول منصة صحية ذكية في اليمن</span>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] gradient-healing flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 animate-in zoom-in duration-700">
              <Heart className="h-12 w-12 md:h-16 md:w-16 text-white" fill="white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight gradient-text leading-tight">
            بوصلة العافية
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
            نحن هنا لنقودك نحو حياة أكثر صحة. أدر مواعيدك، تتبع أدويتك، وتواصل مع أفضل الأطباء في اليمن عبر منصة واحدة ذكية.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-6 pt-4">
            <Button
              className="h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 btn-medical flex-1 sm:flex-none transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => navigate("/register?role=patient")}
            >
              ابدأ رحلتك مجاناً
            </Button>
            <Button
              className="h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-[#0ea5e9] text-white border-0 flex-1 sm:flex-none transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-gradient-to-r hover:from-[#0ea5e9] hover:to-[#10b981]"
              onClick={() => navigate("/login")}
            >
              تسجيل الدخول
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Activity, label: "تحليل ذكي", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Bell, label: "تذكير الأدوية", color: "text-orange-500", bg: "bg-orange-50" },
            { icon: Stethoscope, label: "استشارات", color: "text-primary", bg: "bg-primary/5" },
            { icon: ShieldCheck, label: "أمان البيانات", color: "text-green-500", bg: "bg-green-50" },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center p-4 md:p-6 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-3`}>
                <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`} />
              </div>
              <span className="font-bold text-sm md:text-base">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-10">
          {/* Patient Card */}
          <Card
            className="group relative overflow-hidden cursor-pointer border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[2.5rem] transition-all hover:scale-[1.02]"
            onClick={() => navigate("/register?role=patient")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
            <CardHeader className="text-center pt-10">
              <div className="mx-auto bg-primary/10 p-6 rounded-3xl w-fit mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">أنا مريض</CardTitle>
              <CardDescription className="text-base px-6">
                أبحث عن رعاية صحية ذكية وتنظيم لحياتي الطبية اليومية
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  حجز المواعيد مع أفضل الأطباء
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  تنبيهات ذكية لمواعيد الأدوية
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  ملف صحي شامل متاح في أي وقت
                </li>
              </ul>
              <Button 
                className="w-full h-12 rounded-xl btn-medical font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/register?role=patient");
                }}
              >
                انضم كـ مريض
              </Button>
            </CardContent>
          </Card>

          {/* Provider Card */}
          <Card
            className="group relative overflow-hidden cursor-pointer border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[2.5rem] transition-all hover:scale-[1.02]"
            onClick={() => navigate("/register?role=provider")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
            <CardHeader className="text-center pt-10">
              <div className="mx-auto bg-secondary/10 p-6 rounded-3xl w-fit mb-4">
                <Stethoscope className="h-10 w-10 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-bold">أنا مقدم خدمة</CardTitle>
              <CardDescription className="text-base px-6">
                طبيب، صيدلية، أو مختبر يتطلع لتقديم خدماته بشكل رقمي
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10">
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  إدارة المواعيد والزيارات بكفاءة
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  الوصول لشريحة أكبر من المرضى
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  بناء سمعة مهنية رقمية موثوقة
                </li>
              </ul>
              <Button 
                className="w-full h-12 rounded-xl btn-healing font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-gradient-to-r hover:from-[#10b981] hover:to-[#0ea5e9]"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/register?role=provider");
                }}
              >
                انضم كـ مقدم خدمة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
