import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertCircle } from "lucide-react";

interface AddUserModalProps {
  onClose?: () => void;
  onUserAdded?: (user: any) => void;
}

const AddUserModal = ({ onClose, onUserAdded }: AddUserModalProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "مريض",
    specialty: "",
    licenseNumber: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("الاسم مطلوب");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("البريد الإلكتروني غير صحيح");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      setError("رقم الهاتف غير صحيح");
      return false;
    }
    if ((formData.role === "طبيب" || formData.role === "صيدلاني") && !formData.licenseNumber.trim()) {
      setError("رقم الترخيص مطلوب لمقدمي الخدمة");
      return false;
    }
    return true;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // إنشاء معرف فريد للمستخدم
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // إنشاء كائن المستخدم الجديد
      const newUser = {
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        specialty: formData.specialty || "-",
        licenseNumber: formData.licenseNumber || "-",
        isVerified: true,
        joinDate: new Date().toISOString().split('T')[0],
        status: "نشط",
        createdBy: "admin",
        createdAt: new Date().toISOString()
      };

      // حفظ المستخدم الجديد في localStorage
      const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      existingUsers.push(newUser);
      localStorage.setItem("adminUsers", JSON.stringify(existingUsers));

      // تحديث إحصائيات النظام
      const stats = JSON.parse(localStorage.getItem("adminStats") || '{"totalUsers": 0, "newUsers": 0}');
      stats.totalUsers = (stats.totalUsers || 0) + 1;
      stats.newUsers = (stats.newUsers || 0) + 1;
      localStorage.setItem("adminStats", JSON.stringify(stats));

      toast({
        title: "تم إضافة المستخدم بنجاح",
        description: `تم إنشاء حساب جديد للمستخدم ${formData.name}`,
      });

      // استدعاء callback إذا كان موجوداً
      if (onUserAdded) {
        onUserAdded(newUser);
      }

      // إعادة تعيين النموذج
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "مريض",
        specialty: "",
        licenseNumber: ""
      });

      // إغلاق النافذة بعد ثانيتين
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ أثناء إضافة المستخدم";
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
          <UserPlus className="w-5 h-5" /> إضافة مستخدم جديد
        </CardTitle>
        <CardDescription className="text-xs font-bold">أنشئ حساب مستخدم جديد في النظام</CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleAddUser} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-black">الاسم الكامل</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="أدخل الاسم الكامل"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-black">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-black">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="771234567"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold"
            />
          </div>

          {/* Role Field */}
          <div className="space-y-3">
            <Label htmlFor="role" className="text-sm font-black">الدور</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={isLoading}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="مريض">مريض</SelectItem>
                <SelectItem value="طبيب">طبيب</SelectItem>
                <SelectItem value="صيدلاني">صيدلاني</SelectItem>
                <SelectItem value="مختبر">مختبر</SelectItem>
                <SelectItem value="مستشفى">مستشفى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Field (for doctors) */}
          {(formData.role === "طبيب" || formData.role === "صيدلاني") && (
            <div className="space-y-3">
              <Label htmlFor="specialty" className="text-sm font-black">التخصص</Label>
              <Input
                id="specialty"
                name="specialty"
                type="text"
                placeholder="مثال: قلب وأوعية دموية"
                value={formData.specialty}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              />
            </div>
          )}

          {/* License Number Field (for providers) */}
          {(formData.role === "طبيب" || formData.role === "صيدلاني" || formData.role === "مختبر") && (
            <div className="space-y-3">
              <Label htmlFor="licenseNumber" className="text-sm font-black">رقم الترخيص</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="أدخل رقم الترخيص"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-12 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl font-black text-base"
            >
              {isLoading ? "جاري الإضافة..." : "إضافة المستخدم"}
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
      </CardContent>
    </Card>
  );
};

export default AddUserModal;
