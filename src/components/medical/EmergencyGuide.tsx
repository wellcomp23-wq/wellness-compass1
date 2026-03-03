import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldAlert, 
  Search, 
  Heart, 
  Thermometer, 
  Droplets, 
  Zap,
  Brain,
  Bone,
  Eye,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EmergencyCase {
  id: string
  title: string
  icon: any
  category: string
  urgency: "critical" | "urgent" | "moderate"
  symptoms: string[]
  firstAidSteps: string[]
  warnings: string[]
  whenToCall: string
}

export default function EmergencyGuide() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null)

  const emergencyCases: EmergencyCase[] = [
    {
      id: "heart-attack",
      title: "نوبة قلبية",
      icon: Heart,
      category: "قلبية وعائية",
      urgency: "critical",
      symptoms: [
        "ألم أو ضغط في الصدر",
        "ألم في الذراع اليسرى أو الكتف",
        "ضيق التنفس",
        "الغثيان أو القيء",
        "الدوخة أو فقدان الوعي"
      ],
      firstAidSteps: [
        "اطلب الإسعاف فوراً - 191",
        "ساعد المريض على الجلوس في وضعية مريحة",
        "أعط المريض حبة أسبرين 325 ملغ إذا لم يكن لديه حساسية",
        "ابق مع المريض وراقب علاماته الحيوية",
        "كن مستعداً لإجراء الإنعاش القلبي الرئوي إذا لزم الأمر",
        "لا تعطِ المريض أي طعام أو شراب"
      ],
      warnings: [
        "لا تترك المريض وحده",
        "لا تسمح للمريض بالحركة أو المجهود",
        "تجنب الإجهاد النفسي على المريض"
      ],
      whenToCall: "فوراً عند ظهور أي من الأعراض أعلاه"
    },
    {
      id: "choking",
      title: "الاختناق",
      icon: Stethoscope,
      category: "تنفسية",
      urgency: "critical",
      symptoms: [
        "عدم القدرة على التنفس أو السعال",
        "صعوبة البلع",
        "الشعور بجسم عالق في الحلق",
        "تغير لون الجلد للأزرق",
        "فقدان الوعي"
      ],
      firstAidSteps: [
        "أطلب من المصاب السعال بقوة إذا كان قادراً",
        "قف خلف المصاب واحتضنه من الخلف",
        "ضع يديك تحت القفص الصدري مباشرة",
        "اضغط بقوة إلى الأعلى والداخل (مناورة هايمليك)",
        "كرر الضغط حتى يخرج الجسم الغريب أو يفقد المصاب وعيه",
        "إذا فقد الوعي، ابدأ الإنعاش القلبي الرئوي"
      ],
      warnings: [
        "لا تحاول إزالة الجسم الغريب بإصبعك إلا إذا رأيته",
        "لا تضرب على الظهر بقوة عند الاختناق",
        "اطلب الإسعاف فوراً"
      ],
      whenToCall: "فوراً - حالة حرجة"
    },
    {
      id: "severe-bleeding",
      title: "النزيف الشديد",
      icon: Droplets,
      category: "جراحية",
      urgency: "urgent",
      symptoms: [
        "نزيف غزير لا يتوقف",
        "فقدان الوعي أو الدوخة",
        "شحوب الجلد والعرق البارد",
        "سرعة ضربات القلب",
        "ضيق التنفس"
      ],
      firstAidSteps: [
        "اطلب الإسعاف فوراً",
        "اضغط مباشرة وبقوة على مكان النزيف بقطعة قماش نظيفة",
        "ارفع المنطقة المصابة أعلى من مستوى القلب",
        "لا تزل الضمادة المشبعة بالدم، بل أضف أخرى فوقها",
        "استخدم ضاغطاً (تورنيكا) فقط في حالات النزيف المهدد للحياة في الأطراف",
        "ضع المريض في وضعية الصدمة (رفع الأرجل 30 سم)"
      ],
      warnings: [
        "لا تزل الضمادة الأولى",
        "لا تستخدم عاصبة ضيقة جداً",
        "راقب علامات الصدمة (برودة، عرق، ضعف النبض)"
      ],
      whenToCall: "فوراً إذا كان النزيف غزيراً أو لا يتوقف"
    },
    {
      id: "burns",
      title: "الحروق",
      icon: Thermometer,
      category: "جلدية",
      urgency: "moderate",
      symptoms: [
        "احمرار الجلد",
        "ألم وتورم",
        "تقشر الجلد",
        "ظهور فقاعات",
        "سواد أو تفحم الجلد"
      ],
      firstAidSteps: [
        "أبعد المصاب عن مصدر الحرارة فوراً",
        "ضع المنطقة المصابة تحت ماء صنبور بارد لمدة 10-20 دقيقة",
        "أزل الملابس والمجوهرات قبل تورم المنطقة (إلا إذا كانت ملتصقة)",
        "غط الحرق بضمادة معقمة غير لاصقة أو غلاف بلاستيكي نظيف",
        "أعط المريض مسكناً للألم إن أمكن",
        "لا تثقب الفقاعات"
      ],
      warnings: [
        "لا تضع الثلج مباشرة على الجلد",
        "لا تستخدم الزبدة أو معجون الأسنان",
        "لا تستخدم الزيوت أو المراهم الدهنية",
        "تجنب الملابس الضيقة على المنطقة المصابة"
      ],
      whenToCall: "إذا كان الحرق كبيراً، عميقاً، في الوجه، اليدين، أو المفاصل"
    },
    {
      id: "fracture",
      title: "الكسور والالتواءات",
      icon: Bone,
      category: "عظمية",
      urgency: "urgent",
      symptoms: [
        "ألم شديد",
        "تورم وكدمات",
        "عدم القدرة على تحريك الطرف",
        "تشوه واضح",
        "خدر أو تنميل"
      ],
      firstAidSteps: [
        "ثبت الطرف المصاب في وضعية مريحة",
        "ضع كيس ثلج على المنطقة (ملفوف بقطعة قماش)",
        "ارفع الطرف المصاب قدر الإمكان",
        "لا تحاول تصحيح الكسر",
        "استخدم رباط ضاغط خفيف إذا لم يكن هناك نزيف",
        "اطلب الإسعاف للكسور الخطيرة"
      ],
      warnings: [
        "لا تحرك الطرف المصاب بشكل مفاجئ",
        "لا تضع الثلج مباشرة على الجلد",
        "راقب علامات ضعف الدورة الدموية (زرقة، برودة)"
      ],
      whenToCall: "إذا كان الكسر في العمود الفقري، الحوض، أو الأطراف الكبيرة"
    },
    {
      id: "stroke",
      title: "السكتة الدماغية",
      icon: Brain,
      category: "عصبية",
      urgency: "critical",
      symptoms: [
        "ضعف مفاجئ في جانب واحد من الجسم",
        "صعوبة في الكلام أو الفهم",
        "عدم وضوح الرؤية",
        "دوخة شديدة",
        "صداع مفاجئ وشديد"
      ],
      firstAidSteps: [
        "اطلب الإسعاف فوراً - 191",
        "لاحظ وقت ظهور الأعراض",
        "ضع المريض في وضعية آمنة (على جانبه)",
        "لا تعطِ المريض أي طعام أو شراب",
        "راقب التنفس والوعي",
        "كن مستعداً لإجراء الإنعاش القلبي الرئوي"
      ],
      warnings: [
        "السكتة الدماغية حالة طبية طارئة",
        "الوقت حرج جداً (الذهب الضائع)",
        "لا تؤخر طلب الإسعاف"
      ],
      whenToCall: "فوراً - حالة حرجة جداً"
    },
    {
      id: "allergic-reaction",
      title: "رد فعل تحسسي شديد",
      icon: AlertTriangle,
      category: "حساسية",
      urgency: "critical",
      symptoms: [
        "صعوبة التنفس أو الاختناق",
        "تورم الوجه والحلق",
        "طفح جلدي واسع",
        "دوخة وفقدان الوعي",
        "ضيق في الصدر"
      ],
      firstAidSteps: [
        "اطلب الإسعاف فوراً",
        "ضع المريض في وضعية آمنة",
        "أعط المريض حقنة الإبينفرين (EpiPen) إذا كانت متاحة",
        "أزل مصدر الحساسية إن أمكن",
        "راقب التنفس والنبض",
        "كن مستعداً للإنعاش القلبي الرئوي"
      ],
      warnings: [
        "الحساسية الشديدة قد تكون مهددة للحياة",
        "استخدم EpiPen حتى لو كنت غير متأكداً",
        "لا تؤخر طلب الإسعاف"
      ],
      whenToCall: "فوراً - حالة حرجة"
    }
  ]

  const filteredCases = emergencyCases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return { bg: "bg-red-100", text: "text-red-800", badge: "bg-red-500" }
      case "urgent":
        return { bg: "bg-orange-100", text: "text-orange-800", badge: "bg-orange-500" }
      case "moderate":
        return { bg: "bg-yellow-100", text: "text-yellow-800", badge: "bg-yellow-500" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", badge: "bg-gray-500" }
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "حرج جداً"
      case "urgent":
        return "عاجل"
      case "moderate":
        return "معتدل"
      default:
        return urgency
    }
  }

  if (selectedCase) {
    const colors = getUrgencyColor(selectedCase.urgency)
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCase(null)}
          className="rounded-lg"
        >
          ← العودة
        </Button>

        <div className={`rounded-2xl border p-6 ${colors.bg}`}>
          <div className="flex items-center gap-3 mb-4">
            <selectedCase.icon className={`w-8 h-8 ${colors.text}`} />
            <div>
              <h2 className={`text-xl font-bold ${colors.text}`}>{selectedCase.title}</h2>
              <p className="text-xs opacity-75">{selectedCase.category}</p>
            </div>
            <Badge className={`${colors.badge} text-white ml-auto`}>
              {getUrgencyLabel(selectedCase.urgency)}
            </Badge>
          </div>
        </div>

        {/* Symptoms */}
        <div className="bg-white rounded-2xl border border-primary/5 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            الأعراض
          </h3>
          <ul className="space-y-2">
            {selectedCase.symptoms.map((symptom, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                {symptom}
              </li>
            ))}
          </ul>
        </div>

        {/* First Aid Steps */}
        <div className="bg-white rounded-2xl border border-primary/5 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            خطوات الإسعافات الأولية
          </h3>
          <ol className="space-y-3">
            {selectedCase.firstAidSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="font-bold text-green-500 flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Warnings */}
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            تحذيرات مهمة
          </h3>
          <ul className="space-y-2">
            {selectedCase.warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                <span className="font-bold">✕</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>

        {/* When to Call */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-blue-700">
            <Clock className="w-4 h-4" />
            متى تطلب الإسعاف
          </h3>
          <p className="text-sm text-blue-700">{selectedCase.whenToCall}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="ابحث عن حالة إسعافية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-12 h-12 rounded-xl bg-white border-primary/10"
        />
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCases.map((emergencyCase) => {
          const colors = getUrgencyColor(emergencyCase.urgency)
          const Icon = emergencyCase.icon
          return (
            <button
              key={emergencyCase.id}
              onClick={() => setSelectedCase(emergencyCase)}
              className={`rounded-2xl border p-4 text-right transition-all hover:shadow-md ${colors.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${colors.text}`}>
                    {emergencyCase.title}
                  </h3>
                  <p className="text-xs opacity-75">{emergencyCase.category}</p>
                </div>
                <Icon className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
              </div>
              <Badge className={`text-[10px] ${colors.badge} text-white`}>
                {getUrgencyLabel(emergencyCase.urgency)}
              </Badge>
            </button>
          )
        })}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">لم يتم العثور على حالات</p>
        </div>
      )}
    </div>
  )
}
