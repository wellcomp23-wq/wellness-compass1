import { useState, useRef, useEffect } from "react"
import Navigation from "@/components/layout/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Clock, MapPin, Phone, Mail, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PharmacyProfile() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [pharmacyData, setPharmacyData] = useState({
    name: "صيدلية الشفاء",
    license: "PH-12345",
    phone: "0501234567",
    email: "alshifa@pharmacy.sa",
    address: "شارع الملك فهد، الرياض",
    workingHours: "السبت - الخميس: 8:00 ص - 12:00 م",
    description: "صيدلية متخصصة في توفير الأدوية والمستلزمات الطبية",
    services: "صرف الأدوية، استشارات دوائية، أجهزة طبية"
  })

  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus()
    }
  }, [isEditing])

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم تحديث معلومات الصيدلية",
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
      <Navigation userRole="pharmacy" userName="صيدلية الشفاء" />
      
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">ملف الصيدلية</h1>
            <p className="text-muted-foreground">إدارة معلومات الصيدلية وبيانات التواصل</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "medical"}
            className="gap-2"
            tabIndex={0}
          >
            {isEditing ? "إلغاء" : "تعديل المعلومات"}
          </Button>
        </div>

        <form onSubmit={handleSave} className="grid gap-6">
          {/* معلومات أساسية */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>البيانات الرئيسية للصيدلية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الصيدلية</Label>
                  <Input
                    id="name"
                    ref={nameInputRef}
                    value={pharmacyData.name}
                    onChange={(e) => setPharmacyData({...pharmacyData, name: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                    tabIndex={0}
                  />
                </div>
                <div>
                  <Label htmlFor="license">رقم الترخيص</Label>
                  <Input
                    id="license"
                    value={pharmacyData.license}
                    onChange={(e) => setPharmacyData({...pharmacyData, license: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                    tabIndex={0}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="phone"
                    value={pharmacyData.phone}
                    onChange={(e) => setPharmacyData({...pharmacyData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                    tabIndex={0}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    value={pharmacyData.email}
                    onChange={(e) => setPharmacyData({...pharmacyData, email: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                    tabIndex={0}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  العنوان
                </Label>
                <Input
                  id="address"
                  value={pharmacyData.address}
                  onChange={(e) => setPharmacyData({...pharmacyData, address: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1"
                  tabIndex={0}
                />
              </div>

              <div>
                <Label htmlFor="workingHours" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  ساعات العمل
                </Label>
                <Input
                  id="workingHours"
                  value={pharmacyData.workingHours}
                  onChange={(e) => setPharmacyData({...pharmacyData, workingHours: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1"
                  tabIndex={0}
                />
              </div>
            </CardContent>
          </Card>

          {/* الخدمات والوصف */}
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>الخدمات والوصف</CardTitle>
              <CardDescription>معلومات تفصيلية عن خدمات الصيدلية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">نبذة عن الصيدلية</Label>
                <Textarea
                  id="description"
                  value={pharmacyData.description}
                  onChange={(e) => setPharmacyData({...pharmacyData, description: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 min-h-[100px]"
                  tabIndex={0}
                />
              </div>

              <div>
                <Label htmlFor="services">الخدمات المقدمة</Label>
                <Textarea
                  id="services"
                  value={pharmacyData.services}
                  onChange={(e) => setPharmacyData({...pharmacyData, services: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 min-h-[100px]"
                  tabIndex={0}
                />
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <Button type="submit" className="gap-2" tabIndex={0}>
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </Button>
          )}
        </form>
      </main>
    </div>
  )
}
