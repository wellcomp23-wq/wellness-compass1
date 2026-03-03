import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Settings,
  Search,
  RefreshCw,
  BarChart3,
  Activity,
  Shield,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Lock,
  AlertCircle,
  LogOut,
  Copy,
  Mail,
  FileText,
  Download,
  X,
  Stethoscope,
  Pill,
  FlaskConical,
  Building2,
  ArrowUpRight,
  Clock,
  Check,
  Edit2,
  Unlock,
  MoreVertical,
  Filter
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { generateUsername, generatePassword } from "@/lib/auth-utils"

interface User {
  id: string
  email: string
  role: string
  created_at: string
  status: string
  username?: string
  last_login?: string
}

interface ProviderApplication {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role_requested: string
  document_url: string
  status: string
  created_at: string
  user_id?: string
}

interface SupportTicket {
  ticket_id: string
  user_id: string
  subject: string
  message: string
  status: string
  created_at: string
  user_email?: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [applications, setApplications] = useState<ProviderApplication[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("")
  const [selectedApp, setSelectedApp] = useState<ProviderApplication | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({})
  const [generatedCredentials, setGeneratedCredentials] = useState<{ [key: string]: { username: string; password: string } }>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)
  const [userStatusToggle, setUserStatusToggle] = useState<{ [key: string]: string }>({})
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<{ username?: string; email?: string; role?: string }>({})
  const [isActionLoading, setIsActionLoading] = useState<{ [key: string]: boolean }>({})
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false)
  const [statusConfirmUserId, setStatusConfirmUserId] = useState<string | null>(null)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null)
  const [deleteConfirmInputValue, setDeleteConfirmInputValue] = useState("")

  useEffect(() => {
    fetchUsers()
    fetchApplications()
    fetchTickets()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchApplications()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      const statusMap: { [key: string]: string } = {}
      data?.forEach(user => {
        statusMap[user.id] = user.status || 'ACTIVE'
      })
      setUserStatusToggle(statusMap)
    } catch (err) {
      console.error("Error fetching users:", err)
      toast({ title: "خطأ", description: "فشل في تحميل المستخدمين", variant: "destructive" })
    }
  }

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      console.error('Error in fetchApplications:', err)
      toast({ title: 'خطأ', description: 'فشل في تحميل الطلبات', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, users(email)')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedTickets = data?.map(t => ({
        ...t,
        user_email: (t.users as any)?.email
      }))
      
      setTickets(formattedTickets || [])
    } catch (err) {
      console.error("Error fetching tickets:", err)
    }
  }

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('ticket_id', ticketId)

      if (error) throw error
      
      setTickets(prev => prev.map(t => t.ticket_id === ticketId ? { ...t, status: newStatus } : t))
      toast({ title: "نجاح", description: "تم تحديث حالة التذكرة" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في تحديث الحالة", variant: "destructive" })
    }
  }

  const handleApproveApplication = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId)
      if (!app) throw new Error("لم يتم العثور على الطلب")

      let responseData
      try {
        const { data, error } = await supabase.functions.invoke('approve-provider', {
          body: { applicationId: appId }
        })

        if (error) throw error
        responseData = data
      } catch (invokeError: any) {
        const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
        const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY
        
        const response = await fetch(`${supabaseUrl}/functions/v1/approve-provider`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ applicationId: appId })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`فشل الاتصال بالدالة: ${response.status}`)
        }
        
        responseData = await response.json()
      }

      if (!responseData || !responseData.success) {
        throw new Error(responseData?.error || "فشل في معالجة الطلب داخل الدالة")
      }
      
      const data = responseData

      setGeneratedCredentials(prev => ({
        ...prev,
        [appId]: { username: data.username, password: data.password }
      }))

      setApplications(prev => prev.filter(a => a.id !== appId))
      
      toast({ 
        title: "نجاح", 
        description: `تم الموافقة على الطلب. اسم المستخدم: ${data.username}` 
      })
      
      setTimeout(() => fetchApplications(), 1000)
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في الموافقة على الطلب", variant: "destructive" })
    }
  }

  const handleRejectApplication = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('provider_applications')
        .update({ status: 'REJECTED' })
        .eq('id', appId)

      if (error) throw error

      setApplications(prev => prev.filter(a => a.id !== appId))
      toast({ title: "نجاح", description: "تم رفض الطلب" })
      
      setTimeout(() => fetchApplications(), 1000)
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في رفض الطلب", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      setUsers(prev => prev.filter(u => u.id !== userId))
      toast({ title: "نجاح", description: "تم حذف المستخدم بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف المستخدم", variant: "destructive" })
    }
  }

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role
    })
    setShowEditUserModal(true)
  }

  const handleSaveUserChanges = async () => {
    if (!editingUser) return
    try {
      setIsActionLoading(prev => ({ ...prev, [editingUser.id]: true }))
      if (!editFormData.username || !editFormData.email) {
        toast({ title: "خطأ", description: "جميع الحقول مطلوبة", variant: "destructive" })
        return
      }
      const { error } = await supabase
        .from('users')
        .update({
          username: editFormData.username,
          email: editFormData.email,
          role: editFormData.role
        })
        .eq('user_id', editingUser.id)
      if (error) throw error
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, username: editFormData.username, email: editFormData.email, role: editFormData.role }
          : u
      ))
      toast({ title: "نجاح", description: "تم تحديث بيانات المستخدم بنجاح" })
      setShowEditUserModal(false)
      setEditingUser(null)
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في تحديث بيانات المستخدم", variant: "destructive" })
    } finally {
      setIsActionLoading(prev => ({ ...prev, [editingUser.id]: false }))
    }
  }

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirmUserId) return
    try {
      setIsActionLoading(prev => ({ ...prev, [statusConfirmUserId]: true }))
      const currentStatus = userStatusToggle[statusConfirmUserId]
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('user_id', statusConfirmUserId)
      if (error) throw error
      setUserStatusToggle(prev => ({ ...prev, [statusConfirmUserId]: newStatus }))
      setUsers(prev => prev.map(u => 
        u.id === statusConfirmUserId 
          ? { ...u, status: newStatus }
          : u
      ))
      toast({ title: "نجاح", description: newStatus === 'ACTIVE' ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم" })
      setShowStatusConfirmDialog(false)
      setStatusConfirmUserId(null)
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في تحديث حالة المستخدم", variant: "destructive" })
    } finally {
      setIsActionLoading(prev => ({ ...prev, [statusConfirmUserId]: false }))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmUserId || deleteConfirmInputValue !== "حذف") {
      toast({ title: "خطأ", description: "يجب كتابة 'حذف' للتأكيد", variant: "destructive" })
      return
    }
    try {
      setIsActionLoading(prev => ({ ...prev, [deleteConfirmUserId]: true }))
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', deleteConfirmUserId)
      if (error) throw error
      setUsers(prev => prev.filter(u => u.id !== deleteConfirmUserId))
      toast({ title: "نجاح", description: "تم حذف المستخدم بنجاح" })
      setShowDeleteConfirmDialog(false)
      setDeleteConfirmUserId(null)
      setDeleteConfirmInputValue("")
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في حذف المستخدم", variant: "destructive" })
    } finally {
      setIsActionLoading(prev => ({ ...prev, [deleteConfirmUserId]: false }))
    }
  }

  const handleToggleUserStatus = (userId: string) => {
    setStatusConfirmUserId(userId)
    setShowStatusConfirmDialog(true)
  }

  const handleDeleteUserClick = (userId: string) => {
    setDeleteConfirmUserId(userId)
    setDeleteConfirmInputValue("")
    setShowDeleteConfirmDialog(true)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery || 
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter
    
    return matchesSearch && matchesRole
  })

  const filteredApplications = applications.filter(a => {
    if (!searchQuery) return true
    const fullName = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase()
    const email = (a.email || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminTokenExpiry")
    localStorage.removeItem("adminPassword")
    navigate("/admin/login")
  }

  // Helper functions
  const getAvatarColor = (username?: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-amber-500',
    ]
    if (!username) return colors[0]
    const hash = (username.charCodeAt(0) || 0) + (username.charCodeAt(username.length - 1) || 0)
    return colors[hash % colors.length]
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toUpperCase()) {
      case 'DOCTOR':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'طبيب' }
      case 'PHARMACIST':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'صيدلي' }
      case 'LAB_MANAGER':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'مدير مختبر' }
      case 'HOSPITAL_MANAGER':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'مدير مستشفى' }
      case 'PATIENT':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مريض' }
      case 'SYSTEM_ADMIN':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'مدير نظام' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: role }
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { color: 'bg-green-500', label: 'نشط' }
      case 'INACTIVE':
        return { color: 'bg-gray-400', label: 'غير نشط' }
      case 'PENDING':
        return { color: 'bg-yellow-500', label: 'معلق' }
      default:
        return { color: 'bg-gray-400', label: status || 'غير معروف' }
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'للتو'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} أيام`
    return past.toLocaleDateString('ar-YE')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'DOCTOR':
        return <Stethoscope className="w-5 h-5" />
      case 'PHARMACIST':
        return <Pill className="w-5 h-5" />
      case 'LAB_MANAGER':
        return <FlaskConical className="w-5 h-5" />
      case 'HOSPITAL_MANAGER':
        return <Building2 className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "تم النسخ", description: "تم نسخ البيانات إلى الحافظة" })
  }

  const pendingApps = applications.filter(a => a.status === 'PENDING')
  const pendingCount = pendingApps.length
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length
  
  const doctorsCount = pendingApps.filter(a => a.role_requested === 'DOCTOR').length
  const pharmacistsCount = pendingApps.filter(a => a.role_requested === 'PHARMACIST').length
  const labsCount = pendingApps.filter(a => a.role_requested === 'LAB_MANAGER').length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
              <p className="text-sm text-muted-foreground">إدارة المستخدمين والطلبات</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Users */}
          <div className="bg-blue-50/50 rounded-[12px] p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">إجمالي المستخدمين</p>
                <h3 className="text-4xl font-bold text-slate-800">{users.length}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12 هذا الشهر</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-1.5 py-0">🆕</Badge>
                <span>3 مستخدمين جدد اليوم</span>
              </div>
            </div>
          </div>

          {/* Card 2: Approved Applications */}
          <div className="bg-emerald-50/50 rounded-[12px] p-6 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">طلبات موافق عليها</p>
                <h3 className={cn("text-4xl font-bold", approvedCount === 0 ? "text-slate-400" : "text-slate-800")}>
                  {approvedCount}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                <Check className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">لا توجد طلبات موافقة جديدة</p>
              <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>⏳ {pendingCount} طلبات قيد المراجعة</span>
              </div>
            </div>
          </div>

          {/* Card 3: Provider Applications */}
          <div className="bg-purple-50/50 rounded-[12px] p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">طلبات مقدمي الخدمات</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    أطباء: {doctorsCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    صيادلة: {pharmacistsCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    مختبرات: {labsCount}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-md font-semibold text-slate-700">{pendingCount} طلبات بانتظار المراجعة</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  🕐 آخر طلب: منذ 5 دقائق
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications" className="bg-white rounded-xl border border-primary/10">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger value="applications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <AlertCircle className="w-4 h-4 ml-2" />
              طلبات مقدمي الخدمات ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Users className="w-4 h-4 ml-2" />
              المستخدمين ({users.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Headphones className="w-4 h-4 ml-2" />
              تذاكر الدعم ({tickets.filter(t => t.status === 'OPEN').length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="p-6 space-y-4">
            <div className="flex gap-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن الطلبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">لا توجد طلبات</p>
                </div>
              ) : (
                filteredApplications.map(app => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {getRoleIcon(app.role_requested)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{app.first_name} {app.last_name}</h3>
                            <p className="text-xs text-primary font-semibold">{getRoleBadgeStyle(app.role_requested).label}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                        <p className="text-sm text-muted-foreground">{app.phone}</p>
                      </div>
                      <Badge className={cn(
                        app.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                        app.status === 'APPROVED' && 'bg-green-100 text-green-800',
                        app.status === 'REJECTED' && 'bg-red-100 text-red-800'
                      )}>
                        {app.status === 'PENDING' && 'قيد الانتظار'}
                        {app.status === 'APPROVED' && 'موافق عليه'}
                        {app.status === 'REJECTED' && 'مرفوض'}
                      </Badge>
                    </div>

                    {app.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mb-3 gap-2"
                        onClick={() => {
                          setSelectedApp(app)
                          setShowDetailsModal(true)
                        }}
                      >
                        <FileText className="w-4 h-4" />
                        عرض التفاصيل والوثائق
                      </Button>
                    )}

                    {app.status === 'APPROVED' && generatedCredentials[app.id] && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-200">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          بيانات الدخول
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <code className="font-mono">{generatedCredentials[app.id].username}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(generatedCredentials[app.id].username)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <code className="font-mono">
                              {showCredentials[app.id] ? generatedCredentials[app.id].password : '••••••••'}
                            </code>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowCredentials(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                              >
                                {showCredentials[app.id] ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(generatedCredentials[app.id].password)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {app.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveApplication(app.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                          قبول الطلب
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleRejectApplication(app.id)}
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض الطلب
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="p-6 space-y-4">
            {/* Search Bar - Part 1 */}
            <div className="flex items-center gap-3 h-12 bg-white border border-gray-200 rounded-full px-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Back Arrow Button */}
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all"
                  onClick={() => {
                    setSearchQuery("")
                    setUserRoleFilter("ALL")
                  }}
                  title="العودة للقائمة الكاملة"
                >
                  <ArrowRight className="w-4.5 h-4.5" />
                </Button>
              )}
              
              {/* Search Icon */}
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              
              {/* Input Field */}
              <Input
                placeholder="ابحث باسم المستخدم أو البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400"
              />
              
              {/* Clear Button */}
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-auto text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                  onClick={() => setSearchQuery("")}
                  title="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Results Bar - Part 2 */}
            {searchQuery && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Results Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">📊</span>
                    <span className="text-gray-700">
                      نتائج البحث:
                      <span className="font-bold text-gray-900 mx-1">{filteredUsers.length}</span>
                      <span className="text-gray-600">مستخدم</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      عن <span className="font-semibold text-gray-900">"{searchQuery}"</span>
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                      title="تصفية النتائج"
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-3 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-sm font-medium gap-1.5"
                      onClick={() => {
                        setSearchQuery("")
                        setUserRoleFilter("ALL")
                      }}
                      title="إلغاء البحث والعودة للقائمة الكاملة"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">إلغاء</span>
                    </Button>
                  </div>
                </div>
                
                {/* No Results Message */}
                {filteredUsers.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🔍 لا توجد نتائج مطابقة لـ <span className="font-semibold">"{searchQuery}"</span>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">جرب كلمات بحث أخرى أو تحقق من تهجئة الكلمة</p>
                  </div>
                )}
              </div>
            )}

            {/* Filter Buttons with Statistics */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button 
                variant={userRoleFilter === "ALL" ? "default" : "outline"} 
                size="sm"
                onClick={() => setUserRoleFilter("ALL")}
                className="whitespace-nowrap"
              >
                الكل <span className="text-xs ml-1 opacity-75">({users.length})</span>
              </Button>
              <Button 
                variant={userRoleFilter === "DOCTOR" ? "default" : "outline"} 
                size="sm"
                onClick={() => setUserRoleFilter("DOCTOR")}
                className="whitespace-nowrap"
              >
                أطباء <span className="text-xs ml-1 opacity-75">({users.filter(u => u.role === "DOCTOR").length})</span>
              </Button>
              <Button 
                variant={userRoleFilter === "PHARMACIST" ? "default" : "outline"} 
                size="sm"
                onClick={() => setUserRoleFilter("PHARMACIST")}
                className="whitespace-nowrap"
              >
                صيادلة <span className="text-xs ml-1 opacity-75">({users.filter(u => u.role === "PHARMACIST").length})</span>
              </Button>
              <Button 
                variant={userRoleFilter === "LAB_MANAGER" ? "default" : "outline"} 
                size="sm"
                onClick={() => setUserRoleFilter("LAB_MANAGER")}
                className="whitespace-nowrap"
              >
                مختبرات <span className="text-xs ml-1 opacity-75">({users.filter(u => u.role === "LAB_MANAGER").length})</span>
              </Button>
              <Button 
                variant={userRoleFilter === "HOSPITAL_MANAGER" ? "default" : "outline"} 
                size="sm"
                onClick={() => setUserRoleFilter("HOSPITAL_MANAGER")}
                className="whitespace-nowrap"
              >
                مستشفيات <span className="text-xs ml-1 opacity-75">({users.filter(u => u.role === "HOSPITAL_MANAGER").length})</span>
              </Button>
              <Button 
                variant={userRoleFilter === "PATIENT" ? "default" : "outline"} 
                size="sm"
                onClick={() => setUserRoleFilter("PATIENT")}
                className="whitespace-nowrap"
              >
                مرضى <span className="text-xs ml-1 opacity-75">({users.filter(u => u.role === "PATIENT").length})</span>
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-slate-700">المستخدم</th>
                    <th className="p-4 font-semibold text-sm text-slate-700">الدور</th>
                    <th className="p-4 font-semibold text-sm text-slate-700">الحالة</th>
                    <th className="p-4 font-semibold text-sm text-slate-700">تاريخ الانضمام</th>
                    <th className="p-4 font-semibold text-sm text-slate-700">آخر ظهور</th>
                    <th className="p-4 font-semibold text-sm text-slate-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map(user => {
                    const roleBadge = getRoleBadgeStyle(user.role)
                    const statusDisplay = getStatusDisplay(userStatusToggle[user.id])
                    const isInactive = userStatusToggle[user.id] === 'INACTIVE'
                    
                    return (
                      <tr 
                        key={user.id} 
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          isInactive && "opacity-60"
                        )}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                              getAvatarColor(user.username)
                            )}>
                              {(user.username || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.username || 'بدون اسم'}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={cn(roleBadge.bg, roleBadge.text, "border-none")}>
                            {roleBadge.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full", statusDisplay.color)}></div>
                            <span className="text-sm font-medium text-slate-700">{statusDisplay.label}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {getTimeAgo(user.last_login || user.created_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 h-auto"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserDetailsModal(true)
                              }}
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1.5 h-auto"
                              onClick={() => handleOpenEditModal(user)}
                              disabled={isActionLoading[user.id]}
                              title="تعديل"
                            >
                              {isActionLoading[user.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "p-1.5 h-auto",
                                userStatusToggle[user.id] === 'ACTIVE' 
                                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              )}
                              onClick={() => handleToggleUserStatus(user.id)}
                              disabled={isActionLoading[user.id]}
                              title={userStatusToggle[user.id] === 'ACTIVE' ? 'تعطيل' : 'تفعيل'}
                            >
                              {isActionLoading[user.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : userStatusToggle[user.id] === 'ACTIVE' ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 h-auto"
                              onClick={() => handleDeleteUserClick(user.id)}
                              disabled={isActionLoading[user.id]}
                              title="حذف"
                            >
                              {isActionLoading[user.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">لا توجد مستخدمين</p>
              </div>
            )}
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">إدارة تذاكر الدعم الفني</h3>
              <Button variant="outline" size="sm" onClick={fetchTickets}>
                <RefreshCw className="w-4 h-4 ml-2" /> تحديث
              </Button>
            </div>
            
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">لا توجد تذاكر دعم حالياً</p>
                </div>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.ticket_id} className="border rounded-xl p-5 hover:shadow-sm transition-all bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{ticket.subject}</h4>
                          <Badge className={cn(
                            ticket.status === 'OPEN' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600',
                            "border-none"
                          )}>
                            {ticket.status === 'OPEN' ? 'مفتوحة' : 'تم الحل'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {ticket.user_email}
                          <span className="mx-1">•</span>
                          <Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleString('ar')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {ticket.status === 'OPEN' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                            onClick={() => handleUpdateTicketStatus(ticket.ticket_id, 'RESOLVED')}
                          >
                            <CheckCircle2 className="w-4 h-4 ml-1" /> تم الحل
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateTicketStatus(ticket.ticket_id, 'OPEN')}
                          >
                            <RefreshCw className="w-4 h-4 ml-1" /> إعادة فتح
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 leading-relaxed">{ticket.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-6">
            <div className="max-w-md space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4">إعدادات الأمان</h3>
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                  <p className="text-sm text-muted-foreground">تغيير كلمة مرور لوحة التحكم</p>
                  <div className="space-y-2">
                    <Input type="password" placeholder="كلمة المرور الجديدة" />
                    <Input type="password" placeholder="تأكيد كلمة المرور" />
                    <Button className="w-full">تحديث كلمة المرور</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Modal */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
            <DialogDescription>معلومات المستخدم الكاملة</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg",
                  getAvatarColor(selectedUser.username)
                )}>
                  {(selectedUser.username || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedUser.username || 'بدون اسم'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الدور</p>
                  <Badge className={cn(getRoleBadgeStyle(selectedUser.role).bg, getRoleBadgeStyle(selectedUser.role).text, "border-none")}>
                    {getRoleBadgeStyle(selectedUser.role).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", getStatusDisplay(userStatusToggle[selectedUser.id]).color)}></div>
                    <span className="font-medium">{getStatusDisplay(userStatusToggle[selectedUser.id]).label}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">تاريخ الانضمام</p>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">آخر ظهور</p>
                  <p className="font-medium">{getTimeAgo(selectedUser.last_login || selectedUser.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب الانضمام</DialogTitle>
            <DialogDescription>مراجعة بيانات مقدم الخدمة والوثائق المرفقة</DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الاسم الكامل</p>
                  <p className="font-medium">{selectedApp.first_name} {selectedApp.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الدور المطلوب</p>
                  <Badge className={cn(getRoleBadgeStyle(selectedApp.role_requested).bg, getRoleBadgeStyle(selectedApp.role_requested).text, "border-none")}>
                    {getRoleBadgeStyle(selectedApp.role_requested).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">رقم الهاتف</p>
                  <p className="font-medium">{selectedApp.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold mb-3">الوثائق المهنية</p>
                {selectedApp.document_url ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">شهادة مزاولة المهنة / الهوية</p>
                        <p className="text-xs text-muted-foreground">انقر للمعاينة أو التحميل</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(selectedApp.document_url, '_blank')}>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">لا توجد وثائق مرفقة</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>إغلاق</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedApp) handleApproveApplication(selectedApp.id)
                setShowDetailsModal(false)
              }}
            >
              قبول الطلب الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>قم بتحديث معلومات المستخدم</DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">اسم المستخدم</label>
                <Input
                  value={editFormData.username || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="اسم المستخدم"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="البريد الإلكتروني"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الدور</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={editFormData.role || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="PATIENT">مريض</option>
                  <option value="DOCTOR">طبيب</option>
                  <option value="PHARMACIST">صيدلي</option>
                  <option value="LAB_MANAGER">مدير مختبر</option>
                  <option value="HOSPITAL_MANAGER">مدير مستشفى</option>
                  <option value="SYSTEM_ADMIN">مدير نظام</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditUserModal(false)}
              disabled={isActionLoading[editingUser?.id || '']}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSaveUserChanges}
              disabled={isActionLoading[editingUser?.id || '']}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isActionLoading[editingUser?.id || ''] ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Confirmation Dialog */}
      <AlertDialog open={showStatusConfirmDialog} onOpenChange={setShowStatusConfirmDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تغيير الحالة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من تغيير حالة المستخدم؟ سيتم {userStatusToggle[statusConfirmUserId || ''] === 'ACTIVE' ? 'تعطيل' : 'تفعيل'} المستخدم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isActionLoading[statusConfirmUserId || '']}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmStatusToggle}
              disabled={isActionLoading[statusConfirmUserId || '']}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isActionLoading[statusConfirmUserId || ''] ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري...
                </>
              ) : (
                'تأكيد'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">تحذير: حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">اكتب "حذف" للتأكيد:</p>
            <Input
              placeholder="اكتب 'حذف' هنا"
              value={deleteConfirmInputValue}
              onChange={(e) => setDeleteConfirmInputValue(e.target.value)}
              className="border-red-300"
            />
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isActionLoading[deleteConfirmUserId || '']}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isActionLoading[deleteConfirmUserId || ''] || deleteConfirmInputValue !== "حذف"}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isActionLoading[deleteConfirmUserId || ''] ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف المستخدم نهائياً'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
