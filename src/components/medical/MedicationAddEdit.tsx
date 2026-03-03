import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  Pill,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Medication {
  adherence_id: string
  patient_id: string
  medication_name: string
  dosage: string
  frequency_per_day: number
  start_date: string
  end_date?: string
  instructions?: string
  is_active: boolean
  created_at: string
  medication_type?: string
  image_url?: string
  reminder_times?: string[]
}

interface MedicationAddEditProps {
  isOpen: boolean
  onClose: () => void
  medication?: Medication | null
  onSuccess: () => void
}

const MEDICATION_TYPES = [
  { value: 'PILL', label: 'حبة/قرص' },
  { value: 'SYRUP', label: 'شراب' },
  { value: 'INJECTION', label: 'حقنة' },
  { value: 'CREAM', label: 'كريم' },
  { value: 'DROPS', label: 'قطرات' },
  { value: 'INHALER', label: 'بخاخ' },
  { value: 'PATCH', label: 'لصقة' },
  { value: 'OTHER', label: 'أخرى' }
]

const DOSAGE_UNITS = [
  { value: 'mg', label: 'ملغ' },
  { value: 'g', label: 'غرام' },
  { value: 'ml', label: 'مل' },
  { value: 'mcg', label: 'ميكروغرام' },
  { value: 'IU', label: 'وحدة دولية' },
  { value: 'unit', label: 'وحدة' }
]

export default function MedicationAddEdit({ 
  isOpen, 
  onClose, 
  medication, 
  onSuccess 
}: MedicationAddEditProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reminderTimes, setReminderTimes] = useState<string[]>([])
  const [newReminderTime, setNewReminderTime] = useState("")
  
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    dosage_unit: "mg",
    frequency_per_day: "1",
    medication_type: "PILL",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    instructions: "",
  })

  useEffect(() => {
    if (medication) {
      setFormData({
        medication_name: medication.medication_name,
        dosage: medication.dosage.replace(/[a-zA-Z]+/, '').trim(),
        dosage_unit: medication.dosage.replace(/[0-9\s.]+/, '').trim() || "mg",
        frequency_per_day: medication.frequency_per_day.toString(),
        medication_type: medication.medication_type || "PILL",
        start_date: medication.start_date,
        end_date: medication.end_date || "",
        instructions: medication.instructions || "",
      })
      setReminderTimes(medication.reminder_times || [])
    } else {
      setFormData({
        medication_name: "",
        dosage: "",
        dosage_unit: "mg",
        frequency_per_day: "1",
        medication_type: "PILL",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
        instructions: "",
      })
      setReminderTimes([])
    }
    setNewReminderTime("")
  }, [medication, isOpen])

  const addReminderTime = () => {
    if (!newReminderTime) {
      toast({ 
        title: "تنبيه", 
        description: "يرجى إدخال وقت التذكير", 
        variant: "destructive" 
      })
      return
    }

    if (reminderTimes.includes(newReminderTime)) {
      toast({ 
        title: "تنبيه", 
        description: "هذا الوقت موجود بالفعل", 
        variant: "destructive" 
      })
      return
    }

    const newTimes = [...reminderTimes, newReminderTime].sort()
    setReminderTimes(newTimes)
    setNewReminderTime("")
  }

  const removeReminderTime = (time: string) => {
    setReminderTimes(reminderTimes.filter(t => t !== time))
  }

  const handleSave = async () => {
    if (!formData.medication_name.trim() || !formData.dosage.trim()) {
      toast({ 
        title: "تنبيه", 
        description: "يرجى ملء جميع الحقول المطلوبة", 
        variant: "destructive" 
      })
      return
    }

    if (reminderTimes.length === 0) {
      toast({ 
        title: "تنبيه", 
        description: "يرجى إضافة وقت تذكير واحد على الأقل", 
        variant: "destructive" 
      })
      return
    }

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("لم يتم العثور على المستخدم")

      const dosageString = `${formData.dosage} ${formData.dosage_unit}`

      const medData = {
        patient_id: user.id,
        medication_name: formData.medication_name.trim(),
        dosage: dosageString,
        frequency_per_day: parseInt(formData.frequency_per_day),
        medication_type: formData.medication_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        instructions: formData.instructions.trim() || null,
        reminder_times: reminderTimes,
        is_active: true
      }

      if (medication) {
        const { error } = await supabase
          .from('medication_adherence')
          .update(medData)
          .eq('adherence_id', medication.adherence_id)

        if (error) throw error
        toast({ 
          title: "نجاح", 
          description: "تم تحديث الدواء بنجاح" 
        })
      } else {
        const { error } = await supabase
          .from('medication_adherence')
          .insert([medData])

        if (error) throw error
        toast({ 
          title: "نجاح", 
          description: "تم إضافة الدواء بنجاح" 
        })
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error("Error saving medication:", err)
      toast({ 
        title: "خطأ", 
        description: "فشل في حفظ الدواء", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {medication ? "تعديل الدواء" : "إضافة دواء جديد"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Medication Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم الدواء *</label>
            <Input
              placeholder="مثال: الأسبرين"
              value={formData.medication_name}
              onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
              className="rounded-xl"
            />
          </div>

          {/* Medication Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">نوع الدواء</label>
            <Select value={formData.medication_type} onValueChange={(value) => setFormData({ ...formData, medication_type: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDICATION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dosage */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">الجرعة *</label>
              <Input
                placeholder="مثال: 500"
                type="number"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الوحدة</label>
              <Select value={formData.dosage_unit} onValueChange={(value) => setFormData({ ...formData, dosage_unit: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOSAGE_UNITS.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">عدد مرات التناول يومياً *</label>
            <Select value={formData.frequency_per_day} onValueChange={(value) => setFormData({ ...formData, frequency_per_day: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num} مرات</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reminder Times */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-bold text-blue-900">مواعيد التذكير *</label>
            </div>

            <div className="flex gap-2">
              <Input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="rounded-xl flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={addReminderTime}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {reminderTimes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reminderTimes.map((time) => (
                  <Badge key={time} className="bg-white text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {time}
                    <button
                      onClick={() => removeReminderTime(time)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">تاريخ البدء *</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">تاريخ الانتهاء</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">تعليمات إضافية</label>
            <Textarea
              placeholder="مثال: تناول مع الطعام، تجنب الحليب..."
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="rounded-xl min-h-24 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">ملخص الدواء</h4>
            <div className="text-xs space-y-1 text-slate-600">
              <p><strong>الاسم:</strong> {formData.medication_name || "—"}</p>
              <p><strong>الجرعة:</strong> {formData.dosage} {formData.dosage_unit}</p>
              <p><strong>التكرار:</strong> {formData.frequency_per_day} مرات يومياً</p>
              <p><strong>المواعيد:</strong> {reminderTimes.length > 0 ? reminderTimes.join(", ") : "لم يتم تحديد مواعيد"}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 ml-2" />
                {medication ? "تحديث" : "إضافة"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
