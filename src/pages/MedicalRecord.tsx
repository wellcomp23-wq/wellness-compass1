import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  MapPin,
  Edit2,
  Plus,
  GripVertical,
  Share2,
  FileDown,
  X,
  Check,
  SortAsc,
  Filter,
  Image as ImageIcon,
  File as FileIcon,
  Clock
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"

interface PatientDocument {
  document_id: string
  patient_id: string
  document_type: string
  file_url: string
  uploaded_at: string
  extracted_text?: string
  title?: string
  description?: string
}

interface PatientProfile {
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  blood_type: string | null
  phone: string
  address: string | null
  emergency_contact_name?: string
  emergency_contact_phone?: string
  height?: number
  weight?: number
}

interface VitalSign {
  vital_id: string
  recorded_at: string
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  weight?: number
  height?: number
  notes?: string
}

interface ChronicDisease {
  id: number
  name: string
}

type SortOption = "newest" | "oldest" | "name"
type FilterOption = "all" | "LAB_RESULT" | "PRESCRIPTION" | "MEDICAL_REPORT" | "X_RAY" | "OTHER"

export default function MedicalRecordPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [documents, setDocuments] = useState<PatientDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<PatientDocument[]>([])
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([])
  const [chronicDiseases, setChronicDiseases] = useState<ChronicDisease[]>([])
  const [allDiseases, setAllDiseases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showAddVitals, setShowAddVitals] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Document management states
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [vitalFormData, setVitalFormData] = useState({
    blood_pressure: "",
    heart_rate: "",
    temperature: "",
    weight: "",
    height: "",
    notes: ""
  })

  useEffect(() => {
    fetchMedicalRecord()
    fetchAllDiseases()
  }, [])

  // Apply sorting and filtering
  useEffect(() => {
    let result = [...documents]

    // Filter by type
    if (filterBy !== "all") {
      result = result.filter(doc => doc.document_type === filterBy)
    }

    // Search by title or description
    if (searchQuery) {
      result = result.filter(doc =>
        (doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    }

    setFilteredDocuments(result)
  }, [documents, sortBy, filterBy, searchQuery])

  const fetchAllDiseases = async () => {
    const { data } = await supabase.from('chronic_diseases_list').select('*').order('name')
    if (data) setAllDiseases(data)
  }

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { data: patientData, error: patientErr } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', user.id)
        .single()

      if (patientErr && patientErr.code !== 'PGRST116') throw patientErr
      if (patientData) setProfile(patientData)

      if (patientData) {
        const [docsRes, vitalsRes, diseasesRes] = await Promise.all([
          supabase.from('patient_documents').select('*').eq('patient_id', user.id).order('uploaded_at', { ascending: false }),
          supabase.from('vitals').select('*').eq('patient_id', user.id).order('recorded_at', { ascending: false }),
          supabase.from('patient_chronic_diseases').select('disease_id, chronic_diseases_list(name)').eq('patient_id', user.id)
        ])

        if (docsRes.data) setDocuments(docsRes.data)
        if (vitalsRes.data) setVitalSigns(vitalsRes.data)
        if (diseasesRes.data) {
          setChronicDiseases(diseasesRes.data.map(d => ({ id: d.disease_id, name: d.chronic_diseases_list.name })))
        }
      }

    } catch (err) {
      console.error("Error fetching medical record:", err)
      setError(err instanceof Error ? err.message : "فشل في جلب الملف الصحي")
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'LAB_RESULT': 'تحليل مخبري',
      'PRESCRIPTION': 'وصفة طبية',
      'MEDICAL_REPORT': 'تقرير طبي',
      'X_RAY': 'أشعة',
      'OTHER': 'أخرى'
    }
    return typeMap[type] || type
  }

  const getDocumentTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'LAB_RESULT': 'bg-blue-50 text-blue-600',
      'PRESCRIPTION': 'bg-green-50 text-green-600',
      'MEDICAL_REPORT': 'bg-purple-50 text-purple-600',
      'X_RAY': 'bg-orange-50 text-orange-600',
      'OTHER': 'bg-slate-50 text-slate-600'
    }
    return colorMap[type] || 'bg-slate-50 text-slate-600'
  }

  const getDocumentIcon = (type: string) => {
    switch(type) {
      case 'X_RAY':
        return <ImageIcon className="w-5 h-5" />
      default:
        return <FileIcon className="w-5 h-5" />
    }
  }

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const fileName = `${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage
        .from('medical-documents')
        .upload(`${user.id}/${fileName}`, file)

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('medical-documents')
        .getPublicUrl(`${user.id}/${fileName}`)

      // Determine document type
      let documentType = 'OTHER'
      if (file.type.includes('pdf')) documentType = 'MEDICAL_REPORT'
      else if (file.type.includes('image')) documentType = 'X_RAY'

      const { error: dbErr } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: user.id,
          document_type: documentType,
          file_url: publicUrl,
          title: file.name.split('.')[0],
          description: `تم رفعه في ${new Date().toLocaleDateString('ar')}`
        })

      if (dbErr) throw dbErr
      toast({ title: "نجاح", description: "تم رفع الملف بنجاح" })
      await fetchMedicalRecord()
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase.from('patient_documents').delete().eq('document_id', documentId)
      if (error) throw error
      setDocuments(docs => docs.filter(d => d.document_id !== documentId))
      toast({ title: "نجاح", description: "تم حذف الملف بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف الملف", variant: "destructive" })
    }
  }

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase.from('vitals').insert({
        patient_id: user.id,
        blood_pressure: vitalFormData.blood_pressure || null,
        heart_rate: vitalFormData.heart_rate ? parseInt(vitalFormData.heart_rate) : null,
        temperature: vitalFormData.temperature ? parseFloat(vitalFormData.temperature) : null,
        weight: vitalFormData.weight ? parseFloat(vitalFormData.weight) : null,
        height: vitalFormData.height ? parseFloat(vitalFormData.height) : null,
        notes: vitalFormData.notes || null,
        recorded_at: new Date().toISOString()
      })

      if (error) throw error
      toast({ title: "نجاح", description: "تم إضافة البيانات الحيوية بنجاح" })
      setShowAddVitals(false)
      setVitalFormData({ blood_pressure: "", heart_rate: "", temperature: "", weight: "", height: "", notes: "" })
      fetchMedicalRecord()
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddDisease = async (diseaseId: string) => {
    if (chronicDiseases.find(d => d.id === parseInt(diseaseId))) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase.from('patient_chronic_diseases').insert({
        patient_id: user.id,
        disease_id: parseInt(diseaseId)
      })

      if (error) throw error
      fetchMedicalRecord()
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  const handleRemoveDisease = async (diseaseId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const { error } = await supabase.from('patient_chronic_diseases').delete()
        .eq('patient_id', user.id)
        .eq('disease_id', diseaseId)

      if (error) throw error
      setChronicDiseases(diseases => diseases.filter(d => d.id !== diseaseId))
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
        <div className="container max-w-4xl mx-auto">
          <Skeleton className="h-32 mb-8 rounded-[2.5rem]" />
          <Skeleton className="h-96 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/home')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">الملف الصحي</h1>
              <p className="text-xs text-slate-400 font-bold">{profile?.first_name} {profile?.last_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => fileInputRef.current?.click()} className="rounded-xl font-black h-10 px-6 bg-green-500 hover:bg-green-600">
              <Upload className="w-4 h-4 ml-2" />
              رفع وثيقة
            </Button>
            <Button onClick={() => navigate('/medical-file-sharing')} className="rounded-xl font-black h-10 px-6 bg-primary hover:bg-primary/90">
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-6 pt-8">
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="w-full bg-white border border-slate-100 p-1.5 rounded-[2rem] mb-8 h-16 shadow-sm overflow-x-auto flex-nowrap">
            <TabsTrigger value="profile" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-6 whitespace-nowrap">نظرة عامة</TabsTrigger>
            <TabsTrigger value="vitals" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-6 whitespace-nowrap">المؤشرات الحيوية</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-[1.5rem] font-black flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all px-6 whitespace-nowrap">الملفات الطبية</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                المعلومات الأساسية
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الاسم الكامل</p>
                  <p className="font-black text-slate-800">{profile?.first_name} {profile?.last_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الميلاد</p>
                  <p className="font-black text-slate-800">{profile?.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الجنس</p>
                  <p className="font-black text-slate-800">{profile?.gender === 'MALE' ? 'ذكر' : profile?.gender === 'FEMALE' ? 'أنثى' : 'غير ذلك'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">فصيلة الدم</p>
                  <Badge className="bg-rose-50 text-rose-600 border-none px-3 py-1 rounded-lg font-black">{profile?.blood_type || 'غير محدد'}</Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الطول</p>
                  <p className="font-black text-slate-800">{profile?.height ? `${profile.height} سم` : 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الوزن</p>
                  <p className="font-black text-slate-800">{profile?.weight ? `${profile.weight} كجم` : 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {/* Chronic Diseases Card */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  الأمراض المزمنة
                </h3>
                <div className="w-40">
                  <Select onValueChange={handleAddDisease}>
                    <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
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
                  chronicDiseases.map(disease => (
                    <Badge key={disease.id} className="bg-orange-50 text-orange-600 border-none px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                      {disease.name}
                      <button onClick={() => handleRemoveDisease(disease.id)} className="hover:text-orange-800">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-400 font-bold py-2">لا توجد أمراض مزمنة مسجلة</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800">سجل المؤشرات الحيوية</h3>
                <Button onClick={() => setShowAddVitals(true)} className="rounded-xl font-black h-10 px-6">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة قياس
                </Button>
              </div>

              <div className="space-y-4">
                {vitalSigns.length > 0 ? (
                  vitalSigns.map((vital) => (
                    <div key={vital.vital_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Heart className="w-5 h-5 text-rose-500" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{new Date(vital.recorded_at).toLocaleDateString('ar')}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{new Date(vital.recorded_at).toLocaleTimeString('ar')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {vital.blood_pressure && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">ضغط الدم</p>
                            <p className="font-black text-slate-800">{vital.blood_pressure}</p>
                          </div>
                        )}
                        {vital.heart_rate && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">النبض</p>
                            <p className="font-black text-slate-800">{vital.heart_rate} نبضة</p>
                          </div>
                        )}
                        {vital.temperature && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الحرارة</p>
                            <p className="font-black text-slate-800">{vital.temperature}°</p>
                          </div>
                        )}
                        {vital.height && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الطول</p>
                            <p className="font-black text-slate-800">{vital.height} سم</p>
                          </div>
                        )}
                        {vital.weight && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الوزن</p>
                            <p className="font-black text-slate-800">{vital.weight} كجم</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 font-bold py-8">لا توجد قياسات مسجلة</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    الوثائق والتقارير الطبية
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">رفع التحاليل والأشعات والتقارير السابقة</p>
                </div>
                <div className="relative">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    id="doc-upload" 
                    className="hidden" 
                    onChange={handleUploadDocument} 
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
                  />
                  <Button asChild className="rounded-xl font-black h-10 px-6 cursor-pointer">
                    <label htmlFor="doc-upload">
                      {uploading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
                      رفع وثيقة
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters and Sorting */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500">البحث</label>
                  <Input 
                    placeholder="ابحث عن ملف..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border-slate-100 h-10 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    النوع
                  </label>
                  <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
                    <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="LAB_RESULT">تحاليل مخبرية</SelectItem>
                      <SelectItem value="PRESCRIPTION">وصفات طبية</SelectItem>
                      <SelectItem value="MEDICAL_REPORT">تقارير طبية</SelectItem>
                      <SelectItem value="X_RAY">أشعات</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-2">
                    <SortAsc className="w-4 h-4" />
                    الترتيب
                  </label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="rounded-xl border-slate-100 h-10 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">الأحدث أولاً</SelectItem>
                      <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                      <SelectItem value="name">حسب الاسم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.document_id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getDocumentTypeColor(doc.document_type)}`}>
                            {getDocumentIcon(doc.document_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-800 text-sm truncate">{doc.title}</p>
                            <Badge className={`${getDocumentTypeColor(doc.document_type)} border-none text-[10px] font-black mt-2`}>
                              {getDocumentTypeLabel(doc.document_type)}
                            </Badge>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogTitle>حذف الملف</AlertDialogTitle>
                            <AlertDialogDescription>هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                            <div className="flex gap-3 justify-end">
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDocument(doc.document_id)} className="bg-red-500 hover:bg-red-600">
                                حذف
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.uploaded_at).toLocaleDateString('ar')}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-600 font-bold">{doc.description}</p>
                        )}
                      </div>
                      <a 
                        href={doc.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-black text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold mb-2">لا توجد وثائق</p>
                  <p className="text-xs text-slate-400 font-bold">ابدأ برفع وثائقك الطبية الآن</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Vitals Dialog */}
      <Dialog open={showAddVitals} onOpenChange={setShowAddVitals}>
        <DialogContent className="rounded-[2.5rem] max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 text-right">إضافة مؤشرات حيوية</DialogTitle>
            <DialogDescription className="text-right font-bold">أدخل القياسات الحالية لمتابعة حالتك الصحية</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddVitals} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">ضغط الدم</label>
                <Input 
                  placeholder="120/80" 
                  value={vitalFormData.blood_pressure}
                  onChange={(e) => setVitalFormData({...vitalFormData, blood_pressure: e.target.value})}
                  className="rounded-xl border-slate-100 h-10 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">النبض</label>
                <Input 
                  type="number" 
                  placeholder="72" 
                  value={vitalFormData.heart_rate}
                  onChange={(e) => setVitalFormData({...vitalFormData, heart_rate: e.target.value})}
                  className="rounded-xl border-slate-100 h-10 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">الحرارة</label>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="36.5" 
                  value={vitalFormData.temperature}
                  onChange={(e) => setVitalFormData({...vitalFormData, temperature: e.target.value})}
                  className="rounded-xl border-slate-100 h-10 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">الوزن</label>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="70" 
                  value={vitalFormData.weight}
                  onChange={(e) => setVitalFormData({...vitalFormData, weight: e.target.value})}
                  className="rounded-xl border-slate-100 h-10 font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">الطول</label>
              <Input 
                type="number" 
                placeholder="170" 
                value={vitalFormData.height}
                onChange={(e) => setVitalFormData({...vitalFormData, height: e.target.value})}
                className="rounded-xl border-slate-100 h-10 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">ملاحظات</label>
              <Input 
                placeholder="أي ملاحظات إضافية..." 
                value={vitalFormData.notes}
                onChange={(e) => setVitalFormData({...vitalFormData, notes: e.target.value})}
                className="rounded-xl border-slate-100 h-10 font-bold"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddVitals(false)} className="flex-1 rounded-xl font-black h-10">
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 rounded-xl font-black h-10">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
