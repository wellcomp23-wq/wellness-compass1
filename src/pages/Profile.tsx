import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Edit, 
  Save,
  Droplets,
  AlertCircle,
  Loader2,
  ArrowRight,
  Heart,
  Shield,
  FileText,
  LogOut
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const firstNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (isEditing) {
      firstNameRef.current?.focus()
    }
  }, [isEditing])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      
      // الحصول على المستخدم الحالي
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")

      setCurrentUser(user)

      // جلب البروفايل الأساسي لمعرفة الدور
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileErr) throw profileErr

      let roleData = null
      const role = profileData.role

      // جلب البيانات التفصيلية بناءً على الدور
      if (role === 'PATIENT') {
        const { data } = await supabase.from('patients').select('*').eq('patient_id', user.id).single()
        roleData = data
      } else if (role === 'DOCTOR') {
        const { data } = await supabase.from('doctors').select('*').eq('doctor_id', user.id).single()
        roleData = data
      } else if (role === 'PHARMACIST') {
        const { data } = await supabase.from('pharmacies').select('*').eq('pharmacy_id', user.id).single()
        roleData = data
      } else if (role === 'LAB_MANAGER') {
        const { data } = await supabase.from('laboratories').select('*').eq('lab_id', user.id).single()
        roleData = data
      } else if (role === 'HOSPITAL_MANAGER') {
        const { data } = await supabase.from('hospitals').select('*').eq('hospital_id', user.id).single()
        roleData = data
      }

      if (roleData) {
        setProfile({ ...roleData, role })
      } else {
        setProfile({
          id: user.id,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          role: role
        })
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الملف الشخصي",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setIsSaving(true)

      // التحقق من البيانات
      if (!profile.first_name || !profile.last_name) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال الاسم الأول والأخير",
          variant: "destructive"
        })
        firstNameRef.current?.focus()
        return
      }

      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth)
        const today = new Date()
        if (birthDate > today) {
          toast({
            title: "خطأ",
            description: "تاريخ الميلاد لا يمكن أن يكون في المستقبل",
            variant: "destructive"
          })
          return
        }
      }

      if (profile.emergency_contact_phone) {
        const phoneRegex = /^(77|73|71|70)\d{7}$/
        if (!phoneRegex.test(profile.emergency_contact_phone)) {
          toast({
            title: "خطأ",
            description: "يرجى إدخال رقم هاتف يمني صحيح",
            variant: "destructive"
          })
          return
        }
      }

      // حفظ البيانات بناءً على الدور
      let tableName = 'patients'
      let idField = 'patient_id'

      if (profile.role === 'DOCTOR') { tableName = 'doctors'; idField = 'doctor_id' }
      else if (profile.role === 'PHARMACIST') { tableName = 'pharmacies'; idField = 'pharmacy_id' }
      else if (profile.role === 'LAB_MANAGER') { tableName = 'laboratories'; idField = 'lab_id' }
      else if (profile.role === 'HOSPITAL_MANAGER') { tableName = 'hospitals'; idField = 'hospital_id' }

      const { error } = await supabase
        .from(tableName)
        .upsert({
          ...profile,
          [idField]: currentUser.id
        })

      if (error) throw error

      toast({
        title: "نجاح",
        description: "تم حفظ البيانات بنجاح"
      })
      setIsEditing(false)
    } catch (err) {
      console.error("Error saving profile:", err)
      toast({
        title: "خطأ",
        description: "فشل في حفظ البيانات",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      console.error("Error logging out:", err)
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الخروج",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
              tabIndex={0}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
              tabIndex={0}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-red-600 font-medium">فشل في تحميل البيانات</p>
              <Button onClick={fetchUserProfile} variant="outline" tabIndex={0}>
                إعادة محاولة
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
              tabIndex={0}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
          </div>
          <Button 
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="rounded-lg"
            tabIndex={0}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </>
            )}
          </Button>
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

        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-primary/5" role="tablist">
              <TabsTrigger value="personal" tabIndex={0} role="tab">البيانات الشخصية</TabsTrigger>
              <TabsTrigger value="medical" tabIndex={0} role="tab">البيانات الطبية</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="text-xs font-bold text-muted-foreground mb-2 block">الاسم الأول</label>
                    <Input
                      id="firstName"
                      ref={firstNameRef}
                      placeholder="الاسم الأول"
                      value={profile.first_name || ""}
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      disabled={!isEditing}
                      className="rounded-lg"
                      tabIndex={0}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-xs font-bold text-muted-foreground mb-2 block">الاسم الأخير</label>
                    <Input
                      id="lastName"
                      placeholder="الاسم الأخير"
                      value={profile.last_name || ""}
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      disabled={!isEditing}
                      className="rounded-lg"
                      tabIndex={0}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dob" className="text-xs font-bold text-muted-foreground mb-2 block">تاريخ الميلاد</label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.date_of_birth || ""}
                    onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                    tabIndex={0}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">النوع</label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile({...profile, gender: value})} disabled={!isEditing}>
                    <SelectTrigger className="rounded-lg" tabIndex={0}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">ذكر</SelectItem>
                      <SelectItem value="FEMALE">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="address" className="text-xs font-bold text-muted-foreground mb-2 block">العنوان</label>
                  <Input
                    id="address"
                    placeholder="العنوان"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                    tabIndex={0}
                  />
                </div>
                {isEditing && <button type="submit" className="hidden" />}
              </form>
            </TabsContent>

            {/* Medical Info Tab */}
            <TabsContent value="medical" className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">فصيلة الدم</label>
                  <Select value={profile.blood_type} onValueChange={(value) => setProfile({...profile, blood_type: value})} disabled={!isEditing}>
                    <SelectTrigger className="rounded-lg" tabIndex={0}>
                      <SelectValue placeholder="اختر فصيلة الدم" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    جهة اتصال للطوارئ
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="emergencyName" className="text-[10px] font-bold text-red-600 mb-1 block">الاسم</label>
                      <Input
                        id="emergencyName"
                        placeholder="اسم جهة الاتصال"
                        value={profile.emergency_contact_name || ""}
                        onChange={(e) => setProfile({...profile, emergency_contact_name: e.target.value})}
                        disabled={!isEditing}
                        className="rounded-lg border-red-100 focus:border-red-300"
                        tabIndex={0}
                      />
                    </div>
                    <div>
                      <label htmlFor="emergencyPhone" className="text-[10px] font-bold text-red-600 mb-1 block">رقم الهاتف</label>
                      <Input
                        id="emergencyPhone"
                        placeholder="77XXXXXXX"
                        value={profile.emergency_contact_phone || ""}
                        onChange={(e) => setProfile({...profile, emergency_contact_phone: e.target.value})}
                        disabled={!isEditing}
                        className="rounded-lg border-red-100 focus:border-red-300"
                        tabIndex={0}
                      />
                    </div>
                  </div>
                </div>
                {isEditing && <button type="submit" className="hidden" />}
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          className="w-full rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
          onClick={handleLogout}
          tabIndex={0}
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
