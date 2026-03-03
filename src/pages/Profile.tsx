import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Edit, 
  Save,
  Loader2,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Pill,
  Calendar as CalendarIcon,
  Activity,
  Heart,
  Settings,
  LogOut,
  UserCheck,
  Upload,
  Trash2,
  Users,
  Share2,
  Clock,
  AlertCircle,
  Check,
  X,
  Plus
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Format phone number to international format
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return ""
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "")
    // If already starts with country code (1-9), add +
    if (cleaned.length > 0 && !phone.startsWith("+")) {
      return "+" + cleaned
    }
    return phone
  }
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "MALE",
    blood_type: "",
    phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    height: "",
    weight: "",
    profile_image_url: ""
  })
  
  const [stats, setStats] = useState({ medications: 0, appointments: 0, adherence: 92 })
  const [chronicDiseases, setChronicDiseases] = useState<any[]>([])
  const [allDiseases, setAllDiseases] = useState<any[]>([])
  const [medicalSharing, setMedicalSharing] = useState<any[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: string; data?: any }>({ type: '' })
  
  useEffect(() => {
    fetchUserProfile()
    fetchAllDiseases()
  }, [])

  const fetchAllDiseases = async () => {
    const { data } = await supabase.from('chronic_diseases_list').select('*').order('name')
    if (data) setAllDiseases(data)
  }

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")
      setCurrentUser(user)

      const { data: patient, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', user.id)
        .maybeSingle()
      
      if (patient) {
        setProfile({
          ...patient,
          phone: patient.phone || user.phone || ""
        })
        fetchPatientDiseases(user.id)
      }

      // Fetch medications and appointments
      const [medsRes, apptsRes, adherenceRes] = await Promise.all([
        supabase.from('medication_adherence').select('*').eq('patient_id', user.id).eq('is_active', true),
        supabase.from('appointments').select('*').eq('patient_id', user.id).gte('appointment_date', new Date().toISOString()).order('appointment_date', { ascending: true }),
        supabase.from('medication_adherence').select('*').eq('patient_id', user.id)
      ])

      // Calculate adherence percentage
      let adherencePercentage = 92 // Default
      if (adherenceRes.data && adherenceRes.data.length > 0) {
        const totalMeds = adherenceRes.data.length
        const activeMeds = adherenceRes.data.filter(m => m.is_active).length
        adherencePercentage = totalMeds > 0 ? Math.round((activeMeds / totalMeds) * 100) : 92
      }

      setStats(prev => ({
        ...prev,
        medications: medsRes.data?.length || 0,
        appointments: apptsRes.data?.length || 0,
        adherence: adherencePercentage
      }))

      const { data: sharingData } = await supabase
        .from('medical_sharing')
        .select('*, doctors(first_name, last_name, specialization)')
        .eq('patient_id', user.id)
      
      if (sharingData) {
        setMedicalSharing(sharingData.map(s => ({
          sharing_id: s.sharing_id,
          doctor_name: `${s.doctors.first_name} ${s.doctors.last_name}`,
          specialization: s.doctors.specialization,
          is_active: new Date(s.expires_at) > new Date(),
          expiry_date: new Date(s.expires_at).toLocaleDateString('ar')
        })))
      }

    } catch (err) {
      console.error("Error fetching profile:", err)
      toast({ title: "خطأ", description: "فشل في تحميل بيانات الملف الشخصي", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatientDiseases = async (patientId: string) => {
    const { data } = await supabase
      .from('patient_chronic_diseases')
      .select('disease_id, chronic_diseases_list(name)')
      .eq('patient_id', patientId)
    if (data) {
      setChronicDiseases(data.map(d => ({ id: d.disease_id, name: d.chronic_diseases_list.name })))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const filePath = `${currentUser.id}/profile.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('medical-documents')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('patients')
        .update({ profile_image_url: publicUrl })
        .eq('patient_id', currentUser.id)

      if (updateError) throw updateError

      setProfile({ ...profile, profile_image_url: publicUrl })
      toast({ title: "تم التحديث", description: "تم تغيير الصورة الشخصية بنجاح" })
    } catch (error: any) {
      toast({ title: "خطأ في الرفع", description: error.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (!profile.first_name || !profile.last_name || !profile.date_of_birth || !profile.gender) {
        toast({ title: "تنبيه", description: "يرجى إكمال الحقول الإلزامية (الاسم، تاريخ الميلاد، الجنس)", variant: "destructive" })
        return
      }

      // Update phone in public.users table directly
      if (profile.phone && profile.phone !== currentUser.phone) {
        const formattedPhone = formatPhoneNumber(profile.phone)
        // Validate phone format
        const phoneRegex = /^\+[1-9]\d{1,14}$/
        if (!phoneRegex.test(formattedPhone)) {
          throw new Error("رقم الهاتف يجب أن يبدأ برمز الدولة (مثل +967) ويحتوي على 1-15 رقم")
        }
        const { error: phoneErr } = await supabase
          .from('users')
          .update({ phone_number: formattedPhone })
          .eq('user_id', currentUser.id)
        if (phoneErr) throw new Error(`فشل تحديث رقم الهاتف: ${phoneErr.message}`)
      }

      // Update patient data (without phone to avoid duplication)
      const patientData = { ...profile }
      delete patientData.phone // Remove phone from patient data to keep it only in users table
      
      const { error } = await supabase
        .from('patients')
        .upsert({
          ...patientData,
          patient_id: currentUser.id,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast({ title: "تم التحديث", description: "تم حفظ بيانات ملفك الشخصي بنجاح" })
      setIsEditing(false)
    } catch (err: any) {
      console.error("Error saving profile:", err)
      toast({ title: "خطأ في الحفظ", description: err.message || "حدث خطأ أثناء محاولة حفظ البيانات", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddDisease = async (diseaseId: string) => {
    if (chronicDiseases.find(d => d.id === parseInt(diseaseId))) return
    
    try {
      const { error } = await supabase
        .from('patient_chronic_diseases')
        .insert({ patient_id: currentUser.id, disease_id: parseInt(diseaseId) })
      
      if (error) throw error
      fetchPatientDiseases(currentUser.id)
      toast({ title: "تمت الإضافة", description: "تمت إضافة المرض المزمن بنجاح" })
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  const handleRemoveDisease = async (diseaseId: number) => {
    try {
      const { error } = await supabase
        .from('patient_chronic_diseases')
        .delete()
        .eq('patient_id', currentUser.id)
        .eq('disease_id', diseaseId)
      
      if (error) throw error
      fetchPatientDiseases(currentUser.id)
      toast({ title: "تم الحذف", description: "تم حذف المرض المزمن من قائمتك" })
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  const handleLogout = async () => {
    setConfirmAction({ type: 'logout' })
    setShowConfirmDialog(true)
  }

  const confirmLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="container max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <h1 className="text-xl font-black text-slate-800">الملف الشخصي</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? setShowConfirmDialog(true) : setIsEditing(true)}
              disabled={isSaving}
              className="rounded-xl font-black h-10 px-6 shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4 ml-2" /> : <Edit className="w-4 h-4 ml-2" />}
              {isEditing ? "حفظ التغييرات" : "تعديل الملف"}
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-6 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Identity Card */}
          <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg relative group overflow-hidden">
                {profile.profile_image_url ? (
                  <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-14 h-14 text-white" />
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                   {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-1">
                {profile.first_name ? `${profile.first_name} ${profile.last_name}` : "مستخدم جديد"}
              </h2>
              <p className="text-slate-400 font-bold text-sm mb-6 flex items-center justify-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {currentUser?.email}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-wider">مريض</Badge>
                {profile.blood_type && <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-none px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-wider">{profile.blood_type}</Badge>}
                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  نشط
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'أدوية نشطة', value: stats.medications, icon: Pill, color: 'bg-rose-50 text-rose-600' },
              { label: 'مواعيد قادمة', value: stats.appointments, icon: CalendarIcon, color: 'bg-blue-50 text-blue-600' },
              { label: 'نسبة الالتزام', value: `${stats.adherence}%`, icon: Activity, color: 'bg-emerald-50 text-emerald-600' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <Tabs defaultValue="personal" className="w-full mb-8">
            <TabsList className="w-full bg-white border border-slate-100 p-1.5 rounded-[2rem] mb-8 h-16 shadow-sm overflow-x-auto flex-nowrap">
              <TabsTrigger value="personal" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap px-4">البيانات الشخصية</TabsTrigger>
              <TabsTrigger value="medical" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap px-4">الأمراض المزمنة</TabsTrigger>
              <TabsTrigger value="emergency" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap px-4">الطوارئ</TabsTrigger>
              <TabsTrigger value="sharing" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all whitespace-nowrap px-4">المشاركة</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="personal" className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الاسم الأول *</label>
                      <Input disabled={!isEditing} value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الاسم الأخير *</label>
                      <Input disabled={!isEditing} value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">تاريخ الميلاد *</label>
                      <Input type="date" disabled={!isEditing} value={profile.date_of_birth} onChange={e => setProfile({...profile, date_of_birth: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الجنس *</label>
                      <Select disabled={!isEditing} value={profile.gender} onValueChange={v => setProfile({...profile, gender: v})}>
                        <SelectTrigger className="rounded-2xl border-slate-100 h-12 font-bold">
                          <SelectValue placeholder="اختر الجنس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">ذكر</SelectItem>
                          <SelectItem value="FEMALE">أنثى</SelectItem>
                          <SelectItem value="OTHER">غير ذلك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">رقم الهاتف</label>
                      <div className="relative">
                        <Input disabled={!isEditing} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" placeholder="+967XXXXXXXXX" />
                        {isEditing && <p className="text-[10px] text-slate-400 font-bold mt-1">يجب أن يبدأ برمز الدولة (مثل +967)</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">فصيلة الدم</label>
                      <Select disabled={!isEditing} value={profile.blood_type} onValueChange={v => setProfile({...profile, blood_type: v})}>
                        <SelectTrigger className="rounded-2xl border-slate-100 h-12 font-bold">
                          <SelectValue placeholder="اختر فصيلة الدم" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">العنوان</label>
                    <Input disabled={!isEditing} value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-800">الأمراض المزمنة</h3>
                    <div className="w-48">
                      <Select onValueChange={handleAddDisease}>
                        <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold">
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة مرض
                        </SelectTrigger>
                        <SelectContent>
                          {allDiseases.map(d => (
                            <SelectItem key={d.disease_id} value={d.disease_id.toString()}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {chronicDiseases.length > 0 ? (
                      chronicDiseases.map((disease) => (
                        <Badge key={disease.id} className="bg-orange-50 text-orange-600 border-none px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                          {disease.name}
                          <button onClick={() => handleRemoveDisease(disease.id)} className="hover:text-orange-800">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-center w-full text-slate-400 font-bold py-4">لا توجد أمراض مزمنة مسجلة</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الطول (سم)</label>
                      <Input type="number" disabled={!isEditing} value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 mr-2">الوزن (كجم)</label>
                      <Input type="number" disabled={!isEditing} value={profile.weight} onChange={e => setProfile({...profile, weight: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">اسم جهة الاتصال في حالات الطوارئ</label>
                    <Input disabled={!isEditing} value={profile.emergency_contact_name} onChange={e => setProfile({...profile, emergency_contact_name: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">رقم هاتف الطوارئ</label>
                    <Input disabled={!isEditing} value={profile.emergency_contact_phone} onChange={e => setProfile({...profile, emergency_contact_phone: e.target.value})} className="rounded-2xl border-slate-100 h-12 font-bold" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sharing" className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-800">مشاركة الملف الصحي</h3>
                    <Button onClick={() => navigate('/medical-file-sharing')} className="rounded-xl font-black h-10 px-6 bg-primary hover:bg-primary/90">
                      <Share2 className="w-4 h-4 ml-2" />
                      إدارة المشاركة
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {medicalSharing.length > 0 ? (
                      medicalSharing.map((share, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-black text-slate-800 text-sm">د. {share.doctor_name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{share.specialization}</p>
                              </div>
                            </div>
                            <Badge className={share.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'} variant="outline">
                              {share.is_active ? 'نشطة' : 'منتهية'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                            <Clock className="w-3 h-3" />
                            ينتهي في: {share.expiry_date}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 font-bold py-8">لم تقم بمشاركة ملفك مع أي طبيب حتى الآن</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          {/* Account Settings Section */}
          <div className="space-y-4">
             <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">
               <Settings className="w-5 h-5 text-primary" />
               إعدادات الحساب
             </h3>
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => navigate('/settings')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                         <Shield className="w-5 h-5 text-slate-500 group-hover:text-primary" />
                      </div>
                      <div className="text-right">
                         <p className="font-black text-slate-800 text-sm">الأمان والخصوصية</p>
                         <p className="text-[10px] font-bold text-slate-400">تغيير كلمة المرور، التحقق من الحساب</p>
                      </div>
                   </div>
                   <ArrowRight className="w-5 h-5 text-slate-300 rotate-180" />
                </button>
                <button onClick={handleLogout} className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-colors group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                         <LogOut className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="text-right">
                         <p className="font-black text-red-600 text-sm">تسجيل الخروج</p>
                         <p className="text-[10px] font-bold text-red-400/60">الخروج الآمن من الحساب</p>
                      </div>
                   </div>
                </button>
             </div>
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center mb-2">
              {confirmAction.type === 'logout' ? 'تسجيل الخروج' : 'تأكيد الحفظ'}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              {confirmAction.type === 'logout' 
                ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟' 
                : 'هل أنت متأكد من رغبتك في حفظ التغييرات الجديدة على ملفك الشخصي؟'}
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 h-12 rounded-2xl font-black"
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  setShowConfirmDialog(false)
                  confirmAction.type === 'logout' ? confirmLogout() : handleSave()
                }}
                className={`flex-1 h-12 rounded-2xl font-black ${confirmAction.type === 'logout' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                تأكيد
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
