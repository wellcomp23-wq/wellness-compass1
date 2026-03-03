import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  Download,
  Eye,
  Upload,
  AlertCircle,
  Check,
  File,
  FileText,
  Image,
  Calendar,
  X,
  Search
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface MedicalRecord {
  record_id: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  description: string
  uploaded_at: string
}

interface ValidationError {
  field: string
  message: string
}

export default function MedicalRecordsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // Form states
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDescription, setFileDescription] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'upload' | 'delete', id?: string }>({ type: 'upload' })
  const [previewFile, setPreviewFile] = useState<MedicalRecord | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setIsLoading(true)
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error("لم يتم العثور على المستخدم")
      setCurrentUser(user)

      // Fetch medical records
      const { data: recordsList, error: recordsErr } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (recordsList) {
        setRecords(recordsList)
      }
    } catch (err) {
      console.error("Error fetching records:", err)
      toast({ title: "خطأ", description: "فشل في تحميل الملفات", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationError[] = []

    if (!selectedFile) {
      errors.push({ field: 'file', message: 'يرجى اختيار ملف' })
    } else {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(selectedFile.type)) {
        errors.push({ field: 'file', message: 'نوع الملف غير مدعوم (PDF أو صور فقط)' })
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        errors.push({ field: 'file', message: 'حجم الملف يجب أن لا يتجاوز 10 MB' })
      }
    }

    if (!fileDescription.trim()) {
      errors.push({ field: 'description', message: 'يرجى إدخال وصف للملف' })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValidationErrors([])
    }
  }

  const handleUpload = async () => {
    if (!validateForm()) {
      toast({ title: "تنبيه", description: "يرجى تصحيح الأخطاء المشار إليها", variant: "destructive" })
      return
    }

    setConfirmAction({ type: 'upload' })
    setShowConfirmDialog(true)
  }

  const confirmUpload = async () => {
    if (!selectedFile) return

    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      // Upload file to storage
      const fileName = `${currentUser.id}-${Date.now()}-${selectedFile.name}`
      const { data, error: uploadErr } = await supabase.storage
        .from('medical-records')
        .upload(`${currentUser.id}/${fileName}`, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadErr) throw uploadErr

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('medical-records')
        .getPublicUrl(`${currentUser.id}/${fileName}`)

      // Save record to database
      const { error: dbErr } = await supabase
        .from('medical_records')
        .insert({
          patient_id: currentUser.id,
          file_url: publicData.publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          description: fileDescription
        })

      if (dbErr) throw dbErr

      toast({ title: "نجح", description: "تم رفع الملف بنجاح" })
      setSelectedFile(null)
      setFileDescription("")
      setShowUploadForm(false)
      await fetchRecords()
    } catch (err: any) {
      console.error("Error uploading file:", err)
      toast({ title: "خطأ", description: err.message || "فشل في رفع الملف", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRecord = (recordId: string) => {
    setConfirmAction({ type: 'delete', id: recordId })
    setShowConfirmDialog(true)
  }

  const confirmDelete = async () => {
    try {
      setIsSaving(true)
      setShowConfirmDialog(false)

      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('record_id', confirmAction.id)

      if (error) throw error

      toast({ title: "نجح", description: "تم حذف الملف بنجاح" })
      await fetchRecords()
    } catch (err: any) {
      console.error("Error deleting record:", err)
      toast({ title: "خطأ", description: err.message || "فشل في حذف الملف", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRecords = records.filter(record =>
    record.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(e => e.field === fieldName)?.message
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري تحميل الملفات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-8 sticky top-0 z-50 border-b border-primary/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">الملفات الطبية</h1>
              <p className="text-xs text-slate-400 font-bold">احفظ وأدر ملفاتك الطبية التاريخية</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="rounded-xl font-black h-10 px-6 shadow-sm"
          >
            <Plus className="w-4 h-4 ml-2" />
            رفع ملف
          </Button>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Upload Form */}
          <AnimatePresence>
            {showUploadForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 mb-8"
              >
                <h2 className="text-lg font-black text-slate-800 mb-6">رفع ملف طبي جديد</h2>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-[2rem] p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-black text-red-900 mb-2">يرجى تصحيح الأخطاء التالية:</p>
                        <ul className="space-y-1">
                          {validationErrors.map((error, idx) => (
                            <li key={idx} className="text-sm text-red-700">• {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* File Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">
                      اختر الملف <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        selectedFile
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-3">
                          {getFileIcon(selectedFile.type)}
                          <div className="text-left">
                            <p className="font-black text-slate-800">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="font-black text-slate-700">اسحب الملف هنا أو انقر للاختيار</p>
                          <p className="text-xs text-slate-500 mt-1">PDF أو صور (حد أقصى 10 MB)</p>
                        </div>
                      )}
                    </div>
                    {getFieldError('file') && <p className="text-xs text-red-600">{getFieldError('file')}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500">
                      وصف الملف <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={fileDescription}
                      onChange={e => setFileDescription(e.target.value)}
                      placeholder="مثال: تقرير فحص الدم - فبراير 2026"
                      className="rounded-2xl border-slate-100 h-12 font-bold bg-slate-50/50"
                    />
                    {getFieldError('description') && <p className="text-xs text-red-600">{getFieldError('description')}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUploadForm(false)
                        setSelectedFile(null)
                        setFileDescription("")
                        setValidationErrors([])
                      }}
                      className="flex-1 h-12 rounded-2xl font-black"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={isSaving}
                      className="flex-1 h-12 rounded-2xl font-black"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 ml-2" />}
                      رفع
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          {records.length > 0 && (
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن ملف..."
                  className="rounded-2xl border-slate-100 h-12 font-bold pl-12 bg-white"
                />
              </div>
            </div>
          )}

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-50 text-center">
                <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">
                  {records.length === 0 ? 'لم تقم برفع أي ملفات بعد' : 'لم يتم العثور على ملفات'}
                </p>
              </div>
            ) : (
              filteredRecords.map(record => (
                <motion.div
                  key={record.record_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600">
                        {getFileIcon(record.file_type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-800">{record.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{record.file_name}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span>{formatFileSize(record.file_size)}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewFile(record)
                          setShowPreview(true)
                        }}
                        className="rounded-xl font-black h-10 px-3"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <a
                        href={record.file_url}
                        download={record.file_name}
                        className="inline-flex items-center justify-center h-10 px-3 rounded-xl font-black border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.record_id)}
                        className="rounded-xl font-black h-10 px-3 text-red-500 border-red-50 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" dir="rtl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800">{previewFile.description}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {previewFile.file_type.startsWith('image/') ? (
              <img src={previewFile.file_url} alt={previewFile.file_name} className="w-full rounded-2xl" />
            ) : previewFile.file_type === 'application/pdf' ? (
              <iframe
                src={previewFile.file_url}
                className="w-full h-96 rounded-2xl border border-slate-200"
              />
            ) : (
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">لا يمكن عرض معاينة لهذا الملف</p>
                <a
                  href={previewFile.file_url}
                  download={previewFile.file_name}
                  className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-black"
                >
                  تحميل الملف
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}

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
              {confirmAction.type === 'upload' ? 'تأكيد الرفع' : 'تأكيد الحذف'}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              {confirmAction.type === 'upload'
                ? 'هل أنت متأكد من رغبتك في رفع هذا الملف؟'
                : 'هل أنت متأكد من رغبتك في حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.'}
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
                onClick={confirmAction.type === 'upload' ? confirmUpload : confirmDelete}
                disabled={isSaving}
                className={`flex-1 h-12 rounded-2xl font-black ${
                  confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 ml-2" />}
                {confirmAction.type === 'upload' ? 'رفع' : 'حذف'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
