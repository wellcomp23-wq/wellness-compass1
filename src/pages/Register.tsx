import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Eye, 
  EyeOff, 
  Heart, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  ShieldCheck, 
  ChevronLeft,
  Stethoscope,
  Pill,
  FlaskConical,
  Building2,
  ArrowRight,
  Plus,
  ScrollText,
  FileText,
  X,
  Image,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AppRoles } from "@/lib/auth";

export default function Register() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [professionalDocument, setProfessionalDocument] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: AppRoles.PATIENT as string,
    gender: "MALE",
    dateOfBirth: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  // Refs for focus management
  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roleParam) {
      const upperRole = roleParam.toUpperCase();
      const validRoles = Object.values(AppRoles);
      if (validRoles.includes(upperRole as any)) {
        setFormData(prev => ({ ...prev, role: upperRole }));
        setStep(2);
      }
    }
  }, [roleParam]);

  // Auto-focus management
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => firstNameRef.current?.focus(), 100);
    } else if (step === 3) {
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [step]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "خطأ في نوع الملف",
          description: "الرجاء رفع ملفات من نوع JPG, PNG, أو PDF فقط.",
          variant: "destructive",
        });
        setProfessionalDocument(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "الملف كبير جداً",
          description: "الحد الأقصى لحجم الملف هو 5 ميجابايت.",
          variant: "destructive",
        });
        setProfessionalDocument(null);
        return;
      }

      setProfessionalDocument(file);
      toast({
        title: "تم إرفاق الملف",
        description: `تم اختيار ${file.name} بنجاح`,
      });
    }
  };

  const handleRemoveFile = () => {
    setProfessionalDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({ title: "تنبيه", description: "يرجى ملء جميع الحقول الإلزامية", variant: "destructive" });
      if (step === 3) emailRef.current?.focus();
      return;
    }

    const phoneRegex = /^(77|73|71|70)\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({ title: "خطأ في التنسيق", description: "يرجى إدخال رقم هاتف يمني صحيح (77XXXXXXX)", variant: "destructive" });
      return;
    }

    if (formData.password.length < 8) {
      toast({ title: "كلمة مرور ضعيفة", description: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل", variant: "destructive" });
      passwordRef.current?.focus();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" });
      return;
    }

    if (!acceptedTerms) {
      toast({ title: "تنبيه", description: "يرجى الموافقة على الشروط والأحكام", variant: "destructive" });
      return;
    }

    if (formData.role !== AppRoles.PATIENT && !professionalDocument) {
      toast({
        title: "وثيقة مطلوبة",
        description: "يرجى رفع وثيقة مزاولة المهنة لإكمال الطلب",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let documentPath = null;

      // Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const userId = authData.user.id;

        // Upload professional document if it exists (for providers)
        if (professionalDocument && formData.role !== AppRoles.PATIENT) {
          const fileExt = professionalDocument.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `${formData.role.toLowerCase()}/${fileName}`;

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('provider-docs')
            .upload(filePath, professionalDocument);

          if (uploadError) throw uploadError;
          documentPath = uploadData.path;
        }

        // Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              user_id: userId,
              email: formData.email,
              phone_number: `+967${formData.phone}`,
              role: formData.role.toLowerCase(),
            }
          ]);

        if (profileError) throw profileError;

        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            {
              user_id: userId,
              role: formData.role.toLowerCase(),
            }
          ]);

        if (roleError) throw roleError;

        // Create specific record based on role
        if (formData.role === AppRoles.PATIENT) {
          await supabase.from('patients').insert([{
            patient_id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender: formData.gender,
            date_of_birth: formData.dateOfBirth,
            phone: formData.phone
          }]);
        } else {
          // For providers, create an application record
          await supabase.from('provider_applications').insert([{
            user_id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            role_requested: formData.role.toLowerCase(),
            document_url: documentPath,
            status: 'pending'
          }]);
        }

        if (formData.role === AppRoles.PATIENT) {
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "مرحباً بك في بوصلة العافية. يرجى تسجيل الدخول.",
          });
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast({
            title: "تم إرسال طلب الانضمام",
            description: "طلبك قيد المراجعة من قبل الإدارة، سيتم تزويدك ببيانات الدخول فور الموافقة",
          });
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle rate limit error
      if (error.message?.includes('rate') || error.message?.includes('Rate')) {
        toast({ 
          title: "تم تجاوز الحد الأقصى للمحاولات", 
          description: "يرجى الانتظار 15-30 دقيقة قبل محاولة التسجيل مرة أخرى، أو استخدم بريداً إلكترونياً مختلفاً", 
          variant: "destructive" 
        });
      } else if (error.message?.includes('already')) {
        toast({ 
          title: "البريد الإلكتروني مسجل بالفعل", 
          description: "هذا البريد مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "خطأ في التسجيل", 
          description: error.message || "حدث خطأ أثناء إنشاء الحساب", 
          variant: "destructive" 
        });
      }
      setIsLoading(false);
    }
  };

  const roles = [
    { id: AppRoles.PATIENT, title: 'مريض', desc: 'أريد متابعة صحتي وحجز مواعيد', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { id: AppRoles.DOCTOR, title: 'طبيب', desc: 'أريد تقديم استشارات طبية', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: AppRoles.PHARMACIST, title: 'صيدلي', desc: 'إدارة الطلبات والوصفات الطبية', icon: Pill, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: AppRoles.LAB_MANAGER, title: 'مختبر', desc: 'رفع نتائج التحاليل الطبية', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: AppRoles.HOSPITAL_MANAGER, title: 'مستشفى', desc: 'إدارة المنشأة الصحية', icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, nextStep?: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextStep) nextStep();
      else if (step === 3) handleRegister(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8" dir="rtl">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">إنشاء حساب جديد</h1>
          <p className="text-slate-500 mt-2">انضم إلى مجتمع بوصلة العافية اليوم</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-10">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10 font-bold transition-all duration-300",
                  step >= i ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-100 text-slate-400"
                )}
              >
                {i}
              </div>
            ))}
          </div>

          <div className="mt-8">
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800">اختر نوع الحساب</h2>
                  <p className="text-slate-500 text-sm">كيف تخطط لاستخدام بوصلة العافية؟</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setFormData({ ...formData, role: role.id });
                        setStep(2);
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 text-right transition-all group",
                        formData.role === role.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-slate-100 hover:border-primary/30 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn("p-3 rounded-xl shrink-0", role.bg)}>
                        <role.icon className={cn("w-6 h-6", role.color)} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{role.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    لديك حساب بالفعل؟{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">تسجيل الدخول</Link>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setStep(1)}
                    className="rounded-full hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">المعلومات الأساسية</h2>
                    <p className="text-slate-500 text-sm">أخبرنا قليلاً عن نفسك</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">الاسم الأول</Label>
                    <Input
                      id="firstName"
                      ref={firstNameRef}
                      placeholder="أحمد"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, () => setStep(3))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">اسم العائلة</Label>
                    <Input
                      id="lastName"
                      placeholder="علي"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, () => setStep(3))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف (يمني)</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      placeholder="77XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, () => setStep(3))}
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الجنس</Label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: "MALE" })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          formData.gender === "MALE" ? "bg-white shadow-sm text-primary" : "text-slate-500"
                        )}
                      >
                        ذكر
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: "FEMALE" })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                          formData.gender === "FEMALE" ? "bg-white shadow-sm text-pink-500" : "text-slate-500"
                        )}
                      >
                        أنثى
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">تاريخ الميلاد</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, () => setStep(3))}
                        className="h-12 pr-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(3)} 
                  className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
                >
                  المتابعة
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                </Button>
              </div>
            )}

            {/* Step 3: Account Security & Documents */}
            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setStep(2)}
                    className="rounded-full hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">أمان الحساب</h2>
                    <p className="text-slate-500 text-sm">الخطوة الأخيرة لإكمال التسجيل</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      ref={emailRef}
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 pr-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="password"
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 pr-10 rounded-xl"
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-12 pr-10 rounded-xl"
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
                </div>

                {/* Provider Document Upload */}
                {formData.role !== AppRoles.PATIENT && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Label className="flex items-center gap-2 text-slate-700 font-bold">
                      <ScrollText className="w-5 h-5 text-primary" />
                      وثيقة مزاولة المهنة (مطلوب)
                    </Label>
                    <p className="text-xs text-slate-500">يرجى رفع نسخة واضحة من الترخيص أو الشهادة المهنية (PDF, JPG, PNG - بحد أقصى 5MB)</p>
                    
                    {!professionalDocument ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        tabIndex={0}
                        className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary mb-2" />
                        <span className="text-sm font-medium text-slate-600">اضغط لرفع الملف</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {professionalDocument.type === "application/pdf" ? (
                              <FileText className="w-5 h-5 text-primary" />
                            ) : (
                              <Image className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-700 truncate">{professionalDocument.name}</p>
                            <p className="text-xs text-slate-400">{(professionalDocument.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-slate-600">
                    أوافق على{" "}
                    <button 
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-primary font-bold hover:underline"
                    >
                      الشروط والأحكام
                    </button>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
                >
                  {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-md rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">الشروط والأحكام</DialogTitle>
            <DialogDescription className="text-slate-500">
              يرجى قراءة شروط استخدام منصة بوصلة العافية بعناية.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto py-4 text-sm text-slate-600 leading-relaxed">
            <p className="mb-4 font-bold">1. قبول الشروط</p>
            <p className="mb-4">باستخدامك لمنصة بوصلة العافية، فإنك توافق على الالتزام بكافة الشروط والأحكام المنصوص عليها هنا.</p>
            
            <p className="mb-4 font-bold">2. الخصوصية والبيانات</p>
            <p className="mb-4">نحن نلتزم بحماية بياناتك الصحية والشخصية وفقاً لأعلى معايير الأمان الرقمي.</p>
            
            <p className="mb-4 font-bold">3. المسؤولية الطبية</p>
            <p className="mb-4">المنصة هي وسيلة لتسهيل الرعاية الصحية وليست بديلاً عن الاستشارة الطبية المباشرة في الحالات الطارئة.</p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
              className="w-full rounded-xl font-bold"
            >
              أوافق على الشروط
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
