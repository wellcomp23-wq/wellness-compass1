import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Toggle, AlertCircle, Save } from "lucide-react";

interface SystemConfig {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  allowProviderApplications: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
}

const SystemSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    allowNewRegistrations: true,
    allowProviderApplications: true,
    emailNotifications: true,
    twoFactorAuth: false,
    maxUploadSize: 10,
    sessionTimeout: 60
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("systemConfig");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error loading system config:", e);
      }
    }
  }, []);

  const handleToggle = (key: keyof SystemConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key: keyof SystemConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("systemConfig", JSON.stringify(config));
      setIsSaving(false);
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Mode Alert */}
      {config.maintenanceMode && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-orange-900">⚠️ وضع الصيانة مفعّل</p>
            <p className="text-xs text-orange-700 font-bold mt-1">التطبيق حالياً في وضع الصيانة. سيرى المستخدمون رسالة صيانة عند محاولة الوصول.</p>
          </div>
        </div>
      )}

      {/* General Settings */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Settings className="w-5 h-5" /> الإعدادات العامة
          </CardTitle>
          <CardDescription className="text-xs font-bold">إدارة إعدادات التطبيق الأساسية</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <div>
              <h4 className="font-black text-sm">وضع الصيانة</h4>
              <p className="text-xs text-muted-foreground font-bold mt-1">تعطيل التطبيق مؤقتاً للصيانة والتحديثات</p>
            </div>
            <Button
              variant={config.maintenanceMode ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle("maintenanceMode")}
              className="rounded-lg font-bold"
            >
              {config.maintenanceMode ? "✓ مفعّل" : "معطّل"}
            </Button>
          </div>

          {/* Allow New Registrations */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <div>
              <h4 className="font-black text-sm">السماح بالتسجيل الجديد</h4>
              <p className="text-xs text-muted-foreground font-bold mt-1">السماح للمستخدمين الجدد بإنشاء حسابات</p>
            </div>
            <Button
              variant={config.allowNewRegistrations ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle("allowNewRegistrations")}
              className="rounded-lg font-bold"
            >
              {config.allowNewRegistrations ? "✓ مفعّل" : "معطّل"}
            </Button>
          </div>

          {/* Allow Provider Applications */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <div>
              <h4 className="font-black text-sm">السماح بطلبات مقدمي الخدمة</h4>
              <p className="text-xs text-muted-foreground font-bold mt-1">السماح بتقديم طلبات الانضمام للأطباء والصيادلة</p>
            </div>
            <Button
              variant={config.allowProviderApplications ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle("allowProviderApplications")}
              className="rounded-lg font-bold"
            >
              {config.allowProviderApplications ? "✓ مفعّل" : "معطّل"}
            </Button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <div>
              <h4 className="font-black text-sm">إشعارات البريد الإلكتروني</h4>
              <p className="text-xs text-muted-foreground font-bold mt-1">إرسال إشعارات بريدية للمستخدمين</p>
            </div>
            <Button
              variant={config.emailNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle("emailNotifications")}
              className="rounded-lg font-bold"
            >
              {config.emailNotifications ? "✓ مفعّل" : "معطّل"}
            </Button>
          </div>

          {/* Two Factor Auth */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
            <div>
              <h4 className="font-black text-sm">المصادقة الثنائية</h4>
              <p className="text-xs text-muted-foreground font-bold mt-1">تفعيل المصادقة الثنائية لحسابات المسؤولين</p>
            </div>
            <Button
              variant={config.twoFactorAuth ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle("twoFactorAuth")}
              className="rounded-lg font-bold"
            >
              {config.twoFactorAuth ? "✓ مفعّل" : "معطّل"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black">الإعدادات المتقدمة</CardTitle>
          <CardDescription className="text-xs font-bold">إعدادات تقنية متقدمة للنظام</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Max Upload Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black text-sm">حد أقصى لحجم الملف</label>
              <Badge variant="outline" className="rounded-lg font-bold">{config.maxUploadSize} MB</Badge>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={config.maxUploadSize}
                onChange={(e) => handleInputChange("maxUploadSize", parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={config.maxUploadSize}
                onChange={(e) => handleInputChange("maxUploadSize", parseInt(e.target.value))}
                className="w-16 px-3 py-2 border border-slate-200 rounded-lg font-bold text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground font-bold">الحد الأقصى المسموح به لحجم الملفات المرفوعة</p>
          </div>

          {/* Session Timeout */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black text-sm">مهلة انتهاء الجلسة</label>
              <Badge variant="outline" className="rounded-lg font-bold">{config.sessionTimeout} دقيقة</Badge>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="480"
                step="15"
                value={config.sessionTimeout}
                onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={config.sessionTimeout}
                onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                className="w-16 px-3 py-2 border border-slate-200 rounded-lg font-bold text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground font-bold">المدة الزمنية قبل انتهاء جلسة المستخدم تلقائياً</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex-1 rounded-xl font-black h-12 gap-2"
        >
          <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
          {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-xl font-black h-12"
        >
          إعادة تعيين
        </Button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <p className="text-xs font-bold text-blue-900">
          💡 تلميح: التغييرات على الإعدادات تُطبّق فوراً على جميع المستخدمين. تأكد من الضغط على "حفظ الإعدادات" قبل الخروج.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
