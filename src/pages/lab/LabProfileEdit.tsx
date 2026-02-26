import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export default function LabProfileEdit() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    labName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    address: "",
    city: "",
    workingHours: "",
    bio: "",
    tests: "",
  })

  useEffect(() => {
    fetchLabProfile()
  }, [])

  const fetchLabProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { data, error } = await supabase
        .from("laboratories")
        .select("*")
        .eq("lab_id", user.id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          labName: data.lab_name || "",
          email: data.email || "",
          phone: data.phone || "",
          licenseNumber: data.license_number || "",
          address: data.address || "",
          city: data.city || "",
          workingHours: data.working_hours || "",
          bio: data.bio || "",
          tests: data.tests || "",
        })
        if (data.profile_image_url) {
          setProfileImageUrl(data.profile_image_url)
        }
      }
    } catch (error: any) {
      console.error("Error fetching lab profile:", error)
      toast({ title: "خطأ", description: "فشل في تحميل البيانات", variant: "destructive" })
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "خطأ", description: "حجم الصورة يجب أن يكون أقل من 5 MB", variant: "destructive" })
        return
      }

      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      let imageUrl = profileImageUrl

      // Upload image if changed
      if (profileImage) {
        const fileExt = profileImage.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `lab-profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("medical-documents")
          .upload(filePath, profileImage, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("medical-documents")
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Update lab profile
      const { error } = await supabase
        .from("laboratories")
        .update({
          lab_name: formData.labName,
          email: formData.email,
          phone: formData.phone,
          license_number: formData.licenseNumber,
          address: formData.address,
          city: formData.city,
          working_hours: formData.workingHours,
          bio: formData.bio,
          tests: formData.tests,
          profile_image_url: imageUrl,
        })
        .eq("lab_id", user.id)

      if (error) throw error

      toast({ title: "نجاح", description: "تم تحديث الملف التعريفي بنجاح" })
      setTimeout(() => navigate("/lab-dashboard"), 1500)
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({ title: "خطأ", description: error.message || "فشل في حفظ البيانات", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/lab-dashboard")}
            className="rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">تعديل الملف التعريفي</h1>
            <p className="text-sm text-muted-foreground">حدّث معلومات مختبرك</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Image */}
          <Card className="rounded-2xl border-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                صورة الملف التعريفي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileImagePreview || profileImageUrl ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={profileImagePreview || profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setProfileImage(null)
                      setProfileImagePreview("")
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 ml-2" />
                      اختر صورة
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Lab Information */}
          <Card className="rounded-2xl border-primary/5">
            <CardHeader>
              <CardTitle>معلومات المختبر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="labName">اسم المختبر</Label>
                <Input
                  id="labName"
                  name="labName"
                  value={formData.labName}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المختبر"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="licenseNumber">رقم الترخيص</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم الترخيص"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="أدخل العنوان"
                  />
                </div>
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="أدخل المدينة"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="workingHours">ساعات العمل</Label>
                <Input
                  id="workingHours"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  placeholder="مثال: 8 صباحاً - 10 مساءً"
                />
              </div>

              <div>
                <Label htmlFor="tests">الفحوصات المتاحة</Label>
                <Input
                  id="tests"
                  name="tests"
                  value={formData.tests}
                  onChange={handleInputChange}
                  placeholder="أدخل الفحوصات (مفصولة بفواصل)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="rounded-2xl border-primary/5">
            <CardHeader>
              <CardTitle>نبذة عن المختبر</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="اكتب نبذة عن مختبرك وخدماتك"
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/lab-dashboard")}
              disabled={isLoading}
              className="flex-1 rounded-lg"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
