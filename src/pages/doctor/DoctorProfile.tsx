import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Award, 
  Edit, 
  Save,
  Loader2,
  AlertCircle,
  ArrowRight,
  Mail,
  MapPin,
  Stethoscope,
  Upload,
  Camera
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export default function DoctorProfile() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [doctor, setDoctor] = useState<any>(null)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const firstNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDoctorProfile()
  }, [])

  useEffect(() => {
    if (isEditing) {
      firstNameRef.current?.focus()
    }
  }, [isEditing])

  const fetchDoctorProfile = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")

      setCurrentUser(user)

      const { data: doctorData, error: doctorErr } = await supabase
        .from('doctors')
        .select('*')
        .eq('doctor_id', user.id)
        .single()

      if (doctorErr && doctorErr.code !== 'PGRST116') throw doctorErr

      if (doctorData) {
        setDoctor(doctorData)
        if (doctorData.profile_picture_url) {
          setPreviewUrl(doctorData.profile_picture_url)
        }
      } else {
        setDoctor({
          doctor_id: user.id,
          first_name: "",
          last_name: "",
          specialization: "",
          license_number: "",
          years_of_experience: 0,
          qualification: "",
          bio: "",
          hospital_id: null,
          average_rating: 0
        })
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      toast({
        title: "خطأ",
        description: "فشل في تحميل الملف الشخصي",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setIsSaving(true)

      if (!doctor.first_name || !doctor.last_name) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال الاسم الأول والأخير",
          variant: "destructive"
        })
        firstNameRef.current?.focus()
        return
      }

      let pictureUrl = doctor.profile_picture_url

      // تحميل الصورة إذا تم اختيار صورة جديدة
      if (profilePicture) {
        const fileName = `doctor-${currentUser.id}-${Date.now()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(fileName, profilePicture, { upsert: true })

        if (uploadError) throw uploadError
        pictureUrl = uploadData?.path || null
      }

      const { error } = await supabase
        .from('doctors')
        .upsert({
          ...doctor,
          doctor_id: currentUser.id,
          profile_picture_url: pictureUrl
        })

      if (error) throw error

      toast({
        title: "نجاح",
        description: "تم حفظ البيانات بنجاح"
      })
      setIsEditing(false)
      setProfilePicture(null)
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
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
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

  if (!doctor) {
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
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-red-600 font-medium">فشل في تحميل البيانات</p>
              <Button onClick={fetchDoctorProfile} variant="outline" tabIndex={0}>
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
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
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
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                د. {doctor.first_name} {doctor.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
            </div>
          </div>

          {/* Profile Picture */}
          {isEditing && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <label className="text-xs font-bold text-blue-900 mb-3 block">صورة الملف التعريفي</label>
              <div className="flex flex-col items-center gap-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    tabIndex={0}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                    <Upload className="w-4 h-4" />
                    تحميل صورة
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-primary/5" role="tablist">
              <TabsTrigger value="personal" tabIndex={0} role="tab">البيانات الشخصية</TabsTrigger>
              <TabsTrigger value="professional" tabIndex={0} role="tab">البيانات المهنية</TabsTrigger>
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
                      value={doctor.first_name || ""}
                      onChange={(e) => setDoctor({...doctor, first_name: e.target.value})}
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
                      value={doctor.last_name || ""}
                      onChange={(e) => setDoctor({...doctor, last_name: e.target.value})}
                      disabled={!isEditing}
                      className="rounded-lg"
                      tabIndex={0}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="specialization" className="text-xs font-bold text-muted-foreground mb-2 block">التخصص</label>
                  <Input
                    id="specialization"
                    placeholder="التخصص"
                    value={doctor.specialization || ""}
                    onChange={(e) => setDoctor({...doctor, specialization: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                    tabIndex={0}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="text-xs font-bold text-muted-foreground mb-2 block">السيرة الذاتية</label>
                  <Textarea
                    id="bio"
                    placeholder="السيرة الذاتية"
                    value={doctor.bio || ""}
                    onChange={(e) => setDoctor({...doctor, bio: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg min-h-20"
                    tabIndex={0}
                  />
                </div>
                {isEditing && <button type="submit" className="hidden" />}
              </form>
            </TabsContent>

            {/* Professional Info Tab */}
            <TabsContent value="professional" className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="license" className="text-xs font-bold text-muted-foreground mb-2 block">رقم الترخيص</label>
                  <Input
                    id="license"
                    placeholder="رقم الترخيص"
                    value={doctor.license_number || ""}
                    onChange={(e) => setDoctor({...doctor, license_number: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg"
                    tabIndex={0}
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="text-xs font-bold text-muted-foreground mb-2 block">سنوات الخبرة</label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="سنوات الخبرة"
                    value={doctor.years_of_experience || 0}
                    onChange={(e) => setDoctor({...doctor, years_of_experience: parseInt(e.target.value)})}
                    disabled={!isEditing}
                    className="rounded-lg"
                    tabIndex={0}
                  />
                </div>

                <div>
                  <label htmlFor="qualification" className="text-xs font-bold text-muted-foreground mb-2 block">المؤهلات</label>
                  <Textarea
                    id="qualification"
                    placeholder="المؤهلات والشهادات"
                    value={doctor.qualification || ""}
                    onChange={(e) => setDoctor({...doctor, qualification: e.target.value})}
                    disabled={!isEditing}
                    className="rounded-lg min-h-20"
                    tabIndex={0}
                  />
                </div>

                {doctor.average_rating && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-700">
                      <Award className="w-4 h-4 inline ml-2" />
                      التقييم: {doctor.average_rating.toFixed(1)} / 5
                    </p>
                  </div>
                )}
                {isEditing && <button type="submit" className="hidden" />}
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
