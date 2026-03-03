import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Smartphone, 
  Shield, 
  Heart, 
  Search, 
  Calendar, 
  Pill,
  MessageCircle,
  HelpCircle
} from "lucide-react"
import { motion } from "framer-motion"

export default function HowToUse() {
  const navigate = useNavigate()

  const steps = [
    {
      title: "إنشاء الحساب والملف الصحي",
      description: "ابدأ بإنشاء حسابك الشخصي وإكمال ملفك الصحي (فصيلة الدم، الوزن، الطول) لتمكين النظام من تقديم توصيات دقيقة.",
      icon: Smartphone,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "البحث عن الخدمات الطبية",
      description: "استخدم محرك البحث المتطور للعثور على الأطباء، الصيدليات، المختبرات، والمستشفيات القريبة منك في اليمن.",
      icon: Search,
      color: "bg-teal-50 text-teal-600"
    },
    {
      title: "إدارة المواعيد والأدوية",
      description: "قم بحجز مواعيدك الطبية وتنظيم جدول أدويتك مع خاصية التذكير الذكي لضمان الالتزام بالخطة العلاجية.",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "التواصل والدعم",
      description: "انضم للمجتمعات الصحية للحصول على الدعم، أو تواصل مع الدعم الفني مباشرة في حال واجهت أي صعوبات.",
      icon: MessageCircle,
      color: "bg-orange-50 text-orange-600"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[3rem] shadow-sm mb-8 sticky top-0 z-50 border-b border-primary/5">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">دليل الاستخدام</h1>
            <p className="text-xs text-muted-foreground font-bold">تعلم كيف تستفيد من بوصلة العافية</p>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-2xl mx-auto px-4 space-y-8"
      >
        {/* Intro Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-4">مرحباً بك في بوصلة العافية</h2>
            <p className="text-white/90 font-medium leading-relaxed">
              هذا النظام الذكي مصمم ليكون رفيقك الصحي الأول في اليمن، حيث يجمع بين إدارة السجلات الصحية الموحدة وتسهيل الوصول للخدمات الطبية.
            </p>
          </div>
          <Heart className="absolute -bottom-10 -right-10 w-40 h-40 text-white/10 rotate-12" fill="currentColor" />
        </motion.div>

        {/* Steps Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            خطوات البداية
          </h3>
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ x: -5 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-5 group transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Security Info */}
        <motion.div variants={itemVariants} className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-start gap-4">
          <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-black text-emerald-900 mb-1">خصوصية بياناتك</h4>
            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
              نحن نلتزم بأعلى معايير الأمان لحماية بياناتك الصحية. جميع سجلاتك مشفرة ولا يمكن لأحد الوصول إليها إلا بتصريح منك.
            </p>
          </div>
        </motion.div>

        {/* Support Link */}
        <motion.div variants={itemVariants} className="text-center pt-4">
          <p className="text-slate-500 font-bold text-sm mb-4">هل ما زلت بحاجة للمساعدة؟</p>
          <Button 
            onClick={() => navigate('/support')}
            className="rounded-2xl px-8 h-12 font-black gap-2 shadow-lg shadow-primary/20"
          >
            <HelpCircle className="w-5 h-5" />
            تواصل مع الدعم الفني
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
