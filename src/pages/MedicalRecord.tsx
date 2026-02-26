import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Heart,
  Droplet,
  Activity,
  Calendar,
  User,
  Phone,
  MapPin
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/integrations/supabase/client"

interface PatientDocument {
  document_id: string
  patient_id: string
  document_type: string
  file_url: string
  uploaded_at: string
  extracted_text?: string
}

interface PatientProfile {
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  blood_type: string
  phone: string
  address: string
  emergency_contact?: string
  allergies?: string
  chronic_diseases?: string
}

export default function MedicalRecordPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [documents, setDocuments] = useState<PatientDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMedicalRecord()
  }, [])

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      // جلب بيانات المريض
      const { data: patientData, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (patientErr && patientErr.code !== 'PGRST116') throw patientErr
      if (patientData) setProfile(patientData)

      // جلب الملفات الطبية
      if (patientData) {
        const { data: docsData, error: docsErr } = await supabase
          .from('patient_documents')
          .select('*')
          .eq('patient_id', patientData.patient_id)
          .order('uploaded_at', { ascending: false })

        if (docsErr) throw docsErr
        setDocuments(docsData || [])
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching medical record:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب الملف الصحي")
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      // رفع الملف إلى Storage
      const fileName = `${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage
        .from('patient_documents')
        .upload(`${user.id}/${fileName}`, file)

      if (uploadErr) throw uploadErr

      // الحصول على رابط الملف
      const { data: { publicUrl } } = supabase.storage
        .from('patient_documents')
        .getPublicUrl(`${user.id}/${fileName}`)

      // حفظ بيانات الملف في قاعدة البيانات
      const { data: patientData } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('user_id', user.id)
        .single()

      if (!patientData) throw new Error("لم يتم العثور على بيانات المريض")

      const { error: dbErr } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: patientData.patient_id,
          document_type: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
          file_url: publicUrl
        })

      if (dbErr) throw dbErr

      toast({
        title: "نجاح",
        description: "تم رفع الملف بنجاح"
      })

      await fetchMedicalRecord()
    } catch (err) {
      console.error("Error uploading document:", err)
      toast({
        title: "خطأ",
        description: "فشل في رفع الملف",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('patient_documents')
        .delete()
        .eq('document_id', documentId)

      if (error) throw error

      setDocuments(docs => docs.filter(d => d.document_id !== documentId))

      toast({
        title: "نجاح",
        description: "تم حذف الملف بنجاح"
      })
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الملف",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold">الملف الصحي</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل الملف الصحي...</p>
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
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">الملف الصحي</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-primary/5 rounded-xl p-1">
            <TabsTrigger value="profile" className="rounded-lg">البيانات الشخصية</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-lg">الملفات الطبية</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {profile ? (
              <div className="space-y-4">
                {/* Personal Info Card */}
                <div className="bg-white rounded-2xl border border-primary/5 p-6">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    البيانات الشخصية
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الاسم الأول</p>
                      <p className="font-bold text-sm">{profile.first_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الاسم الأخير</p>
                      <p className="font-bold text-sm">{profile.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">تاريخ الميلاد</p>
                      <p className="font-bold text-sm">
                        {new Date(profile.date_of_birth).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الجنس</p>
                      <p className="font-bold text-sm">
                        {profile.gender === 'MALE' ? 'ذكر' : 'أنثى'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Health Info Card */}
                <div className="bg-white rounded-2xl border border-primary/5 p-6">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    المعلومات الصحية
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">فصيلة الدم</p>
                      <p className="font-bold text-sm text-red-700">{profile.blood_type}</p>
                    </div>
                    {profile.allergies && (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">الحساسيات</p>
                        <p className="font-bold text-xs text-amber-700">{profile.allergies}</p>
                      </div>
                    )}
                    {profile.chronic_diseases && (
                      <div className="p-3 bg-orange-50 rounded-lg col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">الأمراض المزمنة</p>
                        <p className="font-bold text-xs text-orange-700">{profile.chronic_diseases}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-white rounded-2xl border border-primary/5 p-6">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    معلومات الاتصال
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">رقم الهاتف</p>
                      <p className="font-bold text-sm">{profile.phone}</p>
                    </div>
                    {profile.address && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">العنوان</p>
                        <p className="font-bold text-sm">{profile.address}</p>
                      </div>
                    )}
                    {profile.emergency_contact && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">جهة الاتصال في الطوارئ</p>
                        <p className="font-bold text-xs text-blue-700">{profile.emergency_contact}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">لم يتم العثور على بيانات المريض</p>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl border border-dashed border-primary/20 p-8 text-center hover:border-primary/40 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUploadDocument}
                disabled={uploading}
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">اسحب الملفات هنا أو انقر للاختيار</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (حد أقصى 10MB)</p>
                </div>
                {uploading && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">جاري الرفع...</span>
                  </div>
                )}
              </label>
            </div>

            {/* Documents List */}
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div 
                    key={doc.document_id}
                    className="bg-white rounded-2xl border border-primary/5 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <h4 className="font-bold text-sm">{doc.document_type}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.uploaded_at).toLocaleDateString('ar')}
                            </p>
                          </div>
                        </div>
                        {doc.extracted_text && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                            {doc.extracted_text}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl" className="rounded-2xl">
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel className="rounded-lg">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteDocument(doc.document_id)}
                                className="bg-red-600 hover:bg-red-700 rounded-lg"
                              >
                                حذف
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">لا توجد ملفات طبية</p>
                <p className="text-xs text-muted-foreground">ابدأ برفع ملفاتك الطبية الآن</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
