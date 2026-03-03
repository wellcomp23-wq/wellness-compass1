import { useEffect, useRef, useState } from "react";
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
        toast({ title: "نوع ملف غير صحيح", description: "يرجى رفع صورة أو ملف PDF", variant: "destructive" });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "الملف كبير جداً", description: "حجم الملف يجب أن يكون أقل من 5MB", variant: "destructive" });
        return;
      }

      setProfessionalDocument(file);
      toast({ title: "تم رفع الملف", description: `تم اختيار ${file.name}` });
    }
  };

  const validateStep2 = (): boolean => {
    // Validate Step 2: Basic Data
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال الاسم الأول والأخير", variant: "destructive" });
      firstNameRef.current?.focus();
      return false;
    }

    if (!formData.phone.trim() || formData.phone.length < 7) {
      toast({ title: "خطأ", description: "يرجى إدخال رقم هاتف صحيح", variant: "destructive" });
      return false;
    }

    if (formData.role === AppRoles.PATIENT) {
      if (!formData.dateOfBirth) {
        toast({ title: "خطأ", description: "يرجى إدخال تاريخ الميلاد", variant: "destructive" });
        return false;
      }
    } else {
      // For providers, check if professional document is uploaded
      if (!professionalDocument) {
        toast({
          title: "وثيقة مطلوبة",
          description: "يرجى رفع وثيقة مزاولة المهنة لإكمال الطلب",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const validateStep3 = (): boolean => {
    // Validate Step 3: Account Completion
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
      emailRef.current?.focus();
      return false;
    }

    // التحقق من كلمة المرور فقط للمرضى (لأن مقدمي الخدمات سيتم توليد كلمة مرور لهم من قبل الأدمن)
    if (formData.role === AppRoles.PATIENT) {
      if (formData.password.length < 8) {
        toast({ title: "كلمة مرور ضعيفة", description: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل", variant: "destructive" });
        passwordRef.current?.focus();
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" });
        return false;
      }
    }

    if (!acceptedTerms) {
      toast({ title: "تنبيه", description: "يرجى الموافقة على الشروط والأحكام", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // ✅ PATIENT FLOW: Create account directly
      if (formData.role === AppRoles.PATIENT) {
        // Create user account in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const userId = authData.user.id;

          // Create user profile in database
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                user_id: userId,
                email: formData.email,
                phone_number: `+967${formData.phone}`,
                role: formData.role.toUpperCase(),
                account_status: 'ACTIVE',
              }
            ]);

          if (profileError) throw profileError;

          // Create patient record
          const { error: patientError } = await supabase.from('patients').insert([{
            patient_id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender: formData.gender,
            date_of_birth: formData.dateOfBirth,
          }]);

          if (patientError) throw patientError;

          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "مرحباً بك في بوصلة العافية. يرجى تسجيل الدخول.",
          });
          // Force navigation to login for patients
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }

      } else {
        // ✅ PROVIDER FLOW: Create application request (NOT account)
        let documentUrl = null;

        // Upload professional document if it exists
        if (professionalDocument) {
          const fileExt = professionalDocument.name.split('.').pop();
          const fileName = `${Date.now()}-${formData.email}.${fileExt}`;
          const filePath = `${formData.role.toLowerCase()}/${fileName}`;

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('provider-docs')
            .upload(filePath, professionalDocument);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }
          documentUrl = uploadData.path;
        }

        // Create application request in provider_applications table
        const { error: appError } = await supabase
          .from('provider_applications')
          .insert([
            {
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone: `+967${formData.phone}`,
              role_requested: formData.role.toUpperCase(),
              document_url: documentUrl,

              status: 'PENDING',
            }
          ]);

        if (appError) throw appError;

        toast({
          title: "تم تقديم طلبك بنجاح",
          description: "سيتم مراجعة طلبك من قبل الإدارة. يرجى الانتظار.",
        });
        
        // Force navigation to login for providers
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
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
      } else if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        toast({ 
          title: "خطأ في الصلاحيات", 
          description: "يرجى التأكد من أن جميع البيانات صحيحة والمحاولة مرة أخرى", 
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
                  <h2 className="text-xl font-bold text-slate-800">الخطوة 1: اختر نوع الحساب</h2>
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
                      <div className={`p-3 rounded-xl ${role.bg}`}>
                        <role.icon className={`w-6 h-6 ${role.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{role.title}</p>
                        <p className="text-xs text-slate-500">{role.desc}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Basic Information */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setStep(1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">الخطوة 2: البيانات الأساسية</h2>
                    <p className="text-slate-500 text-sm">أخبرنا عن نفسك</p>
                  </div>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">الاسم الأول</Label>
                      <Input
                        id="firstName"
                        ref={firstNameRef}
                        placeholder="محمد"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, () => validateStep2() && setStep(3))}
                        className="mt-2 h-11 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">الاسم الأخير</Label>
                      <Input
                        id="lastName"
                        placeholder="أحمد"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, () => validateStep2() && setStep(3))}
                        className="mt-2 h-11 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-500 font-medium">+967</span>
                      <Input
                        id="phone"
                        placeholder="712345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        onKeyDown={(e) => handleKeyDown(e, () => validateStep2() && setStep(3))}
                        className="flex-1 h-11 rounded-lg"
                      />
                    </div>
                  </div>

                  {formData.role === AppRoles.PATIENT && (
                    <>
                      <div>
                        <Label htmlFor="gender">النوع</Label>
                        <select
                          id="gender"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full mt-2 h-11 rounded-lg border border-slate-300 px-3 bg-white"
                        >
                          <option value="MALE">ذكر</option>
                          <option value="FEMALE">أنثى</option>
                          <option value="OTHER">آخر</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="mt-2 h-11 rounded-lg"
                        />
                      </div>
                    </>
                  )}

                  {formData.role !== AppRoles.PATIENT && (
                    <div>
                      <Label>وثيقة مزاولة المهنة</Label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full mt-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {professionalDocument ? professionalDocument.name : "اختر ملفاً"}
                        </span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => validateStep2() && setStep(3)}
                    className="w-full h-11 rounded-lg font-bold bg-primary hover:bg-primary/90"
                  >
                    التالي
                  </Button>
                </form>
              </div>
            )}

            {/* Step 3: Account Completion */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setStep(2)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">الخطوة 3: إكمال بيانات الحساب</h2>
                    <p className="text-slate-500 text-sm">أنشئ حسابك الآمن</p>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      ref={emailRef}
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="mt-2 h-11 rounded-lg"
                    />
                  </div>

                  {formData.role === AppRoles.PATIENT && (
                    <>
                      <div>
                        <Label htmlFor="password">كلمة المرور</Label>
                        <div className="relative mt-2">
                          <Input
                            id="password"
                            ref={passwordRef}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onKeyDown={handleKeyDown}
                            className="h-11 rounded-lg pr-10"
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

                      <div>
                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          onKeyDown={handleKeyDown}
                          className="mt-2 h-11 rounded-lg"
                        />
                      </div>
                    </>
                  )}

                  {formData.role !== AppRoles.PATIENT && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-700">
                        <span className="font-bold text-blue-600">ملاحظة:</span> بعد تقديم طلب الانضمام، سيقوم الأدمن بمراجعة بيانات طلبك وإنشاء بيانات دخول آمنة لك (اسم مستخدم وكلمة مرور).
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-700 cursor-pointer">
                      أوافق على{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary font-bold hover:underline"
                      >
                        الشروط والأحكام
                      </button>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-lg font-bold bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}
                  </Button>

                  <p className="text-center text-sm text-slate-600">
                    لديك حساب بالفعل؟{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                      تسجيل الدخول
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>الشروط والأحكام</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              بالموافقة على هذه الشروط والأحكام، فإنك توافق على استخدام منصة بوصلة العافية وفقاً للقوانين المعمول بها.
            </p>
            <p>
              نحن نلتزم بحماية خصوصيتك وبيانات صحتك. جميع البيانات تُشفر وتُحفظ بأمان تام.
            </p>
            <p>
              يجب عليك استخدام المنصة بطريقة قانونية وأخلاقية، وعدم محاولة الوصول إلى بيانات المستخدمين الآخرين.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTermsModal(false)} className="bg-primary">
              فهمت
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
