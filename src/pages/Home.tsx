import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { usePatientData } from '@/hooks/usePatientData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Pill, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Hospital, 
  Stethoscope, 
  Activity, 
  RefreshCw, 
  FlaskConical, 
  BrainCircuit, 
  Bell, 
  User, 
  Settings, 
  HelpCircle,
  BookOpen,
  Compass,
  ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const navigate = useNavigate()
  const { patient, stats, nextAppointment, loading, error, refetch } = usePatientData()
  const [userName, setUserName] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login', { replace: true })
        return
      }
      setUserName(session.user.email?.split('@')[0] || 'المستخدم')
      
      try {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false)
        
        setUnreadCount(count || 0)
      } catch (err) {
        console.warn('Error fetching notifications count:', err)
      }
    }
    checkAuth()
  }, [navigate])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const navigationCards = [
    {
      id: 'health-profile',
      title: 'ملفك الصحي',
      description: 'عرض وتحديث بيانات صحتك وتاريخك الطبي بكل سهولة',
      icon: Heart,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-100',
      color: 'from-primary/15 to-primary/5',
      borderColor: 'border-primary/20',
      buttonColor: 'bg-primary hover:bg-primary/90',
      path: '/profile',
      stats: patient?.weight ? `${patient.weight} كغ` : 'غير محدد'
    },
    {
      id: 'symptom-analyzer',
      title: 'محلل الأعراض',
      description: 'استخدم الذكاء الاصطناعي لفهم أعراضك الصحية بشكل أفضل',
      icon: BrainCircuit,
      iconColor: 'text-secondary',
      iconBg: 'bg-secondary/10',
      color: 'from-secondary/15 to-secondary/5',
      borderColor: 'border-secondary/20',
      buttonColor: 'bg-secondary hover:bg-secondary/90',
      path: '/symptom-checker',
      stats: 'أداة ذكية'
    },
    {
      id: 'appointments',
      title: 'حجز المواعيد',
      description: 'احجز موعداً مع نخبة من الأطباء المتخصصين في اليمن',
      icon: Calendar,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      color: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      path: '/appointments',
      stats: `${stats?.upcomingAppointments || 0} موعد`
    },
    {
      id: 'medications',
      title: 'إدارة الأدوية',
      description: 'تتبع أدويتك، جرعاتك، واحصل على تنبيهات دقيقة',
      icon: Pill,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      color: 'from-orange-50 to-orange-100/50',
      borderColor: 'border-orange-200',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      path: '/medications',
      stats: `${stats?.activeMedications || 0} أدوية`
    },
    {
      id: 'community',
      title: 'المجتمعات الداعمة',
      description: 'تواصل مع أشخاص يشاركونك نفس الاهتمامات الصحية',
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      color: 'from-purple-50 to-purple-100/50',
      borderColor: 'border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      path: '/community',
      stats: `${stats?.communityGroups || 0} مجموعة`
    },
    {
      id: 'emergency',
      title: 'دليل الطوارئ',
      description: 'الوصول السريع لأرقام الطوارئ والإسعافات الأولية',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      color: 'from-red-50 to-red-100/50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-500 hover:bg-red-600',
      path: '/emergency',
      stats: 'معلومات مهمة'
    }
  ]

  const additionalCards = [
    { id: 'doctors', title: 'الأطباء', description: 'ابحث عن تخصصك', icon: Stethoscope, path: '/doctors' },
    { id: 'pharmacies', title: 'الصيدليات', description: 'اعثر على الأقرب', icon: Pill, path: '/pharmacies' },
    { id: 'hospitals', title: 'المستشفيات', description: 'معلومات التواصل', icon: Hospital, path: '/hospitals' },
    { id: 'laboratories', title: 'المختبرات', description: 'نتائج فحوصاتك', icon: FlaskConical, path: '/labs' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24 font-arabic" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 group cursor-pointer overflow-hidden relative" 
              onClick={() => navigate('/home')}
            >
              <Compass className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            </motion.div>
            <div className="hidden sm:block text-right">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">بوصلة <span className="text-primary">العافية</span></h1>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Wellness Compass</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
             <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
              <User className="w-5 h-5" />
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/support')} className="rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="relative rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 py-6 space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="space-y-1 text-right">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">مرحباً، {userName} 👋</h2>
            <p className="text-slate-500 font-medium text-base md:text-lg">كيف يمكننا مساعدتك اليوم؟</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="rounded-2xl border-slate-200 h-12 w-12 hover:bg-primary/5 hover:text-primary transition-all">
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>

        {/* Health Status Card */}
        <AnimatePresence>
          {loading ? (
            <Skeleton className="h-32 rounded-[2.5rem]" />
          ) : patient ? (
            <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="border-primary/20 bg-white/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-sm border-2">
                <CardHeader className="pb-2 text-right">
                  <CardTitle className="flex items-center gap-2 text-slate-800 text-lg font-bold">
                    <Activity className="w-6 h-6 text-primary" />
                    نظرة على صحتك
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'فصيلة الدم', value: patient.bloodType || 'غير محدد', icon: Heart, color: 'text-rose-500' },
                    { label: 'الوزن', value: patient.weight ? `${patient.weight} كغ` : 'غير محدد', icon: Activity, color: 'text-blue-500' },
                    { label: 'الطول', value: patient.height ? `${patient.height} سم` : 'غير محدد', icon: Stethoscope, color: 'text-teal-500' },
                    { label: 'الالتزام', value: `${stats?.adherenceRate || 0}%`, icon: ShieldCheck, color: 'text-emerald-500' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow text-right">
                      <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Next Appointment Alert */}
        {nextAppointment && (
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
            <Card className="border-blue-200 bg-blue-50/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-right">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-lg">موعدك القادم</p>
                    <p className="text-base text-slate-600 font-medium">
                      {nextAppointment.doctor ? `مع د. ${nextAppointment.doctor.first_name} ${nextAppointment.doctor.last_name}` : 'موعد طبي'} في{' '}
                      {new Date(nextAppointment.appointment_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Navigation Cards */}
        <div className="space-y-6">
          <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-4 text-right">
            <div className="w-3 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
            خدماتك الرئيسية
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-[3rem]" />)
              : navigationCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <motion.div key={card.id} variants={itemVariants} whileHover={{ y: -10 }}>
                      <Card className={`border-2 ${card.borderColor} bg-white/60 backdrop-blur-md cursor-pointer hover:shadow-2xl transition-all duration-500 rounded-[3rem] group overflow-hidden h-full flex flex-col text-right`} onClick={() => navigate(card.path)}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-4 ${card.iconBg} rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}><Icon className={`w-9 h-9 ${card.iconColor}`} /></div>
                            <Badge className="bg-white/90 text-slate-800 hover:bg-white border-none px-3 py-1 rounded-full font-bold text-[10px] shadow-sm">{card.stats}</Badge>
                          </div>
                          <CardTitle className="text-xl font-bold text-slate-900 mt-3">{card.title}</CardTitle>
                          <CardDescription className="text-slate-500 font-medium text-sm leading-relaxed mt-2">{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-4">
                          <Button className={`w-full ${card.buttonColor} text-white rounded-2xl font-bold h-12 text-base shadow-lg group-hover:shadow-xl transition-all`}>ابدأ الآن</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
          </div>
        </div>

        {/* Additional Services */}
        <div className="space-y-6">
          <motion.h2 variants={itemVariants} className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-4 text-right">
            <div className="w-3 h-8 bg-secondary rounded-full shadow-lg shadow-secondary/20" />
            تصفح المزيد
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {additionalCards.map((card) => {
              const Icon = card.icon
              return (
                <motion.div key={card.id} variants={itemVariants} whileHover={{ scale: 1.05 }}>
                  <Card className="border-2 border-slate-100 hover:border-primary/40 hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-[2.5rem] bg-white/60 backdrop-blur-md overflow-hidden" onClick={() => navigate(card.path)}>
                    <CardHeader className="p-8">
                      <div className="flex flex-col items-center text-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-all shadow-inner"><Icon className="w-8 h-8 text-slate-500 group-hover:text-primary transition-colors" /></div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800">{card.title}</CardTitle>
                          <CardDescription className="text-[11px] font-medium mt-1 text-slate-400">{card.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer / How to Use Section */}
        <motion.div variants={itemVariants} className="pt-8">
            <Card className="bg-white/60 backdrop-blur-xl border-4 border-white rounded-[4rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-primary/5">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-6 text-center md:text-right flex-1">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                  <BookOpen className="w-4 h-4" />
                  دليل الاستخدام الذكي
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">كيف تستفيد من بوصلة العافية؟</h3>
                <p className="text-slate-500 font-medium text-base max-w-xl leading-relaxed mx-auto md:mx-0">
                  اكتشف قوة النظام الصحي الموحد. تعلم كيف تدير ملفك الطبي، تتابع أدويتك، وتحصل على استشارات طبية فورية بكل سهولة.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 pt-4">
                  <Button onClick={() => navigate('/how-to-use')} className="bg-primary hover:bg-primary/90 text-white rounded-[2rem] px-8 h-14 font-bold text-base shadow-2xl shadow-primary/20 transition-all hover:scale-105">
                    اقرأ الدليل الآن
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/support')} className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-[2rem] px-8 h-14 font-bold text-base transition-all">
                    تواصل معنا
                  </Button>
                </div>
              </div>
              <div className="w-64 h-64 md:w-80 md:h-80 relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-[4rem] border-4 border-white flex items-center justify-center shadow-2xl rotate-3">
                   <Compass className="w-32 h-32 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full -ml-40 -mt-40 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 rounded-full -mr-40 -mb-40 blur-3xl"></div>
          </Card>
          
          <div className="mt-12 text-center space-y-4">
             <div className="flex items-center justify-center gap-8">
                <button onClick={() => navigate('/terms')} className="text-slate-400 hover:text-primary text-xs font-bold transition-colors">سياسة الخصوصية</button>
                <button onClick={() => navigate('/support')} className="text-slate-400 hover:text-primary text-xs font-bold transition-colors">الدعم الفني</button>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-500 text-xs font-bold transition-colors">تسجيل الخروج</button>
             </div>
             <p className="text-slate-300 text-[11px] font-medium uppercase tracking-[0.3em]">© 2026 بوصلة العافية - التكنولوجيا في خدمة صحتك</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
